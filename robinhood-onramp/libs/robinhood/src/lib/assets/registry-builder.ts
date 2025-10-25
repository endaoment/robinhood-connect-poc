import type { RobinhoodAssetConfig } from '../types'
import { normalizeNetworkName, type DiscoveredAsset } from './discovery'
import { EVM_ASSETS } from './evm-assets'
import { NON_EVM_ASSETS } from './non-evm-assets'
import { getPrimeAddress, PrimeWalletType } from './prime-addresses'

/**
 * Fallback EOA for EVM tokens without CBP or OTC addresses
 * All EVM tokens can receive transfers to this address
 */
const EVM_FALLBACK_EOA = '0x9D5025B327E6B863E5050141C987d988c07fd8B2'

/**
 * Build dynamic registry from Robinhood Discovery + Prime addresses
 * Shows ALL Robinhood assets, even those without Prime addresses
 */
export function buildDynamicRegistry(
  discoveredAssets: DiscoveredAsset[]
): Record<string, RobinhoodAssetConfig> {
  const registry: Record<string, RobinhoodAssetConfig> = {}

  for (const discovered of discoveredAssets) {
    const symbol = discovered.symbol

    // Get static metadata
    const metadata = EVM_ASSETS[symbol] || NON_EVM_ASSETS[symbol]

    if (!metadata) {
      console.warn(
        `[Asset Registry] No metadata for ${symbol} - creating minimal config`
      )
      // Create minimal config for assets we don't have metadata for
      const normalizedNetwork = normalizeNetworkName(
        discovered.networks[0] || 'UNKNOWN'
      )

      // For unknown assets, check if network suggests EVM
      const evmNetworks = [
        'ETHEREUM',
        'POLYGON',
        'ARBITRUM',
        'OPTIMISM',
        'BASE',
        'ZORA',
        'AVALANCHE',
        'ETHEREUM_CLASSIC',
      ]
      const isLikelyEvmToken = evmNetworks.includes(normalizedNetwork)

      registry[symbol] = {
        symbol,
        name: discovered.name,
        description: `${discovered.name} (auto-discovered)`,
        network: normalizedNetwork,
        category: 'other',
        decimals: 18, // Default - should be verified
        popularity: 1,
        sortOrder: 999,
        enabled: true, // Include in UI even without metadata
        icon: 'crypto.svg', // Default icon
        logoUrl: `https://assets.coingecko.com/coins/images/1/small/${symbol.toLowerCase()}.png`,
        featured: false,
        type: 'EvmToken', // Assume EVM unless known otherwise
        depositAddress: isLikelyEvmToken
          ? {
              address: EVM_FALLBACK_EOA,
              walletType: PrimeWalletType.OTC,
              note: 'OTC List - EVM fallback EOA (no metadata)',
            }
          : { address: '', note: 'No metadata or address' },
      } as any
      continue
    }

    // Get Prime deposit address (with wallet type)
    const depositAddress = getPrimeAddress(symbol)

    // CRITICAL: Validate network compatibility
    // Normalize Robinhood network names (e.g., SUI_NETWORK → SUI)
    const ourNetwork = metadata.network
    const normalizedRobinhoodNetworks = discovered.networks.map(
      normalizeNetworkName
    )

    if (
      normalizedRobinhoodNetworks.length > 0 &&
      !normalizedRobinhoodNetworks.includes(ourNetwork)
    ) {
      // Network mismatch - For EVM tokens, use fallback EOA
      const isEvmToken = 'chainId' in metadata

      if (isEvmToken) {
        console.log(
          `[Asset Registry] ${symbol}: Network mismatch but using EVM fallback EOA - ` +
            `our address is ${ourNetwork}, Robinhood supports ${normalizedRobinhoodNetworks.join(', ')}`
        )
        registry[symbol] = {
          ...metadata,
          depositAddress: {
            address: EVM_FALLBACK_EOA,
            walletType: PrimeWalletType.OTC,
            note: 'OTC List - EVM fallback EOA (network mismatch)',
          },
        }
        continue
      }

      // Non-EVM network mismatch - cannot use fallback
      console.warn(
        `[Asset Registry] ${symbol}: Network mismatch (non-EVM) - ` +
          `our address is ${ourNetwork}, Robinhood supports ${normalizedRobinhoodNetworks.join(', ')}`
      )
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'Network mismatch (non-EVM)' },
      }
      continue
    }

    if (!depositAddress || !depositAddress.address) {
      // For EVM tokens, use fallback EOA (all EVM tokens can use common address)
      const isEvmToken = 'chainId' in metadata

      if (isEvmToken) {
        console.log(
          `[Asset Registry] ${symbol}: Using EVM fallback EOA (no CBP/OTC address found)`
        )
        registry[symbol] = {
          ...metadata,
          depositAddress: {
            address: EVM_FALLBACK_EOA,
            walletType: PrimeWalletType.OTC,
            note: 'OTC List - EVM fallback EOA',
          },
        }
        continue
      }

      // For non-EVM tokens, cannot use fallback (each needs specific address)
      console.warn(
        `[Asset Registry] No Prime/OTC address for ${symbol} (non-EVM) - including without address`
      )
      registry[symbol] = {
        ...metadata,
        depositAddress: { address: '', note: 'No CBP/OTC address' },
      }
      continue
    }

    // Log multi-network assets for visibility
    if (normalizedRobinhoodNetworks.length > 1) {
      console.log(
        `[Asset Registry] ${symbol} multi-network: ${normalizedRobinhoodNetworks.join(', ')} ` +
          `(using ${ourNetwork} address)`
      )
    }

    // Build complete config
    registry[symbol] = {
      ...metadata,
      depositAddress, // Has walletType from CBP
    }

    // Debug: Log wallet type for first few assets
    if (Object.keys(registry).length <= 3) {
      console.log(
        `[Asset Registry] ${symbol} depositAddress walletType:`,
        depositAddress.walletType
      )
    }
  }

  console.log(`[Asset Registry] Built ${Object.keys(registry).length} assets`)
  return registry
}

