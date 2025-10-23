import { AssetConfig } from '@/types/robinhood'
import { ASSET_METADATA } from './robinhood-asset-metadata'
import { ROBINHOOD_ASSET_ADDRESSES } from './robinhood-asset-addresses'

/**
 * Combine asset metadata with wallet addresses to create complete asset configurations
 *
 * This provides everything needed to display assets and generate URLs.
 */
export function buildAssetConfigs(): AssetConfig[] {
  const configs: AssetConfig[] = []

  for (const [key, metadata] of Object.entries(ASSET_METADATA)) {
    // Find corresponding wallet address
    const addressInfo = ROBINHOOD_ASSET_ADDRESSES[key]

    if (!addressInfo) {
      console.warn(`No wallet address found for asset: ${key}`)
      continue
    }

    if (!metadata.enabled) {
      continue
    }

    configs.push({
      ...metadata,
      walletAddress: addressInfo.address,
      memo: addressInfo.memo,
    })
  }

  return configs.sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get asset configuration by symbol
 */
export function getAssetConfig(symbol: string): AssetConfig | undefined {
  const metadata = ASSET_METADATA[symbol]
  const addressInfo = ROBINHOOD_ASSET_ADDRESSES[symbol]

  if (!metadata || !addressInfo || !metadata.enabled) {
    return undefined
  }

  return {
    ...metadata,
    walletAddress: addressInfo.address,
    memo: addressInfo.memo,
  }
}

/**
 * Validate that all enabled assets have wallet addresses
 */
export function validateAssetConfiguration(): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  for (const [key, metadata] of Object.entries(ASSET_METADATA)) {
    if (!metadata.enabled) continue

    const addressInfo = ROBINHOOD_ASSET_ADDRESSES[key]
    if (!addressInfo) {
      errors.push(`Asset ${key} (${metadata.name}) is enabled but has no wallet address`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get asset configuration statistics
 */
export function getAssetStats() {
  const allAssets = Object.values(ASSET_METADATA)
  const enabledAssets = allAssets.filter((a) => a.enabled)
  const assetsByCategory = enabledAssets.reduce(
    (acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    total: allAssets.length,
    enabled: enabledAssets.length,
    disabled: allAssets.length - enabledAssets.length,
    popular: enabledAssets.filter((a) => a.isPopular).length,
    byCategory: assetsByCategory,
  }
}

