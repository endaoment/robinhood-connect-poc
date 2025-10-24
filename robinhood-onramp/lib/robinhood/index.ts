/**
 * Robinhood Connect - Public API
 *
 * This is the main entry point for all Robinhood Connect functionality.
 * Import from this file to access assets, URL builders, and utilities.
 */

// Types
export * from "./types";

// Constants
export * from "./constants/networks";
export * from "./constants/errors";

// Asset Registry
export {
  getAssetRegistry,
  getAssetConfig,
  getEnabledAssets,
  getFeaturedAssets,
  validateAssetRegistry,
  assetToOtcToken,
  getOtcTokens,
  getOtcTokenMap,
} from "./assets/registry";

// Asset Helpers
export {
  searchAssets,
  getAssetsByCategory,
  getAssetsByNetwork,
  isAssetSupported,
  getDepositAddress,
  getDepositMemo,
  getSupportedAssetSymbols,
  getSupportedNetworks,
} from "./assets/asset-helpers";

// URL Builder
export {
  buildDaffyStyleOnrampUrl,
  generateConnectId,
  isValidConnectId,
} from "./url-builder/daffy-style";

// Validation
export {
  isValidWalletAddress,
  isValidAssetCode,
  isValidAmount,
} from "./url-builder/validation";

