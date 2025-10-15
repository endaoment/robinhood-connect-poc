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
// Complete list from: https://robinhood.com/us/en/support/articles/crypto-transfers/
export type SupportedNetwork =
  | 'ARBITRUM' // ARB - Native Arbitrum chain
  | 'AVALANCHE' // AVAX - C-Chain only (starts with 0x)
  | 'BASE' // Base L2 network (starts with 0x)
  | 'BITCOIN' // BTC - P2PKH (1), P2SH (3), SegWit (bc1q)
  | 'BITCOIN_CASH' // BCH - Legacy (1) or Cashaddr (q)
  | 'CARDANO' // ADA - Byron (Ae2, DdzFF) or Shelley (addr1)
  | 'DOGECOIN' // DOGE - P2PKH (starts with D)
  | 'ETHEREUM' // ETH + all ERC-20 tokens (starts with 0x)
  | 'ETHEREUM_CLASSIC' // ETC - EOA addresses only (starts with 0x)
  | 'HEDERA' // HBAR - Account ID format (0.0.x) - REQUIRES MEMO
  | 'LITECOIN' // LTC - P2PKH (L), P2SH (M), SegWit (ltc1)
  | 'OPTIMISM' // OP - Optimism L2 network (starts with 0x)
  | 'POLYGON' // MATIC + Polygon tokens (starts with 0x)
  | 'SOLANA' // SOL + SPL tokens - 44 character addresses
  | 'STELLAR' // XLM - Standard addresses (G) - REQUIRES MEMO
  | 'SUI' // SUI - Addresses with 0x + 64 hex chars
  | 'TEZOS' // XTZ - Addresses starting with tz
  | 'TONCOIN' // TON - Base64 or hexadecimal format
  | 'XRP' // XRP - XRPL network - REQUIRES MEMO (numeric)
  | 'ZORA' // ZORA - Base network (starts with 0x)

// Common asset codes
export type AssetCode = 'BTC' | 'ETH' | 'USDC' | 'USDT' | 'SOL' | 'MATIC' | 'LTC' | 'DOGE' | 'AVAX' | 'ADA' | string // Allow other asset codes

// Offramp URL Generation Types
export interface OfframpUrlRequest {
  supportedNetworks: SupportedNetwork[]
  assetCode?: AssetCode
  assetAmount?: string
  fiatAmount?: string
}

export interface OfframpUrlResponse {
  success: boolean
  data?: {
    url: string
    referenceId: string
    params: RobinhoodOfframpParams
  }
  error?: string
}
