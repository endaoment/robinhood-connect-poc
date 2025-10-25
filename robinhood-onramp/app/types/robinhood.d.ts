/**
 * Robinhood Connect API Types
 *
 * This file re-exports types from lib/robinhood for backward compatibility.
 * New code should import directly from '@/libs/robinhood'
 *
 * @deprecated Import from '@/libs/robinhood' instead
 */

export type {
  AssetCategory,
  DaffyStyleOnrampParams,
  DaffyStyleOnrampUrlResult,
  RobinhoodAsset,
  RobinhoodAssetConfig,
  RobinhoodBaseAsset,
  RobinhoodDepositAddress,
  RobinhoodEvmAsset,
  RobinhoodNetwork,
  RobinhoodNonEvmAsset,
} from '@/libs/robinhood'

export { RobinhoodTokenType } from '@/libs/robinhood'

// Legacy type aliases for backward compatibility
export type SupportedNetwork = import('@/libs/robinhood').RobinhoodNetwork
export type AssetMetadata = import('@/libs/robinhood').RobinhoodBaseAsset
export type AssetConfig = import('@/libs/robinhood').RobinhoodAssetConfig

// For API route compatibility
export type AssetCode = string

// Deprecated types (no longer used)
export interface DepositAddressResponse {
  address: string
  addressTag?: string
  assetCode: string
  assetAmount: string
  networkCode: string
}

export interface CallbackParams {
  assetCode: string
  assetAmount: string
  network: string
}

export interface PriceItem {
  type: string
  fiatAmount: string
  cryptoQuantity: string
}

export interface PriceQuoteResponse {
  assetCode: string
  applicationId: string
  fiatCode: string
  fiatAmount: string
  cryptoAmount: string
  price: string
  processingFee: PriceItem
  totalAmount: PriceItem
  partnerFee: PriceItem
  paymentMethod: string
  networkCode: string
}
