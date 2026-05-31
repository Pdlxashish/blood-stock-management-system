/**
 * Test Script for Call and Notify Donor Features
 * 
 * This script tests the call and notify endpoints for donors
 * Run with: npx ts-node test-call-notify.ts
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testCallAndNotify() {
  console.log('🧪 Testing Call and Notify Donor Features\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Get a donor to test with
    console.log('\n📋 Step 1: Fetching donors...');
    const donorsResponse = await axios.get(`${BASE_URL}/api/donors?limit=1`);
    
    if (!donorsResponse.data.data || donorsResponse.data.data.length === 0) {
      console.log('❌ No donors found. Please create a donor first.');
      return;
    }

    const testDonor = donorsResponse.data.data[0];
    console.log(`✅ Found donor: ${testDonor.user.name} (ID: ${testDonor.id})`);
    console.log(`   Phone: ${testDonor.user.phone}`);
    console.log(`   Blood Group: ${testDonor.bloodGroup}`);

    // Step 2: Test Call Endpoint
    console.log('\n📞 Step 2: Testing Call Endpoint...');
    try {
      const callResponse = await axios.post(
        `${BASE_URL}/api/donors/${testDonor.id}/call`,
        { calledBy: 'test-admin' }
      );
      
      console.log('✅ Call endpoint successful!');
      console.log(`   Message: ${callResponse.data.message}`);
      console.log(`   Phone Number: ${callResponse.data.data.phoneNumber}`);
      console.log(`   Call Initiated At: ${callResponse.data.data.callInitiatedAt}`);
    } catch (error: any) {
      console.log('❌ Call endpoint failed:');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Step 3: Test Notify Endpoint
    console.log('\n🔔 Step 3: Testing Notify Endpoint...');
    try {
      const notifyResponse = await axios.post(
        `${BASE_URL}/api/donors/${testDonor.id}/notify`,
        {
          title: 'Test Blood Donation Request',
          message: 'This is a test notification. Your blood type is urgently needed!',
          notifiedBy: 'test-admin'
        }
      );
      
      console.log('✅ Notify endpoint successful!');
      console.log(`   Message: ${notifyResponse.data.message}`);
      console.log(`   Notification ID: ${notifyResponse.data.data.notification.id}`);
      console.log(`   Notified At: ${notifyResponse.data.data.notifiedAt}`);
    } catch (error: any) {
      console.log('❌ Notify endpoint failed:');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Step 4: Verify notification was created
    console.log('\n📬 Step 4: Verifying notification in database...');
    try {
      const notificationsResponse = await axios.get(
        `${BASE_URL}/api/notifications/user/${testDonor.userId}?limit=1`
      );
      
      if (notificationsResponse.data.data.notifications.length > 0) {
        const latestNotification = notificationsResponse.data.data.notifications[0];
        console.log('✅ Notification found in database!');
        console.log(`   Title: ${latestNotification.title}`);
        console.log(`   Message: ${latestNotification.message}`);
        console.log(`   Type: ${latestNotification.type}`);
        console.log(`   Is Read: ${latestNotification.isRead}`);
      } else {
        console.log('⚠️  No notifications found for this user');
      }
    } catch (error: any) {
      console.log('❌ Failed to fetch notifications:');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed with error:');
    console.error(error.response?.data || error.message);
  }
}

// Run the tests
testCallAndNotify();
