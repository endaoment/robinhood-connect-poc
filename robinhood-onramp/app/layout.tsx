import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AssetRegistryToast } from '@/components/asset-registry-toast'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Robinhood Connect - Crypto Donations',
  description: 'Transfer crypto from Robinhood to support causes you care about',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AssetRegistryToast />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
