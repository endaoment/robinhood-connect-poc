/**
 * Robinhood Connect Types - Aligned with Endaoment Backend Token Structure
 *
 * References:
 * - Backend: libs/api/data-access/src/lib/entities/token/token.entity.ts
 * - Backend: libs/api/tokens/src/lib/otc-token.ts
 */

/**
 * Supported blockchain networks on Robinhood Connect
 */
export type RobinhoodNetwork =
  | 'ARBITRUM'
  | 'AVALANCHE'
  | 'BASE'
  | 'BITCOIN'
  | 'BITCOIN_CASH'
  | 'CARDANO'
  | 'DOGECOIN'
  | 'ETHEREUM'
  | 'ETHEREUM_CLASSIC'
  | 'HEDERA'
  | 'LITECOIN'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'SOLANA'
  | 'STELLAR'
  | 'SUI'
  | 'TEZOS'
  | 'TONCOIN'
  | 'XRP'
  | 'ZORA'

/**
 * Asset categories for UI grouping
 */
export type AssetCategory = 'layer1' | 'layer2' | 'stablecoin' | 'defi' | 'meme' | 'other'

/**
 * Token type discriminator (matches backend)
 */
export enum RobinhoodTokenType {
  EvmToken = 'EvmToken',
  NonEvmToken = 'NonEvmToken',
}

/**
 * Base interface for all Robinhood transferable assets
 * Mirrors backend Token entity
 */
export interface RobinhoodBaseAsset {
  /** Unique symbol (e.g., 'BTC', 'ETH', 'SOL') */
  symbol: string

  /** Full display name (e.g., 'Bitcoin', 'Ethereum') */
  name: string

  /** Brief description for tooltips/UI */
  description: string

  /** Icon filename (e.g., 'btc.svg') - local fallback */
  icon: string

  /** Logo URL (CoinGecko format for backend integration) */
  logoUrl: string | null

  /** Decimals for display formatting */
  decimals: number

  /** Whether asset is enabled for transfers */
  enabled: boolean

  /** Featured/pinned in UI */
  featured?: boolean

  /** Popularity score for sorting (higher = more popular) */
  popularity: number

  /** Sort order for display */
  sortOrder: number

  /** UI category */
  category: AssetCategory

  /** Token type discriminator */
  type: RobinhoodTokenType
}

/**
 * EVM-based asset (Ethereum, Polygon, Arbitrum, etc.)
 * Mirrors backend EvmToken entity
 */
export interface RobinhoodEvmAsset extends RobinhoodBaseAsset {
  type: RobinhoodTokenType.EvmToken

  /** EVM Chain ID (1 = Ethereum, 137 = Polygon, etc.) */
  chainId: number

  /** Blockchain network name */
  network: Extract<
    RobinhoodNetwork,
    'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'ZORA' | 'AVALANCHE' | 'ETHEREUM_CLASSIC'
  >

  /** ERC-20 contract address (or native asset address) */
  contractAddress?: string
}

/**
 * Non-EVM asset (Bitcoin, Solana, Cardano, etc.)
 * Mirrors backend NonEvmToken entity
 */
export interface RobinhoodNonEvmAsset extends RobinhoodBaseAsset {
  type: RobinhoodTokenType.NonEvmToken

  /** Blockchain network name */
  network: Exclude<
    RobinhoodNetwork,
    'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'ZORA' | 'AVALANCHE' | 'ETHEREUM_CLASSIC'
  >

  /** Non-EVM identifier (often same as symbol) */
  nonEvmIdentifier: string
}

/**
 * Union type for all assets
 */
export type RobinhoodAsset = RobinhoodEvmAsset | RobinhoodNonEvmAsset

/**
 * Deposit address configuration for an asset
 * Mirrors backend IOtcToken interface
 */
export interface RobinhoodDepositAddress {
  /** Destination wallet address (Coinbase Prime Trading Balance) */
  address: string

  /** Optional memo/tag for networks that require it (XRP, XLM, HBAR) */
  memo?: string | null

  /** Notes about this address (e.g., 'Fallback address') */
  note?: string

  /** Wallet type (indicates source: Trading, Trading Balance, Other, OTC) */
  walletType?: 'Trading' | 'Trading Balance' | 'Other' | 'OTC'

  /** Wallet ID from Coinbase Prime (if applicable) */
  walletId?: string
}

/**
 * OTC Token format (for backend integration)
 * Matches backend libs/api/tokens/src/lib/otc-token.ts IOtcToken interface
 */
export interface IOtcToken {
  /** Address to receive the token OTC */
  readonly address: string

  /** Symbol of the token */
  readonly symbol: string

  /** Name of the token */
  readonly name: string

  /** Logo URL (CoinGecko format) */
  readonly logoUrl: string | null

  /** Memo to receive the token OTC, if applicable */
  readonly memo: string | null
}

/**
 * Complete asset configuration with deposit address
 * This is what's used for generating Robinhood Connect URLs
 */
export interface RobinhoodAssetConfig extends RobinhoodAsset {
  /** Deposit address configuration */
  depositAddress: RobinhoodDepositAddress
}

/**
 * Daffy-style onramp URL parameters
 */
export interface DaffyStyleOnrampParams {
  asset: string
  network: RobinhoodNetwork
  walletAddress: string
  redirectUrl?: string
  connectId?: string
}

/**
 * Daffy-style onramp URL result
 */
export interface DaffyStyleOnrampUrlResult {
  url: string
  connectId: string
  params: {
    asset: string
    network: string
    walletAddress: string
  }
}
