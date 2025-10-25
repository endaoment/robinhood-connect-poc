import { v4 as uuidv4 } from 'uuid'
import type { DaffyStyleOnrampParams, DaffyStyleOnrampUrlResult } from '../types'
import { isValidWalletAddress } from './validation'

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
export function buildDaffyStyleOnrampUrl(params: DaffyStyleOnrampParams): DaffyStyleOnrampUrlResult {
  const { asset, network, walletAddress, redirectUrl, connectId, assetAmount } = params

  // Validate required parameters
  if (!asset || !network || !walletAddress) {
    throw new Error('Asset, network, and walletAddress are required for Daffy-style onramp URL')
  }

  // Validate wallet address format
  if (!isValidWalletAddress(walletAddress, network)) {
    throw new Error(`Invalid wallet address format for network ${network}: ${walletAddress}`)
  }

  // Use provided connectId (should come from Robinhood API)
  // Generate UUID only as fallback for testing
  const finalConnectId = connectId || uuidv4()

  // Get base URL and redirect URL
  const baseUrl = getRobinhoodBaseUrl()
  const finalRedirectUrl = redirectUrl || getDefaultRedirectUrl()

  // Get application ID
  const applicationId = getRobinhoodApplicationId()

  // Build URL parameters (EXACT format from Daffy's implementation)
  const urlParams = new URLSearchParams({
    applicationId,
    connectId: finalConnectId,
    paymentMethod: 'crypto_balance', // Required for transfers from Robinhood balance
    redirectUrl: finalRedirectUrl,
    supportedAssets: asset, // Single asset only
    supportedNetworks: network, // Single network only
    walletAddress,
    assetCode: asset, // Daffy includes this (same as supportedAssets)
    flow: 'transfer', // CRITICAL: Specifies transfer flow (not sell)
  })

  // Add assetAmount if provided (pre-fills the amount in Robinhood UI)
  if (assetAmount) {
    urlParams.set('assetAmount', assetAmount)
  }

  const url = `${baseUrl}?${urlParams.toString()}`

  // Log for debugging
  console.log('[URL Builder] Generated Daffy-style URL:', {
    asset,
    network,
    connectId: finalConnectId,
    urlLength: url.length,
  })

  return {
    url,
    connectId: finalConnectId,
    params: {
      asset,
      network,
      walletAddress,
    },
  }
}

/**
 * Get Robinhood Connect base URL
 */
function getRobinhoodBaseUrl(): string {
  // CRITICAL: Use /connect/amount NOT /applink/connect
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
  return process.env.NEXT_PUBLIC_CALLBACK_URL || 'http://localhost:3030/callback'
}

/**
 * Get Robinhood application ID
 */
function getRobinhoodApplicationId(): string {
  const appId = process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID || process.env.ROBINHOOD_APP_ID

  if (!appId) {
    throw new Error('NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID or ROBINHOOD_APP_ID environment variable not set')
  }

  return appId
}

/**
 * Generate a new UUID v4 connectId for order tracking
 * Note: For onramp, connectId should be obtained from Robinhood API
 * This is a fallback for testing/development only
 */
export function generateConnectId(): string {
  return uuidv4()
}

/**
 * Validate connectId format (UUID v4)
 */
export function isValidConnectId(connectId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(connectId)
}
