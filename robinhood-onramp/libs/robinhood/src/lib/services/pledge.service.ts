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

