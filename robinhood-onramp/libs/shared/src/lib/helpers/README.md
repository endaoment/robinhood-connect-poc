# Chain ID Mappers - Robinhood Connect Extension

## Purpose

This file demonstrates the necessary expansions to the Endaoment backend's chain ID mapper to support all networks available via Robinhood Connect.

**Backend File**: `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/config/src/lib/helpers/chain-id-mappers.ts`

**POC Demo File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/libs/shared/src/lib/helpers/chain-id-mappers.ts`

## Changes Overview

### What's Unchanged (Existing Backend)

✅ All existing EVM chain ID mappings (Ethereum, Polygon, Arbitrum, etc.)
✅ Existing functions: `mapSupportedChainIdToExplorerUrl`, `mapSupportedChainIdToName`, `buildChainTxUrl`, `buildChainContractUrl`
✅ Existing `SupportedChainId` type for EVM chains

### What's Added (New for Robinhood)

#### 1. Additional EVM Chains

```typescript
// New chain IDs to add to SupportedChainId type
7777777 // Zora
61 // Ethereum Classic
```

#### 2. Non-EVM Network Support

New mappings for non-EVM blockchain networks:

- Bitcoin, Bitcoin Cash, Litecoin, Dogecoin
- Cardano, Solana, Stellar, Sui, Tezos
- TON, XRP Ledger, Hedera

#### 3. New Helper Functions

- `mapNetworkToExplorerUrl()` - Get explorer for any network (EVM or non-EVM)
- `mapNetworkToName()` - Get display name for any network
- `mapNetworkToChainIdValue()` - Get chain ID if network is EVM
- `isEvmNetwork()` - Check if network has a chain ID
- `buildNetworkTxUrl()` - Build tx URL with network-specific patterns
- `buildNetworkAddressUrl()` - Build address URL with network-specific patterns
- `buildNetworkTokenUrl()` - Build token URL (EVM only)
- `getNetworkSymbol()` - Get native token symbol (ETH, BTC, SOL, etc.)

## Usage Examples

### Existing Backend Functions (No Change)

```typescript
// These work exactly as before
const ethExplorer = mapSupportedChainIdToExplorerUrl(1)
// "https://etherscan.io"

const polygonName = mapSupportedChainIdToName(137)
// "Polygon"

const txUrl = buildChainTxUrl(42161, '0x123...')
// "https://arbiscan.io/tx/0x123..."

const contractUrl = buildChainContractUrl(8453, '0xabc...')
// "https://basescan.org/address/0xabc..."
```

### New Functions (For Robinhood Networks)

```typescript
// Works for both EVM and non-EVM networks
const btcExplorer = mapNetworkToExplorerUrl('BITCOIN')
// "https://blockchair.com/bitcoin"

const solExplorer = mapNetworkToExplorerUrl('SOLANA')
// "https://solscan.io"

// Build transaction URLs with correct patterns
const btcTx = buildNetworkTxUrl('BITCOIN', 'abc123...')
// "https://blockchair.com/bitcoin/transaction/abc123..."

const ethTx = buildNetworkTxUrl('ETHEREUM', '0x456...')
// "https://etherscan.io/tx/0x456..."

const solTx = buildNetworkTxUrl('SOLANA', 'xyz789...')
// "https://solscan.io/tx/xyz789..."

// Get chain IDs for EVM networks
const baseChainId = mapNetworkToChainIdValue('BASE')
// 8453

const btcChainId = mapNetworkToChainIdValue('BITCOIN')
// undefined (not EVM)

// Check if network is EVM
const isBaseEvm = isEvmNetwork('BASE') // true
const isBtcEvm = isEvmNetwork('BITCOIN') // false

// Get native token symbols
const ethSymbol = getNetworkSymbol('ETHEREUM') // "ETH"
const btcSymbol = getNetworkSymbol('BITCOIN') // "BTC"
const solSymbol = getNetworkSymbol('SOLANA') // "SOL"
```

## Block Explorer URL Patterns

### EVM Networks (Chain ID Based)

Use existing backend pattern: `{baseUrl}/tx/{hash}` or `{baseUrl}/address/{addr}`

**Supported**:

- Ethereum (1), Polygon (137), Arbitrum (42161), Optimism (10)
- Base (8453), Zora (7777777), Avalanche (43114), Ethereum Classic (61)

### Non-EVM Networks (Network Name Based)

#### Bitcoin Family (Blockchair)

- **Pattern**: `{baseUrl}/transaction/{hash}` or `{baseUrl}/address/{addr}`
- **Networks**: Bitcoin, Bitcoin Cash, Litecoin, Dogecoin

#### Account-Based Explorers

- **Stellar**: `{baseUrl}/tx/{hash}` or `{baseUrl}/account/{addr}`
- **Solana**: `{baseUrl}/tx/{hash}` or `{baseUrl}/account/{addr}` (implicit)
- **Sui**: `{baseUrl}/tx/{hash}` or `{baseUrl}/account/{addr}`

#### Path-Based Explorers

- **Tezos**: `{baseUrl}/{hash}` or `{baseUrl}/{addr}`
- **TON**: `{baseUrl}/tx/{hash}` or `{baseUrl}/address/{addr}`
- **Cardano**: `{baseUrl}/transaction/{hash}` or `{baseUrl}/address/{addr}`

#### Special Cases

- **Hedera**: `{baseUrl}/mainnet/transaction/{hash}` or `{baseUrl}/mainnet/account/{addr}`
- **XRP**: Standard `/tx/` and `/address/` patterns

## Integration with Backend

When integrating Robinhood Connect with the backend, these are the minimal changes needed:

### 1. Expand `SupportedChainId` Type

```typescript
export type SupportedChainId =
  // ... existing chain IDs ...
  | 7777777 // Zora
  | 61 // Ethereum Classic
```

### 2. Add New Chain Mappings

```typescript
// Add to mapSupportedChainIdUrl
7777777: 'https://explorer.zora.energy',
61: 'https://blockscout.com/etc/mainnet',

// Add to mapSupportedChainIdName
7777777: 'Zora',
61: 'Ethereum Classic',
```

### 3. Add Non-EVM Support (Optional)

If the backend needs to track non-EVM transactions:

- Add `NetworkIdentifier` type
- Add non-EVM mappings
- Add network-aware URL builders

## Type Safety

All functions maintain type safety:

```typescript
import type { RobinhoodNetwork } from '@/libs/robinhood/lib/types'

// ✅ Valid
const network: RobinhoodNetwork = 'ETHEREUM'
const url = mapNetworkToExplorerUrl(network)

// ❌ Type error
const invalid: RobinhoodNetwork = 'INVALID_NETWORK'
```

## Migration Path

### Phase 1: Add New EVM Chains (Low Risk)

Add Zora and Ethereum Classic to existing backend mappings. No breaking changes.

### Phase 2: Add Network Abstraction (Medium Risk)

Add new helper functions that accept network names. Existing chain ID functions remain unchanged.

### Phase 3: Full Non-EVM Support (Optional)

Add non-EVM network mappings if backend needs to track Bitcoin, Solana, etc.

## Related Files

**Backend**:

- `/libs/api/config/src/lib/helpers/chain-id-mappers.ts` - Original file to be modified
- `/libs/api/config/src/lib/types/` - SupportedChainId type definition

**POC**:

- `/libs/shared/src/lib/helpers/chain-id-mappers.ts` - This demonstration
- `/libs/robinhood/src/lib/types/robinhood.types.ts` - RobinhoodNetwork type
- `/libs/robinhood/src/lib/constants/networks.ts` - Network constants

## Advanced Usage Examples

### Network Type Detection

```typescript
import { isEvmNetwork, mapNetworkToChainIdValue } from '@/libs/shared/lib/helpers'

// Check if network is EVM-compatible
if (isEvmNetwork('POLYGON')) {
  // Use EVM-specific logic
  const chainId = mapNetworkToChainIdValue('POLYGON')
  console.log('Polygon chain ID:', chainId) // 137
}

if (!isEvmNetwork('BITCOIN')) {
  // Use non-EVM logic
  console.log('Bitcoin is not EVM-compatible')
}
```

### Building Token URLs (EVM Only)

```typescript
import { buildNetworkTokenUrl } from '@/libs/shared/lib/helpers'

// Works for EVM networks
const usdcOnPolygon = buildNetworkTokenUrl('POLYGON', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174')
// → "https://polygonscan.com/token/0x2791..."

// Throws error for non-EVM networks
try {
  buildNetworkTokenUrl('BITCOIN', '0x123...')
} catch (error) {
  console.error(error.message)
  // → "Token URLs are only supported for EVM networks. Got: BITCOIN"
}
```

## Real-World Examples

### 1. Transaction Confirmation UI

```typescript
import { buildNetworkTxUrl, mapNetworkToName } from '@/libs/shared/lib/helpers'

interface Transaction {
  network: RobinhoodNetwork
  txHash: string
  amount: string
  asset: string
}

function TransactionConfirmation({ tx }: { tx: Transaction }) {
  const explorerUrl = buildNetworkTxUrl(tx.network, tx.txHash)
  const networkName = mapNetworkToName(tx.network)

  return (
    <div>
      <h3>Transaction Confirmed!</h3>
      <p>Network: {networkName}</p>
      <p>Amount: {tx.amount} {tx.asset}</p>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        View on Explorer →
      </a>
    </div>
  )
}
```

### 2. Network Selector

```typescript
import {
  mapNetworkToName,
  getNetworkSymbol,
  isEvmNetwork
} from '@/libs/shared/lib/helpers'

function NetworkSelector({
  networks,
  onSelect
}: {
  networks: RobinhoodNetwork[]
  onSelect: (network: RobinhoodNetwork) => void
}) {
  return (
    <select onChange={(e) => onSelect(e.target.value as RobinhoodNetwork)}>
      {networks.map(network => (
        <option key={network} value={network}>
          {mapNetworkToName(network)} ({getNetworkSymbol(network)})
          {isEvmNetwork(network) && ' 🔷'}
        </option>
      ))}
    </select>
  )
}
```

### 3. Multi-Network Transaction List

```typescript
import { buildNetworkTxUrl, mapNetworkToName } from '@/libs/shared/lib/helpers'

interface MultiNetworkTx {
  network: RobinhoodNetwork
  txHash: string
  timestamp: number
}

function TransactionList({ txs }: { txs: MultiNetworkTx[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Network</th>
          <th>Transaction</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((tx, i) => (
          <tr key={i}>
            <td>{mapNetworkToName(tx.network)}</td>
            <td>
              <a
                href={buildNetworkTxUrl(tx.network, tx.txHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tx.txHash.slice(0, 8)}...
              </a>
            </td>
            <td>{new Date(tx.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Error Handling

### Safe Usage Pattern

```typescript
import { mapNetworkToExplorerUrl, buildNetworkTxUrl } from '@/libs/shared/lib/helpers'

function safeGetExplorerUrl(network: RobinhoodNetwork): string | null {
  try {
    return mapNetworkToExplorerUrl(network) ?? null
  } catch {
    return null
  }
}

function safeBuildTxUrl(network: RobinhoodNetwork, txHash: string): string | null {
  try {
    return buildNetworkTxUrl(network, txHash)
  } catch (error) {
    console.error('Failed to build tx URL:', error)
    return null
  }
}

// Use in component
function TxLink({ network, txHash }: { network: RobinhoodNetwork; txHash: string }) {
  const url = safeBuildTxUrl(network, txHash)

  if (!url) {
    return <span>{txHash}</span>
  }

  return <a href={url} target="_blank">{txHash}</a>
}
```

## Testing

```typescript
import {
  mapSupportedChainIdToExplorerUrl,
  mapNetworkToExplorerUrl,
  buildNetworkTxUrl,
  isEvmNetwork,
} from '@/libs/shared/lib/helpers'

describe('Chain ID Mappers', () => {
  describe('EVM Networks', () => {
    it('should map Ethereum chain ID to explorer', () => {
      expect(mapSupportedChainIdToExplorerUrl(1)).toBe('https://etherscan.io')
    })

    it('should map Zora chain ID to explorer', () => {
      expect(mapSupportedChainIdToExplorerUrl(7777777)).toBe('https://explorer.zora.energy')
    })

    it('should identify EVM networks', () => {
      expect(isEvmNetwork('ETHEREUM')).toBe(true)
      expect(isEvmNetwork('POLYGON')).toBe(true)
      expect(isEvmNetwork('BITCOIN')).toBe(false)
    })
  })

  describe('Non-EVM Networks', () => {
    it('should map Bitcoin to blockchair', () => {
      expect(mapNetworkToExplorerUrl('BITCOIN')).toBe('https://blockchair.com/bitcoin')
    })

    it('should build Bitcoin transaction URL', () => {
      const url = buildNetworkTxUrl('BITCOIN', 'abc123')
      expect(url).toBe('https://blockchair.com/bitcoin/transaction/abc123')
    })

    it('should build Solana transaction URL', () => {
      const url = buildNetworkTxUrl('SOLANA', 'xyz789')
      expect(url).toBe('https://solscan.io/tx/xyz789')
    })
  })
})
```
