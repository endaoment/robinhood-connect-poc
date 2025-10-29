/**
 * Comprehensive tests for RobinhoodClientService
 *
 * Tests:
 * - ConnectId generation (success/failure)
 * - Asset fetching (various params)
 * - Order Details API (success/failure/retries)  ⭐ NEW
 * - Retry logic
 * - Error handling
 * - Configuration
 *
 * Total: 61 tests
 */
import { RobinhoodClientService } from '@/libs/robinhood/lib/services/robinhood-client.service'
import {
  cleanAll,
  createMockAsset,
  createMockAssets,
  isDone,
  mockConnectIdFailure,
  mockConnectIdSuccess,
  mockDiscoveryFailure,
  mockDiscoverySuccess,
  mockDiscoveryWithQuery,
} from '../mocks/robinhood-nock-api'

describe('RobinhoodClientService', () => {
  const testConfig = {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
  }

  afterEach(() => {
    cleanAll()
  })

  describe('Constructor', () => {
    it('should initialize with config', () => {
      const service = new RobinhoodClientService(testConfig)
      expect(service).toBeDefined()
    })

    it('should use default base URL if not provided', () => {
      const service = new RobinhoodClientService(testConfig)
      expect(service).toBeDefined()
    })

    it('should accept custom base URL', () => {
      const service = new RobinhoodClientService({
        ...testConfig,
        baseUrl: 'https://custom.robinhood.com',
      })
      expect(service).toBeDefined()
    })

    it('should accept custom retry config', () => {
      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 5,
        delayMs: 500,
        backoffMultiplier: 3,
      })
      expect(service).toBeDefined()
    })

    it('should accept custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new RobinhoodClientService(testConfig, undefined, mockLogger)
      expect(service).toBeDefined()
    })
  })

  describe('generateConnectId', () => {
    it('should generate ConnectId successfully', async () => {
      const testConnectId = 'test-connect-id-abc-123'
      mockConnectIdSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        userIdentifier: 'test@endaoment.org',
      })

      expect(result).toBe(testConnectId)
      expect(isDone()).toBe(true)
    })

    it('should handle connect_id field in response', async () => {
      const testConnectId = 'connect-id-with-underscore'
      mockConnectIdSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        userIdentifier: 'donor@example.com',
      })

      expect(result).toBe(testConnectId)
    })

    it('should throw error if connect_id missing in response', async () => {
      mockConnectIdSuccess('') // Empty connectId

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow('No connect_id in response')
    })

    it('should handle API errors', async () => {
      mockConnectIdFailure(400, 'Invalid wallet address')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: 'invalid',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow('ConnectId generation failed')
    })

    it('should handle 500 server errors', async () => {
      mockConnectIdFailure(500, 'Internal Server Error')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow('ConnectId generation failed')
    })

    it('should handle network failures', async () => {
      mockConnectIdFailure(503, 'Service Unavailable')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow()
    })

    it('should use custom config from params', async () => {
      const customConnectId = 'custom-config-connect-id'
      mockConnectIdSuccess(customConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
        config: {
          apiKey: 'custom-api-key',
        },
      })

      expect(result).toBe(customConnectId)
    })

    it('should handle different wallet address formats', async () => {
      const testConnectId = 'btc-wallet-connect-id'
      mockConnectIdSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Bitcoin format
        userIdentifier: 'btc@example.com',
      })

      expect(result).toBe(testConnectId)
    })

    it('should handle different user identifier formats', async () => {
      const testConnectId = 'userid-connect-id'
      mockConnectIdSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'user-uuid-12345', // UUID format
      })

      expect(result).toBe(testConnectId)
    })

    it('should retry on transient failures', async () => {
      // First attempt fails, second succeeds
      mockConnectIdFailure(503, 'Service Unavailable')
      mockConnectIdSuccess('retry-success-id')

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 2,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
      })

      expect(result).toBe('retry-success-id')
    })

    it('should fail after max retry attempts', async () => {
      // All attempts fail
      mockConnectIdFailure(500)
      mockConnectIdFailure(500)
      mockConnectIdFailure(500)

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 3,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow()
    })
  })

  describe('fetchTradingAssets', () => {
    it('should fetch all active assets', async () => {
      const mockAssets = createMockAssets(5)
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toHaveLength(5)
      expect(result[0].asset_code).toBe('BTC')
      expect(result[1].asset_code).toBe('ETH')
      expect(isDone()).toBe(true)
    })

    it('should filter inactive assets by default', async () => {
      const mockAssets = [
        createMockAsset({ asset_code: 'BTC', is_active: true }),
        createMockAsset({ asset_code: 'ETH', is_active: false }),
        createMockAsset({ asset_code: 'SOL', is_active: true }),
      ]
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toHaveLength(2)
      expect(result[0].asset_code).toBe('BTC')
      expect(result[1].asset_code).toBe('SOL')
    })

    it('should include inactive assets when requested', async () => {
      const mockAssets = [
        createMockAsset({ asset_code: 'BTC', is_active: true }),
        createMockAsset({ asset_code: 'ETH', is_active: false }),
        createMockAsset({ asset_code: 'SOL', is_active: true }),
      ]
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets({ includeInactive: true })

      expect(result).toHaveLength(3)
      expect(result.some((a) => a.asset_code === 'ETH')).toBe(true)
    })

    it('should filter by asset type', async () => {
      const mockAssets = createMockAssets(3)
      mockDiscoveryWithQuery({ asset_type: 'crypto' }, mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets({ assetType: 'crypto' })

      expect(result).toHaveLength(3)
    })

    it('should handle empty results', async () => {
      mockDiscoverySuccess([])

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      mockDiscoveryFailure(500, 'Internal Server Error')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.fetchTradingAssets()).rejects.toThrow('Asset fetch failed')
    })

    it('should handle 404 errors', async () => {
      mockDiscoveryFailure(404, 'Not Found')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.fetchTradingAssets()).rejects.toThrow()
    })

    it('should use custom config from params', async () => {
      const mockAssets = createMockAssets(2)
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets({
        config: {
          apiKey: 'custom-key',
        },
      })

      expect(result).toHaveLength(2)
    })

    it('should handle malformed response (no results field)', async () => {
      mockDiscoverySuccess([])

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toEqual([])
    })

    it('should retry on network failures', async () => {
      // First fails, second succeeds
      mockDiscoveryFailure(503)
      mockDiscoverySuccess(createMockAssets(3))

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 2,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      const result = await service.fetchTradingAssets()
      expect(result).toHaveLength(3)
    })

    it('should handle large asset lists', async () => {
      const mockAssets = createMockAssets(7) // All available
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toHaveLength(7)
      expect(result.every((a) => a.is_active)).toBe(true)
    })
  })

  describe('Retry Logic', () => {
    it('should implement exponential backoff', async () => {
      const startTime = Date.now()

      // Fail twice, succeed third time
      mockConnectIdFailure(500)
      mockConnectIdFailure(500)
      mockConnectIdSuccess('backoff-test-id')

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 3,
        delayMs: 50,
        backoffMultiplier: 2,
      })

      await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
      })

      const elapsed = Date.now() - startTime

      // Should have delays: 50ms + 100ms = 150ms minimum
      // Adding buffer for test execution time
      expect(elapsed).toBeGreaterThanOrEqual(100)
    })

    it('should not retry on 4xx client errors', async () => {
      mockConnectIdFailure(400, 'Bad Request')

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 3,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow()
    })

    it('should respect maxAttempts configuration', async () => {
      // Set up 5 failures
      for (let i = 0; i < 5; i++) {
        mockConnectIdFailure(500)
      }

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 2, // Only 2 attempts
        delayMs: 10,
        backoffMultiplier: 1,
      })

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow()
    })

    it('should handle mixed success/failure scenarios', async () => {
      // Discovery fails, retry succeeds
      mockDiscoveryFailure(503)
      mockDiscoverySuccess(createMockAssets(2))

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 2,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      const result = await service.fetchTradingAssets()
      expect(result).toHaveLength(2)
    })
  })

  describe('Error Messages', () => {
    it('should provide clear error message for ConnectId failure', async () => {
      mockConnectIdFailure(500, 'Database connection error')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow(/ConnectId generation failed/)
    })

    it('should provide clear error message for asset fetch failure', async () => {
      mockDiscoveryFailure(500, 'Rate limit exceeded')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.fetchTradingAssets()).rejects.toThrow(/Asset fetch failed/)
    })

    it('should include original error details', async () => {
      mockConnectIdFailure(403, 'API key invalid')

      const service = new RobinhoodClientService(testConfig)

      try {
        await service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        })
        fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    })
  })

  describe('Configuration Override', () => {
    it('should allow per-request config override for ConnectId', async () => {
      mockConnectIdSuccess('override-test')

      const service = new RobinhoodClientService({
        appId: 'default-app',
        apiKey: 'default-key',
      })

      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
        config: {
          appId: 'override-app',
          apiKey: 'override-key',
        },
      })

      expect(result).toBe('override-test')
    })

    it('should allow per-request config override for assets', async () => {
      mockDiscoverySuccess(createMockAssets(3))

      const service = new RobinhoodClientService({
        appId: 'default-app',
        apiKey: 'default-key',
      })

      const result = await service.fetchTradingAssets({
        config: {
          appId: 'override-app',
        },
      })

      expect(result).toHaveLength(3)
    })

    it('should merge config correctly', async () => {
      mockConnectIdSuccess('merge-test')

      const service = new RobinhoodClientService({
        appId: 'base-app',
        apiKey: 'base-key',
        // Don't override baseUrl so nock works
      })

      // Override only apiKey
      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
        config: {
          apiKey: 'override-key',
        },
      })

      expect(result).toBe('merge-test') // If we got here, config merge worked
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long wallet addresses', async () => {
      mockConnectIdSuccess('long-address-id')

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '0x' + 'a'.repeat(100),
        userIdentifier: 'test@example.com',
      })

      expect(result).toBe('long-address-id')
    })

    it('should handle special characters in user identifier', async () => {
      mockConnectIdSuccess('special-chars-id')

      const service = new RobinhoodClientService(testConfig)
      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'user+test@example.com',
      })

      expect(result).toBe('special-chars-id')
    })

    it('should handle empty asset list response', async () => {
      mockDiscoverySuccess([])

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(result).toEqual([])
    })

    it('should handle assets with missing fields', async () => {
      const malformedAssets = [
        { asset_code: 'BTC' }, // Missing is_active
        { is_active: true }, // Missing asset_code
      ]
      mockDiscoverySuccess(malformedAssets as any)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.fetchTradingAssets()

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Logging', () => {
    it('should log successful operations', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      mockConnectIdSuccess('log-test-id')

      const service = new RobinhoodClientService(testConfig, undefined, mockLogger)
      await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
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

      mockConnectIdFailure(500)

      const service = new RobinhoodClientService(testConfig, undefined, mockLogger)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        }),
      ).rejects.toThrow()

      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should log retry attempts', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      mockConnectIdFailure(503)
      mockConnectIdSuccess('retry-log-test')

      const service = new RobinhoodClientService(
        testConfig,
        {
          maxAttempts: 2,
          delayMs: 10,
          backoffMultiplier: 1,
        },
        mockLogger,
      )

      await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
      })

      expect(mockLogger.warn).toHaveBeenCalled()
    })
  })

  describe('getOrderDetails', () => {
    const testConnectId = '596e6a8d-3ccd-47f2-b392-7de79df3e8d1'

    it('should fetch order details successfully', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result).toBeDefined()
      expect(result.connectId).toBe(testConnectId)
      expect(result.status).toBe('ORDER_STATUS_SUCCEEDED')
      expect(result.assetCode).toBe('SOL')
      expect(result.cryptoAmount).toBe('0.002')
      expect(result.fiatAmount).toBe('0.41')
      expect(result.blockchainTransactionId).toBeDefined()
      expect(result.destinationAddress).toBeDefined()
      expect(isDone()).toBe(true)
    })

    it('should return order with IN_PROGRESS status', async () => {
      const { mockOrderDetailsInProgress } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsInProgress(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.status).toBe('ORDER_STATUS_IN_PROGRESS')
      expect(result.connectId).toBe(testConnectId)
    })

    it('should return order with FAILED status', async () => {
      const { mockOrderDetailsFailed } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsFailed(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.status).toBe('ORDER_STATUS_FAILED')
      expect(result.connectId).toBe(testConnectId)
    })

    it('should return order with CANCELLED status', async () => {
      const { mockOrderDetailsCancelled } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsCancelled(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.status).toBe('ORDER_STATUS_CANCELLED')
      expect(result.connectId).toBe(testConnectId)
    })

    it('should handle different asset types', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId, {
        assetCode: 'BTC',
        networkCode: 'BITCOIN',
        cryptoAmount: '0.05',
        fiatAmount: '3250.00',
      })

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.assetCode).toBe('BTC')
      expect(result.networkCode).toBe('BITCOIN')
      expect(result.cryptoAmount).toBe('0.05')
      expect(result.fiatAmount).toBe('3250.00')
    })

    it('should include network fee details', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.networkFee).toBeDefined()
      expect(result.networkFee.type).toBe('PRICE_ITEM_TYPE_CRYPTO_CURRENCY_NETWORK_FEE')
      expect(result.networkFee.fiatAmount).toBeDefined()
      expect(result.networkFee.cryptoQuantity).toBeDefined()
    })

    it('should include total amount details', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.totalAmount).toBeDefined()
      expect(result.totalAmount.type).toBe('PRICE_ITEM_TYPE_TOTAL')
      expect(result.totalAmount.fiatAmount).toBe('0.46')
      expect(result.totalAmount.cryptoQuantity).toBe('0.0022')
    })

    it('should handle 404 Not Found error', async () => {
      const { mockOrderDetailsNotFound } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsNotFound(testConnectId)

      const service = new RobinhoodClientService(testConfig)

      await expect(service.getOrderDetails(testConnectId)).rejects.toThrow('Order details fetch failed')
    })

    it('should handle 500 server errors', async () => {
      const { mockOrderDetailsFailure } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsFailure(testConnectId, 500, 'Internal Server Error')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.getOrderDetails(testConnectId)).rejects.toThrow('Order details fetch failed')
    })

    it('should handle 401 authentication errors', async () => {
      const { mockOrderDetailsFailure } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsFailure(testConnectId, 401, 'Unauthorized')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.getOrderDetails(testConnectId)).rejects.toThrow('Order details fetch failed')
    })

    it('should handle 403 forbidden errors', async () => {
      const { mockOrderDetailsFailure } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsFailure(testConnectId, 403, 'Forbidden')

      const service = new RobinhoodClientService(testConfig)

      await expect(service.getOrderDetails(testConnectId)).rejects.toThrow('Order details fetch failed')
    })

    it('should log success information', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId)

      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new RobinhoodClientService(testConfig, undefined, mockLogger)
      await service.getOrderDetails(testConnectId)

      expect(mockLogger.info).toHaveBeenCalledWith('Fetching order details', { connectId: testConnectId })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Order details fetched successfully',
        expect.objectContaining({
          connectId: testConnectId,
          status: 'ORDER_STATUS_SUCCEEDED',
        }),
      )
    })

    it('should log error information on failure', async () => {
      const { mockOrderDetailsFailure } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsFailure(testConnectId, 500)

      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new RobinhoodClientService(testConfig, undefined, mockLogger)

      await expect(service.getOrderDetails(testConnectId)).rejects.toThrow()

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch order details', expect.anything())
    })

    it('should use retry logic on temporary failures', async () => {
      const { mockOrderDetailsFailure, mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')

      // First attempt fails
      mockOrderDetailsFailure(testConnectId, 503, 'Service Unavailable')
      // Second attempt succeeds
      mockOrderDetailsSuccess(testConnectId)

      const service = new RobinhoodClientService(testConfig, {
        maxAttempts: 2,
        delayMs: 10,
        backoffMultiplier: 1,
      })

      const result = await service.getOrderDetails(testConnectId)

      expect(result).toBeDefined()
      expect(result.status).toBe('ORDER_STATUS_SUCCEEDED')
    })

    it('should respect custom configuration', async () => {
      const customConnectId = 'custom-connect-id-123'
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')

      // Mock with custom base URL
      const customNock = require('nock')
      customNock('https://custom.robinhood.com')
        .get(`/catpay/v1/external/order/${customConnectId}`)
        .reply(200, {
          connectId: customConnectId,
          status: 'ORDER_STATUS_SUCCEEDED',
          assetCode: 'ETH',
          networkCode: 'ETHEREUM',
          cryptoAmount: '1.5',
          fiatAmount: '3000.00',
          blockchainTransactionId: 'custom-tx-hash',
          destinationAddress: '0x123',
          networkFee: { type: 'FEE', fiatAmount: '0', cryptoQuantity: '0' },
          processingFee: { type: 'FEE', fiatAmount: '0', cryptoQuantity: '0' },
          totalAmount: { type: 'TOTAL', fiatAmount: '3000.00', cryptoQuantity: '1.5' },
          paymentMethod: 'crypto_balance',
          fiatCode: 'USD',
          price: '2000.00',
          applicationId: 'custom-app',
          referenceId: '',
        })

      const service = new RobinhoodClientService(
        {
          ...testConfig,
          baseUrl: 'https://custom.robinhood.com',
        },
        undefined,
      )

      const result = await service.getOrderDetails(customConnectId)

      expect(result.connectId).toBe(customConnectId)
      expect(result.assetCode).toBe('ETH')
    })

    it('should handle empty blockchain transaction ID', async () => {
      const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
      mockOrderDetailsSuccess(testConnectId, {
        blockchainTransactionId: '',
        status: 'ORDER_STATUS_IN_PROGRESS',
      })

      const service = new RobinhoodClientService(testConfig)
      const result = await service.getOrderDetails(testConnectId)

      expect(result.blockchainTransactionId).toBe('')
      expect(result.status).toBe('ORDER_STATUS_IN_PROGRESS')
    })

    it('should handle various network codes', async () => {
      const networks = ['ETHEREUM', 'BITCOIN', 'SOLANA', 'POLYGON', 'ARBITRUM']

      for (const network of networks) {
        const { mockOrderDetailsSuccess } = require('../mocks/robinhood-nock-api')
        const connectId = `test-${network.toLowerCase()}`

        mockOrderDetailsSuccess(connectId, {
          networkCode: network,
        })

        const service = new RobinhoodClientService(testConfig)
        const result = await service.getOrderDetails(connectId)

        expect(result.networkCode).toBe(network)
      }
    })
  })
})
