'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { OrderStatusResponse, OrderStatus } from '@/types/robinhood'

interface OrderStatusProps {
  referenceId: string
  onStatusChange?: (status: OrderStatus) => void
  autoRefresh?: boolean
}

interface OrderStatusState {
  loading: boolean
  error: string | null
  orderStatus: OrderStatusResponse | null
  lastUpdated: Date | null
}

export function OrderStatusComponent({
  referenceId,
  onStatusChange,
  autoRefresh = true,
}: OrderStatusProps) {
  const { toast } = useToast()
  const [state, setState] = useState<OrderStatusState>({
    loading: true,
    error: null,
    orderStatus: null,
    lastUpdated: null,
  })

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch order status from API
  const fetchOrderStatus = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }

      try {
        const response = await fetch(`/api/robinhood/order-status?referenceId=${referenceId}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch order status')
        }

        const newStatus = result.data.status
        const previousStatus = state.orderStatus?.status

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          orderStatus: result.data,
          lastUpdated: new Date(),
        }))

        // Notify parent component of status change
        if (onStatusChange && newStatus !== previousStatus) {
          onStatusChange(newStatus)
        }

        // Show toast for status changes
        if (previousStatus && newStatus !== previousStatus) {
          if (newStatus === 'ORDER_STATUS_SUCCEEDED') {
            toast({
              title: 'Transfer Complete!',
              description: 'Your crypto transfer has been successfully processed.',
            })
          } else if (newStatus === 'ORDER_STATUS_FAILED') {
            toast({
              title: 'Transfer Failed',
              description: 'Your crypto transfer could not be completed.',
              variant: 'destructive',
            })
          }
        }

        return result.data
      } catch (error: any) {
        console.error('Failed to fetch order status:', error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch order status',
        }))
        throw error
      }
    },
    [referenceId, onStatusChange, state.orderStatus?.status, toast],
  )

  // Set up polling with exponential backoff
  const setupPolling = useCallback(() => {
    if (!autoRefresh || !state.orderStatus) return

    // Don't poll if order is complete or failed
    if (
      state.orderStatus.status === 'ORDER_STATUS_SUCCEEDED' ||
      state.orderStatus.status === 'ORDER_STATUS_FAILED'
    ) {
      return
    }

    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }

    // Start with 5 second intervals, increase gradually
    let attempts = 0
    const maxAttempts = 20 // Stop polling after 20 attempts

    const poll = async () => {
      try {
        await fetchOrderStatus(false) // Don't show loading spinner for polling
        attempts++

        // Exponential backoff: 5s, 10s, 20s, 30s, 60s (max)
        const delay = Math.min(5000 * Math.pow(1.5, Math.floor(attempts / 3)), 60000)

        if (attempts < maxAttempts) {
          const newInterval = setTimeout(poll, delay)
          setPollingInterval(newInterval)
        }
      } catch (error) {
        // Stop polling on persistent errors
        console.error('Polling stopped due to error:', error)
      }
    }

    // Start polling
    const initialInterval = setTimeout(poll, 5000)
    setPollingInterval(initialInterval)
  }, [autoRefresh, state.orderStatus, pollingInterval, fetchOrderStatus])

  // Initial fetch and setup polling
  useEffect(() => {
    fetchOrderStatus()
  }, [referenceId])

  // Setup polling when order status changes
  useEffect(() => {
    setupPolling()

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [setupPolling])

  // Manual refresh
  const handleRefresh = () => {
    fetchOrderStatus()
  }

  // Copy transaction hash to clipboard
  const copyTransactionHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      toast({
        title: 'Copied!',
        description: 'Transaction hash copied to clipboard',
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please manually copy the transaction hash',
        variant: 'destructive',
      })
    }
  }

  // Get blockchain explorer URL
  const getExplorerUrl = (networkCode: string, txHash: string): string | null => {
    const explorers: Record<string, string> = {
      ETHEREUM: `https://etherscan.io/tx/${txHash}`,
      POLYGON: `https://polygonscan.com/tx/${txHash}`,
      SOLANA: `https://solscan.io/tx/${txHash}`,
      BITCOIN: `https://blockstream.info/tx/${txHash}`,
      LITECOIN: `https://blockchair.com/litecoin/transaction/${txHash}`,
      DOGECOIN: `https://blockchair.com/dogecoin/transaction/${txHash}`,
    }

    return explorers[networkCode] || null
  }

  // Get status display info
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'ORDER_STATUS_IN_PROGRESS':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: 'In Progress',
          description: 'Your transfer is being processed',
          variant: 'secondary' as const,
          color: 'text-blue-600',
        }
      case 'ORDER_STATUS_SUCCEEDED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          label: 'Completed',
          description: 'Your transfer has been successfully processed',
          variant: 'default' as const,
          color: 'text-emerald-600',
        }
      case 'ORDER_STATUS_FAILED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          label: 'Failed',
          description: 'Your transfer could not be completed',
          variant: 'destructive' as const,
          color: 'text-red-600',
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: 'Unknown',
          description: 'Status unknown',
          variant: 'outline' as const,
          color: 'text-gray-600',
        }
    }
  }

  if (state.loading && !state.orderStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <span>Loading order status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.error && !state.orderStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Status</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!state.orderStatus) {
    return null
  }

  const statusInfo = getStatusInfo(state.orderStatus.status)
  const explorerUrl = state.orderStatus.blockchainTransactionId
    ? getExplorerUrl(state.orderStatus.networkCode, state.orderStatus.blockchainTransactionId)
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <CardTitle className={statusInfo.color}>Transfer {statusInfo.label}</CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={state.loading}>
              <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Asset:</span>
            <div className="font-medium">{state.orderStatus.assetCode}</div>
          </div>
          <div>
            <span className="text-zinc-500">Amount:</span>
            <div className="font-medium">{state.orderStatus.cryptoAmount}</div>
          </div>
          <div>
            <span className="text-zinc-500">Network:</span>
            <div className="font-medium">{state.orderStatus.networkCode}</div>
          </div>
          <div>
            <span className="text-zinc-500">Value:</span>
            <div className="font-medium">${parseFloat(state.orderStatus.fiatAmount).toFixed(2)}</div>
          </div>
        </div>

        {/* Transaction Hash */}
        {state.orderStatus.blockchainTransactionId && (
          <div>
            <span className="text-sm text-zinc-500">Transaction Hash:</span>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 bg-zinc-100 p-2 rounded text-xs font-mono break-all">
                {state.orderStatus.blockchainTransactionId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTransactionHash(state.orderStatus!.blockchainTransactionId!)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {explorerUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(explorerUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {state.lastUpdated && (
          <div className="text-xs text-zinc-500">
            Last updated: {state.lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {/* Auto-refresh indicator */}
        {autoRefresh && state.orderStatus.status === 'ORDER_STATUS_IN_PROGRESS' && (
          <div className="text-xs text-zinc-500 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Auto-refreshing every few seconds...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

