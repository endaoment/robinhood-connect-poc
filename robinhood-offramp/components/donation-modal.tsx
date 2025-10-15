'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
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
import { DonationRecipient } from './donation-recipient'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

// Now update the interface to include the account ID
interface AssetData {
  id: string
  ticker: string
  name: string
  balance: number
  value: number
}

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

// Interface for donation details to be stored temporarily
interface PendingDonationDetails {
  accountId: string
  destinationId: string
  amount: number
  currency: string
}

// Update the DonationModal component to use the session and real API calls
export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [selectedAsset, setSelectedAsset] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingAssets, setFetchingAssets] = useState(false)
  const { toast } = useToast()

  // Add a state for donation recipient ID
  const [destinationId, setDestinationId] = useState('default-recipient-id') // Renamed state variable, use appropriate default

  // New state for 2FA flow
  const [promptForTwoFactor, setPromptForTwoFactor] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)

  // Ref to store donation details for the 2FA step
  const pendingDonation = useRef<PendingDonationDetails | null>(null)

  useEffect(() => {
    // Fetch assets only when the modal is open
    if (isOpen) {
      const getAssets = async () => {
        setFetchingAssets(true)
        try {
          // Call the internal API route instead of the direct Coinbase function
          const response = await fetch('/api/coinbase/accounts')

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch assets')
          }

          const userAssets: AssetData[] = await response.json()

          setAssets(userAssets)
          if (userAssets.length > 0) {
            setSelectedAsset(userAssets[0].ticker)
          } else {
            setSelectedAsset('') // Clear selection if no assets
          }
        } catch (error: any) {
          toast({
            title: 'Error fetching assets',
            description: error.message || 'Could not retrieve your Coinbase assets. Please try again.',
            variant: 'destructive',
          })
          setAssets([]) // Clear assets on error
          setSelectedAsset('')
        } finally {
          setFetchingAssets(false)
        }
      }

      getAssets()
    } else {
      // Reset state when modal closes
      setAssets([])
      setSelectedAsset('')
      setAmount('')
      setFetchingAssets(false) // Ensure loading spinner stops if modal closes quickly
      setPromptForTwoFactor(false) // Reset 2FA state
      setTwoFactorCode('')
      setTwoFactorError(null)
      pendingDonation.current = null
    }
  }, [isOpen, toast]) // Removed session dependency here, as the API route handles auth

  // Refactored function to handle the actual API call
  const executeDonation = async (details: PendingDonationDetails, token?: string) => {
    setLoading(true)
    setTwoFactorError(null) // Clear previous 2FA errors
    try {
      const response = await fetch('/api/coinbase/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...details,
          twoFactorToken: token, // Include token if provided
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Check if this failure is specifically a 2FA requirement
        if (response.status === 400 && result.twoFactorRequired) {
          // Store details and prompt for 2FA code
          pendingDonation.current = details
          setPromptForTwoFactor(true)
          setLoading(false) // Stop initial loading
          return // Stop further execution here
        }
        // For other errors, throw them
        throw new Error(result.error || 'Transaction failed')
      }

      // Success!
      toast({
        title: 'Donation successful!',
        description: `Thank you for your donation of ${details.amount} ${details.currency}. Transaction ID: ${result.transactionId}`,
      })
      onClose() // Close modal on success
      // Reset relevant states
      setAmount('')
      setPromptForTwoFactor(false)
      setTwoFactorCode('')
      pendingDonation.current = null
    } catch (error: any) {
      // Handle errors, including potential errors during the 2FA attempt
      const errorMessage = error.message || 'There was an error processing your donation. Please try again.'
      if (promptForTwoFactor) {
        // If we are in the 2FA prompt, show error related to 2FA
        setTwoFactorError(errorMessage)
        setLoading(false) // Stop loading on 2FA error
      } else {
        // Otherwise, show a general toast error
        toast({
          title: 'Donation failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      // Don't reset pendingDonation here if 2FA failed, allow retry
    } finally {
      // Ensure loading is stopped unless we are waiting for 2FA input
      if (!promptForTwoFactor) {
        setLoading(false)
      }
    }
  }

  // Initial donation attempt handler
  const handleDonate = () => {
    if (!selectedAsset || !amount || Number.parseFloat(amount) <= 0 || !destinationId) {
      toast({
        title: 'Invalid input',
        description: 'Please select an asset, enter a valid amount, and select a recipient.',
        variant: 'destructive',
      })
      return
    }

    const selectedAssetData = assets.find((asset) => asset.ticker === selectedAsset)
    if (!selectedAssetData || Number.parseFloat(amount) > selectedAssetData.balance) {
      toast({
        title: 'Insufficient balance',
        description: `You don't have enough ${selectedAsset} for this donation.`,
        variant: 'destructive',
      })
      return
    }

    const donationDetails: PendingDonationDetails = {
      accountId: selectedAssetData.id,
      destinationId: destinationId,
      amount: Number.parseFloat(amount),
      currency: selectedAsset,
    }

    executeDonation(donationDetails) // Call the execution function without a token initially
  }

  // Handler for submitting the 2FA code
  const submitWithTwoFactor = () => {
    if (!twoFactorCode || !pendingDonation.current) {
      setTwoFactorError('Please enter your 6-digit authentication code.')
      return
    }
    // Call the execution function again, this time with the token
    executeDonation(pendingDonation.current, twoFactorCode)
  }

  const getMaxAmount = () => {
    const asset = assets.find((a) => a.ticker === selectedAsset)
    return asset ? asset.balance.toString() : '0'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      {' '}
      {/* Prevent closing while loading */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{promptForTwoFactor ? 'Enter Authentication Code' : 'Make a Donation'}</DialogTitle>
          <DialogDescription>
            {promptForTwoFactor
              ? 'Enter the 6-digit code from your authenticator app.'
              : 'Choose an asset from your Coinbase account to donate.'}
          </DialogDescription>
        </DialogHeader>

        {/* Show 2FA prompt if needed */}
        {promptForTwoFactor ? (
          <div className="grid gap-4 py-4">
            {twoFactorError && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{twoFactorError}</AlertDescription>
              </Alert>
            )}
            <Label htmlFor="twoFactorCode">Authentication Code</Label>
            <Input
              id="twoFactorCode"
              type="text" // Use text to allow leading zeros, handle validation if needed
              inputMode="numeric" // Hint mobile keyboards
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} // Allow only digits
              placeholder="e.g., 123456"
              disabled={loading}
            />
          </div>
        ) : fetchingAssets ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Select Asset</Label>
              <Select
                value={selectedAsset}
                onValueChange={setSelectedAsset}
                disabled={loading || fetchingAssets || assets.length === 0}
              >
                <SelectTrigger id="asset">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.ticker} value={asset.ticker}>
                      {asset.name} ({asset.ticker}) - Balance: {asset.balance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assets.length === 0 && !fetchingAssets && (
                <p className="text-sm text-zinc-500">No assets with a balance found in your account.</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Select Recipient</Label>
              <DonationRecipient onSelectRecipient={setDestinationId} />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-emerald-600"
                  onClick={() => setAmount(getMaxAmount())}
                  disabled={loading || !selectedAsset}
                >
                  Max: {selectedAsset ? getMaxAmount() : '0'} {selectedAsset}
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading || !selectedAsset}
              />
            </div>

            {selectedAsset && amount && assets.length > 0 && (
              <div className="rounded-md bg-zinc-50 p-3 text-sm">
                <p className="font-medium">Donation Summary</p>
                <p className="text-zinc-600">
                  {amount} {selectedAsset}
                  {(() => {
                    const asset = assets.find((a) => a.ticker === selectedAsset)
                    const numericAmount = Number.parseFloat(amount)
                    if (asset && !isNaN(numericAmount) && asset.balance > 0 && asset.value >= 0) {
                      const valuePerUnit = asset.value / asset.balance
                      const donationValue = numericAmount * valuePerUnit
                      return ` (≈ $${donationValue.toFixed(2)})`
                    }
                    return ''
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {/* Show Cancel button only if not in 2FA prompt, or allow cancel from 2FA */}
          <Button
            variant="outline"
            onClick={() => {
              if (promptForTwoFactor) {
                setPromptForTwoFactor(false)
                setTwoFactorCode('')
                setTwoFactorError(null)
                pendingDonation.current = null
                // No setLoading(false) here, it should already be false
              } else {
                onClose()
              }
            }}
            disabled={loading}
          >
            {promptForTwoFactor ? 'Back' : 'Cancel'}
          </Button>

          {/* Show Submit 2FA button or original Donate button */}
          {promptForTwoFactor ? (
            <Button
              onClick={submitWithTwoFactor}
              disabled={loading || !twoFactorCode || twoFactorCode.length !== 6}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Verifying...
                </>
              ) : (
                'Submit Code'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleDonate}
              disabled={
                loading ||
                fetchingAssets ||
                !selectedAsset ||
                !amount ||
                Number.parseFloat(amount) <= 0 ||
                !destinationId
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                'Donate'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
