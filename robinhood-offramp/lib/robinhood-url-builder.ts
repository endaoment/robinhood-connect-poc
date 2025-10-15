import type { AssetCode, RobinhoodOfframpParams, SupportedNetwork } from '@/types/robinhood'
import { v4 as uuidv4 } from 'uuid'

// Supported networks from Robinhood SDK
export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  'AVALANCHE',
  'BITCOIN',
  'BITCOIN_CASH',
  'LITECOIN',
  'DOGECOIN',
  'ETHEREUM',
  'ETHEREUM_CLASSIC',
  'POLYGON',
  'SOLANA',
  'STELLAR',
  'TEZOS',
]

// Common asset codes
export const COMMON_ASSETS: AssetCode[] = ['BTC', 'ETH', 'USDC', 'USDT', 'SOL', 'MATIC', 'LTC', 'DOGE', 'AVAX', 'ADA']

// Network to asset mapping (common combinations)
export const NETWORK_ASSET_MAP: Record<SupportedNetwork, AssetCode[]> = {
  ETHEREUM: ['ETH', 'USDC', 'USDT'],
  POLYGON: ['MATIC', 'USDC', 'USDT'],
  SOLANA: ['SOL', 'USDC'],
  BITCOIN: ['BTC'],
  LITECOIN: ['LTC'],
  DOGECOIN: ['DOGE'],
  AVALANCHE: ['AVAX', 'USDC'],
  BITCOIN_CASH: ['BCH'],
  ETHEREUM_CLASSIC: ['ETC'],
  STELLAR: ['XLM'],
  TEZOS: ['XTZ'],
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
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/callback`
}

/**
 * Build offramp URL parameters with validation
 */
export interface OfframpUrlParams {
  supportedNetworks: SupportedNetwork[]
  assetCode?: AssetCode
  assetAmount?: string
  fiatCode?: 'USD'
  fiatAmount?: string
  referenceId?: string // If not provided, will be generated
}

export interface OfframpUrlResult {
  url: string
  referenceId: string
  params: RobinhoodOfframpParams
}

/**
 * Build complete offramp URL with all parameters
 */
export function buildOfframpUrl(params: OfframpUrlParams): OfframpUrlResult {
  // Validate environment variables
  if (!process.env.ROBINHOOD_APP_ID) {
    throw new Error('ROBINHOOD_APP_ID environment variable is required')
  }

  // Validate required parameters
  if (!params.supportedNetworks || params.supportedNetworks.length === 0) {
    throw new Error('At least one supported network is required')
  }

  // Validate supported networks
  for (const network of params.supportedNetworks) {
    if (!isValidNetwork(network)) {
      throw new Error(`Invalid network: ${network}. Supported networks: ${SUPPORTED_NETWORKS.join(', ')}`)
    }
  }

  // Validate asset code if provided
  if (params.assetCode && !isValidAssetCode(params.assetCode)) {
    throw new Error(`Invalid asset code: ${params.assetCode}. Must be 2-10 uppercase letters.`)
  }

  // Validate asset amount if provided
  if (params.assetAmount && !isValidAmount(params.assetAmount)) {
    throw new Error(`Invalid asset amount: ${params.assetAmount}. Must be a positive number.`)
  }

  // Validate fiat amount if provided
  if (params.fiatAmount && !isValidAmount(params.fiatAmount)) {
    throw new Error(`Invalid fiat amount: ${params.fiatAmount}. Must be a positive number.`)
  }

  // Validate that if assetAmount is provided, assetCode must also be provided
  if (params.assetAmount && !params.assetCode) {
    throw new Error('assetCode is required when assetAmount is specified')
  }

  // Validate that if fiatAmount is provided, both assetCode and fiatCode must be provided
  if (params.fiatAmount && (!params.assetCode || !params.fiatCode)) {
    throw new Error('assetCode and fiatCode are required when fiatAmount is specified')
  }

  // Generate or validate referenceId
  const referenceId = params.referenceId || generateReferenceId()
  if (!isValidReferenceId(referenceId)) {
    throw new Error(`Invalid referenceId format: ${referenceId}`)
  }

  // Build URL parameters
  const urlParams: RobinhoodOfframpParams = {
    applicationId: process.env.ROBINHOOD_APP_ID,
    offRamp: true,
    supportedNetworks: params.supportedNetworks.join(','),
    redirectUrl: getRedirectUrl(),
    referenceId: referenceId,
  }

  // Add optional parameters
  if (params.assetCode) {
    urlParams.assetCode = params.assetCode
  }
  if (params.assetAmount) {
    urlParams.assetAmount = params.assetAmount
  }
  if (params.fiatCode) {
    urlParams.fiatCode = params.fiatCode
  }
  if (params.fiatAmount) {
    urlParams.fiatAmount = params.fiatAmount
  }

  // Build URL
  const url = new URL('https://applink.robinhood.com/u/connect')

  // Add all parameters to URL
  Object.entries(urlParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, value.toString())
    }
  })

  return {
    url: url.toString(),
    referenceId,
    params: urlParams,
  }
}

/**
 * Convenience function for common offramp scenarios
 */
export function buildSimpleOfframpUrl(
  assetCode: AssetCode,
  network: SupportedNetwork,
  amount?: string,
): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: [network],
    assetCode,
    assetAmount: amount,
  })
}

/**
 * Build offramp URL for multiple networks (user chooses in Robinhood)
 */
export function buildMultiNetworkOfframpUrl(networks: SupportedNetwork[]): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: networks,
  })
}

/**
 * Build offramp URL with fiat amount specification
 */
export function buildFiatOfframpUrl(
  assetCode: AssetCode,
  network: SupportedNetwork,
  fiatAmount: string,
): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: [network],
    assetCode,
    fiatCode: 'USD',
    fiatAmount,
  })
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
