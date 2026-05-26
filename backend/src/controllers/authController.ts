import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { generateOTP, sendOTPEmail } from '../utils/emailService';

const TOKEN_EXPIRY = '30d';

// Generate JWT
const generateToken = (id: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET missing');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
};

// Validators
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) =>
  password.length >= 6;

// ================= REGISTER =================
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists by email OR phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone.trim() },
        ],
      },
      include: {
        donor: true,
      },
    });

    if (existingUser) {
      // If user exists but is a walk-in donor (not verified), guide them to claim account
      if (!existingUser.isVerified && 
          (existingUser.password === 'WALK_IN_DONOR' || existingUser.password === 'ORGANIZATION')) {
        return res.status(409).json({
          success: false,
          message: 'You already donated with us! Please use "Claim Account" to activate your account and access your donation history.',
          shouldClaimAccount: true,
          phone: existingUser.phone,
          email: existingUser.email,
        });
      }
      
      // If user is already verified, they should login
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or phone. Please login.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔐 [REGISTER] Generated OTP for', email, ':', otp);
    console.log('⏰ [REGISTER] OTP expires at:', otpExpiry.toLocaleString());

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        role: role || 'DONOR',
        isVerified: false, // User needs to complete donor profile
        emailVerified: false, // Email not verified yet
        otp,
        otpExpiry,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send OTP email
    try {
      console.log('📧 [REGISTER] Attempting to send OTP email to:', user.email);
      console.log('📧 [REGISTER] OTP Code:', otp);
      await sendOTPEmail(user.email, otp, user.name);
      console.log('✅ [REGISTER] OTP email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('❌ [REGISTER] Failed to send OTP email:', emailError);
      console.error('❌ [REGISTER] OTP was:', otp, '(email failed but user can still use this code)');
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      data: { 
        user,
        requiresEmailVerification: true,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email & password required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is verified (only for DONOR role)
    if (user.role === 'DONOR' && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ================= GET PROFILE =================
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('PROFILE ERROR:', err);
    res.status(500).json({ success: false });
  }
};

// ================= UPDATE PROFILE =================
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false });
    }

    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to update',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated',
      data: updatedUser,
    });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ success: false });
  }
};

// ================= ADMIN LOGIN =================
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    console.log('[ADMIN LOGIN] Attempt with ID:', id);

    // Hardcoded admin credentials
    const ADMIN_ID = 'mukunday@gmail.com';
    const ADMIN_PASSWORD = 'muku';

    if (!id || !password) {
      console.log('[ADMIN LOGIN] ❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'ID and password are required',
      });
    }

    // Check credentials
    if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
      console.log('[ADMIN LOGIN] ❌ Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    console.log('[ADMIN LOGIN] ✅ Credentials valid, checking database...');

    // Find or create admin user in database
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_ID },
    });

    // If admin doesn't exist, create one
    if (!adminUser) {
      console.log('[ADMIN LOGIN] Admin user not found, creating...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      adminUser = await prisma.user.create({
        data: {
          email: ADMIN_ID,
          name: 'Administrator',
          phone: '0000000000',
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
        },
      });
      console.log('[ADMIN LOGIN] ✅ Admin user created:', adminUser.id);
    } else {
      console.log('[ADMIN LOGIN] ✅ Admin user found:', adminUser.id);
    }

    // Generate token with actual user ID from database
    const adminToken = generateToken(adminUser.id);
    console.log('[ADMIN LOGIN] ✅ Token generated for user ID:', adminUser.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name,
          phone: adminUser.phone,
          isVerified: adminUser.isVerified,
        },
        token: adminToken,
      },
    });
  } catch (err) {
    console.error('[ADMIN LOGIN] ❌ ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
