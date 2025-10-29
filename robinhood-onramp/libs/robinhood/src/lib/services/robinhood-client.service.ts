import { DEFAULT_RETRY_CONFIG, RetryConfig, RobinhoodConfig, ServiceLogger, createConsoleLogger } from './types'

/**
 * Parameters for generating a ConnectId
 */
export interface GenerateConnectIdParams {
  /**
   * The blockchain wallet address to receive assets
   */
  walletAddress: string

  /**
   * Unique identifier for the user (email, user ID, etc.)
   */
  userIdentifier: string

  /**
   * Optional custom configuration
   */
  config?: Partial<RobinhoodConfig>
}

/**
 * Parameters for fetching trading assets
 */
export interface FetchTradingAssetsParams {
  /**
   * Optional filter for asset type
   */
  assetType?: string

  /**
   * Whether to include inactive assets
   */
  includeInactive?: boolean

  /**
   * Custom configuration
   */
  config?: Partial<RobinhoodConfig>
}

/**
 * Response from Robinhood Order Details API
 */
export interface OrderDetailsResponse {
  applicationId: string
  connectId: string
  assetCode: string
  networkCode: string
  fiatCode: string
  fiatAmount: string
  cryptoAmount: string
  price: string
  networkFee: {
    type: string
    fiatAmount: string
    cryptoQuantity: string
  }
  processingFee: {
    type: string
    fiatAmount: string
    cryptoQuantity: string
  }
  partnerFee?: {
    type: string
    fiatAmount: string
    cryptoQuantity: string
  }
  paymentMethod: string
  totalAmount: {
    type: string
    fiatAmount: string
    cryptoQuantity: string
  }
  blockchainTransactionId: string
  destinationAddress: string
  referenceId: string
  status: 'ORDER_STATUS_IN_PROGRESS' | 'ORDER_STATUS_SUCCEEDED' | 'ORDER_STATUS_FAILED' | 'ORDER_STATUS_CANCELLED'
}

/**
 * Service for interacting with Robinhood Connect APIs
 *
 * Handles:
 * - ConnectId generation
 * - Trading asset discovery
 * - API authentication
 * - Error handling and retries
 *
 * @example
 * ```typescript
 * const client = new RobinhoodClientService({
 *   appId: process.env.ROBINHOOD_APP_ID,
 *   apiKey: process.env.ROBINHOOD_API_KEY,
 * });
 *
 * const connectId = await client.generateConnectId({
 *   walletAddress: '0x123...',
 *   userIdentifier: 'user@example.com',
 * });
 * ```
 */
export class RobinhoodClientService {
  private readonly config: RobinhoodConfig
  private readonly retryConfig: RetryConfig
  private readonly logger: ServiceLogger

  constructor(config: RobinhoodConfig, retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG, logger?: ServiceLogger) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.robinhood.com',
    }
    this.retryConfig = retryConfig
    this.logger = logger || createConsoleLogger('RobinhoodClientService')
  }

  /**
   * Generate a ConnectId for initiating a crypto donation flow
   *
   * @param params - Parameters for ConnectId generation
   * @returns Promise resolving to the ConnectId string
   * @throws {Error} If ConnectId generation fails
   *
   * @example
   * ```typescript
   * const connectId = await client.generateConnectId({
   *   walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   userIdentifier: 'donor@endaoment.org',
   * });
   * ```
   */
  async generateConnectId(params: GenerateConnectIdParams): Promise<string> {
    const { walletAddress, userIdentifier, config } = params
    const activeConfig = { ...this.config, ...config }

    this.logger.info('Generating ConnectId', { walletAddress, userIdentifier })

    try {
      const response = await this.fetchWithRetry({
        url: `${activeConfig.baseUrl}/catpay/v1/connect_id/`,
        method: 'POST',
        headers: {
          'x-api-key': activeConfig.apiKey,
          'application-id': activeConfig.appId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawal_address: walletAddress,
          user_identifier: userIdentifier,
        }),
      })

      const data = await response.json()

      // Handle both possible response formats (connect_id or connectId)
      const connectId = data.connect_id || data.connectId

      if (!connectId) {
        throw new Error('No connect_id in response')
      }

      this.logger.info('ConnectId generated successfully', { connectId })
      return connectId
    } catch (error) {
      this.logger.error('Failed to generate ConnectId', error)
      throw new Error(`ConnectId generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get order details for a completed transfer
   *
   * @param connectId - The connectId from the transfer callback
   * @returns Promise resolving to order details
   * @throws {Error} If order details fetch fails or order not found
   *
   * @example
   * ```typescript
   * const orderDetails = await client.getOrderDetails('596e6a8d-3ccd-47f2-b392-7de79df3e8d1');
   * console.log(orderDetails.cryptoAmount); // '0.002'
   * console.log(orderDetails.blockchainTransactionId); // '4bED2x...'
   * ```
   */
  async getOrderDetails(connectId: string, config?: Partial<RobinhoodConfig>): Promise<OrderDetailsResponse> {
    const activeConfig = { ...this.config, ...config }

    this.logger.info('Fetching order details', { connectId })

    try {
      const response = await this.fetchWithRetry({
        url: `${activeConfig.baseUrl}/catpay/v1/external/order/${connectId}`,
        method: 'GET',
        headers: {
          'x-api-key': activeConfig.apiKey,
          'application-id': activeConfig.appId,
        },
      })

      const data = await response.json() as OrderDetailsResponse

      this.logger.info('Order details fetched successfully', {
        connectId,
        status: data.status,
        assetCode: data.assetCode,
        cryptoAmount: data.cryptoAmount,
      })

      return data
    } catch (error) {
      this.logger.error('Failed to fetch order details', error)
      throw new Error(`Order details fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch available trading assets from Robinhood Discovery API
   *
   * @param params - Parameters for asset fetching
   * @returns Promise resolving to array of trading assets
   * @throws {Error} If asset fetching fails
   *
   * @example
   * ```typescript
   * const assets = await client.fetchTradingAssets({
   *   includeInactive: false,
   * });
   * ```
   */
  async fetchTradingAssets(params: FetchTradingAssetsParams = {}): Promise<any[]> {
    const { assetType, includeInactive = false, config } = params
    const activeConfig = { ...this.config, ...config }

    this.logger.info('Fetching trading assets', { assetType, includeInactive })

    try {
      const url = new URL(`${activeConfig.baseUrl}/api/v1/crypto/trading/assets/`)
      if (assetType) {
        url.searchParams.append('asset_type', assetType)
      }

      const response = await this.fetchWithRetry({
        url: url.toString(),
        method: 'GET',
        headers: {
          'x-api-key': activeConfig.apiKey,
          'application-id': activeConfig.appId,
        },
      })

      const data = await response.json()
      const assets = data.results || []

      // Filter inactive if needed
      const filteredAssets = includeInactive ? assets : assets.filter((asset: { is_active?: boolean }) => asset.is_active)

      this.logger.info('Assets fetched successfully', { count: filteredAssets.length })
      return filteredAssets
    } catch (error) {
      this.logger.error('Failed to fetch assets', error)
      throw new Error(`Asset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Private helper method for fetching with retry logic
   *
   * Implements exponential backoff for network failures
   *
   * @param params - Fetch parameters
   * @returns Promise resolving to fetch Response
   * @throws {Error} If all retry attempts fail
   */
  private async fetchWithRetry(params: {
    url: string
    method: string
    headers: Record<string, string>
    body?: string
  }): Promise<Response> {
    const { url, method, headers, body } = params
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        this.logger.warn(`Attempt ${attempt} failed`, { error: lastError.message })

        if (attempt < this.retryConfig.maxAttempts) {
          const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1)
          this.logger.info(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }
}

