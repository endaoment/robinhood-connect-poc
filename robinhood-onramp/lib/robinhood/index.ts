/**
 * Robinhood Connect - Public API
 *
 * This is the main entry point for all Robinhood Connect functionality.
 * Import from this file to access assets, URL builders, and utilities.
 */

// Types
export * from './types'

// Constants
export * from './constants/errors'
export * from './constants/networks'

// NEW: Service layer exports
export { AssetRegistryService, RobinhoodClientService, UrlBuilderService, getAssetRegistry } from './services'

export type {
  FetchTradingAssetsParams,
  GenerateConnectIdParams,
  GenerateOnrampUrlParams,
  GetAssetParams,
  InitializeRegistryParams,
  RobinhoodConfig,
  ServiceLogger,
  ValidateUrlParams,
} from './services'

// DTOs and Validation
export {
  GenerateUrlDto,
  CreatePledgeDto,
  PledgeStatus,
  CentralizedExchangeStatus,
  AssetDto,
  AssetNetworkDto,
  AssetRegistryDto,
  RobinhoodCallbackDto,
  validateDto,
  validateDtoOrThrow,
  ValidationError,
} from './dtos'

export type { ValidationResult } from './dtos'

// Asset Registry (legacy exports - will be deprecated)
export {
  getAssetConfig,
  getAssetRegistry as getAssetRegistryLegacy,
  getEnabledAssets,
  getFeaturedAssets,
  initializeAssetRegistry,
  isRegistryReady,
  validateAssetRegistry,
} from './assets/registry'

// Asset Helpers
export {
  getAssetsByCategory,
  getAssetsByNetwork,
  getDepositAddress,
  getDepositMemo,
  getSupportedAssetSymbols,
  getSupportedNetworks,
  isAssetSupported,
  searchAssets,
} from './assets/asset-helpers'

// URL Builder
export { buildDaffyStyleOnrampUrl, generateConnectId, isValidConnectId } from './url-builder/daffy-style'

// Validation
export { isValidAmount, isValidAssetCode, isValidWalletAddress } from './url-builder/validation'
