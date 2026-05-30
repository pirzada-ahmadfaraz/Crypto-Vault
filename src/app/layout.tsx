import type { Metadata } from 'next'
import { Bricolage_Grotesque, Schibsted_Grotesk, Spline_Sans_Mono } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: false,
})

const body = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: false,
})

const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CryptoVault — Self-Custody, Engineered',
  description: 'A secure, non-custodial multi-chain wallet for Bitcoin, Litecoin, and Ethereum. Your keys, your coins.',
  keywords: 'crypto, wallet, bitcoin, ethereum, litecoin, web3, non-custodial, secure, self-custody, defi',
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
  themeColor: '#0b0a08',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${body.variable} ${display.variable} ${mono.variable} font-sans grain bg-obsidian text-ink min-h-screen relative overflow-x-hidden antialiased`}
      >
        {/* Atmospheric background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* hairline grid, masked toward top */}
          <div
            className="grid-bg absolute inset-x-0 top-0 h-[120vh]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 78%)',
              maskImage: 'radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 78%)',
            }}
          />
          {/* warm gold bloom */}
          <div className="absolute top-[-18%] left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] rounded-full bg-gold-500/[0.07] blur-[150px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[38rem] h-[38rem] rounded-full bg-gold-700/[0.06] blur-[140px]" />
          {/* deepening vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
