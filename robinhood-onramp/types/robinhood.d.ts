// Robinhood Connect API Types
/**
 * ID SYSTEM NOTE:
 *
 * This codebase uses "connectId" as the standard term throughout.
 * This is the identifier returned by the Robinhood Connect API (/catpay/v1/connect_id/).
 *
 * Important: "referenceId" is used only in Robinhood's OFFRAMP API (separate from onramp).
 * This project implements ONRAMP only, so we use connectId exclusively.
 */

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

// Asset Pre-Selection Types

/**
 * Asset category for grouping in UI
 */
export type AssetCategory =
  | 'layer1' // Bitcoin, Ethereum, etc.
  | 'layer2' // Polygon, Optimism, Arbitrum
  | 'stablecoin' // USDC, USDT, DAI
  | 'defi' // AAVE, UNI, LINK, etc.
  | 'meme' // DOGE, SHIB
  | 'other'

/**
 * Network types for Robinhood Connect
 */
export type RobinhoodNetwork = SupportedNetwork

/**
 * Display metadata for a crypto asset
 */
export interface AssetMetadata {
  /** Asset symbol (e.g., 'ETH', 'BTC') */
  symbol: string

  /** Full display name (e.g., 'Ethereum', 'Bitcoin') */
  name: string

  /** Brief description for tooltips */
  description: string

  /** Network the asset operates on */
  network: RobinhoodNetwork

  /** Category for UI grouping */
  category: AssetCategory

  /** Icon reference (filename or URL) */
  icon: string

  /** Whether this asset is currently enabled for donations */
  enabled: boolean

  /** Sort order for display (lower = higher priority) */
  sortOrder: number

  /** Popular assets to show first */
  isPopular?: boolean
}

/**
 * Complete asset configuration including metadata and wallet address
 */
export interface AssetConfig extends AssetMetadata {
  /** Destination wallet address for this asset */
  walletAddress: string

  /** Optional memo/tag for networks that require it */
  memo?: string
}

/**
 * Parameters for Daffy-style onramp URL generation
 * Uses proven working format from testing
 * Reference: URL-TESTING-TRACKER.md, daffy_style_url_test_results.json
 */
export interface DaffyStyleOnrampParams {
  /** Asset symbol (e.g., 'ETH', 'BTC') */
  asset: string

  /** Network for the asset (e.g., 'ETHEREUM', 'BITCOIN') */
  network: RobinhoodNetwork

  /** Destination wallet address for this asset */
  walletAddress: string

  /** Optional custom callback URL (defaults to standard callback) */
  redirectUrl?: string

  /**
   * The Robinhood Connect ID for tracking this transfer.
   * This is the official Robinhood API identifier returned from /connect_id endpoint.
   * Optional - will generate UUID if not provided.
   */
  connectId?: string
}

/**
 * Result of Daffy-style URL generation
 */
export interface DaffyStyleOnrampUrlResult {
  /** Generated URL */
  url: string

  /**
   * The Robinhood Connect ID used for this transfer.
   * This ID is used to track the transfer throughout the Robinhood flow.
   */
  connectId: string

  /** Parameters used */
  params: {
    asset: string
    network: string
    walletAddress: string
  }
}
