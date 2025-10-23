import { AssetMetadata, AssetCategory, RobinhoodNetwork } from '@/types/robinhood'

/**
 * Display metadata for all supported Robinhood Connect assets
 *
 * This is the single source of truth for asset display information.
 * Update this file when adding new assets or changing metadata.
 *
 * Coverage: 27 assets on supported Robinhood Connect networks
 * Last updated: October 23, 2025
 */
export const ASSET_METADATA: Record<string, AssetMetadata> = {
  // ========================================
  // LAYER 1 BLOCKCHAINS
  // ========================================
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    description: 'The original cryptocurrency and store of value',
    network: 'BITCOIN',
    category: 'layer1',
    icon: 'btc.svg',
    enabled: true,
    sortOrder: 1,
    isPopular: true,
  },

  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    description: 'Smart contract platform and cryptocurrency',
    network: 'ETHEREUM',
    category: 'layer1',
    icon: 'eth.svg',
    enabled: true,
    sortOrder: 2,
    isPopular: true,
  },

  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    description: 'High-performance blockchain for dApps',
    network: 'SOLANA',
    category: 'layer1',
    icon: 'sol.svg',
    enabled: true,
    sortOrder: 3,
    isPopular: true,
  },

  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    description: 'Fast, low-cost blockchain platform',
    network: 'AVALANCHE',
    category: 'layer1',
    icon: 'avax.svg',
    enabled: true,
    sortOrder: 10,
  },

  LTC: {
    symbol: 'LTC',
    name: 'Litecoin',
    description: 'Peer-to-peer cryptocurrency',
    network: 'LITECOIN',
    category: 'layer1',
    icon: 'ltc.svg',
    enabled: true,
    sortOrder: 12,
  },

  BCH: {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    description: 'Bitcoin fork with larger blocks',
    network: 'BITCOIN_CASH',
    category: 'layer1',
    icon: 'bch.svg',
    enabled: true,
    sortOrder: 13,
  },

  ETC: {
    symbol: 'ETC',
    name: 'Ethereum Classic',
    description: 'Original Ethereum blockchain',
    network: 'ETHEREUM_CLASSIC',
    category: 'layer1',
    icon: 'etc.svg',
    enabled: true,
    sortOrder: 14,
  },

  XLM: {
    symbol: 'XLM',
    name: 'Stellar',
    description: 'Fast, low-cost payment network',
    network: 'STELLAR',
    category: 'layer1',
    icon: 'xlm.svg',
    enabled: true,
    sortOrder: 15,
  },

  XTZ: {
    symbol: 'XTZ',
    name: 'Tezos',
    description: 'Self-amending blockchain platform',
    network: 'TEZOS',
    category: 'layer1',
    icon: 'xtz.svg',
    enabled: true,
    sortOrder: 16,
  },

  // ========================================
  // LAYER 2 SOLUTIONS
  // ========================================
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    description: 'Ethereum scaling solution',
    network: 'POLYGON',
    category: 'layer2',
    icon: 'matic.svg',
    enabled: false, // Disabled: No wallet address configured
    sortOrder: 11,
  },

  // ========================================
  // STABLECOINS
  // ========================================
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    description: 'US Dollar stablecoin',
    network: 'ETHEREUM',
    category: 'stablecoin',
    icon: 'usdc.svg',
    enabled: true,
    sortOrder: 4,
    isPopular: true,
  },

  // ========================================
  // DEFI TOKENS
  // ========================================
  AAVE: {
    symbol: 'AAVE',
    name: 'Aave',
    description: 'DeFi lending protocol token',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'aave.svg',
    enabled: true,
    sortOrder: 20,
  },

  UNI: {
    symbol: 'UNI',
    name: 'Uniswap',
    description: 'Decentralized exchange token',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'uni.svg',
    enabled: true,
    sortOrder: 21,
  },

  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    description: 'Decentralized oracle network',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'link.svg',
    enabled: true,
    sortOrder: 22,
  },

  COMP: {
    symbol: 'COMP',
    name: 'Compound',
    description: 'DeFi lending protocol token',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'comp.svg',
    enabled: true,
    sortOrder: 23,
  },

  CRV: {
    symbol: 'CRV',
    name: 'Curve DAO',
    description: 'DeFi stablecoin exchange token',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'crv.svg',
    enabled: true,
    sortOrder: 24,
  },

  ONDO: {
    symbol: 'ONDO',
    name: 'Ondo',
    description: 'Institutional-grade DeFi protocol',
    network: 'ETHEREUM',
    category: 'defi',
    icon: 'ondo.svg',
    enabled: true,
    sortOrder: 25,
  },

  // ========================================
  // MEME COINS
  // ========================================
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    description: 'Original meme cryptocurrency',
    network: 'DOGECOIN',
    category: 'meme',
    icon: 'doge.svg',
    enabled: true,
    sortOrder: 30,
  },

  SHIB: {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    description: 'Ethereum-based meme token',
    network: 'ETHEREUM',
    category: 'meme',
    icon: 'shib.svg',
    enabled: true,
    sortOrder: 31,
  },

  PEPE: {
    symbol: 'PEPE',
    name: 'Pepecoin',
    description: 'Internet meme cryptocurrency',
    network: 'ETHEREUM',
    category: 'meme',
    icon: 'pepe.svg',
    enabled: true,
    sortOrder: 32,
  },

  FLOKI: {
    symbol: 'FLOKI',
    name: 'Floki',
    description: 'Community-driven meme token',
    network: 'ETHEREUM',
    category: 'meme',
    icon: 'floki.svg',
    enabled: true,
    sortOrder: 33,
  },

  BONK: {
    symbol: 'BONK',
    name: 'BONK',
    description: 'Solana-based community meme token',
    network: 'SOLANA',
    category: 'meme',
    icon: 'bonk.svg',
    enabled: true,
    sortOrder: 34,
  },

  MOODENG: {
    symbol: 'MOODENG',
    name: 'Moo Deng',
    description: 'Viral Solana meme token',
    network: 'SOLANA',
    category: 'meme',
    icon: 'moodeng.svg',
    enabled: true,
    sortOrder: 35,
  },

  // ========================================
  // OTHER TOKENS
  // ========================================
  TRUMP: {
    symbol: 'TRUMP',
    name: 'OFFICIAL TRUMP',
    description: 'Political-themed cryptocurrency',
    network: 'ETHEREUM',
    category: 'other',
    icon: 'trump.svg',
    enabled: true,
    sortOrder: 40,
  },

  VIRTUAL: {
    symbol: 'VIRTUAL',
    name: 'Virtuals Protocol',
    description: 'Virtual reality protocol token',
    network: 'ETHEREUM',
    category: 'other',
    icon: 'virtual.svg',
    enabled: true,
    sortOrder: 41,
  },

  WLFI: {
    symbol: 'WLFI',
    name: 'World Liberty Financial',
    description: 'DeFi financial protocol',
    network: 'ETHEREUM',
    category: 'other',
    icon: 'wlfi.svg',
    enabled: true,
    sortOrder: 42,
  },
}

/**
 * Get metadata for a specific asset
 */
export function getAssetMetadata(symbol: string): AssetMetadata | undefined {
  return ASSET_METADATA[symbol]
}

/**
 * Get all enabled assets
 */
export function getEnabledAssets(): AssetMetadata[] {
  return Object.values(ASSET_METADATA).filter((asset) => asset.enabled)
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: AssetCategory): AssetMetadata[] {
  return Object.values(ASSET_METADATA)
    .filter((asset) => asset.category === category && asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get popular assets
 */
export function getPopularAssets(): AssetMetadata[] {
  return Object.values(ASSET_METADATA)
    .filter((asset) => asset.isPopular && asset.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Search assets by name or symbol
 */
export function searchAssets(query: string): AssetMetadata[] {
  const lowercaseQuery = query.toLowerCase()
  return Object.values(ASSET_METADATA)
    .filter(
      (asset) =>
        asset.enabled &&
        (asset.symbol.toLowerCase().includes(lowercaseQuery) ||
          asset.name.toLowerCase().includes(lowercaseQuery)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<AssetCategory, { name: string; description: string }> = {
  layer1: {
    name: 'Layer 1 Blockchains',
    description: 'Original blockchain networks',
  },
  layer2: {
    name: 'Layer 2 Solutions',
    description: 'Scaling solutions for existing blockchains',
  },
  stablecoin: {
    name: 'Stablecoins',
    description: 'Cryptocurrencies pegged to stable assets',
  },
  defi: {
    name: 'DeFi Tokens',
    description: 'Decentralized finance protocols',
  },
  meme: {
    name: 'Meme Coins',
    description: 'Community-driven cryptocurrencies',
  },
  other: {
    name: 'Other Assets',
    description: 'Additional supported cryptocurrencies',
  },
}

