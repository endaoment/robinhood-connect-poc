# Sub-Plan 1: Asset Metadata & Configuration

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: None
**Estimated Time**: 2-3 hours

---

## Context Required

### Files to Review

**File**: `robinhood-offramp/lib/robinhood-asset-addresses.ts` (lines 23-296)

- **Purpose**: Existing asset-to-wallet address mapping
- **Critical**: Lines 23-89 contain all 32 assets with addresses
- **Critical**: Lines 272-296 contain `buildAssetAddressMapping()` function
- **What to understand**: Current data structure, network mappings, asset symbols

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts` (lines 1-50)

- **Purpose**: Understand supported networks and existing types
- **Critical**: Network definitions and type exports
- **What to understand**: How assets relate to networks

**File**: `robinhood-offramp/types/robinhood.d.ts`

- **Purpose**: Current type definitions
- **What to understand**: Existing type structure to extend

### Understanding Required

1. **Asset Structure**: How assets are currently mapped to addresses
2. **Network Compatibility**: Which assets work on which networks
3. **Supported vs Unsupported**: 32 total assets, but only 27 on supported networks
4. **Type System**: TypeScript types for type safety

---

## Objectives

1. **Create Comprehensive Asset Metadata Structure**

   - Display names, symbols, descriptions for all assets
   - Network information for each asset
   - Icon references (SVG or image URLs)
   - Asset categorization for better UX

2. **Maintain Single Source of Truth**

   - Centralized metadata file
   - Integrates with existing `ROBINHOOD_ASSET_ADDRESSES`
   - Versioned and maintainable

3. **Support Future Scalability**

   - Easy to add new assets
   - Easy to update metadata
   - Clear documentation

4. **Enable UI Components**
   - Provide all data needed for asset selector
   - Support search/filter functionality
   - Enable rich asset displays

---

## Precise Implementation Steps

### Step 1: Create Asset Metadata Type Definitions

**File**: `robinhood-offramp/types/robinhood.d.ts`

**Action**: Add new type definitions for asset metadata

**Code**:

```typescript
// Add to existing robinhood.d.ts file

/**
 * Asset category for grouping in UI
 */
export type AssetCategory =
  | "layer1" // Bitcoin, Ethereum, etc.
  | "layer2" // Polygon, Optimism, Arbitrum
  | "stablecoin" // USDC, USDT, DAI
  | "defi" // AAVE, UNI, LINK, etc.
  | "meme" // DOGE, SHIB
  | "other";

/**
 * Display metadata for a crypto asset
 */
export interface AssetMetadata {
  /** Asset symbol (e.g., 'ETH', 'BTC') */
  symbol: string;

  /** Full display name (e.g., 'Ethereum', 'Bitcoin') */
  name: string;

  /** Brief description for tooltips */
  description: string;

  /** Network the asset operates on */
  network: RobinhoodNetwork;

  /** Category for UI grouping */
  category: AssetCategory;

  /** Icon reference (filename or URL) */
  icon: string;

  /** Whether this asset is currently enabled for donations */
  enabled: boolean;

  /** Sort order for display (lower = higher priority) */
  sortOrder: number;

  /** Popular assets to show first */
  isPopular?: boolean;
}

/**
 * Complete asset configuration including metadata and wallet address
 */
export interface AssetConfig extends AssetMetadata {
  /** Destination wallet address for this asset */
  walletAddress: string;
}
```

**Validation**:

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 2: Create Asset Metadata Configuration File

**File**: `robinhood-offramp/lib/robinhood-asset-metadata.ts` (NEW)

**Action**: Create comprehensive asset metadata

**Code**:

```typescript
import {
  AssetMetadata,
  AssetCategory,
  RobinhoodNetwork,
} from "@/types/robinhood";

/**
 * Display metadata for all supported Robinhood Connect assets
 *
 * This is the single source of truth for asset display information.
 * Update this file when adding new assets or changing metadata.
 *
 * Last updated: October 22, 2025
 */
export const ASSET_METADATA: Record<string, AssetMetadata> = {
  // LAYER 1 BLOCKCHAINS
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    description: "The original cryptocurrency and store of value",
    network: "BITCOIN",
    category: "layer1",
    icon: "btc.svg",
    enabled: true,
    sortOrder: 1,
    isPopular: true,
  },

  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    description: "Smart contract platform and cryptocurrency",
    network: "ETHEREUM",
    category: "layer1",
    icon: "eth.svg",
    enabled: true,
    sortOrder: 2,
    isPopular: true,
  },

  SOL: {
    symbol: "SOL",
    name: "Solana",
    description: "High-performance blockchain for dApps",
    network: "SOLANA",
    category: "layer1",
    icon: "sol.svg",
    enabled: true,
    sortOrder: 3,
    isPopular: true,
  },

  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    description: "Fast, low-cost blockchain platform",
    network: "AVALANCHE",
    category: "layer1",
    icon: "avax.svg",
    enabled: true,
    sortOrder: 10,
  },

  // LAYER 2 SOLUTIONS
  MATIC: {
    symbol: "MATIC",
    name: "Polygon",
    description: "Ethereum scaling solution",
    network: "POLYGON",
    category: "layer2",
    icon: "matic.svg",
    enabled: true,
    sortOrder: 11,
  },

  // STABLECOINS
  "USDC-ETHEREUM": {
    symbol: "USDC",
    name: "USD Coin (Ethereum)",
    description: "US Dollar stablecoin on Ethereum",
    network: "ETHEREUM",
    category: "stablecoin",
    icon: "usdc.svg",
    enabled: true,
    sortOrder: 4,
    isPopular: true,
  },

  "USDC-POLYGON": {
    symbol: "USDC",
    name: "USD Coin (Polygon)",
    description: "US Dollar stablecoin on Polygon",
    network: "POLYGON",
    category: "stablecoin",
    icon: "usdc.svg",
    enabled: true,
    sortOrder: 5,
  },

  "USDC-SOLANA": {
    symbol: "USDC",
    name: "USD Coin (Solana)",
    description: "US Dollar stablecoin on Solana",
    network: "SOLANA",
    category: "stablecoin",
    icon: "usdc.svg",
    enabled: true,
    sortOrder: 6,
  },

  "USDC-AVALANCHE": {
    symbol: "USDC",
    name: "USD Coin (Avalanche)",
    description: "US Dollar stablecoin on Avalanche",
    network: "AVALANCHE",
    category: "stablecoin",
    icon: "usdc.svg",
    enabled: true,
    sortOrder: 7,
  },

  USDT: {
    symbol: "USDT",
    name: "Tether",
    description: "US Dollar stablecoin",
    network: "ETHEREUM",
    category: "stablecoin",
    icon: "usdt.svg",
    enabled: true,
    sortOrder: 8,
  },

  DAI: {
    symbol: "DAI",
    name: "Dai",
    description: "Decentralized US Dollar stablecoin",
    network: "ETHEREUM",
    category: "stablecoin",
    icon: "dai.svg",
    enabled: true,
    sortOrder: 9,
  },

  // DEFI TOKENS
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    category: "defi",
    icon: "aave.svg",
    enabled: true,
    sortOrder: 20,
  },

  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    description: "Decentralized exchange token",
    network: "ETHEREUM",
    category: "defi",
    icon: "uni.svg",
    enabled: true,
    sortOrder: 21,
  },

  LINK: {
    symbol: "LINK",
    name: "Chainlink",
    description: "Decentralized oracle network",
    network: "ETHEREUM",
    category: "defi",
    icon: "link.svg",
    enabled: true,
    sortOrder: 22,
  },

  COMP: {
    symbol: "COMP",
    name: "Compound",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    category: "defi",
    icon: "comp.svg",
    enabled: true,
    sortOrder: 23,
  },

  // MEME COINS
  DOGE: {
    symbol: "DOGE",
    name: "Dogecoin",
    description: "Original meme cryptocurrency",
    network: "DOGECOIN",
    category: "meme",
    icon: "doge.svg",
    enabled: true,
    sortOrder: 30,
  },

  SHIB: {
    symbol: "SHIB",
    name: "Shiba Inu",
    description: "Ethereum-based meme token",
    network: "ETHEREUM",
    category: "meme",
    icon: "shib.svg",
    enabled: true,
    sortOrder: 31,
  },

  // OTHER TOKENS
  LTC: {
    symbol: "LTC",
    name: "Litecoin",
    description: "Peer-to-peer cryptocurrency",
    network: "LITECOIN",
    category: "layer1",
    icon: "ltc.svg",
    enabled: true,
    sortOrder: 12,
  },

  BCH: {
    symbol: "BCH",
    name: "Bitcoin Cash",
    description: "Bitcoin fork with larger blocks",
    network: "BITCOIN_CASH",
    category: "layer1",
    icon: "bch.svg",
    enabled: true,
    sortOrder: 13,
  },

  // Add remaining assets from ROBINHOOD_ASSET_ADDRESSES...
  // (Continue with all 27+ supported assets)
};

/**
 * Get metadata for a specific asset
 */
export function getAssetMetadata(symbol: string): AssetMetadata | undefined {
  return ASSET_METADATA[symbol];
}

/**
 * Get all enabled assets
 */
export function getEnabledAssets(): AssetMetadata[] {
  return Object.values(ASSET_METADATA).filter((asset) => asset.enabled);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: AssetCategory): AssetMetadata[] {
  return Object.values(ASSET_METADATA)
    .filter((asset) => asset.category === category && asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get popular assets
 */
export function getPopularAssets(): AssetMetadata[] {
  return Object.values(ASSET_METADATA)
    .filter((asset) => asset.isPopular && asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Search assets by name or symbol
 */
export function searchAssets(query: string): AssetMetadata[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(ASSET_METADATA)
    .filter(
      (asset) =>
        asset.enabled &&
        (asset.symbol.toLowerCase().includes(lowercaseQuery) ||
          asset.name.toLowerCase().includes(lowercaseQuery))
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<
  AssetCategory,
  { name: string; description: string }
> = {
  layer1: {
    name: "Layer 1 Blockchains",
    description: "Original blockchain networks",
  },
  layer2: {
    name: "Layer 2 Solutions",
    description: "Scaling solutions for existing blockchains",
  },
  stablecoin: {
    name: "Stablecoins",
    description: "Cryptocurrencies pegged to stable assets",
  },
  defi: {
    name: "DeFi Tokens",
    description: "Decentralized finance protocols",
  },
  meme: {
    name: "Meme Coins",
    description: "Community-driven cryptocurrencies",
  },
  other: {
    name: "Other Assets",
    description: "Additional supported cryptocurrencies",
  },
};
```

**Validation**:

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 3: Create Asset Configuration Helper

**File**: `robinhood-offramp/lib/robinhood-asset-config.ts` (NEW)

**Action**: Combine metadata with wallet addresses

**Code**:

```typescript
import { AssetConfig } from "@/types/robinhood";
import { ASSET_METADATA } from "./robinhood-asset-metadata";
import { ROBINHOOD_ASSET_ADDRESSES } from "./robinhood-asset-addresses";

/**
 * Combine asset metadata with wallet addresses to create complete asset configurations
 *
 * This provides everything needed to display assets and generate URLs.
 */
export function buildAssetConfigs(): AssetConfig[] {
  const configs: AssetConfig[] = [];

  for (const [key, metadata] of Object.entries(ASSET_METADATA)) {
    // Find corresponding wallet address
    const walletAddress = ROBINHOOD_ASSET_ADDRESSES[key];

    if (!walletAddress) {
      console.warn(`No wallet address found for asset: ${key}`);
      continue;
    }

    if (!metadata.enabled) {
      continue;
    }

    configs.push({
      ...metadata,
      walletAddress,
    });
  }

  return configs.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get asset configuration by symbol
 */
export function getAssetConfig(symbol: string): AssetConfig | undefined {
  const metadata = ASSET_METADATA[symbol];
  const walletAddress = ROBINHOOD_ASSET_ADDRESSES[symbol];

  if (!metadata || !walletAddress || !metadata.enabled) {
    return undefined;
  }

  return {
    ...metadata,
    walletAddress,
  };
}

/**
 * Validate that all enabled assets have wallet addresses
 */
export function validateAssetConfiguration(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [key, metadata] of Object.entries(ASSET_METADATA)) {
    if (!metadata.enabled) continue;

    const walletAddress = ROBINHOOD_ASSET_ADDRESSES[key];
    if (!walletAddress) {
      errors.push(
        `Asset ${key} (${metadata.name}) is enabled but has no wallet address`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get asset configuration statistics
 */
export function getAssetStats() {
  const allAssets = Object.values(ASSET_METADATA);
  const enabledAssets = allAssets.filter((a) => a.enabled);
  const assetsByCategory = enabledAssets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allAssets.length,
    enabled: enabledAssets.length,
    disabled: allAssets.length - enabledAssets.length,
    popular: enabledAssets.filter((a) => a.isPopular).length,
    byCategory: assetsByCategory,
  };
}
```

**Validation**:

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 4: Add Validation Script

**File**: `robinhood-offramp/scripts/validate-asset-config.ts` (NEW)

**Action**: Create validation script for asset configuration

**Code**:

```typescript
/**
 * Validation script for asset metadata configuration
 *
 * Run with: npx tsx scripts/validate-asset-config.ts
 */

import {
  validateAssetConfiguration,
  getAssetStats,
  buildAssetConfigs,
} from "../lib/robinhood-asset-config";
import { ASSET_METADATA } from "../lib/robinhood-asset-metadata";
import { ROBINHOOD_ASSET_ADDRESSES } from "../lib/robinhood-asset-addresses";

console.log("🔍 Validating Asset Configuration...\n");

// Step 1: Validate configuration
const validation = validateAssetConfiguration();

if (!validation.valid) {
  console.error("❌ Validation Failed!\n");
  validation.errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log("✅ All enabled assets have wallet addresses\n");

// Step 2: Show statistics
const stats = getAssetStats();
console.log("📊 Asset Statistics:");
console.log(`  Total assets: ${stats.total}`);
console.log(`  Enabled: ${stats.enabled}`);
console.log(`  Disabled: ${stats.disabled}`);
console.log(`  Popular: ${stats.popular}`);
console.log(`\n  By Category:`);
Object.entries(stats.byCategory).forEach(([category, count]) => {
  console.log(`    ${category}: ${count}`);
});

// Step 3: Build and validate asset configs
console.log("\n🔨 Building Asset Configurations...");
const configs = buildAssetConfigs();
console.log(`✅ Successfully built ${configs.length} asset configurations\n`);

// Step 4: Check for missing icons
console.log("🖼️  Checking Icon References...");
const missingIcons: string[] = [];
configs.forEach((config) => {
  // This is a placeholder - actual file check would require fs
  if (!config.icon) {
    missingIcons.push(config.symbol);
  }
});

if (missingIcons.length > 0) {
  console.warn("⚠️  Assets without icons:", missingIcons.join(", "));
} else {
  console.log("✅ All assets have icon references\n");
}

// Step 5: Summary
console.log("━".repeat(50));
console.log("✅ Asset Configuration Validation Complete!");
console.log("━".repeat(50));
```

**Validation**:

```bash
cd robinhood-offramp
npx tsx scripts/validate-asset-config.ts
```

**Expected Output**:

```
✅ All enabled assets have wallet addresses
✅ Successfully built 27+ asset configurations
```

---

### Step 5: Update Package Dependencies (if needed)

**File**: `robinhood-offramp/package.json`

**Action**: Ensure `tsx` is available for TypeScript script execution

**Code**:

```bash
cd robinhood-offramp
npm install --save-dev tsx
```

**Validation**:

```bash
npm list tsx
```

**Expected Output**: Shows tsx version installed

---

### Step 6: Complete Asset Metadata for All 27+ Assets

**File**: `robinhood-offramp/lib/robinhood-asset-metadata.ts`

**Action**: Add complete metadata for ALL remaining assets from `ROBINHOOD_ASSET_ADDRESSES`

**Reference**: Use `robinhood-asset-addresses.ts` lines 23-89 to ensure all assets are included

**Validation**: Run validation script

```bash
npx tsx scripts/validate-asset-config.ts
```

**Expected**: All enabled assets validated successfully

---

## Deliverables Checklist

- [ ] TypeScript types defined in `types/robinhood.d.ts`

  - [ ] `AssetCategory` type
  - [ ] `AssetMetadata` interface
  - [ ] `AssetConfig` interface

- [ ] Asset metadata file created: `lib/robinhood-asset-metadata.ts`

  - [ ] All 27+ supported assets have complete metadata
  - [ ] Helper functions: `getAssetMetadata`, `getEnabledAssets`, `searchAssets`
  - [ ] Category information defined

- [ ] Asset configuration helper created: `lib/robinhood-asset-config.ts`

  - [ ] `buildAssetConfigs()` function
  - [ ] `getAssetConfig()` function
  - [ ] `validateAssetConfiguration()` function
  - [ ] `getAssetStats()` function

- [ ] Validation script created: `scripts/validate-asset-config.ts`

  - [ ] Runs without errors
  - [ ] Shows correct asset counts
  - [ ] Validates wallet address mapping

- [ ] All TypeScript compilation succeeds
- [ ] Documentation comments complete

---

## Validation Steps

### 1. TypeScript Compilation Check

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors

### 2. Run Validation Script

```bash
npx tsx scripts/validate-asset-config.ts
```

**Expected Output**:

```
✅ All enabled assets have wallet addresses
✅ Successfully built 27+ asset configurations
✅ Asset Configuration Validation Complete!
```

### 3. Test Asset Retrieval

```typescript
// In Node REPL or test file
import { getAssetConfig } from "./lib/robinhood-asset-config";

const eth = getAssetConfig("ETH");
console.log(eth);
// Should show: { symbol: 'ETH', name: 'Ethereum', walletAddress: '0x...', ... }
```

### 4. Test Search Functionality

```typescript
import { searchAssets } from "./lib/robinhood-asset-metadata";

const results = searchAssets("coin");
console.log(results.map((a) => a.name));
// Should show: ['Bitcoin', 'USD Coin (Ethereum)', 'Dogecoin', ...]
```

### 5. Verify Asset Count

```bash
npx tsx -e "import { getAssetStats } from './lib/robinhood-asset-config'; console.log(getAssetStats())"
```

**Expected**: Shows 27+ enabled assets

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure new metadata doesn't break existing functionality

### Commands

```bash
cd robinhood-offramp

# 1. TypeScript compilation
npx tsc --noEmit

# 2. Check existing imports still work
npx tsx -e "import { ROBINHOOD_ASSET_ADDRESSES } from './lib/robinhood-asset-addresses'; console.log('✅ Imports OK')"

# 3. Verify dev server starts
npm run dev
```

### Success Criteria

- ✅ TypeScript compiles with no errors
- ✅ Existing imports unaffected
- ✅ Dev server starts successfully
- ✅ No runtime errors in console
- ✅ Existing pages still load

### If Checkpoint Fails

1. **TypeScript Errors**:

   - Review type definitions
   - Check for circular dependencies
   - Verify import paths

2. **Import Errors**:

   - Ensure no breaking changes to existing exports
   - Check file paths are correct

3. **Runtime Errors**:
   - Review code for syntax errors
   - Check for missing dependencies

### Rollback Procedure

If critical issues:

```bash
git checkout robinhood-offramp/lib/robinhood-asset-metadata.ts
git checkout robinhood-offramp/lib/robinhood-asset-config.ts
git checkout robinhood-offramp/types/robinhood.d.ts
git checkout robinhood-offramp/scripts/validate-asset-config.ts
```

---

## Common Issues and Solutions

### Issue 1: TypeScript Errors with New Types

**Symptom**: `Cannot find name 'AssetMetadata'` or similar

**Solution**:

- Ensure types are exported in `types/robinhood.d.ts`
- Check import paths use correct aliases (`@/types/robinhood`)
- Restart TypeScript server in editor

### Issue 2: Asset Count Mismatch

**Symptom**: Validation shows fewer than 27 assets

**Solution**:

- Cross-reference with `ROBINHOOD_ASSET_ADDRESSES`
- Ensure all assets have `enabled: true`
- Check for typos in asset symbols

### Issue 3: Missing Wallet Addresses

**Symptom**: Validation shows assets without wallet addresses

**Solution**:

- Verify asset symbol keys match exactly between files
- Check `ROBINHOOD_ASSET_ADDRESSES` has entries
- Add missing addresses if needed

### Issue 4: Icon References Not Found

**Symptom**: Warnings about missing icons

**Solution**:

- This is expected at this stage
- Icons will be added in Sub-Plan 2
- Can use placeholder for now

---

## Integration Points

### Provides to Sub-Plan 2 (Asset Selector UI)

- ✅ Complete asset metadata with display information
- ✅ Helper functions for filtering and searching
- ✅ Category definitions for grouping
- ✅ Icon references for visual display

### Provides to Sub-Plan 3 (Dashboard Integration)

- ✅ Asset configuration with wallet addresses
- ✅ Validation functions
- ✅ Asset statistics

### Provides to Sub-Plan 4 (URL Builder)

- ✅ Complete asset-to-network mapping
- ✅ Wallet addresses for URL generation
- ✅ Asset validation

---

## Next Steps

After completing this sub-plan:

1. ✅ **Verify all deliverables** complete
2. ✅ **Run all validation steps** successfully
3. ✅ **Commit changes** with descriptive message
4. ⏭️ **Proceed to Sub-Plan 2**: Asset Selection UI Component
5. 📝 **Create completion log**: `implementation-logs/YYYYMMDD-HHMM-SP1-COMPLETE.md`

---

## Time Breakdown

- Step 1 (Types): 20 minutes
- Step 2 (Metadata): 60 minutes
- Step 3 (Config Helper): 30 minutes
- Step 4 (Validation Script): 20 minutes
- Step 5 (Dependencies): 5 minutes
- Step 6 (Complete All Assets): 30 minutes
- Testing & Validation: 15 minutes

**Total**: ~3 hours

---

**Status**: ⏸️ Ready to begin
**Last Updated**: October 22, 2025
