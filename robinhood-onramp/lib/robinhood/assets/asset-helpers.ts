import type { AssetCategory, RobinhoodAssetConfig, RobinhoodNetwork } from '../types'
import { getAssetRegistry } from './registry'

/**
 * Search assets by symbol or name
 * NOTE: This function is deprecated for client-side use.
 * Clients should fetch from /api/robinhood/assets and filter there.
 * This is kept for server-side use only.
 */
export function searchAssets(query: string): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()

  // Return empty if client-side
  if (typeof window !== 'undefined') {
    console.warn('[searchAssets] Client-side detected - use /api/robinhood/assets endpoint instead')
    return []
  }

  const lowerQuery = query.toLowerCase()

  return Object.values(registry)
    .filter(
      (asset) =>
        asset.enabled &&
        asset.depositAddress?.address && // Must have address (Prime, OTC, or fallback)
        (asset.symbol.toLowerCase().includes(lowerQuery) || asset.name.toLowerCase().includes(lowerQuery)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get assets by category
 * Only returns truly usable assets (excludes network mismatches)
 */
export function getAssetsByCategory(category: AssetCategory): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()

  return Object.values(registry)
    .filter(
      (asset) =>
        asset.enabled &&
        asset.depositAddress?.address && // Must have address (Prime, OTC, or fallback)
        asset.category === category,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get assets by network
 * Only returns truly usable assets (excludes network mismatches)
 */
export function getAssetsByNetwork(network: RobinhoodNetwork): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry()

  return Object.values(registry)
    .filter(
      (asset) =>
        asset.enabled &&
        asset.depositAddress?.address && // Must have address (Prime, OTC, or fallback)
        asset.network === network,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Check if an asset is supported
 */
export function isAssetSupported(symbol: string): boolean {
  const registry = getAssetRegistry()
  const asset = registry[symbol]
  return asset !== undefined && asset.enabled
}

/**
 * Get deposit address for an asset
 */
export function getDepositAddress(symbol: string): string | undefined {
  const registry = getAssetRegistry()
  const asset = registry[symbol]
  return asset?.depositAddress?.address
}

/**
 * Get memo for an asset (if required)
 */
export function getDepositMemo(symbol: string): string | undefined {
  const registry = getAssetRegistry()
  const asset = registry[symbol]
  return asset?.depositAddress?.memo
}

/**
 * Get all supported asset symbols
 */
export function getSupportedAssetSymbols(): string[] {
  const registry = getAssetRegistry()
  return Object.keys(registry).filter((symbol) => registry[symbol].enabled)
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): RobinhoodNetwork[] {
  const registry = getAssetRegistry()
  const networks = new Set<RobinhoodNetwork>()

  Object.values(registry).forEach((asset) => {
    if (asset.enabled) {
      networks.add(asset.network)
    }
  })

  return Array.from(networks)
}
