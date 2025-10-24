import type { RobinhoodNetwork } from '../types'

/**
 * All networks supported by Robinhood Connect
 * Source: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */
export const ALL_ROBINHOOD_NETWORKS: readonly RobinhoodNetwork[] = [
  'ARBITRUM',
  'AVALANCHE',
  'BASE',
  'BITCOIN',
  'BITCOIN_CASH',
  'CARDANO',
  'DOGECOIN',
  'ETHEREUM',
  'ETHEREUM_CLASSIC',
  'HEDERA',
  'LITECOIN',
  'OPTIMISM',
  'POLYGON',
  'SOLANA',
  'STELLAR',
  'SUI',
  'TEZOS',
  'TONCOIN',
  'XRP',
  'ZORA',
] as const

/**
 * Networks officially supported by Robinhood Connect onramp API
 * Updated based on actual Discovery API results
 */
export const ROBINHOOD_CONNECT_SUPPORTED_NETWORKS: readonly RobinhoodNetwork[] = [
  'ARBITRUM', // Layer 2
  'AVALANCHE', // Layer 1
  'BASE', // Layer 2
  'BITCOIN', // Layer 1
  'BITCOIN_CASH', // Layer 1
  'CARDANO', // Layer 1
  'DOGECOIN', // Layer 1
  'ETHEREUM', // Layer 1
  'ETHEREUM_CLASSIC', // Layer 1
  'LITECOIN', // Layer 1
  'OPTIMISM', // Layer 2
  'POLYGON', // Layer 2
  'SOLANA', // Layer 1
  'STELLAR', // Layer 1
  'SUI', // Layer 1
  'TEZOS', // Layer 1
  'TONCOIN', // Layer 1
  'ZORA', // Layer 2
] as const

/**
 * Networks that require a memo/tag field for deposits
 */
export const NETWORKS_REQUIRING_MEMO: readonly RobinhoodNetwork[] = [
  'STELLAR', // XLM - memo required
  'XRP', // XRP - destination tag required
  'HEDERA', // HBAR - memo required
] as const

/**
 * EVM-compatible networks (use chainId + 0x addresses)
 */
export const EVM_NETWORKS: readonly RobinhoodNetwork[] = [
  'ETHEREUM',
  'POLYGON',
  'ARBITRUM',
  'OPTIMISM',
  'BASE',
  'ZORA',
  'AVALANCHE',
  'ETHEREUM_CLASSIC',
] as const

/**
 * Chain ID mapping for EVM networks
 * Source: https://chainlist.org/
 */
export const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  ZORA: 7777777,
  AVALANCHE: 43114, // C-Chain
  ETHEREUM_CLASSIC: 61,
} as const

/**
 * Check if a network is EVM-compatible
 */
export function isEvmNetwork(network: RobinhoodNetwork): boolean {
  return EVM_NETWORKS.includes(network)
}

/**
 * Check if a network requires a memo
 */
export function requiresMemo(network: RobinhoodNetwork): boolean {
  return NETWORKS_REQUIRING_MEMO.includes(network)
}

/**
 * Get chain ID for EVM network
 */
export function getChainId(network: RobinhoodNetwork): number | undefined {
  return NETWORK_TO_CHAIN_ID[network]
}
