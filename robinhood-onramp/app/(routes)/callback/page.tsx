/**
 * Robinhood Connect Callback Page (Refactored)
 *
 * SIMPLIFIED FLOW:
 * 1. User completes transfer in Robinhood UI
 * 2. Robinhood redirects to this page with connectId
 * 3. We poll the Order Details API to get complete transfer info
 * 4. We create pledge with definitive data from Robinhood API
 *
 * NO ASSET PRESELECTION NEEDED - Robinhood tells us what they transferred!
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useToast } from '@/app/hooks/use-toast'
import { pledgeService } from '@/libs/robinhood'
import type { OrderDetailsResponse } from '@/libs/robinhood/lib/services/robinhood-client.service'
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface CallbackState {
  loading: boolean
  error: string | null
  orderDetails: OrderDetailsResponse | null
  pledgeCreated: boolean
  pledgeResponse: any | null
}

function CallbackPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    orderDetails: null,
    pledgeCreated: false,
    pledgeResponse: null,
  })

  const [pollingAttempts, setPollingAttempts] = useState(0)
  const MAX_POLLING_ATTEMPTS = 10
  const POLLING_INTERVAL_MS = 12000 // 12 seconds between retries

  // Get connectId from URL
  const connectId = searchParams.get('connectId')

  // Fetch order details from Robinhood
  const fetchOrderDetails = async (connectId: string): Promise<OrderDetailsResponse> => {
    console.log(`🔍 [CALLBACK] Fetching order details for connectId: ${connectId}`)

    const response = await fetch(`/api/robinhood/order-details?connectId=${connectId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch order details')
    }

    const data = await response.json()
    return data.data
  }

  // Poll for order details (in case transfer is still processing)
  const pollOrderDetails = async (connectId: string) => {
    try {
      const orderDetails = await fetchOrderDetails(connectId)

      console.log('📊 [CALLBACK] Order details received:', {
        status: orderDetails.status,
        assetCode: orderDetails.assetCode,
        cryptoAmount: orderDetails.cryptoAmount,
        fiatAmount: orderDetails.fiatAmount,
      })

      // Check if order is complete
      if (orderDetails.status === 'ORDER_STATUS_SUCCEEDED') {
        console.log('✅ [CALLBACK] Order completed successfully')
        setState((prev) => ({
          ...prev,
          loading: false,
          orderDetails,
        }))

        // Auto-create pledge
        await createPledge(orderDetails)
      } else if (orderDetails.status === 'ORDER_STATUS_FAILED' || orderDetails.status === 'ORDER_STATUS_CANCELLED') {
        console.log('❌ [CALLBACK] Order failed or cancelled')
        setState((prev) => ({
          ...prev,
          loading: false,
          error: `Transfer ${orderDetails.status.replace('ORDER_STATUS_', '').toLowerCase()}`,
        }))
      } else {
        // Order still in progress, keep polling
        console.log('⏳ [CALLBACK] Order in progress, will retry...')
        setPollingAttempts((prev) => prev + 1)

        if (pollingAttempts < MAX_POLLING_ATTEMPTS) {
          setTimeout(() => pollOrderDetails(connectId), POLLING_INTERVAL_MS)
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Transfer is taking longer than expected. Please check back later.',
          }))
        }
      }
    } catch (error) {
      console.error('❌ [CALLBACK] Failed to fetch order details:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order details',
      }))
    }
  }

  // Create pledge from order details
  const createPledge = async (orderDetails: OrderDetailsResponse) => {
    console.log('📝 [CALLBACK] Creating pledge from order details...')

    try {
      const pledgeResponse = await pledgeService.createPledgeFromOrderDetails({
        connectId: orderDetails.connectId,
        orderId: orderDetails.referenceId || orderDetails.connectId,
        assetCode: orderDetails.assetCode,
        network: orderDetails.networkCode,
        cryptoAmount: orderDetails.cryptoAmount,
        fiatAmount: orderDetails.fiatAmount,
        blockchainTxHash: orderDetails.blockchainTransactionId,
        destinationAddress: orderDetails.destinationAddress,
        destinationType: 'fund', // TODO: Make configurable
        destinationId: '00000000-0000-0000-0000-000000000000', // TODO: Get from context
      })

      console.log('✅ [CALLBACK] Pledge created successfully:', pledgeResponse)

      setState((prev) => ({
        ...prev,
        pledgeCreated: true,
        pledgeResponse,
      }))

      toast({
        title: 'Transfer Complete!',
        description: `Successfully pledged ${orderDetails.cryptoAmount} ${orderDetails.assetCode}`,
      })
    } catch (error) {
      console.error('❌ [CALLBACK] Failed to create pledge:', error)
      toast({
        title: 'Pledge Creation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  // Initialize on mount
  useEffect(() => {
    if (!connectId) {
      console.log('❌ [CALLBACK] No connectId in URL')
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'No connectId provided in callback URL',
      }))
      return
    }

    console.log('🚀 [CALLBACK] Starting order details poll')
    pollOrderDetails(connectId)
  }, [connectId])

  // Loading state
  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Transfer
            </CardTitle>
            <CardDescription>Fetching transfer details from Robinhood...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Please wait</AlertTitle>
                <AlertDescription>
                  We're retrieving the details of your transfer. This usually takes a few seconds.
                  {pollingAttempts > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Attempt {pollingAttempts} of {MAX_POLLING_ATTEMPTS}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Transfer Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              {connectId && (
                <Button onClick={() => window.location.reload()}>Retry</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (state.orderDetails) {
    const { orderDetails } = state

    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Transfer Complete!
            </CardTitle>
            <CardDescription>Your crypto transfer was successful</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Transfer Details */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Asset</span>
                  <Badge variant="outline">{orderDetails.assetCode}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="font-mono text-lg">{orderDetails.cryptoAmount} {orderDetails.assetCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Value (USD)</span>
                  <span className="font-mono">${orderDetails.fiatAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Network</span>
                  <Badge variant="secondary">{orderDetails.networkCode}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className="bg-green-600">
                    {orderDetails.status.replace('ORDER_STATUS_', '')}
                  </Badge>
                </div>
              </div>

              {/* Transaction Hash */}
              {orderDetails.blockchainTransactionId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Hash</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm"
                      value={orderDetails.blockchainTransactionId}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(orderDetails.blockchainTransactionId)
                        toast({ title: 'Copied!', description: 'Transaction hash copied' })
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Pledge Status */}
              {state.pledgeCreated && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Pledge Created</AlertTitle>
                  <AlertDescription>
                    Your donation has been recorded and will be processed by our backend.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => router.push('/dashboard')} className="flex-1">
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  Make Another Donation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackPageContent />
    </Suspense>
  )
}

