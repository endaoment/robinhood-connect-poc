import { ServiceLogger, createConsoleLogger } from './types'
import { RobinhoodNetwork } from '../types'
import { isValidWalletAddress, isValidAssetCode } from '../url-builder/validation'

/**
 * Parameters for generating onramp URL
 */
export interface GenerateOnrampUrlParams {
  /**
   * ConnectId from Robinhood API
   */
  connectId: string

  /**
   * Asset symbol (e.g., 'BTC')
   */
  asset: string

  /**
   * Network name (e.g., 'BITCOIN')
   */
  network: RobinhoodNetwork

  /**
   * Wallet address for receiving crypto
   */
  walletAddress: string

  /**
   * Redirect/callback URL for after transaction
   */
  redirectUrl?: string
}

/**
 * Parameters for validating a URL
 */
export interface ValidateUrlParams {
  /**
   * URL to validate
   */
  url: string

  /**
   * Expected base URL
   */
  expectedBaseUrl?: string
}

/**
 * Result from URL generation
 */
export interface OnrampUrlResult {
  /**
   * Complete onramp URL
   */
  url: string

  /**
   * ConnectId used in URL
   */
  connectId: string

  /**
   * Parameters included in URL
   */
  params: {
    asset: string
    network: string
    walletAddress: string
  }
}

/**
 * Service for building and validating Robinhood onramp URLs
 *
 * Handles:
 * - URL generation in Daffy style
 * - Parameter encoding and validation
 * - URL structure validation
 * - Callback URL parsing
 *
 * @example
 * ```typescript
 * const urlBuilder = new UrlBuilderService();
 *
 * const result = urlBuilder.generateOnrampUrl({
 *   connectId: 'abc-123-def',
 *   asset: 'BTC',
 *   network: 'BITCOIN',
 *   walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
 *   redirectUrl: 'https://app.endaoment.org/callback',
 * });
 * ```
 */
export class UrlBuilderService {
  private readonly logger: ServiceLogger
  private readonly baseUrl: string
  private readonly applicationId: string

  constructor(config?: { baseUrl?: string; applicationId?: string }, logger?: ServiceLogger) {
    this.baseUrl = config?.baseUrl || 'https://robinhood.com/connect/amount'
    this.applicationId = config?.applicationId || this.getApplicationId()
    this.logger = logger || createConsoleLogger('UrlBuilderService')
  }

  /**
   * Generate Robinhood onramp URL for crypto donation
   *
   * Uses Daffy-style URL format with asset pre-selection
   *
   * @param params - URL generation parameters
   * @returns URL result with complete URL and metadata
   * @throws {Error} If parameters are invalid
   *
   * @example
   * ```typescript
   * const result = urlBuilder.generateOnrampUrl({
   *   connectId: 'abc-123',
   *   asset: 'ETH',
   *   network: 'ETHEREUM',
   *   walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   * });
   * console.log(result.url); // Full Robinhood URL
   * ```
   */
  generateOnrampUrl(params: GenerateOnrampUrlParams): OnrampUrlResult {
    const { connectId, asset, network, walletAddress, redirectUrl } = params

    // Validate required parameters
    this.validateParameters({ connectId, asset, network, walletAddress })

    // Get redirect URL
    const finalRedirectUrl = redirectUrl || this.getDefaultRedirectUrl()

    // Build URL parameters in Daffy style
    const urlParams = new URLSearchParams({
      applicationId: this.applicationId,
      connectId,
      paymentMethod: 'crypto_balance',
      redirectUrl: finalRedirectUrl,
      supportedAssets: asset,
      supportedNetworks: network,
      walletAddress,
      assetCode: asset, // Daffy includes this
      flow: 'transfer',
    })

    const url = `${this.baseUrl}?${urlParams.toString()}`

    this.logger.info('Generated onramp URL', {
      asset,
      network,
      connectId,
      urlLength: url.length,
    })

    return {
      url,
      connectId,
      params: {
        asset,
        network,
        walletAddress,
      },
    }
  }

  /**
   * Validate a Robinhood onramp URL
   *
   * Checks URL structure and required parameters
   *
   * @param params - Validation parameters
   * @returns True if URL is valid
   *
   * @example
   * ```typescript
   * const isValid = urlBuilder.validateUrl({
   *   url: 'https://robinhood.com/connect/amount?...',
   *   expectedBaseUrl: 'https://robinhood.com/connect/amount',
   * });
   * ```
   */
  validateUrl(params: ValidateUrlParams): boolean {
    const { url, expectedBaseUrl } = params

    try {
      const urlObj = new URL(url)

      // Check base URL if provided
      if (expectedBaseUrl) {
        const expectedUrl = new URL(expectedBaseUrl)
        if (
          urlObj.protocol !== expectedUrl.protocol ||
          urlObj.host !== expectedUrl.host ||
          urlObj.pathname !== expectedUrl.pathname
        ) {
          this.logger.warn('URL base does not match expected', {
            actual: `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`,
            expected: `${expectedUrl.protocol}//${expectedUrl.host}${expectedUrl.pathname}`,
          })
          return false
        }
      }

      // Check required parameters
      const requiredParams = ['applicationId', 'connectId', 'walletAddress']
      for (const param of requiredParams) {
        if (!urlObj.searchParams.has(param)) {
          this.logger.warn('Missing required parameter', { param })
          return false
        }
      }

      this.logger.info('URL validation passed')
      return true
    } catch (error) {
      this.logger.error('URL validation failed', error)
      return false
    }
  }

  /**
   * Extract parameters from callback URL
   *
   * Parses URL search params into key-value object
   *
   * @param callbackUrl - URL received from Robinhood callback
   * @returns Parsed parameters as key-value pairs
   *
   * @example
   * ```typescript
   * const params = urlBuilder.parseCallbackUrl(
   *   'https://app.endaoment.org/callback?orderId=123&asset=BTC'
   * );
   * console.log(params.orderId); // '123'
   * console.log(params.asset); // 'BTC'
   * ```
   */
  parseCallbackUrl(callbackUrl: string): Record<string, string> {
    try {
      const urlObj = new URL(callbackUrl)
      const params: Record<string, string> = {}

      // Extract all search parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value
      })

      this.logger.info('Parsed callback URL', {
        paramCount: Object.keys(params).length,
        keys: Object.keys(params),
      })

      return params
    } catch (error) {
      this.logger.error('Failed to parse callback URL', error)
      throw new Error(
        `Invalid callback URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate URL generation parameters
   *
   * @private
   */
  private validateParameters(params: {
    connectId: string
    asset: string
    network: RobinhoodNetwork
    walletAddress: string
  }): void {
    const { connectId, asset, network, walletAddress } = params

    if (!connectId || connectId.trim().length === 0) {
      throw new Error('ConnectId is required')
    }

    if (!asset || !isValidAssetCode(asset)) {
      throw new Error(`Invalid asset code: ${asset}`)
    }

    if (!network || network.trim().length === 0) {
      throw new Error('Network is required')
    }

    if (!walletAddress || !isValidWalletAddress(walletAddress, network)) {
      throw new Error(`Invalid wallet address for network ${network}: ${walletAddress}`)
    }

    this.logger.debug('Parameters validated successfully')
  }

  /**
   * Get Robinhood application ID from environment
   *
   * @private
   */
  private getApplicationId(): string {
    const appId =
      process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID ||
      process.env.ROBINHOOD_APP_ID

    if (!appId) {
      throw new Error(
        'NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID or ROBINHOOD_APP_ID environment variable not set'
      )
    }

    return appId
  }

  /**
   * Get default redirect URL based on environment
   *
   * @private
   */
  private getDefaultRedirectUrl(): string {
    // Use environment variable or construct from current host
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol
      const host = window.location.host
      return `${protocol}//${host}/callback`
    }

    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_CALLBACK_URL || 'http://localhost:3000/callback'
  }
}

