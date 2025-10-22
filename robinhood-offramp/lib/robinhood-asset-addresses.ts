/**
 * Coinbase Prime Deposit Addresses for ALL Robinhood Transfer-Eligible Assets
 *
 * This file contains deposit addresses for every asset that can be transferred
 * via Robinhood Connect. Each asset has its own unique Coinbase Prime Trading
 * Balance wallet address.
 *
 * Coverage: 32/38 assets (84.2%)
 * - 27 assets with dedicated Coinbase Prime Trading Balance wallets
 * - 5 assets using fallback Ethereum address
 * - 6 assets still missing (5 Solana meme coins + TON)
 *
 * Source: https://robinhood.com/us/en/support/articles/crypto-transfers/
 * Generated: October 20, 2025
 */

export interface AssetAddress {
  address: string
  memo?: string
  note?: string
}

export const ROBINHOOD_ASSET_ADDRESSES: Record<string, AssetAddress> = {
  // ========================================
  // Major Layer 1 Blockchains
  // ========================================
  BTC: { address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC' }, // Bitcoin
  ETH: { address: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e' }, // Ethereum
  SOL: { address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1' }, // Solana
  ADA: { address: 'addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt' }, // Cardano
  AVAX: { address: '0x2063115a37f55c19cA60b9d1eca2378De00CD79b' }, // Avalanche
  XRP: { address: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34', memo: '2237695492' }, // XRP
  XLM: { address: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5', memo: '1380611530' }, // Stellar
  SUI: { address: '0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2' }, // Sui
  XTZ: { address: 'tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV' }, // Tezos
  DOGE: { address: 'DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7' }, // Dogecoin
  LTC: { address: 'MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK' }, // Litecoin
  BCH: { address: 'qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q' }, // Bitcoin Cash
  ETC: { address: '0x269285683a921dbce6fcb21513b06998f8fbbc99' }, // Ethereum Classic
  HBAR: { address: '0.0.5006230', memo: '904278439' }, // Hedera

  // ========================================
  // Layer 2 Networks
  // ========================================
  ARB: { address: '0x6931a51e15763C4d8da468cbF7C51323d96F2e80' }, // Arbitrum
  OP: { address: '0xE006aBC90950DB9a81A3812502D0b031FaAf28D8' }, // Optimism
  ZORA: { address: '0x407506929b5C58992987609539a1D424f2305Cc3' }, // Zora

  // ========================================
  // Stablecoins
  // ========================================
  USDC: { address: '0xd71a079cb64480334ffb400f017a0dde94f553dd' }, // USD Coin (multi-network)

  // ========================================
  // DeFi Tokens (Ethereum)
  // ========================================
  AAVE: { address: '0x0788702c7d70914f34b82fb6ad0b405263a00486' }, // Aave
  LINK: { address: '0xcf26c0f23e566b42251bc0cf680c8999def1d7f0' }, // Chainlink
  COMP: { address: '0x944bff154f0486b6c834c5607978b45ffc264902' }, // Compound
  CRV: { address: '0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d' }, // Curve DAO
  UNI: { address: '0x396b24e9137befef326af9fdba92d95dd124d5d4' }, // Uniswap
  ONDO: { address: '0x894f85323110a0a8883b22b18f26864882c3c63e' }, // Ondo

  // ========================================
  // Meme Coins - Ethereum
  // ========================================
  SHIB: { address: '0x263dcd3e749b1f00c3998b5a0f14e3255658803b' }, // Shiba Inu
  PEPE: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2', note: 'Fallback address' }, // Pepecoin
  FLOKI: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2', note: 'Fallback address' }, // Floki
  TRUMP: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2', note: 'Fallback address' }, // OFFICIAL TRUMP
  VIRTUAL: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2', note: 'Fallback address' }, // Virtuals Protocol
  WLFI: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2', note: 'Fallback address' }, // World Liberty Financial

  // ========================================
  // Meme Coins - Solana
  // ========================================
  BONK: { address: 'puNRXZc4qEYWdUjmx68Lcb87DobBpgZQPdTndoS4U5B' }, // BONK
  MOODENG: { address: 'Fd4ir2iU6H8kaYvTbAwXmrdjo6JPt7ABo7b5poCTpAsE' }, // Moo Deng
  // MEW: Missing - needs Trading Balance wallet
  // PENGU: Missing - needs Trading Balance wallet
  // PNUT: Missing - needs Trading Balance wallet
  // POPCAT: Missing - needs Trading Balance wallet
  // WIF: Missing - needs Trading Balance wallet

  // ========================================
  // Other Networks
  // ========================================
  // TON: Missing - needs TON network wallet
}

/**
 * Assets that are transfer-eligible on Robinhood but don't have addresses configured yet
 */
export const MISSING_ROBINHOOD_ASSETS = [
  'MEW', // cat in a dogs world (Solana)
  'PENGU', // Pudgy Penguins (Solana)
  'PNUT', // Peanut the Squirrel (Solana)
  'POPCAT', // Popcat (Solana)
  'WIF', // Dogwifhat (Solana)
  'TON', // Toncoin (TON network)
] as const

/**
 * Get deposit address for a specific asset
 * @param assetCode - The asset symbol (e.g., 'BTC', 'ETH', 'USDC')
 * @returns Address info with optional memo
 * @throws Error if asset not supported
 */
export function getAssetDepositAddress(assetCode: string): AssetAddress {
  const asset = ROBINHOOD_ASSET_ADDRESSES[assetCode]

  if (!asset) {
    if (MISSING_ROBINHOOD_ASSETS.includes(assetCode as any)) {
      throw new Error(
        `${assetCode} is transfer-eligible on Robinhood but doesn't have a configured deposit address yet. ` +
          `Please contact support.`,
      )
    }
    throw new Error(`${assetCode} is not a transfer-eligible asset on Robinhood. ` + `Please select a different asset.`)
  }

  return asset
}

/**
 * Check if an asset is supported for transfers
 * @param assetCode - The asset symbol
 * @returns true if asset has a deposit address configured
 */
export function isAssetSupported(assetCode: string): boolean {
  return assetCode in ROBINHOOD_ASSET_ADDRESSES
}

/**
 * Get list of all supported asset codes
 * @returns Array of asset symbols that have addresses configured
 */
export function getSupportedAssets(): string[] {
  return Object.keys(ROBINHOOD_ASSET_ADDRESSES)
}

/**
 * Networks officially supported by Robinhood Connect offramp
 * Source: Robinhood Connect API documentation (confirmed Oct 22, 2025)
 */
const ROBINHOOD_CONNECT_SUPPORTED_NETWORKS = [
  'AVALANCHE',
  'BITCOIN',
  'BITCOIN_CASH',
  'DOGECOIN',
  'ETHEREUM',
  'ETHEREUM_CLASSIC',
  'LITECOIN',
  'POLYGON',
  'SOLANA',
  'STELLAR',
  'TEZOS',
] as const

/**
 * Get list of networks supported by Robinhood Connect offramp
 * Only returns the 11 officially supported networks (confirmed Oct 22, 2025)
 * @returns Array of network names supported by Robinhood Connect
 */
export function getSupportedNetworks(): string[] {
  return [...ROBINHOOD_CONNECT_SUPPORTED_NETWORKS]
}

/**
 * Map assets to their networks
 */
const ASSET_NETWORK_MAP: Record<string, string> = {
  // Supported networks
  BTC: 'BITCOIN',
  BCH: 'BITCOIN_CASH',
  LTC: 'LITECOIN',
  DOGE: 'DOGECOIN',
  ETH: 'ETHEREUM',
  ETC: 'ETHEREUM_CLASSIC',
  AVAX: 'AVALANCHE',
  MATIC: 'POLYGON',
  SOL: 'SOLANA',
  BONK: 'SOLANA',
  MOODENG: 'SOLANA',
  XLM: 'STELLAR',
  XTZ: 'TEZOS',

  // Unsupported networks (have addresses but not in Connect)
  ARB: 'ARBITRUM',
  OP: 'OPTIMISM',
  ZORA: 'ZORA',
  ADA: 'CARDANO',
  SUI: 'SUI',
  HBAR: 'HEDERA',
  XRP: 'XRP',

  // ERC-20 tokens on Ethereum (supported)
  AAVE: 'ETHEREUM',
  LINK: 'ETHEREUM',
  COMP: 'ETHEREUM',
  CRV: 'ETHEREUM',
  UNI: 'ETHEREUM',
  ONDO: 'ETHEREUM',
  USDC: 'ETHEREUM',
  SHIB: 'ETHEREUM',
  PEPE: 'ETHEREUM',
  FLOKI: 'ETHEREUM',
  TRUMP: 'ETHEREUM',
  VIRTUAL: 'ETHEREUM',
  WLFI: 'ETHEREUM',
}

/**
 * Get the network for a specific asset
 */
export function getAssetNetwork(assetCode: string): string {
  return ASSET_NETWORK_MAP[assetCode] || 'ETHEREUM'
}

/**
 * Check if an asset is on a Robinhood Connect supported network
 */
export function isAssetNetworkSupported(assetCode: string): boolean {
  const network = getAssetNetwork(assetCode)
  return ROBINHOOD_CONNECT_SUPPORTED_NETWORKS.includes(network as any)
}

/**
 * Get assets grouped by network support status
 */
export function getAssetsByNetworkSupport(): {
  supported: string[]
  unsupported: string[]
} {
  const allAssets = getSupportedAssets()
  const supported: string[] = []
  const unsupported: string[] = []

  allAssets.forEach((asset) => {
    if (isAssetNetworkSupported(asset)) {
      supported.push(asset)
    } else {
      unsupported.push(asset)
    }
  })

  return { supported, unsupported }
}

/**
 * Validate asset code and address format
 * @param assetCode - The asset symbol
 * @throws Error if asset not supported or address invalid
 */
export function validateAssetAddress(assetCode: string): void {
  const asset = getAssetDepositAddress(assetCode)

  if (!asset.address || asset.address.length === 0) {
    throw new Error(`Invalid address configuration for ${assetCode}`)
  }

  // Basic format validation
  if (asset.address.includes('PLACEHOLDER') || asset.address.includes('YOUR_')) {
    throw new Error(`Deposit address not properly configured for ${assetCode}`)
  }
}

/**
 * Build a mapping of assets to their wallet addresses for Robinhood Connect
 * This allows the user to select from their balances, and we provide the correct address
 * @returns Object mapping asset codes to {network, address, memo}
 */
export function buildAssetAddressMapping(): Record<
  string,
  { network: string; address: string; memo?: string }
> {
  const mapping: Record<string, { network: string; address: string; memo?: string }> = {}

  const supportedAssets = getSupportedAssets()

  for (const assetCode of supportedAssets) {
    // Only include assets on Robinhood Connect supported networks
    if (isAssetNetworkSupported(assetCode)) {
      const assetInfo = ROBINHOOD_ASSET_ADDRESSES[assetCode]
      const network = getAssetNetwork(assetCode)

      mapping[assetCode] = {
        network,
        address: assetInfo.address,
        ...(assetInfo.memo && { memo: assetInfo.memo }),
      }
    }
  }

  return mapping
}
