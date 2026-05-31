/**
 * Test Script for Blood Request Email Notifications
 * 
 * This script tests the email notification system for blood requests
 * Run with: npx ts-node test-blood-request-emails.ts
 */

import { sendBloodRequestApprovalEmail, sendBloodRequestRejectionEmail } from './src/utils/emailService';

async function testEmails() {
  console.log('🧪 Testing Blood Request Email Notifications\n');
  console.log('=' .repeat(60));

  // Test email address (change this to your test email)
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'John Doe';

  console.log(`\n📧 Test Email Address: ${testEmail}`);
  console.log('=' .repeat(60));

  // Test 1: Approval Email
  console.log('\n✅ Test 1: Sending Approval Email...');
  try {
    await sendBloodRequestApprovalEmail(
      testEmail,
      testName,
      'A+',
      2
    );
    console.log('✅ Approval email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
  }

  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Rejection Email (Insufficient Stock)
  console.log('\n❌ Test 2: Sending Rejection Email (Insufficient Stock)...');
  try {
    await sendBloodRequestRejectionEmail(
      testEmail,
      testName,
      'B+',
      3,
      'Insufficient stock. We currently have 1 unit(s) available, but you requested 3 unit(s).'
    );
    console.log('✅ Rejection email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
  }

  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Rejection Email (Custom Admin Reason)
  console.log('\n❌ Test 3: Sending Rejection Email (Admin Reason)...');
  try {
    await sendBloodRequestRejectionEmail(
      testEmail,
      testName,
      'O-',
      1,
      'Request rejected due to incomplete documentation. Please provide valid ID and hospital prescription.'
    );
    console.log('✅ Rejection email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Email testing completed!');
  console.log('📬 Check your inbox at:', testEmail);
  console.log('=' .repeat(60));
}

// Run tests
testEmails()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
