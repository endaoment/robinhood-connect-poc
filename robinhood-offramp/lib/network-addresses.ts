import type { SupportedNetwork } from '@/types/robinhood'

/**
 * Pre-configured deposit addresses for each supported blockchain network.
 *
 * ⚠️ COINBASE PRIME INTEGRATION
 * These addresses connect to Coinbase Prime wallets with automated liquidation infrastructure.
 * Each network has its own unique Prime address for proper tracking and settlement.
 *
 * Complete address format reference: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */
export const NETWORK_DEPOSIT_ADDRESSES: Record<SupportedNetwork, string> = {
  // ========================================
  // EVM-Compatible Networks (L1 & L2)
  // ========================================
  // Trading Balance wallet addresses from Coinbase Prime
  ETHEREUM: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e', // CB Prime ETH Trading Balance
  POLYGON: '0x11362ec5cc119448225abbbb1c9c67e22e776cdd', // CB Prime POL Trading Balance
  ARBITRUM: '0x6931a51e15763C4d8da468cbF7C51323d96F2e80', // CB Prime ARB Trading Balance
  BASE: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e', // CB Prime Base (same as ETH - ETH is reserve asset)
  OPTIMISM: '0xE006aBC90950DB9a81A3812502D0b031FaAf28D8', // CB Prime OP Trading Balance
  ZORA: '0x407506929b5C58992987609539a1D424f2305Cc3', // CB Prime ZORA Trading Balance
  AVALANCHE: '0x2063115a37f55c19cA60b9d1eca2378De00CD79b', // CB Prime AVAX Trading Balance
  ETHEREUM_CLASSIC: '0x269285683a921dbce6fcb21513b06998f8fbbc99', // CB Prime ETC Trading Balance

  // ========================================
  // Bitcoin-like Networks
  // ========================================
  BITCOIN: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC', // CB Prime BTC Trading Balance
  BITCOIN_CASH: 'qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q', // CB Prime BCH Trading Balance
  LITECOIN: 'MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK', // CB Prime LTC Trading Balance
  DOGECOIN: 'DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7', // CB Prime DOGE Trading Balance

  // ========================================
  // Other Layer 1 Networks
  // ========================================
  SOLANA: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1', // CB Prime SOL Trading Balance
  CARDANO: 'addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt', // CB Prime ADA Trading Balance
  TEZOS: 'tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV', // CB Prime XTZ Trading Balance

  // ========================================
  // Networks Requiring Memos
  // ========================================
  STELLAR: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5', // CB Prime XLM Trading Balance + memo
  XRP: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34', // CB Prime XRP Trading Balance + destination tag
  HEDERA: '0.0.5006230', // CB Prime HBAR Trading Balance + memo

  // ========================================
  // Additional Networks
  // ========================================
  SUI: '0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2', // CB Prime SUI Trading Balance
  TONCOIN: 'PLACEHOLDER_CB_PRIME_TON', // 📝 Need: CB Prime Toncoin address
}

/**
 * Networks that require an additional addressTag/memo field.
 * Per Robinhood documentation, these networks require memos for proper crediting.
 * Reference: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */
export const NETWORK_ADDRESS_TAGS: Partial<Record<SupportedNetwork, string>> = {
  STELLAR: '1380611530', // CB Prime Stellar memo (Trading Balance)
  XRP: '2237695492', // CB Prime XRP destination tag (Trading Balance)
  HEDERA: '904278439', // CB Prime Hedera memo (Trading Balance)
}

/**
 * Get deposit address for a specific network
 * @param network - The blockchain network
 * @returns The deposit address for that network
 * @throws Error if address not configured or contains placeholder text
 */
export function getDepositAddress(network: SupportedNetwork): string {
  const address = NETWORK_DEPOSIT_ADDRESSES[network]

  if (!address || address.includes('PLACEHOLDER') || address.includes('YOUR_') || address.includes('_HERE')) {
    throw new Error(
      `Deposit address not configured for network: ${network}. ` +
        `Please provide a valid ${network} address to complete the configuration.`,
    )
  }

  return address
}

/**
 * Get address tag/memo for a specific network (if required)
 * @param network - The blockchain network
 * @returns The address tag/memo if required, undefined otherwise
 */
export function getAddressTag(network: SupportedNetwork): string | undefined {
  return NETWORK_ADDRESS_TAGS[network]
}

/**
 * Validate that all network addresses are properly configured
 * Call this during application startup or in tests
 * @returns Validation result with list of any errors found
 */
export function validateNetworkAddresses(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  for (const network of Object.keys(NETWORK_DEPOSIT_ADDRESSES) as SupportedNetwork[]) {
    const address = NETWORK_DEPOSIT_ADDRESSES[network]

    // Check for missing or placeholder addresses
    if (!address) {
      errors.push(`Missing address for ${network}`)
      continue
    } else if (address.includes('PLACEHOLDER')) {
      warnings.push(`Placeholder address for ${network} - address needed before production`)
      continue
    } else if (address.includes('YOUR_') || address.includes('_HERE')) {
      errors.push(`Placeholder address not replaced for ${network}`)
      continue
    }

    // Validate address format based on Robinhood requirements
    switch (network) {
      case 'BITCOIN':
        if (!address.match(/^[13bc1]/)) {
          errors.push(`Invalid Bitcoin address format for ${network}: ${address}. Must start with 1, 3, or bc1q`)
        }
        break

      case 'BITCOIN_CASH':
        if (!address.match(/^[1q]/)) {
          errors.push(`Invalid Bitcoin Cash address format for ${network}: ${address}. Must start with 1 or q`)
        }
        break

      case 'DOGECOIN':
        if (!address.startsWith('D')) {
          errors.push(`Invalid Dogecoin address format for ${network}: ${address}. Must start with D`)
        }
        break

      case 'ETHEREUM':
      case 'POLYGON':
      case 'ARBITRUM':
      case 'BASE':
      case 'OPTIMISM':
      case 'ZORA':
      case 'AVALANCHE':
        if (!address.startsWith('0x') || address.length !== 42) {
          errors.push(`Invalid EVM address format for ${network}: ${address}. Must start with 0x and be 42 chars`)
        }
        break

      case 'ETHEREUM_CLASSIC':
        if (!address.startsWith('0x')) {
          errors.push(`Invalid Ethereum Classic address format for ${network}: ${address}. Must start with 0x`)
        }
        break

      case 'LITECOIN':
        if (!address.match(/^[LMl]/)) {
          errors.push(`Invalid Litecoin address format for ${network}: ${address}. Must start with L, M, or ltc1`)
        }
        break

      case 'STELLAR':
        if (!address.startsWith('G')) {
          errors.push(`Invalid Stellar address format for ${network}: ${address}. Must start with G`)
        }
        if (!NETWORK_ADDRESS_TAGS[network]) {
          errors.push(`Stellar (${network}) requires a memo but none is configured`)
        }
        break

      case 'TEZOS':
        if (!address.startsWith('tz')) {
          errors.push(`Invalid Tezos address format for ${network}: ${address}. Must start with tz`)
        }
        break

      case 'CARDANO':
        if (!address.match(/^(addr1|Ae2|DdzFF)/)) {
          errors.push(`Invalid Cardano address format for ${network}: ${address}. Must start with addr1, Ae2, or DdzFF`)
        }
        break

      case 'XRP':
        if (!address.startsWith('r')) {
          errors.push(`Invalid XRP address format for ${network}: ${address}. Must start with r`)
        }
        if (!NETWORK_ADDRESS_TAGS[network]) {
          errors.push(`XRP (${network}) requires a destination tag but none is configured`)
        }
        break

      case 'HEDERA':
        if (!address.match(/^\d+\.\d+\.\d+$/)) {
          errors.push(`Invalid Hedera account ID format for ${network}: ${address}. Must be in format 0.0.x`)
        }
        if (!NETWORK_ADDRESS_TAGS[network]) {
          errors.push(`Hedera (${network}) requires a memo but none is configured`)
        }
        break

      case 'SOLANA':
        // Solana addresses should be 44 characters base58
        if (address.length < 32 || address.length > 44) {
          warnings.push(`Unusual Solana address length for ${network}: ${address.length} chars (expected ~44)`)
        }
        break

      case 'SUI':
        // SUI addresses: 0x + exactly 64 hex characters
        if (!address.match(/^0x[0-9a-fA-F]{64}$/)) {
          errors.push(`Invalid Sui address format for ${network}: ${address}. Must be 0x + 64 hex chars`)
        }
        break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get all configured networks (networks with valid, non-placeholder addresses)
 * @returns Array of all properly configured network identifiers
 */
export function getConfiguredNetworks(): SupportedNetwork[] {
  return Object.entries(NETWORK_DEPOSIT_ADDRESSES)
    .filter(
      ([_, address]) =>
        address && !address.includes('PLACEHOLDER') && !address.includes('YOUR_') && !address.includes('_HERE'),
    )
    .map(([network, _]) => network as SupportedNetwork)
}

/**
 * Get networks that still need addresses configured
 * @returns Array of network identifiers that have placeholder addresses
 */
export function getNetworksNeedingAddresses(): SupportedNetwork[] {
  return Object.entries(NETWORK_DEPOSIT_ADDRESSES)
    .filter(([_, address]) => address && address.includes('PLACEHOLDER'))
    .map(([network, _]) => network as SupportedNetwork)
}

/**
 * Check if a network requires a memo/address tag
 * @param network - The blockchain network
 * @returns True if the network requires a memo, false otherwise
 */
export function requiresAddressTag(network: SupportedNetwork): boolean {
  return NETWORK_ADDRESS_TAGS[network] !== undefined
}

/**
 * Get human-readable network information
 * @param network - The blockchain network
 * @returns Display information for the network
 */
export function getNetworkInfo(network: SupportedNetwork): {
  name: string
  requiresMemo: boolean
  addressFormat: string
} {
  const networkInfo: Record<SupportedNetwork, { name: string; addressFormat: string }> = {
    ETHEREUM: { name: 'Ethereum', addressFormat: 'EVM (0x)' },
    POLYGON: { name: 'Polygon', addressFormat: 'EVM (0x)' },
    ARBITRUM: { name: 'Arbitrum', addressFormat: 'EVM (0x)' },
    BASE: { name: 'Base', addressFormat: 'EVM (0x)' },
    OPTIMISM: { name: 'Optimism', addressFormat: 'EVM (0x)' },
    ZORA: { name: 'Zora (Base)', addressFormat: 'EVM (0x)' },
    AVALANCHE: { name: 'Avalanche C-Chain', addressFormat: 'EVM (0x)' },
    ETHEREUM_CLASSIC: { name: 'Ethereum Classic', addressFormat: 'EVM (0x, EOA only)' },
    BITCOIN: { name: 'Bitcoin', addressFormat: '1, 3, or bc1q' },
    BITCOIN_CASH: { name: 'Bitcoin Cash', addressFormat: '1 or q' },
    LITECOIN: { name: 'Litecoin', addressFormat: 'L, M, or ltc1' },
    DOGECOIN: { name: 'Dogecoin', addressFormat: 'D' },
    SOLANA: { name: 'Solana', addressFormat: 'Base58 (44 chars)' },
    STELLAR: { name: 'Stellar Lumens', addressFormat: 'G + memo' },
    TEZOS: { name: 'Tezos', addressFormat: 'tz' },
    CARDANO: { name: 'Cardano', addressFormat: 'addr1, Ae2, or DdzFF' },
    XRP: { name: 'Ripple (XRP)', addressFormat: 'r + numeric tag' },
    HEDERA: { name: 'Hedera', addressFormat: '0.0.x + memo' },
    SUI: { name: 'Sui', addressFormat: '0x + 64 hex' },
    TONCOIN: { name: 'Toncoin', addressFormat: 'Base64 or hex' },
  }

  const info = networkInfo[network] || { name: network, addressFormat: 'Unknown' }

  return {
    name: info.name,
    requiresMemo: requiresAddressTag(network),
    addressFormat: info.addressFormat,
  }
}
