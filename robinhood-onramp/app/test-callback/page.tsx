'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestCallbackPage() {
  const router = useRouter()

  const mockCallbacks = [
    {
      title: 'Success Callback - Order ID (ACTUAL FORMAT)',
      description: 'Simulates the actual callback from Robinhood with orderId - THIS IS WHAT ROBINHOOD SENDS',
      url: '/callback?orderId=e4045e33-54fc-4503-a5c8-25c0f13e0206',
      highlight: true,
    },
    {
      title: 'Success Callback - All IDs',
      description: 'Simulates callback with orderId, connectId, and depositQuoteId',
      url: '/callback?orderId=e4045e33-54fc-4503-a5c8-25c0f13e0206&connectId=9fbc1a8b-f320-4568-b876-63e640244174&depositQuoteId=dq_abc123xyz789',
    },
    {
      title: 'Success Callback - Only Connect ID',
      description: 'Simulates callback with just connectId',
      url: '/callback?connectId=9fbc1a8b-f320-4568-b876-63e640244174',
    },
    {
      title: 'Success Callback - Only Deposit Quote ID',
      description: 'Simulates callback with just depositQuoteId',
      url: '/callback?depositQuoteId=dq_abc123xyz789',
    },
  ]

  const handleTestCallback = (url: string) => {
    console.log('🧪 [TEST] Triggering mock callback:', url)

    // Set mock localStorage data to simulate a real transfer
    const mockReferenceId = '9fbc1a8b-f320-4568-b876-63e640244174'
    localStorage.setItem('robinhood_selected_asset', 'ETH')
    localStorage.setItem('robinhood_selected_network', 'ETHEREUM')
    localStorage.setItem('robinhood_transfer_amount', '0.5')
    localStorage.setItem('robinhood_connect_id', mockReferenceId)
    localStorage.setItem('robinhood_transfer_timestamp', (Date.now() - 15000).toString()) // 15 seconds ago

    console.log('🧪 [TEST] Mock localStorage data set')

    // Add referenceId to URL if not already present
    const urlWithRef = url.includes('referenceId') ? url : `${url}&referenceId=${mockReferenceId}`
    router.push(urlWithRef)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Callback Testing Page</h1>
          <p className="text-zinc-600 mt-2">
            Click any button below to simulate different callback scenarios from Robinhood
          </p>
        </div>

        <div className="grid gap-4">
          {mockCallbacks.map((callback, index) => (
            <Card key={index} className={callback.highlight ? 'border-2 border-emerald-500 bg-emerald-50' : ''}>
              <CardHeader>
                <CardTitle className={callback.highlight ? 'text-emerald-900' : ''}>
                  {callback.title}
                  {callback.highlight && (
                    <span className="ml-2 text-xs font-normal bg-emerald-600 text-white px-2 py-1 rounded">
                      RECOMMENDED
                    </span>
                  )}
                </CardTitle>
                <CardDescription className={callback.highlight ? 'text-emerald-700' : ''}>
                  {callback.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-3 rounded font-mono text-xs break-all ${callback.highlight ? 'bg-white border-2 border-emerald-200' : 'bg-zinc-100'}`}
                >
                  {callback.url}
                </div>
                <Button
                  onClick={() => handleTestCallback(callback.url)}
                  className={`w-full ${callback.highlight ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Trigger This Callback
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>✅ When you click a callback button:</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Mock transfer data is set in localStorage (ETH on ETHEREUM, 0.5 amount)</li>
              <li>You'll be redirected to the callback page</li>
              <li>The callback will process the order details and combine with stored transfer info</li>
              <li>You'll be automatically redirected to the dashboard</li>
              <li>
                A rich toast will appear showing:
                <ul className="list-disc ml-6 mt-1">
                  <li>🖼️ Asset icon and name</li>
                  <li>📦 Transaction summary (asset, network, amount)</li>
                  <li>⚡ Time to complete (should be ~15 seconds)</li>
                  <li>🆔 Order ID, Connect ID, and other identifiers</li>
                </ul>
              </li>
              <li>The toast will stay visible until you manually dismiss it</li>
            </ol>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
