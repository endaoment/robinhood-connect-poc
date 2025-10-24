# Sub-Plan 9: Backend Alignment Refactor - Token Organization

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 4 (ID System Consolidation)
**Estimated Time**: 4-6 hours

---

## Context Required

### Current State Analysis

**Problem**: The POC has sprawling, duplicated token/asset configuration across 6+ files:

```
robinhood-onramp/lib/
├── robinhood-api.ts               (28 lines - minimal, just errors)
├── robinhood-asset-addresses.ts   (294 lines - 32 assets with addresses + memos)
├── robinhood-asset-metadata.ts    (397 lines - 27 assets with display metadata)
├── robinhood-asset-config.ts      (100 lines - combines above two)
├── robinhood-url-builder.ts       (416 lines - network lists + URL builders)
├── network-addresses.ts           (297 lines - DUPLICATES addresses by network)
└── error-messages.ts              (69 lines)
```

**Duplication Issues**:

1. **Addresses repeated 2x**: `robinhood-asset-addresses.ts` AND `network-addresses.ts`
2. **Network names repeated 3x**: URL builder, asset addresses, network addresses
3. **Asset metadata split**: Addresses in one file, metadata in another
4. **No single source of truth**: Update in 3 places to add one asset
5. **Inconsistent organization**: Asset-first vs network-first views

### Gold Standard: Endaoment Backend Token Structure

**Reference**: `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/tokens/`

**Entity Model** (from `data-access/src/lib/entities/token/token.entity.ts`):

```typescript
// Base Token Entity
abstract class Token {
  id: number;
  symbol: string; // 'BTC', 'ETH', 'SOL'
  name: string; // 'Bitcoin', 'Ethereum'
  decimals: number;
  logoUrl: string;
  enabled: boolean;
  featured: boolean;
  popularity: number;
  ucid: string | null; // Unified Cryptoasset ID
}

// EVM Token (Ethereum, Polygon, etc.)
class EvmToken extends Token {
  chainId: number; // 1 = Ethereum, 137 = Polygon
  contractAddress: string; // 0x...
}

// Non-EVM Token (Bitcoin, Solana, etc.)
class NonEvmToken extends Token {
  nonEvmIdentifier: string; // 'BTC', 'SOL', etc.
  tokenInfoJson: Record<string, any> | null;
}
```

**OTC Token Model** (from `tokens/src/lib/otc-token.ts`):

```typescript
interface IOtcToken {
  address: string         // Deposit address
  symbol: string          // 'BTC', 'ETH'
  name: string
  logoUrl: string | null
  memo: string | null     // For XRP, XLM, HBAR, etc.
}

// Example: BTC OTC token
{
  address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC',
  symbol: 'BTC',
  name: 'Bitcoin',
  memo: null,
  logoUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
}
```

**Key Learnings from Backend**:

1. ✅ **Single Token Entry**: All metadata + address in one place
2. ✅ **Type Inheritance**: EvmToken vs NonEvmToken (chainId vs identifier)
3. ✅ **OTC Addresses**: Separate system for deposit addresses (not on-chain)
4. ✅ **Enabled Flag**: Turn assets on/off without deleting
5. ✅ **Featured/Popular**: UI hints for prominence
6. ✅ **UCID**: Cross-platform identifier for pricing APIs
7. ✅ **Memo Support**: First-class for XRP, XLM, HBAR

### Files to Review

**Backend Gold Standard**:

- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/tokens/src/lib/otc-token.ts` (lines 1-649)
- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/data-access/src/lib/entities/token/token.entity.ts` (lines 1-159)
- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/tokens/src/lib/dtos/token-listing.dto.ts` (lines 1-265)

**POC Current State**:

- `robinhood-onramp/lib/robinhood-asset-addresses.ts` (lines 1-294)
- `robinhood-onramp/lib/robinhood-asset-metadata.ts` (lines 1-397)
- `robinhood-onramp/lib/robinhood-asset-config.ts` (lines 1-100)
- `robinhood-onramp/lib/network-addresses.ts` (lines 1-297)
- `robinhood-onramp/lib/robinhood-url-builder.ts` (lines 1-416)
- `robinhood-onramp/types/robinhood.d.ts` (lines 1-180)

---

## Objectives

1. **Consolidate Robinhood libs** into single directory: `lib/robinhood/`
2. **Eliminate address duplication** - single source of truth for deposit addresses
3. **Align with backend patterns** - similar structure to `libs/api/tokens`
4. **Create unified asset registry** - one entry per asset with all metadata + address
5. **Preserve POC functionality** - all existing code continues to work
6. **Type-safe organization** - leverage EvmToken vs NonEvmToken patterns
7. **Enable future backend integration** - easy to migrate to database later

---

## Proposed New Structure

### Directory Layout

```
robinhood-onramp/
├── lib/
│   ├── robinhood/                      # NEW: All Robinhood code here
│   │   ├── index.ts                    # Public API exports
│   │   ├── types.ts                    # Robinhood-specific types
│   │   ├── constants/
│   │   │   ├── networks.ts             # Network definitions only
│   │   │   └── errors.ts               # Error messages/codes
│   │   ├── assets/
│   │   │   ├── registry.ts             # SINGLE SOURCE: All assets + addresses
│   │   │   ├── evm-assets.ts           # EVM asset definitions
│   │   │   ├── non-evm-assets.ts       # Non-EVM asset definitions
│   │   │   └── asset-helpers.ts        # Lookup/filter functions
│   │   ├── url-builder/
│   │   │   ├── daffy-style.ts          # buildDaffyStyleOnrampUrl()
│   │   │   ├── validation.ts           # Address/network validators
│   │   │   └── url-helpers.ts          # Utility functions
│   │   └── api/
│   │       └── robinhood-client.ts     # API integration (future)
│   ├── utils.ts                        # Generic utilities (keep)
│   ├── security-utils.ts               # Security utilities (keep)
│   ├── performance-utils.ts            # Performance utilities (keep)
│   └── error-messages.ts               # DELETE (move to robinhood/constants/errors.ts)
├── types/
│   └── robinhood.d.ts                  # UPDATE: Import from lib/robinhood/types.ts
└── ...
```

### File Deletions

```
DELETE: lib/robinhood-api.ts                 # Move to robinhood/api/
DELETE: lib/robinhood-asset-addresses.ts     # Merge into registry.ts
DELETE: lib/robinhood-asset-metadata.ts      # Merge into registry.ts
DELETE: lib/robinhood-asset-config.ts        # Merge into registry.ts
DELETE: lib/robinhood-url-builder.ts         # Split into url-builder/
DELETE: lib/network-addresses.ts             # DUPLICATE - delete entirely
DELETE: lib/error-messages.ts                # Move to robinhood/constants/errors.ts
```

---

## Precise Implementation Steps

### Step 1: Create New Directory Structure

**Action**: Create the new `lib/robinhood/` directory tree

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Create directory structure
mkdir -p lib/robinhood/constants
mkdir -p lib/robinhood/assets
mkdir -p lib/robinhood/url-builder
mkdir -p lib/robinhood/api

# Create placeholder files
touch lib/robinhood/index.ts
touch lib/robinhood/types.ts
touch lib/robinhood/constants/networks.ts
touch lib/robinhood/constants/errors.ts
touch lib/robinhood/assets/registry.ts
touch lib/robinhood/assets/evm-assets.ts
touch lib/robinhood/assets/non-evm-assets.ts
touch lib/robinhood/assets/asset-helpers.ts
touch lib/robinhood/url-builder/daffy-style.ts
touch lib/robinhood/url-builder/validation.ts
touch lib/robinhood/url-builder/url-helpers.ts
touch lib/robinhood/api/robinhood-client.ts
```

**Validation**:

```bash
tree lib/robinhood
```

**Expected Output**:

```
lib/robinhood/
├── api
│   └── robinhood-client.ts
├── assets
│   ├── asset-helpers.ts
│   ├── evm-assets.ts
│   ├── non-evm-assets.ts
│   └── registry.ts
├── constants
│   ├── errors.ts
│   └── networks.ts
├── index.ts
├── types.ts
└── url-builder
    ├── daffy-style.ts
    ├── url-helpers.ts
    └── validation.ts
```

### Step 2: Define Core Types (Aligned with Backend)

**File**: `lib/robinhood/types.ts`

**Action**: Create type definitions matching backend token structure

**Code**:

```typescript
/**
 * Robinhood Connect Types - Aligned with Endaoment Backend Token Structure
 *
 * References:
 * - Backend: libs/api/data-access/src/lib/entities/token/token.entity.ts
 * - Backend: libs/api/tokens/src/lib/otc-token.ts
 */

/**
 * Supported blockchain networks on Robinhood Connect
 */
export type RobinhoodNetwork =
  | "ARBITRUM"
  | "AVALANCHE"
  | "BASE"
  | "BITCOIN"
  | "BITCOIN_CASH"
  | "CARDANO"
  | "DOGECOIN"
  | "ETHEREUM"
  | "ETHEREUM_CLASSIC"
  | "HEDERA"
  | "LITECOIN"
  | "OPTIMISM"
  | "POLYGON"
  | "SOLANA"
  | "STELLAR"
  | "SUI"
  | "TEZOS"
  | "TONCOIN"
  | "XRP"
  | "ZORA";

/**
 * Asset categories for UI grouping
 */
export type AssetCategory =
  | "layer1"
  | "layer2"
  | "stablecoin"
  | "defi"
  | "meme"
  | "other";

/**
 * Token type discriminator (matches backend)
 */
export enum RobinhoodTokenType {
  EvmToken = "EvmToken",
  NonEvmToken = "NonEvmToken",
}

/**
 * Base interface for all Robinhood transferable assets
 * Mirrors backend Token entity
 */
export interface RobinhoodBaseAsset {
  /** Unique symbol (e.g., 'BTC', 'ETH', 'SOL') */
  symbol: string;

  /** Full display name (e.g., 'Bitcoin', 'Ethereum') */
  name: string;

  /** Brief description for tooltips/UI */
  description: string;

  /** Icon filename (e.g., 'btc.svg') */
  icon: string;

  /** Decimals for display formatting */
  decimals: number;

  /** Whether asset is enabled for transfers */
  enabled: boolean;

  /** Featured/pinned in UI */
  featured?: boolean;

  /** Popularity score for sorting (higher = more popular) */
  popularity: number;

  /** Sort order for display */
  sortOrder: number;

  /** UI category */
  category: AssetCategory;

  /** Token type discriminator */
  type: RobinhoodTokenType;
}

/**
 * EVM-based asset (Ethereum, Polygon, Arbitrum, etc.)
 * Mirrors backend EvmToken entity
 */
export interface RobinhoodEvmAsset extends RobinhoodBaseAsset {
  type: RobinhoodTokenType.EvmToken;

  /** EVM Chain ID (1 = Ethereum, 137 = Polygon, etc.) */
  chainId: number;

  /** Blockchain network name */
  network: Extract<
    RobinhoodNetwork,
    | "ETHEREUM"
    | "POLYGON"
    | "ARBITRUM"
    | "OPTIMISM"
    | "BASE"
    | "ZORA"
    | "AVALANCHE"
    | "ETHEREUM_CLASSIC"
  >;

  /** ERC-20 contract address (or native asset address) */
  contractAddress?: string;
}

/**
 * Non-EVM asset (Bitcoin, Solana, Cardano, etc.)
 * Mirrors backend NonEvmToken entity
 */
export interface RobinhoodNonEvmAsset extends RobinhoodBaseAsset {
  type: RobinhoodTokenType.NonEvmToken;

  /** Blockchain network name */
  network: Exclude<
    RobinhoodNetwork,
    | "ETHEREUM"
    | "POLYGON"
    | "ARBITRUM"
    | "OPTIMISM"
    | "BASE"
    | "ZORA"
    | "AVALANCHE"
    | "ETHEREUM_CLASSIC"
  >;

  /** Non-EVM identifier (often same as symbol) */
  nonEvmIdentifier: string;
}

/**
 * Union type for all assets
 */
export type RobinhoodAsset = RobinhoodEvmAsset | RobinhoodNonEvmAsset;

/**
 * Deposit address configuration for an asset
 * Mirrors backend IOtcToken interface
 */
export interface RobinhoodDepositAddress {
  /** Destination wallet address (Coinbase Prime Trading Balance) */
  address: string;

  /** Optional memo/tag for networks that require it (XRP, XLM, HBAR) */
  memo?: string;

  /** Notes about this address (e.g., 'Fallback address') */
  note?: string;
}

/**
 * Complete asset configuration with deposit address
 * This is what's used for generating Robinhood Connect URLs
 */
export interface RobinhoodAssetConfig extends RobinhoodAsset {
  /** Deposit address configuration */
  depositAddress: RobinhoodDepositAddress;
}

/**
 * Daffy-style onramp URL parameters
 */
export interface DaffyStyleOnrampParams {
  asset: string;
  network: RobinhoodNetwork;
  walletAddress: string;
  redirectUrl?: string;
  connectId?: string;
}

/**
 * Daffy-style onramp URL result
 */
export interface DaffyStyleOnrampUrlResult {
  url: string;
  connectId: string;
  params: {
    asset: string;
    network: string;
    walletAddress: string;
  };
}
```

**Validation**: TypeScript should compile with no errors

### Step 3: Define Network Constants

**File**: `lib/robinhood/constants/networks.ts`

**Action**: Centralize network definitions

**Code**:

```typescript
import type { RobinhoodNetwork } from "../types";

/**
 * All networks supported by Robinhood Connect
 * Source: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */
export const ALL_ROBINHOOD_NETWORKS: readonly RobinhoodNetwork[] = [
  "ARBITRUM",
  "AVALANCHE",
  "BASE",
  "BITCOIN",
  "BITCOIN_CASH",
  "CARDANO",
  "DOGECOIN",
  "ETHEREUM",
  "ETHEREUM_CLASSIC",
  "HEDERA",
  "LITECOIN",
  "OPTIMISM",
  "POLYGON",
  "SOLANA",
  "STELLAR",
  "SUI",
  "TEZOS",
  "TONCOIN",
  "XRP",
  "ZORA",
] as const;

/**
 * Networks officially supported by Robinhood Connect onramp API
 * (Subset of ALL_ROBINHOOD_NETWORKS confirmed via API documentation)
 */
export const ROBINHOOD_CONNECT_SUPPORTED_NETWORKS: readonly RobinhoodNetwork[] =
  [
    "AVALANCHE",
    "BITCOIN",
    "BITCOIN_CASH",
    "DOGECOIN",
    "ETHEREUM",
    "ETHEREUM_CLASSIC",
    "LITECOIN",
    "POLYGON",
    "SOLANA",
    "STELLAR",
    "TEZOS",
  ] as const;

/**
 * Networks that require a memo/tag field for deposits
 */
export const NETWORKS_REQUIRING_MEMO: readonly RobinhoodNetwork[] = [
  "STELLAR", // XLM - memo required
  "XRP", // XRP - destination tag required
  "HEDERA", // HBAR - memo required
] as const;

/**
 * EVM-compatible networks (use chainId + 0x addresses)
 */
export const EVM_NETWORKS: readonly RobinhoodNetwork[] = [
  "ETHEREUM",
  "POLYGON",
  "ARBITRUM",
  "OPTIMISM",
  "BASE",
  "ZORA",
  "AVALANCHE",
  "ETHEREUM_CLASSIC",
] as const;

/**
 * Chain ID mapping for EVM networks
 * Source: https://chainlist.org/
 */
export const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  ZORA: 7777777,
  AVALANCHE: 43114, // C-Chain
  ETHEREUM_CLASSIC: 61,
} as const;

/**
 * Check if a network is EVM-compatible
 */
export function isEvmNetwork(network: RobinhoodNetwork): boolean {
  return EVM_NETWORKS.includes(network);
}

/**
 * Check if a network requires a memo
 */
export function requiresMemo(network: RobinhoodNetwork): boolean {
  return NETWORKS_REQUIRING_MEMO.includes(network);
}

/**
 * Get chain ID for EVM network
 */
export function getChainId(network: RobinhoodNetwork): number | undefined {
  return NETWORK_TO_CHAIN_ID[network];
}
```

### Step 4: Define EVM Assets

**File**: `lib/robinhood/assets/evm-assets.ts`

**Action**: Define all EVM-based assets with complete metadata

**Code**:

```typescript
import {
  RobinhoodEvmAsset,
  RobinhoodTokenType,
  RobinhoodDepositAddress,
} from "../types";

/**
 * EVM Asset Definitions
 * Includes: Ethereum L1, L2s (Polygon, Arbitrum, etc.), and all ERC-20 tokens
 */

/**
 * Deposit addresses for EVM assets
 * Source: Coinbase Prime Trading Balance wallets
 */
export const EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  // Native assets
  ETH: {
    address: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
  },
  MATIC: {
    address: "0x11362ec5cc119448225abbbb1c9c67e22e776cdd",
  },
  ARB: {
    address: "0x6931a51e15763C4d8da468cbF7C51323d96F2e80",
  },
  OP: {
    address: "0xE006aBC90950DB9a81A3812502D0b031FaAf28D8",
  },
  ZORA: {
    address: "0x407506929b5C58992987609539a1D424f2305Cc3",
  },
  AVAX: {
    address: "0x2063115a37f55c19cA60b9d1eca2378De00CD79b",
  },
  ETC: {
    address: "0x269285683a921dbce6fcb21513b06998f8fbbc99",
  },

  // Stablecoins
  USDC: {
    address: "0xd71a079cb64480334ffb400f017a0dde94f553dd",
  },

  // DeFi tokens
  AAVE: {
    address: "0x0788702c7d70914f34b82fb6ad0b405263a00486",
  },
  LINK: {
    address: "0xcf26c0f23e566b42251bc0cf680c8999def1d7f0",
  },
  COMP: {
    address: "0x944bff154f0486b6c834c5607978b45ffc264902",
  },
  CRV: {
    address: "0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d",
  },
  UNI: {
    address: "0x396b24e9137befef326af9fdba92d95dd124d5d4",
  },
  ONDO: {
    address: "0x894f85323110a0a8883b22b18f26864882c3c63e",
  },

  // Meme coins
  SHIB: {
    address: "0x263dcd3e749b1f00c3998b5a0f14e3255658803b",
  },
  PEPE: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  FLOKI: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  TRUMP: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  VIRTUAL: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  WLFI: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
};

/**
 * EVM Asset Registry
 */
export const EVM_ASSETS: Record<string, RobinhoodEvmAsset> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    description: "Smart contract platform and cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    category: "layer1",
    icon: "eth.svg",
    decimals: 18,
    enabled: true,
    featured: true,
    popularity: 100,
    sortOrder: 2,
    type: RobinhoodTokenType.EvmToken,
  },

  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    description: "Fast, low-cost blockchain platform",
    network: "AVALANCHE",
    chainId: 43114,
    category: "layer1",
    icon: "avax.svg",
    decimals: 18,
    enabled: true,
    popularity: 70,
    sortOrder: 10,
    type: RobinhoodTokenType.EvmToken,
  },

  ETC: {
    symbol: "ETC",
    name: "Ethereum Classic",
    description: "Original Ethereum blockchain",
    network: "ETHEREUM_CLASSIC",
    chainId: 61,
    category: "layer1",
    icon: "etc.svg",
    decimals: 18,
    enabled: true,
    popularity: 40,
    sortOrder: 14,
    type: RobinhoodTokenType.EvmToken,
  },

  // Layer 2 - Currently disabled (no wallet addresses configured)
  MATIC: {
    symbol: "MATIC",
    name: "Polygon",
    description: "Ethereum scaling solution",
    network: "POLYGON",
    chainId: 137,
    category: "layer2",
    icon: "matic.svg",
    decimals: 18,
    enabled: false, // Disabled: No Robinhood Connect support
    popularity: 75,
    sortOrder: 11,
    type: RobinhoodTokenType.EvmToken,
  },

  // Stablecoins
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    description: "US Dollar stablecoin",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    category: "stablecoin",
    icon: "usdc.svg",
    decimals: 6,
    enabled: true,
    featured: true,
    popularity: 95,
    sortOrder: 4,
    type: RobinhoodTokenType.EvmToken,
  },

  // DeFi Tokens
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    category: "defi",
    icon: "aave.svg",
    decimals: 18,
    enabled: true,
    popularity: 60,
    sortOrder: 20,
    type: RobinhoodTokenType.EvmToken,
  },

  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    description: "Decentralized exchange token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    category: "defi",
    icon: "uni.svg",
    decimals: 18,
    enabled: true,
    popularity: 65,
    sortOrder: 21,
    type: RobinhoodTokenType.EvmToken,
  },

  LINK: {
    symbol: "LINK",
    name: "Chainlink",
    description: "Decentralized oracle network",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    category: "defi",
    icon: "link.svg",
    decimals: 18,
    enabled: true,
    popularity: 68,
    sortOrder: 22,
    type: RobinhoodTokenType.EvmToken,
  },

  COMP: {
    symbol: "COMP",
    name: "Compound",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    category: "defi",
    icon: "comp.svg",
    decimals: 18,
    enabled: true,
    popularity: 55,
    sortOrder: 23,
    type: RobinhoodTokenType.EvmToken,
  },

  CRV: {
    symbol: "CRV",
    name: "Curve DAO",
    description: "DeFi stablecoin exchange token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    category: "defi",
    icon: "crv.svg",
    decimals: 18,
    enabled: true,
    popularity: 50,
    sortOrder: 24,
    type: RobinhoodTokenType.EvmToken,
  },

  ONDO: {
    symbol: "ONDO",
    name: "Ondo",
    description: "Institutional-grade DeFi protocol",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3",
    category: "defi",
    icon: "ondo.svg",
    decimals: 18,
    enabled: true,
    popularity: 45,
    sortOrder: 25,
    type: RobinhoodTokenType.EvmToken,
  },

  // Meme Coins
  SHIB: {
    symbol: "SHIB",
    name: "Shiba Inu",
    description: "Ethereum-based meme token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    category: "meme",
    icon: "shib.svg",
    decimals: 18,
    enabled: true,
    popularity: 72,
    sortOrder: 31,
    type: RobinhoodTokenType.EvmToken,
  },

  PEPE: {
    symbol: "PEPE",
    name: "Pepecoin",
    description: "Internet meme cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    category: "meme",
    icon: "pepe.svg",
    decimals: 18,
    enabled: true,
    popularity: 60,
    sortOrder: 32,
    type: RobinhoodTokenType.EvmToken,
  },

  FLOKI: {
    symbol: "FLOKI",
    name: "Floki",
    description: "Community-driven meme token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E",
    category: "meme",
    icon: "floki.svg",
    decimals: 9,
    enabled: true,
    popularity: 55,
    sortOrder: 33,
    type: RobinhoodTokenType.EvmToken,
  },

  // Other Tokens
  TRUMP: {
    symbol: "TRUMP",
    name: "OFFICIAL TRUMP",
    description: "Political-themed cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "trump.svg",
    decimals: 18,
    enabled: true,
    popularity: 50,
    sortOrder: 40,
    type: RobinhoodTokenType.EvmToken,
  },

  VIRTUAL: {
    symbol: "VIRTUAL",
    name: "Virtuals Protocol",
    description: "Virtual reality protocol token",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "virtual.svg",
    decimals: 18,
    enabled: true,
    popularity: 45,
    sortOrder: 41,
    type: RobinhoodTokenType.EvmToken,
  },

  WLFI: {
    symbol: "WLFI",
    name: "World Liberty Financial",
    description: "DeFi financial protocol",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "wlfi.svg",
    decimals: 18,
    enabled: true,
    popularity: 40,
    sortOrder: 42,
    type: RobinhoodTokenType.EvmToken,
  },
};
```

### Step 5: Define Non-EVM Assets

**File**: `lib/robinhood/assets/non-evm-assets.ts`

**Action**: Define all non-EVM assets with complete metadata

**Code**:

```typescript
import {
  RobinhoodNonEvmAsset,
  RobinhoodTokenType,
  RobinhoodDepositAddress,
} from "../types";

/**
 * Non-EVM Asset Definitions
 * Includes: Bitcoin, Solana, Cardano, and other non-Ethereum chains
 */

/**
 * Deposit addresses for non-EVM assets
 * Source: Coinbase Prime Trading Balance wallets
 */
export const NON_EVM_DEPOSIT_ADDRESSES: Record<
  string,
  RobinhoodDepositAddress
> = {
  // Bitcoin-like chains
  BTC: {
    address: "3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC",
  },
  LTC: {
    address: "MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK",
  },
  BCH: {
    address: "qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q",
  },
  DOGE: {
    address: "DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7",
  },

  // Other L1 chains
  SOL: {
    address: "DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1",
  },
  ADA: {
    address: "addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt",
  },
  XTZ: {
    address: "tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV",
  },
  SUI: {
    address:
      "0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2",
  },

  // Networks with memos
  XLM: {
    address: "GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5",
    memo: "1380611530",
  },
  XRP: {
    address: "rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34",
    memo: "2237695492",
  },
  HBAR: {
    address: "0.0.5006230",
    memo: "904278439",
  },

  // Solana meme coins
  BONK: {
    address: "puNRXZc4qEYWdUjmx68Lcb87DobBpgZQPdTndoS4U5B",
  },
  MOODENG: {
    address: "Fd4ir2iU6H8kaYvTbAwXmrdjo6JPt7ABo7b5poCTpAsE",
  },
};

/**
 * Non-EVM Asset Registry
 */
export const NON_EVM_ASSETS: Record<string, RobinhoodNonEvmAsset> = {
  // Bitcoin
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    description: "The original cryptocurrency and store of value",
    network: "BITCOIN",
    nonEvmIdentifier: "BTC",
    category: "layer1",
    icon: "btc.svg",
    decimals: 8,
    enabled: true,
    featured: true,
    popularity: 100,
    sortOrder: 1,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Solana
  SOL: {
    symbol: "SOL",
    name: "Solana",
    description: "High-performance blockchain for dApps",
    network: "SOLANA",
    nonEvmIdentifier: "SOL",
    category: "layer1",
    icon: "sol.svg",
    decimals: 9,
    enabled: true,
    featured: true,
    popularity: 90,
    sortOrder: 3,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Other Bitcoin-like
  LTC: {
    symbol: "LTC",
    name: "Litecoin",
    description: "Peer-to-peer cryptocurrency",
    network: "LITECOIN",
    nonEvmIdentifier: "LTC",
    category: "layer1",
    icon: "ltc.svg",
    decimals: 8,
    enabled: true,
    popularity: 60,
    sortOrder: 12,
    type: RobinhoodTokenType.NonEvmToken,
  },

  BCH: {
    symbol: "BCH",
    name: "Bitcoin Cash",
    description: "Bitcoin fork with larger blocks",
    network: "BITCOIN_CASH",
    nonEvmIdentifier: "BCH",
    category: "layer1",
    icon: "bch.svg",
    decimals: 8,
    enabled: true,
    popularity: 50,
    sortOrder: 13,
    type: RobinhoodTokenType.NonEvmToken,
  },

  DOGE: {
    symbol: "DOGE",
    name: "Dogecoin",
    description: "Original meme cryptocurrency",
    network: "DOGECOIN",
    nonEvmIdentifier: "DOGE",
    category: "meme",
    icon: "doge.svg",
    decimals: 8,
    enabled: true,
    popularity: 75,
    sortOrder: 30,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Other L1s
  ADA: {
    symbol: "ADA",
    name: "Cardano",
    description: "Proof-of-stake blockchain platform",
    network: "CARDANO",
    nonEvmIdentifier: "ADA",
    category: "layer1",
    icon: "ada.svg",
    decimals: 6,
    enabled: false, // Disabled: Not in Robinhood Connect supported networks
    popularity: 65,
    sortOrder: 15,
    type: RobinhoodTokenType.NonEvmToken,
  },

  XTZ: {
    symbol: "XTZ",
    name: "Tezos",
    description: "Self-amending blockchain platform",
    network: "TEZOS",
    nonEvmIdentifier: "XTZ",
    category: "layer1",
    icon: "xtz.svg",
    decimals: 6,
    enabled: true,
    popularity: 45,
    sortOrder: 16,
    type: RobinhoodTokenType.NonEvmToken,
  },

  XLM: {
    symbol: "XLM",
    name: "Stellar",
    description: "Fast, low-cost payment network",
    network: "STELLAR",
    nonEvmIdentifier: "XLM",
    category: "layer1",
    icon: "xlm.svg",
    decimals: 7,
    enabled: true,
    popularity: 55,
    sortOrder: 15,
    type: RobinhoodTokenType.NonEvmToken,
  },

  SUI: {
    symbol: "SUI",
    name: "Sui",
    description: "Next-generation smart contract platform",
    network: "SUI",
    nonEvmIdentifier: "SUI",
    category: "layer1",
    icon: "sui.svg",
    decimals: 9,
    enabled: false, // Disabled: Not in Robinhood Connect supported networks
    popularity: 50,
    sortOrder: 17,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Networks with memos (currently disabled - not in Connect supported networks)
  XRP: {
    symbol: "XRP",
    name: "Ripple",
    description: "Digital payment network and protocol",
    network: "XRP",
    nonEvmIdentifier: "XRP",
    category: "layer1",
    icon: "xrp.svg",
    decimals: 6,
    enabled: false,
    popularity: 70,
    sortOrder: 18,
    type: RobinhoodTokenType.NonEvmToken,
  },

  HBAR: {
    symbol: "HBAR",
    name: "Hedera",
    description: "Enterprise-grade distributed ledger",
    network: "HEDERA",
    nonEvmIdentifier: "HBAR",
    category: "layer1",
    icon: "hbar.svg",
    decimals: 8,
    enabled: false,
    popularity: 48,
    sortOrder: 19,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Solana meme coins
  BONK: {
    symbol: "BONK",
    name: "BONK",
    description: "Solana-based community meme token",
    network: "SOLANA",
    nonEvmIdentifier: "BONK",
    category: "meme",
    icon: "bonk.svg",
    decimals: 5,
    enabled: true,
    popularity: 65,
    sortOrder: 34,
    type: RobinhoodTokenType.NonEvmToken,
  },

  MOODENG: {
    symbol: "MOODENG",
    name: "Moo Deng",
    description: "Viral Solana meme token",
    network: "SOLANA",
    nonEvmIdentifier: "MOODENG",
    category: "meme",
    icon: "moodeng.svg",
    decimals: 9,
    enabled: true,
    popularity: 55,
    sortOrder: 35,
    type: RobinhoodTokenType.NonEvmToken,
  },
};
```

### Step 6: Create Unified Asset Registry

**File**: `lib/robinhood/assets/registry.ts`

**Action**: Combine all assets into single source of truth

**Code**:

```typescript
import { RobinhoodAssetConfig } from "../types";
import { EVM_ASSETS, EVM_DEPOSIT_ADDRESSES } from "./evm-assets";
import { NON_EVM_ASSETS, NON_EVM_DEPOSIT_ADDRESSES } from "./non-evm-assets";

/**
 * SINGLE SOURCE OF TRUTH: Complete Robinhood Asset Registry
 *
 * This combines:
 * - Asset metadata (display info, categories, icons)
 * - Deposit addresses (Coinbase Prime Trading Balance wallets)
 * - Network configuration
 *
 * To add a new asset:
 * 1. Add to evm-assets.ts OR non-evm-assets.ts
 * 2. Add deposit address to corresponding DEPOSIT_ADDRESSES constant
 * 3. That's it! Registry auto-populates.
 */

/**
 * Build complete asset configurations by combining metadata + addresses
 */
export function buildRobinhoodAssetRegistry(): Record<
  string,
  RobinhoodAssetConfig
> {
  const registry: Record<string, RobinhoodAssetConfig> = {};

  // Add EVM assets
  for (const [symbol, asset] of Object.entries(EVM_ASSETS)) {
    const depositAddress = EVM_DEPOSIT_ADDRESSES[symbol];

    if (!depositAddress) {
      console.warn(
        `[Asset Registry] EVM asset ${symbol} missing deposit address - skipping`
      );
      continue;
    }

    registry[symbol] = {
      ...asset,
      depositAddress,
    };
  }

  // Add Non-EVM assets
  for (const [symbol, asset] of Object.entries(NON_EVM_ASSETS)) {
    const depositAddress = NON_EVM_DEPOSIT_ADDRESSES[symbol];

    if (!depositAddress) {
      console.warn(
        `[Asset Registry] Non-EVM asset ${symbol} missing deposit address - skipping`
      );
      continue;
    }

    registry[symbol] = {
      ...asset,
      depositAddress,
    };
  }

  return registry;
}

/**
 * Global asset registry - lazy loaded
 */
let ASSET_REGISTRY: Record<string, RobinhoodAssetConfig> | null = null;

/**
 * Get the complete asset registry
 */
export function getAssetRegistry(): Record<string, RobinhoodAssetConfig> {
  if (!ASSET_REGISTRY) {
    ASSET_REGISTRY = buildRobinhoodAssetRegistry();
  }
  return ASSET_REGISTRY;
}

/**
 * Get a specific asset configuration by symbol
 */
export function getAssetConfig(
  symbol: string
): RobinhoodAssetConfig | undefined {
  const registry = getAssetRegistry();
  return registry[symbol];
}

/**
 * Get all enabled assets
 */
export function getEnabledAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all featured/popular assets
 */
export function getFeaturedAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.featured)
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Validate that asset registry is properly configured
 */
export function validateAssetRegistry(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    evm: number;
    nonEvm: number;
    missingAddresses: number;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const registry = getAssetRegistry();

  let evmCount = 0;
  let nonEvmCount = 0;
  let missingAddresses = 0;

  for (const [symbol, asset] of Object.entries(registry)) {
    // Count by type
    if (asset.type === "EvmToken") {
      evmCount++;
    } else {
      nonEvmCount++;
    }

    // Validate deposit address
    if (!asset.depositAddress?.address) {
      errors.push(`Asset ${symbol} missing deposit address`);
      missingAddresses++;
    } else if (asset.depositAddress.address.includes("PLACEHOLDER")) {
      warnings.push(`Asset ${symbol} has placeholder deposit address`);
    }

    // Validate network/memo consistency
    if (
      asset.depositAddress?.memo &&
      asset.network !== "XRP" &&
      asset.network !== "STELLAR" &&
      asset.network !== "HEDERA"
    ) {
      warnings.push(
        `Asset ${symbol} has memo but network ${asset.network} typically doesn't require it`
      );
    }
  }

  const allAssets = Object.values(registry);
  const enabled = allAssets.filter((a) => a.enabled);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: allAssets.length,
      enabled: enabled.length,
      disabled: allAssets.length - enabled.length,
      evm: evmCount,
      nonEvm: nonEvmCount,
      missingAddresses,
    },
  };
}
```

### Step 7: Create Asset Helper Functions

**File**: `lib/robinhood/assets/asset-helpers.ts`

**Action**: Utility functions for working with assets

**Code**:

```typescript
import type {
  AssetCategory,
  RobinhoodAssetConfig,
  RobinhoodNetwork,
} from "../types";
import { getAssetRegistry } from "./registry";

/**
 * Search assets by symbol or name
 */
export function searchAssets(query: string): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  const lowerQuery = query.toLowerCase();

  return Object.values(registry)
    .filter(
      (asset) =>
        asset.enabled &&
        (asset.symbol.toLowerCase().includes(lowerQuery) ||
          asset.name.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(
  category: AssetCategory
): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();

  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get assets by network
 */
export function getAssetsByNetwork(
  network: RobinhoodNetwork
): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();

  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.network === network)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Check if an asset is supported
 */
export function isAssetSupported(symbol: string): boolean {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset !== undefined && asset.enabled;
}

/**
 * Get deposit address for an asset
 */
export function getDepositAddress(symbol: string): string | undefined {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset?.depositAddress?.address;
}

/**
 * Get memo for an asset (if required)
 */
export function getDepositMemo(symbol: string): string | undefined {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset?.depositAddress?.memo;
}

/**
 * Get all supported asset symbols
 */
export function getSupportedAssetSymbols(): string[] {
  const registry = getAssetRegistry();
  return Object.keys(registry).filter((symbol) => registry[symbol].enabled);
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): RobinhoodNetwork[] {
  const registry = getAssetRegistry();
  const networks = new Set<RobinhoodNetwork>();

  Object.values(registry).forEach((asset) => {
    if (asset.enabled) {
      networks.add(asset.network);
    }
  });

  return Array.from(networks);
}
```

### Step 8: Move URL Builder to New Structure

**File**: `lib/robinhood/url-builder/daffy-style.ts`

**Action**: Extract Daffy-style URL builder from old file

**Code**:

````typescript
import { v4 as uuidv4 } from "uuid";
import type {
  DaffyStyleOnrampParams,
  DaffyStyleOnrampUrlResult,
  RobinhoodNetwork,
} from "../types";
import { isValidWalletAddress } from "./validation";

/**
 * Build Daffy-style onramp URL for Robinhood Connect
 *
 * This uses the PROVEN WORKING format from extensive testing (31 URL variations).
 * Pre-selection of asset is REQUIRED for external wallet transfers.
 *
 * @param params - Asset, network, wallet address, and Robinhood connectId
 * @param params.connectId - The connectId from Robinhood API (/catpay/v1/connect_id/)
 * @returns Complete URL with connectId for tracking
 *
 * @example
 * ```typescript
 * const result = buildDaffyStyleOnrampUrl({
 *   asset: 'ETH',
 *   network: 'ETHEREUM',
 *   walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
 *   connectId: 'abc-123-...' // From Robinhood API
 * });
 *
 * window.location.href = result.url;
 * ```
 */
export function buildDaffyStyleOnrampUrl(
  params: DaffyStyleOnrampParams
): DaffyStyleOnrampUrlResult {
  const { asset, network, walletAddress, redirectUrl, connectId } = params;

  // Validate required parameters
  if (!asset || !network || !walletAddress) {
    throw new Error(
      "Asset, network, and walletAddress are required for Daffy-style onramp URL"
    );
  }

  // Validate wallet address format
  if (!isValidWalletAddress(walletAddress, network)) {
    throw new Error(
      `Invalid wallet address format for network ${network}: ${walletAddress}`
    );
  }

  // Use provided connectId (should come from Robinhood API)
  // Generate UUID only as fallback for testing
  const finalConnectId = connectId || uuidv4();

  // Get base URL and redirect URL
  const baseUrl = getRobinhoodBaseUrl();
  const finalRedirectUrl = redirectUrl || getDefaultRedirectUrl();

  // Get application ID
  const applicationId = getRobinhoodApplicationId();

  // Build URL parameters (EXACT format from Daffy's implementation)
  const urlParams = new URLSearchParams({
    applicationId,
    connectId: finalConnectId,
    paymentMethod: "crypto_balance", // Required for transfers from Robinhood balance
    redirectUrl: finalRedirectUrl,
    supportedAssets: asset, // Single asset only
    supportedNetworks: network, // Single network only
    walletAddress,
    assetCode: asset, // Daffy includes this (same as supportedAssets)
    flow: "transfer", // CRITICAL: Specifies transfer flow (not sell)
  });

  const url = `${baseUrl}?${urlParams.toString()}`;

  // Log for debugging
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
 * Get Robinhood Connect base URL
 */
function getRobinhoodBaseUrl(): string {
  // CRITICAL: Use /connect/amount NOT /applink/connect
  return "https://robinhood.com/connect/amount";
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
    process.env.NEXT_PUBLIC_CALLBACK_URL || "http://localhost:3000/callback"
  );
}

/**
 * Get Robinhood application ID
 */
function getRobinhoodApplicationId(): string {
  const appId =
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID ||
    process.env.ROBINHOOD_APP_ID;

  if (!appId) {
    throw new Error(
      "NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID or ROBINHOOD_APP_ID environment variable not set"
    );
  }

  return appId;
}

/**
 * Generate a new UUID v4 connectId for order tracking
 * Note: For onramp, connectId should be obtained from Robinhood API
 * This is a fallback for testing/development only
 */
export function generateConnectId(): string {
  return uuidv4();
}

/**
 * Validate connectId format (UUID v4)
 */
export function isValidConnectId(connectId: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(connectId);
}
````

### Step 9: Move Validation Functions

**File**: `lib/robinhood/url-builder/validation.ts`

**Action**: Extract validation logic from old URL builder

**Code**:

```typescript
import type { RobinhoodNetwork } from "../types";

/**
 * Validate wallet address format for given network
 */
export function isValidWalletAddress(
  address: string,
  network: RobinhoodNetwork
): boolean {
  if (!address || address.length === 0) {
    return false;
  }

  // Ethereum-based networks
  if (
    network === "ETHEREUM" ||
    network === "POLYGON" ||
    network === "AVALANCHE" ||
    network === "ARBITRUM" ||
    network === "OPTIMISM" ||
    network === "BASE" ||
    network === "ZORA" ||
    network === "ETHEREUM_CLASSIC"
  ) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Bitcoin
  if (network === "BITCOIN") {
    return address.length >= 26 && address.length <= 62;
  }

  // Solana
  if (network === "SOLANA") {
    return address.length >= 32 && address.length <= 44;
  }

  // Litecoin
  if (network === "LITECOIN") {
    return address.length >= 26 && address.length <= 62;
  }

  // Dogecoin
  if (network === "DOGECOIN") {
    return (
      address.startsWith("D") && address.length >= 26 && address.length <= 34
    );
  }

  // Bitcoin Cash
  if (network === "BITCOIN_CASH") {
    return address.length >= 26 && address.length <= 62;
  }

  // Cardano
  if (network === "CARDANO") {
    return address.length >= 30 && address.length <= 110;
  }

  // XRP
  if (network === "XRP") {
    return (
      address.startsWith("r") && address.length >= 25 && address.length <= 35
    );
  }

  // Stellar
  if (network === "STELLAR") {
    return address.startsWith("G") && address.length === 56;
  }

  // Hedera
  if (network === "HEDERA") {
    return /^0\.0\.\d+$/.test(address);
  }

  // Tezos
  if (network === "TEZOS") {
    return (
      address.startsWith("tz") && address.length >= 30 && address.length <= 40
    );
  }

  // Sui
  if (network === "SUI") {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  // Toncoin
  if (network === "TONCOIN") {
    return address.length >= 30 && address.length <= 60;
  }

  // Default: assume valid
  return true;
}

/**
 * Validate asset code format
 */
export function isValidAssetCode(assetCode: string): boolean {
  // Asset codes are typically 2-10 uppercase letters
  return /^[A-Z]{2,10}$/.test(assetCode);
}

/**
 * Validate amount format (positive number with optional decimals)
 */
export function isValidAmount(amount: string): boolean {
  return /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
}
```

### Step 10: Create Public API (index.ts)

**File**: `lib/robinhood/index.ts`

**Action**: Export clean public API

**Code**:

```typescript
/**
 * Robinhood Connect - Public API
 *
 * This is the main entry point for all Robinhood Connect functionality.
 * Import from this file to access assets, URL builders, and utilities.
 */

// Types
export * from "./types";

// Constants
export * from "./constants/networks";
export * from "./constants/errors";

// Asset Registry
export {
  getAssetRegistry,
  getAssetConfig,
  getEnabledAssets,
  getFeaturedAssets,
  validateAssetRegistry,
} from "./assets/registry";

// Asset Helpers
export {
  searchAssets,
  getAssetsByCategory,
  getAssetsByNetwork,
  isAssetSupported,
  getDepositAddress,
  getDepositMemo,
  getSupportedAssetSymbols,
  getSupportedNetworks,
} from "./assets/asset-helpers";

// URL Builder
export {
  buildDaffyStyleOnrampUrl,
  generateConnectId,
  isValidConnectId,
} from "./url-builder/daffy-style";

// Validation
export {
  isValidWalletAddress,
  isValidAssetCode,
  isValidAmount,
} from "./url-builder/validation";
```

### Step 11: Update Type Imports

**File**: `types/robinhood.d.ts`

**Action**: Re-export types from new location

**Code**:

```typescript
/**
 * Robinhood Connect API Types
 *
 * This file re-exports types from lib/robinhood for backward compatibility.
 * New code should import directly from '@/lib/robinhood'
 *
 * @deprecated Import from '@/lib/robinhood' instead
 */

export type {
  RobinhoodNetwork,
  AssetCategory,
  RobinhoodBaseAsset,
  RobinhoodEvmAsset,
  RobinhoodNonEvmAsset,
  RobinhoodAsset,
  RobinhoodDepositAddress,
  RobinhoodAssetConfig,
  DaffyStyleOnrampParams,
  DaffyStyleOnrampUrlResult,
} from "@/lib/robinhood";

export { RobinhoodTokenType } from "@/lib/robinhood";

// Legacy type aliases for backward compatibility
export type SupportedNetwork = RobinhoodNetwork;
export type AssetMetadata = RobinhoodBaseAsset;
export type AssetConfig = RobinhoodAssetConfig;

// Deprecated types (no longer used)
export interface DepositAddressResponse {
  address: string;
  addressTag?: string;
  assetCode: string;
  assetAmount: string;
  networkCode: string;
}

export interface CallbackParams {
  assetCode: string;
  assetAmount: string;
  network: string;
}

export interface PriceItem {
  type: string;
  fiatAmount: string;
  cryptoQuantity: string;
}

export interface PriceQuoteResponse {
  assetCode: string;
  applicationId: string;
  fiatCode: string;
  fiatAmount: string;
  cryptoAmount: string;
  price: string;
  processingFee: PriceItem;
  totalAmount: PriceItem;
  partnerFee: PriceItem;
  paymentMethod: string;
  networkCode: string;
}
```

### Step 12: Update Import Statements Across Codebase

**Files to Update**:

- `app/api/robinhood/generate-onramp-url/route.ts`
- `app/dashboard/page.tsx`
- `components/asset-selector.tsx` (if exists)

**Action**: Update all imports to use new `@/lib/robinhood` path

**Example Before**:

```typescript
import { buildDaffyStyleOnrampUrl } from "@/lib/robinhood-url-builder";
import { getAssetConfig } from "@/lib/robinhood-asset-config";
import type { AssetConfig } from "@/types/robinhood";
```

**Example After**:

```typescript
import {
  buildDaffyStyleOnrampUrl,
  getAssetConfig,
  type RobinhoodAssetConfig,
} from "@/lib/robinhood";
```

**Commands**:

```bash
# Update imports in API route
# (Manual edit - IDE refactoring recommended)

# Update imports in dashboard
# (Manual edit - IDE refactoring recommended)
```

### Step 13: Delete Old Files

**Action**: Remove deprecated files after verifying new structure works

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Delete old lib files
rm lib/robinhood-api.ts
rm lib/robinhood-asset-addresses.ts
rm lib/robinhood-asset-metadata.ts
rm lib/robinhood-asset-config.ts
rm lib/robinhood-url-builder.ts
rm lib/network-addresses.ts
rm lib/error-messages.ts
```

**Validation**:

```bash
# Ensure no broken imports
npm run build

# Expected: Clean build with no errors
```

---

## Deliverables Checklist

- [ ] New `lib/robinhood/` directory structure created
- [ ] `lib/robinhood/types.ts` - Core types aligned with backend
- [ ] `lib/robinhood/constants/networks.ts` - Network definitions
- [ ] `lib/robinhood/constants/errors.ts` - Error messages
- [ ] `lib/robinhood/assets/evm-assets.ts` - EVM asset definitions
- [ ] `lib/robinhood/assets/non-evm-assets.ts` - Non-EVM asset definitions
- [ ] `lib/robinhood/assets/registry.ts` - Unified asset registry
- [ ] `lib/robinhood/assets/asset-helpers.ts` - Utility functions
- [ ] `lib/robinhood/url-builder/daffy-style.ts` - URL builder
- [ ] `lib/robinhood/url-builder/validation.ts` - Validators
- [ ] `lib/robinhood/index.ts` - Public API exports
- [ ] `types/robinhood.d.ts` - Updated to re-export from new location
- [ ] All imports updated across codebase
- [ ] Old files deleted
- [ ] `npm run build` passes
- [ ] Dashboard still works
- [ ] URL generation still works

---

## Validation Steps

### 1. Validate Registry

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
npm run dev
```

Open browser console and test:

```javascript
import { validateAssetRegistry } from "@/lib/robinhood";

const validation = validateAssetRegistry();
console.log("Registry Validation:", validation);
// Should show: { valid: true, errors: [], warnings: [], stats: {...} }
```

### 2. Test Asset Lookup

```javascript
import { getAssetConfig, getEnabledAssets } from "@/lib/robinhood";

// Get specific asset
const btc = getAssetConfig("BTC");
console.log("BTC Config:", btc);
// Should show full config with metadata + deposit address

// Get all enabled
const enabled = getEnabledAssets();
console.log("Enabled Assets:", enabled.length);
// Should show ~27 assets
```

### 3. Test URL Generation

```javascript
import { buildDaffyStyleOnrampUrl } from "@/lib/robinhood";

const result = buildDaffyStyleOnrampUrl({
  asset: "ETH",
  network: "ETHEREUM",
  walletAddress: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
  connectId: "test-123-456",
});

console.log("Generated URL:", result.url);
// Should be valid Robinhood Connect URL
```

### 4. Verify Dashboard Still Works

1. Navigate to `/dashboard`
2. Asset selector should load
3. Select an asset (e.g., ETH)
4. Click "Continue to Robinhood"
5. URL should generate successfully

**Expected**: No errors, flow works as before

### 5. Check Build

```bash
npm run build
```

**Expected**: Clean build, no TypeScript errors

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure refactoring doesn't break existing functionality

**Commands**:

```bash
# 1. Build should pass
npm run build

# 2. Type checking
npm run type-check

# 3. Development server
npm run dev
# Visit: http://localhost:3030/dashboard
# Test: Asset selection and URL generation
```

**Success Criteria**:

- ✅ Build completes with 0 errors
- ✅ Type checking passes
- ✅ Dashboard loads and displays assets
- ✅ Asset selection works
- ✅ URL generation works
- ✅ Callback handling still works (test full flow)

**If Checkpoint Fails**:

1. Review TypeScript errors in build output
2. Check import paths are correct
3. Verify all exports are properly defined in `index.ts`
4. Rollback: `git stash` changes and restore old files

---

## Common Issues and Solutions

### Issue 1: Import Errors After Refactor

**Symptom**: `Cannot find module '@/lib/robinhood'`

**Solution**:

```bash
# Restart TypeScript server
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 2: Asset Not Found

**Symptom**: `getAssetConfig('ETH')` returns `undefined`

**Solution**:

- Check that asset exists in `evm-assets.ts` or `non-evm-assets.ts`
- Check that deposit address exists in corresponding `DEPOSIT_ADDRESSES` constant
- Verify `enabled: true` on asset definition

### Issue 3: Duplicate Asset Definitions

**Symptom**: Same asset in both `evm-assets.ts` and `non-evm-assets.ts`

**Solution**:

- Remove from incorrect file
- EVM assets: Ethereum, Polygon, Arbitrum, etc.
- Non-EVM assets: Bitcoin, Solana, Cardano, etc.

### Issue 4: Missing Deposit Address

**Symptom**: Warning in console about missing address

**Solution**:

```typescript
// Add to appropriate DEPOSIT_ADDRESSES constant
export const EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  // ... existing entries
  NEW_ASSET: {
    address: "0x...",
    memo: "optional-memo", // Only if required
  },
};
```

---

## Integration Points

### With Sub-Plan 4: ID System Consolidation

- Uses `connectId` consistently (already standardized in SP4)
- No `referenceId` confusion

### With Future Backend Integration

**When POC becomes production**:

1. **Database Migration**: Assets move from constants to database

   ```typescript
   // Instead of:
   import { getAssetConfig } from "@/lib/robinhood";

   // Use:
   const assetService = new AssetService(db);
   const asset = await assetService.findBySymbol("BTC");
   ```

2. **OTC Address Management**: Move to backend `otc-token.ts` pattern

   ```typescript
   // Backend already has this structure!
   const APPROVED_OTC_TOKENS: IOtcToken[] = [...]
   ```

3. **Type Compatibility**: Our types already match backend

   ```typescript
   // POC types align with backend entities
   RobinhoodEvmAsset ≈ EvmToken entity
   RobinhoodNonEvmAsset ≈ NonEvmToken entity
   RobinhoodDepositAddress ≈ IOtcToken interface
   ```

---

## Next Steps

After completing this sub-plan:

1. **Test Full Flow**: Dashboard → Robinhood → Callback
2. **Update Documentation**: Reflect new structure in `docs/`
3. **Consider Sub-Plan 10**: Documentation consolidation (if needed)
4. **Plan Backend Migration**: When to move POC to production backend

---

## Risk Assessment

**🟢 LOW RISK**:

- New directory structure (additive only)
- Type definitions (no runtime changes)
- Asset registry (consolidates existing data)

**🟡 MEDIUM RISK**:

- Import path updates (may miss some files)
- File deletions (ensure all replaced first)

**🔴 CRITICAL RISK**: None

- All changes are refactoring only
- No API or flow changes
- Fully backward compatible

---

## Time Estimate Breakdown

- **Reading context**: 20-30 minutes
- **Step 1-6 (New structure)**: 90-120 minutes
- **Step 7-11 (Move code)**: 60-90 minutes
- **Step 12 (Update imports)**: 30-45 minutes
- **Step 13 (Delete old)**: 10-15 minutes
- **Validation**: 30-45 minutes
- **Documentation**: 15-20 minutes

**Total**: 4-6 hours

**Complexity**: Medium (mainly file organization and imports)

**Interruption Risk**: Can pause after any step (save work frequently)

---

## Success Indicators

✅ **Structure**:

- Single `lib/robinhood/` directory
- Clear separation: types, constants, assets, url-builder
- No duplicate files

✅ **Code Quality**:

- Type-safe throughout
- Single source of truth for assets
- Clean public API

✅ **Functionality**:

- All existing features work
- Dashboard loads assets
- URL generation succeeds
- No TypeScript errors

✅ **Alignment**:

- Types match backend patterns
- Asset structure mirrors backend tokens
- Easy future migration path

✅ **Documentation**:

- Clear file organization
- Well-commented code
- Public API exported from index.ts
