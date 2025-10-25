'use client'

import type { RobinhoodAssetConfig } from '@/libs/robinhood/lib/types'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface RegistryStatus {
  totalAssets: number
  fromCBP: number
  fromOTC: number
  fromFallback: number
  noMatch: number
  enabled: number
}

type ViewState = 'compact' | 'open' | 'expanded'

export function AssetRegistryToast() {
  const [status, setStatus] = useState<RegistryStatus | null>(null)
  const [viewState, setViewState] = useState<ViewState>('compact')
  const [detailsData, setDetailsData] = useState<any>(null)
  const [assets, setAssets] = useState<RobinhoodAssetConfig[]>([])
  const [missingAssets, setMissingAssets] = useState<RobinhoodAssetConfig[]>([])

  // Register this instance for external control
  useRegistryControl(setViewState)

  useEffect(() => {
    console.log('[Asset Registry Status] Component mounted, fetching status...')
    
    // Fetch registry status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/robinhood/health')
        const data = await response.json()
        
        console.log('[Asset Registry Status] Health data:', data)
        
        if (data.registry?.initialized && data.registry.validation) {
          const validation = data.registry.validation
          const sourceBreakdown = data.sourceBreakdown || {}
          
          setStatus({
            totalAssets: validation.totalAssets || 0,
            fromCBP: sourceBreakdown.fromCBP || 0,
            fromOTC: sourceBreakdown.fromOTC || 0,
            fromFallback: sourceBreakdown.fromFallback || 0,
            noMatch: sourceBreakdown.noMatch || 0,
            enabled: validation.enabledAssets || 0,
          })
          setDetailsData(data)
          console.log('[Asset Registry Status] Status set:', {
            totalAssets: validation.totalAssets,
            enabled: validation.enabledAssets,
          })
        } else {
          console.log('[Asset Registry Status] Registry not initialized or invalid data')
        }
      } catch (error) {
        console.error('[Asset Registry Status] Failed to fetch:', error)
      }
    }
    
    // Fetch after a short delay to let server initialize
    const timer = setTimeout(fetchStatus, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch assets when expanding to table view
  useEffect(() => {
    if (viewState === 'expanded' && assets.length === 0) {
      fetch('/api/robinhood/assets')
        .then(r => r.json())
        .then(d => {
          setAssets(d.assets || [])
          setMissingAssets(d.missingAssets || [])
        })
        .catch(console.error)
    }
  }, [viewState, assets.length])

  if (!status) return null

  const handleToggle = () => {
    if (viewState === 'compact') {
      setViewState('open')
    } else if (viewState === 'open') {
      setViewState('expanded')
    } else {
      setViewState('compact')
    }
  }

  return (
    <>
      {/* Compact: Floating Status Button */}
      {viewState === 'compact' && (
        <Button
          onClick={handleToggle}
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 shadow-lg border-2 hover:scale-105 transition-transform bg-white"
        >
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-semibold">Registry:</span>
            {status.fromCBP > 0 && <span className="text-blue-600">🏦{status.fromCBP}</span>}
            {status.fromOTC > 0 && <span className="text-purple-600">📋{status.fromOTC}</span>}
            {status.fromFallback > 0 && <span className="text-cyan-600">🔄{status.fromFallback}</span>}
            {status.noMatch > 0 && <span className="text-orange-600">⚠️{status.noMatch}</span>}
          </div>
        </Button>
      )}

      {/* Open: Summary Panel */}
      {viewState === 'open' && (
        <Card className="fixed top-4 right-4 z-50 shadow-2xl border-2 w-80 animate-in slide-in-from-top-2 fade-in duration-200 bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Asset Registry</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggle}
                  className="px-2 py-1 hover:bg-muted rounded text-xs text-emerald-600 font-medium"
                  title="Expand to see all assets"
                >
                  Show All
                </button>
                <button
                  onClick={() => setViewState('compact')}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <RegistrySummary data={detailsData} status={status} />
          </div>
        </Card>
      )}

      {/* Expanded: Full Table */}
      {viewState === 'expanded' && (
        <Card className="fixed top-4 right-4 z-50 shadow-2xl border-2 w-[500px] max-h-[85vh] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Asset Registry - All Assets</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewState('open')}
                  className="px-2 py-1 hover:bg-muted rounded text-xs text-emerald-600 font-medium"
                  title="Collapse to summary"
                >
                  Summary
                </button>
                <button
                  onClick={() => setViewState('compact')}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[calc(85vh-80px)] overflow-y-auto">
              <AssetTable assets={assets} missingAssets={missingAssets} />
            </div>
          </div>
        </Card>
      )}
    </>
  )
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function RegistrySummary({ data, status }: { data: any; status: RegistryStatus }) {
  const { discovery, primeAddresses } = data || {}
  const primeStats = primeAddresses?.stats
  const totalPrimeWallets = primeStats?.totalWalletsFetched || 0

  return (
    <div className="space-y-3 text-xs font-mono">
      {/* API Fetch Results */}
      <div className="space-y-1 pb-2 border-b bg-muted/20 p-2 rounded">
        <div className="font-semibold mb-2">📡 API Fetch Results:</div>
        <div className="flex justify-between items-center gap-4">
          <span>🔍 Discovered:</span>
          <span className="font-bold text-base tabular-nums">{status.totalAssets}</span>
        </div>
        {totalPrimeWallets > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>💼 Prime Wallets:</span>
            <span className="font-bold text-base tabular-nums">{totalPrimeWallets}</span>
          </div>
        )}
      </div>

      {/* Address Source Breakdown */}
      <div className="space-y-1 pb-2 border-b bg-muted/20 p-2 rounded">
        <div className="font-semibold mb-2">📋 Address Sources:</div>
        {status.fromCBP > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>🏦 CBP:</span>
            <span className="font-bold text-base text-blue-600 tabular-nums">{status.fromCBP}</span>
          </div>
        )}
        {status.fromOTC > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>📋 OTC List:</span>
            <span className="font-bold text-base text-purple-600 tabular-nums">{status.fromOTC}</span>
          </div>
        )}
        {status.fromFallback > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>🔄 Fallback:</span>
            <span className="font-bold text-base text-cyan-600 tabular-nums">{status.fromFallback}</span>
          </div>
        )}
        {status.noMatch > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>⚠️ No Match:</span>
            <span className="font-bold text-base text-orange-600 tabular-nums">{status.noMatch}</span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="space-y-1 bg-muted/20 p-2 rounded">
        <div className="font-semibold mb-2">📊 Status:</div>
        <div className="flex justify-between items-center gap-4">
          <span>✅ Ready:</span>
          <span className="font-bold text-base text-green-600 tabular-nums">{status.enabled}</span>
        </div>
        {status.noMatch > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span>⚠️ Missing:</span>
            <span className="font-bold text-base text-orange-600 tabular-nums">{status.noMatch}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AssetTable({ assets, missingAssets }: { assets: RobinhoodAssetConfig[]; missingAssets: RobinhoodAssetConfig[] }) {
  // Determine address source
  const getAddressSource = (asset: RobinhoodAssetConfig): { text: string; color: string } => {
    if (!asset.depositAddress?.address) {
      return { text: '⚠️ No Match', color: 'bg-orange-500/20 text-orange-700' }
    }

    const walletType = asset.depositAddress?.walletType
    const note = asset.depositAddress?.note || ''

    if (walletType === 'Trading' || walletType === 'Trading Balance') {
      return { text: '🏦 CBP', color: 'bg-blue-500/20 text-blue-700' }
    }

    if (note.toLowerCase().includes('fallback')) {
      return { text: '🔄 Fallback', color: 'bg-cyan-500/20 text-cyan-700' }
    }

    if (walletType === 'OTC' || note.includes('OTC')) {
      return { text: '📋 OTC', color: 'bg-purple-500/20 text-purple-700' }
    }

    return { text: '🏦 Other', color: 'bg-blue-400/20 text-blue-600' }
  }

  return (
    <div className="border rounded">
      <table className="w-full text-[10px]">
        <thead className="sticky top-0 bg-secondary/95 backdrop-blur border-b">
          <tr>
            <th className="text-left p-1.5 font-semibold w-20">Asset</th>
            <th className="text-left p-1.5 font-semibold w-24">Network</th>
            <th className="text-left p-1.5 font-semibold">Address</th>
            <th className="text-left p-1.5 font-semibold w-24">Source</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const source = getAddressSource(asset)
            return (
              <tr key={asset.symbol} className="border-t hover:bg-muted/30">
                <td className="p-1.5 font-medium">{asset.symbol}</td>
                <td className="p-1.5 text-muted-foreground text-[9px]">{asset.network}</td>
                <td className="p-1.5 font-mono text-muted-foreground text-[9px]">
                  {asset.depositAddress?.address ? shortenAddress(asset.depositAddress.address) : '—'}
                </td>
                <td className="p-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${source.color}`}>
                    {source.text}
                  </span>
                </td>
              </tr>
            )
          })}
          
          {/* Missing assets */}
          {missingAssets.length > 0 && (
            <>
              <tr className="bg-orange-50 border-t-2 border-orange-200">
                <td colSpan={4} className="p-2 font-semibold text-xs text-orange-900">
                  ⚠️ Missing Addresses ({missingAssets.length})
                </td>
              </tr>
              {missingAssets.map((asset) => (
                <tr key={asset.symbol} className="border-t hover:bg-orange-50/30 text-muted-foreground">
                  <td className="p-1.5 font-medium">{asset.symbol}</td>
                  <td className="p-1.5 text-[9px]">{asset.network}</td>
                  <td className="p-1.5 text-orange-500 text-[9px]">❌ No address</td>
                  <td className="p-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-700">
                      ⚠️ No Match
                    </span>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Global registry instance reference for external control
let globalSetViewState: ((state: ViewState) => void) | null = null

export function openAssetRegistry() {
  if (globalSetViewState) {
    globalSetViewState('expanded')
  }
}

// Hook to register the state setter
function useRegistryControl(setState: (state: ViewState) => void) {
  useEffect(() => {
    globalSetViewState = setState
    return () => {
      globalSetViewState = null
    }
  }, [setState])
}

// Add this to AssetRegistryToast component to enable external control
// (Will be called in the component above)

