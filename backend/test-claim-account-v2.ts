// Test script for updated claim account workflow with email/WhatsApp OTP
import { prisma } from './lib/prisma';

async function testUpdatedClaimAccountWorkflow() {
  console.log('🧪 Testing Updated Claim Account Workflow\n');
  console.log('=' .repeat(70));
  
  const testPhone = '9876543211'; // Different from previous test
  const testEmail = 'newdonor@example.com';
  
  try {
    // Step 1: Clean up any existing test user
    console.log('\n📋 Step 1: Cleaning up existing test data...');
    const existing = await prisma.user.findFirst({
      where: { phone: testPhone },
    });
    
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
      console.log('✅ Deleted existing test user');
    }
    
    // Step 2: Create unregistered donor (simulate blood collection)
    console.log('\n📋 Step 2: Creating unregistered donor (walk-in)...');
    
    const newUser = await prisma.user.create({
      data: {
        name: 'New Test Donor',
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
        bloodGroup: 'O_POSITIVE',
        donorType: 'PERSON',
        location: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Test Address',
        weight: 70,
        totalDonations: 1,
        isEligible: true,
        verificationStatus: 'PENDING', // Initially pending
      },
    });
    
    console.log(`✅ Created unregistered donor:`);
    console.log(`   - User ID: ${newUser.id}`);
    console.log(`   - Donor ID: ${newDonor.id}`);
    console.log(`   - Name: ${newUser.name}`);
    console.log(`   - Phone: ${newUser.phone}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Verification Status: ${newDonor.verificationStatus}`);
    
    // Step 3: Test claim account workflow
    console.log('\n📋 Step 3: Claim Account Workflow');
    console.log('=' .repeat(70));
    
    console.log('\n✅ NEW FEATURES IMPLEMENTED:');
    console.log('   1. ✅ OTP sent to EMAIL if email is provided');
    console.log('   2. ✅ OTP sent to WHATSAPP if phone is provided');
    console.log('   3. ✅ Auto-approve donor (skip admin verification)');
    console.log('   4. ✅ Only new registrations need admin approval');
    
    console.log('\n📧 TEST 1: Request OTP via EMAIL');
    console.log('=' .repeat(70));
    console.log(`POST http://localhost:3001/api/account-claim/request`);
    console.log(`Body: { "phoneOrEmail": "${testEmail}" }`);
    console.log('\nExpected: OTP sent to email address');
    console.log('Check your email inbox for the OTP!');
    
    console.log('\n📱 TEST 2: Request OTP via PHONE (WhatsApp)');
    console.log('=' .repeat(70));
    console.log(`POST http://localhost:3001/api/account-claim/request`);
    console.log(`Body: { "phoneOrEmail": "${testPhone}" }`);
    console.log('\nExpected: OTP sent via WhatsApp');
    console.log('Check WhatsApp for the OTP message!');
    
    console.log('\n🔐 TEST 3: Verify OTP and Claim Account');
    console.log('=' .repeat(70));
    console.log(`POST http://localhost:3001/api/account-claim/verify`);
    console.log(`Body: {`);
    console.log(`  "phoneOrEmail": "${testEmail}",`);
    console.log(`  "verificationCode": "123456",`);
    console.log(`  "password": "password123"`);
    console.log(`}`);
    console.log('\nExpected Results:');
    console.log('   ✅ User.isVerified = true');
    console.log('   ✅ User.emailVerified = true');
    console.log('   ✅ User.password = hashed password');
    console.log('   ✅ Donor.verificationStatus = VERIFIED (AUTO-APPROVED)');
    console.log('   ✅ Donor.verifiedBy = SYSTEM_AUTO_APPROVED');
    console.log('   ✅ JWT token generated');
    
    // Step 4: PowerShell test commands
    console.log('\n📋 Step 4: PowerShell Test Commands');
    console.log('=' .repeat(70));
    
    console.log('\n💡 Test with EMAIL:');
    console.log('```powershell');
    console.log(`$body = @{phoneOrEmail='${testEmail}'} | ConvertTo-Json`);
    console.log(`Invoke-WebRequest -Uri 'http://localhost:3001/api/account-claim/request' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content`);
    console.log('```');
    
    console.log('\n💡 Test with PHONE:');
    console.log('```powershell');
    console.log(`$body = @{phoneOrEmail='${testPhone}'} | ConvertTo-Json`);
    console.log(`Invoke-WebRequest -Uri 'http://localhost:3001/api/account-claim/request' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content`);
    console.log('```');
    
    console.log('\n💡 Verify and Claim (use OTP from email/WhatsApp):');
    console.log('```powershell');
    console.log(`$body = @{phoneOrEmail='${testEmail}';verificationCode='YOUR_OTP_HERE';password='password123'} | ConvertTo-Json`);
    console.log(`Invoke-WebRequest -Uri 'http://localhost:3001/api/account-claim/verify' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content`);
    console.log('```');
    
    // Step 5: Verification checklist
    console.log('\n📋 Step 5: Verification Checklist');
    console.log('=' .repeat(70));
    
    console.log('\n✅ After claiming account, verify:');
    console.log('   1. User can login with email/phone + password');
    console.log('   2. Donor appears in "All Donors" (not "Unregistered")');
    console.log('   3. Donor has green "VERIFIED" badge');
    console.log('   4. No admin approval needed');
    console.log('   5. Email received with OTP code');
    console.log('   6. WhatsApp message received (if phone used)');
    
    // Step 6: Compare with new registration
    console.log('\n📋 Step 6: Comparison with New Registration');
    console.log('=' .repeat(70));
    
    console.log('\n🔄 CLAIM ACCOUNT (Walk-in Donor):');
    console.log('   ✅ OTP sent to email/WhatsApp');
    console.log('   ✅ Verify OTP + set password');
    console.log('   ✅ AUTO-APPROVED (verificationStatus = VERIFIED)');
    console.log('   ✅ Can login immediately');
    console.log('   ✅ No admin approval needed');
    
    console.log('\n🆕 NEW REGISTRATION (Self-registered):');
    console.log('   ✅ OTP sent to email');
    console.log('   ✅ Verify OTP');
    console.log('   ⏳ verificationStatus = PENDING');
    console.log('   ⏳ Needs admin approval');
    console.log('   ⏳ Must wait for admin to verify');
    
    // Step 7: Current status
    console.log('\n📋 Step 7: Current Test Data Status');
    console.log('=' .repeat(70));
    
    const allUnverified = await prisma.user.findMany({
      where: {
        isVerified: false,
        password: 'WALK_IN_DONOR',
      },
      include: { donor: true },
    });
    
    console.log(`\n📊 Unregistered donors: ${allUnverified.length}`);
    allUnverified.forEach(u => {
      console.log(`   - ${u.name} (${u.phone}) - Donor Status: ${u.donor?.verificationStatus || 'N/A'}`);
    });
    
    console.log('\n✅ Test setup complete!');
    console.log('=' .repeat(70));
    console.log('\n💡 Next Steps:');
    console.log('   1. Test the API endpoints using PowerShell commands above');
    console.log('   2. Check your email for OTP');
    console.log('   3. Check WhatsApp for OTP (if testing with phone)');
    console.log('   4. Verify auto-approval works');
    console.log('   5. Test login after claiming account');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testUpdatedClaimAccountWorkflow();
