# Chain ID Mappers - Usage Examples

## Basic Usage

### Get Explorer URL

```typescript
import { 
  mapSupportedChainIdToExplorerUrl,
  mapNetworkToExplorerUrl 
} from '@/libs/shared/lib/helpers'

// Using chain ID (existing backend pattern)
const ethUrl = mapSupportedChainIdToExplorerUrl(1)
// → "https://etherscan.io"

const zoraUrl = mapSupportedChainIdToExplorerUrl(7777777)
// → "https://explorer.zora.energy"

// Using network name (new Robinhood pattern)
const btcUrl = mapNetworkToExplorerUrl('BITCOIN')
// → "https://blockchair.com/bitcoin"

const solUrl = mapNetworkToExplorerUrl('SOLANA')
// → "https://solscan.io"
```

### Build Transaction URLs

```typescript
import { 
  buildChainTxUrl,
  buildNetworkTxUrl 
} from '@/libs/shared/lib/helpers'

// EVM networks using chain ID
const ethTx = buildChainTxUrl(
  1, 
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
)
// → "https://etherscan.io/tx/0x1234..."

const baseTx = buildChainTxUrl(8453, '0xabcd...')
// → "https://basescan.org/tx/0xabcd..."

// Any network using network name
const btcTx = buildNetworkTxUrl(
  'BITCOIN',
  '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b'
)
// → "https://blockchair.com/bitcoin/transaction/3a4b5c..."

const solTx = buildNetworkTxUrl(
  'SOLANA',
  '5J8w...'
)
// → "https://solscan.io/tx/5J8w..."
```

### Build Address URLs

```typescript
import { 
  buildChainContractUrl,
  buildNetworkAddressUrl 
} from '@/libs/shared/lib/helpers'

// EVM contracts/addresses using chain ID
const usdcContract = buildChainContractUrl(
  1,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
)
// → "https://etherscan.io/address/0xA0b8..."

// Any address using network name
const btcAddress = buildNetworkAddressUrl(
  'BITCOIN',
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
)
// → "https://blockchair.com/bitcoin/address/1A1zP1..."

const solAddress = buildNetworkAddressUrl(
  'SOLANA',
  'DYw8jC...'
)
// → "https://solscan.io/account/DYw8jC..."
```

## Advanced Usage

### Network Type Detection

```typescript
import { 
  isEvmNetwork,
  mapNetworkToChainIdValue 
} from '@/libs/shared/lib/helpers'

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

// Get chain ID for EVM networks (undefined for non-EVM)
const baseId = mapNetworkToChainIdValue('BASE') // 8453
const btcId = mapNetworkToChainIdValue('BITCOIN') // undefined
```

### Display Network Info

```typescript
import { 
  mapNetworkToName,
  getNetworkSymbol 
} from '@/libs/shared/lib/helpers'

// Get display name
const displayName = mapNetworkToName('OPTIMISM')
// → "OP Mainnet"

// Get native token symbol
const symbol = getNetworkSymbol('AVALANCHE')
// → "AVAX"

// Use in UI
function NetworkBadge({ network }: { network: RobinhoodNetwork }) {
  return (
    <div>
      <span>{mapNetworkToName(network)}</span>
      <span>{getNetworkSymbol(network)}</span>
    </div>
  )
}
// <NetworkBadge network="ETHEREUM" />
// → "Ethereum ETH"
```

### Building Token URLs (EVM Only)

```typescript
import { buildNetworkTokenUrl } from '@/libs/shared/lib/helpers'

// Works for EVM networks
const usdcOnPolygon = buildNetworkTokenUrl(
  'POLYGON',
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
)
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

### 2. Deposit Address Display

```typescript
import { buildNetworkAddressUrl, getNetworkSymbol } from '@/libs/shared/lib/helpers'

function DepositInstructions({ 
  network, 
  address 
}: { 
  network: RobinhoodNetwork
  address: string 
}) {
  const explorerUrl = buildNetworkAddressUrl(network, address)
  const symbol = getNetworkSymbol(network)
  
  return (
    <div>
      <h4>Deposit {symbol}</h4>
      <code>{address}</code>
      <a href={explorerUrl} target="_blank">
        Verify Address on Explorer
      </a>
    </div>
  )
}
```

### 3. Network Selector

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

### 4. Multi-Network Transaction List

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

### 5. Token Contract Verification

```typescript
import { 
  buildNetworkTokenUrl, 
  isEvmNetwork,
  mapNetworkToChainIdValue 
} from '@/libs/shared/lib/helpers'

interface Token {
  symbol: string
  network: RobinhoodNetwork
  contractAddress?: string
}

function TokenInfo({ token }: { token: Token }) {
  if (!isEvmNetwork(token.network)) {
    return <div>{token.symbol} (Native asset)</div>
  }
  
  const chainId = mapNetworkToChainIdValue(token.network)
  const contractUrl = token.contractAddress 
    ? buildNetworkTokenUrl(token.network, token.contractAddress)
    : null
  
  return (
    <div>
      <h4>{token.symbol}</h4>
      <p>Chain ID: {chainId}</p>
      {contractUrl && (
        <a href={contractUrl} target="_blank">
          View Contract →
        </a>
      )}
    </div>
  )
}
```

### 6. Backend API Integration

```typescript
// Backend endpoint to get transaction details
import { buildNetworkTxUrl } from '@/libs/shared/lib/helpers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const network = searchParams.get('network') as RobinhoodNetwork
  const txHash = searchParams.get('txHash') as string
  
  // Fetch transaction data from database
  const txData = await db.transaction.findUnique({
    where: { hash: txHash, network }
  })
  
  // Add explorer URL to response
  return Response.json({
    ...txData,
    explorerUrl: buildNetworkTxUrl(network, txHash)
  })
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

