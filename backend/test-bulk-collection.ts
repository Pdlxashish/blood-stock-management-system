// Test script to verify bulk collection API works
import axios from 'axios';

async function testBulkCollection() {
  try {
    console.log('Testing bulk collection API...\n');
    
    const testData = {
      organizationName: 'Test Hospital',
      contactPersonName: 'Dr. Test',
      organizationCity: 'Kathmandu',
      organizationAddress: 'Test Address, Kathmandu',
      organizationEmail: 'test@hospital.com',
      organizationPhone: '9800000000',
      collectionDate: new Date().toISOString().split('T')[0],
      bloodItems: [
        { bloodGroup: 'A+', quantity: 2 },
        { bloodGroup: 'O+', quantity: 3 },
      ],
    };

    console.log('Sending request to: http://localhost:3001/api/donations/bulk-collect');
    console.log('Data:', JSON.stringify(testData, null, 2));
    console.log('');

    const response = await axios.post(
      'http://localhost:3001/api/donations/bulk-collect',
      testData
    );

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBulkCollection();
