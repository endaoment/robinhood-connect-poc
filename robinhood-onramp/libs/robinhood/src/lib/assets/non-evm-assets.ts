import { RobinhoodNonEvmAsset, RobinhoodTokenType } from '../types'

/**
 * Non-EVM Asset Metadata (Display Information Only)
 *
 * NOTE: Deposit addresses are fetched dynamically from Coinbase Prime
 * This file only contains static metadata (icons, descriptions, etc.)
 *
 * For static fallback addresses, see: non-evm-assets-static.ts
 */

/**
 * Non-EVM Asset Metadata Registry
 * Static display information for each asset
 */
export const NON_EVM_ASSETS: Record<string, RobinhoodNonEvmAsset> = {
  // Bitcoin
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    description: 'The original cryptocurrency and store of value',
    network: 'BITCOIN',
    nonEvmIdentifier: 'BTC',
    category: 'layer1',
    icon: 'btc.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579',
    decimals: 8,
    enabled: true,
    featured: true,
    popularity: 100,
    sortOrder: 1,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Solana
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    description: 'High-performance blockchain for dApps',
    network: 'SOLANA',
    nonEvmIdentifier: 'SOL',
    category: 'layer1',
    icon: 'sol.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png?1640133422',
    decimals: 9,
    enabled: true,
    featured: true,
    popularity: 90,
    sortOrder: 3,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Other Bitcoin-like
  LTC: {
    symbol: 'LTC',
    name: 'Litecoin',
    description: 'Peer-to-peer cryptocurrency',
    network: 'LITECOIN',
    nonEvmIdentifier: 'LTC',
    category: 'layer1',
    icon: 'ltc.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png?1547033580',
    decimals: 8,
    enabled: true,
    popularity: 60,
    sortOrder: 12,
    type: RobinhoodTokenType.NonEvmToken,
  },

  BCH: {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    description: 'Bitcoin fork with larger blocks',
    network: 'BITCOIN_CASH',
    nonEvmIdentifier: 'BCH',
    category: 'layer1',
    icon: 'bch.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png?1594689492',
    decimals: 8,
    enabled: true,
    popularity: 50,
    sortOrder: 13,
    type: RobinhoodTokenType.NonEvmToken,
  },

  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    description: 'Original meme cryptocurrency',
    network: 'DOGECOIN',
    nonEvmIdentifier: 'DOGE',
    category: 'meme',
    icon: 'doge.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256',
    decimals: 8,
    enabled: true,
    popularity: 75,
    sortOrder: 30,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Other L1s
  ADA: {
    symbol: 'ADA',
    name: 'Cardano',
    description: 'Proof-of-stake blockchain platform',
    network: 'CARDANO',
    nonEvmIdentifier: 'ADA',
    category: 'layer1',
    icon: 'ada.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/975/small/cardano.png?1547034860',
    decimals: 6,
    enabled: true, // NOW SUPPORTED: Found in Robinhood Discovery API
    popularity: 65,
    sortOrder: 15,
    type: RobinhoodTokenType.NonEvmToken,
  },

  XTZ: {
    symbol: 'XTZ',
    name: 'Tezos',
    description: 'Self-amending blockchain platform',
    network: 'TEZOS',
    nonEvmIdentifier: 'XTZ',
    category: 'layer1',
    icon: 'xtz.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png?1547034862',
    decimals: 6,
    enabled: true,
    popularity: 45,
    sortOrder: 16,
    type: RobinhoodTokenType.NonEvmToken,
  },

  XLM: {
    symbol: 'XLM',
    name: 'Stellar',
    description: 'Fast, low-cost payment network',
    network: 'STELLAR',
    nonEvmIdentifier: 'XLM',
    category: 'layer1',
    icon: 'xlm.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png?1552356157',
    decimals: 7,
    enabled: true,
    popularity: 55,
    sortOrder: 15,
    type: RobinhoodTokenType.NonEvmToken,
  },

  SUI: {
    symbol: 'SUI',
    name: 'Sui',
    description: 'Next-generation smart contract platform',
    network: 'SUI',
    nonEvmIdentifier: 'SUI',
    category: 'layer1',
    icon: 'sui.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg?1727791290',
    decimals: 9,
    enabled: true, // Enabled: Robinhood supports SUI_NETWORK
    popularity: 50,
    sortOrder: 17,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Networks with memos (currently disabled - not in Connect supported networks)
  XRP: {
    symbol: 'XRP',
    name: 'Ripple',
    description: 'Digital payment network and protocol',
    network: 'XRP',
    nonEvmIdentifier: 'XRP',
    category: 'layer1',
    icon: 'xrp.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png?1696501442',
    decimals: 6,
    enabled: false,
    popularity: 70,
    sortOrder: 18,
    type: RobinhoodTokenType.NonEvmToken,
  },

  HBAR: {
    symbol: 'HBAR',
    name: 'Hedera',
    description: 'Enterprise-grade distributed ledger',
    network: 'HEDERA',
    nonEvmIdentifier: 'HBAR',
    category: 'layer1',
    icon: 'hbar.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/3688/small/hbar.png?1637045634',
    decimals: 8,
    enabled: true, // NOW SUPPORTED: Found in Robinhood Discovery API
    popularity: 48,
    sortOrder: 19,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Solana meme coins
  BONK: {
    symbol: 'BONK',
    name: 'BONK',
    description: 'Solana-based community meme token',
    network: 'SOLANA',
    nonEvmIdentifier: 'BONK',
    category: 'meme',
    icon: 'bonk.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg?1672304290',
    decimals: 5,
    enabled: true,
    popularity: 65,
    sortOrder: 34,
    type: RobinhoodTokenType.NonEvmToken,
  },

  MOODENG: {
    symbol: 'MOODENG',
    name: 'Moo Deng',
    description: 'Viral Solana meme token',
    network: 'SOLANA',
    nonEvmIdentifier: 'MOODENG',
    category: 'meme',
    icon: 'moodeng.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/40327/standard/moodeng.jpg?1728033449',
    decimals: 9,
    enabled: true,
    popularity: 55,
    sortOrder: 35,
    type: RobinhoodTokenType.NonEvmToken,
  },

  // Other Solana tokens
  TRUMP: {
    symbol: 'TRUMP',
    name: 'OFFICIAL TRUMP',
    description: 'Political-themed Solana token',
    network: 'SOLANA',
    nonEvmIdentifier: 'TRUMP',
    category: 'other',
    icon: 'trump.svg',
    logoUrl: 'https://assets.coingecko.com/coins/images/43379/standard/photo_2025-01-18_05-25-12.jpg?1737159150',
    decimals: 6,
    enabled: true,
    popularity: 50,
    sortOrder: 40,
    type: RobinhoodTokenType.NonEvmToken,
  },
}
