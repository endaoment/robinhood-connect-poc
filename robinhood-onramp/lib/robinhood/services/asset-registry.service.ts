import { ServiceLogger, createConsoleLogger } from './types'
import { RobinhoodAssetConfig } from '../types'
import {
  fetchRobinhoodAssets,
  type DiscoveredAsset,
} from '../assets/discovery'
import { fetchPrimeWalletAddresses, getPrimeAddress } from '../assets/prime-addresses'
import { buildDynamicRegistry } from '../assets/registry-builder'

/**
 * Parameters for initializing the asset registry
 */
export interface InitializeRegistryParams {
  /**
   * Force refresh even if cached
   */
  forceRefresh?: boolean

  /**
   * Include Prime wallet addresses
   */
  includePrimeAddresses?: boolean
}

/**
 * Parameters for asset lookup
 */
export interface GetAssetParams {
  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   */
  symbol: string

  /**
   * Network name (e.g., 'BITCOIN', 'ETHEREUM')
   */
  network: string
}

/**
 * Service for managing Robinhood asset registry
 *
 * Handles:
 * - Asset discovery and caching
 * - Prime wallet address mapping
 * - Asset metadata management
 * - Registry health checks
 *
 * Implements singleton pattern for registry caching
 *
 * @example
 * ```typescript
 * const registry = AssetRegistryService.getInstance();
 * await registry.initialize({ includePrimeAddresses: true });
 *
 * const btc = registry.getAsset({
 *   symbol: 'BTC',
 *   network: 'BITCOIN',
 * });
 * ```
 */
export class AssetRegistryService {
  private static instance: AssetRegistryService | null = null
  private readonly logger: ServiceLogger
  private initialized: boolean = false
  private assetCache: Map<string, RobinhoodAssetConfig> = new Map()
  private discoveredAssets: DiscoveredAsset[] = []
  private primeAddressCount: number = 0

  private constructor(logger?: ServiceLogger) {
    this.logger = logger || createConsoleLogger('AssetRegistryService')
  }

  /**
   * Get singleton instance of AssetRegistryService
   */
  static getInstance(logger?: ServiceLogger): AssetRegistryService {
    if (!AssetRegistryService.instance) {
      AssetRegistryService.instance = new AssetRegistryService(logger)
    }
    return AssetRegistryService.instance
  }

  /**
   * Initialize the asset registry
   *
   * Fetches assets from Discovery API and Prime addresses
   *
   * @param params - Initialization parameters
   * @throws {Error} If initialization fails
   */
  async initialize(params: InitializeRegistryParams = {}): Promise<void> {
    const { forceRefresh = false, includePrimeAddresses = true } = params

    // Skip if already initialized and not forcing refresh
    if (this.initialized && !forceRefresh) {
      this.logger.info('Registry already initialized, skipping')
      return
    }

    try {
      this.logger.info('Initializing asset registry', {
        forceRefresh,
        includePrimeAddresses,
      })

      // Step 1: Fetch discovered assets from Robinhood Discovery API
      this.logger.info('Fetching assets from Robinhood Discovery API...')
      this.discoveredAssets = await fetchRobinhoodAssets()

      if (this.discoveredAssets.length === 0) {
        throw new Error('No assets discovered from Robinhood API')
      }

      this.logger.info(
        `Discovered ${this.discoveredAssets.length} assets from Robinhood`
      )

      // Step 2: Fetch Prime wallet addresses if requested
      if (includePrimeAddresses) {
        // Only run on server
        if (typeof window === 'undefined') {
          this.logger.info('Fetching Prime wallet addresses...')
          await fetchPrimeWalletAddresses()
          this.logger.info('Prime addresses fetched successfully')
        } else {
          this.logger.warn(
            'Prime address fetching skipped (client-side not supported)'
          )
        }
      }

      // Step 3: Build asset registry
      this.logger.info('Building asset registry...')
      const registry = buildDynamicRegistry(this.discoveredAssets)

      // Step 4: Cache assets with efficient lookup
      this.cacheAssets(registry)

      // Count assets with Prime addresses
      this.primeAddressCount = Object.values(registry).filter(
        (asset) =>
          asset.depositAddress?.address &&
          (asset.depositAddress.walletType === 'Trading' ||
            asset.depositAddress.walletType === 'Trading Balance')
      ).length

      this.initialized = true
      this.logger.info('Asset registry initialized successfully', {
        totalAssets: this.assetCache.size,
        primeAddresses: this.primeAddressCount,
      })
    } catch (error) {
      this.logger.error('Failed to initialize asset registry', error)
      throw new Error(
        `Asset registry initialization failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get asset by symbol and network
   *
   * @param params - Asset lookup parameters
   * @returns Asset metadata or null if not found
   */
  getAsset(params: GetAssetParams): RobinhoodAssetConfig | null {
    const { symbol, network } = params

    if (!this.initialized) {
      this.logger.warn('Registry not initialized, call initialize() first')
      return null
    }

    // Create composite key for fast lookup
    const key = this.createAssetKey(symbol, network)
    const asset = this.assetCache.get(key)

    if (!asset) {
      this.logger.debug('Asset not found', { symbol, network })
      return null
    }

    return asset
  }

  /**
   * Get all assets in registry
   *
   * @returns Array of all cached assets
   */
  getAllAssets(): RobinhoodAssetConfig[] {
    if (!this.initialized) {
      this.logger.warn('Registry not initialized, returning empty array')
      return []
    }

    // Return sorted by sortOrder (all assets have this property)
    return Array.from(this.assetCache.values()).sort(
      (a, b) => (a as any).sortOrder - (b as any).sortOrder
    )
  }

  /**
   * Check if registry is initialized and healthy
   *
   * @returns Object with health status
   */
  getHealthStatus(): {
    initialized: boolean
    assetCount: number
    primeAddressCount: number
    discoveredCount: number
  } {
    return {
      initialized: this.initialized,
      assetCount: this.assetCache.size,
      primeAddressCount: this.primeAddressCount,
      discoveredCount: this.discoveredAssets.length,
    }
  }

  /**
   * Cache assets for fast lookup
   *
   * Creates composite keys (symbol:network) for O(1) lookups
   *
   * @private
   */
  private cacheAssets(registry: Record<string, RobinhoodAssetConfig>): void {
    this.assetCache.clear()

    for (const [symbol, asset] of Object.entries(registry)) {
      // All assets have network property (from base asset type)
      const key = this.createAssetKey(symbol, (asset as any).network)
      this.assetCache.set(key, asset)
    }

    this.logger.info(`Cached ${this.assetCache.size} assets for fast lookup`)
  }

  /**
   * Create composite key for asset lookup
   *
   * @private
   */
  private createAssetKey(symbol: string, network: string): string {
    return `${symbol.toUpperCase()}:${network.toUpperCase()}`
  }

  /**
   * Reset singleton instance (for testing)
   *
   * @private
   */
  static resetInstance(): void {
    AssetRegistryService.instance = null
  }
}

