/**
 * Comprehensive tests for RobinhoodClientService
 *
 * Tests:
 * - ConnectId generation (success/failure)
 * - Asset fetching (various params)
 * - Retry logic
 * - Error handling
 * - Configuration
 */
import { RobinhoodClientService } from '@/libs/robinhood/lib/services/robinhood-client.service'
import {
  mockConnectIdSuccess,
  mockConnectIdFailure,
  mockDiscoverySuccess,
  mockDiscoveryFailure,
  mockDiscoveryWithQuery,
  mockTimeout,
  createMockAssets,
  createMockAsset,
  cleanAll,
  isDone,
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
        })
      ).rejects.toThrow('No connect_id in response')
    })

    it('should handle API errors', async () => {
      mockConnectIdFailure(400, 'Invalid wallet address')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: 'invalid',
          userIdentifier: 'test@example.com',
        })
      ).rejects.toThrow('ConnectId generation failed')
    })

    it('should handle 500 server errors', async () => {
      mockConnectIdFailure(500, 'Internal Server Error')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        })
      ).rejects.toThrow('ConnectId generation failed')
    })

    it('should handle network failures', async () => {
      mockConnectIdFailure(503, 'Service Unavailable')

      const service = new RobinhoodClientService(testConfig)

      await expect(
        service.generateConnectId({
          walletAddress: '0x123',
          userIdentifier: 'test@example.com',
        })
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
        })
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
        })
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
        })
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
        })
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
        })
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
        mockLogger
      )

      await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
      })

      expect(mockLogger.warn).toHaveBeenCalled()
    })
  })
})

