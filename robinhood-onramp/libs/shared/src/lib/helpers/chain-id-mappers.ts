/**
 * Chain ID Mappers - Expanded for Robinhood Connect Support
 *
 * This file demonstrates the necessary expansions to:
 * /Users/rheeger/Code/endaoment/endaoment-backend/libs/api/config/src/lib/helpers/chain-id-mappers.ts
 *
 * to support all networks available via Robinhood Connect, including non-EVM chains.
 */

import type { RobinhoodNetwork } from '@/libs/robinhood/lib/types'

/**
 * Extended type to support both EVM chain IDs and network identifiers
 */
export type SupportedChainId =
  // Existing backend chain IDs (EVM)
  | 31337 // Local
  | 31338 // Alternative Local
  | 1 // Mainnet (Ethereum)
  | 10 // OP Mainnet
  | 11155111 // Sepolia
  | 420 // Optimism Goerli
  | 42161 // Arbitrum One
  | 421613 // Arbitrum Goerli
  | 137 // Polygon
  | 42220 // Celo
  | 44787 // Celo Alfajores
  | 100 // Gnosis
  | 1284 // Moonbeam
  | 56 // Binance Smart Chain
  | 43114 // Avalanche
  | 84531 // Base Goerli
  | 84532 // Base Sepolia
  | 8453 // Base
  // New Robinhood-supported EVM chains
  | 7777777 // Zora
  | 61 // Ethereum Classic

/**
 * Network name type for non-EVM chains
 * Used when chain ID doesn't apply
 */
export type NetworkIdentifier = RobinhoodNetwork

/**
 * EXISTING BACKEND MAPPINGS (unchanged)
 * Explorer URLs for EVM chains by chain ID
 */
const mapSupportedChainIdUrl: Partial<Record<SupportedChainId, string>> = {
  31337: 'https://etherscan.io',
  31338: 'https://etherscan.io',
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  420: 'https://goerli-optimistic.etherscan.io',
  42161: 'https://arbiscan.io',
  421613: 'https://goerli.arbiscan.io',
  137: 'https://polygonscan.com',
  42220: 'https://explorer.celo.org',
  44787: 'https://alfajores-blockscout.celo-testnet.org',
  100: 'https://blockscout.com/xdai/mainnet',
  1284: 'https://moonbeam-explorer.netlify.app',
  56: 'https://bscscan.com',
  43114: 'https://snowtrace.io',
  84531: 'https://goerli.basescan.org',
  84532: 'https://sepolia.basescan.org',
  8453: 'https://basescan.org',
}

/**
 * EXISTING BACKEND MAPPINGS (unchanged)
 * Chain names for EVM chains by chain ID
 */
const mapSupportedChainIdName: Partial<Record<SupportedChainId, string>> = {
  31337: 'Local',
  31338: 'Alternative Local',
  1: 'Mainnet',
  10: 'OP Mainnet',
  11155111: 'Sepolia',
  420: 'Optimism Goerli',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
  137: 'Polygon',
  42220: 'Celo',
  44787: 'Celo Alfajores',
  100: 'Gnosis',
  1284: 'Moonbeam',
  56: 'Binance Smart Chain',
  43114: 'Avalanche',
  84531: 'Base Goerli',
  84532: 'Base Sepolia',
  8453: 'Base',
}

/**
 * NEW: Additional Robinhood-supported EVM chains
 * These would be added to the existing backend mappings
 */
const additionalRobinhoodEvmChainUrls: Partial<Record<SupportedChainId, string>> = {
  7777777: 'https://explorer.zora.energy',
  61: 'https://blockscout.com/etc/mainnet',
}

const additionalRobinhoodEvmChainNames: Partial<Record<SupportedChainId, string>> = {
  7777777: 'Zora',
  61: 'Ethereum Classic',
}

/**
 * NEW: Network to Chain ID mapping for Robinhood Connect
 * Maps network names to EVM chain IDs where applicable
 */
const mapNetworkToChainId: Partial<Record<RobinhoodNetwork, SupportedChainId>> = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  ZORA: 7777777,
  AVALANCHE: 43114,
  ETHEREUM_CLASSIC: 61,
}

/**
 * NEW: Non-EVM network explorer URLs
 * For networks that don't have chain IDs
 */
const mapNonEvmNetworkUrl: Partial<Record<RobinhoodNetwork, string>> = {
  BITCOIN: 'https://blockchair.com/bitcoin',
  BITCOIN_CASH: 'https://blockchair.com/bitcoin-cash',
  LITECOIN: 'https://blockchair.com/litecoin',
  DOGECOIN: 'https://blockchair.com/dogecoin',
  CARDANO: 'https://cardanoscan.io',
  SOLANA: 'https://solscan.io',
  STELLAR: 'https://stellarchain.io',
  SUI: 'https://suiscan.xyz',
  TEZOS: 'https://tzkt.io',
  TONCOIN: 'https://tonscan.org',
  XRP: 'https://xrpscan.com',
  HEDERA: 'https://hashscan.io',
}

/**
 * NEW: Non-EVM network display names
 */
const mapNonEvmNetworkName: Record<RobinhoodNetwork, string> = {
  // EVM networks (for completeness)
  ETHEREUM: 'Ethereum',
  POLYGON: 'Polygon',
  ARBITRUM: 'Arbitrum One',
  OPTIMISM: 'OP Mainnet',
  BASE: 'Base',
  ZORA: 'Zora',
  AVALANCHE: 'Avalanche C-Chain',
  ETHEREUM_CLASSIC: 'Ethereum Classic',

  // Non-EVM networks
  BITCOIN: 'Bitcoin',
  BITCOIN_CASH: 'Bitcoin Cash',
  LITECOIN: 'Litecoin',
  DOGECOIN: 'Dogecoin',
  CARDANO: 'Cardano',
  SOLANA: 'Solana',
  STELLAR: 'Stellar',
  SUI: 'Sui',
  TEZOS: 'Tezos',
  TONCOIN: 'TON',
  XRP: 'XRP Ledger',
  HEDERA: 'Hedera',
}

/**
 * EXISTING BACKEND FUNCTION (unchanged)
 * Get explorer URL for a chain ID
 */
export const mapSupportedChainIdToExplorerUrl = (chainId: SupportedChainId): string | undefined => {
  return mapSupportedChainIdUrl[chainId] || additionalRobinhoodEvmChainUrls[chainId]
}

/**
 * EXISTING BACKEND FUNCTION (unchanged)
 * Get chain name for a chain ID
 */
export const mapSupportedChainIdToName = (chainId: SupportedChainId): string | undefined => {
  return mapSupportedChainIdName[chainId] || additionalRobinhoodEvmChainNames[chainId]
}

/**
 * EXISTING BACKEND FUNCTION (unchanged)
 * Build transaction URL for EVM chains
 */
export const buildChainTxUrl = (chainId: SupportedChainId, tx: string): string => {
  return `${mapSupportedChainIdToExplorerUrl(chainId)}/tx/${tx}`
}

/**
 * EXISTING BACKEND FUNCTION (unchanged)
 * Build contract URL for EVM chains
 */
export const buildChainContractUrl = (chainId: SupportedChainId, contract: string): string => {
  return `${mapSupportedChainIdToExplorerUrl(chainId)}/address/${contract}`
}

/**
 * NEW: Get explorer URL for any network (EVM or non-EVM)
 * Extends the backend's functionality to support all Robinhood networks
 */
export const mapNetworkToExplorerUrl = (network: RobinhoodNetwork): string | undefined => {
  // Try to get chain ID for EVM networks
  const chainId = mapNetworkToChainId[network]
  if (chainId) {
    return mapSupportedChainIdToExplorerUrl(chainId)
  }

  // Fallback to non-EVM network mapping
  return mapNonEvmNetworkUrl[network]
}

/**
 * NEW: Get display name for any network
 */
export const mapNetworkToName = (network: RobinhoodNetwork): string => {
  return mapNonEvmNetworkName[network]
}

/**
 * NEW: Get chain ID for a network (if EVM)
 */
export const mapNetworkToChainIdValue = (network: RobinhoodNetwork): SupportedChainId | undefined => {
  return mapNetworkToChainId[network]
}

/**
 * NEW: Check if network is EVM-compatible
 */
export const isEvmNetwork = (network: RobinhoodNetwork): boolean => {
  return mapNetworkToChainId[network] !== undefined
}

/**
 * NEW: Build transaction URL for any network
 * Handles different URL patterns for different explorers
 */
export const buildNetworkTxUrl = (network: RobinhoodNetwork, txHash: string): string => {
  const baseUrl = mapNetworkToExplorerUrl(network)
  if (!baseUrl) {
    throw new Error(`No explorer URL configured for network: ${network}`)
  }

  // Different explorers use different URL patterns
  switch (network) {
    // Bitcoin-like chains use /transaction/
    case 'BITCOIN':
    case 'BITCOIN_CASH':
    case 'LITECOIN':
    case 'DOGECOIN':
      return `${baseUrl}/transaction/${txHash}`

    // Stellar uses /tx/
    case 'STELLAR':
      return `${baseUrl}/tx/${txHash}`

    // Tezos uses root path
    case 'TEZOS':
      return `${baseUrl}/${txHash}`

    // Sui, Solana, TON use /tx/
    case 'SUI':
    case 'TONCOIN':
      return `${baseUrl}/tx/${txHash}`

    // Hedera uses /mainnet/transaction/
    case 'HEDERA':
      return `${baseUrl}/mainnet/transaction/${txHash}`

    // Default: EVM networks and others use /tx/
    default:
      return `${baseUrl}/tx/${txHash}`
  }
}

/**
 * NEW: Build address URL for any network
 */
export const buildNetworkAddressUrl = (network: RobinhoodNetwork, address: string): string => {
  const baseUrl = mapNetworkToExplorerUrl(network)
  if (!baseUrl) {
    throw new Error(`No explorer URL configured for network: ${network}`)
  }

  // Different explorers use different URL patterns
  switch (network) {
    // Most blockchair instances use /address/
    case 'BITCOIN':
    case 'BITCOIN_CASH':
    case 'LITECOIN':
    case 'DOGECOIN':
      return `${baseUrl}/address/${address}`

    // Stellar uses /account/
    case 'STELLAR':
      return `${baseUrl}/account/${address}`

    // Tezos uses root path
    case 'TEZOS':
      return `${baseUrl}/${address}`

    // Sui uses /account/
    case 'SUI':
      return `${baseUrl}/account/${address}`

    // TON uses /address/
    case 'TONCOIN':
      return `${baseUrl}/address/${address}`

    // Hedera uses /mainnet/account/
    case 'HEDERA':
      return `${baseUrl}/mainnet/account/${address}`

    // Cardano uses /address/
    case 'CARDANO':
      return `${baseUrl}/address/${address}`

    // Default: EVM networks use /address/
    default:
      return `${baseUrl}/address/${address}`
  }
}

/**
 * NEW: Build token URL for EVM networks only
 * Extends buildChainContractUrl to work with network names
 */
export const buildNetworkTokenUrl = (network: RobinhoodNetwork, tokenAddress: string): string => {
  const chainId = mapNetworkToChainIdValue(network)
  if (!chainId) {
    throw new Error(`Token URLs are only supported for EVM networks. Got: ${network}`)
  }

  return `${mapSupportedChainIdToExplorerUrl(chainId)}/token/${tokenAddress}`
}

/**
 * NEW: Get network native token symbol
 * Useful for displaying gas token info
 */
export const getNetworkSymbol = (network: RobinhoodNetwork): string => {
  const symbolMap: Record<RobinhoodNetwork, string> = {
    ETHEREUM: 'ETH',
    POLYGON: 'MATIC',
    ARBITRUM: 'ARB',
    OPTIMISM: 'OP',
    BASE: 'ETH',
    ZORA: 'ETH',
    AVALANCHE: 'AVAX',
    ETHEREUM_CLASSIC: 'ETC',
    BITCOIN: 'BTC',
    BITCOIN_CASH: 'BCH',
    LITECOIN: 'LTC',
    DOGECOIN: 'DOGE',
    CARDANO: 'ADA',
    SOLANA: 'SOL',
    STELLAR: 'XLM',
    SUI: 'SUI',
    TEZOS: 'XTZ',
    TONCOIN: 'TON',
    XRP: 'XRP',
    HEDERA: 'HBAR',
  }

  return symbolMap[network]
}
