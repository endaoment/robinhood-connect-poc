/**
 * Coinbase Prime Address Lookup Service
 *
 * Fetches wallet addresses from Coinbase Prime with preference order:
 * 1. Trading account (preferred for active trading)
 * 2. Trading Balance (fallback)
 *
 * Used to populate deposit addresses for Robinhood assets
 *
 * NOTE: This runs SERVER-SIDE ONLY (requires Prime API credentials)
 */

import type { RobinhoodDepositAddress } from '../types'

/**
 * Wallet type for tracking address source
 */
export enum PrimeWalletType {
  Trading = 'Trading',
  TradingBalance = 'Trading Balance',
  Other = 'Other',
  Static = 'Static', // Hardcoded fallback (not from CBP API)
}

/**
 * Extended deposit address with wallet type metadata
 * Note: RobinhoodDepositAddress now includes walletType and walletId
 */
export interface PrimeDepositAddress extends RobinhoodDepositAddress {
  // walletType and walletId are now in base interface
}

/**
 * Cached wallet addresses (populated at startup)
 */
let PRIME_ADDRESS_CACHE: Record<string, PrimeDepositAddress> | null = null

/**
 * Stats from last Prime API fetch
 */
let PRIME_FETCH_STATS: {
  totalWalletsFetched: number
  addressesMatched: number
  walletTypeDistribution: Record<string, number>
  fetchedAt?: Date
} | null = null

/**
 * Fetch all Prime wallet addresses (server-side only)
 * This should be called during app initialization
 *
 * Preference order:
 * 1. Trading account (preferred)
 * 2. Trading Balance (fallback)
 */
export async function fetchPrimeWalletAddresses(): Promise<Record<string, PrimeDepositAddress>> {
  // Check if running on server
  if (typeof window !== 'undefined') {
    console.error('[Prime Addresses] This function must run server-side only')
    return {}
  }

  console.log('[Prime Addresses] Fetching wallet addresses from Coinbase Prime...')
  console.log('[Prime Addresses] Priority: Trading > Trading Balance')

  try {
    // Use Python script to fetch addresses
    const addresses = await fetchAddressesViaPythonScript()

    console.log(`[Prime Addresses] Fetched ${Object.keys(addresses).length} addresses`)

    // Log wallet type distribution
    const byType = Object.values(addresses).reduce(
      (acc, addr) => {
        const type = addr.walletType || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log('[Prime Addresses] Wallet types:', byType)

    // Store stats for health check
    PRIME_FETCH_STATS = {
      totalWalletsFetched: 0, // Will be updated by Python script parsing
      addressesMatched: Object.keys(addresses).length,
      walletTypeDistribution: byType,
      fetchedAt: new Date(),
    }

    // Cache for future lookups
    PRIME_ADDRESS_CACHE = addresses

    return addresses
  } catch (error) {
    console.error('[Prime Addresses] Failed to fetch addresses:', error)
    console.warn('[Prime Addresses] Using static fallback addresses')

    // Return static addresses and populate cache
    const staticAddresses = getStaticPrimeAddresses()
    PRIME_ADDRESS_CACHE = staticAddresses

    return staticAddresses
  }
}

/**
 * Get Prime address for a symbol (from cache)
 */
export function getPrimeAddress(symbol: string): RobinhoodDepositAddress | undefined {
  if (!PRIME_ADDRESS_CACHE) {
    console.warn('[Prime Addresses] Cache not initialized - call fetchPrimeWalletAddresses() first')
    return getStaticPrimeAddress(symbol)
  }

  return PRIME_ADDRESS_CACHE[symbol]
}

/**
 * Fetch addresses using Python script (subprocess)
 * Alternative to native API client
 *
 * The Python script returns all wallets and we prioritize:
 * 1. Trading account (preferred)
 * 2. Trading Balance (fallback)
 */
async function fetchAddressesViaPythonScript(): Promise<Record<string, PrimeDepositAddress>> {
  // Only available server-side
  if (typeof window !== 'undefined') {
    throw new Error('[Prime Addresses] fetchAddressesViaPythonScript must run server-side only')
  }

  // Dynamic imports to avoid bundling in client
  const { execSync } = require('child_process')
  const path = require('path')

  const scriptPath = path.join(process.cwd(), 'scripts', 'generate_prime_wallets.py')

  try {
    // Run Python script with flag to return ALL wallet types
    const output = execSync(`python3 ${scriptPath} --all-wallets --json-only`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      stdio: ['pipe', 'pipe', 'pipe'], // Suppress stderr from being too verbose
    })

    // Extract JSON from output (find the array between [ and ])
    const jsonMatch = output.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON output found from Python script')
    }

    const results = JSON.parse(jsonMatch[0])

    console.log(`[Prime Addresses] Parsed ${results.length} wallet results`)

    // Store total wallets count for stats
    const totalWalletsFetched = results.length

    // Symbol mappings (Prime uses different symbols for some assets)
    const symbolMap: Record<string, string> = {
      POL: 'MATIC', // Polygon rebranded from MATIC to POL in Prime
    }

    // Group wallets by symbol (normalize symbols)
    const walletsBySymbol: Record<
      string,
      Array<{
        symbol: string
        address: string
        memo?: string
        wallet_name: string
        wallet_id: string
      }>
    > = {}

    for (const result of results) {
      if (result.status === 'found') {
        // Normalize symbol (POL → MATIC, etc.)
        const normalizedSymbol = symbolMap[result.symbol] || result.symbol

        if (!walletsBySymbol[normalizedSymbol]) {
          walletsBySymbol[normalizedSymbol] = []
        }
        walletsBySymbol[normalizedSymbol].push({
          ...result,
          symbol: normalizedSymbol, // Use normalized symbol
        })
      }
    }

    // Apply priority logic: Trading > Trading Balance
    const addresses: Record<string, PrimeDepositAddress> = {}

    for (const [symbol, wallets] of Object.entries(walletsBySymbol)) {
      // Priority 1: Trading account (exact match)
      const tradingWallet = wallets.find((w) => w.wallet_name === 'Trading')

      // Priority 2: Trading Balance
      const tradingBalanceWallet = wallets.find((w) => w.wallet_name.includes('Trading Balance'))

      // Priority 3: Any other wallet
      const selectedWallet = tradingWallet || tradingBalanceWallet || wallets[0]

      if (selectedWallet) {
        // Determine wallet type
        let walletType: PrimeWalletType
        if (selectedWallet.wallet_name === 'Trading') {
          walletType = PrimeWalletType.Trading
        } else if (selectedWallet.wallet_name.includes('Trading Balance')) {
          walletType = PrimeWalletType.TradingBalance
        } else {
          walletType = PrimeWalletType.Other
        }

        addresses[symbol] = {
          address: selectedWallet.address,
          memo: selectedWallet.memo || undefined,
          walletType,
          walletId: selectedWallet.wallet_id,
        }

        // Log selection for transparency
        if (wallets.length > 1) {
          console.log(
            `[Prime Addresses] ${symbol}: Selected ${selectedWallet.wallet_name} ` +
              `(${wallets.length} wallets available)`,
          )
        }
      }
    }

    // Update global stats with total wallets
    if (PRIME_FETCH_STATS) {
      PRIME_FETCH_STATS.totalWalletsFetched = totalWalletsFetched
    }

    return addresses
  } catch (error: any) {
    // Log clean error message without full traceback
    if (error.stderr?.includes('dotenv') || error.message?.includes('dotenv')) {
      console.error('[Prime Addresses] ⚠️  Python dependencies missing')
      console.error('[Prime Addresses] 💡 Run: pip3 install python-dotenv requests')
    } else if (error.stderr?.includes('Traceback')) {
      console.error('[Prime Addresses] Python script error (check credentials in .env.local)')
    } else {
      console.error('[Prime Addresses] Python script failed:', error.message || 'Unknown error')
    }
    throw error
  }
}

/**
 * Fallback: Static addresses from Sub-Plan 9
 * Used if API fetch fails
 */
function getStaticPrimeAddresses(): Record<string, RobinhoodDepositAddress> {
  // Import from static files
  const { EVM_DEPOSIT_ADDRESSES } = require('./evm-assets-static')
  const { NON_EVM_DEPOSIT_ADDRESSES } = require('./non-evm-assets-static')

  return {
    ...EVM_DEPOSIT_ADDRESSES,
    ...NON_EVM_DEPOSIT_ADDRESSES,
  }
}

/**
 * Get static address for single symbol
 */
function getStaticPrimeAddress(symbol: string): RobinhoodDepositAddress | undefined {
  const staticAddresses = getStaticPrimeAddresses()
  return staticAddresses[symbol]
}

/**
 * Validate Prime address cache is ready
 */
export function isPrimeAddressCacheReady(): boolean {
  return PRIME_ADDRESS_CACHE !== null && Object.keys(PRIME_ADDRESS_CACHE).length > 0
}

/**
 * Get Prime fetch stats for health check
 */
export function getPrimeAddressStats() {
  return PRIME_FETCH_STATS
}
