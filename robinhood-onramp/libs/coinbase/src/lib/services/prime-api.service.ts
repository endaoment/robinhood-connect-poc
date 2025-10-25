/**
 * Coinbase Prime API Service
 *
 * Handles interactions with Coinbase Prime API for wallet management.
 * This service is used by the Robinhood integration to fetch Prime wallet addresses.
 *
 * Priority order for wallet selection:
 * 1. Trading account (preferred for active trading)
 * 2. Trading Balance (fallback)
 * 3. Other wallet types
 */

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
 * Prime deposit address structure
 */
export interface PrimeDepositAddress {
  address: string
  memo?: string
  walletType?: PrimeWalletType
  walletId?: string
}

/**
 * Stats from Prime API fetch
 */
export interface PrimeFetchStats {
  totalWalletsFetched: number
  addressesMatched: number
  walletTypeDistribution: Record<string, number>
  fetchedAt?: Date
}

/**
 * Service for interacting with Coinbase Prime API
 */
export class PrimeApiService {
  private addressCache: Record<string, PrimeDepositAddress> | null = null
  private fetchStats: PrimeFetchStats | null = null

  /**
   * Fetch all Prime wallet addresses (server-side only)
   * This should be called during app initialization
   *
   * Preference order:
   * 1. Trading account (preferred)
   * 2. Trading Balance (fallback)
   */
  async fetchWalletAddresses(): Promise<Record<string, PrimeDepositAddress>> {
    // Check if running on server
    if (typeof window !== 'undefined') {
      console.error('[Prime API Service] This function must run server-side only')
      return {}
    }

    console.log('[Prime API Service] Fetching wallet addresses from Coinbase Prime...')
    console.log('[Prime API Service] Priority: Trading > Trading Balance')

    try {
      // Use Python script to fetch addresses
      const addresses = await this.fetchAddressesViaPythonScript()

      console.log(`[Prime API Service] Fetched ${Object.keys(addresses).length} addresses`)

      // Log wallet type distribution
      const byType = Object.values(addresses).reduce(
        (acc, addr) => {
          const type = addr.walletType || 'Unknown'
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      console.log('[Prime API Service] Wallet types:', byType)

      // Store stats for health check
      this.fetchStats = {
        totalWalletsFetched: 0, // Will be updated by Python script parsing
        addressesMatched: Object.keys(addresses).length,
        walletTypeDistribution: byType,
        fetchedAt: new Date(),
      }

      // Cache for future lookups
      this.addressCache = addresses

      return addresses
    } catch (error) {
      console.error('[Prime API Service] Failed to fetch addresses:', error)
      console.warn('[Prime API Service] Using empty cache (no fallback)')

      // Initialize empty cache
      this.addressCache = {}

      return {}
    }
  }

  /**
   * Get Prime address for a symbol (from cache)
   */
  getAddress(symbol: string): PrimeDepositAddress | undefined {
    if (!this.addressCache) {
      console.warn('[Prime API Service] Cache not initialized - call fetchWalletAddresses() first')
      return undefined
    }

    return this.addressCache[symbol]
  }

  /**
   * Check if address cache is ready
   */
  isCacheReady(): boolean {
    return this.addressCache !== null && Object.keys(this.addressCache).length > 0
  }

  /**
   * Get fetch stats for health check
   */
  getStats(): PrimeFetchStats | null {
    return this.fetchStats
  }

  /**
   * Fetch addresses using Python script (subprocess)
   * Alternative to native API client
   *
   * The Python script returns all wallets and we prioritize:
   * 1. Trading account (preferred)
   * 2. Trading Balance (fallback)
   */
  private async fetchAddressesViaPythonScript(): Promise<Record<string, PrimeDepositAddress>> {
    // Only available server-side
    if (typeof window !== 'undefined') {
      throw new Error('[Prime API Service] fetchAddressesViaPythonScript must run server-side only')
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

      console.log(`[Prime API Service] Parsed ${results.length} wallet results`)

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
              `[Prime API Service] ${symbol}: Selected ${selectedWallet.wallet_name} ` +
                `(${wallets.length} wallets available)`,
            )
          }
        }
      }

      // Update global stats with total wallets
      if (this.fetchStats) {
        this.fetchStats.totalWalletsFetched = totalWalletsFetched
      }

      return addresses
    } catch (error: unknown) {
      // Log clean error message without full traceback
      const stderr = (error as { stderr?: string }).stderr
      const message = error instanceof Error ? error.message : ''
      if (stderr?.includes('dotenv') || message?.includes('dotenv')) {
        console.error('[Prime API Service] ⚠️  Python dependencies missing')
        console.error('[Prime API Service] 💡 Run: pip3 install python-dotenv requests')
      } else if (stderr?.includes('Traceback')) {
        console.error('[Prime API Service] Python script error (check credentials in .env.local)')
      } else {
        console.error('[Prime API Service] Python script failed:', message || 'Unknown error')
      }
      throw error
    }
  }
}

