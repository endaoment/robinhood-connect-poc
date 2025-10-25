import { getDiscoveryStats } from '@/libs/robinhood/lib/assets/discovery'
import { getPrimeAddressStats, isPrimeAddressCacheReady } from '@/libs/robinhood/lib/assets/prime-addresses'
import { getAssetRegistry, isRegistryReady, validateAssetRegistry } from '@/libs/robinhood/lib/assets/registry'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Registry auto-initializes on first access
    const registryReady = isRegistryReady() || getAssetRegistry() !== null
    const primeReady = isPrimeAddressCacheReady()
    const validation = registryReady ? validateAssetRegistry() : null

    // Get wallet type distribution and detailed stats
    let walletTypes: Record<string, number> = {}
    let sourceBreakdown = {
      fromCBP: 0,
      fromOTC: 0,
      fromFallback: 0,
      noMatch: 0,
      networkMismatch: 0,
    }

    if (registryReady) {
      try {
        const registry = getAssetRegistry()
        const assets = Object.values(registry)

        // Calculate wallet type distribution
        walletTypes = assets.reduce(
          (acc, asset) => {
            const type = asset.depositAddress?.walletType || 'undefined'
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        // Calculate source breakdown (matches toast logic)
        sourceBreakdown = {
          fromCBP: assets.filter((a) => {
            const wt = a.depositAddress?.walletType
            const hasAddress = a.depositAddress?.address
            return hasAddress && (wt === 'Trading' || wt === 'Trading Balance' || wt === 'Other')
          }).length,
          fromOTC: assets.filter((a) => {
            const wt = a.depositAddress?.walletType
            const note = a.depositAddress?.note || ''
            const hasAddress = a.depositAddress?.address
            return hasAddress && wt === 'OTC' && !note.toLowerCase().includes('fallback')
          }).length,
          fromFallback: assets.filter((a) => {
            const note = a.depositAddress?.note || ''
            const hasAddress = a.depositAddress?.address
            return hasAddress && note.toLowerCase().includes('fallback')
          }).length,
          noMatch: assets.filter((a) => !a.depositAddress?.address).length,
          networkMismatch: assets.filter((a) => a.depositAddress?.note?.toLowerCase().includes('mismatch')).length,
        }
      } catch (error) {
        console.error('[Health Check] Failed to get wallet types:', error)
      }
    }

    // Get API stats if available
    const primeStats = getPrimeAddressStats()
    const discoveryStats = getDiscoveryStats()

    return NextResponse.json({
      status: registryReady ? 'healthy' : 'initializing',
      registry: {
        initialized: registryReady,
        validation: validation
          ? {
              valid: validation.valid,
              totalAssets: validation.stats.total,
              enabledAssets: validation.stats.withAddresses, // Assets with addresses are "enabled"
              errors: validation.errors.length,
              warnings: validation.warnings.length,
            }
          : null,
      },
      discovery: discoveryStats, // Robinhood Discovery API stats
      primeAddresses: {
        initialized: primeReady,
        walletTypes: Object.keys(walletTypes).length > 0 ? walletTypes : null,
        stats: primeStats, // Coinbase Prime API stats
      },
      sourceBreakdown, // Detailed breakdown for toast
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Health Check] Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
