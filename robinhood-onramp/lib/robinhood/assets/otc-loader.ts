/**
 * OTC Token Loader - Dynamic loading from backend repository
 *
 * Loads OTC token addresses from the endaoment-backend repository
 * which is assumed to be in the same parent directory as this repo.
 *
 * Directory structure:
 * parent-folder/
 *   ├── robinhood-connect-poc/   (this repo)
 *   └── endaoment-backend/        (backend repo)
 */

import type { RobinhoodDepositAddress } from '../types'
import { PrimeWalletType } from './prime-addresses'

/**
 * Path to backend OTC token file (relative to this file)
 * From: robinhood-connect-poc/robinhood-onramp/lib/robinhood/assets/otc-loader.ts
 * To:   endaoment-backend/libs/api/tokens/src/lib/otc-token.ts
 */
const BACKEND_OTC_TOKEN_PATH = '../../../../../endaoment-backend/libs/api/tokens/src/lib/otc-token.ts'

/**
 * Cached OTC addresses loaded from backend
 */
let OTC_ADDRESSES_CACHE: Record<string, RobinhoodDepositAddress> | null = null

/**
 * Load OTC token addresses from backend repository
 * Only runs server-side
 */
export async function loadOtcAddressesFromBackend(): Promise<Record<string, RobinhoodDepositAddress>> {
  // Only run on server
  if (typeof window !== 'undefined') {
    console.warn('[OTC Loader] This function must run server-side only')
    return {}
  }

  // Return cached if already loaded
  if (OTC_ADDRESSES_CACHE) {
    console.log('[OTC Loader] Using cached OTC addresses from backend')
    return OTC_ADDRESSES_CACHE
  }

  try {
    const fs = require('fs')
    const path = require('path')

    // Resolve absolute path to backend OTC token file
    // Use process.cwd() (project root) instead of __dirname (build output location)
    const projectRoot = process.cwd()
    const backendOtcPath = path.resolve(projectRoot, '../../endaoment-backend/libs/api/tokens/src/lib/otc-token.ts')

    console.log(`[OTC Loader] Loading OTC tokens from: ${backendOtcPath}`)

    // Check if file exists
    if (!fs.existsSync(backendOtcPath)) {
      console.warn(`[OTC Loader] Backend OTC file not found at: ${backendOtcPath}`)
      console.warn('[OTC Loader] Falling back to hardcoded OTC addresses')
      return getHardcodedOtcAddresses()
    }

    // Read and parse the TypeScript file
    const fileContent = fs.readFileSync(backendOtcPath, 'utf-8')

    // Extract the OTC tokens array using regex
    // Matches: export const APPROVED_OTC_TOKENS = [...] or similar patterns
    const arrayMatch = fileContent.match(/export\s+const\s+\w+_OTC_TOKENS[^=]*=\s*\[([\s\S]*?)\]/m)

    if (!arrayMatch) {
      console.warn('[OTC Loader] Could not parse OTC tokens from backend file')
      console.warn('[OTC Loader] Falling back to hardcoded OTC addresses')
      return getHardcodedOtcAddresses()
    }

    // Parse the tokens manually (safer than eval)
    const tokens = parseOtcTokenArray(arrayMatch[1])

    console.log(`[OTC Loader] Parsed ${tokens.length} OTC tokens from backend`)

    // Convert to our address format
    const addresses: Record<string, RobinhoodDepositAddress> = {}

    for (const token of tokens) {
      addresses[token.symbol] = {
        address: token.address,
        memo: token.memo || undefined,
        walletType: PrimeWalletType.OTC,
        note: 'OTC List (from backend)',
      }
    }

    // Cache for future use
    OTC_ADDRESSES_CACHE = addresses

    console.log(`[OTC Loader] Loaded ${Object.keys(addresses).length} OTC addresses from backend`)
    console.log(`[OTC Loader] Symbols: ${Object.keys(addresses).join(', ')}`)

    return addresses
  } catch (error) {
    console.error('[OTC Loader] Failed to load OTC addresses from backend:', error)
    console.warn('[OTC Loader] Falling back to hardcoded OTC addresses')
    return getHardcodedOtcAddresses()
  }
}

/**
 * Parse OTC token array from TypeScript source code
 */
function parseOtcTokenArray(arrayContent: string): Array<{
  address: string
  symbol: string
  name: string
  memo: string | null
  logoUrl: string | null
}> {
  const tokens: Array<any> = []

  // Split by object boundaries (look for closing braces followed by commas or end)
  const objectMatches = arrayContent.match(/\{[^}]+\}/g)

  if (!objectMatches) return tokens

  for (const objStr of objectMatches) {
    try {
      // Extract properties using regex
      const address = objStr.match(/address:\s*['"]([^'"]+)['"]/)?.[1]
      const symbol = objStr.match(/symbol:\s*['"]([^'"]+)['"]/)?.[1]
      const name = objStr.match(/name:\s*['"]([^'"]+)['"]/)?.[1]
      const memoMatch = objStr.match(/memo:\s*(['"]([^'"]+)['"]|null)/)
      const memo = memoMatch?.[2] || null
      const logoUrlMatch = objStr.match(/logoUrl:\s*(['"]([^'"]+)['"]|null)/)
      const logoUrl = logoUrlMatch?.[2] || null

      if (address && symbol && name) {
        tokens.push({ address, symbol, name, memo, logoUrl })
      }
    } catch (err) {
      console.warn('[OTC Loader] Failed to parse token object:', err)
    }
  }

  return tokens
}

/**
 * REMOVED: Hardcoded OTC addresses
 * Static files have been deleted. Use backend OTC list only.
 */
function getHardcodedOtcAddresses(): Record<string, RobinhoodDepositAddress> {
  console.warn('[OTC Loader] Static OTC addresses removed - backend OTC list required')
  return {}
}

/**
 * Get cached OTC addresses (returns null if not loaded yet)
 */
export function getCachedOtcAddresses(): Record<string, RobinhoodDepositAddress> | null {
  return OTC_ADDRESSES_CACHE
}

/**
 * Check if OTC addresses have been loaded from backend
 */
export function isOtcCacheReady(): boolean {
  return OTC_ADDRESSES_CACHE !== null && Object.keys(OTC_ADDRESSES_CACHE).length > 0
}
