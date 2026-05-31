import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Email Configuration...\n');

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('   Value:', process.env.EMAIL_USER);
console.log('');

// Test 2: Create transporter with improved configuration
console.log('2️⃣ Creating email transporter...');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: true, // Enable debug output
  logger: true, // Enable logger
});

// Test 3: Verify connection
console.log('3️⃣ Verifying SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('   1. Make sure you\'re using an App Password, not your regular Gmail password');
    console.error('   2. Enable 2-Step Verification in your Google Account');
    console.error('   3. Generate an App Password at: https://myaccount.google.com/apppasswords');
    console.error('   4. Check if "Less secure app access" is enabled (if not using App Password)');
    console.error('   5. Make sure your firewall/antivirus isn\'t blocking port 587');
    process.exit(1);
  } else {
    console.log('✅ SMTP connection verified successfully!');
    console.log('   Server is ready to send emails\n');
    
    // Test 4: Send a test email
    sendTestEmail();
  }
});

async function sendTestEmail() {
  console.log('4️⃣ Sending test email...');
  
  const mailOptions = {
    from: `"Blood Donation System Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'Test Email - Email Service Working',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Service Test</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>🎉 Success!</h2>
              <p>Your email service is configured correctly and working!</p>
            </div>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>SMTP Host: smtp.gmail.com</li>
              <li>Port: 587 (TLS)</li>
              <li>From: ${process.env.EMAIL_USER}</li>
              <li>Time: ${new Date().toLocaleString()}</li>
            </ul>
            <p>You can now send OTP emails, password reset emails, and other notifications.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Check your inbox:', process.env.EMAIL_USER);
    console.log('\n🎉 All tests passed! Email service is working correctly.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to send test email:', error.message);
    console.error('\n📋 Error details:', error);
    process.exit(1);
  }
}
