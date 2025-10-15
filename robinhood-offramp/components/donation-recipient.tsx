'use client'

import type React from 'react'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface DonationRecipientProps {
  onSelectRecipient: (id: string) => void
}

// Predefined list of donation recipients
const DONATION_RECIPIENTS = [
  {
    id: 'ID_Global_Education_Fund',
    name: 'Global Education Fund',
    description: 'Supporting education initiatives worldwide',
  },
  {
    id: 'ID_Climate_Action_Now',
    name: 'Climate Action Now',
    description: 'Fighting climate change through direct action',
  },
  {
    id: 'ID_Medical_Relief_International',
    name: 'Medical Relief International',
    description: 'Providing medical aid to underserved communities',
  },
]

export function DonationRecipient({ onSelectRecipient }: DonationRecipientProps) {
  const [selectedOption, setSelectedOption] = useState('predefined')
  const [selectedRecipient, setSelectedRecipient] = useState(DONATION_RECIPIENTS[0].id)
  const [customAddress, setCustomAddress] = useState('')

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)

    if (value === 'predefined') {
      const recipient = DONATION_RECIPIENTS.find((r) => r.id === selectedRecipient)
      if (recipient) {
        onSelectRecipient(recipient.id)
      }
    } else {
      onSelectRecipient(customAddress)
    }
  }

  const handleRecipientChange = (id: string) => {
    setSelectedRecipient(id)
    const recipient = DONATION_RECIPIENTS.find((r) => r.id === id)
    if (recipient) {
      onSelectRecipient(recipient.id)
    }
  }

  const handleCustomAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAddress(e.target.value)
    if (selectedOption === 'custom') {
      onSelectRecipient(e.target.value)
    }
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="predefined" id="predefined" />
          <div className="grid gap-1.5">
            <Label htmlFor="predefined">Select a recipient</Label>
            {selectedOption === 'predefined' && (
              <div className="mt-2 space-y-2">
                {DONATION_RECIPIENTS.map((recipient) => (
                  <div
                    key={recipient.id}
                    className={`cursor-pointer rounded-md border p-3 ${
                      selectedRecipient === recipient.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleRecipientChange(recipient.id)}
                  >
                    <div className="font-medium">{recipient.name}</div>
                    <div className="text-xs text-gray-500">{recipient.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <div className="grid gap-1.5 w-full">
            <Label htmlFor="custom">Custom address</Label>
            {selectedOption === 'custom' && (
              <Input
                id="custom-address"
                placeholder="Enter wallet address"
                value={customAddress}
                onChange={handleCustomAddressChange}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}
