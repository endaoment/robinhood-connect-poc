import type {
  AssetCode,
  DaffyStyleOnrampParams,
  DaffyStyleOnrampUrlResult,
  RobinhoodNetwork,
  SupportedNetwork,
} from '@/types/robinhood'
import { v4 as uuidv4 } from 'uuid'

// Supported networks from Robinhood SDK
// Complete list from: https://robinhood.com/us/en/support/articles/crypto-transfers/
export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  'ARBITRUM',
  'AVALANCHE',
  'BASE',
  'BITCOIN',
  'BITCOIN_CASH',
  'CARDANO',
  'DOGECOIN',
  'ETHEREUM',
  'ETHEREUM_CLASSIC',
  'HEDERA',
  'LITECOIN',
  'OPTIMISM',
  'POLYGON',
  'SOLANA',
  'STELLAR',
  'SUI',
  'TEZOS',
  'TONCOIN',
  'XRP',
  'ZORA',
]

// Common asset codes supported by Robinhood
export const COMMON_ASSETS: AssetCode[] = [
  'BTC',
  'ETH',
  'USDC',
  'USDT',
  'SOL',
  'MATIC',
  'LTC',
  'DOGE',
  'AVAX',
  'ADA',
  'XRP',
  'HBAR',
  'XLM',
  'XTZ',
  'ETC',
  'BCH',
]

// Network to asset mapping (common combinations)
// Based on what assets are commonly available on each network via Robinhood
// Reference: https://robinhood.com/us/en/support/articles/crypto-transfers/
export const NETWORK_ASSET_MAP: Record<SupportedNetwork, AssetCode[]> = {
  // EVM L1
  ETHEREUM: ['ETH', 'USDC', 'USDT', 'AAVE', 'LINK', 'COMP', 'CRV', 'FLOKI', 'ONDO', 'PEPE', 'SHIB', 'UNI', 'WLFI'],
  ETHEREUM_CLASSIC: ['ETC'],
  AVALANCHE: ['AVAX', 'USDC'],

  // EVM L2 Networks
  POLYGON: ['MATIC', 'USDC', 'USDT'],
  ARBITRUM: ['ARB', 'USDC'],
  OPTIMISM: ['OP', 'USDC'],
  BASE: ['USDC'],
  ZORA: ['ZORA'],

  // Bitcoin & Bitcoin-like
  BITCOIN: ['BTC'],
  BITCOIN_CASH: ['BCH'],
  LITECOIN: ['LTC'],
  DOGECOIN: ['DOGE'],

  // Other L1 Chains
  SOLANA: ['SOL', 'USDC', 'BONK', 'MEW', 'WIF', 'MOODENG', 'TRUMP', 'PNUT', 'POPCAT', 'PENGU'],
  CARDANO: ['ADA'],
  TEZOS: ['XTZ'],
  SUI: ['SUI'],
  TONCOIN: ['TON'],

  // Networks with Memos
  STELLAR: ['XLM'],
  XRP: ['XRP'],
  HEDERA: ['HBAR'],
}

/**
 * Generate a new UUID v4 referenceId for order tracking
 */
export function generateReferenceId(): string {
  return uuidv4()
}

/**
 * Validate referenceId format (UUID v4)
 */
export function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(referenceId)
}

/**
 * Validate supported network
 */
export function isValidNetwork(network: string): network is SupportedNetwork {
  return SUPPORTED_NETWORKS.includes(network as SupportedNetwork)
}

/**
 * Validate asset code format
 */
export function isValidAssetCode(assetCode: string): boolean {
  // Asset codes are typically 2-10 uppercase letters
  return /^[A-Z]{2,10}$/.test(assetCode)
}

/**
 * Validate amount format (positive number with optional decimals)
 */
export function isValidAmount(amount: string): boolean {
  return /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0
}

/**
 * Get redirect URL for the current environment
 */
export function getRedirectUrl(): string {
  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3030'
  return `${baseUrl}/callback`
}

/**
 * Get compatible assets for a given network
 */
export function getAssetsForNetwork(network: SupportedNetwork): AssetCode[] {
  return NETWORK_ASSET_MAP[network] || []
}

/**
 * Get compatible networks for a given asset
 */
export function getNetworksForAsset(assetCode: AssetCode): SupportedNetwork[] {
  return Object.entries(NETWORK_ASSET_MAP)
    .filter(([_, assets]) => assets.includes(assetCode))
    .map(([network, _]) => network as SupportedNetwork)
}

/**
 * Validate asset/network compatibility
 */
export function isAssetNetworkCompatible(assetCode: AssetCode, network: SupportedNetwork): boolean {
  const assetsForNetwork = getAssetsForNetwork(network)
  return assetsForNetwork.includes(assetCode)
}

// ============================================================================
// DAFFY-STYLE URL BUILDER (PROVEN WORKING FORMAT)
// ============================================================================

/**
 * Build Daffy-style onramp URL for Robinhood Connect
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
 * const result = buildDaffyStyleOnrampUrl({
 *   asset: 'ETH',
 *   network: 'ETHEREUM',
 *   walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e'
 * });
 *
 * window.location.href = result.url;
 * ```
 */
export function buildDaffyStyleOnrampUrl(params: DaffyStyleOnrampParams): DaffyStyleOnrampUrlResult {
  const { asset, network, walletAddress, redirectUrl, connectId } = params

  // Validate required parameters
  if (!asset || !network || !walletAddress) {
    throw new Error('Asset, network, and walletAddress are required for Daffy-style onramp URL')
  }

  // Validate wallet address format (basic check)
  if (!isValidWalletAddress(walletAddress, network)) {
    throw new Error(`Invalid wallet address format for network ${network}: ${walletAddress}`)
  }

  // Generate or use provided connectId
  const finalConnectId = connectId || uuidv4()

  // Get base URL and redirect URL
  const baseUrl = getRobinhoodBaseUrl()
  const finalRedirectUrl = redirectUrl || getDefaultRedirectUrl()

  // Get application ID
  const applicationId = getRobinhoodApplicationId()

  // Build URL parameters (EXACT format from Daffy's implementation)
  // Reference: https://robinhood.com/connect/amount?applicationId=xxx&connectId=xxx&paymentMethod=crypto_balance&redirectUrl=xxx&supportedAssets=SOL&supportedNetworks=SOLANA&walletAddress=xxx&assetCode=SOL&flow=transfer
  const urlParams = new URLSearchParams({
    applicationId,
    connectId: finalConnectId, // UUID for tracking
    paymentMethod: 'crypto_balance', // Required for transfers from Robinhood balance
    redirectUrl: finalRedirectUrl,
    supportedAssets: asset, // Single asset only
    supportedNetworks: network, // Single network only
    walletAddress,
    assetCode: asset, // Daffy includes this (same as supportedAssets)
    flow: 'transfer', // CRITICAL: Specifies transfer flow (not sell)
  })

  const url = `${baseUrl}?${urlParams.toString()}`

  // Log for debugging (remove in production or use proper logger)
  console.log('[URL Builder] Generated Daffy-style URL:', {
    asset,
    network,
    connectId: finalConnectId,
    urlLength: url.length,
  })

  return {
    url,
    connectId: finalConnectId, // Still return for tracking, but not in URL
    params: {
      asset,
      network,
      walletAddress,
    },
  }
}

/**
 * Validate wallet address format for given network
 */
function isValidWalletAddress(address: string, network: RobinhoodNetwork): boolean {
  // Basic validation - can be enhanced
  if (!address || address.length === 0) {
    return false
  }

  // Ethereum-based networks (Ethereum, Polygon, Avalanche, etc.)
  if (
    network === 'ETHEREUM' ||
    network === 'POLYGON' ||
    network === 'AVALANCHE' ||
    network === 'ARBITRUM' ||
    network === 'OPTIMISM' ||
    network === 'BASE' ||
    network === 'ZORA' ||
    network === 'ETHEREUM_CLASSIC'
  ) {
    // Ethereum address: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Bitcoin
  if (network === 'BITCOIN') {
    // Bitcoin addresses are complex, basic check for now
    return address.length >= 26 && address.length <= 62
  }

  // Solana
  if (network === 'SOLANA') {
    // Solana addresses are base58, typically 32-44 characters
    return address.length >= 32 && address.length <= 44
  }

  // Litecoin
  if (network === 'LITECOIN') {
    // Litecoin addresses (L, M, or ltc1 prefixes)
    return address.length >= 26 && address.length <= 62
  }

  // Dogecoin
  if (network === 'DOGECOIN') {
    // Dogecoin addresses start with D
    return address.startsWith('D') && address.length >= 26 && address.length <= 34
  }

  // Bitcoin Cash
  if (network === 'BITCOIN_CASH') {
    // BCH addresses can be legacy (1) or cashaddr (q)
    return address.length >= 26 && address.length <= 62
  }

  // Cardano
  if (network === 'CARDANO') {
    // Cardano addresses start with addr1 (Shelley) or are Byron addresses
    return address.length >= 30 && address.length <= 110
  }

  // XRP
  if (network === 'XRP') {
    // XRP addresses typically start with 'r'
    return address.startsWith('r') && address.length >= 25 && address.length <= 35
  }

  // Stellar
  if (network === 'STELLAR') {
    // Stellar addresses start with 'G'
    return address.startsWith('G') && address.length === 56
  }

  // Hedera
  if (network === 'HEDERA') {
    // Hedera addresses in format 0.0.x
    return /^0\.0\.\d+$/.test(address)
  }

  // Tezos
  if (network === 'TEZOS') {
    // Tezos addresses start with 'tz'
    return address.startsWith('tz') && address.length >= 30 && address.length <= 40
  }

  // Sui
  if (network === 'SUI') {
    // Sui addresses are 0x followed by 64 hex characters
    return /^0x[a-fA-F0-9]{64}$/.test(address)
  }

  // Toncoin
  if (network === 'TONCOIN') {
    // Basic validation for Toncoin addresses
    return address.length >= 30 && address.length <= 60
  }

  // Default: assume valid (can add more specific validation per network)
  return true
}

/**
 * Get Robinhood Connect base URL
 * Using the exact format from Daffy's implementation
 */
function getRobinhoodBaseUrl(): string {
  // CRITICAL: Use /connect/amount NOT /applink/connect
  // This is the URL that supports redirectUrl properly
  return 'https://robinhood.com/connect/amount'
}

/**
 * Get default callback/redirect URL
 */
function getDefaultRedirectUrl(): string {
  // Use environment variable or construct from current host
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const host = window.location.host
    return `${protocol}//${host}/callback`
  }

  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_CALLBACK_URL || 'http://localhost:3000/callback'
}

/**
 * Get Robinhood application ID
 */
function getRobinhoodApplicationId(): string {
  // Support both new and legacy environment variable names
  const appId = process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID || process.env.ROBINHOOD_APP_ID

  if (!appId) {
    throw new Error('NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID or ROBINHOOD_APP_ID environment variable not set')
  }

  return appId
}

/**
 * Validate asset/network compatibility using metadata
 *
 * Ensures the asset can operate on the specified network
 */
export function validateAssetNetworkCompatibility(asset: string, network: RobinhoodNetwork): boolean {
  // Import asset metadata dynamically to avoid circular dependencies
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAssetMetadata } = require('./robinhood-asset-metadata')
    const metadata = getAssetMetadata(asset)

    if (!metadata) {
      console.warn(`Unknown asset: ${asset}`)
      return false
    }

    if (metadata.network !== network) {
      console.warn(`Asset ${asset} is on network ${metadata.network}, not ${network}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating asset/network compatibility:', error)
    // If metadata is not available, fall back to basic validation
    return isAssetNetworkCompatible(asset as AssetCode, network)
  }
}
