import { ServiceLogger, createConsoleLogger } from './types'

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
  network: string

  /**
   * Amount in asset units
   */
  amount: string

  /**
   * Callback URL for after transaction
   */
  callbackUrl: string

  /**
   * Optional destination fund ID
   */
  destinationFundId?: string

  /**
   * Optional user identifier
   */
  userIdentifier?: string
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
 * Service for building and validating Robinhood onramp URLs
 *
 * Handles:
 * - URL generation in Daffy style
 * - Parameter encoding and validation
 * - URL structure validation
 *
 * @example
 * ```typescript
 * const urlBuilder = new UrlBuilderService();
 *
 * const url = urlBuilder.generateOnrampUrl({
 *   connectId: 'abc-123-def',
 *   asset: 'BTC',
 *   network: 'BITCOIN',
 *   amount: '0.5',
 *   callbackUrl: 'https://app.endaoment.org/callback',
 * });
 * ```
 */
export class UrlBuilderService {
  private readonly logger: ServiceLogger
  private readonly baseUrl: string

  constructor(baseUrl?: string, logger?: ServiceLogger) {
    this.baseUrl = baseUrl || 'https://robinhood.com/crypto/donate'
    this.logger = logger || createConsoleLogger('UrlBuilderService')
  }

  /**
   * Generate Robinhood onramp URL for crypto donation
   *
   * @param params - URL generation parameters
   * @returns Complete onramp URL
   * @throws {Error} If parameters are invalid
   */
  generateOnrampUrl(params: GenerateOnrampUrlParams): string {
    // Implementation in SP6
    this.logger.info('generateOnrampUrl called', params)
    throw new Error('Not implemented - see Sub-Plan 6')
  }

  /**
   * Validate a Robinhood onramp URL
   *
   * @param params - Validation parameters
   * @returns True if URL is valid
   */
  validateUrl(params: ValidateUrlParams): boolean {
    // Implementation in SP6
    this.logger.info('validateUrl called', params)
    throw new Error('Not implemented - see Sub-Plan 6')
  }

  /**
   * Extract parameters from callback URL
   *
   * @param callbackUrl - URL received from Robinhood callback
   * @returns Parsed parameters
   */
  parseCallbackUrl(callbackUrl: string): Record<string, string> {
    // Implementation in SP6
    this.logger.info('parseCallbackUrl called', { callbackUrl })
    throw new Error('Not implemented - see Sub-Plan 6')
  }
}

