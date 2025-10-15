'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { getDepositAddress, getAddressTag } from '@/lib/network-addresses'
import type { CallbackParams, DepositAddressResponse, SupportedNetwork } from '@/types/robinhood'
import { AlertCircle, ArrowLeft, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface CallbackState {
  loading: boolean
  error: string | null
  depositAddress: DepositAddressResponse | null
  callbackParams: CallbackParams | null
}

function CallbackPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    depositAddress: null,
    callbackParams: null,
  })

  const [copied, setCopied] = useState(false)

  // Parse and validate callback parameters
  const parseCallbackParams = (): CallbackParams | null => {
    const assetCode = searchParams.get('assetCode')
    const assetAmount = searchParams.get('assetAmount')
    const network = searchParams.get('network')

    if (!assetCode || !assetAmount || !network) {
      return null
    }

    // Validate parameter formats
    if (!/^[A-Z]{2,10}$/.test(assetCode)) {
      return null
    }

    if (!/^\d+(\.\d+)?$/.test(assetAmount) || parseFloat(assetAmount) <= 0) {
      return null
    }

    if (!/^[A-Z_]+$/.test(network)) {
      return null
    }

    return { assetCode, assetAmount, network }
  }

  // Get deposit address from pre-configured addresses
  const getDepositAddressForNetwork = (callbackParams: CallbackParams): DepositAddressResponse => {
    try {
      const depositAddress = getDepositAddress(callbackParams.network as SupportedNetwork)
      const addressTag = getAddressTag(callbackParams.network as SupportedNetwork)

      return {
        address: depositAddress,
        addressTag,
        assetCode: callbackParams.assetCode,
        assetAmount: callbackParams.assetAmount,
        networkCode: callbackParams.network,
      }
    } catch (error: any) {
      console.error('Failed to get deposit address:', error)
      throw new Error(error.message || 'Deposit address not configured for this network')
    }
  }

  // Copy address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Deposit address copied to clipboard',
      })

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please manually copy the address',
        variant: 'destructive',
      })
    }
  }

  // Get blockchain explorer URL for the network
  const getExplorerUrl = (network: string, address: string): string | null => {
    const explorers: Record<string, string> = {
      ETHEREUM: `https://etherscan.io/address/${address}`,
      POLYGON: `https://polygonscan.com/address/${address}`,
      SOLANA: `https://solscan.io/account/${address}`,
      BITCOIN: `https://blockstream.info/address/${address}`,
      LITECOIN: `https://blockchair.com/litecoin/address/${address}`,
      DOGECOIN: `https://blockchair.com/dogecoin/address/${address}`,
    }

    return explorers[network] || null
  }

  // Main effect to handle callback processing
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse callback parameters
        const callbackParams = parseCallbackParams()

        if (!callbackParams) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Invalid callback parameters. The redirect from Robinhood was incomplete or malformed.',
          }))
          return
        }

        setState((prev) => ({ ...prev, callbackParams }))

        // Get pre-configured deposit address for the selected network
        const depositAddress = getDepositAddressForNetwork(callbackParams)

        setState((prev) => ({
          ...prev,
          loading: false,
          depositAddress,
        }))

        // Clean up localStorage (referenceId no longer needed after callback)
        localStorage.removeItem('robinhood_reference_id')
      } catch (error: any) {
        console.error('Callback processing failed:', error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'An unexpected error occurred while processing your transfer.',
        }))
      }
    }

    processCallback()
  }, [searchParams])

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Processing your transfer...</h2>
                <p className="text-sm text-zinc-600 mt-2">
                  We're setting up your deposit address. This should only take a moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-600">Transfer Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>

              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (state.depositAddress && state.callbackParams) {
    const explorerUrl = getExplorerUrl(state.depositAddress.networkCode, state.depositAddress.address)

    return (
      <div className="min-h-screen bg-zinc-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <div>
                  <CardTitle className="text-emerald-600">Transfer Ready!</CardTitle>
                  <CardDescription>
                    Your deposit address has been generated. Complete your transfer by sending crypto to this address.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Transfer Summary */}
              <div className="bg-zinc-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Transfer Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Asset:</span>
                    <div className="font-medium">{state.depositAddress.assetCode}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Amount:</span>
                    <div className="font-medium">{state.depositAddress.assetAmount}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Network:</span>
                    <Badge variant="secondary">{state.depositAddress.networkCode}</Badge>
                  </div>
                  <div>
                    <span className="text-zinc-500">Status:</span>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      Ready for Transfer
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Deposit Address */}
              <div>
                <h3 className="font-semibold mb-3">Deposit Address</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">
                      Send {state.depositAddress.assetCode} to this address:
                    </span>
                    {explorerUrl && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(explorerUrl, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-zinc-100 p-3 rounded text-sm font-mono break-all">
                      {state.depositAddress.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(state.depositAddress!.address)}
                      className="shrink-0"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Address Tag (for assets that require it) */}
                  {state.depositAddress.addressTag && (
                    <div className="mt-4">
                      <div className="text-sm text-zinc-500 mb-2">Memo/Tag (Required):</div>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-zinc-100 p-3 rounded text-sm font-mono">
                          {state.depositAddress.addressTag}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(state.depositAddress!.addressTag!)}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Instructions</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>
                    1. <strong>Only send {state.depositAddress.assetCode}</strong> to this address on the{' '}
                    <strong>{state.depositAddress.networkCode}</strong> network.
                  </div>
                  <div>
                    2.{' '}
                    <strong>
                      Send exactly {state.depositAddress.assetAmount} {state.depositAddress.assetCode}
                    </strong>{' '}
                    as specified in your Robinhood transfer.
                  </div>
                  {state.depositAddress.addressTag && (
                    <div>
                      3. <strong>Include the memo/tag</strong> when sending the transaction.
                    </div>
                  )}
                  <div>
                    {state.depositAddress.addressTag ? '4' : '3'}. The transfer may take several minutes to complete
                    depending on network congestion.
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button onClick={() => router.push('/dashboard')} className="flex-1">
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(state.depositAddress!.address)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fallback (should not reach here)
  return null
}

// Loading component for Suspense boundary
function CallbackLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Loading...</h2>
              <p className="text-sm text-zinc-600 mt-2">Please wait while we prepare your transfer.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main export wrapped in Suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackPageContent />
    </Suspense>
  )
}
