# Sub-Plan 4: URL Builder Refactor

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: Sub-Plan 3 (Dashboard Integration)
**Estimated Time**: 2-3 hours

---

## Context Required

### Files to Review

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts` (entire file)

- **Purpose**: Current URL generation logic
- **Critical**: Lines 159-290: `buildOfframpUrl()` function
- **Critical**: Lines 310-314: `buildMultiNetworkOfframpUrl()` function
- **What to understand**: Current URL parameter structure

**File**: `URL-TESTING-TRACKER.md`

- **Purpose**: Testing results
- **Critical**: Working Daffy-style URL format
- **What to understand**: Exact parameter combination that works

**File**: `robinhood-offramp/daffy_style_url_test_results.json`

- **Purpose**: Successful test cases
- **What to understand**: Proven working URLs

**File**: `robinhood-offramp/scripts/test_daffy_style_urls.py`

- **Purpose**: How working URLs were generated
- **What to understand**: Parameter structure and values

### Understanding Required

1. **Working URL Format**: Exact parameters needed for transfer flow
2. **Current URL Builder**: How existing function works
3. **Asset to Network Mapping**: How to validate compatibility
4. **Required vs Optional Parameters**: What must be included
5. **Testing Strategy**: How to verify new URL generation

---

## Objectives

1. **Create Daffy-Style URL Builder Function**

   - Generate URLs matching proven working format
   - Require asset pre-selection
   - Include all necessary parameters

2. **Implement Parameter Validation**

   - Validate asset/network compatibility
   - Ensure wallet address is valid
   - Check required parameters present

3. **Preserve Old URL Builder**

   - Keep for reference and rollback
   - Comment clearly as deprecated
   - Document why it doesn't work

4. **Add Comprehensive Testing**

   - Unit tests for URL generation
   - Test with all 27+ assets
   - Verify parameter structure

5. **Document URL Structure**
   - Clear comments explaining each parameter
   - Reference to testing results
   - Examples for future maintainers

---

## Precise Implementation Steps

### Step 1: Analyze Working URL Format

**Reference**: `robinhood-offramp/daffy_style_url_test_results.json`

**Working URL Structure**:

```
https://applink.robinhood.com/u/connect?
  applicationId=db2c834a-a740-4dfc-bbaf-06887558185f
  &walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e
  &supportedAssets=ETH
  &supportedNetworks=ETHEREUM
  &connectId=<uuid>
  &paymentMethod=crypto_balance
  &redirectUrl=https://.../callback
```

**Key Parameters**:

- `applicationId`: Robinhood app ID (constant)
- `walletAddress`: Destination wallet for selected asset
- `supportedAssets`: Single asset symbol (e.g., 'ETH')
- `supportedNetworks`: Single network (e.g., 'ETHEREUM')
- `connectId`: Unique transaction ID
- `paymentMethod`: Always 'crypto_balance' for transfers
- `redirectUrl`: Callback URL

---

### Step 2: Create Daffy-Style URL Builder Types

**File**: `robinhood-offramp/types/robinhood.d.ts`

**Action**: Add type for Daffy-style URL builder params

**Code**:

```typescript
// Add to existing robinhood.d.ts

/**
 * Parameters for Daffy-style offramp URL generation
 * Uses proven working format from testing
 */
export interface DaffyStyleOfframpParams {
  /** Asset symbol (e.g., 'ETH', 'BTC') */
  asset: string;

  /** Network for the asset (e.g., 'ETHEREUM', 'BITCOIN') */
  network: RobinhoodNetwork;

  /** Destination wallet address for this asset */
  walletAddress: string;

  /** Optional custom callback URL (defaults to standard callback) */
  redirectUrl?: string;

  /** Optional custom connect ID (defaults to UUID) */
  connectId?: string;
}

/**
 * Result of URL generation
 */
export interface OfframpUrlResult {
  /** Generated URL */
  url: string;

  /** Connect ID used */
  connectId: string;

  /** Parameters used */
  params: {
    asset: string;
    network: string;
    walletAddress: string;
  };
}
```

**Validation**:

```bash
npx tsc --noEmit
```

---

### Step 3: Implement Daffy-Style URL Builder

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts`

**Action**: Add new Daffy-style URL builder function

**Code** (add to file):

````typescript
import { v4 as uuidv4 } from "uuid";
import {
  DaffyStyleOfframpParams,
  OfframpUrlResult,
  RobinhoodNetwork,
} from "@/types/robinhood";

/**
 * Build Daffy-style offramp URL for Robinhood Connect
 *
 * This uses the PROVEN WORKING format from extensive testing (31 URL variations).
 * Pre-selection of asset is REQUIRED for external wallet transfers.
 *
 * Reference: URL-TESTING-TRACKER.md, daffy_style_url_test_results.json
 *
 * @param params - Asset, network, and wallet address
 * @returns Complete URL and metadata
 *
 * @example
 * ```typescript
 * const result = buildDaffyStyleOfframpUrl({
 *   asset: 'ETH',
 *   network: 'ETHEREUM',
 *   walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e'
 * });
 *
 * window.location.href = result.url;
 * ```
 */
export function buildDaffyStyleOfframpUrl(
  params: DaffyStyleOfframpParams
): OfframpUrlResult {
  const { asset, network, walletAddress, redirectUrl, connectId } = params;

  // Validate required parameters
  if (!asset || !network || !walletAddress) {
    throw new Error(
      "Asset, network, and walletAddress are required for Daffy-style offramp URL"
    );
  }

  // Validate wallet address format (basic check)
  if (!isValidWalletAddress(walletAddress, network)) {
    throw new Error(
      `Invalid wallet address format for network ${network}: ${walletAddress}`
    );
  }

  // Generate or use provided connectId
  const finalConnectId = connectId || uuidv4();

  // Get base URL and redirect URL
  const baseUrl = getRobinhoodBaseUrl();
  const finalRedirectUrl = redirectUrl || getDefaultRedirectUrl();

  // Get application ID
  const applicationId = getRobinhoodApplicationId();

  // Build URL parameters (EXACT format from working tests)
  const urlParams = new URLSearchParams({
    applicationId,
    walletAddress,
    supportedAssets: asset, // Single asset only
    supportedNetworks: network, // Single network only
    connectId: finalConnectId,
    paymentMethod: "crypto_balance", // Required for transfers
    redirectUrl: finalRedirectUrl,
  });

  const url = `${baseUrl}?${urlParams.toString()}`;

  // Log for debugging (remove in production or use proper logger)
  console.log("[URL Builder] Generated Daffy-style URL:", {
    asset,
    network,
    connectId: finalConnectId,
    urlLength: url.length,
  });

  return {
    url,
    connectId: finalConnectId,
    params: {
      asset,
      network,
      walletAddress,
    },
  };
}

/**
 * Validate wallet address format for given network
 */
function isValidWalletAddress(
  address: string,
  network: RobinhoodNetwork
): boolean {
  // Basic validation - can be enhanced
  if (!address || address.length === 0) {
    return false;
  }

  // Ethereum-based networks (Ethereum, Polygon, Avalanche, etc.)
  if (
    network === "ETHEREUM" ||
    network === "POLYGON" ||
    network === "AVALANCHE"
  ) {
    // Ethereum address: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Bitcoin
  if (network === "BITCOIN") {
    // Bitcoin addresses are complex, basic check for now
    return address.length >= 26 && address.length <= 62;
  }

  // Solana
  if (network === "SOLANA") {
    // Solana addresses are base58, typically 32-44 characters
    return address.length >= 32 && address.length <= 44;
  }

  // Default: assume valid (can add more specific validation per network)
  return true;
}

/**
 * Get Robinhood Connect base URL
 */
function getRobinhoodBaseUrl(): string {
  return "https://applink.robinhood.com/u/connect";
}

/**
 * Get default callback/redirect URL
 */
function getDefaultRedirectUrl(): string {
  // Use environment variable or construct from current host
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/callback`;
  }

  // Fallback for server-side rendering
  return (
    process.env.NEXT_PUBLIC_CALLBACK_URL || "http://localhost:3030/callback"
  );
}

/**
 * Get Robinhood application ID
 */
function getRobinhoodApplicationId(): string {
  const appId = process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID;

  if (!appId) {
    throw new Error(
      "NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID environment variable not set"
    );
  }

  return appId;
}

/**
 * Validate asset/network compatibility
 *
 * Ensures the asset can operate on the specified network
 */
export function validateAssetNetworkCompatibility(
  asset: string,
  network: RobinhoodNetwork
): boolean {
  // Import asset metadata
  const { getAssetMetadata } = require("./robinhood-asset-metadata");
  const metadata = getAssetMetadata(asset);

  if (!metadata) {
    console.warn(`Unknown asset: ${asset}`);
    return false;
  }

  if (metadata.network !== network) {
    console.warn(
      `Asset ${asset} is on network ${metadata.network}, not ${network}`
    );
    return false;
  }

  return true;
}
````

**Validation**:

```bash
npx tsc --noEmit
```

---

### Step 4: Mark Old URL Builder as Deprecated

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts`

**Action**: Add deprecation notice to old functions

**Code** (add comments to existing functions):

```typescript
/**
 * @deprecated Use buildDaffyStyleOfframpUrl instead
 *
 * This multi-network approach does NOT work for external wallet transfers.
 * Testing showed it redirects to "Sell" flow instead of "Transfer" flow.
 *
 * Preserved for reference and potential rollback only.
 *
 * See: URL-TESTING-TRACKER.md for test results
 */
export function buildMultiNetworkOfframpUrl(
  supportedNetworks: RobinhoodNetwork[]
): string {
  // ... existing code ...

  console.warn(
    "[DEPRECATED] buildMultiNetworkOfframpUrl does not work for external wallet transfers. Use buildDaffyStyleOfframpUrl instead."
  );

  // ... rest of existing code ...
}

/**
 * @deprecated Use buildDaffyStyleOfframpUrl instead
 *
 * This function allows optional asset pre-selection, but testing proved
 * that pre-selection is REQUIRED for external wallet transfers.
 *
 * See: URL-TESTING-TRACKER.md, transfer_no_preselect_results.json
 */
export function buildOfframpUrl(params: OfframpUrlParams): string {
  // ... existing code ...

  console.warn(
    "[DEPRECATED] buildOfframpUrl without required asset pre-selection. Use buildDaffyStyleOfframpUrl instead."
  );

  // ... rest of existing code ...
}
```

---

### Step 5: Add Environment Variable

**File**: `robinhood-offramp/.env.local`

**Action**: Add Robinhood application ID

**Code**:

```bash
# Robinhood Connect Configuration
NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID=db2c834a-a740-4dfc-bbaf-06887558185f

# Callback URL (optional - auto-detected if not set)
# NEXT_PUBLIC_CALLBACK_URL=https://your-domain.com/callback
```

**Note**: For production, use environment-specific values

---

### Step 6: Create URL Builder Tests

**File**: `robinhood-offramp/__tests__/url-builder.test.ts` (NEW)

**Action**: Create unit tests for URL builder

**Code**:

```typescript
import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  buildDaffyStyleOfframpUrl,
  validateAssetNetworkCompatibility,
} from "../lib/robinhood-url-builder";

describe("buildDaffyStyleOfframpUrl", () => {
  beforeEach(() => {
    // Set required environment variable
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID =
      "db2c834a-a740-4dfc-bbaf-06887558185f";
  });

  it("should generate valid URL for ETH on Ethereum", () => {
    const result = buildDaffyStyleOfframpUrl({
      asset: "ETH",
      network: "ETHEREUM",
      walletAddress: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
    });

    expect(result.url).toContain("applink.robinhood.com/u/connect");
    expect(result.url).toContain("supportedAssets=ETH");
    expect(result.url).toContain("supportedNetworks=ETHEREUM");
    expect(result.url).toContain(
      "walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e"
    );
    expect(result.url).toContain("paymentMethod=crypto_balance");
    expect(result.connectId).toBeTruthy();
  });

  it("should generate valid URL for BTC on Bitcoin", () => {
    const result = buildDaffyStyleOfframpUrl({
      asset: "BTC",
      network: "BITCOIN",
      walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });

    expect(result.url).toContain("supportedAssets=BTC");
    expect(result.url).toContain("supportedNetworks=BITCOIN");
  });

  it("should use provided connectId", () => {
    const customId = "test-123-456";
    const result = buildDaffyStyleOfframpUrl({
      asset: "ETH",
      network: "ETHEREUM",
      walletAddress: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
      connectId: customId,
    });

    expect(result.connectId).toBe(customId);
    expect(result.url).toContain(`connectId=${customId}`);
  });

  it("should throw error for missing asset", () => {
    expect(() => {
      buildDaffyStyleOfframpUrl({
        asset: "",
        network: "ETHEREUM",
        walletAddress: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
      });
    }).toThrow("Asset, network, and walletAddress are required");
  });

  it("should throw error for invalid Ethereum address", () => {
    expect(() => {
      buildDaffyStyleOfframpUrl({
        asset: "ETH",
        network: "ETHEREUM",
        walletAddress: "invalid-address",
      });
    }).toThrow("Invalid wallet address format");
  });
});

describe("validateAssetNetworkCompatibility", () => {
  it("should validate ETH on ETHEREUM", () => {
    const isValid = validateAssetNetworkCompatibility("ETH", "ETHEREUM");
    expect(isValid).toBe(true);
  });

  it("should reject ETH on BITCOIN", () => {
    const isValid = validateAssetNetworkCompatibility("ETH", "BITCOIN");
    expect(isValid).toBe(false);
  });

  it("should reject unknown asset", () => {
    const isValid = validateAssetNetworkCompatibility("FAKE", "ETHEREUM");
    expect(isValid).toBe(false);
  });
});
```

**Validation**:

```bash
# If Jest is configured
npm test

# Or just check compilation
npx tsc --noEmit
```

---

### Step 7: Create URL Generation Test Script

**File**: `robinhood-offramp/scripts/test-url-generation.ts` (NEW)

**Action**: Script to test URL generation for all assets

**Code**:

```typescript
/**
 * Test URL generation for all supported assets
 *
 * Run with: npx tsx scripts/test-url-generation.ts
 */

import { buildDaffyStyleOfframpUrl } from "../lib/robinhood-url-builder";
import { buildAssetConfigs } from "../lib/robinhood-asset-config";

console.log("🧪 Testing URL Generation for All Assets\n");

// Set required environment variable for testing
process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID =
  "db2c834a-a740-4dfc-bbaf-06887558185f";

const configs = buildAssetConfigs();
const results: Array<{ asset: string; success: boolean; error?: string }> = [];

configs.forEach((config) => {
  try {
    const result = buildDaffyStyleOfframpUrl({
      asset: config.symbol,
      network: config.network,
      walletAddress: config.walletAddress,
    });

    // Verify URL structure
    if (!result.url.includes("applink.robinhood.com")) {
      throw new Error("Invalid base URL");
    }

    if (!result.url.includes(`supportedAssets=${config.symbol}`)) {
      throw new Error("Missing or incorrect asset parameter");
    }

    console.log(
      `✅ ${config.symbol.padEnd(20)} ${config.network.padEnd(15)} URL: ${
        result.url.length
      } chars`
    );
    results.push({ asset: config.symbol, success: true });
  } catch (error) {
    console.error(
      `❌ ${config.symbol.padEnd(20)} ${config.network.padEnd(15)} Error: ${
        error.message
      }`
    );
    results.push({
      asset: config.symbol,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Summary
console.log("\n" + "━".repeat(70));
console.log("Summary:");
console.log(`  Total assets: ${results.length}`);
console.log(`  ✅ Successful: ${results.filter((r) => r.success).length}`);
console.log(`  ❌ Failed: ${results.filter((r) => !r.success).length}`);

if (results.some((r) => !r.success)) {
  console.log("\nFailed assets:");
  results
    .filter((r) => !r.success)
    .forEach((r) => {
      console.log(`  - ${r.asset}: ${r.error}`);
    });
  process.exit(1);
}

console.log("\n✅ All assets generated valid URLs!");
console.log("━".repeat(70));
```

**Validation**:

```bash
npx tsx scripts/test-url-generation.ts
```

**Expected Output**: All assets generate valid URLs

---

## Deliverables Checklist

- [ ] Type definitions added to `types/robinhood.d.ts`

  - [ ] `DaffyStyleOfframpParams` interface
  - [ ] `OfframpUrlResult` interface

- [ ] Daffy-style URL builder implemented: `lib/robinhood-url-builder.ts`

  - [ ] `buildDaffyStyleOfframpUrl()` function
  - [ ] Parameter validation
  - [ ] Wallet address validation
  - [ ] `validateAssetNetworkCompatibility()` function

- [ ] Old URL builders marked deprecated

  - [ ] Deprecation comments added
  - [ ] Console warnings added

- [ ] Environment variable configured

  - [ ] `.env.local` has `NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID`

- [ ] Tests created

  - [ ] Unit tests: `__tests__/url-builder.test.ts`
  - [ ] Test script: `scripts/test-url-generation.ts`

- [ ] All TypeScript compilation succeeds
- [ ] All tests pass

---

## Validation Steps

### 1. TypeScript Compilation

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors

### 2. Run URL Generation Test Script

```bash
npx tsx scripts/test-url-generation.ts
```

**Expected**: All 27+ assets generate valid URLs

### 3. Manual URL Validation

Test with known working asset (ETH):

```typescript
// In Node REPL or test file
import { buildDaffyStyleOfframpUrl } from "./lib/robinhood-url-builder";

const result = buildDaffyStyleOfframpUrl({
  asset: "ETH",
  network: "ETHEREUM",
  walletAddress: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
});

console.log(result.url);
```

**Expected URL format**:

```
https://applink.robinhood.com/u/connect?applicationId=...&walletAddress=0x...&supportedAssets=ETH&supportedNetworks=ETHEREUM&connectId=...&paymentMethod=crypto_balance&redirectUrl=...
```

### 4. Test in Dashboard

```bash
npm run dev
```

1. Navigate to dashboard
2. Select ETH asset
3. Click "Continue to Robinhood"
4. Check console for generated URL
5. Verify URL matches expected format

**Verify**:

- [ ] URL generates without errors
- [ ] All parameters present
- [ ] Wallet address correct
- [ ] Asset and network match selection

### 5. Test Multiple Assets

Select and generate URLs for:

- [ ] ETH (Ethereum)
- [ ] BTC (Bitcoin)
- [ ] SOL (Solana)
- [ ] USDC (Ethereum)
- [ ] MATIC (Polygon)

**Verify**: Each generates correct network and asset parameters

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure URL builder changes don't break existing code

### Commands

```bash
cd robinhood-offramp

# 1. TypeScript compilation
npx tsc --noEmit

# 2. Test new URL builder
npx tsx scripts/test-url-generation.ts

# 3. Start dev server
npm run dev

# 4. Test dashboard flow
# Visit http://localhost:3030/dashboard
# Select asset and verify URL generation
```

### Success Criteria

- ✅ TypeScript compiles with no errors
- ✅ All assets generate valid URLs
- ✅ Dashboard integrates successfully
- ✅ No runtime errors in console
- ✅ URLs match expected format
- ✅ Old functions still work (with deprecation warnings)

### If Checkpoint Fails

1. **URL Generation Errors**:

   - Check environment variable set
   - Verify wallet address validation logic
   - Check parameter ordering

2. **Type Errors**:

   - Verify interface definitions
   - Check import statements
   - Ensure proper type exports

3. **Dashboard Integration Issues**:
   - Verify function is exported
   - Check import in dashboard
   - Verify parameters passed correctly

### Rollback Procedure

```bash
git checkout robinhood-offramp/lib/robinhood-url-builder.ts
git checkout robinhood-offramp/types/robinhood.d.ts
git checkout robinhood-offramp/.env.local
```

---

## Common Issues and Solutions

### Issue 1: Missing Application ID

**Symptom**: Error "NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID environment variable not set"

**Solution**:

- Add to `.env.local`:

```bash
NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID=db2c834a-a740-4dfc-bbaf-06887558185f
```

- Restart development server

### Issue 2: Invalid Wallet Address

**Symptom**: Error "Invalid wallet address format"

**Solution**:

- Check wallet address in `robinhood-asset-addresses.ts`
- Verify format matches network requirements
- Update validation logic if needed

### Issue 3: URL Too Long

**Symptom**: URL exceeds browser limits

**Solution**:

- Review which parameters are required
- Ensure not duplicating parameters
- Current implementation should be well under limit (~500 chars)

### Issue 4: Redirect URL Not Working

**Symptom**: Callback doesn't work after Robinhood redirect

**Solution**:

- Verify `getDefaultRedirectUrl()` returns correct URL
- Check environment variable if custom URL needed
- Ensure URL is accessible (ngrok for development)

### Issue 5: Asset/Network Mismatch

**Symptom**: Validation fails for valid assets

**Solution**:

- Check `ASSET_METADATA` has correct network assignments
- Verify asset exists in metadata
- Update compatibility validation logic

---

## Integration Points

### Receives from Sub-Plan 1

- ✅ Asset metadata with network information
- ✅ Wallet addresses for all assets

### Receives from Sub-Plan 3

- ✅ Selected asset from dashboard
- ✅ Integration point for URL generation

### Provides to Sub-Plan 5 (Callback Verification)

- ✅ Working URL generation for testing
- ✅ `connectId` for tracking transfers

### Provides to Sub-Plan 6 (Testing & Documentation)

- ✅ Test scripts for all assets
- ✅ URL format documentation

---

## Next Steps

After completing this sub-plan:

1. ✅ **Verify all deliverables** complete
2. ✅ **Run all validation steps** successfully
3. ✅ **Test URL generation for all 27+ assets**
4. ✅ **Test dashboard integration end-to-end**
5. ✅ **Commit changes** with descriptive message
6. ⏭️ **Proceed to Sub-Plan 5**: Callback Flow Verification
7. 📝 **Create completion log**: `implementation-logs/YYYYMMDD-HHMM-SP4-COMPLETE.md`

---

## Time Breakdown

- Step 1 (Analyze Format): 15 minutes
- Step 2 (Types): 20 minutes
- Step 3 (URL Builder): 60 minutes
- Step 4 (Deprecation): 15 minutes
- Step 5 (Environment): 5 minutes
- Step 6 (Unit Tests): 30 minutes
- Step 7 (Test Script): 20 minutes
- Testing & Validation: 45 minutes

**Total**: ~3 hours

---

**Status**: ⏸️ Ready to begin (after Sub-Plan 3)
**Last Updated**: October 22, 2025
