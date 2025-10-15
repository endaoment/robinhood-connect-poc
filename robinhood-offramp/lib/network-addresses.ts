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
  // Each EVM network has its own unique Coinbase Prime address
  ETHEREUM: '0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113', // CB Prime Ethereum wallet (ndao.eth)
  POLYGON: '0x3F5a6f6Ce9Dd9e1098f279Eb0aF00aFF317b3d66', // CB Prime Polygon wallet
  ARBITRUM: '0xE6cBea18f60CE40D699bF39Dd41f240EdcCdf0a4', // CB Prime Arbitrum wallet
  BASE: '0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113', // CB Prime Base wallet (ndao.eth - ETH is reserve asset)
  OPTIMISM: '0xc99970500ae222E95168483155D6Ec0d1FbC2B69', // CB Prime Optimism wallet
  ZORA: '0xd7A20776F36d7B19F4F5f53B1305aD832A07bf4C', // CB Prime Zora wallet
  AVALANCHE: '0x7e707c8d5dc65d80162c0a7fb02c634306952385', // CB Prime Avalanche C-Chain wallet
  ETHEREUM_CLASSIC: '0x6Eca26A6337b1069d3865F54158fA5Bf675C3d37', // CB Prime Ethereum Classic wallet

  // ========================================
  // Bitcoin-like Networks
  // ========================================
  BITCOIN: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC', // CB Prime Bitcoin wallet
  BITCOIN_CASH: 'qrja4dr6kjtrrjae2y7jals4jc8up0assspl39fekq', // CB Prime Bitcoin Cash wallet
  LITECOIN: 'MEDGZCJWX8X1Njy5uRfvGwdi2QxaMNQYad', // CB Prime Litecoin wallet
  DOGECOIN: 'DC77W64uHRkkmvDwusq2tfEjqBQwch1W7s', // CB Prime Dogecoin wallet

  // ========================================
  // Other Layer 1 Networks
  // ========================================
  SOLANA: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1', // CB Prime Solana wallet
  CARDANO: 'addr1v9fu7mgyyyh63v7kqn57t7nadvv76n2cgjlg7l0r974nj9st03emv', // CB Prime Cardano wallet
  TEZOS: 'tz1WiBmPs9ZLsvuiS92cxZQjikxEo9Dsv7eh', // CB Prime Tezos wallet

  // ========================================
  // Networks Requiring Memos
  // ========================================
  STELLAR: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', // CB Prime Stellar wallet + memo
  XRP: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34', // CB Prime XRP wallet + destination tag
  HEDERA: '0.0.1133968', // CB Prime Hedera account ID + memo

  // ========================================
  // Additional Networks
  // ========================================
  SUI: '0x5e4072e696853d1d9c7b478c68a5d97f32ac35524e9dee3cf1022bc022e59c9a', // CB Prime Sui wallet
  TONCOIN: 'PLACEHOLDER_CB_PRIME_TON', // 📝 Need: CB Prime Toncoin address
}

/**
 * Networks that require an additional addressTag/memo field.
 * Per Robinhood documentation, these networks require memos for proper crediting.
 * Reference: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */
export const NETWORK_ADDRESS_TAGS: Partial<Record<SupportedNetwork, string>> = {
  STELLAR: '4212863649', // CB Prime Stellar memo
  XRP: '2237695492', // CB Prime XRP destination tag
  HEDERA: '2364220028', // CB Prime Hedera memo
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
