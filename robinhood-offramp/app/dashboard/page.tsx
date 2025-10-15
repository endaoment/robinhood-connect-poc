"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import DonationModal from "@/components/donation-modal"

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Crypto Donations Dashboard</h1>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your Coinbase account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-500">Email</span>
                  <span className="font-medium">{session?.user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-500">Name</span>
                  <span className="font-medium">{session?.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-500">Status</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                    Connected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>Support causes with your crypto assets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600">
                Ready to make a difference? Click the button below to donate using your Coinbase assets.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsModalOpen(true)}>
                Donate Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <DonationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
