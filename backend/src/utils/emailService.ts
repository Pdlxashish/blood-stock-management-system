import nodemailer from 'nodemailer';

// Verify email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ EMAIL_USER or EMAIL_PASSWORD not configured in .env file');
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('   Please check your EMAIL_USER and EMAIL_PASSWORD in .env file');
  } else {
    console.log('✅ Email service ready to send emails');
    console.log(`   Using: ${process.env.EMAIL_USER}`);
  }
});

// Generate 6-digit OTP
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🎲 [EMAIL SERVICE] Generated OTP:', otp);
  return otp;
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<void> => {
  console.log('📧 [EMAIL SERVICE] Preparing to send OTP email');
  console.log('   To:', email);
  console.log('   Name:', name);
  console.log('   OTP:', otp);
  console.log('   From:', process.env.EMAIL_USER);
  
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background: white;
            border: 2px dashed #dc2626;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩸 Blood Donation System</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering as a blood donor. To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6b7280;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            
            <p>Enter this code on the verification page to activate your account.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>This code expires in 10 minutes</li>
              </ul>
            </div>
            
            <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br><strong>Blood Donation System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('📤 [EMAIL SERVICE] Sending email via nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    console.log('📬 [EMAIL SERVICE] Message ID:', info.messageId);
    console.log('📬 [EMAIL SERVICE] Response:', info.response);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.error('❌ [EMAIL SERVICE] Email config:', {
      service: 'gmail',
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
    });
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Blood Donation System! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome Aboard!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Congratulations! Your email has been successfully verified.</p>
            <p>You are now part of our life-saving community. Thank you for choosing to be a blood donor!</p>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Log in to your account</li>
              <li>Complete your donor profile with medical information</li>
              <li>Wait for admin verification</li>
              <li>Start saving lives!</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br><strong>Blood Donation System Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email
  }
};

// Send donor rejection email
export const sendDonorRejectionEmail = async (
  email: string,
  name: string,
  rejectionReason: string
): Promise<void> => {
  console.log('📧 [EMAIL SERVICE] Sending donor rejection email');
  console.log('   To:', email);
  console.log('   Name:', name);
  
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Donor Profile Verification Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .reason-box {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .info-box {
            background: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩸 Blood Donation System</h1>
            <p>Donor Profile Verification Update</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for your interest in becoming a blood donor with our system.</p>
            <p>After reviewing your donor profile, we regret to inform you that your profile verification could not be completed at this time.</p>
            
            <div class="reason-box">
              <strong>📋 Reason for Rejection:</strong>
              <p style="margin: 10px 0 0 0;">${rejectionReason}</p>
            </div>
            
            <div class="info-box">
              <strong>🔄 What You Can Do:</strong>
              <ul style="margin: 10px 0;">
                <li>Review the rejection reason carefully</li>
                <li>Update your profile information if needed</li>
                <li>Request re-verification from your profile page</li>
                <li>Contact our support team if you have questions</li>
              </ul>
            </div>
            
            <p>If you believe this decision was made in error or if you have addressed the issues mentioned above, you can request re-verification by logging into your account and visiting your profile page.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard/profile" class="button">Go to Profile</a>
            </div>
            
            <p>We appreciate your understanding and your willingness to help save lives through blood donation.</p>
            
            <p>Best regards,<br><strong>Blood Donation System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('📤 [EMAIL SERVICE] Sending rejection email via nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${email}`);
    console.log('📬 [EMAIL SERVICE] Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    // Don't throw error - rejection should still succeed even if email fails
  }
};

// Send donor approval email
export const sendDonorApprovalEmail = async (
  email: string,
  name: string
): Promise<void> => {
  console.log('📧 [EMAIL SERVICE] Sending donor approval email');
  console.log('   To:', email);
  console.log('   Name:', name);
  
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verification Successful - Your Donor Profile is Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 18px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .success-box {
            background: #dcfce7;
            border-left: 4px solid #16a34a;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
          }
          .success-box h2 {
            color: #15803d;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .success-box p {
            margin: 0;
            color: #166534;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 16px;
            font-weight: bold;
          }
          .button:hover {
            background: #15803d;
          }
          .info-list {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-list h3 {
            margin: 0 0 15px 0;
            color: #16a34a;
          }
          .info-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .info-list li {
            margin: 8px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .checkmark {
            font-size: 48px;
            color: #16a34a;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="checkmark">✓</div>
            <h1>Verification Successful!</h1>
            <p>Your Donor Profile is Approved</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! We're excited to inform you that your donor profile has been successfully verified by our team.</p>
            
            <div class="success-box">
              <h2>🎉 You're Now a Verified Donor!</h2>
              <p>You can now log in and start participating in blood donation activities.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
            </div>
            
            <div class="info-list">
              <h3>What You Can Do Now:</h3>
              <ul>
                <li><strong>Access Your Dashboard:</strong> View your complete donor profile</li>
                <li><strong>Browse Events:</strong> Find upcoming blood donation camps</li>
                <li><strong>Schedule Donations:</strong> Book your donation appointments</li>
                <li><strong>Track History:</strong> Monitor your donation records</li>
                <li><strong>Earn Certificates:</strong> Get recognition for your contributions</li>
                <li><strong>Save Lives:</strong> Make a real difference in your community</li>
              </ul>
            </div>
            
            <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>📌 Important:</strong> Please log in to your account to complete your profile and start your journey as a blood donor. Your contribution can save up to 3 lives with each donation!
            </p>
            
            <p>Thank you for joining our life-saving community. Together, we can make a difference!</p>
            
            <p>Best regards,<br><strong>Blood Donation System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('📤 [EMAIL SERVICE] Sending approval email via nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
    console.log('📬 [EMAIL SERVICE] Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    // Don't throw error - approval should still succeed even if email fails
  }
};

// Send re-verification request notification to admin
export const sendReverificationRequestEmail = async (
  adminEmail: string,
  donorName: string,
  donorEmail: string,
  message: string | null
): Promise<void> => {
  console.log('📧 [EMAIL SERVICE] Sending re-verification request notification to admin');
  
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: '🔄 New Re-verification Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Re-verification Request</h1>
          </div>
          <div class="content">
            <h2>New Re-verification Request</h2>
            <p>A rejected donor has requested re-verification of their profile.</p>
            
            <div class="info-box">
              <strong>Donor Information:</strong>
              <ul style="margin: 10px 0;">
                <li><strong>Name:</strong> ${donorName}</li>
                <li><strong>Email:</strong> ${donorEmail}</li>
              </ul>
              ${message ? `<p><strong>Donor's Message:</strong></p><p style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">${message}</p>` : ''}
            </div>
            
            <p>Please review the donor's profile and take appropriate action.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/admin-public/pending-donors" class="button">Review Request</a>
            </div>
            
            <p>Best regards,<br><strong>Blood Donation System</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated notification.</p>
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Re-verification request notification sent to admin`);
  } catch (error) {
    console.error('❌ Error sending re-verification notification:', error);
    // Don't throw error
  }
};

// Send donor unverification email
export const sendDonorUnverificationEmail = async (
  email: string,
  name: string,
  unverificationReason: string
): Promise<void> => {
  console.log('📧 [EMAIL SERVICE] Sending donor unverification email');
  console.log('   To:', email);
  console.log('   Name:', name);
  
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verification Status Update - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .reason-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .info-box {
            background: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Verification Status Update</h1>
            <p>Your Donor Profile Requires Attention</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We're writing to inform you that your donor profile verification status has been changed and requires your attention.</p>
            
            <div class="reason-box">
              <strong>📋 Reason for Status Change:</strong>
              <p style="margin: 10px 0 0 0;">${unverificationReason}</p>
            </div>
            
            <p>Your account access has been temporarily restricted until this matter is resolved.</p>
            
            <div class="info-box">
              <strong>🔄 What You Can Do:</strong>
              <ul style="margin: 10px 0;">
                <li>Review the reason for the status change carefully</li>
                <li>Update your profile information if needed</li>
                <li>Request re-verification from your profile page</li>
                <li>Contact our support team if you have questions</li>
              </ul>
            </div>
            
            <p>If you believe this decision was made in error or if you have addressed the issues mentioned above, you can request re-verification by logging into your account and visiting your profile page.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/profile" class="button">Go to Profile</a>
            </div>
            
            <p>We appreciate your understanding and cooperation in maintaining the integrity of our blood donation system.</p>
            
            <p>Best regards,<br><strong>Blood Donation System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you have questions, please contact our support team.</p>
            <p>&copy; 2024 Blood Donation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('📤 [EMAIL SERVICE] Sending unverification email via nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Unverification email sent to ${email}`);
    console.log('📬 [EMAIL SERVICE] Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending unverification email:', error);
    // Don't throw error - unverification should still succeed even if email fails
  }
};

// Generic send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const mailOptions = {
    from: `"Blood Donation System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
