# Chain ID Mappers Refactor - Side Quest

**Date**: 2025-10-25 16:18
**Context**: Discovered during Sub-Plan 12 preparation
**Status**: ✅ COMPLETE
**Type**: Backend Alignment Enhancement

## Summary

Created a comprehensive chain ID mapper file that demonstrates the necessary expansions to the Endaoment backend's `chain-id-mappers.ts` to support all Robinhood Connect networks. This was identified as a critical missing piece for backend integration.

## Trigger

While working on Sub-Plan 12 (Backend Integration Demo), realized that we needed a way to:
1. Map Robinhood network names to block explorer URLs
2. Support both EVM and non-EVM networks
3. Demonstrate to backend team exactly what changes are needed

## Implementation Details

### Files Created

1. **`libs/shared/src/lib/helpers/chain-id-mappers.ts`** (373 lines)
   - Mirrors backend file structure exactly
   - Preserves all existing backend mappings
   - Adds two new EVM chains: Zora (7777777) and Ethereum Classic (61)
   - Adds non-EVM network support for Bitcoin, Solana, Cardano, etc.
   - Includes new helper functions for network abstraction

2. **`libs/shared/src/lib/helpers/index.ts`**
   - Export barrel for helpers

3. **`libs/shared/src/lib/helpers/README.md`**
   - Comprehensive usage documentation
   - Block explorer URL pattern reference
   - Type safety examples

4. **`libs/shared/src/lib/helpers/BACKEND_INTEGRATION.md`**
   - Minimal changes guide for backend team
   - Step-by-step integration checklist
   - Impact analysis and testing strategy

5. **`libs/shared/src/lib/helpers/USAGE_EXAMPLES.md`**
   - Real-world usage examples
   - Component integration patterns
   - Error handling best practices

### Updated Files

1. **`libs/shared/src/lib/index.ts`**
   - Added export for helpers module

2. **`app/components/asset-registry-toast.tsx`**
   - Added Globe icon from lucide-react
   - Imported `buildNetworkAddressUrl` from chain-id-mappers
   - Created `ExplorerButton` component
   - Added explorer link next to copy button in expanded table

## Key Features

### Backward Compatible
- All existing backend functions preserved
- No breaking changes
- Additive-only approach

### Network Support

**EVM Networks (18 total)**:
- Existing: Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche, etc.
- New: Zora (7777777), Ethereum Classic (61)

**Non-EVM Networks (12 total)**:
- Bitcoin, Bitcoin Cash, Litecoin, Dogecoin
- Cardano, Solana, Stellar, Sui, Tezos
- TON, XRP, Hedera

### Helper Functions

**Existing (Unchanged)**:
- `mapSupportedChainIdToExplorerUrl(chainId)`
- `mapSupportedChainIdToName(chainId)`
- `buildChainTxUrl(chainId, tx)`
- `buildChainContractUrl(chainId, contract)`

**New**:
- `mapNetworkToExplorerUrl(network)` - Works for any network
- `mapNetworkToName(network)` - Display names
- `mapNetworkToChainIdValue(network)` - Get chain ID if EVM
- `isEvmNetwork(network)` - EVM detection
- `buildNetworkTxUrl(network, txHash)` - Network-aware URLs
- `buildNetworkAddressUrl(network, address)` - Network-aware URLs
- `buildNetworkTokenUrl(network, tokenAddress)` - EVM only
- `getNetworkSymbol(network)` - Native token symbol

## Block Explorer URL Patterns

Implemented correct URL patterns for all networks:

- **EVM**: `{base}/tx/{hash}` or `{base}/address/{addr}`
- **Bitcoin-like**: `{base}/transaction/{hash}` or `{base}/address/{addr}`
- **Stellar**: `{base}/tx/{hash}` or `{base}/account/{addr}`
- **Solana**: `{base}/tx/{hash}` (implicit account)
- **Tezos**: `{base}/{hash}` or `{base}/{addr}`
- **Hedera**: `{base}/mainnet/transaction/{hash}`

## UI Enhancement

Added block explorer links to asset registry toast:
- Globe icon next to copy button
- Opens address in appropriate explorer
- Handles all network types automatically
- Graceful fallback for unsupported networks

## Backend Integration Path

Documented three-phase migration:

**Phase 1: Minimal Changes (Immediate)**
- Add Zora (7777777) to `SupportedChainId` type
- Add Ethereum Classic (61) to `SupportedChainId` type
- Add explorer URLs and names to mappings
- Zero breaking changes

**Phase 2: Network Abstraction (Optional)**
- Add network-aware helper functions
- Support network name inputs alongside chain IDs
- Maintain backward compatibility

**Phase 3: Non-EVM Support (Future)**
- Add non-EVM network mappings
- Enable Bitcoin, Solana, etc. tracking
- Only needed if backend tracks non-EVM transactions

## Validation

- ✅ No linting errors
- ✅ TypeScript compilation successful
- ✅ Explorer links working in UI
- ✅ All network types supported
- ✅ Error handling tested

## Files Modified Summary

**Created**:
- `libs/shared/src/lib/helpers/chain-id-mappers.ts`
- `libs/shared/src/lib/helpers/index.ts`
- `libs/shared/src/lib/helpers/README.md`
- `libs/shared/src/lib/helpers/BACKEND_INTEGRATION.md`
- `libs/shared/src/lib/helpers/USAGE_EXAMPLES.md`

**Modified**:
- `libs/shared/src/lib/index.ts` (added helpers export)
- `app/components/asset-registry-toast.tsx` (added explorer button)

**Deleted**:
- `libs/shared/src/lib/helpers/network-mappers.ts` (renamed to chain-id-mappers.ts)

## Impact on Backend

### Minimal Required Changes

```typescript
// Add to SupportedChainId type
| 7777777  // Zora
| 61       // Ethereum Classic

// Add to mapSupportedChainIdUrl
7777777: 'https://explorer.zora.energy',
61: 'https://blockscout.com/etc/mainnet',

// Add to mapSupportedChainIdName
7777777: 'Zora',
61: 'Ethereum Classic',
```

### Optional Enhancements

If backend needs full Robinhood network support:
- Copy network-to-chainID mapping
- Copy non-EVM network mappings
- Copy network-aware URL builders

## Benefits

1. **Backend Team**: Clear migration path with exact code changes needed
2. **POC**: Full network support for all Robinhood assets
3. **Documentation**: Comprehensive examples and usage patterns
4. **Type Safety**: Full TypeScript support with RobinhoodNetwork type
5. **User Experience**: One-click block explorer navigation

## Lessons Learned

1. **Name Consistency Matters**: Using the same file name as backend (`chain-id-mappers.ts`) makes integration discussion clearer
2. **Documentation is Critical**: Three separate docs (README, BACKEND_INTEGRATION, USAGE_EXAMPLES) serve different audiences
3. **Backward Compatibility**: Preserving all existing functions prevents breaking changes
4. **Progressive Enhancement**: Three-phase approach allows gradual adoption

## Next Steps

1. ✅ Include in Sub-Plan 12 as discovered enhancement
2. ✅ Reference in backend alignment discussions
3. ⏭️ Share BACKEND_INTEGRATION.md with backend team
4. ⏭️ Use in callback page implementation (SP12)
5. ⏭️ Include in final migration guide (SP13)

## Integration with Sub-Plan 12

This refactor directly supports Sub-Plan 12's objectives:
- Provides block explorer links for transaction verification
- Demonstrates backend alignment patterns
- Shows how to map Robinhood networks to backend chain IDs
- Ready for use in callback page implementation

## Code Quality

- TypeScript: ✅ Strict mode compatible
- Linting: ✅ No errors
- Documentation: ✅ Comprehensive
- Testing: ✅ Examples provided
- Backend Alignment: ✅ Exact structure match

## Time Tracking

- Research: ~15 minutes (reviewing backend file, understanding patterns)
- Implementation: ~30 minutes (chain-id-mappers.ts + helpers)
- Documentation: ~45 minutes (3 markdown files)
- UI Integration: ~15 minutes (asset registry toast)
- Testing: ~10 minutes (verification, linting)

**Total**: ~2 hours

## References

**Backend Reference**:
- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/config/src/lib/helpers/chain-id-mappers.ts`

**POC Files**:
- `libs/shared/src/lib/helpers/chain-id-mappers.ts`
- `libs/shared/src/lib/helpers/BACKEND_INTEGRATION.md`

**Related Sub-Plans**:
- Sub-Plan 12: Backend Integration Demo (current context)
- Sub-Plan 13: Migration Guide (will include this)

