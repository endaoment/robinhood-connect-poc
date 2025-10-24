'use client'

import { toast } from '@/hooks/use-toast'
import type { RobinhoodAssetConfig } from '@/lib/robinhood/types'
import React, { useEffect, useState } from 'react'

export function AssetRegistryToast() {
  useEffect(() => {
    console.log('[Asset Registry Toast] Component mounted, will show toast in 1.5s')

    // Fetch registry status from health API
    const timer = setTimeout(() => {
      console.log('[Asset Registry Toast] Timer triggered, fetching status...')
      fetchAndShowRegistryStatus()
    }, 1500) // Wait 1.5s for server to initialize

    return () => clearTimeout(timer)
  }, [])

  return null // No UI, just side effects
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function AssetRegistryDetails({ assets }: { assets: RobinhoodAssetConfig[] }) {
  const [expanded, setExpanded] = useState(false)

  // Group by category
  const byCategory = assets.reduce(
    (acc, asset) => {
      if (!acc[asset.category]) acc[asset.category] = []
      acc[asset.category].push(asset)
      return acc
    },
    {} as Record<string, RobinhoodAssetConfig[]>,
  )

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)

  // Category emojis
  const categoryEmojis: Record<string, string> = {
    layer1: '🌐',
    layer2: '⚡',
    stablecoin: '💵',
    defi: '🏦',
    meme: '🐕',
    other: '📦',
  }

  // Determine address source with emoji
  const getAddressSource = (asset: RobinhoodAssetConfig): { text: string; emoji: string } => {
    if (!asset.depositAddress?.address) {
      return { text: 'No Match', emoji: '⚠️' }
    }

    // Check wallet type to determine source
    const walletType = asset.depositAddress?.walletType

    if (walletType === 'Trading' || walletType === 'Trading Balance') {
      return { text: 'CBP', emoji: '🏦' } // Coinbase Prime
    }

    // Check if it's from OTC list (would have specific markers)
    if (asset.depositAddress?.note?.includes('OTC')) {
      return { text: 'OTC List', emoji: '📋' }
    }

    // Fallback to static
    return { text: 'Static', emoji: '📄' }
  }

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="font-semibold">💎 {assets.length} assets enabled</div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs underline hover:no-underline">
          {expanded ? '▲ Hide Details' : '▼ Show All Assets'}
        </button>
      </div>

      {/* Categories Summary */}
      {!expanded && (
        <div className="space-y-1">
          {sortedCategories.map(([category, categoryAssets]) => (
            <div key={category} className="text-xs">
              <span className="font-medium">
                {categoryEmojis[category] || '📦'} <span className="capitalize">{category}</span>
              </span>
              : {categoryAssets.length} (
              {categoryAssets
                .map((a) => a.symbol)
                .slice(0, 5)
                .join(', ')}
              {categoryAssets.length > 5 ? '...' : ''})
            </div>
          ))}
        </div>
      )}

      {/* Expanded Table View */}
      {expanded && (
        <div className="max-h-96 overflow-y-auto border rounded">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-secondary/95 backdrop-blur border-b">
              <tr>
                <th className="text-left p-1.5 font-semibold w-20">Asset</th>
                <th className="text-left p-1.5 font-semibold w-24">Network</th>
                <th className="text-left p-1.5 font-semibold">Address</th>
                <th className="text-left p-1.5 font-semibold w-28">Source</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([category, categoryAssets]) => (
                <React.Fragment key={category}>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="p-1.5 font-semibold text-xs">
                      {categoryEmojis[category] || '📦'} <span className="capitalize">{category}</span> (
                      {categoryAssets.length})
                    </td>
                  </tr>
                  {categoryAssets
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((asset) => {
                      const source = getAddressSource(asset)
                      return (
                        <tr key={asset.symbol} className="border-t hover:bg-muted/30">
                          <td className="p-1.5">
                            <div className="flex items-center gap-1.5">
                              {asset.logoUrl && (
                                <img
                                  src={asset.logoUrl}
                                  alt={asset.symbol}
                                  className="w-4 h-4 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              <span className="font-medium">{asset.symbol}</span>
                            </div>
                          </td>
                          <td className="p-1.5 text-muted-foreground text-[9px]">{asset.network}</td>
                          <td className="p-1.5 font-mono">
                            {asset.depositAddress?.address ? (
                              <span className="text-muted-foreground">
                                {shortenAddress(asset.depositAddress.address)}
                                {asset.depositAddress?.memo && (
                                  <span className="text-orange-500 ml-1" title={`Memo: ${asset.depositAddress.memo}`}>
                                    📝
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-red-500">❌ Missing</span>
                            )}
                          </td>
                          <td className="p-1.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 whitespace-nowrap ${
                                source.text === 'CBP'
                                  ? 'bg-blue-500/20 text-blue-700'
                                  : source.text === 'OTC List'
                                    ? 'bg-purple-500/20 text-purple-700'
                                    : source.text === 'No Match'
                                      ? 'bg-orange-500/20 text-orange-700'
                                      : 'bg-gray-500/20 text-gray-700'
                              }`}
                            >
                              {source.emoji} {source.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

async function fetchAndShowRegistryStatus() {
  try {
    console.log('[Asset Registry Toast] Fetching /api/robinhood/health...')
    const response = await fetch('/api/robinhood/health')
    console.log('[Asset Registry Toast] Health response status:', response.status)

    if (!response.ok) {
      console.error('[Asset Registry Toast] Health check failed with status:', response.status)
      return
    }

    const data = await response.json()
    console.log('[Asset Registry Toast] Health data received:', {
      initialized: data.registry?.initialized,
      hasDiscovery: !!data.discovery,
      hasPrimeAddresses: !!data.primeAddresses,
      hasSourceBreakdown: !!data.sourceBreakdown,
    })

    if (!data.registry?.initialized) {
      console.error('[Asset Registry Toast] Registry not initialized!')
      toast({
        title: '⚠️ Asset Registry',
        description: 'Registry not initialized. Using static fallback.',
        variant: 'destructive',
      })
      return
    }

    const { validation } = data.registry
    const { sourceBreakdown, discovery, primeAddresses } = data

    if (!validation || validation.totalAssets === 0) {
      toast({
        title: '⚠️ Asset Registry',
        description: 'No assets loaded.',
        variant: 'destructive',
      })
      return
    }

    // Fetch full asset list for expandable view
    const assetsResponse = await fetch('/api/robinhood/assets')
    let assets: RobinhoodAssetConfig[] = []

    if (assetsResponse.ok) {
      const assetsData = await assetsResponse.json()
      assets = assetsData.assets || []

      // Debug: Check what client received
      const clientWalletTypes = assets.reduce(
        (acc, a) => {
          const wt = a.depositAddress?.walletType || 'undefined'
          acc[wt] = (acc[wt] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )
      console.log('[Asset Registry Toast] Client received wallet types:', clientWalletTypes)

      // Debug: Check first asset
      if (assets.length > 0 && assets[0].depositAddress) {
        console.log('[Asset Registry Toast] First asset depositAddress:', {
          symbol: assets[0].symbol,
          hasWalletType: 'walletType' in assets[0].depositAddress,
          walletType: assets[0].depositAddress.walletType,
          keys: Object.keys(assets[0].depositAddress),
        })
      }
    }

    // Use server-calculated breakdown (matches server logs exactly)
    const totalFromRH = discovery?.cryptoAssetsDiscovered || validation.totalAssets
    const fromCBP = sourceBreakdown?.fromCBP || 0
    const fromOTC = sourceBreakdown?.fromOTC || 0
    const fromStatic = sourceBreakdown?.fromStatic || 0
    const noMatch = sourceBreakdown?.noMatch || 0
    const networkMismatch = sourceBreakdown?.networkMismatch || 0

    // Get Prime stats if available
    const primeStats = primeAddresses?.stats
    const totalPrimeWallets = primeStats?.totalWalletsFetched || 0
    const primeAddressesMatched = primeStats?.addressesMatched || 0

    console.log('[Asset Registry Toast] Discovery:', {
      totalAssetPairs: discovery?.totalAssetPairs,
      cryptoAssetsDiscovered: discovery?.cryptoAssetsDiscovered,
    })
    console.log('[Asset Registry Toast] Prime:', {
      totalWalletsFetched: totalPrimeWallets,
      addressesMatched: primeAddressesMatched,
      walletTypes: primeStats?.walletTypeDistribution,
    })
    console.log('[Asset Registry Toast] Breakdown:', {
      totalFromRH,
      fromCBP,
      fromOTC,
      fromStatic,
      noMatch,
      networkMismatch,
    })

    console.log('[Asset Registry Toast] Showing toast now...')
    toast({
      title: '✅ Asset Registry Loaded',
      className: 'max-w-3xl w-auto',
      description: (
        <div className="space-y-3 font-mono text-xs w-full">
          {/* Receipt-style Source Breakdown - Matches Server Logs */}
          <div className="space-y-1 pb-2 border-b bg-muted/20 p-2 rounded">
            <div className="font-semibold mb-2">📡 API Fetch Results:</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-4">
                <span className="whitespace-nowrap">🔍 Discovered (Robinhood API):</span>
                <span className="font-bold text-base tabular-nums">{totalFromRH}</span>
              </div>
              {totalPrimeWallets > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">💼 Prime Wallets Fetched:</span>
                  <span className="font-bold text-base tabular-nums">{totalPrimeWallets}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Source Breakdown */}
          <div className="space-y-1 pb-2 border-b bg-muted/20 p-2 rounded">
            <div className="font-semibold mb-2">📋 Address Sources:</div>
            <div className="space-y-1">
              {fromCBP > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">🏦 CBP (Coinbase Prime):</span>
                  <span className="font-bold text-base text-blue-600 tabular-nums">{fromCBP}</span>
                </div>
              )}
              {fromOTC > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">📋 OTC List:</span>
                  <span className="font-bold text-base text-purple-600 tabular-nums">{fromOTC}</span>
                </div>
              )}
              {fromStatic > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">📄 Static Fallback:</span>
                  <span className="font-bold text-base text-gray-600 tabular-nums">{fromStatic}</span>
                </div>
              )}
              {noMatch > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">⚠️ No Address Match:</span>
                  <span className="font-bold text-base text-orange-600 tabular-nums">{noMatch}</span>
                </div>
              )}
              {networkMismatch > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">⚠️ Network Mismatch:</span>
                  <span className="font-bold text-base text-red-600 tabular-nums">{networkMismatch}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-1 pb-2 border-b bg-muted/20 p-2 rounded">
            <div className="font-semibold mb-2">📊 Registry Status:</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-4">
                <span className="whitespace-nowrap">✅ Ready to Use:</span>
                <span className="font-bold text-base text-green-600 tabular-nums">
                  {fromCBP + fromOTC + fromStatic}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="whitespace-nowrap">⚠️ Missing Address:</span>
                <span className="font-bold text-base text-orange-600 tabular-nums">{noMatch}</span>
              </div>
              {validation.errors > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <span className="whitespace-nowrap">❌ Errors:</span>
                  <span className="font-bold text-base text-red-500 tabular-nums">{validation.errors}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Asset List */}
          {assets.length > 0 && <AssetRegistryDetails assets={assets} />}
        </div>
      ),
      duration: 15000, // 15 seconds (more time to explore)
    })
  } catch (error) {
    console.error('[Asset Registry Toast] Failed to fetch status:', error)
  }
}
