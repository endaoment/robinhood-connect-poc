/**
 * Coinbase Prime Configuration
 */

export const PRIME_PORTFOLIO_ID = process.env.COINBASE_PRIME_PORTFOLIO_ID || ''

export const SUPPORTED_PRIME_NETWORKS = [
  'ETHEREUM',
  'POLYGON',
  'BASE',
  'BITCOIN',
  'SOLANA',
  'ARBITRUM',
  'OPTIMISM',
  'AVALANCHE',
] as const

export type SupportedPrimeNetwork = (typeof SUPPORTED_PRIME_NETWORKS)[number]

