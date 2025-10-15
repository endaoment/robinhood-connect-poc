// Robinhood Connect API Types

export interface RobinhoodOfframpParams {
  applicationId: string
  offRamp: boolean
  supportedNetworks: string
  redirectUrl: string
  referenceId: string
  assetCode?: string
  assetAmount?: string
  fiatCode?: string
  fiatAmount?: string
}

export interface DepositAddressResponse {
  address: string
  addressTag?: string
  assetCode: string
  assetAmount: string
  networkCode: string
}

export interface OrderStatusResponse {
  applicationId: string
  connectId: string
  assetCode: string
  networkCode: string
  fiatCode: string
  fiatAmount: string
  cryptoAmount: string
  price: string
  processingFee: PriceItem
  paymentMethod: string
  totalAmount: PriceItem
  blockchainTransactionId?: string
  destinationAddress: string
  referenceID: string
  status: OrderStatus
}

export interface PriceItem {
  type: string
  fiatAmount: string
  cryptoQuantity: string
}

export type OrderStatus = 'ORDER_STATUS_IN_PROGRESS' | 'ORDER_STATUS_SUCCEEDED' | 'ORDER_STATUS_FAILED'

export interface CallbackParams {
  assetCode: string
  assetAmount: string
  network: string
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

// Supported networks from Robinhood SDK
export type SupportedNetwork =
  | 'AVALANCHE'
  | 'BITCOIN'
  | 'BITCOIN_CASH'
  | 'LITECOIN'
  | 'DOGECOIN'
  | 'ETHEREUM'
  | 'ETHEREUM_CLASSIC'
  | 'POLYGON'
  | 'SOLANA'
  | 'STELLAR'
  | 'TEZOS'

// Common asset codes
export type AssetCode = 'BTC' | 'ETH' | 'USDC' | 'USDT' | 'SOL' | 'MATIC' | 'LTC' | 'DOGE' | 'AVAX' | 'ADA' | string // Allow other asset codes
