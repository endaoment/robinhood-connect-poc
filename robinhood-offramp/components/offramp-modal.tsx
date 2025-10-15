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
import { useToast } from '@/hooks/use-toast'
import { buildOfframpUrl } from '@/lib/robinhood-url-builder'
import { getConfiguredNetworks } from '@/lib/network-addresses'
import { ExternalLink, Info, Loader2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface OfframpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OfframpModal({ isOpen, onClose }: OfframpModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Get all configured networks (no user selection needed)
  const supportedNetworks = getConfiguredNetworks()

  const handleStartTransfer = async () => {
    setLoading(true)
    try {
      // Generate offramp URL with all supported networks
      const result = buildOfframpUrl({
        supportedNetworks,
        // No asset code, amount, or network selection needed
      })

      console.log('Generated referenceId:', result.referenceId)
      console.log('Supporting networks:', supportedNetworks.join(', '))

      // Open Robinhood Connect URL
      window.open(result.url, '_blank')

      // Close modal
      onClose()

      toast({
        title: 'Opening Robinhood...',
        description: "Choose any crypto from your Robinhood account. We support all major networks!",
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
            We support all major blockchain networks. Choose any crypto in your Robinhood account!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Supported Networks Display */}
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-800">
                  We accept crypto on all major networks
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {supportedNetworks.map((network) => (
                  <div
                    key={network}
                    className="px-3 py-1 bg-white border border-emerald-200 rounded-full text-xs font-medium text-emerald-700"
                  >
                    {network}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    Click below to open Robinhood
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
                  <span className="text-sm font-medium text-blue-800">
                    Return here to complete your donation
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Maximum flexibility!</strong> We support {supportedNetworks.length} blockchain 
              networks. Select any crypto asset you have in Robinhood - we'll provide the 
              correct deposit address automatically.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTransfer}
            disabled={loading}
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
