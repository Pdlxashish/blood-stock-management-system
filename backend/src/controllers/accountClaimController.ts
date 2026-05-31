import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendClaimAccountOTPEmail } from "../utils/emailService";
import { sendWhatsAppOTP, isEmail, isValidPhoneNumber } from "../utils/whatsappService";

// Generate 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map<string, { code: string; expiresAt: Date; userId: string }>();

/**
 * Step 1: Request account claim
 * User provides phone or email
 */
export const requestAccountClaim = async (req: Request, res: Response) => {
  const { phoneOrEmail } = req.body;

  if (!phoneOrEmail) {
    throw new AppError("Phone or email is required", 400);
  }

  // Determine if input is email or phone
  const isEmailInput = isEmail(phoneOrEmail);
  const isPhoneInput = !isEmailInput && isValidPhoneNumber(phoneOrEmail);

  if (!isEmailInput && !isPhoneInput) {
    throw new AppError("Please provide a valid email or phone number", 400);
  }

  // Find user by phone or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail },
      ],
    },
    include: {
      donor: true,
    },
  });

  if (!user) {
    throw new AppError("No account found with this phone or email", 404);
  }

  // Check if already verified
  if (user.isVerified && user.password !== "WALK_IN_DONOR" && user.password !== "ORGANIZATION") {
    throw new AppError("This account is already activated. Please login instead.", 400);
  }

  // Generate verification code
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store code (in production, use Redis with TTL)
  verificationCodes.set(phoneOrEmail, {
    code,
    expiresAt,
    userId: user.id,
  });

  console.log(`📱 Verification code for ${phoneOrEmail}: ${code}`);

  // Send OTP via email or WhatsApp based on input type
  try {
    if (isEmailInput) {
      // Send via email
      console.log('📧 Sending OTP via email...');
      await sendClaimAccountOTPEmail(user.email, code, user.name);
      
      res.json({
        status: "success",
        message: "Verification code sent to your email",
        data: {
          sentTo: user.email,
          method: "email",
        },
      });
    } else {
      // Send via WhatsApp
      console.log('📱 Sending OTP via WhatsApp...');
      const whatsappResult = await sendWhatsAppOTP(user.phone, code, user.name);
      
      if (whatsappResult.success) {
        res.json({
          status: "success",
          message: "Verification code sent to your WhatsApp",
          data: {
            sentTo: user.phone,
            method: "whatsapp",
            whatsappLink: whatsappResult.whatsappLink,
          },
        });
      } else {
        throw new AppError("Failed to send WhatsApp message. Please try with email instead.", 500);
      }
    }
  } catch (error: any) {
    console.error('❌ Error sending verification code:', error);
    throw new AppError(`Failed to send verification code: ${error.message}`, 500);
  }
};

/**
 * Step 2: Verify code and set password
 * User provides code + new password
 * Auto-approves donor (skips admin verification)
 */
export const verifyAndClaimAccount = async (req: Request, res: Response) => {
  const { phoneOrEmail, verificationCode, password, name } = req.body;

  if (!phoneOrEmail || !verificationCode || !password) {
    throw new AppError("Phone/email, verification code, and password are required", 400);
  }

  // Validate password strength
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Check verification code
  const storedData = verificationCodes.get(phoneOrEmail);
  if (!storedData) {
    throw new AppError("Verification code not found or expired", 400);
  }

  if (storedData.code !== verificationCode) {
    throw new AppError("Invalid verification code", 400);
  }

  if (new Date() > storedData.expiresAt) {
    verificationCodes.delete(phoneOrEmail);
    throw new AppError("Verification code expired", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: storedData.userId },
    include: { donor: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user account AND auto-approve donor
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      isVerified: true,
      emailVerified: true, // Mark email as verified since they verified via OTP
      ...(name && { name }), // Update name if provided
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
      donor: {
        select: {
          id: true,
          bloodGroup: true,
          totalDonations: true,
          lastDonationDate: true,
          verificationStatus: true,
        },
      },
    },
  });

  // Auto-approve donor (skip admin verification for claimed accounts)
  if (user.donor && user.donor.verificationStatus !== 'VERIFIED') {
    console.log(`✅ Auto-approving donor ${user.donor.id} (claimed account)`);
    
    await prisma.donor.update({
      where: { id: user.donor.id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: 'SYSTEM_AUTO_APPROVED', // Mark as system auto-approved
        rejectionReason: null, // Clear any previous rejection reason
      },
    });

    console.log(`✅ Donor ${user.name} auto-approved via claim account process`);
  }

  // Remove verification code
  verificationCodes.delete(phoneOrEmail);

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );

  res.json({
    status: "success",
    message: "Account claimed successfully! You can now login. Your donor profile has been automatically verified.",
    data: {
      user: {
        ...updatedUser,
        donor: updatedUser.donor ? {
          ...updatedUser.donor,
          verificationStatus: 'VERIFIED', // Return updated status
        } : null,
      },
      token,
    },
  });
};

/**
 * Check if phone/email already has an account
 * Used during registration to prevent duplicates
 */
export const checkExistingAccount = async (req: Request, res: Response) => {
  const { phone, email } = req.query;

  if (!phone && !email) {
    throw new AppError("Phone or email is required", 400);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(phone ? [{ phone: phone as string }] : []),
        ...(email ? [{ email: email as string }] : []),
      ],
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      isVerified: true,
      donor: {
        select: {
          bloodGroup: true,
          totalDonations: true,
        },
      },
    },
  });

  if (existingUser) {
    res.json({
      status: "success",
      data: {
        exists: true,
        isVerified: existingUser.isVerified,
        user: existingUser,
        message: existingUser.isVerified
          ? "This phone/email is already registered. Please login."
          : "You already donated with us! Claim your account to access your donation history.",
      },
    });
  } else {
    res.json({
      status: "success",
      data: {
        exists: false,
        message: "No existing account found. You can register.",
      },
    });
  }
};

/**
 * Resend verification code
 */
export const resendVerificationCode = async (req: Request, res: Response) => {
  const { phoneOrEmail } = req.body;

  if (!phoneOrEmail) {
    throw new AppError("Phone or email is required", 400);
  }

  // Determine if input is email or phone
  const isEmailInput = isEmail(phoneOrEmail);
  const isPhoneInput = !isEmailInput && isValidPhoneNumber(phoneOrEmail);

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail },
      ],
    },
  });

  if (!user) {
    throw new AppError("No account found", 404);
  }

  if (user.isVerified && user.password !== "WALK_IN_DONOR" && user.password !== "ORGANIZATION") {
    throw new AppError("Account already activated", 400);
  }

  // Generate new code
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  verificationCodes.set(phoneOrEmail, {
    code,
    expiresAt,
    userId: user.id,
  });

  console.log(`📱 New verification code for ${phoneOrEmail}: ${code}`);

  // Send OTP via email or WhatsApp
  try {
    if (isEmailInput) {
      // Send via email
      console.log('📧 Resending OTP via email...');
      await sendClaimAccountOTPEmail(user.email, code, user.name);
      
      res.json({
        status: "success",
        message: "Verification code resent to your email",
        data: {
          method: "email",
        },
      });
    } else {
      // Send via WhatsApp
      console.log('📱 Resending OTP via WhatsApp...');
      const whatsappResult = await sendWhatsAppOTP(user.phone, code, user.name);
      
      res.json({
        status: "success",
        message: "Verification code resent to your WhatsApp",
        data: {
          method: "whatsapp",
          whatsappLink: whatsappResult.whatsappLink,
        },
      });
    }
  } catch (error: any) {
    console.error('❌ Error resending verification code:', error);
    throw new AppError(`Failed to resend verification code: ${error.message}`, 500);
  }
};
