import type { RobinhoodAssetConfig } from '../types'
import { fetchRobinhoodAssets, normalizeNetworkName, type DiscoveredAsset } from './discovery'
import { EVM_ASSETS } from './evm-assets'
import { NON_EVM_ASSETS } from './non-evm-assets'
import { fetchPrimeWalletAddresses, getPrimeAddress, PrimeWalletType } from './prime-addresses'

/**
 * Fallback EOA for EVM tokens without CBP or OTC addresses
 * All EVM tokens can receive transfers to this address
 */
const EVM_FALLBACK_EOA = '0x9D5025B327E6B863E5050141C987d988c07fd8B2'

/**
 * Asset Registry Builder
 *
 * Builds the complete asset registry from:
 * 1. Static metadata (from evm-assets.ts and non-evm-assets.ts)
 * 2. Dynamic addresses from Robinhood Discovery API + Coinbase Prime API (server-side only)
 *
 * Client-side: Must fetch from /api/robinhood/assets endpoint.
 * Server-side: initializeAssetRegistry() fetches from APIs during startup.
 */

// Use globalThis to persist across Next.js module boundaries
// This ensures instrumentation.ts and API routes share the same registry
const getGlobalRegistry = () => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.__ROBINHOOD_ASSET_REGISTRY__) {
      globalThis.__ROBINHOOD_ASSET_REGISTRY__ = {
        registry: null,
        mode: null,
      }
    }
    return globalThis.__ROBINHOOD_ASSET_REGISTRY__
  }
  // Fallback for non-global environments
  return { registry: null, mode: null }
}

// Accessor functions for the global registry
const getRegistryCache = () => getGlobalRegistry().registry
const setRegistryCache = (registry: Record<string, RobinhoodAssetConfig> | null) => {
  getGlobalRegistry().registry = registry
}
const getRegistryMode = () => getGlobalRegistry().mode
const setRegistryMode = (mode: 'DYNAMIC' | 'STATIC' | null) => {
  getGlobalRegistry().mode = mode
}

// TypeScript declaration for global
declare global {
  var __ROBINHOOD_ASSET_REGISTRY__: {
    registry: Record<string, RobinhoodAssetConfig> | null
    mode: 'DYNAMIC' | 'STATIC' | null
  }
}

/**
 * REMOVED: buildOtcRegistry() and buildStaticRegistry()
 *
 * The static registry has been removed. The app now ONLY uses the dynamic registry
 * built from Robinhood Discovery API + Coinbase Prime API on the server.
 *
 * Clients must fetch assets from /api/robinhood/assets endpoint.
 */

/**
 * Build dynamic registry from Robinhood Discovery + Prime addresses
 * Shows ALL Robinhood assets, even those without Prime addresses
 */
function buildDynamicRegistry(discoveredAssets: DiscoveredAsset[]): Record<string, RobinhoodAssetConfig> {
  const registry: Record<string, RobinhoodAssetConfig> = {}

  for (const discovered of discoveredAssets) {
    const symbol = discovered.symbol

    // Get static metadata
    const metadata = EVM_ASSETS[symbol] || NON_EVM_ASSETS[symbol]

    if (!metadata) {
      console.warn(`[Asset Registry] No metadata for ${symbol} - creating minimal config`)
      // Create minimal config for assets we don't have metadata for
      const normalizedNetwork = normalizeNetworkName(discovered.networks[0] || 'UNKNOWN')

      // For unknown assets, check if network suggests EVM
      const evmNetworks = [
        'ETHEREUM',
        'POLYGON',
        'ARBITRUM',
        'OPTIMISM',
        'BASE',
        'ZORA',
        'AVALANCHE',
        'ETHEREUM_CLASSIC',
      ]
      const isLikelyEvmToken = evmNetworks.includes(normalizedNetwork)

      registry[symbol] = {
        symbol,
        name: discovered.name,
        description: `${discovered.name} (auto-discovered)`,
        network: normalizedNetwork,
        category: 'other',
        decimals: 18, // Default - should be verified
        popularity: 1,
        sortOrder: 999,
        enabled: true, // Include in UI even without metadata
        icon: 'crypto.svg', // Default icon
        logoUrl: `https://assets.coingecko.com/coins/images/1/small/${symbol.toLowerCase()}.png`,
        featured: false,
        type: 'EvmToken', // Assume EVM unless known otherwise
        depositAddress: isLikelyEvmToken
          ? {
              address: EVM_FALLBACK_EOA,
              walletType: PrimeWalletType.OTC,
              note: 'OTC List - EVM fallback EOA (no metadata)',
            }
          : { address: '', note: 'No metadata or address' },
      } as any
      continue
    }

    // Get Prime deposit address (with wallet type)
    const depositAddress = getPrimeAddress(symbol)

    // CRITICAL: Validate network compatibility
    // Normalize Robinhood network names (e.g., SUI_NETWORK → SUI)
    const ourNetwork = metadata.network
    const normalizedRobinhoodNetworks = discovered.networks.map(normalizeNetworkName)

    if (normalizedRobinhoodNetworks.length > 0 && !normalizedRobinhoodNetworks.includes(ourNetwork)) {
      // Network mismatch - For EVM tokens, use fallback EOA
      const isEvmToken = 'chainId' in metadata

      if (isEvmToken) {
        console.log(
          `[Asset Registry] ${symbol}: Network mismatch but using EVM fallback EOA - ` +
            `our address is ${ourNetwork}, Robinhood supports ${normalizedRobinhoodNetworks.join(', ')}`,
        )
        registry[symbol] = {
          ...metadata,
          depositAddress: {
            address: EVM_FALLBACK_EOA,
            walletType: PrimeWalletType.OTC,
            note: 'OTC List - EVM fallback EOA (network mismatch)',
          },
        }
        continue
      }

      // Non-EVM network mismatch - cannot use fallback
      console.warn(
        `[Asset Registry] ${symbol}: Network mismatch (non-EVM) - ` +
          `our address is ${ourNetwork}, Robinhood supports ${normalizedRobinhoodNetworks.join(', ')}`,
      )
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'Network mismatch (non-EVM)' },
      }
      continue
    }

    if (!depositAddress || !depositAddress.address) {
      // For EVM tokens, use fallback EOA (all EVM tokens can use common address)
      const isEvmToken = 'chainId' in metadata

      if (isEvmToken) {
        console.log(`[Asset Registry] ${symbol}: Using EVM fallback EOA (no CBP/OTC address found)`)
        registry[symbol] = {
          ...metadata,
          depositAddress: {
            address: EVM_FALLBACK_EOA,
            walletType: PrimeWalletType.OTC,
            note: 'OTC List - EVM fallback EOA',
          },
        }
        continue
      }

      // For non-EVM tokens, cannot use fallback (each needs specific address)
      console.warn(`[Asset Registry] No Prime/OTC address for ${symbol} (non-EVM) - including without address`)
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'No CBP/OTC address' },
      }
      continue
    }

    // Log multi-network assets for visibility
    if (normalizedRobinhoodNetworks.length > 1) {
      console.log(
        `[Asset Registry] ${symbol} multi-network: ${normalizedRobinhoodNetworks.join(', ')} ` +
          `(using ${ourNetwork} address)`,
      )
    }

    // Build complete config
    registry[symbol] = {
      ...metadata,
      depositAddress, // Has walletType from CBP
    }

    // Debug: Log wallet type for first few assets
    if (Object.keys(registry).length <= 3) {
      console.log(`[Asset Registry] ${symbol} depositAddress walletType:`, depositAddress.walletType)
    }
  }

  console.log(`[Asset Registry] Built ${Object.keys(registry).length} assets`)
  return registry
}

/**
 * Initialize asset registry (async - SERVER-SIDE ONLY)
 * Can fetch from APIs or use static fallback
 * Call this once at app startup for dynamic loading
 */
export async function initializeAssetRegistry(options?: {
  useDynamic?: boolean
  serverSide?: boolean
  backendUrl?: string
}): Promise<void> {
  // Only run on server
  if (typeof window !== 'undefined') {
    console.warn('[Asset Registry] initializeAssetRegistry is server-side only')
    return
  }

  console.log('[Asset Registry] Initializing (server-side)...')

  const useDynamic = options?.useDynamic ?? false

  if (useDynamic) {
    try {
      console.log('[Asset Registry] Using DYNAMIC mode - fetching from APIs...')

      // Step 0: Load OTC addresses from backend (fallback for non-CBP assets)
      try {
        const { loadOtcAddressesFromBackend } = await import('./otc-loader')
        await loadOtcAddressesFromBackend()
      } catch (error) {
        console.warn('[Asset Registry] Failed to load OTC addresses from backend:', error)
        console.warn('[Asset Registry] Will use hardcoded OTC fallback')
      }

      // Step 1: Fetch supported assets from Robinhood
      const discoveredAssets = await fetchRobinhoodAssets()

      if (discoveredAssets.length === 0) {
        console.warn('[Asset Registry] No assets discovered - falling back to OTC list')
        setRegistryCache(buildOtcRegistry())
        setRegistryMode('STATIC')
        return
      }

      // Step 2: Fetch Prime wallet addresses (with priority: Trading > Trading Balance)
      await fetchPrimeWalletAddresses()

      // Step 3: Build dynamic registry
      const dynamicRegistry = buildDynamicRegistry(discoveredAssets)
      setRegistryCache(dynamicRegistry)
      setRegistryMode('DYNAMIC') // Mark as dynamic mode

      console.log(`[Asset Registry] Initialized with ${Object.keys(dynamicRegistry).length} assets (DYNAMIC)`)
    } catch (error) {
      console.error('[Asset Registry] Dynamic initialization failed:', error)
      console.warn('[Asset Registry] Falling back to OTC list registry')
      setRegistryCache(buildOtcRegistry())
      setRegistryMode('STATIC')
    }
  } else {
    console.log('[Asset Registry] Using OTC LIST mode (static addresses)')
    setRegistryCache(buildOtcRegistry())
    setRegistryMode('STATIC')
  }

  // Sync with backend if URL provided
  if (options?.backendUrl) {
    await syncBackendTokenMap(options.backendUrl)
  }
}

/**
 * Get asset registry (synchronous)
 * Server-only: Returns initialized registry or throws
 * Client-side: Should fetch from /api/robinhood/assets instead
 */
export function getAssetRegistry(): Record<string, RobinhoodAssetConfig> {
  const cachedRegistry = getRegistryCache()

  if (!cachedRegistry) {
    // Server-side: Should be initialized in instrumentation.ts
    if (typeof window === 'undefined') {
      throw new Error('[Asset Registry] Not initialized! Call initializeAssetRegistry() in instrumentation.ts first.')
    }

    // Client-side: Return empty registry - client should fetch from API
    console.warn(
      '[Asset Registry] Client-side detected - returning empty registry. Use /api/robinhood/assets endpoint instead.',
    )
    return {}
  }

  return cachedRegistry
}

/**
 * Get asset config by symbol
 */
export function getAssetConfig(symbol: string): RobinhoodAssetConfig | undefined {
  const registry = getAssetRegistry()
  return registry[symbol]
}

/**
 * Get all assets with deposit addresses (ready to use)
 * NOTE: This function is deprecated for client-side use.
 * Clients should fetch from /api/robinhood/assets and use that data.
 * This is kept for server-side use only.
 */
export function getEnabledAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()

  // Return empty if client-side
  if (typeof window !== 'undefined') {
    console.warn('[getEnabledAssets] Client-side detected - use /api/robinhood/assets endpoint instead')
    return []
  }

  const allAssets = Object.values(registry)

  const enabled = allAssets
    .filter((asset) => {
      // Must have a deposit address
      if (!asset.depositAddress?.address) return false

      // Include all assets with addresses (Prime, OTC, and fallback)
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

  console.log('[getEnabledAssets] Final enabled count:', enabled.length)
  console.log(
    '[getEnabledAssets] Enabled assets:',
    enabled.map((a) => `${a.symbol} (${a.depositAddress.walletType || 'unknown'})`),
  )
  return enabled
}

/**
 * Get featured assets
 * Only returns truly usable assets (excludes network mismatches)
 */
export function getFeaturedAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()
  return Object.values(registry)
    .filter((asset) => {
      // Must be featured and have a deposit address
      if (!asset.featured || !asset.depositAddress?.address) return false

      // Include all wallet types (Prime, OTC, and fallback)
      return true
    })
    .sort((a, b) => b.popularity - a.popularity)
}

/**
 * Check if registry is ready
 */
export function isRegistryReady(): boolean {
  return getRegistryCache() !== null
}

/**
 * Validate registry completeness
 */
export function validateAssetRegistry(): {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    total: number
    enabledAssets: number
    withAddresses: number
    missingAddresses: number
  }
} {
  const errors: string[] = []
  const warnings: string[] = []
  const registry = getAssetRegistry()

  let missingAddresses = 0
  let withAddresses = 0

  for (const [symbol, asset] of Object.entries(registry)) {
    if (!asset.depositAddress?.address) {
      missingAddresses++
    } else {
      withAddresses++
    }
  }

  const allAssets = Object.values(registry)

  return {
    valid: missingAddresses === 0,
    errors,
    warnings,
    stats: {
      total: allAssets.length,
      enabledAssets: withAddresses, // Legacy name - now means "has address"
      withAddresses,
      missingAddresses,
    },
  }
}

/**
 * Validate registry against backend token map (from SP10)
 * Ensures our assets will work with pledge creation
 */
async function syncBackendTokenMap(backendUrl: string): Promise<void> {
  try {
    // Dynamic import to avoid client-side bundling
    const backendIntegration = await import('@/lib/backend-integration')
    const { fetchBackendTokens, BACKEND_TOKEN_MAP } = backendIntegration

    console.log('[Registry Validation] Fetching backend token map...')
    const backendTokens = await fetchBackendTokens(backendUrl)

    const registry = getAssetRegistry()
    const errors: string[] = []
    const warnings: string[] = []

    // Check each asset in our registry
    for (const [symbol, asset] of Object.entries(registry)) {
      const backendToken = backendTokens[symbol]

      if (!backendToken) {
        warnings.push(`Asset ${symbol} in registry but not in backend - pledge creation will fail`)
        continue
      }

      // Validate decimals match
      if (asset.decimals !== backendToken.decimals) {
        errors.push(
          `Decimals mismatch for ${symbol}: ` + `Registry=${asset.decimals}, Backend=${backendToken.decimals}`,
        )
      }

      // Update BACKEND_TOKEN_MAP with fetched IDs
      BACKEND_TOKEN_MAP[symbol] = backendToken
    }

    // Check for backend tokens we don't support
    for (const symbol of Object.keys(backendTokens)) {
      if (!registry[symbol]) {
        warnings.push(`Backend has ${symbol} but not in registry - add to support donations`)
      }
    }

    console.log(`[Registry Validation] Validated ${Object.keys(registry).length} assets`)
    console.log(`[Registry Validation] Errors: ${errors.length}, Warnings: ${warnings.length}`)

    if (errors.length > 0) {
      console.error('[Registry Validation] Errors:', errors)
    }
    if (warnings.length > 0) {
      console.warn('[Registry Validation] Warnings:', warnings)
    }
  } catch (error) {
    console.error('[Registry Validation] Failed to validate against backend:', error)
  }
}
