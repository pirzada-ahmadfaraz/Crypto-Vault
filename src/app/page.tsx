'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Wallet, Globe, ArrowRight, Bitcoin, DollarSign, Lock, TrendingUp, TrendingDown } from 'lucide-react'
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
      title: "Secure",
      description: "Military-grade encryption keeps your wallet data safe in your browser."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-purple bg-clip-text text-transparent"
        >
          CryptoVault
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex space-x-6 text-sm text-gray-300"
        >
          <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
          <a href="#security" className="hover:text-primary-400 transition-colors">Security</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">GitHub</a>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-primary-400 font-medium text-sm uppercase tracking-wider"
              >
                Multi-Chain Web Wallet
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                Your Crypto,{' '}
                <span className="bg-gradient-to-r from-primary-400 via-accent-purple to-accent-pink bg-clip-text text-transparent">
                  Your Control
                </span>
              </motion.h1>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg max-w-lg leading-relaxed"
            >
              Generate, manage, and send Bitcoin, Litecoin, and Ethereum directly in your browser. 
              No signups, no custodians, no compromises.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href={hasWallet ? "/unlock" : "/create-wallet"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  {hasWallet ? 'Unlock Wallet' : 'Create Wallet'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/recover-wallet">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-accent-purple text-accent-purple rounded-xl font-semibold hover:bg-accent-purple hover:text-white transition-all duration-300"
                >
                  Recover Wallet
                </motion.button>
              </Link>
              
              {hasWallet && (
                <Link href="/create-wallet">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-gray-600 text-gray-400 rounded-xl font-semibold hover:bg-gray-700 hover:text-white transition-all duration-300"
                  >
                    New Wallet
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Right Section - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <div className="w-full max-w-md mx-auto">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="space-y-4"
              >
                {/* Bitcoin Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="gradient-border"
                >
                  <div className="gradient-border-content p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <Bitcoin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Bitcoin</p>
                        <p className="text-sm text-gray-400">BTC</p>
                        <div className="flex items-center gap-2">
                          {isLoadingPrices ? (
                            <p className="text-gray-400 font-medium">Loading...</p>
                          ) : priceData ? (
                            <>
                              <p className="text-white font-medium">
                                ${priceData.BTC.price.toLocaleString()}
                              </p>
                              <div className={`flex items-center gap-1 ${
                                priceData.BTC.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {priceData.BTC.change24h >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium">
                                  {priceData.BTC.change24h.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-400 font-medium">$43,250</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Ethereum Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="gradient-border ml-8"
                >
                  <div className="gradient-border-content p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Ξ</span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Ethereum</p>
                        <p className="text-sm text-gray-400">ETH</p>
                        <div className="flex items-center gap-2">
                          {isLoadingPrices ? (
                            <p className="text-gray-400 font-medium">Loading...</p>
                          ) : priceData ? (
                            <>
                              <p className="text-white font-medium">
                                ${priceData.ETH.price.toLocaleString()}
                              </p>
                              <div className={`flex items-center gap-1 ${
                                priceData.ETH.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {priceData.ETH.change24h >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium">
                                  {priceData.ETH.change24h.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-400 font-medium">$2,651</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Litecoin Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="gradient-border"
                >
                  <div className="gradient-border-content p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Ł</span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Litecoin</p>
                        <p className="text-sm text-gray-400">LTC</p>
                        <div className="flex items-center gap-2">
                          {isLoadingPrices ? (
                            <p className="text-gray-400 font-medium">Loading...</p>
                          ) : priceData ? (
                            <>
                              <p className="text-white font-medium">
                                ${priceData.LTC.price.toLocaleString()}
                              </p>
                              <div className={`flex items-center gap-1 ${
                                priceData.LTC.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {priceData.LTC.change24h >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium">
                                  {priceData.LTC.change24h.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-400 font-medium">$72</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CryptoVault?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with security and user experience in mind, CryptoVault gives you complete control over your digital assets.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-purple rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 CryptoVault. Built with security and privacy in mind.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}