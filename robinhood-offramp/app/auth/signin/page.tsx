'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Transfer with Robinhood</CardTitle>
          <CardDescription>Use your Robinhood crypto to make donations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-2 font-medium">How it works:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
              <li>Choose crypto asset and amount to transfer</li>
              <li>Open Robinhood app to confirm</li>
              <li>Receive deposit address and complete transfer</li>
              <li>Track your donation until completion</li>
            </ul>
          </div>
          <Link href="/dashboard">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
        <CardFooter>
          <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
