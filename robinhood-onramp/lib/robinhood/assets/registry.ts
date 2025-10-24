import { RobinhoodAssetConfig, IOtcToken } from "../types";
import { EVM_ASSETS, EVM_DEPOSIT_ADDRESSES } from "./evm-assets";
import { NON_EVM_ASSETS, NON_EVM_DEPOSIT_ADDRESSES } from "./non-evm-assets";

/**
 * SINGLE SOURCE OF TRUTH: Complete Robinhood Asset Registry
 *
 * This combines:
 * - Asset metadata (display info, categories, icons)
 * - Deposit addresses (Coinbase Prime Trading Balance wallets)
 * - Network configuration
 *
 * To add a new asset:
 * 1. Add to evm-assets.ts OR non-evm-assets.ts
 * 2. Add deposit address to corresponding DEPOSIT_ADDRESSES constant
 * 3. That's it! Registry auto-populates.
 */

/**
 * Build complete asset configurations by combining metadata + addresses
 */
export function buildRobinhoodAssetRegistry(): Record<
  string,
  RobinhoodAssetConfig
> {
  const registry: Record<string, RobinhoodAssetConfig> = {};

  // Add EVM assets
  for (const [symbol, asset] of Object.entries(EVM_ASSETS)) {
    const depositAddress = EVM_DEPOSIT_ADDRESSES[symbol];

    if (!depositAddress) {
      console.warn(
        `[Asset Registry] EVM asset ${symbol} missing deposit address - skipping`
      );
      continue;
    }

    registry[symbol] = {
      ...asset,
      depositAddress,
    };
  }

  // Add Non-EVM assets
  for (const [symbol, asset] of Object.entries(NON_EVM_ASSETS)) {
    const depositAddress = NON_EVM_DEPOSIT_ADDRESSES[symbol];

    if (!depositAddress) {
      console.warn(
        `[Asset Registry] Non-EVM asset ${symbol} missing deposit address - skipping`
      );
      continue;
    }

    registry[symbol] = {
      ...asset,
      depositAddress,
    };
  }

  return registry;
}

/**
 * Global asset registry - lazy loaded
 */
let ASSET_REGISTRY: Record<string, RobinhoodAssetConfig> | null = null;

/**
 * Get the complete asset registry
 */
export function getAssetRegistry(): Record<string, RobinhoodAssetConfig> {
  if (!ASSET_REGISTRY) {
    ASSET_REGISTRY = buildRobinhoodAssetRegistry();
  }
  return ASSET_REGISTRY;
}

/**
 * Get a specific asset configuration by symbol
 */
export function getAssetConfig(
  symbol: string
): RobinhoodAssetConfig | undefined {
  const registry = getAssetRegistry();
  return registry[symbol];
}

/**
 * Get all enabled assets
 */
export function getEnabledAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all featured/popular assets
 */
export function getFeaturedAssets(): RobinhoodAssetConfig[] {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled && asset.featured)
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Validate that asset registry is properly configured
 */
export function validateAssetRegistry(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    evm: number;
    nonEvm: number;
    missingAddresses: number;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const registry = getAssetRegistry();

  let evmCount = 0;
  let nonEvmCount = 0;
  let missingAddresses = 0;

  for (const [symbol, asset] of Object.entries(registry)) {
    // Count by type
    if (asset.type === "EvmToken") {
      evmCount++;
    } else {
      nonEvmCount++;
    }

    // Validate deposit address
    if (!asset.depositAddress?.address) {
      errors.push(`Asset ${symbol} missing deposit address`);
      missingAddresses++;
    } else if (asset.depositAddress.address.includes("PLACEHOLDER")) {
      warnings.push(`Asset ${symbol} has placeholder deposit address`);
    }

    // Validate network/memo consistency
    if (
      asset.depositAddress?.memo &&
      asset.network !== "XRP" &&
      asset.network !== "STELLAR" &&
      asset.network !== "HEDERA"
    ) {
      warnings.push(
        `Asset ${symbol} has memo but network ${asset.network} typically doesn't require it`
      );
    }
  }

  const allAssets = Object.values(registry);
  const enabled = allAssets.filter((a) => a.enabled);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: allAssets.length,
      enabled: enabled.length,
      disabled: allAssets.length - enabled.length,
      evm: evmCount,
      nonEvm: nonEvmCount,
      missingAddresses,
    },
  };
}

/**
 * Convert Robinhood asset to OTC token format (for backend integration)
 * This prepares assets for eventual integration into backend's otc-token.ts
 */
export function assetToOtcToken(asset: RobinhoodAssetConfig): IOtcToken {
  return {
    address: asset.depositAddress.address,
    symbol: asset.symbol,
    name: asset.name,
    logoUrl: asset.logoUrl,
    memo: asset.depositAddress.memo || null,
  };
}

/**
 * Get all assets as OTC tokens (for backend integration)
 * Returns only enabled assets in OTC token format
 */
export function getOtcTokens(): ReadonlyArray<IOtcToken> {
  const registry = getAssetRegistry();
  return Object.values(registry)
    .filter((asset) => asset.enabled)
    .map((asset) => assetToOtcToken(asset))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

/**
 * Create a symbol-to-OTC-token map (matches backend pattern)
 */
export function getOtcTokenMap(): Map<string, IOtcToken> {
  const map = new Map<string, IOtcToken>();
  const tokens = getOtcTokens();
  
  for (const token of tokens) {
    map.set(token.symbol, token);
  }
  
  return map;
}

