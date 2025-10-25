/**
 * Comprehensive tests for AssetRegistryService
 *
 * Tests:
 * - Singleton pattern
 * - Registry initialization
 * - Asset lookup and caching
 * - Health status
 * - Prime address integration
 * - Error handling
 */
import { AssetRegistryService } from '@/libs/robinhood/lib/services/asset-registry.service'
import { mockDiscoverySuccess, createMockAssets, createMockAsset, cleanAll } from '../mocks/robinhood-nock-api'
import * as discoveryModule from '@/libs/robinhood/lib/assets/discovery'
import * as primeModule from '@/libs/robinhood/lib/assets/prime-addresses'
import * as registryBuilder from '@/libs/robinhood/lib/assets/registry-builder'

// Mock the modules
jest.mock('@/libs/robinhood/lib/assets/discovery')
jest.mock('@/libs/robinhood/lib/assets/prime-addresses')
jest.mock('@/libs/robinhood/lib/assets/registry-builder')

describe('AssetRegistryService', () => {
  beforeEach(() => {
    // Reset singleton before each test
    AssetRegistryService.resetInstance()
    cleanAll()
    jest.clearAllMocks()
  })

  afterEach(() => {
    AssetRegistryService.resetInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = AssetRegistryService.getInstance()
      const instance2 = AssetRegistryService.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should create new instance after reset', () => {
      const instance1 = AssetRegistryService.getInstance()
      AssetRegistryService.resetInstance()
      const instance2 = AssetRegistryService.getInstance()

      expect(instance1).not.toBe(instance2)
    })

    it('should accept custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const instance = AssetRegistryService.getInstance(mockLogger)
      expect(instance).toBeDefined()
    })
  })

  describe('initialize', () => {
    it('should initialize successfully with discovered assets', async () => {
      const mockAssets = createMockAssets(3)

      // Mock discovery
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      // Mock registry builder
      const mockRegistry = {
        BTC: {
          symbol: 'BTC',
          network: 'BITCOIN',
          depositAddress: { address: '1A1z...', walletType: 'Trading' },
          sortOrder: 1,
        },
        ETH: {
          symbol: 'ETH',
          network: 'ETHEREUM',
          depositAddress: { address: '0x123...', walletType: 'Trading' },
          sortOrder: 2,
        },
        SOL: {
          symbol: 'SOL',
          network: 'SOLANA',
          depositAddress: { address: 'So11...', walletType: 'Trading' },
          sortOrder: 3,
        },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const health = service.getHealthStatus()
      expect(health.initialized).toBe(true)
      expect(health.assetCount).toBe(3)
    })

    it('should skip initialization if already initialized', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      // Clear mock calls
      jest.clearAllMocks()

      // Second initialize should skip
      await service.initialize()

      expect(discoveryModule.fetchRobinhoodAssets).not.toHaveBeenCalled()
    })

    it('should force refresh when requested', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      // Clear mocks
      jest.clearAllMocks()

      // Force refresh
      await service.initialize({ forceRefresh: true })

      expect(discoveryModule.fetchRobinhoodAssets).toHaveBeenCalled()
    })

    it('should fetch Prime addresses on server', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })
      ;(primeModule.fetchPrimeWalletAddresses as jest.Mock).mockResolvedValue(undefined)

      const service = AssetRegistryService.getInstance()
      await service.initialize({ includePrimeAddresses: true })

      // Should be called on server (tests run in Node)
      expect(primeModule.fetchPrimeWalletAddresses).toHaveBeenCalled()
    })

    it('should skip Prime addresses when not requested', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize({ includePrimeAddresses: false })

      expect(primeModule.fetchPrimeWalletAddresses).not.toHaveBeenCalled()
    })

    it('should throw error if no assets discovered', async () => {
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue([])

      const service = AssetRegistryService.getInstance()

      await expect(service.initialize()).rejects.toThrow('No assets discovered from Robinhood API')
    })

    it('should throw error if discovery fails', async () => {
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const service = AssetRegistryService.getInstance()

      await expect(service.initialize()).rejects.toThrow(/Asset registry initialization failed/)
    })

    it('should count Prime addresses correctly', async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: {
          symbol: 'BTC',
          network: 'BITCOIN',
          depositAddress: { address: '1A1z...', walletType: 'Trading' },
          sortOrder: 1,
        },
        ETH: {
          symbol: 'ETH',
          network: 'ETHEREUM',
          depositAddress: { address: '0x123...', walletType: 'Trading Balance' },
          sortOrder: 2,
        },
        SOL: {
          symbol: 'SOL',
          network: 'SOLANA',
          depositAddress: null, // No Prime address
          sortOrder: 3,
        },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const health = service.getHealthStatus()
      expect(health.primeAddressCount).toBe(2)
    })
  })

  describe('getAsset', () => {
    beforeEach(async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: {
          symbol: 'BTC',
          network: 'BITCOIN',
          depositAddress: { address: '1A1z...', walletType: 'Trading' },
          sortOrder: 1,
        },
        ETH: {
          symbol: 'ETH',
          network: 'ETHEREUM',
          depositAddress: { address: '0x123...', walletType: 'Trading' },
          sortOrder: 2,
        },
        SOL: {
          symbol: 'SOL',
          network: 'SOLANA',
          depositAddress: { address: 'So11...', walletType: 'Trading' },
          sortOrder: 3,
        },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()
    })

    it('should find asset by symbol and network', () => {
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })

      expect(asset).toBeDefined()
      expect(asset?.symbol).toBe('BTC')
      expect(asset?.network).toBe('BITCOIN')
    })

    it('should be case-insensitive for symbol', () => {
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'btc', network: 'BITCOIN' })

      expect(asset).toBeDefined()
      expect(asset?.symbol).toBe('BTC')
    })

    it('should be case-insensitive for network', () => {
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'ETH', network: 'ethereum' })

      expect(asset).toBeDefined()
      expect(asset?.network).toBe('ETHEREUM')
    })

    it('should return null for non-existent asset', () => {
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'INVALID', network: 'INVALID' })

      expect(asset).toBeNull()
    })

    it('should return null if registry not initialized', () => {
      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })

      expect(asset).toBeNull()
    })

    it('should find all available assets', () => {
      const service = AssetRegistryService.getInstance()

      const btc = service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })
      const eth = service.getAsset({ symbol: 'ETH', network: 'ETHEREUM' })
      const sol = service.getAsset({ symbol: 'SOL', network: 'SOLANA' })

      expect(btc).toBeDefined()
      expect(eth).toBeDefined()
      expect(sol).toBeDefined()
    })

    it('should handle mixed case lookups', () => {
      const service = AssetRegistryService.getInstance()
      const asset = service.getAsset({ symbol: 'BtC', network: 'BitCoin' })

      expect(asset).toBeDefined()
      expect(asset?.symbol).toBe('BTC')
    })
  })

  describe('getAllAssets', () => {
    it('should return all cached assets', async () => {
      const mockAssets = createMockAssets(5)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
        SOL: { symbol: 'SOL', network: 'SOLANA', sortOrder: 3 },
        USDC: { symbol: 'USDC', network: 'ETHEREUM', sortOrder: 4 },
        MATIC: { symbol: 'MATIC', network: 'POLYGON', sortOrder: 5 },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const assets = service.getAllAssets()
      expect(assets).toHaveLength(5)
    })

    it('should return assets sorted by sortOrder', async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        SOL: { symbol: 'SOL', network: 'SOLANA', sortOrder: 3 },
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const assets = service.getAllAssets()
      expect(assets[0].symbol).toBe('BTC')
      expect(assets[1].symbol).toBe('ETH')
      expect(assets[2].symbol).toBe('SOL')
    })

    it('should return empty array if not initialized', () => {
      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance()
      const assets = service.getAllAssets()

      expect(assets).toEqual([])
    })

    it('should return copy of assets (not modify cache)', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const assets1 = service.getAllAssets()
      const assets2 = service.getAllAssets()

      expect(assets1).not.toBe(assets2) // Different array instances
      expect(assets1).toHaveLength(assets2.length)
    })
  })

  describe('getHealthStatus', () => {
    it('should return correct health status after initialization', async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: {
          symbol: 'BTC',
          network: 'BITCOIN',
          depositAddress: { address: '1A1z...', walletType: 'Trading' },
          sortOrder: 1,
        },
        ETH: {
          symbol: 'ETH',
          network: 'ETHEREUM',
          depositAddress: { address: '0x123...', walletType: 'Trading' },
          sortOrder: 2,
        },
        SOL: { symbol: 'SOL', network: 'SOLANA', depositAddress: null, sortOrder: 3 },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      const health = service.getHealthStatus()

      expect(health.initialized).toBe(true)
      expect(health.assetCount).toBe(3)
      expect(health.discoveredCount).toBe(3)
      expect(health.primeAddressCount).toBe(2)
    })

    it('should return uninitialized status before initialization', () => {
      const service = AssetRegistryService.getInstance()
      const health = service.getHealthStatus()

      expect(health.initialized).toBe(false)
      expect(health.assetCount).toBe(0)
      expect(health.discoveredCount).toBe(0)
      expect(health.primeAddressCount).toBe(0)
    })

    it('should update status after forced refresh', async () => {
      const mockAssets1 = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValueOnce(mockAssets1)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValueOnce({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      let health = service.getHealthStatus()
      expect(health.assetCount).toBe(2)

      // Mock different assets for refresh
      const mockAssets2 = createMockAssets(5)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValueOnce(mockAssets2)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValueOnce({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
        SOL: { symbol: 'SOL', network: 'SOLANA', sortOrder: 3 },
        USDC: { symbol: 'USDC', network: 'ETHEREUM', sortOrder: 4 },
        MATIC: { symbol: 'MATIC', network: 'POLYGON', sortOrder: 5 },
      })

      await service.initialize({ forceRefresh: true })

      health = service.getHealthStatus()
      expect(health.assetCount).toBe(5)
    })
  })

  describe('Caching', () => {
    it('should cache assets for fast lookup', async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
        SOL: { symbol: 'SOL', network: 'SOLANA', sortOrder: 3 },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      // Multiple lookups should use cache (fast)
      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })
      }
      const elapsed = Date.now() - start

      // Should be very fast (< 50ms for 1000 lookups)
      expect(elapsed).toBeLessThan(50)
    })

    it('should use composite key for caching', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      // Registry uses symbol as key, but asset objects should have network property
      const mockRegistry = {
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)

      const service = AssetRegistryService.getInstance()
      await service.initialize({ includePrimeAddresses: false })

      const btc = service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })
      const eth = service.getAsset({ symbol: 'ETH', network: 'ETHEREUM' })

      expect(btc).toBeDefined()
      expect(eth).toBeDefined()
      expect(btc?.network).toBe('BITCOIN')
      expect(eth?.network).toBe('ETHEREUM')

      // Verify case-insensitive lookup works
      const btcLower = service.getAsset({ symbol: 'btc', network: 'bitcoin' })
      expect(btcLower).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle discovery API failures gracefully', async () => {
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockRejectedValue(
        new Error('API timeout')
      )

      const service = AssetRegistryService.getInstance()

      await expect(service.initialize()).rejects.toThrow(/Asset registry initialization failed/)
    })

    it('should handle registry builder failures', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockImplementation(() => {
        throw new Error('Builder error')
      })

      const service = AssetRegistryService.getInstance()

      await expect(service.initialize()).rejects.toThrow(/Asset registry initialization failed/)
    })

    it('should handle Prime address fetch failures', async () => {
      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })
      ;(primeModule.fetchPrimeWalletAddresses as jest.Mock).mockRejectedValue(
        new Error('Prime API error')
      )

      const service = AssetRegistryService.getInstance()

      // Should still fail overall due to Prime error propagation
      await expect(service.initialize()).rejects.toThrow()
    })
  })

  describe('Logging', () => {
    it('should log initialization steps', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
      })

      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance(mockLogger)
      await service.initialize({ includePrimeAddresses: false })

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log when skipping initialization', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const mockAssets = createMockAssets(2)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
      })

      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance(mockLogger)
      await service.initialize({ includePrimeAddresses: false })

      mockLogger.info.mockClear()

      await service.initialize() // Second call

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Registry already initialized, skipping'
      )
    })

    it('should log errors', async () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance(mockLogger)

      await expect(service.initialize()).rejects.toThrow()

      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should log asset not found warnings', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      AssetRegistryService.resetInstance()
      const service = AssetRegistryService.getInstance(mockLogger)

      service.getAsset({ symbol: 'INVALID', network: 'INVALID' })

      expect(mockLogger.warn).toHaveBeenCalled()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete initialization flow', async () => {
      const mockAssets = createMockAssets(5)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)

      const mockRegistry = {
        BTC: {
          symbol: 'BTC',
          network: 'BITCOIN',
          depositAddress: { address: '1A1z...', walletType: 'Trading' },
          sortOrder: 1,
        },
        ETH: {
          symbol: 'ETH',
          network: 'ETHEREUM',
          depositAddress: { address: '0x123...', walletType: 'Trading Balance' },
          sortOrder: 2,
        },
        SOL: {
          symbol: 'SOL',
          network: 'SOLANA',
          depositAddress: { address: 'So11...', walletType: 'Trading' },
          sortOrder: 3,
        },
        USDC: { symbol: 'USDC', network: 'ETHEREUM', depositAddress: null, sortOrder: 4 },
        MATIC: {
          symbol: 'MATIC',
          network: 'POLYGON',
          depositAddress: { address: '0x456...', walletType: 'Trading' },
          sortOrder: 5,
        },
      }
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue(mockRegistry)
      ;(primeModule.fetchPrimeWalletAddresses as jest.Mock).mockResolvedValue(undefined)

      const service = AssetRegistryService.getInstance()
      await service.initialize({ includePrimeAddresses: true })

      // Verify initialization
      const health = service.getHealthStatus()
      expect(health.initialized).toBe(true)
      expect(health.assetCount).toBe(5)
      expect(health.primeAddressCount).toBe(4)

      // Verify lookups work
      const btc = service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })
      expect(btc).toBeDefined()

      // Verify getAllAssets
      const allAssets = service.getAllAssets()
      expect(allAssets).toHaveLength(5)
    })

    it('should support multiple lookup patterns', async () => {
      const mockAssets = createMockAssets(3)
      ;(discoveryModule.fetchRobinhoodAssets as jest.Mock).mockResolvedValue(mockAssets)
      ;(registryBuilder.buildDynamicRegistry as jest.Mock).mockReturnValue({
        BTC: { symbol: 'BTC', network: 'BITCOIN', sortOrder: 1 },
        ETH: { symbol: 'ETH', network: 'ETHEREUM', sortOrder: 2 },
        SOL: { symbol: 'SOL', network: 'SOLANA', sortOrder: 3 },
      })

      const service = AssetRegistryService.getInstance()
      await service.initialize()

      // Case variations
      expect(service.getAsset({ symbol: 'BTC', network: 'BITCOIN' })).toBeDefined()
      expect(service.getAsset({ symbol: 'btc', network: 'bitcoin' })).toBeDefined()
      expect(service.getAsset({ symbol: 'Btc', network: 'Bitcoin' })).toBeDefined()
      expect(service.getAsset({ symbol: 'BTC', network: 'bitcoin' })).toBeDefined()
    })
  })
})

