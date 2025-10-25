/**
 * Robinhood Assets Module
 *
 * Exports asset registry, discovery, and helper functions
 */

// Asset registry functions
export {
  getAssetConfig,
  getAssetRegistry,
  getEnabledAssets,
  getFeaturedAssets,
  initializeAssetRegistry,
  isRegistryReady,
  validateAssetRegistry,
} from './registry'

// Discovery API
export { fetchRobinhoodAssets, getDiscoveryStats, normalizeNetworkName, type DiscoveredAsset } from './discovery'

// Prime addresses
export {
  fetchPrimeWalletAddresses,
  getPrimeAddress,
  getPrimeAddressStats,
  isPrimeAddressCacheReady,
  PrimeWalletType,
} from './prime-addresses'

// Asset helpers
export {
  getAssetsByCategory,
  getAssetsByNetwork,
  getDepositAddress,
  getDepositMemo,
  getSupportedAssetSymbols,
  getSupportedNetworks,
  isAssetSupported,
  searchAssets,
} from './asset-helpers'

// Static asset definitions
export { EVM_ASSETS } from './evm-assets'
export { NON_EVM_ASSETS } from './non-evm-assets'
