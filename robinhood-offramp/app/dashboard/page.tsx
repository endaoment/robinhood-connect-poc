'use client'

import { useState } from 'react'
import { AssetMetadata } from '@/types/robinhood'
import { AssetSelector } from '@/components/asset-selector'
import { AssetIcon } from '@/components/asset-icon'
import { useAssetSelection } from '@/hooks/use-asset-selection'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { TransactionHistory } from '@/components/transaction-history'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { ROBINHOOD_ASSET_ADDRESSES, getSupportedAssets, getSupportedNetworks } from '@/lib/robinhood-asset-addresses'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
  Info,
  Loader2,
  TrendingUp,
} from 'lucide-react'

export default function Dashboard() {
  const { toast } = useToast()
  const [showHistory, setShowHistory] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Asset selection state
  const { selection, selectAsset, clearSelection, isSelected } = useAssetSelection()
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Old flow state
  const [loading, setLoading] = useState(false)

  // Get all supported assets and networks
  const supportedAssets = getSupportedAssets()
  const supportedNetworks = getSupportedNetworks()

  // Missing assets (hardcoded for now since export isn't working)
  const missingAssets = ['MEW', 'PENGU', 'PNUT', 'POPCAT', 'WIF', 'TON']

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
    setStep('confirm')
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
      const response = await fetch('/api/robinhood/generate-offramp-url', {
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
        throw new Error(result.error || 'Failed to generate offramp URL')
      }

      // Open Robinhood Connect URL
      window.open(result.data.url, '_blank')

      toast({
        title: 'Opening Robinhood...',
        description: `Transfer ${selection.asset.symbol} from your Robinhood account`,
      })
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

  /**
   * OLD FLOW - Handle Give with Robinhood button
   */
  const handleGiveWithRobinhood = async () => {
    const startTime = Date.now()
    console.log('\n' + '='.repeat(80))
    console.log('🎯 [CLIENT] User clicked "Give with Robinhood"')
    console.log('='.repeat(80))

    setLoading(true)
    try {
      console.log('📊 [CLIENT] Preparing request:')
      console.log(`   Networks: ${supportedNetworks.join(', ')}`)
      console.log(`   Networks count: ${supportedNetworks.length}`)

      // Call server-side API to generate offramp URL
      console.log('\n📤 [CLIENT] Calling API: /api/robinhood/generate-offramp-url')
      const apiStartTime = Date.now()

      const response = await fetch('/api/robinhood/generate-offramp-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supportedNetworks,
        }),
      })

      const apiDuration = Date.now() - apiStartTime
      console.log(`📥 [CLIENT] API response received in ${apiDuration}ms`)
      console.log(`   Status: ${response.status} ${response.statusText}`)

      const result = await response.json()
      console.log('   Response body:', JSON.stringify(result, null, 2))

      if (!response.ok || !result.success) {
        console.error('❌ [CLIENT] API call failed')
        throw new Error(result.error || 'Failed to generate offramp URL')
      }

      console.log('✅ [CLIENT] URL generated successfully')
      console.log(`   📋 Reference ID: ${result.data.referenceId}`)
      console.log(`   🔗 URL: ${result.data.url.substring(0, 100)}...`)

      // Open Robinhood Connect URL
      console.log('\n🌐 [CLIENT] Opening Robinhood Connect in new tab...')
      window.open(result.data.url, '_blank')

      const totalDuration = Date.now() - startTime
      console.log(`\n✅ [CLIENT] Flow completed successfully in ${totalDuration}ms`)
      console.log('='.repeat(80) + '\n')

      toast({
        title: 'Opening Robinhood...',
        description: 'Choose any crypto from your Robinhood account. We support all major networks!',
      })
    } catch (error: any) {
      const totalDuration = Date.now() - startTime
      console.error('\n❌ [CLIENT] Transfer failed')
      console.error(`   Error: ${error.message}`)
      console.error(`   Duration: ${totalDuration}ms`)
      console.log('='.repeat(80) + '\n')

      toast({
        title: 'Transfer failed',
        description: error.message || 'Failed to start transfer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // OLD FLOW (for feature flag fallback)
  if (!FEATURE_FLAGS.assetPreselection) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Give Crypto with Robinhood</h1>
            <p className="text-zinc-600 mt-2">
              Transfer crypto from your Robinhood account to support causes you care about
            </p>
          </div>

          {/* Main Actions Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Transfer from Robinhood Card */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl">One-Click Crypto Giving</CardTitle>
                <CardDescription>
                  We support all major blockchain networks. Choose any crypto in your Robinhood account!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Give with Robinhood Button - Primary CTA */}
                <Button
                  onClick={handleGiveWithRobinhood}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Opening Robinhood...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Give with Robinhood
                    </>
                  )}
                </Button>

                {/* Rest of old dashboard content... */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Classic Flow:</strong> Feature flag is OFF. Using multi-network approach.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Your Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-zinc-900">$0.00</div>
                  <div className="text-sm text-zinc-500">Total donated</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-700">0</div>
                  <div className="text-sm text-zinc-500">Transfers completed</div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowHistory(true)}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History Modal */}
          <TransactionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </div>
      </div>
    )
  }

  // NEW FLOW (with asset pre-selection)
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900">Give Crypto with Robinhood</h1>
        <p className="text-zinc-600 mb-8">Choose your cryptocurrency and complete your donation</p>

        {/* Asset Selection Step */}
        {step === 'select' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Asset to Donate</CardTitle>
                <CardDescription>
                  Choose which cryptocurrency you&apos;d like to contribute from your Robinhood account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetSelector selectedAsset={selection?.asset.symbol} onSelect={handleAssetSelect} variant="grid" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && selection && (
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to asset selection
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Ready to Connect Robinhood</CardTitle>
                <CardDescription>
                  You&apos;ve selected {selection.asset.name} ({selection.asset.symbol})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Selected Asset Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <AssetIcon symbol={selection.asset.symbol} icon={selection.asset.icon} size={64} />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selection.asset.name}</h3>
                      <p className="text-zinc-600">
                        {selection.asset.symbol} on {selection.asset.network}
                      </p>
                      <p className="text-sm text-zinc-600 mt-1">{selection.asset.description}</p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">What happens next:</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        1
                      </span>
                      <span>You&apos;ll be redirected to Robinhood to authenticate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        2
                      </span>
                      <span>Review and confirm your {selection.asset.symbol} transfer amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        3
                      </span>
                      <span>Complete the transfer in the Robinhood app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        4
                      </span>
                      <span>Return here to see your donation confirmed</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleContinue} size="lg" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Continue to Robinhood'
                    )}
                  </Button>
                  <Button onClick={handleBack} variant="outline" size="lg" disabled={isLoading}>
                    Change Asset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction History */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest crypto transfers and donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-zinc-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transfers yet</p>
                <p className="text-sm">Select an asset above to start your first donation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History Modal */}
      <TransactionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}
