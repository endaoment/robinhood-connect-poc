import type { RobinhoodAssetConfig } from '../types'
import { fetchRobinhoodAssets, normalizeNetworkName, type DiscoveredAsset } from './discovery'
import { EVM_ASSETS } from './evm-assets'
import { NON_EVM_ASSETS } from './non-evm-assets'
import { fetchPrimeWalletAddresses, getPrimeAddress } from './prime-addresses'

/**
 * Asset Registry Builder
 *
 * Builds the complete asset registry from:
 * 1. Static metadata (from evm-assets.ts and non-evm-assets.ts)
 * 2. Dynamic: Robinhood Discovery API + Coinbase Prime API
 * 3. Fallback: Static deposit addresses (from evm-assets-static.ts and non-evm-assets-static.ts)
 *
 * Synchronous getAssetRegistry() auto-initializes with static data.
 * Async initializeAssetRegistry() can fetch from APIs (server-side only).
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
 * Build static registry synchronously
 * Uses hardcoded addresses from static files
 * Works on both client and server
 */
function buildStaticRegistry(): Record<string, RobinhoodAssetConfig> {
  // Synchronous import for immediate availability
  const { EVM_DEPOSIT_ADDRESSES } = require('./evm-assets-static')
  const { NON_EVM_DEPOSIT_ADDRESSES } = require('./non-evm-assets-static')

  const registry: Record<string, RobinhoodAssetConfig> = {}

  // Add EVM assets
  for (const [symbol, asset] of Object.entries(EVM_ASSETS)) {
    const depositAddress = EVM_DEPOSIT_ADDRESSES[symbol]
    if (depositAddress) {
      registry[symbol] = {
        ...asset,
        depositAddress,
      }
    }
  }

  // Add Non-EVM assets
  for (const [symbol, asset] of Object.entries(NON_EVM_ASSETS)) {
    const depositAddress = NON_EVM_DEPOSIT_ADDRESSES[symbol]
    if (depositAddress) {
      registry[symbol] = {
        ...asset,
        depositAddress,
      }
    }
  }

  return registry
}

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
        depositAddress: { address: '', note: 'No metadata' }, // Placeholder
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
      // Network mismatch - Include but mark as no match
      console.warn(
        `[Asset Registry] ${symbol}: Network mismatch - ` +
          `our address is ${ourNetwork}, Robinhood supports ${normalizedRobinhoodNetworks.join(', ')}`,
      )
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'Network mismatch' },
      }
      continue
    }

    if (!depositAddress) {
      console.warn(`[Asset Registry] No Prime address for ${symbol} - including without address`)
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'No CBP address' },
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

      // Step 1: Fetch supported assets from Robinhood
      const discoveredAssets = await fetchRobinhoodAssets()

      if (discoveredAssets.length === 0) {
        console.warn('[Asset Registry] No assets discovered - falling back to static')
        setRegistryCache(buildStaticRegistry())
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
      console.warn('[Asset Registry] Falling back to static registry')
      setRegistryCache(buildStaticRegistry())
      setRegistryMode('STATIC')
    }
  } else {
    console.log('[Asset Registry] Using STATIC mode')
    setRegistryCache(buildStaticRegistry())
    setRegistryMode('STATIC')
  }

  // Sync with backend if URL provided
  if (options?.backendUrl) {
    await syncBackendTokenMap(options.backendUrl)
  }
}

/**
 * Get asset registry (synchronous)
 * Returns current registry or throws if not initialized
 * Use initializeAssetRegistry() first during app startup
 */
export function getAssetRegistry(): Record<string, RobinhoodAssetConfig> {
  const cachedRegistry = getRegistryCache()

  if (!cachedRegistry) {
    const wasDynamicMode = getRegistryMode() === 'DYNAMIC'

    if (wasDynamicMode) {
      console.error('='.repeat(60))
      console.error('WARNING: [Asset Registry] HOT RELOAD DETECTED')
      console.error('='.repeat(60))
      console.error('The dynamic registry was cleared by hot reload.')
      console.error('Falling back to STATIC addresses (not from Coinbase Prime).')
      console.error('')
      console.error('To restore DYNAMIC mode with Prime addresses:')
      console.error('  1. Stop the dev server (Ctrl+C)')
      console.error('  2. Run: npm run dev:ngrok')
      console.error('='.repeat(60))
    } else {
      console.warn('[Asset Registry] Auto-initializing with static registry')
    }

    // Fallback to static
    const staticRegistry = buildStaticRegistry()
    setRegistryCache(staticRegistry)
    setRegistryMode('STATIC')
    return staticRegistry
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
 * Only returns assets that have a valid address for donations
 */
export function getEnabledAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()
  return Object.values(registry)
    .filter((asset) => asset.depositAddress?.address) // Only assets with valid addresses
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get featured assets
 */
export function getFeaturedAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()
  return Object.values(registry)
    .filter((asset) => asset.featured && asset.depositAddress?.address) // Only show if has address
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
