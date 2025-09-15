import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CryptoVault - Multi-Chain Web Wallet',
  description: 'A secure, non-custodial multi-chain wallet for Bitcoin, Litecoin, and Ethereum',
  keywords: 'crypto, wallet, bitcoin, ethereum, litecoin, web3, non-custodial',
  authors: [{ name: 'Ahmad Faraz' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-bg text-white min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg">
          {children}
        </div>
      </body>
    </html>
  )
}