import type {
  AssetCategory,
  RobinhoodAssetConfig,
  RobinhoodNetwork,
} from "../types";
import { getAssetRegistry } from "./registry";

/**
 * Search assets by symbol or name
 */
export function searchAssets(query: string): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  const lowerQuery = query.toLowerCase();

  return Object.values(registry)
    .filter(
      (asset) =>
        asset.enabled &&
        (asset.symbol.toLowerCase().includes(lowerQuery) ||
          asset.name.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(
  category: AssetCategory
): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();

  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get assets by network
 */
export function getAssetsByNetwork(
  network: RobinhoodNetwork
): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();

  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.network === network)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Check if an asset is supported
 */
export function isAssetSupported(symbol: string): boolean {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset !== undefined && asset.enabled;
}

/**
 * Get deposit address for an asset
 */
export function getDepositAddress(symbol: string): string | undefined {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset?.depositAddress?.address;
}

/**
 * Get memo for an asset (if required)
 */
export function getDepositMemo(symbol: string): string | undefined {
  const registry = getAssetRegistry();
  const asset = registry[symbol];
  return asset?.depositAddress?.memo;
}

/**
 * Get all supported asset symbols
 */
export function getSupportedAssetSymbols(): string[] {
  const registry = getAssetRegistry();
  return Object.keys(registry).filter((symbol) => registry[symbol].enabled);
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): RobinhoodNetwork[] {
  const registry = getAssetRegistry();
  const networks = new Set<RobinhoodNetwork>();

  Object.values(registry).forEach((asset) => {
    if (asset.enabled) {
      networks.add(asset.network);
    }
  });

  return Array.from(networks);
}

