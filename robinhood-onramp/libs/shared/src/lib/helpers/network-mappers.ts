import type { RobinhoodNetwork } from '@/libs/robinhood/lib/types'

/**
 * Network to Block Explorer URL mapping
 * Includes all networks supported by Robinhood Connect
 */
const NETWORK_EXPLORER_URLS: Partial<Record<RobinhoodNetwork, string>> = {
  // EVM Networks
  ETHEREUM: 'https://etherscan.io',
  POLYGON: 'https://polygonscan.com',
  ARBITRUM: 'https://arbiscan.io',
  OPTIMISM: 'https://optimistic.etherscan.io',
  BASE: 'https://basescan.org',
  ZORA: 'https://explorer.zora.energy',
  AVALANCHE: 'https://snowtrace.io',
  ETHEREUM_CLASSIC: 'https://blockscout.com/etc/mainnet',

  // Layer 1 Networks (Non-EVM)
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
 * Network to display name mapping
 */
const mapNetworkToDisplayName: Record<RobinhoodNetwork, string> = {
  // EVM Networks
  ETHEREUM: 'Ethereum',
  POLYGON: 'Polygon',
  ARBITRUM: 'Arbitrum One',
  OPTIMISM: 'OP Mainnet',
  BASE: 'Base',
  ZORA: 'Zora',
  AVALANCHE: 'Avalanche C-Chain',
  ETHEREUM_CLASSIC: 'Ethereum Classic',

  // Layer 1 Networks (Non-EVM)
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
 * Chain ID mapping for EVM networks
 * Source: https://chainlist.org/
 */
const mapNetworkToChainId: Partial<Record<RobinhoodNetwork, number>> = {
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
 * Get block explorer URL for a network
 */
export const mapNetworkToExplorerUrl = (network: RobinhoodNetwork): string | undefined => {
  return NETWORK_EXPLORER_URLS[network]
}

/**
 * Get display name for a network
 */
export const mapNetworkToName = (network: RobinhoodNetwork): string => {
  return mapNetworkToDisplayName[network]
}

/**
 * Get chain ID for EVM networks
 */
export const mapNetworkToChainIdValue = (network: RobinhoodNetwork): number | undefined => {
  return mapNetworkToChainId[network]
}

/**
 * Check if network is EVM-compatible
 */
export const isEvmNetwork = (network: RobinhoodNetwork): boolean => {
  return mapNetworkToChainId[network] !== undefined
}

/**
 * Build transaction URL for a network
 */
export const buildNetworkTxUrl = (network: RobinhoodNetwork, txHash: string): string => {
  const baseUrl = NETWORK_EXPLORER_URLS[network]
  if (!baseUrl) {
    throw new Error(`No explorer URL configured for network: ${network}`)
  }

  // Different explorers use different URL patterns
  switch (network) {
    case 'BITCOIN':
    case 'BITCOIN_CASH':
    case 'LITECOIN':
    case 'DOGECOIN':
      return `${baseUrl}/transaction/${txHash}`
    case 'STELLAR':
      return `${baseUrl}/tx/${txHash}`
    case 'TEZOS':
      return `${baseUrl}/${txHash}`
    case 'SUI':
      return `${baseUrl}/tx/${txHash}`
    case 'TONCOIN':
      return `${baseUrl}/tx/${txHash}`
    case 'HEDERA':
      return `${baseUrl}/mainnet/transaction/${txHash}`
    default:
      // EVM networks and others use /tx/
      return `${baseUrl}/tx/${txHash}`
  }
}

/**
 * Build address URL for a network
 */
export const buildNetworkAddressUrl = (network: RobinhoodNetwork, address: string): string => {
  const baseUrl = NETWORK_EXPLORER_URLS[network]
  if (!baseUrl) {
    throw new Error(`No explorer URL configured for network: ${network}`)
  }

  // Different explorers use different URL patterns
  switch (network) {
    case 'BITCOIN':
    case 'BITCOIN_CASH':
    case 'LITECOIN':
    case 'DOGECOIN':
      return `${baseUrl}/address/${address}`
    case 'STELLAR':
      return `${baseUrl}/account/${address}`
    case 'TEZOS':
      return `${baseUrl}/${address}`
    case 'SUI':
      return `${baseUrl}/account/${address}`
    case 'TONCOIN':
      return `${baseUrl}/address/${address}`
    case 'HEDERA':
      return `${baseUrl}/mainnet/account/${address}`
    case 'CARDANO':
      return `${baseUrl}/address/${address}`
    default:
      // EVM networks and others use /address/
      return `${baseUrl}/address/${address}`
  }
}

/**
 * Build token URL for EVM networks
 */
export const buildNetworkTokenUrl = (network: RobinhoodNetwork, tokenAddress: string): string => {
  if (!isEvmNetwork(network)) {
    throw new Error(`Token URLs are only supported for EVM networks. Got: ${network}`)
  }

  const baseUrl = NETWORK_EXPLORER_URLS[network]
  if (!baseUrl) {
    throw new Error(`No explorer URL configured for network: ${network}`)
  }

  return `${baseUrl}/token/${tokenAddress}`
}

/**
 * Get all supported networks with explorer URLs
 */
export const getSupportedExplorerNetworks = (): RobinhoodNetwork[] => {
  return Object.keys(NETWORK_EXPLORER_URLS) as RobinhoodNetwork[]
}

/**
 * Get network symbol/ticker (for display purposes)
 * Examples: ETH, BTC, SOL, etc.
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
