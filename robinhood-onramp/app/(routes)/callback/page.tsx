'use client'

import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { useToast } from '@/app/hooks/use-toast'
import { pledgeService } from '@/libs/robinhood'
import { getDepositAddress, getDepositMemo } from '@/libs/robinhood/lib/assets/asset-helpers'
import type { CallbackParams, DepositAddressResponse } from '@/app/types/robinhood'
import { AlertCircle, ArrowLeft, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface CallbackState {
  loading: boolean
  error: string | null
  depositAddress: DepositAddressResponse | null
  callbackParams: CallbackParams | null
  needsAmountConfirmation: boolean
  confirmedAmount: string | null
  creatingPledge: boolean
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
    needsAmountConfirmation: false,
    confirmedAmount: null,
    creatingPledge: false,
  })

  const [copied, setCopied] = useState(false)
  const [amountInput, setAmountInput] = useState('')

  // Parse and validate callback parameters
  const parseCallbackParams = (): CallbackParams | null => {
    // Log ALL query parameters for debugging
    console.log('🔍 [CALLBACK] Received query parameters:')
    const allParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      allParams[key] = value
      console.log(`  ${key}: ${value}`)
    })
    console.log('Full params object:', allParams)
    console.log('📊 [CALLBACK] Total params received:', searchParams.size)
    console.log('📋 [CALLBACK] All param keys:', Array.from(searchParams.keys()).join(', '))

    const assetCode = searchParams.get('assetCode')
    const assetAmount = searchParams.get('assetAmount')
    const network = searchParams.get('network')

    // Check for new-style callback params (orderId, connectId, or depositQuoteId)
    const orderId = searchParams.get('orderId')
    const connectId = searchParams.get('connectId')
    const depositQuoteId = searchParams.get('depositQuoteId')

    if (orderId || connectId || depositQuoteId) {
      console.log('📝 [CALLBACK] Received new-style callback with order/connect IDs')
      console.log(`  orderId: ${orderId}`)
      console.log(`  connectId: ${connectId}`)
      console.log(`  depositQuoteId: ${depositQuoteId}`)

      // For now, we'll handle this differently
      // The transfer already completed (wallet address was in URL)
      // We just need to show confirmation
      return null // Will trigger special handling
    }

    if (!assetCode || !assetAmount || !network) {
      console.log('⚠️ [CALLBACK] Missing required old-style parameters')
      return null
    }

    // Validate parameter formats
    if (!/^[A-Z]{2,10}$/.test(assetCode)) {
      console.log(`❌ [CALLBACK] Invalid assetCode format: ${assetCode}`)
      return null
    }

    if (!/^\d+(\.\d+)?$/.test(assetAmount) || parseFloat(assetAmount) <= 0) {
      console.log(`❌ [CALLBACK] Invalid assetAmount: ${assetAmount}`)
      return null
    }

    if (!/^[A-Z_]+$/.test(network)) {
      console.log(`❌ [CALLBACK] Invalid network format: ${network}`)
      return null
    }

    console.log('✅ [CALLBACK] Valid old-style callback parameters')
    return { assetCode, assetAmount, network }
  }

  // Get deposit address for specific asset
  const getDepositAddressForAsset = (callbackParams: CallbackParams): DepositAddressResponse => {
    try {
      // Get asset-specific address (not network-based)
      const address = getDepositAddress(callbackParams.assetCode)
      const memo = getDepositMemo(callbackParams.assetCode)

      if (!address) {
        throw new Error(`Deposit address not configured for asset: ${callbackParams.assetCode}`)
      }

      return {
        address,
        addressTag: memo,
        assetCode: callbackParams.assetCode,
        assetAmount: callbackParams.assetAmount,
        networkCode: callbackParams.network,
      }
    } catch (error: unknown) {
      console.error('Failed to get deposit address:', error)
      const errorMessage = error instanceof Error ? error.message : 'Deposit address not configured for this asset'
      throw new Error(errorMessage)
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

  // Handle amount confirmation and pledge creation
  const handleAmountConfirmation = async (confirmedAmount: string) => {
    try {
      setState((prev) => ({ ...prev, creatingPledge: true, error: null }))

      const pendingTransfer = sessionStorage.getItem('pending_transfer')
      if (!pendingTransfer) {
        throw new Error('Transfer data not found')
      }

      const transfer = JSON.parse(pendingTransfer)
      
      console.log('🔄 [CALLBACK] Creating pledge with confirmed amount:', confirmedAmount)

      // Create pledge using PledgeService
      const pledgeResult = await pledgeService.createFromCallback({
        connectId: transfer.connectId,
        asset: transfer.asset,
        network: transfer.network,
        amount: confirmedAmount,
        destinationOrgId: '00000000-0000-0000-0000-000000000000',
        orderId: transfer.orderId || undefined,
        pledgerUserId: undefined,
      })

      console.log('📊 [CALLBACK] Pledge Creation Result:', pledgeResult)

      // Store order details for dashboard
      const orderDetails = {
        orderId: transfer.orderId || '',
        connectId: transfer.connectId || '',
        depositQuoteId: '',
        asset: transfer.asset,
        network: transfer.network,
        amount: confirmedAmount,
        status: 'COMPLETED',
        initiatedAt: transfer.timestamp ? new Date(parseInt(transfer.timestamp)).toISOString() : '',
        completedAt: new Date().toISOString(),
        backendPledge: pledgeResult.success
          ? {
              pledgeId: pledgeResult.backendPledge?.id,
              data: pledgeResult.pledge,
              entity: pledgeResult.backendPledge,
              warnings: pledgeResult.warnings,
            }
          : {
              error: pledgeResult.error,
            },
      }

      localStorage.setItem('robinhood_order_success', JSON.stringify(orderDetails))
      sessionStorage.removeItem('pending_transfer')

      console.log('🎉 [CALLBACK] Redirecting to dashboard')
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ [CALLBACK] Amount confirmation failed:', error)
      setState((prev) => ({
        ...prev,
        creatingPledge: false,
        error: error instanceof Error ? error.message : 'Failed to create pledge',
      }))
    }
  }

  // Main effect to handle callback processing
  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('🚀 [CALLBACK] Starting callback processing')

        // Parse callback parameters
        const callbackParams = parseCallbackParams()

        // Check for order/connect IDs (new-style callback)
        const orderId = searchParams.get('orderId')
        const connectId = searchParams.get('connectId')
        const depositQuoteId = searchParams.get('depositQuoteId')

        if (orderId || connectId || depositQuoteId) {
          console.log('✨ [CALLBACK] New-style callback detected')
          console.log(`   orderId: ${orderId}`)
          console.log(`   connectId: ${connectId}`)
          console.log(`   depositQuoteId: ${depositQuoteId}`)

          // PRIORITY 1: Get transfer details from URL query parameters
          // These were encoded in the redirectUrl when generating the Robinhood link
          const urlAsset = searchParams.get('asset')
          const urlNetwork = searchParams.get('network')
          const urlConnectId = searchParams.get('connectId')
          const urlAssetAmount = searchParams.get('assetAmount')
          const urlTimestamp = searchParams.get('timestamp')

          console.log('🔗 [CALLBACK] Transfer data from URL:', {
            asset: urlAsset,
            network: urlNetwork,
            connectId: urlConnectId,
            assetAmount: urlAssetAmount,
            timestamp: urlTimestamp,
          })

          // FALLBACK: Try localStorage if URL params are missing
          const storedAsset = localStorage.getItem('robinhood_selected_asset')
          const storedNetwork = localStorage.getItem('robinhood_selected_network')
          const storedAmount = localStorage.getItem('robinhood_transfer_amount')
          const storedConnectId = localStorage.getItem('robinhood_connect_id')
          const storedTimestamp = localStorage.getItem('robinhood_transfer_timestamp')

          console.log('📦 [CALLBACK] Stored transfer info (fallback):', {
            asset: storedAsset,
            network: storedNetwork,
            amount: storedAmount,
            connectId: storedConnectId,
            timestamp: storedTimestamp,
          })

          // Initialize with URL params or localStorage (URL takes priority)
          let finalAsset = urlAsset || storedAsset || ''
          let finalNetwork = urlNetwork || storedNetwork || ''
          let finalAssetAmount = urlAssetAmount || storedAmount || '' // URL amount takes priority!
          const finalTimestamp = urlTimestamp || storedTimestamp || ''

          console.log('✅ [CALLBACK] Initial transfer data (URL takes priority):', {
            asset: finalAsset,
            network: finalNetwork,
            assetAmount: finalAssetAmount,
            timestamp: finalTimestamp,
            source: urlAsset ? 'URL' : storedAsset ? 'localStorage' : 'none',
          })

          // NOTE: Order status API doesn't work for onramp (only offramp)
          // For onramp, we get all the data we need from the callback URL and localStorage
          // The presence of orderId indicates the transfer was initiated successfully

          // Check if amount was provided
          const orderAmount = finalAssetAmount
          const orderStatus = orderId ? 'COMPLETED' : 'UNKNOWN'

          console.log('✅ [CALLBACK] Transfer data received:', {
            asset: finalAsset,
            network: finalNetwork,
            amount: orderAmount || 'NOT PROVIDED - will ask user',
            status: orderStatus,
          })

          // If no amount, show confirmation UI instead of creating pledge
          if (!orderAmount || orderAmount === '' || orderAmount === '0') {
            console.log('📝 [CALLBACK] No amount provided - showing confirmation UI')
            
            // Store transfer data for amount confirmation
            sessionStorage.setItem('pending_transfer', JSON.stringify({
              orderId,
              connectId: urlConnectId || connectId || storedConnectId,
              asset: finalAsset,
              network: finalNetwork,
              timestamp: finalTimestamp,
            }))

            setState((prev) => ({
              ...prev,
              loading: false,
              needsAmountConfirmation: true,
            }))
            return
          }

          // We have amount, create pledge immediately and redirect
          console.log('🔄 [CALLBACK] Amount provided, creating pledge immediately...')
          
          const pledgeResult = await pledgeService.createFromCallback({
            connectId: urlConnectId || connectId || storedConnectId || 'unknown',
            asset: finalAsset,
            network: finalNetwork,
            amount: orderAmount,
            destinationOrgId: '00000000-0000-0000-0000-000000000000',
            orderId: orderId || undefined,
            pledgerUserId: undefined,
          })

          // Store order details and redirect to dashboard
          const orderDetails = {
            orderId: orderId || '',
            connectId: urlConnectId || connectId || storedConnectId || '',
            depositQuoteId: depositQuoteId || '',
            asset: finalAsset,
            network: finalNetwork,
            amount: orderAmount,
            status: orderStatus,
            initiatedAt: finalTimestamp ? new Date(parseInt(finalTimestamp)).toISOString() : '',
            completedAt: new Date().toISOString(),
            backendPledge: pledgeResult.success
              ? {
                  pledgeId: pledgeResult.backendPledge?.id,
                  data: pledgeResult.pledge,
                  entity: pledgeResult.backendPledge,
                  warnings: pledgeResult.warnings,
                }
              : {
                  error: pledgeResult.error,
                },
          }

          localStorage.setItem('robinhood_order_success', JSON.stringify(orderDetails))
          console.log('🎉 [CALLBACK] Redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        if (!callbackParams) {
          console.log('❌ [CALLBACK] No valid callback parameters found')
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Invalid callback parameters. The redirect from Robinhood was incomplete or malformed.',
          }))
          return
        }

        setState((prev) => ({ ...prev, callbackParams }))

        // Get deposit address for this specific asset
        const depositAddress = getDepositAddressForAsset(callbackParams)

        setState((prev) => ({
          ...prev,
          loading: false,
          depositAddress,
        }))

        // Clean up localStorage (connectId no longer needed after callback)
        localStorage.removeItem('robinhood_reference_id')
        localStorage.removeItem('robinhood_selected_asset')
        localStorage.removeItem('robinhood_selected_network')
        localStorage.removeItem('robinhood_transfer_amount')
      } catch (error: unknown) {
        console.error('❌ [CALLBACK] Callback processing failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while processing your transfer.'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
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
                  Confirming your transfer details. This will only take a moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Amount confirmation state - BIG INPUT like search bar
  if (state.needsAmountConfirmation) {
    const pendingTransfer = sessionStorage.getItem('pending_transfer')
    const transfer = pendingTransfer ? JSON.parse(pendingTransfer) : null

    return (
      <div className="flex min-h-screen justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 pt-[40vh]">
        <div className="w-full max-w-2xl h-fit">
          <Card className="shadow-2xl border-2 border-blue-500">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Transfer Completed! 🎉</h2>
                <p className="text-zinc-600">
                  {transfer && `You transferred ${transfer.asset} on ${transfer.network}`}
                </p>
              </div>

              <div className="border-t pt-4">
                <label className="block text-lg font-semibold text-zinc-900 mb-3">
                  How much {transfer?.asset} did you transfer?
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`Enter amount in ${transfer?.asset || 'crypto'}`}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && amountInput && parseFloat(amountInput) > 0) {
                      handleAmountConfirmation(amountInput)
                    }
                  }}
                  className="w-full h-16 text-2xl pl-4 border-zinc-300 focus:border-blue-500 text-center font-bold"
                  autoFocus
                  disabled={state.creatingPledge}
                />
                <p className="text-sm text-zinc-500 mt-2 text-center">
                  Enter the crypto amount from your Robinhood receipt (not the USD value)
                </p>
              </div>

              <Button
                onClick={() => handleAmountConfirmation(amountInput)}
                size="lg"
                className="w-full text-xl py-8 bg-emerald-600 hover:bg-emerald-700"
                disabled={!amountInput || parseFloat(amountInput) <= 0 || state.creatingPledge}
              >
                {state.creatingPledge ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-3"></div>
                    Creating Pledge...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Confirm Transfer
                  </>
                )}
              </Button>

              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (state.error && !state.needsAmountConfirmation) {
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
