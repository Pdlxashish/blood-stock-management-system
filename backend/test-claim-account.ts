// Test script for claim account workflow
import { prisma } from './lib/prisma';

async function testClaimAccountWorkflow() {
  console.log('🧪 Testing Claim Account Workflow\n');
  console.log('=' .repeat(60));
  
  const testPhone = '9876543210';
  const testEmail = 'testdonor@example.com';
  
  try {
    // Step 1: Check if test user already exists
    console.log('\n📋 Step 1: Checking for existing test user...');
    let existingUser = await prisma.user.findFirst({
      where: { phone: testPhone },
      include: { donor: true },
    });
    
    if (existingUser) {
      console.log(`✅ Found existing user: ${existingUser.name}`);
      console.log(`   - Phone: ${existingUser.phone}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - isVerified: ${existingUser.isVerified}`);
      console.log(`   - Password: ${existingUser.password.substring(0, 20)}...`);
      
      if (existingUser.isVerified && existingUser.password !== 'WALK_IN_DONOR') {
        console.log('\n⚠️  User is already verified. Deleting for fresh test...');
        await prisma.user.delete({ where: { id: existingUser.id } });
        existingUser = null;
      }
    } else {
      console.log('❌ No existing user found');
    }
    
    // Step 2: Create unregistered donor (simulate blood collection)
    if (!existingUser) {
      console.log('\n📋 Step 2: Creating unregistered donor (walk-in)...');
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Test Donor',
          phone: testPhone,
          email: testEmail,
          password: 'WALK_IN_DONOR',
          role: 'DONOR',
          isVerified: false,
          emailVerified: false,
        },
      });
      
      const newDonor = await prisma.donor.create({
        data: {
          userId: newUser.id,
          bloodGroup: 'A_POSITIVE',
          donorType: 'PERSON',
          location: 'Kathmandu',
          city: 'Kathmandu',
          address: 'Test Address',
          weight: 65,
          totalDonations: 0,
          isEligible: true,
        },
      });
      
      console.log(`✅ Created unregistered donor:`);
      console.log(`   - User ID: ${newUser.id}`);
      console.log(`   - Donor ID: ${newDonor.id}`);
      console.log(`   - Name: ${newUser.name}`);
      console.log(`   - Phone: ${newUser.phone}`);
      console.log(`   - Email: ${newUser.email}`);
      
      existingUser = newUser;
    }
    
    // Step 3: Instructions for claiming account
    console.log('\n📋 Step 3: Claim Account Instructions');
    console.log('=' .repeat(60));
    console.log('\n1. Open your browser and go to:');
    console.log('   http://localhost:3000/claim-account');
    console.log('\n2. Enter phone number:');
    console.log(`   ${testPhone}`);
    console.log('\n3. Click "Send Verification Code"');
    console.log('\n4. Check the browser console or alert for the 6-digit code');
    console.log('\n5. Enter the code and set a password (min 6 characters)');
    console.log('\n6. Click "Claim Account"');
    console.log('\n7. You should be logged in and redirected to /home');
    
    // Step 4: Verify unregistered status
    console.log('\n📋 Step 4: Current Status');
    console.log('=' .repeat(60));
    
    const unregisteredDonors = await prisma.user.findMany({
      where: {
        isVerified: false,
        password: 'WALK_IN_DONOR',
      },
      include: { donor: true },
    });
    
    console.log(`\n📊 Total unregistered donors: ${unregisteredDonors.length}`);
    unregisteredDonors.forEach(u => {
      console.log(`   - ${u.name} (${u.phone})`);
    });
    
    // Step 5: API endpoint info
    console.log('\n📋 Step 5: API Endpoints for Testing');
    console.log('=' .repeat(60));
    console.log('\nYou can also test using curl/Postman:');
    console.log('\n1. Request verification code:');
    console.log('   POST http://localhost:3001/api/account-claim/request');
    console.log(`   Body: { "phoneOrEmail": "${testPhone}" }`);
    console.log('\n2. Verify and claim:');
    console.log('   POST http://localhost:3001/api/account-claim/verify');
    console.log(`   Body: {`);
    console.log(`     "phoneOrEmail": "${testPhone}",`);
    console.log(`     "verificationCode": "123456",`);
    console.log(`     "password": "password123"`);
    console.log(`   }`);
    
    console.log('\n✅ Test setup complete!');
    console.log('=' .repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testClaimAccountWorkflow();
