# Sub-Plan 11: Dynamic Asset Registry via Robinhood Discovery API

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 9 (Backend Alignment Refactor), Sub-Plan 10 (Backend Pledge Integration - recommended)
**Estimated Time**: 3.5-4.5 hours

---

## Quick Summary

Transform static asset registry into a dynamic system that:

1. 🔄 **Auto-fetches** assets from Robinhood Discovery API
2. 💰 **Queries** Coinbase Prime for wallet addresses (Trading > Trading Balance)
3. 🔗 **Syncs** with backend token map (SP10 integration)
4. 🎯 **Validates** decimals match between POC and backend
5. 📊 **Displays** startup toast with asset table showing what loaded

**Result**: Zero-maintenance asset registry that auto-updates when Robinhood adds new cryptocurrencies.

---

## Context Required

### Problem Statement

**Current State** (after Sub-Plan 9 & 10):

- Asset registry is **hardcoded** in `evm-assets.ts` and `non-evm-assets.ts`
- Deposit addresses are **manually copied** from Coinbase Prime
- **Manual updates required** when Robinhood adds new assets
- **Risk of drift** between Robinhood's supported assets and our registry
- **No validation** that our assets match Robinhood's current offerings
- **No visibility** into what assets loaded on startup or which wallet types used
- Backend token mapping (SP10) is separate from asset registry

**Gold Standard: Robinhood Asset Discovery API**

```
GET https://api.robinhood.com/catpay/v1/supported_currencies/?applicationId=<APP_ID>
```

**Response Structure**:

```typescript
interface AssetDiscoveryResponse {
  applicationId: string;
  cryptoCurrencyPairs: CryptoCurrencyPair[];
}

interface CryptoCurrencyPair {
  id: string; // "BTC-USD"
  assetCurrency: CurrencyInfo; // The crypto asset
  quoteCurrency: CurrencyInfo; // Usually USD
  supportedNetworks: string[]; // ["BITCOIN"]
}

interface CurrencyInfo {
  id: string; // "1072fc76-1862-41ab-82c2-485837590762"
  code: string; // "BTC"
  name: string; // "Bitcoin"
  currencyType: string; // "crypto"
}
```

### Existing Scripts

**1. Export OTC Tokens** (`scripts/export-otc-tokens.ts`):

```typescript
// Converts our asset registry to IOtcToken format
const otcTokens = getOtcTokens();
// Output: Array of { address, symbol, name, memo, logoUrl }
```

**2. Generate Prime Wallets** (`scripts/generate_prime_wallets.py`):

```python
# Fetches Coinbase Prime wallet addresses
# Priority Order: 1) Trading account, 2) Trading Balance
# Maps: Symbol → Prime Deposit Address + Memo (if required)
ROBINHOOD_ASSETS = {
    'BTC': 'BITCOIN',
    'ETH': 'ETHEREUM',
    # ...
}
```

### Files to Review

**Robinhood API Documentation**:

- `.cursor/context/Robinhood_Connect_SDK_Combined.md` (lines 152-194)

**Current Asset System** (from Sub-Plan 9):

- `robinhood-onramp/lib/robinhood/assets/registry.ts` (lines 1236-1415)
- `robinhood-onramp/lib/robinhood/assets/evm-assets.ts` (lines 570-936)
- `robinhood-onramp/lib/robinhood/assets/non-evm-assets.ts` (lines 947-1225)
- `robinhood-onramp/lib/robinhood/types.ts` (lines 245-440)

**Scripts**:

- `robinhood-onramp/scripts/export-otc-tokens.ts` (lines 1-86)
- `robinhood-onramp/scripts/generate_prime_wallets.py` (lines 1-273)

---

## Objectives

1. **Fetch live asset data** from Robinhood Asset Discovery API at startup
2. **Map Robinhood assets** to Coinbase Prime wallet addresses
3. **Prioritize Trading accounts** over Trading Balance for active trading
4. **Build registry dynamically** instead of hardcoded definitions
5. **Cache for performance** - avoid repeated API calls
6. **Fallback to static** if API unavailable (graceful degradation)
7. **Validate completeness** - warn if Prime address missing for supported asset
8. **Enable auto-updates** - new Robinhood assets appear automatically
9. **Display startup toast** - show asset registry table on app initialization
10. **Provide visibility** - developers see what assets are loaded and from which wallet types

### Why Prefer Trading Account Over Trading Balance?

**Trading Account** (preferred):

- ✅ **Immediate liquidity**: Assets available for trading instantly
- ✅ **Lower fees**: Trading account has better fee structure
- ✅ **Active management**: Designed for frequent deposits/withdrawals
- ✅ **Settlement speed**: Faster settlement times for conversions

**Trading Balance** (fallback):

- ⚠️ **Settlement delays**: May require settlement period before trading
- ⚠️ **Limited liquidity**: Not immediately available for all operations
- ✅ **Still functional**: Works for deposits, just slower for trading

**Priority Order**:

```
1. Trading        → Best for donations needing quick conversion to USD
2. Trading Balance → Fallback if Trading not available
3. Other wallets   → Last resort (rarely used)
```

---

## Proposed Architecture

### High-Level Flow

```
App Startup
    ↓
┌─────────────────────────────────────────────┐
│ 1. Call Robinhood Asset Discovery API      │
│    GET /catpay/v1/supported_currencies/    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 2. Parse Response                           │
│    - Extract asset codes (BTC, ETH, SOL)    │
│    - Extract networks (BITCOIN, ETHEREUM)   │
│    - Extract display names                  │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 3. Lookup Prime Addresses                   │
│    - Query Coinbase Prime API               │
│    - Map symbol → wallet address            │
│    - Include memo if required               │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 4. Merge with Metadata                      │
│    - Add icons, descriptions                │
│    - Set enabled/featured flags             │
│    - Assign categories, sort order          │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 5. Build Asset Registry                     │
│    - Combine all data sources               │
│    - Validate completeness                  │
│    - Cache in memory                        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 6. Expose via API                           │
│    - getAssetRegistry()                     │
│    - getEnabledAssets()                     │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 7. Show Startup Toast (Client-Side)        │
│    - Display asset table                    │
│    - Show category breakdown                │
│    - Show wallet type distribution          │
└─────────────────────────────────────────────┘
```

### New File Structure

```
robinhood-onramp/
├── lib/robinhood/
│   ├── assets/
│   │   ├── registry.ts              # UPDATED: Dynamic registry builder
│   │   ├── evm-assets.ts            # CONVERTED: Metadata only (no addresses)
│   │   ├── non-evm-assets.ts        # CONVERTED: Metadata only (no addresses)
│   │   ├── asset-helpers.ts         # Same (uses registry)
│   │   ├── discovery.ts             # NEW: Robinhood API client
│   │   └── prime-addresses.ts       # NEW: Prime wallet lookup
│   ├── api/
│   │   └── robinhood-client.ts      # UPDATED: Add discovery endpoint
│   └── init.ts                      # UPDATED: Add toast on startup
├── components/
│   └── asset-registry-toast.tsx     # NEW: Toast component (optional)
└── app/
    └── layout.tsx                   # UPDATED: Add toast component
```

---

## Precise Implementation Steps

### Step 1: Create Robinhood Discovery API Client

**File**: `lib/robinhood/assets/discovery.ts`

**Action**: Create client for Asset Discovery API

**Code**:

```typescript
/**
 * Robinhood Asset Discovery API Client
 *
 * Fetches live list of supported assets from Robinhood Connect
 * Reference: Robinhood Connect SDK - Asset Discovery
 */

const DISCOVERY_API_URL =
  "https://api.robinhood.com/catpay/v1/supported_currencies/";

/**
 * Robinhood Asset Discovery Response Types
 */
export interface RobinhoodCurrencyInfo {
  id: string; // UUID
  code: string; // "BTC", "ETH"
  name: string; // "Bitcoin", "Ethereum"
  currencyType: string; // "crypto"
}

export interface RobinhoodCryptoCurrencyPair {
  id: string; // "BTC-USD"
  assetCurrency: RobinhoodCurrencyInfo;
  quoteCurrency: RobinhoodCurrencyInfo;
  supportedNetworks: string[]; // ["BITCOIN"]
}

export interface RobinhoodAssetDiscoveryResponse {
  applicationId: string;
  cryptoCurrencyPairs: RobinhoodCryptoCurrencyPair[];
}

/**
 * Discovered asset (simplified from API response)
 */
export interface DiscoveredAsset {
  symbol: string; // "BTC"
  name: string; // "Bitcoin"
  networks: string[]; // ["BITCOIN"]
  robinhoodId: string; // UUID for tracking
}

/**
 * Fetch supported assets from Robinhood Discovery API
 */
export async function fetchRobinhoodAssets(): Promise<DiscoveredAsset[]> {
  const applicationId = getRobinhoodApplicationId();

  if (!applicationId) {
    console.warn("[Discovery API] No application ID - using static assets");
    return [];
  }

  try {
    console.log("[Discovery API] Fetching supported assets...");

    const url = `${DISCOVERY_API_URL}?applicationId=${applicationId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Discovery API failed: ${response.status} ${response.statusText}`
      );
    }

    const data: RobinhoodAssetDiscoveryResponse = await response.json();

    console.log(
      `[Discovery API] Found ${data.cryptoCurrencyPairs.length} asset pairs`
    );

    // Convert to simplified format
    const discovered: DiscoveredAsset[] = data.cryptoCurrencyPairs
      .filter((pair) => pair.assetCurrency.currencyType === "crypto")
      .map((pair) => ({
        symbol: pair.assetCurrency.code,
        name: pair.assetCurrency.name,
        networks: pair.supportedNetworks,
        robinhoodId: pair.assetCurrency.id,
      }));

    console.log(
      `[Discovery API] Discovered assets: ${discovered
        .map((a) => a.symbol)
        .join(", ")}`
    );

    return discovered;
  } catch (error) {
    console.error("[Discovery API] Failed to fetch assets:", error);
    console.warn("[Discovery API] Falling back to static asset registry");
    return [];
  }
}

/**
 * Get Robinhood application ID from environment
 */
function getRobinhoodApplicationId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID ||
    process.env.ROBINHOOD_APP_ID
  );
}

/**
 * Map Robinhood network names to our RobinhoodNetwork type
 */
export function normalizeNetworkName(robinhoodNetwork: string): string {
  // Robinhood uses slightly different names in some cases
  const networkMap: Record<string, string> = {
    ETHEREUM: "ETHEREUM",
    BITCOIN: "BITCOIN",
    POLYGON: "POLYGON",
    SOLANA: "SOLANA",
    AVALANCHE: "AVALANCHE",
    ARBITRUM: "ARBITRUM",
    OPTIMISM: "OPTIMISM",
    BASE: "BASE",
    LITECOIN: "LITECOIN",
    DOGECOIN: "DOGECOIN",
    BITCOIN_CASH: "BITCOIN_CASH",
    STELLAR: "STELLAR",
    TEZOS: "TEZOS",
    CARDANO: "CARDANO",
    XRP: "XRP",
    HEDERA: "HEDERA",
    ETHEREUM_CLASSIC: "ETHEREUM_CLASSIC",
    SUI: "SUI",
    ZORA: "ZORA",
    TONCOIN: "TONCOIN",
  };

  return networkMap[robinhoodNetwork] || robinhoodNetwork;
}
```

**Validation**:

```bash
# Test API call
curl -s "https://api.robinhood.com/catpay/v1/supported_currencies/?applicationId=YOUR_APP_ID" | jq '.cryptoCurrencyPairs | length'
```

### Step 2: Create Prime Address Lookup Service

**File**: `lib/robinhood/assets/prime-addresses.ts`

**Action**: Server-side service to fetch Prime wallet addresses

**Code**:

```typescript
/**
 * Coinbase Prime Address Lookup Service
 *
 * Fetches wallet addresses from Coinbase Prime with preference order:
 * 1. Trading account (preferred for active trading)
 * 2. Trading Balance (fallback)
 *
 * Used to populate deposit addresses for Robinhood assets
 *
 * NOTE: This runs SERVER-SIDE ONLY (requires Prime API credentials)
 */

import type { RobinhoodDepositAddress } from "../types";

/**
 * Symbol → Prime Symbol mapping
 * Some assets have different symbols in Prime
 */
const SYMBOL_TO_PRIME_SYMBOL: Record<string, string> = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  MATIC: "MATIC", // Polygon
  AVAX: "AVAX",
  LTC: "LTC",
  DOGE: "DOGE",
  BCH: "BCH",
  XLM: "XLM",
  XTZ: "XTZ",
  ADA: "ADA",
  XRP: "XRP",
  HBAR: "HBAR",
  ETC: "ETC",
  SUI: "SUI",
  // ERC-20 tokens
  USDC: "USDC",
  AAVE: "AAVE",
  LINK: "LINK",
  UNI: "UNI",
  COMP: "COMP",
  CRV: "CRV",
  ONDO: "ONDO",
  SHIB: "SHIB",
  PEPE: "PEPE",
  FLOKI: "FLOKI",
  BONK: "BONK",
  MOODENG: "MOODENG",
  TRUMP: "TRUMP",
  VIRTUAL: "VIRTUAL",
  WLFI: "WLFI",
};

/**
 * Wallet type for tracking address source
 */
export enum PrimeWalletType {
  Trading = "Trading",
  TradingBalance = "Trading Balance",
  Other = "Other",
}

/**
 * Extended deposit address with wallet type metadata
 */
export interface PrimeDepositAddress extends RobinhoodDepositAddress {
  walletType?: PrimeWalletType;
  walletId?: string;
}

/**
 * Cached wallet addresses (populated at startup)
 */
let PRIME_ADDRESS_CACHE: Record<string, PrimeDepositAddress> | null = null;

/**
 * Fetch all Prime wallet addresses (server-side only)
 * This should be called during app initialization
 *
 * Preference order:
 * 1. Trading account (preferred)
 * 2. Trading Balance (fallback)
 */
export async function fetchPrimeWalletAddresses(): Promise<
  Record<string, PrimeDepositAddress>
> {
  // Check if running on server
  if (typeof window !== "undefined") {
    console.error("[Prime Addresses] This function must run server-side only");
    return {};
  }

  console.log(
    "[Prime Addresses] Fetching wallet addresses from Coinbase Prime..."
  );
  console.log("[Prime Addresses] Priority: Trading > Trading Balance");

  try {
    // Use Python script to fetch addresses
    // Alternative: Implement native TypeScript Prime API client
    const addresses = await fetchAddressesViaPythonScript();

    console.log(
      `[Prime Addresses] Fetched ${Object.keys(addresses).length} addresses`
    );

    // Log wallet type distribution
    const byType = Object.values(addresses).reduce((acc, addr) => {
      const type = addr.walletType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("[Prime Addresses] Wallet types:", byType);

    // Cache for future lookups
    PRIME_ADDRESS_CACHE = addresses;

    return addresses;
  } catch (error) {
    console.error("[Prime Addresses] Failed to fetch addresses:", error);
    console.warn("[Prime Addresses] Using static fallback addresses");

    // Return static addresses from Sub-Plan 9
    return getStaticPrimeAddresses();
  }
}

/**
 * Get Prime address for a symbol (from cache)
 */
export function getPrimeAddress(
  symbol: string
): RobinhoodDepositAddress | undefined {
  if (!PRIME_ADDRESS_CACHE) {
    console.warn(
      "[Prime Addresses] Cache not initialized - call fetchPrimeWalletAddresses() first"
    );
    return getStaticPrimeAddress(symbol);
  }

  return PRIME_ADDRESS_CACHE[symbol];
}

/**
 * Fetch addresses using Python script (subprocess)
 * Alternative to native API client
 *
 * The Python script returns all wallets and we prioritize:
 * 1. Trading account (preferred)
 * 2. Trading Balance (fallback)
 */
async function fetchAddressesViaPythonScript(): Promise<
  Record<string, PrimeDepositAddress>
> {
  const { execSync } = await import("child_process");
  const path = await import("path");

  const scriptPath = path.join(
    process.cwd(),
    "scripts",
    "generate_prime_wallets.py"
  );

  try {
    // Run Python script with flag to return ALL wallet types
    const output = execSync(`python3 ${scriptPath} --all-wallets`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Parse output (script should output JSON array)
    const results = JSON.parse(output);

    // Group wallets by symbol
    const walletsBySymbol: Record<
      string,
      Array<{
        symbol: string;
        address: string;
        memo?: string;
        wallet_name: string;
        wallet_id: string;
      }>
    > = {};

    for (const result of results) {
      if (result.status === "found") {
        if (!walletsBySymbol[result.symbol]) {
          walletsBySymbol[result.symbol] = [];
        }
        walletsBySymbol[result.symbol].push(result);
      }
    }

    // Apply priority logic: Trading > Trading Balance
    const addresses: Record<string, PrimeDepositAddress> = {};

    for (const [symbol, wallets] of Object.entries(walletsBySymbol)) {
      // Priority 1: Trading account (exact match)
      const tradingWallet = wallets.find((w) => w.wallet_name === "Trading");

      // Priority 2: Trading Balance
      const tradingBalanceWallet = wallets.find((w) =>
        w.wallet_name.includes("Trading Balance")
      );

      // Priority 3: Any other wallet
      const selectedWallet =
        tradingWallet || tradingBalanceWallet || wallets[0];

      if (selectedWallet) {
        // Determine wallet type
        let walletType: PrimeWalletType;
        if (selectedWallet.wallet_name === "Trading") {
          walletType = PrimeWalletType.Trading;
        } else if (selectedWallet.wallet_name.includes("Trading Balance")) {
          walletType = PrimeWalletType.TradingBalance;
        } else {
          walletType = PrimeWalletType.Other;
        }

        addresses[symbol] = {
          address: selectedWallet.address,
          memo: selectedWallet.memo || undefined,
          walletType,
          walletId: selectedWallet.wallet_id,
        };

        // Log selection for transparency
        if (wallets.length > 1) {
          console.log(
            `[Prime Addresses] ${symbol}: Selected ${selectedWallet.wallet_name} ` +
              `(${wallets.length} wallets available)`
          );
        }
      }
    }

    return addresses;
  } catch (error) {
    console.error("[Prime Addresses] Python script failed:", error);
    throw error;
  }
}

/**
 * Fallback: Static addresses from Sub-Plan 9
 * Used if API fetch fails
 */
function getStaticPrimeAddresses(): Record<string, RobinhoodDepositAddress> {
  // Import from existing evm-assets.ts and non-evm-assets.ts
  // This ensures graceful degradation
  const { EVM_DEPOSIT_ADDRESSES } = require("./evm-assets");
  const { NON_EVM_DEPOSIT_ADDRESSES } = require("./non-evm-assets");

  return {
    ...EVM_DEPOSIT_ADDRESSES,
    ...NON_EVM_DEPOSIT_ADDRESSES,
  };
}

/**
 * Get static address for single symbol
 */
function getStaticPrimeAddress(
  symbol: string
): RobinhoodDepositAddress | undefined {
  const staticAddresses = getStaticPrimeAddresses();
  return staticAddresses[symbol];
}

/**
 * Validate Prime address cache is ready
 */
export function isPrimeAddressCacheReady(): boolean {
  return (
    PRIME_ADDRESS_CACHE !== null && Object.keys(PRIME_ADDRESS_CACHE).length > 0
  );
}
```

### Step 3: Update Python Script for Wallet Priority

**File**: `scripts/generate_prime_wallets.py`

**Action**: Add support for returning all wallet types with priority selection

**Changes**:

```python
#!/usr/bin/env python3
"""
Generate Deposit Addresses for Robinhood-Supported Assets

Priority order for wallet selection:
1. Trading account (preferred for active trading)
2. Trading Balance (fallback)
3. Any other wallet type

Usage:
  python3 generate_prime_wallets.py              # Returns preferred wallets only
  python3 generate_prime_wallets.py --all-wallets # Returns all wallets for prioritization
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient

# ... existing imports and setup ...

def get_robinhood_wallet_addresses(return_all_wallets=False):
    """
    Get wallet addresses for all Robinhood-supported assets

    Args:
        return_all_wallets: If True, returns ALL wallets per symbol.
                          If False, returns only the preferred wallet (Trading > Trading Balance)
    """

    print("=" * 100)
    print("Coinbase Prime - Robinhood Asset Deposit Addresses")
    if return_all_wallets:
        print("Mode: Returning ALL wallet types for each asset")
    else:
        print("Mode: Returning PREFERRED wallet only (Trading > Trading Balance)")
    print("=" * 100)

    # Load credentials (existing code...)

    # Get all wallets (existing pagination code...)

    # Create lookup by symbol (existing code...)

    print(f"[2/2] Retrieving deposit addresses for Robinhood assets...\n")
    print("=" * 100)

    results = []

    for symbol, network_name in sorted(ROBINHOOD_ASSETS.items()):
        print(f"\n{symbol:10} ({network_name})")

        # Find ALL wallets for this symbol
        if symbol not in wallets_by_symbol:
            print(f"  ⚠️  No wallet found for {symbol}")
            results.append({
                "symbol": symbol,
                "network": network_name,
                "status": "missing",
                "address": None,
                "memo": None,
                "wallet_id": None,
                "wallet_name": None
            })
            continue

        symbol_wallets = wallets_by_symbol[symbol]

        if return_all_wallets:
            # Return ALL wallets for this symbol
            for wallet in symbol_wallets:
                wallet_id = wallet.get("id")
                wallet_name = wallet.get("name")

                print(f"  Wallet: {wallet_name}")
                print(f"  ID:     {wallet_id}")

                try:
                    address, memo = client.get_wallet_deposit_address(wallet_id)

                    print(f"  ✅ Address: {address}")
                    if memo:
                        print(f"  📝 Memo:    {memo}")

                    results.append({
                        "symbol": symbol,
                        "network": network_name,
                        "status": "found",
                        "wallet_name": wallet_name,
                        "wallet_id": wallet_id,
                        "address": address,
                        "memo": memo
                    })

                    time.sleep(0.3)

                except Exception as e:
                    logger.error(f"Failed to get address for {symbol} ({wallet_name}): {e}")
                    print(f"  ❌ Failed: {e}")

        else:
            # Return only PREFERRED wallet (existing priority logic)
            # Priority 1: Trading account
            trading_wallet = next(
                (w for w in symbol_wallets if w.get("name") == "Trading"),
                None
            )

            # Priority 2: Trading Balance
            if not trading_wallet:
                trading_wallet = next(
                    (w for w in symbol_wallets if "Trading Balance" in w.get("name", "")),
                    None
                )

            # Priority 3: Any wallet
            if not trading_wallet:
                trading_wallet = symbol_wallets[0]
                print(f"  ℹ️  Using: {trading_wallet.get('name')} (no Trading/Trading Balance found)")

            wallet = trading_wallet
            wallet_id = wallet.get("id")
            wallet_name = wallet.get("name")

            print(f"  Wallet: {wallet_name}")
            print(f"  ID:     {wallet_id}")

            if len(symbol_wallets) > 1:
                print(f"  📊 Note: {len(symbol_wallets)} wallets available, selected: {wallet_name}")

            try:
                address, memo = client.get_wallet_deposit_address(wallet_id)

                print(f"  ✅ Address: {address}")
                if memo:
                    print(f"  📝 Memo:    {memo}")

                results.append({
                    "symbol": symbol,
                    "network": network_name,
                    "status": "found",
                    "wallet_name": wallet_name,
                    "wallet_id": wallet_id,
                    "address": address,
                    "memo": memo
                })

                time.sleep(0.3)

            except Exception as e:
                logger.error(f"Failed to get address for {symbol}: {e}")
                print(f"  ❌ Failed: {e}")
                results.append({
                    "symbol": symbol,
                    "network": network_name,
                    "status": "error",
                    "wallet_id": wallet_id,
                    "wallet_name": wallet_name,
                    "address": None,
                    "memo": None,
                    "error": str(e)
                })

    return results

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Fetch Coinbase Prime wallet addresses")
    parser.add_argument(
        "--all-wallets",
        action="store_true",
        help="Return all wallets per symbol instead of just the preferred one"
    )
    args = parser.parse_args()

    try:
        results = get_robinhood_wallet_addresses(return_all_wallets=args.all_wallets)

        # Output as JSON for TypeScript consumption
        print("\n" + "=" * 100)
        print("JSON OUTPUT (for TypeScript):")
        print("=" * 100)
        print(json.dumps(results, indent=2))

    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
```

**Validation**:

```bash
# Test with preferred wallet only
python3 scripts/generate_prime_wallets.py | jq '.[] | select(.status == "found") | {symbol, wallet_name}'

# Test with all wallets
python3 scripts/generate_prime_wallets.py --all-wallets | jq '.[] | select(.status == "found") | {symbol, wallet_name}'
```

### Step 4: Update Asset Metadata Files (Remove Addresses)

**File**: `lib/robinhood/assets/evm-assets.ts`

**Action**: Convert to metadata-only (remove deposit addresses)

**Changes**:

```typescript
/**
 * EVM Asset Metadata (Display Information Only)
 *
 * NOTE: Deposit addresses are fetched dynamically from Coinbase Prime
 * This file only contains static metadata (icons, descriptions, etc.)
 */

import { RobinhoodEvmAsset, RobinhoodTokenType } from "../types";

// REMOVE: EVM_DEPOSIT_ADDRESSES constant
// Addresses now fetched dynamically via prime-addresses.ts

/**
 * EVM Asset Metadata Registry
 * Static display information for each asset
 */
export const EVM_ASSETS_METADATA: Record<string, RobinhoodEvmAsset> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    description: "Smart contract platform and cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    category: "layer1",
    icon: "eth.svg",
    decimals: 18,
    enabled: true, // Will be validated against Robinhood API
    featured: true,
    popularity: 100,
    sortOrder: 2,
    type: RobinhoodTokenType.EvmToken,
  },

  // ... rest of assets (metadata only)
  // NOTE: Remove all references to EVM_DEPOSIT_ADDRESSES
};

// Export metadata only
export const EVM_ASSETS = EVM_ASSETS_METADATA;
```

**File**: `lib/robinhood/assets/non-evm-assets.ts`

**Action**: Same conversion - metadata only

```typescript
/**
 * Non-EVM Asset Metadata (Display Information Only)
 */

// REMOVE: NON_EVM_DEPOSIT_ADDRESSES constant

export const NON_EVM_ASSETS_METADATA: Record<string, RobinhoodNonEvmAsset> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    // ... metadata only
  },
  // ... rest
};

export const NON_EVM_ASSETS = NON_EVM_ASSETS_METADATA;
```

### Step 4: Update Registry Builder (Dynamic)

**File**: `lib/robinhood/assets/registry.ts`

**Action**: Build registry dynamically from multiple sources

**Code**:

```typescript
import type { RobinhoodAssetConfig } from "../types";
import { EVM_ASSETS } from "./evm-assets";
import { NON_EVM_ASSETS } from "./non-evm-assets";
import { fetchRobinhoodAssets, type DiscoveredAsset } from "./discovery";
import { fetchPrimeWalletAddresses, getPrimeAddress } from "./prime-addresses";

/**
 * DYNAMIC Asset Registry Builder
 *
 * Sources:
 * 1. Robinhood Asset Discovery API - What assets are supported
 * 2. Coinbase Prime API - Where to send deposits
 * 3. Static metadata files - Display info (icons, descriptions)
 *
 * Flow:
 * - At startup: Fetch from Robinhood + Prime APIs
 * - Merge with static metadata
 * - Cache in memory
 * - Fallback to static if APIs fail
 */

let ASSET_REGISTRY: Record<string, RobinhoodAssetConfig> | null = null;
let REGISTRY_INITIALIZED = false;
let REGISTRY_INIT_PROMISE: Promise<void> | null = null;

/**
 * Initialize asset registry (async)
 * Should be called once at app startup
 */
export async function initializeAssetRegistry(options?: {
  useDynamic?: boolean;
  serverSide?: boolean;
}): Promise<void> {
  // Prevent duplicate initialization
  if (REGISTRY_INIT_PROMISE) {
    return REGISTRY_INIT_PROMISE;
  }

  REGISTRY_INIT_PROMISE = (async () => {
    console.log("[Asset Registry] Initializing...");

    const useDynamic = options?.useDynamic ?? true;
    const serverSide = options?.serverSide ?? typeof window === "undefined";

    if (useDynamic) {
      try {
        // Step 1: Fetch supported assets from Robinhood
        const discoveredAssets = await fetchRobinhoodAssets();

        if (discoveredAssets.length === 0) {
          console.warn("[Asset Registry] No assets discovered - using static");
          buildStaticRegistry();
          return;
        }

        // Step 2: Fetch Prime wallet addresses (server-side only)
        if (serverSide) {
          await fetchPrimeWalletAddresses();
        }

        // Step 3: Build dynamic registry
        ASSET_REGISTRY = buildDynamicRegistry(discoveredAssets);

        console.log(
          `[Asset Registry] Initialized with ${
            Object.keys(ASSET_REGISTRY).length
          } assets (dynamic)`
        );
      } catch (error) {
        console.error("[Asset Registry] Dynamic initialization failed:", error);
        console.warn("[Asset Registry] Falling back to static registry");
        buildStaticRegistry();
      }
    } else {
      buildStaticRegistry();
    }

    REGISTRY_INITIALIZED = true;
  })();

  return REGISTRY_INIT_PROMISE;
}

/**
 * Build registry from Robinhood Discovery + Prime addresses + Static metadata
 */
function buildDynamicRegistry(
  discoveredAssets: DiscoveredAsset[]
): Record<string, RobinhoodAssetConfig> {
  const registry: Record<string, RobinhoodAssetConfig> = {};

  for (const discovered of discoveredAssets) {
    const symbol = discovered.symbol;

    // Get static metadata
    const metadata = EVM_ASSETS[symbol] || NON_EVM_ASSETS[symbol];

    if (!metadata) {
      console.warn(`[Asset Registry] No metadata for ${symbol} - skipping`);
      continue;
    }

    // Get Prime deposit address
    const depositAddress = getPrimeAddress(symbol);

    if (!depositAddress) {
      console.warn(
        `[Asset Registry] No Prime address for ${symbol} - skipping`
      );
      continue;
    }

    // Validate network match
    const primaryNetwork = discovered.networks[0];
    if (primaryNetwork && metadata.network !== primaryNetwork) {
      console.warn(
        `[Asset Registry] Network mismatch for ${symbol}: ` +
          `metadata=${metadata.network}, discovered=${primaryNetwork}`
      );
    }

    // Build complete config
    registry[symbol] = {
      ...metadata,
      depositAddress,
      enabled: true, // Enabled if discovered by Robinhood
    };
  }

  return registry;
}

/**
 * Build static registry (fallback)
 * Uses hardcoded addresses from Sub-Plan 9
 */
function buildStaticRegistry(): void {
  // Import static addresses
  const { EVM_DEPOSIT_ADDRESSES } = require("./evm-assets-static");
  const { NON_EVM_DEPOSIT_ADDRESSES } = require("./non-evm-assets-static");

  const registry: Record<string, RobinhoodAssetConfig> = {};

  // Add EVM assets
  for (const [symbol, asset] of Object.entries(EVM_ASSETS)) {
    const depositAddress = EVM_DEPOSIT_ADDRESSES[symbol];
    if (depositAddress) {
      registry[symbol] = {
        ...asset,
        depositAddress,
      };
    }
  }

  // Add Non-EVM assets
  for (const [symbol, asset] of Object.entries(NON_EVM_ASSETS)) {
    const depositAddress = NON_EVM_DEPOSIT_ADDRESSES[symbol];
    if (depositAddress) {
      registry[symbol] = {
        ...asset,
        depositAddress,
      };
    }
  }

  ASSET_REGISTRY = registry;
  console.log(
    `[Asset Registry] Initialized with ${
      Object.keys(registry).length
    } assets (static)`
  );
}

/**
 * Get asset registry (synchronous)
 * Requires prior initialization via initializeAssetRegistry()
 */
export function getAssetRegistry(): Record<string, RobinhoodAssetConfig> {
  if (!REGISTRY_INITIALIZED || !ASSET_REGISTRY) {
    console.warn("[Asset Registry] Not initialized - returning empty registry");
    console.warn("[Asset Registry] Call initializeAssetRegistry() first");
    return {};
  }

  return ASSET_REGISTRY;
}

/**
 * Get asset config by symbol
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
 * Get featured assets
 */
export function getFeaturedAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.featured)
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Check if registry is ready
 */
export function isRegistryReady(): boolean {
  return REGISTRY_INITIALIZED;
}

/**
 * Validate registry completeness
 */
export function validateAssetRegistry(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    missingAddresses: number;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const registry = getAssetRegistry();

  let missingAddresses = 0;

  for (const [symbol, asset] of Object.entries(registry)) {
    if (!asset.depositAddress?.address) {
      errors.push(`Asset ${symbol} missing deposit address`);
      missingAddresses++;
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
      missingAddresses,
    },
  };
}
```

### Step 5: Add Initialization to App Startup

**File**: `app/layout.tsx` (or create new initialization file)

**Action**: Initialize registry when app starts

**Code**:

```typescript
import { initializeAssetRegistry } from "@/lib/robinhood/assets/registry";

/**
 * Initialize asset registry on server startup
 * This runs once when the Next.js server starts
 */
if (typeof window === "undefined") {
  // Server-side initialization
  initializeAssetRegistry({
    useDynamic: process.env.NODE_ENV === "production", // Dynamic in prod, static in dev
    serverSide: true,
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL, // NEW: Sync with SP10 backend token map
  }).catch((error) => {
    console.error("[App Startup] Failed to initialize asset registry:", error);
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Alternative**: Create dedicated initialization file

**File**: `lib/robinhood/init.ts`

```typescript
/**
 * Robinhood Connect Initialization
 * Call this once at app startup (server-side)
 */

import { initializeAssetRegistry } from "./assets/registry";

export async function initializeRobinhoodConnect(): Promise<void> {
  console.log("[Robinhood Connect] Initializing...");

  const startTime = Date.now();

  try {
    // Initialize asset registry
    await initializeAssetRegistry({
      useDynamic: shouldUseDynamicRegistry(),
      serverSide: true,
    });

    const duration = Date.now() - startTime;
    console.log(`[Robinhood Connect] Initialized in ${duration}ms`);
  } catch (error) {
    console.error("[Robinhood Connect] Initialization failed:", error);
    throw error;
  }
}

function shouldUseDynamicRegistry(): boolean {
  // Use dynamic in production, static in development (for speed)
  if (process.env.FORCE_DYNAMIC_REGISTRY === "true") return true;
  if (process.env.FORCE_STATIC_REGISTRY === "true") return false;

  return process.env.NODE_ENV === "production";
}
```

Then call from `next.config.mjs` or `instrumentation.ts`:

**File**: `instrumentation.ts` (Next.js 13+ app directory)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeRobinhoodConnect } = await import("./lib/robinhood/init");
    await initializeRobinhoodConnect();
  }
}
```

### Step 6: Add Environment Variables

**File**: `.env.local`

**Action**: Add configuration flags

**Code**:

```bash
# Robinhood Connect Configuration
NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID=your-app-id-here

# Asset Registry Mode
# Options: 'dynamic' (fetch from APIs) or 'static' (use hardcoded)
FORCE_DYNAMIC_REGISTRY=false  # Set true in production
FORCE_STATIC_REGISTRY=true    # Set true for local dev (faster)

# Coinbase Prime API (for fetching deposit addresses)
COINBASE_PRIME_ACCESS_KEY=your-access-key
COINBASE_PRIME_SIGNING_KEY=your-signing-key
COINBASE_PRIME_PASSPHRASE=your-passphrase
COINBASE_PRIME_PORTFOLIO_ID=your-portfolio-id
```

### Step 7: Create Static Fallback Files

**File**: `lib/robinhood/assets/evm-assets-static.ts`

**Action**: Preserve current hardcoded addresses as fallback

**Code**:

```typescript
/**
 * Static EVM Deposit Addresses (Fallback)
 *
 * Used when:
 * - Prime API is unavailable
 * - Development mode (faster startup)
 * - Emergency fallback
 *
 * Source: Coinbase Prime Trading Balance wallets (as of Sub-Plan 9)
 */

import type { RobinhoodDepositAddress } from "../types";

export const EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  ETH: {
    address: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
  },
  USDC: {
    address: "0xd71a079cb64480334ffb400f017a0dde94f553dd",
  },
  // ... copy all addresses from current evm-assets.ts
};
```

**File**: `lib/robinhood/assets/non-evm-assets-static.ts`

```typescript
/**
 * Static Non-EVM Deposit Addresses (Fallback)
 */

import type { RobinhoodDepositAddress } from "../types";

export const NON_EVM_DEPOSIT_ADDRESSES: Record<
  string,
  RobinhoodDepositAddress
> = {
  BTC: {
    address: "3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC",
  },
  XLM: {
    address: "GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5",
    memo: "1380611530",
  },
  // ... copy all addresses from current non-evm-assets.ts
};
```

### Step 8: Update Export Script

**File**: `scripts/export-otc-tokens.ts`

**Action**: Update to use dynamic registry

**Changes**:

```typescript
import {
  initializeAssetRegistry,
  getAssetRegistry,
} from "../lib/robinhood/assets/registry";

async function main() {
  console.log("🚀 Exporting Robinhood Connect assets as OTC tokens...\n");

  // Initialize registry
  console.log("📡 Fetching latest assets from Robinhood API...");
  await initializeAssetRegistry({ useDynamic: true, serverSide: true });

  // Get all enabled assets
  const registry = getAssetRegistry();
  const otcTokens = Object.values(registry)
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      address: asset.depositAddress.address,
      symbol: asset.symbol,
      name: asset.name,
      memo: asset.depositAddress.memo || null,
      logoUrl: asset.icon ? `/assets/crypto-icons/${asset.icon}` : null,
    }));

  console.log(`✅ Found ${otcTokens.length} enabled assets\n`);

  // ... rest of export logic
}
```

### Step 9: Sync with Backend Token Map (SP10 Integration)

**File**: `lib/robinhood/assets/registry.ts`

**Action**: Add validation against SP10's backend token mapping

**Code**:

```typescript
import {
  fetchBackendTokens,
  BACKEND_TOKEN_MAP,
} from "@/lib/backend-integration";

/**
 * Validate registry against backend token map (from SP10)
 * Ensures our assets will work with pledge creation
 */
export async function validateAgainstBackend(backendUrl: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Fetch backend tokens
    console.log("[Registry Validation] Fetching backend token map...");
    const backendTokens = await fetchBackendTokens(backendUrl);

    const registry = getAssetRegistry();

    // Check each asset in our registry
    for (const [symbol, asset] of Object.entries(registry)) {
      const backendToken = backendTokens[symbol];

      if (!backendToken) {
        warnings.push(
          `Asset ${symbol} in registry but not in backend - pledge creation will fail`
        );
        continue;
      }

      // Validate decimals match
      if (asset.decimals !== backendToken.decimals) {
        errors.push(
          `Decimals mismatch for ${symbol}: ` +
            `Registry=${asset.decimals}, Backend=${backendToken.decimals}`
        );
      }

      // Update BACKEND_TOKEN_MAP with fetched IDs
      BACKEND_TOKEN_MAP[symbol] = backendToken;
    }

    // Check for backend tokens we don't support
    for (const [symbol, backendToken] of Object.entries(backendTokens)) {
      if (!registry[symbol]) {
        warnings.push(
          `Backend has ${symbol} but not in registry - add to support donations`
        );
      }
    }

    console.log(
      `[Registry Validation] Validated ${Object.keys(registry).length} assets`
    );
    console.log(
      `[Registry Validation] Errors: ${errors.length}, Warnings: ${warnings.length}`
    );

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    console.error(
      "[Registry Validation] Failed to validate against backend:",
      error
    );
    return {
      valid: false,
      errors: [`Failed to fetch backend tokens: ${error}`],
      warnings: [],
    };
  }
}

/**
 * Update BACKEND_TOKEN_MAP with current registry
 * Call this after registry initialization
 */
export function syncBackendTokenMap(backendUrl: string): Promise<void> {
  return validateAgainstBackend(backendUrl).then((result) => {
    if (!result.valid) {
      console.error(
        "[Registry Sync] Backend token map sync failed:",
        result.errors
      );
    }
    if (result.warnings.length > 0) {
      console.warn("[Registry Sync] Warnings:", result.warnings);
    }
  });
}
```

**Update** `initializeAssetRegistry()`:

```typescript
export async function initializeAssetRegistry(options?: {
  useDynamic?: boolean;
  serverSide?: boolean;
  backendUrl?: string; // NEW: For SP10 integration
}): Promise<void> {
  // ... existing initialization code ...

  REGISTRY_INITIALIZED = true;

  // NEW: Sync with backend token map (SP10)
  if (options?.backendUrl) {
    console.log("[Asset Registry] Syncing with backend token map...");
    await syncBackendTokenMap(options.backendUrl);
  }
})();

return REGISTRY_INIT_PROMISE;
}
```

**Validation**:

The registry will now automatically sync with SP10's backend token mapping, ensuring pledge creation will work correctly.

### Step 10: Add Health Check Endpoint

**File**: `app/api/robinhood/health/route.ts`

**Action**: Create endpoint to check registry status

**Code**:

```typescript
import { NextResponse } from "next/server";
import {
  isRegistryReady,
  validateAssetRegistry,
  getAssetRegistry,
} from "@/lib/robinhood/assets/registry";
import { isPrimeAddressCacheReady } from "@/lib/robinhood/assets/prime-addresses";

export async function GET() {
  const registryReady = isRegistryReady();
  const primeReady = isPrimeAddressCacheReady();
  const validation = registryReady ? validateAssetRegistry() : null;

  // Get wallet type distribution
  let walletTypes: Record<string, number> = {};
  if (registryReady) {
    const registry = getAssetRegistry();
    walletTypes = Object.values(registry).reduce((acc, asset) => {
      const type = asset.depositAddress?.walletType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  return NextResponse.json({
    status: registryReady && primeReady ? "healthy" : "initializing",
    registry: {
      initialized: registryReady,
      validation: validation
        ? {
            valid: validation.valid,
            totalAssets: validation.stats.total,
            enabledAssets: validation.stats.enabled,
            errors: validation.errors.length,
            warnings: validation.warnings.length,
          }
        : null,
    },
    primeAddresses: {
      initialized: primeReady,
      walletTypes: Object.keys(walletTypes).length > 0 ? walletTypes : null,
    },
    timestamp: new Date().toISOString(),
  });
}
```

**Usage**:

```bash
curl http://localhost:3030/api/robinhood/health
```

### Step 11: Add Startup Toast with Asset Registry Table

**File**: `lib/robinhood/init.ts`

**Action**: Display toast notification showing loaded assets on startup

**Code**:

```typescript
// NOTE: This must run CLIENT-SIDE, so extract to separate component
// Server-side init.ts cannot call toast directly

export async function initializeRobinhoodConnect(): Promise<void> {
  console.log("[Robinhood Connect] Initializing...");

  const startTime = Date.now();

  try {
    // Initialize asset registry
    await initializeAssetRegistry({
      useDynamic: shouldUseDynamicRegistry(),
      serverSide: true,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    });

    const duration = Date.now() - startTime;
    console.log(`[Robinhood Connect] Initialized in ${duration}ms`);

  } catch (error) {
    console.error("[Robinhood Connect] Initialization failed:", error);
    throw error;
  }
}
```

**Note**: Toast must be shown from client component, not server-side initialization.

**Client-Side Component** (RECOMMENDED):

**File**: `components/asset-registry-toast.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAssetRegistry, isRegistryReady } from "@/lib/robinhood";
import type { RobinhoodAssetConfig } from "@/lib/robinhood/types";

export function AssetRegistryToast() {
  useEffect(() => {
    // Show toast after registry is loaded
    const timer = setTimeout(() => {
      if (isRegistryReady()) {
        showRegistryToast();
      }
    }, 1500); // Wait 1.5s for registry to initialize

    return () => clearTimeout(timer);
  }, []);

  return null; // No UI, just side effects
}

function showRegistryToast() {
  const registry = getAssetRegistry();
  const enabled = Object.values(registry).filter((a) => a.enabled);

  if (enabled.length === 0) {
    toast({
      title: "⚠️ Asset Registry",
      description: "No assets loaded. Using static fallback.",
      variant: "destructive",
    });
    return;
  }

  // Group by category
  const byCategory = enabled.reduce(
    (acc, asset) => {
      if (!acc[asset.category]) acc[asset.category] = [];
      acc[asset.category].push(asset);
      return acc;
    },
    {} as Record<string, RobinhoodAssetConfig[]>
  );

  // Group by wallet type
  const byWalletType = enabled.reduce(
    (acc, asset) => {
      const type = asset.depositAddress?.walletType || "Unknown";
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    },
    {} as Record<string, number>
  );

  // Build description
  const categoryLines = Object.entries(byCategory)
    .sort((a, b) => b[1].length - a[1].length) // Sort by count desc
    .map(([category, assets]) => {
      const symbols = assets.map((a) => a.symbol).join(", ");
      return `${category}: ${assets.length} (${symbols})`;
    })
    .join("\n");

  const walletLines = Object.entries(byWalletType)
    .map(([type, count]) => `${type}: ${count}`)
    .join(" | ");

  const description = `
${categoryLines}

Wallet Types: ${walletLines}

Total: ${enabled.length} assets enabled
  `.trim();

  toast({
    title: "✅ Dynamic Asset Registry Loaded",
    description: (
      <div className="space-y-2 font-mono text-xs">
        <div className="space-y-1">
          <div className="font-semibold">Assets by Category:</div>
          {Object.entries(byCategory)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, assets]) => (
              <div key={category} className="pl-2">
                <span className="font-medium capitalize">{category}</span>:{" "}
                {assets.length} ({assets.map((a) => a.symbol).slice(0, 5).join(", ")}
                {assets.length > 5 ? "..." : ""})
              </div>
            ))}
        </div>

        <div className="space-y-1 pt-2 border-t">
          <div className="font-semibold">Wallet Types:</div>
          {Object.entries(byWalletType).map(([type, count]) => (
            <div key={type} className="pl-2">
              {type}: {count}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t font-semibold">
          Total: {enabled.length} assets enabled
        </div>
      </div>
    ),
  });
}
```

**Usage in Layout**:

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AssetRegistryToast } from '@/components/asset-registry-toast' // NEW
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Robinhood Connect - Crypto Donations',
  description: 'Transfer crypto from Robinhood to support causes you care about',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AssetRegistryToast /> {/* NEW: Show registry toast on startup */}
          {children}
          <Toaster /> {/* Already exists - provides toast UI */}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Validation**:

```bash
# Start app
npm run dev

# Open http://localhost:3030
# Should see toast in bottom-right with asset table
```

**Expected Toast Content**:

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Dynamic Asset Registry Loaded                            │
│                                                             │
│ Assets by Category                                          │
│ ┌─────────────┬───────┬──────────────────────────────────┐ │
│ │ Category    │ Count │ Symbols                          │ │
│ ├─────────────┼───────┼──────────────────────────────────┤ │
│ │ layer1      │   10  │ BTC, ETH, SOL, AVAX, LTC...      │ │
│ │ layer2      │    1  │ MATIC                            │ │
│ │ stablecoin  │    1  │ USDC                             │ │
│ │ defi        │    6  │ AAVE, UNI, LINK, COMP, CRV...    │ │
│ │ meme        │    5  │ SHIB, PEPE, FLOKI, BONK...       │ │
│ │ other       │    3  │ TRUMP, VIRTUAL, WLFI             │ │
│ └─────────────┴───────┴──────────────────────────────────┘ │
│                                                             │
│ Wallet Distribution                                         │
│ ┌──────────────────┬───────┐                               │
│ │ Wallet Type      │ Count │                               │
│ ├──────────────────┼───────┤                               │
│ │ Trading          │   22  │                               │
│ │ Trading Balance  │    4  │                               │
│ │ Other            │    0  │                               │
│ └──────────────────┴───────┘                               │
│                                                             │
│ Total: 26 assets enabled                                   │
└─────────────────────────────────────────────────────────────┘
```

**Toast Features**:
- ✅ Appears automatically on app startup
- ✅ Position: Bottom-right (non-intrusive)
- ✅ Duration: 10 seconds (enough time to read)
- ✅ Shows dynamic vs static mode
- ✅ Category breakdown with asset counts
- ✅ Wallet type distribution (Trading prioritization visible)
- ✅ Total asset count
- ✅ Dismissible by clicking X or waiting

---

## Deliverables Checklist

- [ ] `lib/robinhood/assets/discovery.ts` - Robinhood API client
- [ ] `lib/robinhood/assets/prime-addresses.ts` - Prime wallet lookup with priority logic
- [ ] `lib/robinhood/assets/evm-assets.ts` - Updated (metadata only)
- [ ] `lib/robinhood/assets/non-evm-assets.ts` - Updated (metadata only)
- [ ] `lib/robinhood/assets/evm-assets-static.ts` - Static fallback
- [ ] `lib/robinhood/assets/non-evm-assets-static.ts` - Static fallback
- [ ] `lib/robinhood/assets/registry.ts` - Updated (dynamic builder + SP10 sync)
- [ ] `lib/robinhood/init.ts` - Initialization helper
- [ ] `instrumentation.ts` - App startup hook (with backend URL)
- [ ] `app/api/robinhood/health/route.ts` - Health check endpoint (with wallet types)
- [ ] `lib/robinhood/init.ts` - Updated with toast notification on startup
- [ ] `components/asset-registry-toast.tsx` - React component for toast (optional alternative)
- [ ] `scripts/generate_prime_wallets.py` - Updated with `--all-wallets` flag and priority logic
- [ ] `scripts/export-otc-tokens.ts` - Updated for dynamic registry
- [ ] `.env.local` - Configuration variables (including NEXT_PUBLIC_BACKEND_URL)
- [ ] Tests pass
- [ ] Health check returns healthy status with wallet type distribution
- [ ] Verify Trading accounts are prioritized over Trading Balance
- [ ] Verify backend token map sync works (from SP10)
- [ ] Validate decimals match between registry and backend
- [ ] Toast appears on app startup with asset table
- [ ] Toast shows category breakdown and wallet distribution

---

## Validation Steps

### 1. Test Discovery API

```bash
# Test Robinhood Asset Discovery
curl -s "https://api.robinhood.com/catpay/v1/supported_currencies/?applicationId=YOUR_APP_ID" | jq
```

**Expected**: JSON with `cryptoCurrencyPairs` array

### 2. Test Dynamic Initialization

```bash
# Start app with dynamic mode
export FORCE_DYNAMIC_REGISTRY=true
npm run dev
```

Check logs:

```
[Discovery API] Fetching supported assets...
[Discovery API] Found 45 asset pairs
[Prime Addresses] Fetching wallet addresses from Coinbase Prime...
[Prime Addresses] Priority: Trading > Trading Balance
[Prime Addresses] BTC: Selected Trading (2 wallets available)
[Prime Addresses] ETH: Selected Trading (2 wallets available)
[Prime Addresses] SOL: Selected Trading Balance (1 wallets available)
[Prime Addresses] Fetched 32 addresses
[Prime Addresses] Wallet types: { Trading: 25, "Trading Balance": 5, Other: 2 }
[Asset Registry] Initialized with 28 assets (dynamic)
```

### 3. Test Health Check

```bash
curl http://localhost:3030/api/robinhood/health | jq
```

**Expected**:

```json
{
  "status": "healthy",
  "registry": {
    "initialized": true,
    "validation": {
      "valid": true,
      "totalAssets": 28,
      "enabledAssets": 28,
      "errors": 0,
      "warnings": 0
    }
  },
  "primeAddresses": {
    "initialized": true,
    "walletTypes": {
      "Trading": 25,
      "Trading Balance": 3,
      "Other": 0
    }
  }
}
```

### 4. Verify Wallet Type Selection

```bash
# Test Python script directly
python3 scripts/generate_prime_wallets.py --all-wallets | jq '[.[] | select(.status == "found") | {symbol, wallet_name}] | group_by(.wallet_name) | map({wallet_type: .[0].wallet_name, count: length})'
```

**Expected**: Show distribution of wallet types selected

### 5. Test Static Fallback

```bash
# Start with static mode
export FORCE_STATIC_REGISTRY=true
npm run dev
```

Check logs:

```
[Asset Registry] Initializing...
[Asset Registry] Using static registry
[Asset Registry] Initialized with 27 assets (static)
```

### 6. Test Backend Token Sync (SP10 Integration)

```bash
# Start app with backend URL configured
export NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org
export FORCE_DYNAMIC_REGISTRY=true
npm run dev
```

Check logs for:

```
[Asset Registry] Syncing with backend token map...
[Registry Validation] Fetching backend token map...
[Registry Validation] Validated 28 assets
[Registry Validation] Errors: 0, Warnings: 0
```

**If validation fails**:

- Check decimals match: `Registry=18, Backend=18` ✅
- Look for warnings: Assets in POC but not in backend
- Fix mismatches before enabling pledges

### 7. Test Startup Toast

```bash
# Start app with dynamic registry
export FORCE_DYNAMIC_REGISTRY=true
export NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org
npm run dev
```

**Open** `http://localhost:3030`

**Expected**:
- Toast appears in bottom-right corner within 1-2 seconds
- Shows "Dynamic Asset Registry Loaded" title
- Displays table with asset categories and counts
- Shows wallet type distribution
- Toast dismisses after 10 seconds

**Toast Should Show**:
- Assets by Category (layer1, layer2, stablecoin, defi, meme, other)
- Symbol list for each category
- Wallet Distribution (Trading vs Trading Balance counts)
- Total enabled assets count

### 8. Verify Dashboard Works

1. Navigate to `/dashboard`
2. Assets should load
3. Select BTC
4. Generate URL should work

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure dynamic registry doesn't break existing functionality

**Commands**:

```bash
# Build
npm run build

# Start in static mode (safe)
export FORCE_STATIC_REGISTRY=true
npm run dev

# Test dashboard
open http://localhost:3030/dashboard
```

**Success Criteria**:

- ✅ Build succeeds
- ✅ Dashboard loads
- ✅ Assets display correctly
- ✅ URL generation works
- ✅ Health check returns healthy
- ✅ Toast appears on startup with asset table
- ✅ Toast shows wallet type distribution

**If Checkpoint Fails**:

1. Check initialization logs for errors
2. Verify env variables are set
3. Test health endpoint for specific errors
4. Fall back to static mode: `FORCE_STATIC_REGISTRY=true`

---

## Common Issues and Solutions

### Issue 1: Discovery API Returns 401

**Symptom**: `Discovery API failed: 401 Unauthorized`

**Solution**:

```bash
# Verify application ID is set
echo $NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID

# Check it's the correct ID from Robinhood dashboard
```

### Issue 2: Prime Address Fetch Fails

**Symptom**: `Prime Addresses: Failed to fetch addresses`

**Solution**:

- Verify Coinbase Prime credentials in `.env.local`
- Check Python script runs: `python3 scripts/generate_prime_wallets.py`
- Use static fallback: `FORCE_STATIC_REGISTRY=true`

### Issue 3: Registry Not Initialized

**Symptom**: `Asset Registry: Not initialized - returning empty registry`

**Solution**:

```typescript
// In components, check if ready
import { isRegistryReady } from "@/lib/robinhood/assets/registry";

if (!isRegistryReady()) {
  return <div>Loading assets...</div>;
}
```

### Issue 4: Startup Too Slow

**Symptom**: App takes 5+ seconds to start

**Solution**:

```bash
# Use static mode in development
export FORCE_STATIC_REGISTRY=true

# Only use dynamic in production
export NODE_ENV=production
export FORCE_DYNAMIC_REGISTRY=true
```

### Issue 5: Toast Not Appearing

**Symptom**: No toast shows on app startup

**Solution**:

1. Check registry is initialized:
   ```typescript
   import { isRegistryReady } from "@/lib/robinhood/assets/registry";
   console.log("Registry ready:", isRegistryReady());
   ```

2. Verify toast system is installed:
   ```bash
   # shadcn/ui toast is already in project
   # Check hooks/use-toast.ts exists
   ls -la hooks/use-toast.ts
   ```

3. Check Toaster component is in layout:
   ```typescript
   // app/layout.tsx should have
   import { Toaster } from "@/components/ui/toaster";
   // And render <Toaster /> in body
   ```

4. Enable console logging:
   ```bash
   # Look for: [Robinhood Connect] Initialized in Xms
   # If missing, registry didn't initialize
   ```

5. Test manually:
   ```typescript
   import { toast } from "@/hooks/use-toast";
   toast({
     title: "Test Toast",
     description: "If you see this, toast system works!",
   });
   ```

---

## Integration Points

### With Sub-Plan 9: Backend Alignment

- Builds on registry structure from SP9
- Converts static → dynamic
- Preserves all types and interfaces

### With Sub-Plan 10: Backend Pledge Integration

**Token ID Sync** (IMPORTANT):

The dynamic asset registry should sync with SP10's backend token mapping:

```typescript
// In prime-addresses.ts, after fetching Prime addresses:
import { fetchBackendTokens } from "@/lib/backend-integration";

// Sync with backend token IDs
const backendTokens = await fetchBackendTokens(backendUrl);

// Validate our assets match backend tokens
for (const [symbol, asset] of Object.entries(registry)) {
  const backendToken = backendTokens[symbol];
  if (!backendToken) {
    console.warn(
      `[Registry] Asset ${symbol} not in backend - won't work for pledges`
    );
  } else if (asset.decimals !== backendToken.decimals) {
    console.error(
      `[Registry] Decimals mismatch for ${symbol}: ` +
        `POC=${asset.decimals}, Backend=${backendToken.decimals}`
    );
  }
}
```

**Why This Matters**:

- SP10's `token-resolver.ts` maps symbols → backend token IDs
- Dynamic registry must have matching symbols and decimals
- Mismatches will cause pledge creation to fail

**Integration Flow**:

```
1. SP11 fetches Robinhood Discovery API → Supported assets
2. SP11 fetches Prime API → Wallet addresses
3. SP11 merges with static metadata → Complete registry
4. SP11 syncs with backend token map → Validates decimals
5. SP11 shows startup toast → Displays loaded assets
6. SP10 uses registry symbols → Maps to backend token IDs
7. SP10 creates pledges → Backend accepts valid token IDs
```

### With Future Backend Integration

**When migrating to production**:

```typescript
// POC: Fetch from APIs at startup
await initializeAssetRegistry({ useDynamic: true });

// Production: Query database
const assetService = new AssetService(db);
const assets = await assetService.findAll({ enabled: true });
```

**Backend Token Sync**:

When dynamic registry is enabled, it should update SP10's `BACKEND_TOKEN_MAP`:

```typescript
// After registry initialization
import { BACKEND_TOKEN_MAP } from "@/lib/backend-integration";

// Update token map with fetched backend IDs
const backendTokens = await fetchBackendTokens(backendUrl);
Object.assign(BACKEND_TOKEN_MAP, backendTokens);
```

---

## Next Steps

After completing this sub-plan:

1. **Verify Toast Display**: Ensure startup toast shows correctly
   - Check toast appears on app load
   - Verify table shows all asset categories
   - Confirm wallet distribution is accurate
   - Test with both dynamic and static modes

2. **Verify SP10 Integration**: Ensure pledge creation works with dynamic registry
   - Test `createPledgeFromCallback()` with dynamically fetched assets
   - Verify backend token IDs are correctly synced
   - Validate decimals match between registry and backend

3. **Monitor performance**: How long does initialization take?
   - Robinhood Discovery API: < 1s
   - Prime Address Fetch: 2-3s (depends on asset count)
   - Backend Token Sync: < 1s
   - Toast display: < 100ms
   - Total: < 5s acceptable for server startup

4. **Set up caching**: Cache Discovery API response for 1 hour
5. **Add retry logic**: Retry failed API calls
6. **Create sync script**: Periodic job to refresh addresses
7. **Add alerting**: Notify if Discovery API differs from our assets
8. **Toast enhancements**: Add click-to-dismiss, expandable details

---

## Risk Assessment

**🟢 LOW RISK**:

- Static fallback always available
- Graceful degradation if APIs fail
- No changes to existing URL generation

**🟡 MEDIUM RISK**:

- Startup dependency on external APIs
- Prime API requires credentials
- Initialization might be slow

**🔴 CRITICAL RISK**: Minimal

- Mitigation: Always use static fallback
- Mitigation: Health check validates initialization
- Mitigation: Can disable dynamic mode anytime
- **SP10 Integration Risk**: Decimals mismatch between registry and backend
  - Mitigation: Automatic validation on startup
  - Mitigation: Logs errors if decimals don't match
  - Mitigation: Backend will reject invalid pledges (fail-safe)

---

## Time Estimate Breakdown

- **Reading context**: 15-20 minutes
- **Step 1-2 (API clients)**: 45-60 minutes
- **Step 3-4 (Registry updates)**: 60-75 minutes
- **Step 5-6 (Initialization)**: 30-45 minutes
- **Step 7 (Static fallback)**: 20-30 minutes
- **Step 8-9 (Scripts + health)**: 20-30 minutes
- **Step 10 (Backend sync)**: 15-20 minutes
- **Step 11 (Startup toast)**: 20-30 minutes
- **Validation**: 30-45 minutes

**Total**: 3.5-4.5 hours

**Complexity**: Medium (API integration + async initialization + UI feedback)

---

## Success Indicators

✅ **Dynamic Mode**:

- Assets fetched from Robinhood API
- Addresses fetched from Prime API
- Registry builds successfully
- **Trading accounts prioritized** when available

✅ **Wallet Type Selection**:

- Health check shows wallet type distribution
- Logs indicate which wallet type selected per asset
- Trading accounts used for majority of assets (>80%)
- Trading Balance used only when Trading unavailable

✅ **Static Mode**:

- Falls back gracefully
- Uses Sub-Plan 9 addresses
- No errors in console

✅ **Performance**:

- Initialization < 3 seconds
- No blocking on main thread
- Health check responds quickly

✅ **Reliability**:

- Handles API failures gracefully
- Logs informative messages
- Always has working asset list

✅ **Transparency**:

- Logs show which wallet type selected for each asset
- Health endpoint exposes wallet type distribution
- Clear warnings when fallback to non-preferred wallet

✅ **SP10 Integration**:

- Backend token map automatically synced on startup
- Decimals validated against backend database
- Warnings for assets in POC but not in backend
- Pledge creation will work with dynamically fetched assets
- Token IDs correct for backend API calls

✅ **User Experience**:

- Startup toast shows asset registry loaded successfully
- Table displays assets grouped by category
- Shows wallet type distribution (Trading vs Trading Balance)
- 10-second duration provides good visibility
- Bottom-right position doesn't obstruct UI
- Clear, informative summary of what was loaded
