import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../lib/prisma';
import { generateOTP, sendOTPEmail } from '../utils/emailService';
import {
  validateRegistrationData,
  validateLoginData,
  validateMobileNumber,
  validateName,
} from '../utils/validators';

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

// ================= REGISTER =================
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate all registration fields
    const validation = validateRegistrationData({
      name,
      email,
      password,
      phone,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
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

    // Validate login fields
    const validation = validateLoginData({ email, password });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        donor: {
          select: {
            id: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check email verification only for DONOR role and only after confirming the password is correct.
    // OTP is used for initial registration verification only — NOT for login after a password reset.
    // If the password matched a real bcrypt hash, the user has already proved account ownership
    // (either via initial OTP verification or via the password-reset OTP flow). Auto-heal any
    // stale emailVerified=false state so they are never stuck in an OTP loop after a password reset.
    if (user.role === 'DONOR' && !user.emailVerified) {
      // bcrypt hashes always start with "$2" — walk-in placeholders ('WALK_IN_DONOR', 'ORGANIZATION')
      // do not, so we can distinguish them without a separate DB flag.
      const hasRealPassword = user.password.startsWith('$2');

      if (hasRealPassword) {
        // Password matched a real bcrypt hash → user proved ownership. Mark email as verified
        // and clear any leftover OTP so they are not blocked on future logins.
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true, otp: null, otpExpiry: null },
        });
      } else {
        // Walk-in / placeholder account — still needs proper email verification
        return res.status(403).json({
          success: false,
          message: 'Please verify your email first. Check your inbox for the OTP.',
          requiresEmailVerification: true,
          email: user.email,
        });
      }
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
          hasDonorProfile: !!user.donor,
          donorStatus: user.donor?.verificationStatus || null,
          donorId: user.donor?.id || null,
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
    const authenticatedUser = req.user as { id: string; email: string; name: string; phone: string; role: string } | undefined;
    
    if (!authenticatedUser) {
      return res.status(401).json({ success: false });
    }

    const userId = authenticatedUser.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        profilePicture: true,
        createdAt: true,
        donor: {
          select: {
            id: true,
            verificationStatus: true,
            bloodGroup: true,
            location: true,
            city: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        hasDonorProfile: !!user.donor,
        donorStatus: user.donor?.verificationStatus || null,
        donorId: user.donor?.id || null,
      },
    });
  } catch (err) {
    console.error('PROFILE ERROR:', err);
    res.status(500).json({ success: false });
  }
};

// ================= UPDATE PROFILE =================
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = req.user as { id: string; email: string; name: string; phone: string; role: string } | undefined;
    
    if (!authenticatedUser) {
      return res.status(401).json({ success: false });
    }

    const userId = authenticatedUser.id;

    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to update',
      });
    }

    // Validate name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.message,
        });
      }
    }

    // Validate phone if provided
    if (phone) {
      const phoneValidation = validateMobileNumber(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message,
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        profilePicture: true,
        donor: {
          select: {
            id: true,
            verificationStatus: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        profilePicture: updatedUser.profilePicture,
        hasDonorProfile: !!updatedUser.donor,
        donorStatus: updatedUser.donor?.verificationStatus || null,
      },
    });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ success: false });
  }
};

// ================= UPDATE PROFILE PICTURE =================
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = req.user as { id: string; email: string; name: string; phone: string; role: string } | undefined;
    
    if (!authenticatedUser) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const userId = authenticatedUser.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Generate URL for the uploaded file
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;

    // Delete old profile picture if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    if (currentUser?.profilePicture) {
      const oldFilePath = path.join(__dirname, '../../public', currentUser.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new profile picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        profilePicture: true,
        donor: {
          select: {
            id: true,
            verificationStatus: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        profilePicture: updatedUser.profilePicture,
        hasDonorProfile: !!updatedUser.donor,
        donorStatus: updatedUser.donor?.verificationStatus || null,
      },
    });
  } catch (err) {
    console.error('PROFILE PICTURE UPDATE ERROR:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile picture' 
    });
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


// ================= GOOGLE OAUTH HANDLERS =================

// Initiate Google OAuth
export const googleAuth = (_req: Request, _res: Response, next: NextFunction) => {
  // This will be handled by passport middleware
  next();
};

// Google OAuth Callback
export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    console.log('[GOOGLE AUTH CALLBACK] Received callback request');
    console.log('[GOOGLE AUTH CALLBACK] req.user:', req.user ? 'exists' : 'MISSING');
    
    if (!req.user) {
      console.error('[GOOGLE AUTH] ❌ No user found in request - Passport authentication failed');
      console.error('[GOOGLE AUTH] This usually means the Passport strategy had an error');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }

    const user = req.user as any;
    console.log('[GOOGLE AUTH] ✅ User authenticated:', user.email);
    console.log('[GOOGLE AUTH] User ID:', user.id);
    console.log('[GOOGLE AUTH] User role:', user.role);
    console.log('[GOOGLE AUTH] User isVerified:', user.isVerified);
    console.log('[GOOGLE AUTH] Auth mode:', user.authMode);
    console.log('[GOOGLE AUTH] Is existing user:', user.isExistingUser);

    // Generate JWT token
    const token = generateToken(user.id);
    console.log('[GOOGLE AUTH] ✅ JWT token generated');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Check if user needs email verification (should not be true for Google OAuth users now)
    if (!user.emailVerified) {
      console.log('[GOOGLE AUTH] User needs email verification - redirecting to OTP page');
      const otpRedirectUrl = `${frontendUrl}/verify-otp?email=${encodeURIComponent(user.email)}&message=google_signup`;
      console.log('[GOOGLE AUTH] 🔄 Redirecting to OTP verification');
      console.log('[GOOGLE AUTH] Final redirect URL:', otpRedirectUrl);
      return res.redirect(otpRedirectUrl);
    }

    // If existing user logging in, redirect to home if they have a donor profile
    if (user.isExistingUser && user.authMode === 'signin') {
      console.log('[GOOGLE AUTH] Existing user signin - checking donor profile');
      if (user.donor && user.donor.verificationStatus === 'APPROVED') {
        console.log('[GOOGLE AUTH] Redirecting to home');
        const homeUrl = `${frontendUrl}/home?token=${token}`;
        return res.redirect(homeUrl);
      }
    }

    // If coming from signup page (new user), redirect to donor-form
    if (user.authMode === 'signup' && !user.isExistingUser) {
      console.log('[GOOGLE AUTH] New signup - redirecting to donor-form');
      const donorFormUrl = `${frontendUrl}/donor-form?token=${token}`;
      console.log('[GOOGLE AUTH] Final redirect URL:', donorFormUrl);
      return res.redirect(donorFormUrl);
    }

    // For signin mode or existing users, redirect to login page which will handle routing
    const redirectUrl = `${frontendUrl}/login?token=${token}`;
    console.log('[GOOGLE AUTH] Final redirect URL:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[GOOGLE AUTH] ❌ Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
  }
};

// Google OAuth failure handler
export const googleAuthFailure = (_req: Request, res: Response) => {
  console.error('[GOOGLE AUTH] Authentication failed');
  res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
};
