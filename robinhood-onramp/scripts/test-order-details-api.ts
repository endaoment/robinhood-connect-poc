#!/usr/bin/env ts-node
/**
 * Test script to call Robinhood Order Details API
 * 
 * This script attempts to fetch order details using the referenceId parameter
 * with a test orderId to see if we can get more information back.
 * 
 * Usage:
 *   ts-node scripts/test-order-details-api.ts [orderId]
 */

// Get credentials from environment
const API_KEY = process.env.ROBINHOOD_API_KEY;
const APPLICATION_ID = process.env.ROBINHOOD_APP_ID;

// Base URL from documentation (UPDATED: connectId is a path parameter, not query param)
const BASE_URL = 'https://api.robinhood.com/catpay/v1/external/order';

// Test connectIds (from our test data)
const TEST_CONNECT_IDS = [
  '596e6a8d-3ccd-47f2-b392-7de79df3e8d1', // Real connectId from actual transfer
  'e4045e33-4130-4eb2-a229-5c174ddc9d8f', // From test-dashboard-success.html
  '5b5386a7-764a-4f0f-b1a5-3c908e2b39d3', // From test-dashboard-success.html
];

async function fetchOrderDetails(connectId: string) {
  console.log(`\n🔍 Fetching order details for connectId: ${connectId}`);
  console.log('=' .repeat(70));

  if (!API_KEY || !APPLICATION_ID) {
    console.error('❌ Missing credentials!');
    console.error('   Please set environment variables:');
    console.error('   - ROBINHOOD_API_KEY');
    console.error('   - ROBINHOOD_APP_ID');
    process.exit(1);
  }

  // CORRECTED: connectId as PATH parameter, not query parameter
  const url = `${BASE_URL}/${connectId}`;

  console.log(`📡 Request URL: ${url}`);
  console.log(`🔑 Application ID: ${APPLICATION_ID}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'application-id': APPLICATION_ID,
      },
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('\n❌ Request failed');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('\nResponse Headers:');
      console.log(JSON.stringify(responseHeaders, null, 2));
      console.log('\nResponse Data:');
      console.log(errorData);
      
      // Additional error details
      if (response.status === 404) {
        console.log('\n💡 Note: 404 suggests this orderId may not exist in Robinhood\'s system');
      } else if (response.status === 401 || response.status === 403) {
        console.log('\n💡 Note: Authentication/Authorization issue - check API credentials');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('\n✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(responseHeaders, null, 2));
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('\n💥 Error:', error.message);
    } else {
      console.error('\n💥 Unexpected error:', error);
    }
    throw error;
  }
}

async function main() {
  // Check if connectId was provided as command-line argument
  const customConnectId = process.argv[2];

  if (customConnectId) {
    console.log(`\n🎯 Testing with custom connectId: ${customConnectId}`);
    await fetchOrderDetails(customConnectId);
  } else {
    console.log('\n🧪 Testing with predefined test connectIds...');
    console.log('⚠️  First one is from a real transfer - should work!\n');
    
    for (const connectId of TEST_CONNECT_IDS) {
      try {
        await fetchOrderDetails(connectId);
        // If successful, we found a valid order
        console.log('\n🎉 Found valid order data!');
        break;
      } catch (error) {
        console.log('\n⏭️  Moving to next test connectId...\n');
        continue;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Test completed!');
  console.log('\n📚 Documentation Reference (CORRECTED):');
  console.log('   Endpoint: GET /catpay/v1/external/order/{connectId}');
  console.log('   URL: https://api.robinhood.com/catpay/v1/external/order/<connectId>');
  console.log('   Path Parameter: connectId (NOT query parameter!)');
  console.log('   Headers Required:');
  console.log('     - x-api-key: <YOUR_API_KEY>');
  console.log('     - application-id: <YOUR_APPLICATION_ID>');
  console.log('\n💡 How to use with a real connectId:');
  console.log('   1. Complete a transfer through your Robinhood Connect app');
  console.log('   2. Copy the connectId from the callback URL');
  console.log('   3. Run: npx tsx scripts/test-order-details-api.ts <connectId>');
  console.log('\n   Example:');
  console.log('   export $(cat .env.local | grep -v "^#" | xargs)');
  console.log('   npx tsx scripts/test-order-details-api.ts 596e6a8d-3ccd-47f2-b392-7de79df3e8d1');
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
}

export { fetchOrderDetails };

