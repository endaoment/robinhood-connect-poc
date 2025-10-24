'use client'

import { OrderStatusComponent } from '@/components/order-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExternalLink, History } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
}

interface Transaction {
  id: string
  referenceId: string
  assetCode: string
  assetAmount: string
  networkCode: string
  status: string
  createdAt: Date
  completedAt?: Date
}

export function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Load transaction history
  useEffect(() => {
    if (isOpen) {
      loadTransactionHistory()
    }
  }, [isOpen])

  const loadTransactionHistory = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll load from localStorage or show empty state
      const stored = localStorage.getItem('robinhood_transactions')
      if (stored) {
        const parsed = JSON.parse(stored)
        setTransactions(
          parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          })),
        )
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ORDER_STATUS_IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'ORDER_STATUS_SUCCEEDED':
        return (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800">
            Completed
          </Badge>
        )
      case 'ORDER_STATUS_FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (selectedTransaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Track the status of your crypto transfer</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="mb-4">
              ← Back to History
            </Button>

            <OrderStatusComponent referenceId={selectedTransaction.referenceId} autoRefresh={true} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>View all your crypto transfers from Robinhood</DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm">Your transfer history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="cursor-pointer hover:bg-zinc-50">
                  <CardContent className="p-4" onClick={() => setSelectedTransaction(transaction)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-medium text-sm">{transaction.assetCode}</span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.assetAmount} {transaction.assetCode}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {transaction.networkCode} • {transaction.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transaction.status)}
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
