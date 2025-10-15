'use client'

import { OfframpModal } from '@/components/offramp-modal'
import { TransactionHistory } from '@/components/transaction-history'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, History, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function Dashboard() {
  const [isOfframpModalOpen, setIsOfframpModalOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Crypto Donations Dashboard</h1>
          <p className="text-zinc-600 mt-2">
            Transfer crypto from your Robinhood account to support causes you care about
          </p>
        </div>

        {/* Main Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Transfer from Robinhood Card */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Transfer from Robinhood</CardTitle>
                  <CardDescription>Use your existing Robinhood crypto to make donations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      How it works
                    </Badge>
                  </div>
                  <ol className="text-sm text-emerald-700 space-y-1">
                    <li>1. Click one button to open Robinhood</li>
                    <li>2. Choose ANY crypto from your balances</li>
                    <li>3. Return here to get your deposit address</li>
                    <li>4. Complete the transfer and track your donation</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <span>Supported assets: ETH, USDC, BTC, SOL, and more</span>
                  <Badge variant="outline">No fees from us</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsOfframpModalOpen(true)}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Start Transfer
              </Button>
            </CardFooter>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest crypto transfers and donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transfers yet</p>
              <p className="text-sm">Your transfer history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <OfframpModal isOpen={isOfframpModalOpen} onClose={() => setIsOfframpModalOpen(false)} />

      <TransactionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}
