# Backend Integration Guide: Chain ID Mappers

## Overview

This document outlines the minimal changes needed to integrate Robinhood Connect network support into the Endaoment backend's chain ID mappers.

**Backend File to Modify**: 
```
/libs/api/config/src/lib/helpers/chain-id-mappers.ts
```

**Reference Implementation**:
```
robinhood-onramp/libs/shared/src/lib/helpers/chain-id-mappers.ts
```

## Minimal Changes Required

### 1. Expand `SupportedChainId` Type

**Add two new chain IDs for Robinhood-supported EVM networks**:

```typescript
export type SupportedChainId = 
  | 31337    // Local
  | 31338    // Alternative Local
  | 1        // Mainnet
  | 10       // OP Mainnet
  | 11155111 // Sepolia
  | 420      // Optimism Goerli
  | 42161    // Arbitrum One
  | 421613   // Arbitrum Goerli
  | 137      // Polygon
  | 42220    // Celo
  | 44787    // Celo Alfajores
  | 100      // Gnosis
  | 1284     // Moonbeam
  | 56       // Binance Smart Chain
  | 43114    // Avalanche
  | 84531    // Base Goerli
  | 84532    // Base Sepolia
  | 8453     // Base
  | 7777777  // ADD: Zora
  | 61       // ADD: Ethereum Classic
```

### 2. Add Explorer URLs

**Add to `mapSupportedChainIdUrl`**:

```typescript
const mapSupportedChainIdUrl: Partial<Record<SupportedChainId, string>> = {
  // ... existing mappings ...
  8453: 'https://basescan.org',
  
  // ADD THESE:
  7777777: 'https://explorer.zora.energy',
  61: 'https://blockscout.com/etc/mainnet',
}
```

### 3. Add Chain Names

**Add to `mapSupportedChainIdName`**:

```typescript
const mapSupportedChainIdName: Partial<Record<SupportedChainId, string>> = {
  // ... existing mappings ...
  8453: 'Base',
  
  // ADD THESE:
  7777777: 'Zora',
  61: 'Ethereum Classic',
}
```

## That's It! 

**No Breaking Changes**. All existing functions continue to work:
- ✅ `mapSupportedChainIdToExplorerUrl(chainId)`
- ✅ `mapSupportedChainIdToName(chainId)`
- ✅ `buildChainTxUrl(chainId, tx)`
- ✅ `buildChainContractUrl(chainId, contract)`

## Optional: Non-EVM Network Support

If the backend needs to support non-EVM networks (Bitcoin, Solana, etc.), see the reference implementation for:

1. **Network identifier type**: `RobinhoodNetwork`
2. **Non-EVM mappings**: `mapNonEvmNetworkUrl`, `mapNonEvmNetworkName`
3. **Network-to-ChainID converter**: `mapNetworkToChainId`
4. **Enhanced URL builders**: `buildNetworkTxUrl()`, `buildNetworkAddressUrl()`

**Note**: Non-EVM support is only needed if the backend will track deposits/transactions on Bitcoin, Solana, Cardano, etc.

## Testing the Changes

```typescript
// Test new Zora support
const zoraUrl = mapSupportedChainIdToExplorerUrl(7777777)
expect(zoraUrl).toBe('https://explorer.zora.energy')

const zoraName = mapSupportedChainIdToName(7777777)
expect(zoraName).toBe('Zora')

const zoraTx = buildChainTxUrl(7777777, '0x123...')
expect(zoraTx).toBe('https://explorer.zora.energy/tx/0x123...')

// Test new Ethereum Classic support
const etcUrl = mapSupportedChainIdToExplorerUrl(61)
expect(etcUrl).toBe('https://blockscout.com/etc/mainnet')

const etcName = mapSupportedChainIdToName(61)
expect(etcName).toBe('Ethereum Classic')
```

## Impact Analysis

### ✅ Low Risk Changes
- Adding new chain IDs to existing type
- Adding new mappings to existing records
- All existing code paths unchanged
- Backward compatible

### 📊 Affected Areas
- Any code using `SupportedChainId` type will now allow Zora (7777777) and ETC (61)
- Block explorer links will work for these new chains
- Token entities can now have Zora or ETC as network

### 🔍 Review Checklist
- [ ] Verify Zora chain ID (7777777) is correct
- [ ] Verify ETC chain ID (61) is correct
- [ ] Test explorer URLs are accessible
- [ ] Update any chain ID validation logic to allow new IDs
- [ ] Update documentation/comments mentioning supported chains

## Network to Chain ID Reference

For quick reference when mapping Robinhood networks to backend chain IDs:

| Robinhood Network | Chain ID | Backend Support |
|-------------------|----------|-----------------|
| ETHEREUM          | 1        | ✅ Existing     |
| POLYGON           | 137      | ✅ Existing     |
| ARBITRUM          | 42161    | ✅ Existing     |
| OPTIMISM          | 10       | ✅ Existing     |
| BASE              | 8453     | ✅ Existing     |
| AVALANCHE         | 43114    | ✅ Existing     |
| ZORA              | 7777777  | 🆕 New          |
| ETHEREUM_CLASSIC  | 61       | 🆕 New          |
| BITCOIN           | N/A      | ⚠️ Non-EVM      |
| SOLANA            | N/A      | ⚠️ Non-EVM      |
| CARDANO           | N/A      | ⚠️ Non-EVM      |
| (others)          | N/A      | ⚠️ Non-EVM      |

## Questions to Consider

1. **Do we need to support non-EVM deposits?**
   - If yes: Implement full network abstraction from reference file
   - If no: Just add Zora + ETC chain IDs

2. **Should we validate incoming chain IDs more strictly?**
   - Consider adding an enum or constant array of valid chain IDs
   - Update any validation logic to include new chains

3. **How will OTC tokens map to these networks?**
   - Ensure OTC token configuration includes proper network identifiers
   - May need to map "ZORA" → 7777777 in token ingestion logic

## Implementation Checklist

- [ ] Add chain IDs to `SupportedChainId` type
- [ ] Add explorer URLs to `mapSupportedChainIdUrl`
- [ ] Add chain names to `mapSupportedChainIdName`
- [ ] Update tests to cover new chains
- [ ] Update API documentation
- [ ] Verify frontend can display new networks correctly
- [ ] Test transaction/address URL generation
- [ ] Deploy to staging and verify

