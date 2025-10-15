'use client'

import { TransactionHistory } from '@/components/transaction-history'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { getAddressTag, getConfiguredNetworks, getDepositAddress } from '@/lib/network-addresses'
import { buildOfframpUrl, NETWORK_ASSET_MAP } from '@/lib/robinhood-url-builder'
import { Check, CheckCircle2, Copy, ExternalLink, History, Info, Loader2, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function Dashboard() {
  const { toast } = useToast()
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Get all configured networks
  const supportedNetworks = getConfiguredNetworks()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleGiveWithRobinhood = async () => {
    setLoading(true)
    try {
      // Generate offramp URL with all supported networks
      const result = buildOfframpUrl({
        supportedNetworks,
      })

      console.log('Generated referenceId:', result.referenceId)
      console.log('Supporting networks:', supportedNetworks.join(', '))

      // Open Robinhood Connect URL
      window.open(result.url, '_blank')

      toast({
        title: 'Opening Robinhood...',
        description: 'Choose any crypto from your Robinhood account. We support all major networks!',
      })
    } catch (error: any) {
      console.error('Failed to start transfer:', error)
      toast({
        title: 'Transfer failed',
        description: error.message || 'Failed to start transfer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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

              {/* How it Works */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <span className="text-sm font-medium text-blue-800">
                        Click "Give with Robinhood" to open Robinhood
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <span className="text-sm font-medium text-blue-800">
                        Choose ANY crypto and amount from your balances
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <span className="text-sm font-medium text-blue-800">Return here to complete your donation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Networks Display */}
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                      We accept crypto on {supportedNetworks.length} networks
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {supportedNetworks.map((network) => (
                      <Badge key={network} variant="secondary" className="bg-white border-emerald-200 text-emerald-700">
                        {network}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Information Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Maximum flexibility!</strong> We support {supportedNetworks.length} blockchain networks.
                  Select any crypto asset you have in Robinhood - we'll provide the correct deposit address
                  automatically.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between text-sm text-zinc-600 pt-2">
                <span>ETH, USDC, BTC, SOL, MATIC, and more</span>
                <Badge variant="outline">No fees from us</Badge>
              </div>
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

        {/* Accepted Assets & Deposit Addresses Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Accepted Crypto Assets & Deposit Addresses</CardTitle>
            <CardDescription>
              Complete list of all supported tokens across all networks with Coinbase Prime custody addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Asset</TableHead>
                    <TableHead className="w-[150px]">Network</TableHead>
                    <TableHead>Deposit Address</TableHead>
                    <TableHead className="w-[120px]">Memo/Tag</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportedNetworks.flatMap((network) => {
                    const address = getDepositAddress(network)
                    const memo = getAddressTag(network)
                    const assets = NETWORK_ASSET_MAP[network] || []

                    return assets.map((asset) => {
                      const isCopied = copiedAddress === address
                      const rowKey = `${network}-${asset}`

                      return (
                        <TableRow key={rowKey}>
                          <TableCell className="font-semibold">
                            <Badge variant="default" className="font-mono">
                              {asset}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {network}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-md truncate" title={address}>
                            {address}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {memo ? (
                              <Badge variant="secondary" className="text-xs">
                                {memo}
                              </Badge>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(address, `${asset} (${network})`)}
                              className="h-8 w-8 p-0"
                            >
                              {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600">
              <Info className="h-4 w-4" />
              <span>
                All addresses are Coinbase Prime custody wallets with automated liquidation •{' '}
                {supportedNetworks.flatMap((n) => NETWORK_ASSET_MAP[n] || []).length} total assets supported
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest crypto transfers and donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transfers yet</p>
              <p className="text-sm">Click "Give with Robinhood" above to start your first donation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Modal */}
      <TransactionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}
