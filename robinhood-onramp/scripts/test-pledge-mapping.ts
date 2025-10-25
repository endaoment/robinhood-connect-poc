#!/usr/bin/env ts-node
// @ts-nocheck
/**
 * Test script for backend pledge mapping
 *
 * This script demonstrates how to use the backend integration utilities
 * to map Robinhood Connect callback data to CryptoPledgeInput format.
 *
 * Usage:
 *   ts-node scripts/test-pledge-mapping.ts
 */

import {
  createPledgeFromCallback,
  validatePledgeInput,
  getBackendToken,
  convertToSmallestUnit,
  convertFromSmallestUnit,
  type CryptoPledgeInput,
  type PledgeMappingResult,
} from "../libs/shared/src/lib/backend-integration";

console.log("🧪 Testing Backend Pledge Integration\n");

// =============================================================================
// Test 1: Token Resolution
// =============================================================================
console.log("📝 Test 1: Token Resolution");
console.log("=" .repeat(60));

const testTokens = ["ETH", "BTC", "SOL", "USDC"];

testTokens.forEach((symbol) => {
  const token = getBackendToken(symbol);
  if (token) {
    console.log(`✅ ${symbol}: tokenId=${token.tokenId}, decimals=${token.decimals}`);
  } else {
    console.log(`❌ ${symbol}: Not found in token map`);
  }
});

console.log();

// =============================================================================
// Test 2: Amount Conversion
// =============================================================================
console.log("📝 Test 2: Amount Conversion");
console.log("=" .repeat(60));

const amountTests = [
  { amount: "0.5", decimals: 18, symbol: "ETH" },
  { amount: "1.0", decimals: 8, symbol: "BTC" },
  { amount: "100", decimals: 6, symbol: "USDC" },
  { amount: "1.23456789", decimals: 9, symbol: "SOL" },
];

amountTests.forEach(({ amount, decimals, symbol }) => {
  try {
    const smallest = convertToSmallestUnit(amount, decimals);
    const backToHuman = convertFromSmallestUnit(smallest, decimals);

    console.log(`${symbol}: ${amount} → ${smallest}`);
    console.log(`  Reverse: ${smallest} → ${backToHuman}`);
    console.log(`  Match: ${amount === backToHuman ? "✅" : "⚠️  " + backToHuman}`);
  } catch (error) {
    console.log(`❌ ${symbol}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log();

// =============================================================================
// Test 3: Simple Pledge Mapping
// =============================================================================
console.log("📝 Test 3: Simple Pledge Mapping");
console.log("=" .repeat(60));

const simplePledge = createPledgeFromCallback(
  "RH_ORD_TEST_001", // orderId
  "ETH", // asset
  "0.5", // assetAmount
  "ETHEREUM", // network
  "fund", // destinationType
  "123e4567-e89b-12d3-a456-426614174000", // destinationId (example UUID)
  "Test Donor" // donorName (optional)
);

console.log("Simple pledge mapping result:");
console.log(JSON.stringify(simplePledge, null, 2));

console.log();

// =============================================================================
// Test 4: Validation
// =============================================================================
console.log("📝 Test 4: Pledge Validation");
console.log("=" .repeat(60));

if (simplePledge.success && simplePledge.data) {
  const validation = validatePledgeInput(simplePledge.data);

  console.log("Validation result:");
  console.log(`  Valid: ${validation.valid ? "✅" : "❌"}`);

  if (validation.errors.length > 0) {
    console.log("  Errors:");
    validation.errors.forEach((error) => console.log(`    - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log("  Warnings:");
    validation.warnings.forEach((warning) => console.log(`    - ${warning}`));
  }

  if (validation.valid) {
    console.log("\n✅ Pledge data is valid and ready for backend submission");
  }
}

console.log();

// =============================================================================
// Test 5: Invalid Cases
// =============================================================================
console.log("📝 Test 5: Invalid Cases (Error Handling)");
console.log("=" .repeat(60));

const invalidTests = [
  {
    name: "Missing orderId",
    data: {
      orderId: "",
      asset: "ETH",
      assetAmount: "0.5",
      network: "ETHEREUM",
      destinationType: "fund" as const,
      destinationId: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
  {
    name: "Unsupported asset",
    data: {
      orderId: "RH_TEST_002",
      asset: "UNKNOWN_TOKEN",
      assetAmount: "1.0",
      network: "ETHEREUM",
      destinationType: "fund" as const,
      destinationId: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
  {
    name: "Invalid amount",
    data: {
      orderId: "RH_TEST_003",
      asset: "ETH",
      assetAmount: "-1.0",
      network: "ETHEREUM",
      destinationType: "fund" as const,
      destinationId: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
  {
    name: "Invalid UUID",
    data: {
      orderId: "RH_TEST_004",
      asset: "ETH",
      assetAmount: "0.5",
      network: "ETHEREUM",
      destinationType: "fund" as const,
      destinationId: "not-a-uuid",
    },
  },
];

invalidTests.forEach(({ name, data }) => {
  const result = createPledgeFromCallback(
    data.orderId,
    data.asset,
    data.assetAmount,
    data.network,
    data.destinationType,
    data.destinationId
  );

  console.log(`\n${name}:`);
  if (result.success) {
    console.log("  ⚠️  Expected failure but got success");
  } else {
    console.log("  ✅ Correctly failed with errors:");
    result.errors?.forEach((error) => console.log(`    - ${error}`));
  }
});

console.log();

// =============================================================================
// Test 6: Real-world Example
// =============================================================================
console.log("📝 Test 6: Real-world Example (ETH donation)");
console.log("=" .repeat(60));

// Simulating data from actual Robinhood callback
const realWorldExample = createPledgeFromCallback(
  "RH_ORD_20251024_ABC123", // Actual order ID from Robinhood
  "ETH",
  "0.25",
  "ETHEREUM",
  "fund",
  "a1b2c3d4-e5f6-4789-a012-bcdef3456789", // Example fund UUID
  "Anonymous Donor"
);

console.log("Mapping result:");
console.log(JSON.stringify(realWorldExample, null, 2));

if (realWorldExample.success && realWorldExample.data) {
  console.log("\n📊 Pledge Summary:");
  console.log(`  Order ID: ${realWorldExample.data.otcDonationTransactionHash}`);
  console.log(`  Token ID: ${realWorldExample.data.cryptoGiven.tokenId}`);
  console.log(`  Amount (wei): ${realWorldExample.data.cryptoGiven.inputAmount}`);

  const token = getBackendToken("ETH");
  if (token) {
    const humanAmount = convertFromSmallestUnit(
      realWorldExample.data.cryptoGiven.inputAmount,
      token.decimals
    );
    console.log(`  Amount (ETH): ${humanAmount}`);
  }

  console.log(`  Destination: ${realWorldExample.data.receivingEntityType} (${realWorldExample.data.receivingEntityId})`);
  console.log(`  Donor: ${realWorldExample.data.donorName || "Anonymous"}`);
}

console.log();

// =============================================================================
// Summary
// =============================================================================
console.log("=" .repeat(60));
console.log("✅ All tests completed!");
console.log();
console.log("📚 Next Steps:");
console.log("  1. Update BACKEND_TOKEN_MAP with actual backend token IDs");
console.log("  2. Configure NEXT_PUBLIC_BACKEND_URL in .env.local");
console.log("  3. Add authentication to backend API calls");
console.log("  4. Test with real Robinhood transfers");
console.log("  5. Verify pledges in backend database");
console.log("=" .repeat(60));

