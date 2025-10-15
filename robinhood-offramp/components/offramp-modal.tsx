'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { buildOfframpUrl, SUPPORTED_NETWORKS } from '@/lib/robinhood-url-builder'
import type { SupportedNetwork } from '@/types/robinhood'
import { Check, ExternalLink, Info, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OfframpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OfframpModal({ isOpen, onClose }: OfframpModalProps) {
  const { toast } = useToast()

  // Form state - only networks now
  const [selectedNetworks, setSelectedNetworks] = useState<SupportedNetwork[]>(['ETHEREUM'])
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNetworks(['ETHEREUM'])
    }
  }, [isOpen])

  const handleNetworkToggle = (network: SupportedNetwork) => {
    setSelectedNetworks((prev) => (prev.includes(network) ? prev.filter((n) => n !== network) : [...prev, network]))
  }

  const handleStartTransfer = async () => {
    if (selectedNetworks.length === 0) {
      toast({
        title: 'Select Networks',
        description: 'Please select at least one blockchain network you can receive crypto on.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Generate offramp URL with only required parameters
      const result = buildOfframpUrl({
        supportedNetworks: selectedNetworks,
        // No asset code, amount, or other pre-selections
      })

      // Store referenceId for callback handling
      console.log('Generated referenceId:', result.referenceId)

      // Open Robinhood Connect URL
      window.open(result.url, '_blank')

      // Close modal
      onClose()

      toast({
        title: 'Opening Robinhood...',
        description: "You'll see your balances and can choose what to transfer in Robinhood.",
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
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer from Robinhood</DialogTitle>
          <DialogDescription>
            Connect to Robinhood where you'll see your balances and choose what to transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Network Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Which blockchain networks can you receive crypto on?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select all networks your wallet supports. You'll choose the specific asset and amount in Robinhood.
              </p>
            </div>

            <div className="grid gap-3">
              {SUPPORTED_NETWORKS.map((network) => (
                <div key={network} className="flex items-center space-x-3">
                  <Checkbox
                    id={network}
                    checked={selectedNetworks.includes(network)}
                    onCheckedChange={() => handleNetworkToggle(network)}
                  />
                  <Label
                    htmlFor={network}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {network}
                  </Label>
                  {selectedNetworks.includes(network) && <Check className="h-4 w-4 text-emerald-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* How it Works */}
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-emerald-800">
                    Open Robinhood and see your crypto balances
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium text-emerald-800">
                    Choose which crypto and how much to transfer
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span className="text-sm font-medium text-emerald-800">Return here to get your deposit address</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>No guessing needed!</strong> You'll see your actual crypto balances in Robinhood and can make
              informed decisions about what and how much to transfer.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTransfer}
            disabled={loading || selectedNetworks.length === 0}
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
                Open Robinhood ({selectedNetworks.length} network{selectedNetworks.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
