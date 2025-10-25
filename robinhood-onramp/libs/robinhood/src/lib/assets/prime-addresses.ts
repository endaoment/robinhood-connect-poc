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
  OTC = 'OTC', // From backend OTC list (EOA for EVM tokens)
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
    console.warn('[Prime Addresses] Using OTC list fallback addresses')

    // Return OTC addresses and populate cache
    const otcAddresses = getOtcAddresses()
    PRIME_ADDRESS_CACHE = otcAddresses

    return otcAddresses
  }
}

/**
 * Get Prime address for a symbol (from cache)
 * Falls back to OTC list if not found in CBP
 */
export function getPrimeAddress(symbol: string): RobinhoodDepositAddress | undefined {
  if (!PRIME_ADDRESS_CACHE) {
    console.warn('[Prime Addresses] Cache not initialized - call fetchPrimeWalletAddresses() first')
    return getOtcAddress(symbol)
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
  const { spawn } = require('child_process')
  const path = require('path')

  const scriptPath = path.join(process.cwd(), 'scripts', 'generate_prime_wallets.py')

  try {
    // Run Python script with streaming output for real-time progress
    const output = await new Promise<string>((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, '--all-wallets', '--json-only'])

      let stdout = ''
      let stderr = ''
      let jsonStarted = false

      pythonProcess.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString()
        stdout += chunk

        // Stream non-JSON lines to console for progress visibility
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.trim() && !line.includes('[') && !line.includes('{') && !jsonStarted) {
            console.log(`[Prime API] ${line.trim()}`)
          }
          if (line.includes('[')) {
            jsonStarted = true
          }
        }
      })

      pythonProcess.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString()
        stderr += chunk

        // Stream progress messages to console (stderr contains progress in json_only mode)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.trim() && !line.includes('Traceback') && !line.includes('Error')) {
            console.log(`[Prime API] ${line.trim()}`)
          }
        }
      })

      pythonProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${stderr}`))
        } else {
          resolve(stdout)
        }
      })

      pythonProcess.on('error', (error: Error) => {
        reject(error)
      })
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
  } catch (error: unknown) {
    // Log clean error message without full traceback
    const stderr = (error as { stderr?: string }).stderr
    const message = error instanceof Error ? error.message : ''
    if (stderr?.includes('dotenv') || message?.includes('dotenv')) {
      console.error('[Prime Addresses] ⚠️  Python dependencies missing')
      console.error('[Prime Addresses] 💡 Run: pip3 install python-dotenv requests')
    } else if (stderr?.includes('Traceback')) {
      console.error('[Prime Addresses] Python script error (check credentials in .env.local)')
    } else {
      console.error('[Prime Addresses] Python script failed:', message || 'Unknown error')
    }
    throw error
  }
}

/**
 * Fallback: OTC list addresses
 * Used if CBP API fetch fails
 *
 * Tries to get from backend OTC loader first, falls back to hardcoded
 */
function getOtcAddresses(): Record<string, RobinhoodDepositAddress> {
  // Try to get from backend OTC loader cache first
  const { getCachedOtcAddresses } = require('./otc-loader')
  const cachedOtc = getCachedOtcAddresses()

  if (cachedOtc && Object.keys(cachedOtc).length > 0) {
    console.log('[Prime Addresses] Using OTC addresses from backend')
    return cachedOtc
  }

  // No static fallback - return empty
  console.warn('[Prime Addresses] ERROR: No OTC addresses available (backend not loaded, static files removed)')
  return {}
}

/**
 * Get OTC address for single symbol
 */
function getOtcAddress(symbol: string): RobinhoodDepositAddress | undefined {
  const otcAddresses = getOtcAddresses()
  return otcAddresses[symbol]
}

// Backwards compatibility aliases (deprecated)
const getStaticPrimeAddresses = getOtcAddresses
const getStaticPrimeAddress = getOtcAddress

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
