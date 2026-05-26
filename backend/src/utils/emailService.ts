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
