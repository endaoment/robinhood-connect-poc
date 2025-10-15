'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { buildOfframpUrl, getAssetsForNetwork, NETWORK_ASSET_MAP } from '@/lib/robinhood-url-builder'
import type { AssetCode, SupportedNetwork } from '@/types/robinhood'
import { ExternalLink, Info, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OfframpModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PriceQuote {
  price: string
  fiatAmount: string
  processingFee: {
    fiatAmount: string
  }
  totalAmount: {
    fiatAmount: string
  }
}

export function OfframpModal({ isOpen, onClose }: OfframpModalProps) {
  const { toast } = useToast()

  // Form state
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>('ETHEREUM')
  const [selectedAsset, setSelectedAsset] = useState<AssetCode>('ETH')
  const [amount, setAmount] = useState('')
  const [amountType, setAmountType] = useState<'crypto' | 'fiat'>('crypto')

  // UI state
  const [loading, setLoading] = useState(false)
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNetwork('ETHEREUM')
      setSelectedAsset('ETH')
      setAmount('')
      setAmountType('crypto')
      setPriceQuote(null)
    }
  }, [isOpen])

  // Update available assets when network changes
  useEffect(() => {
    const availableAssets = getAssetsForNetwork(selectedNetwork)
    if (availableAssets.length > 0 && !availableAssets.includes(selectedAsset)) {
      setSelectedAsset(availableAssets[0])
    }
  }, [selectedNetwork, selectedAsset])

  // Fetch price quote when parameters change
  useEffect(() => {
    if (selectedAsset && selectedNetwork && amount && parseFloat(amount) > 0) {
      fetchPriceQuote()
    } else {
      setPriceQuote(null)
    }
  }, [selectedAsset, selectedNetwork, amount, amountType])

  const fetchPriceQuote = async () => {
    setQuoteLoading(true)
    try {
      // This would call the price quote API
      // For now, we'll simulate the response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockQuote: PriceQuote = {
        price: '2500.00',
        fiatAmount: (parseFloat(amount) * 2500).toFixed(2),
        processingFee: { fiatAmount: '0.00' },
        totalAmount: { fiatAmount: (parseFloat(amount) * 2500).toFixed(2) },
      }

      setPriceQuote(mockQuote)
    } catch (error) {
      console.error('Failed to fetch price quote:', error)
    } finally {
      setQuoteLoading(false)
    }
  }

  const handleStartTransfer = async () => {
    if (!selectedAsset || !selectedNetwork || !amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please select an asset, network, and enter a valid amount.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Generate offramp URL
      const result = buildOfframpUrl({
        supportedNetworks: [selectedNetwork],
        assetCode: selectedAsset,
        assetAmount: amountType === 'crypto' ? amount : undefined,
        fiatAmount: amountType === 'fiat' ? amount : undefined,
        fiatCode: amountType === 'fiat' ? 'USD' : undefined,
      })

      // Store referenceId for callback handling (already done in buildOfframpUrl)
      console.log('Generated referenceId:', result.referenceId)

      // Open Robinhood Connect URL
      window.open(result.url, '_blank')

      // Close modal
      onClose()

      toast({
        title: 'Opening Robinhood...',
        description: 'Complete your transfer in the Robinhood app or web interface.',
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

  const availableAssets = getAssetsForNetwork(selectedNetwork)
  const isValidAmount = amount && parseFloat(amount) > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer from Robinhood</DialogTitle>
          <DialogDescription>
            Choose the crypto asset and amount you want to transfer from your Robinhood account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Network Selection */}
          <div className="grid gap-2">
            <Label htmlFor="network">Blockchain Network</Label>
            <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as SupportedNetwork)}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(NETWORK_ASSET_MAP).map((network) => (
                  <SelectItem key={network} value={network}>
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Selection */}
          <div className="grid gap-2">
            <Label htmlFor="asset">Crypto Asset</Label>
            <Select value={selectedAsset} onValueChange={(value) => setSelectedAsset(value as AssetCode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {availableAssets.map((asset) => (
                  <SelectItem key={asset} value={asset}>
                    {asset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex space-x-1">
                <Button
                  variant={amountType === 'crypto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmountType('crypto')}
                >
                  {selectedAsset}
                </Button>
                <Button
                  variant={amountType === 'fiat' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmountType('fiat')}
                >
                  USD
                </Button>
              </div>
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${amountType === 'crypto' ? selectedAsset : 'USD'}`}
              disabled={loading}
            />
          </div>

          {/* Price Quote */}
          {isValidAmount && (
            <Card>
              <CardContent className="pt-4">
                {quoteLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Getting price quote...</span>
                  </div>
                ) : priceQuote ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Value:</span>
                      <span className="font-medium">${priceQuote.fiatAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee:</span>
                      <span className="font-medium">${priceQuote.processingFee.fiatAmount}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Value:</span>
                      <span>${priceQuote.totalAmount.fiatAmount}</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll complete the transfer in your Robinhood app or web interface. The exact amount and fees will be
              confirmed there.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTransfer}
            disabled={loading || !isValidAmount}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening Robinhood...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Robinhood
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
