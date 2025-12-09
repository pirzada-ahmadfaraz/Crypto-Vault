'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Wallet, Globe, ArrowRight, Bitcoin, Lock, TrendingUp, TrendingDown, Menu, X, ChevronRight } from 'lucide-react'
import { hasStoredWallet } from '@/lib/storage'
import { fetchPricesWithChange } from '@/lib/api'

export default function HomePage() {
  const [hasWallet, setHasWallet] = useState(false)
  const [priceData, setPriceData] = useState<{
    BTC: { price: number; change24h: number };
    LTC: { price: number; change24h: number };
    ETH: { price: number; change24h: number };
  } | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHasWallet(hasStoredWallet())

    // Fetch real-time prices
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true)
        const prices = await fetchPricesWithChange()
        setPriceData(prices)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPrices()
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Non-Custodial",
      description: "Your keys, your coins. We never store your private keys or seed phrases."
    },
    {
      icon: Globe,
      title: "Multi-Chain",
      description: "Support for Bitcoin, Litecoin, and Ethereum in one unified interface."
    },
    {
      icon: Lock,
      title: "Secure Encryption",
      description: "Military-grade encryption keeps your wallet data safe in your browser."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <Image
                src="/logo.png"
                alt="CryptoVault Logo"
                width={40}
                height={40}
                className="rounded-full relative z-10"
              />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              CryptoVault
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400"
          >
            <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
            <a href="#security" className="hover:text-primary-400 transition-colors">Security</a>
            <a href="https://github.com/pirzada-ahmadfaraz/Crypto-Vault" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">GitHub</a>
            {hasWallet && (
              <Link href="/unlock">
                <button className="bg-charcoal-light border border-charcoal hover:border-primary-500/50 text-white px-5 py-2 rounded-lg transition-all duration-300">
                  Open Wallet
                </button>
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/20 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider"
              >
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                Next Gen Web3 Wallet
              </motion.div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight text-white">
                Future of <br />
                <span className="text-gradient">Digital Assets</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
                Experience the next evolution of crypto management. Non-custodial, multi-chain, and beautifully designed for the modern web.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href={hasWallet ? "/unlock" : "/create-wallet"}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Wallet className="w-5 h-5" />
                  {hasWallet ? 'Unlock Wallet' : 'Create New Wallet'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link href="/recover-wallet">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-charcoal/60 text-gray-300 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Import Wallet
                </motion.button>
              </Link>
            </div>

            {/* Quick Stats / Mini Ticker */}
            <div className="pt-8 border-t border-white/5 flex gap-8">
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-widest">Supported Chains</p>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center ring-2 ring-obsidian">
                    <Bitcoin className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center ring-2 ring-obsidian">
                    <span className="text-white font-bold text-sm">Ξ</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#345D9D] flex items-center justify-center ring-2 ring-obsidian">
                    <span className="text-white font-bold text-sm">Ł</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-widest">Security</p>
                <div className="flex items-center gap-2 text-primary-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">AES-256</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual - 3D/Floating Cards */}
          <div className="relative hidden lg:block h-[600px] w-full">
            {/* Abstract Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px]" />

            {/* Main Card */}
            <motion.div
              initial={{ y: 20, opacity: 0, rotateX: 10 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute top-[10%] left-[10%] right-[10%] z-20"
            >
              <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Wallet className="w-32 h-32 text-white" />
                </div>

                <p className="text-gray-400 text-sm mb-2">Total Balance</p>
                <h3 className="text-4xl font-bold text-white mb-8">$45,231.89</h3>

                <div className="flex gap-4 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> +2.5%
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-400">
                    24h Change
                  </div>
                </div>

                {/* Price List */}
                <div className="space-y-3">
                  {[
                    { name: 'Bitcoin', symbol: 'BTC', price: priceData?.BTC.price ?? 43250, change: priceData?.BTC.change24h ?? 1.2, color: 'text-orange-500' },
                    { name: 'Ethereum', symbol: 'ETH', price: priceData?.ETH.price ?? 2651, change: priceData?.ETH.change24h ?? -0.5, color: 'text-blue-500' },
                  ].map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-charcoal flex items-center justify-center ${coin.color} font-bold`}>
                          {coin.symbol[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{coin.name}</p>
                          <p className="text-gray-500 text-xs">{coin.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${coin.price.toLocaleString()}</p>
                        <p className={`text-xs ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-10"
            >
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 w-48">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Profit</p>
                  <p className="text-green-400 font-bold">+$1,204.50</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-5 -left-5 z-30"
            >
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 w-48">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-primary-400 font-bold">Encrypted</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Uncompromising <span className="text-gradient">Security</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with the latest cryptographic standards to ensure your assets remain solely in your control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-panel glass-panel-hover rounded-3xl p-8 group"
              >
                <div className="w-14 h-14 bg-charcoal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-primary-500/30">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                <div className="mt-6 flex items-center text-sm text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                  <span className="mr-2">Learn more</span> <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-charcoal/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-500 flex items-center justify-center font-bold">
                C
              </div>
              <span className="text-gray-400 text-sm">
                © 2025 Ahmad Faraz. Open Source.
              </span>
            </div>
            <div className="flex space-x-8 text-sm text-gray-500">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
              <a href="https://github.com/pirzada-ahmadfaraz/Crypto-Vault" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">Source Code</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}