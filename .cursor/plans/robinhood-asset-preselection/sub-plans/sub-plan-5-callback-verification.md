# Sub-Plan 5: Callback Flow Verification

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 4 (URL Builder Refactor)
**Estimated Time**: 4-6 hours

---

## Context Required

### Files to Review

**File**: `robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`

- **Purpose**: Callback endpoint that receives Robinhood response
- **Critical**: Understand how callback currently works
- **What to verify**: Works correctly with asset pre-selection

**File**: `robinhood-offramp/app/callback/page.tsx`

- **Purpose**: Callback page UI
- **What to verify**: Displays correct information for selected asset

**File**: `robinhood-offramp/lib/robinhood-api.ts`

- **Purpose**: API helper functions
- **What to verify**: Handles callback data correctly

**File**: `URL-TESTING-TRACKER.md`

- **Purpose**: Testing methodology
- **What to understand**: How to test end-to-end flow

### Understanding Required

1. **Callback Flow**: How Robinhood redirects back after transfer
2. **Deposit Quote**: How `depositQuoteId` is redeemed
3. **Wallet Address Mapping**: How callback determines correct address
4. **Testing Strategy**: How to test with real Robinhood Connect
5. **Error Handling**: What can go wrong and how to handle it

---

## Objectives

1. **Verify Callback Endpoint Works with Pre-Selection**

   - Test with multiple assets
   - Verify correct wallet address returned
   - Ensure no regressions

2. **Test Complete Flow End-to-End**

   - Dashboard → Asset Selection → Robinhood → Callback → Confirmation
   - Verify each step works correctly
   - Test with minimum 4-5 different assets

3. **Validate All 27+ Assets**

   - Systematic testing of every supported asset
   - Document successes and failures
   - Disable any non-working assets

4. **Handle Edge Cases**

   - User cancels in Robinhood
   - Network errors
   - Missing callback parameters
   - Asset mismatches

5. **Document Testing Results**
   - Create comprehensive test report
   - Note any asset-specific issues
   - Provide troubleshooting guidance

---

## Precise Implementation Steps

### Step 1: Review Current Callback Implementation

**File**: `robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`

**Action**: Verify current implementation handles asset pre-selection

**Review Checklist**:

- [ ] Receives `depositQuoteId` from Robinhood
- [ ] Makes API call to redeem deposit quote
- [ ] Extracts asset information from response
- [ ] Returns correct wallet address
- [ ] Handles errors appropriately

**What to Look For**:

```typescript
// Should receive depositQuoteId in callback
const depositQuoteId = searchParams.get("depositQuoteId");

// Should redeem and get asset info
const depositQuote = await redeemDepositQuote(depositQuoteId);

// Should return correct address based on asset
const walletAddress = ROBINHOOD_ASSET_ADDRESSES[assetSymbol];
```

**If modifications needed**: Update to ensure compatibility with pre-selected assets

---

### Step 2: Add Callback Logging and Debugging

**File**: `robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`

**Action**: Add comprehensive logging for debugging

**Code** (add to callback handler):

```typescript
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const depositQuoteId = searchParams.get("depositQuoteId");
    const connectId = searchParams.get("connectId");

    console.log("[Callback] Received callback:", {
      depositQuoteId,
      connectId,
      timestamp: new Date().toISOString(),
    });

    if (!depositQuoteId) {
      console.error("[Callback] Missing depositQuoteId");
      return new Response("Missing depositQuoteId", { status: 400 });
    }

    // Redeem deposit quote
    console.log("[Callback] Redeeming deposit quote...");
    const depositQuote = await redeemDepositQuote(depositQuoteId);

    console.log("[Callback] Deposit quote redeemed:", {
      asset: depositQuote.asset,
      network: depositQuote.network,
      amount: depositQuote.amount,
    });

    // Get wallet address
    const assetKey = buildAssetKey(depositQuote.asset, depositQuote.network);
    const walletAddress = ROBINHOOD_ASSET_ADDRESSES[assetKey];

    if (!walletAddress) {
      console.error("[Callback] No wallet address found:", {
        asset: depositQuote.asset,
        network: depositQuote.network,
        assetKey,
      });
      return new Response("Unsupported asset", { status: 400 });
    }

    console.log("[Callback] Success:", {
      asset: depositQuote.asset,
      walletAddress,
      duration: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({
        depositAddress: walletAddress,
        asset: depositQuote.asset,
        network: depositQuote.network,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Callback] Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Build asset key for wallet address lookup
 * Handles multi-network assets like USDC
 */
function buildAssetKey(asset: string, network: string): string {
  // Some assets exist on multiple networks
  const multiNetworkAssets = ["USDC", "USDT"];

  if (multiNetworkAssets.includes(asset)) {
    return `${asset}-${network}`;
  }

  return asset;
}
```

**Validation**: Review code, check for TypeScript errors

---

### Step 3: Create End-to-End Test Plan

**File**: `.cursor/plans/robinhood-asset-preselection/implementation-logs/E2E-TEST-PLAN.md` (NEW)

**Action**: Document systematic testing approach

**Code**:

````markdown
# End-to-End Testing Plan

## Test Environment Setup

**Requirements**:

- [ ] Development server running (`npm run dev`)
- [ ] ngrok tunnel active (for Robinhood callback)
- [ ] Robinhood account with crypto balances
- [ ] Robinhood Connect API credentials configured

**ngrok Setup**:

```bash
ngrok http 3000
# Update .env.local with ngrok URL
```
````

## Priority Assets to Test First

### Phase 1: Core Assets (Must Work)

1. **ETH** (Ethereum) - Most popular
2. **BTC** (Bitcoin) - Most popular
3. **USDC** (Ethereum) - Stablecoin
4. **SOL** (Solana) - Alternative L1

### Phase 2: Additional Important Assets

5. **MATIC** (Polygon) - L2 scaling
6. **AVAX** (Avalanche) - Alternative L1
7. **USDC** (Polygon) - Multi-network test
8. **USDC** (Solana) - Multi-network test

### Phase 3: DeFi and Other Assets

9. **UNI** (Ethereum)
10. **LINK** (Ethereum)
11. **AAVE** (Ethereum)
12. **COMP** (Ethereum)

### Phase 4: Meme and Alternative Assets

13. **DOGE** (Dogecoin)
14. **SHIB** (Ethereum)
15. All remaining assets...

## Test Procedure for Each Asset

**Steps**:

1. **Start Test**

   - Note asset: **\_\_\_**
   - Time started: **\_\_\_**
   - ngrok URL: **\_\_\_**

2. **Navigate to Dashboard**

   - Visit: http://localhost:3030/dashboard
   - Verify: Asset selector loads

3. **Select Asset**

   - Click on asset card
   - Verify: Confirmation screen shows
   - Verify: Correct asset name and network displayed

4. **Generate URL**

   - Click "Continue to Robinhood"
   - Copy generated URL from console log
   - Verify: URL contains correct parameters

5. **Robinhood Connect**

   - Paste URL in browser or click link
   - Verify: Robinhood Connect opens
   - Verify: Shows "Transfer [ASSET]" header
   - Verify: NO "Sell" option appears

6. **Complete Transfer**

   - Select or enter amount
   - Click Continue/Confirm
   - Complete in Robinhood app if required

7. **Callback Verification**

   - Wait for redirect to callback page
   - Check browser console for logs
   - Verify: Correct wallet address returned
   - Verify: Asset matches selection

8. **Record Result**
   - Status: ✅ PASS / ❌ FAIL
   - Notes: **\_\_\_**
   - Screenshots: **\_\_\_**

## Results Template

| Asset | Network  | Status | URL OK? | RH Flow OK? | Callback OK? | Notes |
| ----- | -------- | ------ | ------- | ----------- | ------------ | ----- |
| ETH   | ETHEREUM | ✅     | ✅      | ✅          | ✅           | -     |
| BTC   | BITCOIN  | ✅     | ✅      | ✅          | ✅           | -     |
| ...   | ...      | ...    | ...     | ...         | ...          | ...   |

## Failure Investigation

If asset fails:

1. **Check URL Generation**

   - Review console logs
   - Verify parameters correct
   - Test URL in isolation

2. **Check Robinhood Response**

   - Note error message
   - Check if "Sell" appears
   - Screenshot Robinhood UI

3. **Check Callback**

   - Review server logs
   - Check wallet address mapping
   - Verify asset key format

4. **Document Issue**
   - Create issue log
   - Include all error details
   - Disable asset if necessary

````

---

### Step 4: Test Core Assets (Priority 1)

**Action**: Manual testing of ETH, BTC, USDC, SOL

**For Each Asset**:

1. **Setup Test Environment**
   ```bash
   # Terminal 1: Start dev server
   cd robinhood-offramp
   npm run dev

   # Terminal 2: Start ngrok
   ngrok http 3000

   # Update .env.local with ngrok URL
   # NEXT_PUBLIC_CALLBACK_URL=https://your-ngrok-url.ngrok.io/callback
````

2. **Execute Test**

   - Follow test procedure from Step 3
   - Document results in test plan
   - Take screenshots of key steps

3. **Verify Success Criteria**
   - [ ] URL generates correctly
   - [ ] Robinhood shows "Transfer [ASSET]"
   - [ ] No "Sell" option appears
   - [ ] Callback receives correct data
   - [ ] Correct wallet address returned

**Expected Results**: All 4 core assets pass

---

### Step 5: Test Additional Important Assets (Priority 2)

**Action**: Test MATIC, AVAX, and multi-network USDC

**Special Focus**: Multi-network assets

- Test USDC on Ethereum, Polygon, Solana, Avalanche
- Verify correct network differentiation
- Ensure wallet addresses don't get mixed up

**Expected Results**: All assets pass, multi-network handling works correctly

---

### Step 6: Create Automated Testing Script (Optional)

**File**: `robinhood-offramp/scripts/test-asset-callback.ts` (NEW)

**Action**: Script to simulate callback for all assets

**Code**:

```typescript
/**
 * Simulate callback for all assets to verify wallet address mapping
 *
 * This doesn't test actual Robinhood flow, but verifies our callback
 * logic returns correct addresses for each asset.
 *
 * Run with: npx tsx scripts/test-asset-callback.ts
 */

import { buildAssetConfigs } from "../lib/robinhood-asset-config";

console.log("🧪 Testing Callback Wallet Address Mapping\n");

const configs = buildAssetConfigs();
const results: Array<{
  asset: string;
  network: string;
  success: boolean;
  walletAddress?: string;
  error?: string;
}> = [];

configs.forEach((config) => {
  try {
    // Simulate callback logic
    const assetKey = config.symbol.includes("-")
      ? config.symbol
      : config.symbol;

    // In real callback, this is how we'd look up address
    const walletAddress = config.walletAddress;

    if (!walletAddress) {
      throw new Error("No wallet address found");
    }

    // Validate address format
    if (walletAddress.length < 10) {
      throw new Error("Invalid wallet address format");
    }

    console.log(
      `✅ ${config.symbol.padEnd(20)} ${config.network.padEnd(
        15
      )} ${walletAddress.slice(0, 20)}...`
    );

    results.push({
      asset: config.symbol,
      network: config.network,
      success: true,
      walletAddress,
    });
  } catch (error) {
    console.error(
      `❌ ${config.symbol.padEnd(20)} ${config.network.padEnd(15)} Error: ${
        error.message
      }`
    );

    results.push({
      asset: config.symbol,
      network: config.network,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Summary
console.log("\n" + "━".repeat(70));
console.log("Summary:");
console.log(`  Total assets: ${results.length}`);
console.log(`  ✅ Valid addresses: ${results.filter((r) => r.success).length}`);
console.log(`  ❌ Failed: ${results.filter((r) => !r.success).length}`);

if (results.some((r) => !r.success)) {
  console.log("\nFailed assets:");
  results
    .filter((r) => !r.success)
    .forEach((r) => {
      console.log(`  - ${r.asset} (${r.network}): ${r.error}`);
    });
  process.exit(1);
}

console.log("\n✅ All assets have valid wallet addresses!");
console.log("━".repeat(70));
```

**Validation**:

```bash
npx tsx scripts/test-asset-callback.ts
```

**Expected**: All assets have valid addresses

---

### Step 7: Document Test Results

**File**: `.cursor/plans/robinhood-asset-preselection/implementation-logs/YYYYMMDD-HHMM-ASSET-TEST-RESULTS.md`

**Action**: Create comprehensive test results document

**Template**:

```markdown
# Asset Pre-Selection E2E Test Results

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Development (ngrok)
**Total Assets Tested**: [X]

## Summary

- ✅ Passing: [X] assets
- ❌ Failing: [X] assets
- ⏭️ Skipped: [X] assets

## Detailed Results

### Core Assets (Priority 1)

#### ETH (Ethereum)

- **Status**: ✅ PASS
- **URL Generated**: ✅ Correct
- **Robinhood Flow**: ✅ "Transfer ETH" header
- **Callback**: ✅ Correct wallet address
- **Notes**: No issues

#### BTC (Bitcoin)

- **Status**: ✅ PASS
- **URL Generated**: ✅ Correct
- **Robinhood Flow**: ✅ "Transfer BTC" header
- **Callback**: ✅ Correct wallet address
- **Notes**: No issues

[Continue for all assets...]

### Failed Assets

#### [Asset Name] ([Network])

- **Status**: ❌ FAIL
- **Failure Point**: [URL/Robinhood/Callback]
- **Error**: [Description]
- **Screenshots**: [Links]
- **Action Taken**: Disabled asset in metadata

## Recommendations

1. [Asset X] - Ready for production
2. [Asset Y] - Needs investigation
3. [Asset Z] - Should be disabled

## Next Steps

- [ ] Re-test failed assets
- [ ] Update asset metadata to disable non-working assets
- [ ] Document known issues
```

---

## Deliverables Checklist

- [ ] Callback endpoint reviewed and verified

  - [ ] Handles asset pre-selection correctly
  - [ ] Returns correct wallet addresses
  - [ ] Error handling in place
  - [ ] Comprehensive logging added

- [ ] E2E test plan created

  - [ ] Test procedure documented
  - [ ] Priority assets identified
  - [ ] Results template ready

- [ ] Core assets tested (minimum 4)

  - [ ] ETH tested and passing
  - [ ] BTC tested and passing
  - [ ] USDC tested and passing
  - [ ] SOL tested and passing

- [ ] Additional assets tested (minimum 4 more)

  - [ ] Multi-network assets verified
  - [ ] DeFi tokens tested
  - [ ] Results documented

- [ ] Test results documented

  - [ ] Comprehensive results file created
  - [ ] Successes and failures noted
  - [ ] Screenshots captured

- [ ] Non-working assets disabled
  - [ ] Asset metadata updated
  - [ ] `enabled: false` for failing assets

---

## Validation Steps

### 1. Callback Endpoint Test

```bash
# Start dev server
npm run dev

# Make test callback request
curl "http://localhost:3030/api/robinhood/redeem-deposit-address?depositQuoteId=test-123"
```

**Expected**: Returns wallet address or appropriate error

### 2. Core Assets E2E Test

For each core asset (ETH, BTC, USDC, SOL):

1. Complete full flow from dashboard to callback
2. Verify no errors at any step
3. Confirm correct wallet address returned

**Expected**: 100% success rate for core assets

### 3. Automated Callback Test

```bash
npx tsx scripts/test-asset-callback.ts
```

**Expected**: All assets have valid wallet addresses

### 4. Multi-Network Test

Test USDC on all networks:

- USDC-ETHEREUM
- USDC-POLYGON
- USDC-SOLANA
- USDC-AVALANCHE

**Expected**: Correct wallet address for each network

### 5. Error Handling Test

Test error scenarios:

- Missing `depositQuoteId`
- Invalid `depositQuoteId`
- Unsupported asset
- Network error

**Expected**: Graceful error handling, appropriate error messages

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure callback changes don't break existing functionality

### Commands

```bash
cd robinhood-offramp

# 1. Start server
npm run dev

# 2. Test callback endpoint directly
curl http://localhost:3030/api/robinhood/redeem-deposit-address

# 3. Complete E2E flow with known working asset (ETH)
```

### Success Criteria

- ✅ Callback endpoint responds
- ✅ Core assets (ETH, BTC, USDC, SOL) work end-to-end
- ✅ Correct wallet addresses returned
- ✅ No console errors
- ✅ Logs show expected information

### If Checkpoint Fails

1. **Callback Errors**:

   - Check server logs
   - Verify API credentials
   - Check wallet address mapping logic

2. **Wrong Wallet Address**:

   - Verify asset key format
   - Check multi-network asset handling
   - Review `buildAssetKey()` function

3. **Robinhood Flow Issues**:
   - Verify URL parameters correct
   - Check Robinhood account has balance
   - Test with different asset

### Rollback Procedure

```bash
git checkout robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts
git checkout robinhood-offramp/app/callback/page.tsx
```

---

## Common Issues and Solutions

### Issue 1: Callback Not Receiving Data

**Symptom**: Callback endpoint not being called

**Solution**:

- Verify ngrok tunnel active
- Check redirect URL in generated URL
- Verify Robinhood can reach callback URL
- Check firewall/network settings

### Issue 2: Wrong Wallet Address Returned

**Symptom**: Callback returns address for different asset/network

**Solution**:

- Check `buildAssetKey()` logic
- Verify multi-network handling
- Check asset symbol format in metadata
- Review ROBINHOOD_ASSET_ADDRESSES keys

### Issue 3: Robinhood Shows "Sell" Instead of "Transfer"

**Symptom**: Wrong flow appears in Robinhood

**Solution**:

- This indicates URL generation issue
- Go back to Sub-Plan 4
- Verify URL parameters exact match working format
- Check console logs for generated URL

### Issue 4: Asset Not Found Error

**Symptom**: Callback can't find wallet address for asset

**Solution**:

- Check asset is in ROBINHOOD_ASSET_ADDRESSES
- Verify asset key format matches
- Check asset enabled in metadata
- Review callback logs for asset key used

### Issue 5: Transfer Amount Not Showing

**Symptom**: Robinhood doesn't show transfer amount field

**Solution**:

- Verify `paymentMethod=crypto_balance` in URL
- Check asset has balance in Robinhood account
- Verify network parameter correct

---

## Integration Points

### Receives from Sub-Plan 4

- ✅ Working URL generation
- ✅ ConnectId for tracking

### Provides to Sub-Plan 6

- ✅ Test results for documentation
- ✅ List of verified working assets
- ✅ Known issues and limitations

---

## Next Steps

After completing this sub-plan:

1. ✅ **Verify core assets** (minimum 4) tested successfully
2. ✅ **Document all test results**
3. ✅ **Disable any non-working assets**
4. ✅ **Create comprehensive test report**
5. ✅ **Commit changes** with descriptive message
6. ⏭️ **Proceed to Sub-Plan 6**: Testing & Documentation
7. 📝 **Create completion log**: `implementation-logs/YYYYMMDD-HHMM-SP5-COMPLETE.md`

---

## Time Breakdown

- Step 1 (Review Callback): 30 minutes
- Step 2 (Add Logging): 30 minutes
- Step 3 (Create Test Plan): 30 minutes
- Step 4 (Test Core Assets): 90 minutes (20-25 min per asset)
- Step 5 (Test Additional Assets): 90 minutes
- Step 6 (Automated Script): 30 minutes
- Step 7 (Document Results): 45 minutes
- Buffer for Issues: 45 minutes

**Total**: ~6 hours

---

**Status**: ⏸️ Ready to begin (after Sub-Plan 4)
**Last Updated**: October 22, 2025

**⚠️ IMPORTANT**: This sub-plan requires actual Robinhood Connect testing. Ensure you have:

- Active Robinhood account with crypto balances
- ngrok or similar tunneling service
- Time to complete transfers (some may take several minutes)
