'use client'

import { AssetIcon } from '@/components/asset-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAssetSelection } from '@/hooks/use-asset-selection'
import { useToast } from '@/hooks/use-toast'
import { getSupportedAssets, getSupportedNetworks } from '@/lib/robinhood-asset-addresses'
import { getAssetMetadata, getEnabledAssets, searchAssets } from '@/lib/robinhood-asset-metadata'
import { AssetMetadata } from '@/types/robinhood'
import { ChevronDown, ExternalLink, Loader2, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function Dashboard() {
  const { toast } = useToast()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Asset selection state
  const { selection, selectAsset, clearSelection, isSelected } = useAssetSelection()
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search dropdown state
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Get all supported assets and networks
  const supportedAssets = getSupportedAssets()
  const supportedNetworks = getSupportedNetworks()

  // Missing assets (hardcoded for now since export isn't working)
  const missingAssets = ['MEW', 'PENGU', 'PNUT', 'POPCAT', 'WIF', 'TON']

  // Filtered assets based on search
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) {
      return getEnabledAssets()
    }
    return searchAssets(searchQuery)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check for successful order callback and show toast
  useEffect(() => {
    const orderSuccess = localStorage.getItem('robinhood_order_success')

    if (orderSuccess) {
      try {
        const orderDetails = JSON.parse(orderSuccess)
        console.log('🎉 [DASHBOARD] Order success detected:', orderDetails)
        console.log('🎉 [DASHBOARD] Asset info:', {
          asset: orderDetails.asset,
          network: orderDetails.network,
          amount: orderDetails.amount,
          hasAsset: !!orderDetails.asset,
          hasNetwork: !!orderDetails.network,
        })

        // Calculate time elapsed if we have both timestamps
        const timeElapsed =
          orderDetails.initiatedAt && orderDetails.completedAt
            ? Math.round(
                (new Date(orderDetails.completedAt).getTime() - new Date(orderDetails.initiatedAt).getTime()) / 1000,
              )
            : null

        // Get asset metadata for icon and details
        const assetInfo = orderDetails.asset ? getAssetMetadata(orderDetails.asset) : null

        // Show dismissible toast with rich order details
        toast({
          title: '🎉 Transfer Completed Successfully!',
          description: (
            <div className="space-y-3 mt-2">
              {/* Transaction Summary with Asset Icon */}
              {(orderDetails.asset || orderDetails.network) && (
                <div className="border-l-4 border-emerald-500 bg-emerald-50 p-3 rounded">
                  <div className="flex items-center gap-3 mb-2">
                    {assetInfo && <AssetIcon symbol={assetInfo.symbol} icon={assetInfo.icon} size={32} />}
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-emerald-900">Transaction Summary</div>
                      {assetInfo && <div className="text-xs text-emerald-700">{assetInfo.name}</div>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {orderDetails.asset && (
                      <div className="text-sm text-emerald-800">
                        <strong>Asset:</strong> {orderDetails.asset}
                        {orderDetails.amount && orderDetails.amount !== '' && (
                          <span className="font-semibold"> • {orderDetails.amount}</span>
                        )}
                      </div>
                    )}
                    {orderDetails.network && (
                      <div className="text-sm text-emerald-800">
                        <strong>Network:</strong> {orderDetails.network}
                      </div>
                    )}
                    {orderDetails.status && orderDetails.status !== 'UNKNOWN' && (
                      <div className="text-xs text-emerald-700 mt-1">
                        <strong>Status:</strong> {orderDetails.status.replace('ORDER_STATUS_', '').replace(/_/g, ' ')}
                      </div>
                    )}
                    {!orderDetails.amount && orderDetails.asset && (
                      <div className="text-xs text-emerald-600 italic">(Amount being fetched from Robinhood...)</div>
                    )}
                  </div>
                  {timeElapsed !== null && (
                    <div className="text-xs text-emerald-700 mt-1">⚡ Completed in {timeElapsed}s</div>
                  )}
                </div>
              )}

              {/* Order IDs */}
              <div className="text-sm">
                <strong>Order Details:</strong>
              </div>
              {orderDetails.orderId && (
                <div className="text-xs font-mono bg-zinc-100 p-2 rounded border border-zinc-200">
                  <strong className="text-zinc-700">Order ID:</strong>
                  <div className="text-zinc-900 mt-1 break-all">{orderDetails.orderId}</div>
                </div>
              )}
              {orderDetails.connectId && (
                <div className="text-xs font-mono bg-zinc-100 p-2 rounded border border-zinc-200">
                  <strong className="text-zinc-700">Connect ID:</strong>
                  <div className="text-zinc-900 mt-1 break-all">{orderDetails.connectId}</div>
                </div>
              )}
              {orderDetails.depositQuoteId && (
                <div className="text-xs font-mono bg-zinc-100 p-2 rounded border border-zinc-200">
                  <strong className="text-zinc-700">Deposit Quote ID:</strong>
                  <div className="text-zinc-900 mt-1 break-all">{orderDetails.depositQuoteId}</div>
                </div>
              )}

              {/* Success message */}
              <div className="text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-200">
                ✅ Your crypto will arrive at Coinbase Prime within minutes. Click anywhere to dismiss.
              </div>
            </div>
          ),
          duration: Infinity, // Toast stays until manually dismissed
          variant: 'default',
        })

        // Clear the order success from localStorage after showing
        localStorage.removeItem('robinhood_order_success')

        // Also clear other transfer-related items
        localStorage.removeItem('robinhood_selected_asset')
        localStorage.removeItem('robinhood_selected_network')
        localStorage.removeItem('robinhood_transfer_amount')
        localStorage.removeItem('robinhood_connect_id')
        localStorage.removeItem('robinhood_transfer_pending')
        localStorage.removeItem('robinhood_transfer_timestamp')
      } catch (error) {
        console.error('Failed to parse order success details:', error)
        localStorage.removeItem('robinhood_order_success')
      }
    }
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  /**
   * Handle asset selection - NEW FLOW
   */
  const handleAssetSelect = (asset: AssetMetadata) => {
    selectAsset(asset)
    setShowDropdown(false)
    setSearchQuery('')
    setError(null)

    // Log asset selection
    console.log('[Analytics] Asset selected:', {
      symbol: asset.symbol,
      name: asset.name,
      network: asset.network,
      category: asset.category,
    })
  }

  /**
   * Handle clearing selection
   */
  const handleClearSelection = () => {
    clearSelection()
    setSearchQuery('')
    setError(null)
  }

  /**
   * Handle going back to selection - NEW FLOW
   */
  const handleBack = () => {
    setStep('select')
    setError(null)
  }

  /**
   * Handle continue to Robinhood - NEW FLOW
   */
  const handleContinue = async () => {
    if (!selection) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('[Analytics] Proceeding to Robinhood:', {
        asset: selection.asset.symbol,
        network: selection.asset.network,
      })

      // TODO: Call URL generation API (Sub-Plan 4)
      // For now, use the old multi-network approach as fallback
      const response = await fetch('/api/robinhood/generate-onramp-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supportedNetworks,
          // In Sub-Plan 4, we'll change this to pass selected asset
          selectedAsset: selection.asset.symbol,
          selectedNetwork: selection.asset.network,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate onramp URL')
      }

      // Store transfer info in localStorage for callback recovery
      console.log('[Storage] Saving transfer info to localStorage for callback')
      localStorage.setItem('robinhood_selected_asset', selection.asset.symbol)
      localStorage.setItem('robinhood_selected_network', selection.asset.network)
      localStorage.setItem('robinhood_connect_id', result.data.connectId || '')

      // Debug: Verify data was saved
      console.log('[Storage] Verification:', {
        asset: localStorage.getItem('robinhood_selected_asset'),
        network: localStorage.getItem('robinhood_selected_network'),
        connectId: localStorage.getItem('robinhood_connect_id'),
      })

      // Open Robinhood Connect URL
      console.log('[Navigation] Opening Robinhood in new tab')
      window.open(result.data.url, '_blank')

      // Show instructions since Robinhood won't redirect back
      toast({
        title: 'Complete your transfer in Robinhood',
        description: `After transferring ${selection.asset.symbol}, close that tab and return here. Your donation will arrive at Coinbase Prime within minutes.`,
        duration: 10000, // Show for 10 seconds
      })

      // Mark transfer as pending in localStorage
      localStorage.setItem('robinhood_transfer_pending', 'true')
      localStorage.setItem('robinhood_transfer_timestamp', Date.now().toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast({
        title: 'Transfer failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // NEW FLOW (with asset pre-selection)
  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 pt-[40vh]">
      <div className="w-full max-w-2xl h-fit">
        {/* Search Bar / Selected Asset Card - Always in same position */}
        {!selection ? (
          <div ref={searchRef} className="relative">
            {/* Search Input */}
            <Card className="shadow-2xl border-2 border-zinc-200 hover:border-emerald-500 transition-colors">
              <CardContent className="p-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for a cryptocurrency to transfer..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full h-14 text-lg pl-12 pr-12 border-zinc-300 focus:border-emerald-500"
                    aria-label="Search cryptocurrencies"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"
                    aria-label="Toggle dropdown"
                  >
                    <ChevronDown
                      className={`h-5 w-5 text-zinc-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Dropdown with Assets - Appears below search */}
            {showDropdown && (
              <Card className="absolute top-full mt-4 w-full shadow-2xl z-50 overflow-hidden animate-in fade-in duration-250">
                <CardContent className="p-0">
                  {filteredAssets.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <p className="text-zinc-500">No assets found matching &quot;{searchQuery}&quot;</p>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setShowDropdown(true)
                        }}
                        className="text-emerald-600 hover:underline mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredAssets.map((asset) => (
                        <button
                          key={`${asset.symbol}-${asset.network}`}
                          onClick={() => handleAssetSelect(asset)}
                          className="w-full p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0 text-left"
                        >
                          <AssetIcon symbol={asset.symbol} icon={asset.icon} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-zinc-900">{asset.name}</div>
                            <div className="text-sm text-zinc-500">
                              {asset.symbol} · {asset.network}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results count */}
                  {filteredAssets.length > 0 && (
                    <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-center text-sm text-zinc-600">
                      {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Selected Asset Card - Same position as search */
          <Card className="shadow-2xl border-2 border-emerald-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 h-14">
                <AssetIcon symbol={selection.asset.symbol} icon={selection.asset.icon} size={56} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-zinc-900 truncate">{selection.asset.name}</h3>
                  <p className="text-sm text-zinc-600 truncate">
                    {selection.asset.symbol} on {selection.asset.network}
                  </p>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Clear selection"
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transfer Button - Only appears when asset selected, below the card */}
        {selection && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-250">
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full text-xl py-8 bg-emerald-600 hover:bg-emerald-700 shadow-2xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Connecting to Robinhood...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-3 h-6 w-6" />
                  Donate from Robinhood
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Card className="border-2 border-red-300 bg-red-50">
                <CardContent className="p-4">
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
