"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("coinbase", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connect with Coinbase</CardTitle>
          <CardDescription>Link your Coinbase account to make crypto donations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-2 font-medium">What you're authorizing:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
              <li>View your Coinbase account information</li>
              <li>View your crypto balances</li>
              <li>Send transactions (only when you explicitly approve)</li>
            </ul>
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSignIn} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect with Coinbase"
            )}
          </Button>
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
