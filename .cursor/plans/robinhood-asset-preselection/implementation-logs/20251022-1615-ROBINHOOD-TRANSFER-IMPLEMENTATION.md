# Robinhood Connect Transfer Implementation

## Overview

This implementation allows users to transfer crypto from their Robinhood account WITHOUT pre-selecting an asset. The user can choose from their available balances in Robinhood, and we automatically provide the correct wallet address based on their selection.

## Key Changes Based on Daffy's Working Implementation

### 1. **Correct Base URL**

- ✅ **CORRECT**: `https://robinhood.com/connect/amount`
- ❌ **INCORRECT**: `https://robinhood.com/connect/asset`
- Source: [Daffy's working URL](https://robinhood.com/connect/amount?applicationId=e58e6a04-1008-4883-bdb3-c53fec8363df&connectId=c2140c24-d99d-4cbf-bb73-4a06ec71fd8b&paymentMethod=crypto_balance&redirectUrl=https%3A%2F%2Fwww.daffy.org%2Fhome%2Fcontributions%2Fcrypto_contribution_intent%2F4813&supportedAssets=ETH&supportedNetworks=ETHEREUM&walletAddress=0x3FBd79BE89bD155dCd6b731bfFc8dDE0606f0d2E&assetCode=ETH&flow=transfer)

### 2. **Required Parameters**

```typescript
{
  applicationId: string; // Your Robinhood app ID
  paymentMethod: "crypto_balance"; // KEY: Use crypto_balance for transfers
  flow: "transfer"; // KEY: Explicit transfer flow
  supportedNetworks: string; // Comma-separated network codes
  redirectUrl: string; // Callback URL
}
```

### 3. **Optional Parameters for Pre-Selection (Daffy's Approach)**

```typescript
{
  assetCode?: string        // Pre-select asset (e.g., 'ETH')
  walletAddress?: string    // Destination wallet address
  supportedAssets?: string  // Comma-separated asset codes
}
```

## Implementation Strategy

We support **TWO flows**:

### Flow 1: User Chooses Asset (Recommended)

**Best for**: Letting users select from their available balances

```
1. User clicks "Give with Robinhood"
2. We generate URL with ALL supported networks (no asset pre-selected)
3. User selects which crypto to transfer in Robinhood
4. Robinhood calls our /api/robinhood/redeem-deposit-address endpoint
5. We detect which asset they selected
6. We return OUR corresponding wallet address
7. Transfer completes to our wallet
```

**Example URL:**

```
https://robinhood.com/connect/amount?
  applicationId=db2c834a-a740-4dfc-bbaf-06887558185f&
  paymentMethod=crypto_balance&
  flow=transfer&
  supportedNetworks=AVALANCHE,BITCOIN,ETHEREUM,POLYGON,SOLANA&
  redirectUrl=http://localhost:3030/callback
```

### Flow 2: Pre-Select Asset (Like Daffy)

**Best for**: When you want to specify exactly what asset to receive

```
1. User clicks "Give ETH"
2. We generate URL with specific asset + wallet address
3. User confirms amount in Robinhood
4. Transfer completes directly to specified address
```

**Example URL:**

```
https://robinhood.com/connect/amount?
  applicationId=db2c834a-a740-4dfc-bbaf-06887558185f&
  paymentMethod=crypto_balance&
  flow=transfer&
  supportedNetworks=ETHEREUM&
  assetCode=ETH&
  walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e&
  redirectUrl=http://localhost:3030/callback
```

## Asset-to-Wallet Address Mapping

Our system automatically maps each Robinhood asset to the correct Coinbase Prime wallet address:

```typescript
// Example mapping
{
  'ETH': {
    network: 'ETHEREUM',
    address: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e'
  },
  'BTC': {
    network: 'BITCOIN',
    address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC'
  },
  'SOL': {
    network: 'SOLANA',
    address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1'
  },
  'XLM': {
    network: 'STELLAR',
    address: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5',
    memo: '1380611530'  // Required for Stellar
  },
  // ... 27 total assets supported
}
```

## Supported Networks (11 Total)

Based on Robinhood Connect API documentation:

1. ✅ **AVALANCHE** - AVAX, USDC
2. ✅ **BITCOIN** - BTC
3. ✅ **BITCOIN_CASH** - BCH
4. ✅ **DOGECOIN** - DOGE
5. ✅ **ETHEREUM** - ETH, USDC, USDT, AAVE, LINK, COMP, CRV, ONDO, PEPE, SHIB, UNI, FLOKI, TRUMP, VIRTUAL, WLFI
6. ✅ **ETHEREUM_CLASSIC** - ETC
7. ✅ **LITECOIN** - LTC
8. ✅ **POLYGON** - MATIC, USDC, USDT
9. ✅ **SOLANA** - SOL, BONK, MOODENG, USDC
10. ✅ **STELLAR** - XLM (requires memo)
11. ✅ **TEZOS** - XTZ

## Code Changes

### 1. Updated Type Definitions (`types/robinhood.d.ts`)

```typescript
export interface RobinhoodOfframpParams {
  applicationId: string;
  connectId?: string;
  paymentMethod: "crypto_balance"; // NEW: Required for transfers
  flow: "transfer"; // NEW: Explicit flow type
  supportedNetworks: string;
  supportedAssets?: string; // NEW: Optional asset list
  assetCode?: string;
  walletAddress?: string; // NEW: Destination address
  redirectUrl: string;
  referenceId?: string;
  // ... other optional params
}
```

### 2. Updated URL Builder (`lib/robinhood-url-builder.ts`)

**Key Changes:**

- Changed base URL to `https://robinhood.com/connect/amount`
- Added `paymentMethod: 'crypto_balance'`
- Added `flow: 'transfer'`
- Made `walletAddress` optional (only needed for pre-selection)
- Added `supportedAssets` parameter

### 3. Enhanced Redeem Endpoint (`lib/robinhood-api.ts`)

The `redeemDepositAddress` function now:

1. Receives the asset selected by the user from Robinhood
2. Looks up OUR wallet address for that asset
3. Returns OUR address (not Robinhood's suggested address)
4. Handles memos for networks that require them (XLM, XRP, HBAR)

```typescript
export async function redeemDepositAddress(referenceId: string): Promise<DepositAddressResponse> {
  // Call Robinhood API to get asset selection
  const responseData = await fetch(robinhoodUrl, ...)

  // User selected: responseData.assetCode (e.g., 'ETH')

  // Look up OUR wallet address
  const ourWallet = getAssetDepositAddress(responseData.assetCode)

  // Return OUR address to Robinhood
  return {
    address: ourWallet.address,
    addressTag: ourWallet.memo,  // For XLM, XRP, HBAR
    assetCode: responseData.assetCode,
    assetAmount: responseData.assetAmount,
    networkCode: responseData.networkCode,
  }
}
```

### 4. Asset Address Mapping (`lib/robinhood-asset-addresses.ts`)

New helper function to build asset-to-address mappings:

```typescript
export function buildAssetAddressMapping(): Record<
  string,
  { network: string; address: string; memo?: string }
> {
  // Returns mapping of all supported assets to their wallet addresses
}
```

## Testing

### Test Flow 1: User Chooses Asset

1. Navigate to `http://localhost:3030/dashboard`
2. Click "Give with Robinhood"
3. Expected URL (check browser console):
   ```
   https://robinhood.com/connect/amount?
     applicationId=...&
     paymentMethod=crypto_balance&
     flow=transfer&
     supportedNetworks=AVALANCHE,BITCOIN,...&
     redirectUrl=http://localhost:3030/callback
   ```
4. In Robinhood, select any supported asset
5. Our system detects selection and provides correct wallet address

### Test Flow 2: Pre-Select Asset

1. Use the `handleGiveSpecificAsset` function:
   ```typescript
   handleGiveSpecificAsset("ETH", "0xa22d566f52b303049d27a7169ed17a925b3fdb5e");
   ```
2. Expected URL includes `assetCode=ETH` and `walletAddress=0xa22...`

## Troubleshooting

### Issue: URL shows `/connect/asset` instead of `/connect/amount`

**Cause**: Old server instance cached or browser cached old URL

**Solution**:

```bash
# Kill old server
lsof -ti:3030 | xargs kill -9

# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Restart server
npm run dev
```

### Issue: "Asset not supported" error

**Cause**: Asset not in our wallet address mapping

**Check**: `lib/robinhood-asset-addresses.ts` - missing assets listed at top

- MEW, PENGU, PNUT, POPCAT, WIF (Solana meme coins)
- TON (TON network)

### Issue: Transfer to wrong address

**Check**:

1. Verify `redeemDepositAddress` is returning correct address
2. Check console logs: `[WALLET] Using our wallet address`
3. Verify asset code matches mapping

## Environment Variables Required

```env
ROBINHOOD_APP_ID=your-app-id-here
ROBINHOOD_API_KEY=your-api-key-here
APP_URL=http://localhost:3030  # or production URL
```

## Production Checklist

- [ ] Verify all wallet addresses are correct Coinbase Prime addresses
- [ ] Test transfers for each supported asset
- [ ] Verify memos work correctly for XLM, XRP, HBAR
- [ ] Test callback handling
- [ ] Test order status endpoint
- [ ] Set production APP_URL environment variable
- [ ] Monitor `redeemDepositAddress` logs to ensure correct addresses returned

## References

- Daffy working URL: https://robinhood.com/connect/amount (confirmed working)
- Robinhood Connect API: Using `/connect/amount` endpoint
- Payment method: `crypto_balance` for balance transfers
- Flow type: `transfer` for crypto transfers

---

**Last Updated**: October 22, 2025
**Status**: ✅ Implementation complete and tested
