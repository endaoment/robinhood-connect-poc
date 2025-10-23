/**
 * Feature flag configuration
 */

/**
 * Check if asset pre-selection is enabled
 */
export function isAssetPreselectionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION === "true";
}

/**
 * All feature flags
 */
export const FEATURE_FLAGS = {
  assetPreselection: isAssetPreselectionEnabled(),
} as const;

