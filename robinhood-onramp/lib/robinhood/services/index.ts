/**
 * Robinhood Services
 *
 * Service layer for Robinhood Connect integration
 * Following endaoment-backend patterns
 */

// Services
export { AssetRegistryService } from './asset-registry.service'
export { RobinhoodClientService } from './robinhood-client.service'
export { UrlBuilderService } from './url-builder.service'

// Types
export type { RetryConfig, RobinhoodApiError, RobinhoodConfig, ServiceLogger } from './types'

export type { FetchTradingAssetsParams, GenerateConnectIdParams } from './robinhood-client.service'

export type { GetAssetParams, InitializeRegistryParams } from './asset-registry.service'

export type { GenerateOnrampUrlParams, ValidateUrlParams, OnrampUrlResult } from './url-builder.service'

// Constants
export { createConsoleLogger, DEFAULT_RETRY_CONFIG } from './types'

// Singleton instances (for convenience)
import { AssetRegistryService } from './asset-registry.service'
export const getAssetRegistry = () => AssetRegistryService.getInstance()
