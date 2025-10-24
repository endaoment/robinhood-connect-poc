'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DebugStoragePage() {
  const router = useRouter()
  const [storageData, setStorageData] = useState<Record<string, string>>({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Get all robinhood-related localStorage items
    const data: Record<string, string> = {}
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('robinhood_') || key === 'robinhood_order_success') {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = value
        }
      }
    })
    setStorageData(data)
  }, [refreshKey])

  const clearAllStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('robinhood_')) {
        localStorage.removeItem(key)
      }
    })
    setRefreshKey((prev) => prev + 1)
  }

  const clearItem = (key: string) => {
    localStorage.removeItem(key)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">LocalStorage Debugger</h1>
            <p className="text-zinc-600 mt-2">View and manage Robinhood-related localStorage items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRefreshKey((prev) => prev + 1)}>
              Refresh
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {Object.keys(storageData).length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <p className="text-yellow-800 text-lg">No Robinhood data found in localStorage</p>
              <p className="text-yellow-600 text-sm mt-2">Start a transfer from the dashboard to see data here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-600">
                Found {Object.keys(storageData).length} item{Object.keys(storageData).length !== 1 ? 's' : ''}
              </p>
              <Button variant="destructive" size="sm" onClick={clearAllStorage}>
                Clear All Storage
              </Button>
            </div>

            {Object.entries(storageData).map(([key, value]) => {
              let displayValue = value
              let isJson = false

              // Try to parse as JSON for prettier display
              try {
                const parsed = JSON.parse(value)
                displayValue = JSON.stringify(parsed, null, 2)
                isJson = true
              } catch {
                // Not JSON, display as-is
              }

              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{key}</CardTitle>
                        <CardDescription>
                          {isJson ? 'JSON Object' : 'String Value'} • {value.length} characters
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => clearItem(key)}>
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-zinc-100 p-4 rounded text-xs overflow-x-auto">
                      <code>{displayValue}</code>
                    </pre>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Expected Storage Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>During a transfer, you should see:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                <code className="bg-blue-100 px-1 rounded">robinhood_selected_asset</code> - Asset symbol (e.g., "ETH")
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">robinhood_selected_network</code> - Network name (e.g.,
                "ETHEREUM")
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">robinhood_connect_id</code> - Unique connection ID
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">robinhood_transfer_timestamp</code> - When transfer started
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">robinhood_order_success</code> - JSON with order details
                (after callback)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
