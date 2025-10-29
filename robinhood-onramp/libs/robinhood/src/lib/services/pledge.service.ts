import { ServiceLogger, createConsoleLogger } from './types'
import { CreatePledgeDto, PledgeStatus, CentralizedExchangeStatus } from '../dtos'
import { mockTokenService } from '@/libs/shared/lib/backend-mock/mock-token.service'
import { mockPledgeService } from '@/libs/shared/lib/backend-mock/mock-pledge.service'
import { convertToSmallestUnit } from '../backend-integration/amount-converter'

/**
 * Parameters for creating pledge from Robinhood callback
 */
export interface CreatePledgeFromCallbackParams {
  /**
   * Robinhood ConnectId (unique transaction identifier)
   */
  connectId: string

  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   */
  asset: string

  /**
   * Network name (e.g., 'BITCOIN', 'ETHEREUM')
   */
  network: string

  /**
   * Amount in asset units (e.g., '0.5' for 0.5 BTC)
   */
  amount: string

  /**
   * Destination organization/fund ID
   */
  destinationOrgId: string

  /**
   * Optional Robinhood order ID from callback
   */
  orderId?: string

  /**
   * Optional user ID for non-anonymous donations
   */
  pledgerUserId?: string
}

/**
 * Parameters for creating pledge from Order Details API response
 */
export interface CreatePledgeFromOrderDetailsParams {
  /**
   * Robinhood ConnectId
   */
  connectId: string

  /**
   * Optional Robinhood order ID
   */
  orderId?: string

  /**
   * Asset code from Order Details API
   */
  assetCode: string

  /**
   * Network code from Order Details API
   */
  network: string

  /**
   * Crypto amount from Order Details API
   */
  cryptoAmount: string

  /**
   * Fiat amount (USD) from Order Details API
   */
  fiatAmount: string

  /**
   * Blockchain transaction hash
   */
  blockchainTxHash: string

  /**
   * Destination address
   */
  destinationAddress: string

  /**
   * Destination type ('fund' or 'org')
   */
  destinationType: 'fund' | 'org'

  /**
   * Destination ID (fund or org UUID)
   */
  destinationId: string

  /**
   * Optional user ID for non-anonymous donations
   */
  pledgerUserId?: string
}

/**
 * Result from pledge creation
 */
export interface CreatePledgeResult {
  /**
   * Whether creation was successful
   */
  success: boolean

  /**
   * Created pledge DTO (if successful)
   */
  pledge?: CreatePledgeDto

  /**
   * Created pledge entity from backend (if successful)
   */
  backendPledge?: any

  /**
   * Error message (if failed)
   */
  error?: string

  /**
   * Validation warnings
   */
  warnings?: string[]
}

/**
 * Service for creating crypto donation pledges from Robinhood callbacks
 *
 * Handles:
 * - Token resolution via backend TokenService
 * - Amount conversion to smallest unit
 * - Pledge creation via backend PledgeService
 * - Field mapping from Robinhood to backend format
 * - Validation and error handling
 *
 * Demonstrates complete backend integration flow with toasts
 *
 * @example
 * ```typescript
 * const pledgeService = new PledgeService();
 *
 * const result = await pledgeService.createFromCallback({
 *   connectId: 'abc-123-def',
 *   asset: 'BTC',
 *   network: 'BITCOIN',
 *   amount: '0.5',
 *   destinationOrgId: 'fund-uuid',
 *   orderId: 'order-123',
 * });
 *
 * if (result.success) {
 *   console.log('Pledge created:', result.backendPledge);
 * }
 * ```
 */
export class PledgeService {
  private readonly logger: ServiceLogger

  constructor(logger?: ServiceLogger) {
    this.logger = logger || createConsoleLogger('PledgeService')
  }

  /**
   * Create pledge from Robinhood callback data
   *
   * Orchestrates complete flow:
   * 1. Resolve token from backend
   * 2. Convert amount to smallest unit
   * 3. Build CreatePledgeDto
   * 4. Create pledge in backend
   *
   * Shows all backend calls via toasts for demonstration
   *
   * @param params - Callback data and destination info
   * @returns Result with created pledge or error
   *
   * @example
   * ```typescript
   * const result = await pledgeService.createFromCallback({
   *   connectId: 'abc-123',
   *   asset: 'ETH',
   *   network: 'ETHEREUM',
   *   amount: '1.5',
   *   destinationOrgId: 'fund-uuid',
   * });
   * ```
   */
  async createFromCallback(
    params: CreatePledgeFromCallbackParams
  ): Promise<CreatePledgeResult> {
    const {
      connectId,
      asset,
      network,
      amount,
      destinationOrgId,
      orderId,
      pledgerUserId,
    } = params

    const warnings: string[] = []

    try {
      this.logger.info('Creating pledge from Robinhood callback', {
        asset,
        network,
        amount,
        connectId,
      })

      // Step 1: Resolve token from backend
      this.logger.info('Resolving token from backend...', { asset, network })

      const token = await mockTokenService.resolveToken({
        symbol: asset,
        network,
        showToast: true,
      })

      if (!token) {
        const error = `Token ${asset} on network ${network} not found in backend`
        this.logger.error(error)
        return {
          success: false,
          error,
        }
      }

      this.logger.info('Token resolved', {
        tokenId: token.id,
        decimals: token.decimals,
      })

      // Step 2: Convert amount to smallest unit
      this.logger.info('Converting amount to smallest unit...', {
        amount,
        decimals: token.decimals,
      })

      let inputAmount: string
      try {
        inputAmount = convertToSmallestUnit(amount, token.decimals)
        this.logger.info('Amount converted', {
          humanAmount: amount,
          smallestUnit: inputAmount,
        })
      } catch (error) {
        const errorMsg = `Amount conversion failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
        this.logger.error(errorMsg)
        return {
          success: false,
          error: errorMsg,
        }
      }

      // Step 3: Build CreatePledgeDto
      const pledgeDto: CreatePledgeDto = {
        // Prefix connectId with 'robinhood:' to distinguish from blockchain tx hashes
        otcTransactionHash: `robinhood:${connectId}`,
        pledgerUserId,
        inputToken: token.id,
        inputAmount,
        destinationOrgId,
        status: PledgeStatus.PendingLiquidation,
        centralizedExchangeDonationStatus: CentralizedExchangeStatus.Completed,
        centralizedExchangeTransactionId: orderId,
        // Include for debugging
        asset,
        network,
      }

      this.logger.info('Built pledge DTO', { pledgeDto })

      // Add warnings for optional fields
      if (!pledgerUserId) {
        warnings.push('No user ID provided - pledge will be anonymous')
      }

      if (!orderId) {
        warnings.push('No Robinhood order ID provided')
      }

      // Step 4: Create pledge in backend
      this.logger.info('Creating pledge in backend...')

      const backendPledge = await mockPledgeService.createPledge(
        pledgeDto,
        true // Show toast
      )

      this.logger.info('Pledge created successfully', {
        pledgeId: backendPledge.id,
      })

      return {
        success: true,
        pledge: pledgeDto,
        backendPledge,
        warnings: warnings.length > 0 ? warnings : undefined,
      }
    } catch (error) {
      const errorMsg = `Pledge creation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
      this.logger.error(errorMsg, error)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Create pledge from Robinhood Order Details API response
   *
   * This is the NEW preferred method that uses definitive data from Robinhood's API
   * instead of unreliable callback URL parameters.
   *
   * @param params - Order details from Robinhood API
   * @returns Pledge creation result
   *
   * @example
   * ```typescript
   * const result = await pledgeService.createPledgeFromOrderDetails({
   *   connectId: '596e6a8d-3ccd-47f2-b392-7de79df3e8d1',
   *   assetCode: 'SOL',
   *   network: 'SOLANA',
   *   cryptoAmount: '0.002',
   *   fiatAmount: '0.41',
   *   blockchainTxHash: '4bED2xdo6sj...',
   *   destinationAddress: 'DPsUYCz...',
   *   destinationType: 'fund',
   *   destinationId: 'fund-uuid',
   * });
   * ```
   */
  async createPledgeFromOrderDetails(
    params: CreatePledgeFromOrderDetailsParams
  ): Promise<CreatePledgeResult> {
    const {
      connectId,
      orderId,
      assetCode,
      network,
      cryptoAmount,
      fiatAmount,
      blockchainTxHash,
      destinationAddress,
      destinationType,
      destinationId,
      pledgerUserId,
    } = params

    const warnings: string[] = []

    this.logger.info('Creating pledge from Order Details API', {
      connectId,
      assetCode,
      cryptoAmount,
      fiatAmount,
    })

    try {
      // Step 1: Resolve token from backend
      this.logger.info('Resolving token...', { assetCode, network })

      const token = await mockTokenService.getTokenBySymbolAndNetwork(
        assetCode,
        network,
        true // Show toast
      )

      if (!token) {
        const errorMsg = `Token ${assetCode} on network ${network} not found in backend`
        this.logger.error(errorMsg)
        return {
          success: false,
          error: errorMsg,
        }
      }

      this.logger.info('Token resolved', { token: token.symbol, decimals: token.decimals })

      // Step 2: Convert amount to smallest unit (e.g., satoshis, wei)
      this.logger.info('Converting amount to smallest unit...', {
        amount: cryptoAmount,
        decimals: token.decimals,
      })

      let inputAmount: string
      try {
        inputAmount = convertToSmallestUnit(cryptoAmount, token.decimals)
        this.logger.info('Amount converted', { inputAmount })
      } catch (error) {
        const errorMsg = `Amount conversion failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
        this.logger.error(errorMsg)
        return {
          success: false,
          error: errorMsg,
        }
      }

      // Step 3: Build CreatePledgeDto with blockchain tx hash
      const pledgeDto: CreatePledgeDto = {
        // Use actual blockchain transaction hash as primary identifier
        otcTransactionHash: blockchainTxHash,
        pledgerUserId,
        inputToken: token.id,
        inputAmount,
        destinationOrgId: destinationId,
        status: PledgeStatus.PendingLiquidation,
        centralizedExchangeDonationStatus: CentralizedExchangeStatus.Completed,
        centralizedExchangeTransactionId: orderId || connectId,
        // Include for debugging and tracking
        asset: assetCode,
        network,
        // NEW: Include fiat amount for better tracking
        fiatAmountUsd: fiatAmount,
        // NEW: Include destination address
        destinationWalletAddress: destinationAddress,
      }

      this.logger.info('Built pledge DTO with blockchain tx hash', { pledgeDto })

      // Add warnings for optional fields
      if (!pledgerUserId) {
        warnings.push('No user ID provided - pledge will be anonymous')
      }

      // Step 4: Create pledge in backend
      this.logger.info('Creating pledge in backend...')

      const backendPledge = await mockPledgeService.createPledge(
        pledgeDto,
        true // Show toast
      )

      this.logger.info('Pledge created successfully', {
        pledgeId: backendPledge.id,
        blockchainTxHash,
      })

      return {
        success: true,
        pledge: pledgeDto,
        backendPledge,
        warnings: warnings.length > 0 ? warnings : undefined,
      }
    } catch (error) {
      const errorMsg = `Pledge creation from Order Details failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
      this.logger.error(errorMsg, error)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Validate pledge parameters before creation
   *
   * @param params - Parameters to validate
   * @returns Validation errors (empty if valid)
   */
  validateParameters(params: CreatePledgeFromCallbackParams): string[] {
    const errors: string[] = []

    if (!params.connectId || params.connectId.trim().length === 0) {
      errors.push('ConnectId is required')
    }

    if (!params.asset || params.asset.trim().length === 0) {
      errors.push('Asset symbol is required')
    }

    if (!params.network || params.network.trim().length === 0) {
      errors.push('Network is required')
    }

    if (!params.amount || params.amount.trim().length === 0) {
      errors.push('Amount is required')
    } else {
      const amountFloat = parseFloat(params.amount)
      if (isNaN(amountFloat) || amountFloat <= 0) {
        errors.push('Amount must be a positive number')
      }
    }

    if (!params.destinationOrgId || params.destinationOrgId.trim().length === 0) {
      errors.push('Destination organization ID is required')
    }

    return errors
  }
}

// Singleton instance for convenience
export const pledgeService = new PledgeService()

