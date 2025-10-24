/**
 * Robinhood Asset Discovery API Client
 *
 * Fetches live list of supported assets from Robinhood Connect
 * Reference: Robinhood Connect SDK - Asset Discovery
 */

const DISCOVERY_API_URL = 'https://api.robinhood.com/catpay/v1/supported_currencies/'

/**
 * Stats from last Discovery API fetch
 */
let DISCOVERY_STATS: {
  totalAssetPairs: number
  cryptoAssetsDiscovered: number
  discoveredAt?: Date
} | null = null

/**
 * Robinhood Asset Discovery Response Types
 */
export interface RobinhoodCurrencyInfo {
  id: string // UUID
  code: string // "BTC", "ETH"
  name: string // "Bitcoin", "Ethereum"
  currencyType: string // "cryptocurrency"
}

export interface RobinhoodCryptoCurrencyPair {
  id: string // "BTC-USD"
  assetCurrency: RobinhoodCurrencyInfo
  quoteCurrency: RobinhoodCurrencyInfo
  supportedNetworks: string[] // ["BITCOIN"]
}

export interface RobinhoodAssetDiscoveryResponse {
  applicationId: string
  cryptoCurrencyPairs: RobinhoodCryptoCurrencyPair[]
}

/**
 * Discovered asset (simplified from API response)
 */
export interface DiscoveredAsset {
  symbol: string // "BTC"
  name: string // "Bitcoin"
  networks: string[] // ["BITCOIN"]
  robinhoodId: string // UUID for tracking
}

/**
 * Fetch supported assets from Robinhood Discovery API
 */
export async function fetchRobinhoodAssets(): Promise<DiscoveredAsset[]> {
  const applicationId = getRobinhoodApplicationId()

  if (!applicationId) {
    console.warn('[Discovery API] No application ID - using static assets')
    return []
  }

  try {
    console.log('[Discovery API] Fetching supported assets...')

    const url = `${DISCOVERY_API_URL}?applicationId=${applicationId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Discovery API failed: ${response.status} ${response.statusText}`)
    }

    const data: RobinhoodAssetDiscoveryResponse = await response.json()

    console.log(`[Discovery API] Found ${data.cryptoCurrencyPairs.length} asset pairs`)

    // Convert to simplified format
    const discovered: DiscoveredAsset[] = data.cryptoCurrencyPairs
      .filter((pair) => {
        // API returns "cryptocurrency" not "crypto"
        const isCrypto = pair.assetCurrency.currencyType === 'cryptocurrency'
        if (!isCrypto) {
          console.log(`[Discovery API] Skipping ${pair.assetCurrency.code} (type: ${pair.assetCurrency.currencyType})`)
        }
        return isCrypto
      })
      .map((pair) => ({
        symbol: pair.assetCurrency.code,
        name: pair.assetCurrency.name,
        networks: pair.supportedNetworks,
        robinhoodId: pair.assetCurrency.id,
      }))

    console.log(`[Discovery API] Discovered ${discovered.length} crypto assets`)
    console.log(`[Discovery API] Assets: ${discovered.map((a) => a.symbol).join(', ')}`)

    // Store stats for health check
    DISCOVERY_STATS = {
      totalAssetPairs: data.cryptoCurrencyPairs.length,
      cryptoAssetsDiscovered: discovered.length,
      discoveredAt: new Date(),
    }

    return discovered
  } catch (error) {
    console.error('[Discovery API] Failed to fetch assets:', error)
    console.warn('[Discovery API] Falling back to static asset registry')
    return []
  }
}

/**
 * Get Robinhood application ID from environment
 */
function getRobinhoodApplicationId(): string | undefined {
  const appId = process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID || process.env.ROBINHOOD_APP_ID

  if (appId) {
    console.log(`[Discovery API] Using application ID: ${appId.slice(0, 8)}...`)
  } else {
    console.warn('[Discovery API] No ROBINHOOD_APP_ID or NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID found')
  }

  return appId
}

/**
 * Get Discovery API stats for health check
 */
export function getDiscoveryStats() {
  return DISCOVERY_STATS
}

/**
 * Map Robinhood network names to our RobinhoodNetwork type
 */
export function normalizeNetworkName(robinhoodNetwork: string): string {
  // Robinhood uses slightly different names in some cases
  const networkMap: Record<string, string> = {
    ETHEREUM: 'ETHEREUM',
    BITCOIN: 'BITCOIN',
    POLYGON: 'POLYGON',
    SOLANA: 'SOLANA',
    AVALANCHE: 'AVALANCHE',
    ARBITRUM: 'ARBITRUM',
    OPTIMISM: 'OPTIMISM',
    BASE: 'BASE',
    LITECOIN: 'LITECOIN',
    DOGECOIN: 'DOGECOIN',
    BITCOIN_CASH: 'BITCOIN_CASH',
    STELLAR: 'STELLAR',
    TEZOS: 'TEZOS',
    CARDANO: 'CARDANO',
    XRP: 'XRP',
    HEDERA: 'HEDERA',
    ETHEREUM_CLASSIC: 'ETHEREUM_CLASSIC',
    SUI: 'SUI',
    SUI_NETWORK: 'SUI', // Robinhood returns SUI_NETWORK, we use SUI
    ZORA: 'ZORA',
    TONCOIN: 'TONCOIN',
  }

  return networkMap[robinhoodNetwork] || robinhoodNetwork
}
