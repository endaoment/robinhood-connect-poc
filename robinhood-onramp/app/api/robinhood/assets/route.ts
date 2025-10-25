import 'reflect-metadata';
import { getAssetRegistry } from '@/libs/robinhood/lib/assets/registry'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get only enabled assets (those with deposit addresses) for consistency with UI
    const registry = getAssetRegistry()
    const allAssets = Object.values(registry)

    // Separate enabled assets (with addresses) from missing assets (without addresses)
    const assets = allAssets.filter((asset) => asset.depositAddress?.address).sort((a, b) => a.sortOrder - b.sortOrder)

    const missingAssets = allAssets
      .filter((asset) => !asset.depositAddress?.address)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // Debug: Log wallet types being sent to client
    const walletTypeCounts = assets.reduce(
      (acc, a) => {
        const wt = a.depositAddress?.walletType || 'undefined'
        acc[wt] = (acc[wt] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    console.log('[Assets API] Sending wallet types to client:', walletTypeCounts)

    // Debug: Log first asset's depositAddress structure
    if (assets.length > 0 && assets[0].depositAddress) {
      console.log('[Assets API] Sample depositAddress:', {
        symbol: assets[0].symbol,
        address: assets[0].depositAddress.address?.slice(0, 10) + '...',
        walletType: assets[0].depositAddress.walletType,
        hasWalletType: 'walletType' in assets[0].depositAddress,
      })
    }

    return NextResponse.json({
      assets,
      count: assets.length,
      missingAssets,
      missingCount: missingAssets.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Assets API] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
