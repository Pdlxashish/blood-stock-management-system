import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../utils/emailService';

// Test email configuration
export const testEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  try {
    const testOTP = '123456';
    await sendOTPEmail(email, testOTP, 'Test User');
    
    res.json({
      status: 'success',
      message: 'Test email sent successfully! Check your inbox.',
      data: {
        email,
        note: 'This is a test email. The OTP 123456 is for testing only.',
      },
    });
  } catch (error: any) {
    console.error('❌ Test email failed:', error.message);
    throw new AppError(`Failed to send test email: ${error.message}`, 500);
  }
};

// Send OTP to email
export const sendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already verified
  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log('🔐 [SEND OTP] Generated OTP for', user.email, ':', otp);
  console.log('⏰ [SEND OTP] OTP expires at:', otpExpiry.toLocaleString());

  // Save OTP to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    },
  });

  // Send OTP email
  try {
    console.log('📧 [SEND OTP] Attempting to send OTP email to:', user.email);
    console.log('📧 [SEND OTP] OTP Code:', otp);
    await sendOTPEmail(user.email, otp, user.name);
    
    console.log(`✅ OTP sent successfully to ${user.email}`);
    console.log(`✅ [SEND OTP] OTP Code: ${otp}`);
    
    res.json({
      status: 'success',
      message: 'OTP sent to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes',
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to send OTP email:', error.message);
    console.error('❌ [SEND OTP] OTP was:', otp, '(email failed but user can still use this code)');
    throw new AppError('Failed to send OTP email. Please check your email configuration.', 500);
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Email and OTP are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already verified
  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }

  // Check if OTP exists
  if (!user.otp || !user.otpExpiry) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  // Check if OTP expired
  if (new Date() > user.otpExpiry) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Verify OTP
  if (user.otp !== otp) {
    console.log('❌ [VERIFY OTP] Invalid OTP provided');
    console.log('   Expected:', user.otp);
    console.log('   Received:', otp);
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  console.log('✅ [VERIFY OTP] OTP verified successfully for:', user.email);

  // Mark email as verified and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      otp: null,
      otpExpiry: null,
    },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error, verification was successful
  }

  res.json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
    data: {
      email: user.email,
      emailVerified: true,
    },
  });
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already verified
  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log('🔐 [RESEND OTP] Generated new OTP for', user.email, ':', otp);
  console.log('⏰ [RESEND OTP] OTP expires at:', otpExpiry.toLocaleString());

  // Update OTP in database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    },
  });

  // Send OTP email
  try {
    console.log('📧 [RESEND OTP] Attempting to send OTP email to:', user.email);
    console.log('📧 [RESEND OTP] OTP Code:', otp);
    await sendOTPEmail(user.email, otp, user.name);
    
    console.log(`✅ OTP resent successfully to ${user.email}`);
    console.log(`✅ [RESEND OTP] OTP Code: ${otp}`);
    
    res.json({
      status: 'success',
      message: 'New OTP sent to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes',
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to resend OTP email:', error.message);
    console.error('❌ [RESEND OTP] OTP was:', otp, '(email failed but user can still use this code)');
    throw new AppError('Failed to send OTP email. Please try again.', 500);
  }
};
