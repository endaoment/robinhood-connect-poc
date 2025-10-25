/**
 * Comprehensive tests for PledgeService
 *
 * Tests:
 * - Pledge creation from callback data
 * - Token resolution integration
 * - Amount conversion
 * - Field mapping to CryptoDonationPledge
 * - Validation
 * - Error handling
 * - Backend integration flow
 */
import { PledgeService } from '@/libs/robinhood/lib/services/pledge.service'
import { mockTokenService } from '@/libs/shared/lib/backend-mock/mock-token.service'
import { mockPledgeService as mockBackendPledgeService } from '@/libs/shared/lib/backend-mock/mock-pledge.service'
import { PledgeStatus, CentralizedExchangeStatus } from '@/libs/robinhood/lib/dtos'

// Mock the backend services
jest.mock('@/libs/shared/lib/backend-mock/mock-token.service')
jest.mock('@/libs/shared/lib/backend-mock/mock-pledge.service')

describe('PledgeService', () => {
  let service: PledgeService

  beforeEach(() => {
    service = new PledgeService()
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize without logger', () => {
      const pledgeService = new PledgeService()
      expect(pledgeService).toBeDefined()
    })

    it('should accept custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const pledgeService = new PledgeService(mockLogger)
      expect(pledgeService).toBeDefined()
    })
  })

  describe('createFromCallback', () => {
    it('should create pledge successfully with all parameters', async () => {
      // Mock token resolution
      const mockToken = {
        id: 'token-uuid-123',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)

      // Mock pledge creation
      const mockBackendPledge = {
        id: 'pledge-uuid-456',
        otcTransactionHash: 'robinhood:connect-id-abc',
        status: PledgeStatus.PendingLiquidation,
      }
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue(
        mockBackendPledge
      )

      const result = await service.createFromCallback({
        connectId: 'connect-id-abc',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-uuid-789',
        orderId: 'order-123',
        pledgerUserId: 'user-uuid-999',
      })

      expect(result.success).toBe(true)
      expect(result.pledge).toBeDefined()
      expect(result.backendPledge).toBeDefined()
      expect(result.pledge?.otcTransactionHash).toBe('robinhood:connect-id-abc')
      expect(result.pledge?.inputToken).toBe('token-uuid-123')
      expect(result.pledge?.destinationOrgId).toBe('fund-uuid-789')
    })

    it('should resolve token from backend', async () => {
      const mockToken = {
        id: 'eth-token-id',
        symbol: 'ETH',
        network: 'ETHEREUM',
        decimals: 18,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      await service.createFromCallback({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        amount: '1.5',
        destinationOrgId: 'fund-id',
      })

      expect(mockTokenService.resolveToken).toHaveBeenCalledWith({
        symbol: 'ETH',
        network: 'ETHEREUM',
        showToast: true,
      })
    })

    it('should convert amount to smallest unit', async () => {
      const mockToken = {
        id: 'btc-token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      // 0.5 BTC = 50000000 satoshis (8 decimals)
      expect(result.pledge?.inputAmount).toBe('50000000')
    })

    it('should handle 18-decimal tokens (ETH)', async () => {
      const mockToken = {
        id: 'eth-token-id',
        symbol: 'ETH',
        network: 'ETHEREUM',
        decimals: 18,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        amount: '1.5',
        destinationOrgId: 'fund-id',
      })

      // 1.5 ETH = 1500000000000000000 wei (18 decimals)
      expect(result.pledge?.inputAmount).toBe('1500000000000000000')
    })

    it('should handle 6-decimal stablecoins (USDC)', async () => {
      const mockToken = {
        id: 'usdc-token-id',
        symbol: 'USDC',
        network: 'ETHEREUM',
        decimals: 6,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'USDC',
        network: 'ETHEREUM',
        amount: '100',
        destinationOrgId: 'fund-id',
      })

      // 100 USDC = 100000000 (6 decimals)
      expect(result.pledge?.inputAmount).toBe('100000000')
    })

    it('should prefix connectId with "robinhood:"', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'unique-connect-id-123',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(result.pledge?.otcTransactionHash).toBe('robinhood:unique-connect-id-123')
    })

    it('should set status to PendingLiquidation', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(result.pledge?.status).toBe(PledgeStatus.PendingLiquidation)
    })

    it('should set centralizedExchangeDonationStatus to Completed', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(result.pledge?.centralizedExchangeDonationStatus).toBe(
        CentralizedExchangeStatus.Completed
      )
    })

    it('should include orderId if provided', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
        orderId: 'robinhood-order-456',
      })

      expect(result.pledge?.centralizedExchangeTransactionId).toBe('robinhood-order-456')
    })

    it('should include pledgerUserId if provided', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
        pledgerUserId: 'user-uuid-123',
      })

      expect(result.pledge?.pledgerUserId).toBe('user-uuid-123')
    })

    it('should add warning for missing userId', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
        // No pledgerUserId
      })

      expect(result.warnings).toBeDefined()
      expect(result.warnings).toContain('No user ID provided - pledge will be anonymous')
    })

    it('should add warning for missing orderId', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
        pledgerUserId: 'user-id',
        // No orderId
      })

      expect(result.warnings).toBeDefined()
      expect(result.warnings).toContain('No Robinhood order ID provided')
    })

    it('should return error if token not found', async () => {
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(null)

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'INVALID',
        network: 'INVALID',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('not found in backend')
    })

    it('should return error if amount conversion fails', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: 'invalid-amount',
        destinationOrgId: 'fund-id',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Amount conversion failed')
    })

    it('should return error if backend pledge creation fails', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Pledge creation failed')
    })

    it('should call backend pledge service with toast enabled', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(mockBackendPledgeService.createPledge).toHaveBeenCalledWith(
        expect.objectContaining({
          otcTransactionHash: 'robinhood:test-id',
        }),
        true // showToast
      )
    })

    it('should handle decimal amounts correctly', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.12345678',
        destinationOrgId: 'fund-id',
      })

      // 0.12345678 BTC = 12345678 satoshis
      expect(result.pledge?.inputAmount).toBe('12345678')
    })

    it('should handle very small amounts', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.00000001', // 1 satoshi
        destinationOrgId: 'fund-id',
      })

      expect(result.pledge?.inputAmount).toBe('1')
    })

    it('should handle large amounts', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'ETH',
        network: 'ETHEREUM',
        decimals: 18,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        amount: '1000',
        destinationOrgId: 'fund-id',
      })

      // 1000 ETH = 1000000000000000000000 wei
      expect(result.pledge?.inputAmount).toBe('1000000000000000000000')
    })

    it('should include asset and network in DTO for debugging', async () => {
      const mockToken = {
        id: 'token-id',
        symbol: 'SOL',
        network: 'SOLANA',
        decimals: 9,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const result = await service.createFromCallback({
        connectId: 'test-id',
        asset: 'SOL',
        network: 'SOLANA',
        amount: '10',
        destinationOrgId: 'fund-id',
      })

      expect(result.pledge?.asset).toBe('SOL')
      expect(result.pledge?.network).toBe('SOLANA')
    })
  })

  describe('validateParameters', () => {
    it('should return no errors for valid parameters', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toHaveLength(0)
    })

    it('should error on empty connectId', () => {
      const errors = service.validateParameters({
        connectId: '',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('ConnectId is required')
    })

    it('should error on whitespace-only connectId', () => {
      const errors = service.validateParameters({
        connectId: '   ',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('ConnectId is required')
    })

    it('should error on empty asset', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: '',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Asset symbol is required')
    })

    it('should error on empty network', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: '',
        amount: '0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Network is required')
    })

    it('should error on empty amount', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Amount is required')
    })

    it('should error on invalid amount (not a number)', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: 'not-a-number',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Amount must be a positive number')
    })

    it('should error on negative amount', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '-0.5',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Amount must be a positive number')
    })

    it('should error on zero amount', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0',
        destinationOrgId: 'fund-id',
      })

      expect(errors).toContain('Amount must be a positive number')
    })

    it('should error on empty destinationOrgId', () => {
      const errors = service.validateParameters({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: '',
      })

      expect(errors).toContain('Destination organization ID is required')
    })

    it('should return multiple errors', () => {
      const errors = service.validateParameters({
        connectId: '',
        asset: '',
        network: '',
        amount: '',
        destinationOrgId: '',
      })

      expect(errors.length).toBeGreaterThan(1)
      expect(errors).toContain('ConnectId is required')
      expect(errors).toContain('Asset symbol is required')
      expect(errors).toContain('Network is required')
      expect(errors).toContain('Amount is required')
      expect(errors).toContain('Destination organization ID is required')
    })
  })

  describe('Logging', () => {
    it('should log pledge creation steps', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const mockToken = {
        id: 'token-id',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-id',
      })

      const pledgeService = new PledgeService(mockLogger)

      await pledgeService.createFromCallback({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log errors', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(null)

      const pledgeService = new PledgeService(mockLogger)

      await pledgeService.createFromCallback({
        connectId: 'test-id',
        asset: 'INVALID',
        network: 'INVALID',
        amount: '0.1',
        destinationOrgId: 'fund-id',
      })

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete pledge flow', async () => {
      const mockToken = {
        id: 'btc-token-uuid',
        symbol: 'BTC',
        network: 'BITCOIN',
        decimals: 8,
      }
      const mockBackendPledge = {
        id: 'pledge-uuid-123',
        otcTransactionHash: 'robinhood:connect-abc-123',
        pledgerUserId: 'user-uuid-456',
        inputToken: 'btc-token-uuid',
        inputAmount: '50000000', // 0.5 BTC in satoshis
        destinationOrgId: 'fund-uuid-789',
        status: PledgeStatus.PendingLiquidation,
        centralizedExchangeDonationStatus: CentralizedExchangeStatus.Completed,
        centralizedExchangeTransactionId: 'robinhood-order-999',
      }

      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue(
        mockBackendPledge
      )

      const result = await service.createFromCallback({
        connectId: 'connect-abc-123',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        destinationOrgId: 'fund-uuid-789',
        orderId: 'robinhood-order-999',
        pledgerUserId: 'user-uuid-456',
      })

      expect(result.success).toBe(true)
      expect(result.pledge).toBeDefined()
      expect(result.backendPledge).toBeDefined()
      expect(result.warnings).toBeUndefined() // No warnings

      // Verify DTO fields
      expect(result.pledge?.otcTransactionHash).toBe('robinhood:connect-abc-123')
      expect(result.pledge?.inputToken).toBe('btc-token-uuid')
      expect(result.pledge?.inputAmount).toBe('50000000')
      expect(result.pledge?.destinationOrgId).toBe('fund-uuid-789')
      expect(result.pledge?.status).toBe(PledgeStatus.PendingLiquidation)
      expect(result.pledge?.centralizedExchangeDonationStatus).toBe(
        CentralizedExchangeStatus.Completed
      )
      expect(result.pledge?.centralizedExchangeTransactionId).toBe('robinhood-order-999')
      expect(result.pledge?.pledgerUserId).toBe('user-uuid-456')
    })

    it('should handle anonymous donation (no userId)', async () => {
      const mockToken = {
        id: 'eth-token-uuid',
        symbol: 'ETH',
        network: 'ETHEREUM',
        decimals: 18,
      }
      ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
      ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
        id: 'pledge-uuid',
      })

      const result = await service.createFromCallback({
        connectId: 'connect-xyz',
        asset: 'ETH',
        network: 'ETHEREUM',
        amount: '2.5',
        destinationOrgId: 'fund-uuid',
        // No pledgerUserId - anonymous
      })

      expect(result.success).toBe(true)
      expect(result.pledge?.pledgerUserId).toBeUndefined()
      expect(result.warnings).toContain('No user ID provided - pledge will be anonymous')
    })

    it('should handle multiple asset types', async () => {
      const testCases = [
        { asset: 'BTC', network: 'BITCOIN', decimals: 8, amount: '0.5' },
        { asset: 'ETH', network: 'ETHEREUM', decimals: 18, amount: '1.5' },
        { asset: 'SOL', network: 'SOLANA', decimals: 9, amount: '10' },
        { asset: 'USDC', network: 'ETHEREUM', decimals: 6, amount: '100' },
      ]

      for (const testCase of testCases) {
        const mockToken = {
          id: `${testCase.asset.toLowerCase()}-id`,
          symbol: testCase.asset,
          network: testCase.network,
          decimals: testCase.decimals,
        }
        ;(mockTokenService.resolveToken as jest.Mock).mockResolvedValue(mockToken)
        ;(mockBackendPledgeService.createPledge as jest.Mock).mockResolvedValue({
          id: 'pledge-id',
        })

        const result = await service.createFromCallback({
          connectId: `test-${testCase.asset}`,
          asset: testCase.asset,
          network: testCase.network,
          amount: testCase.amount,
          destinationOrgId: 'fund-id',
        })

        expect(result.success).toBe(true)
        expect(result.pledge?.asset).toBe(testCase.asset)
        expect(result.pledge?.network).toBe(testCase.network)
      }
    })
  })

  describe('Singleton Export', () => {
    it('should export pledgeService singleton', () => {
      // Import the singleton
      const { pledgeService } = require('@/libs/robinhood/lib/services/pledge.service')

      expect(pledgeService).toBeDefined()
      expect(pledgeService).toBeInstanceOf(PledgeService)
    })
  })
})

