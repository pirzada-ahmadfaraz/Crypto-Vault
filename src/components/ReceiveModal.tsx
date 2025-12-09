'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check, Share2 } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import QRCode from 'react-qr-code'

interface ReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCurrency?: 'BTC' | 'LTC' | 'ETH'
}

export default function ReceiveModal({
  isOpen,
  onClose,
  selectedCurrency = 'BTC'
}: ReceiveModalProps) {
  const [currency, setCurrency] = useState<'BTC' | 'LTC' | 'ETH'>(selectedCurrency)
  const [copied, setCopied] = useState(false)

  const { wallet } = useWalletStore()

  useEffect(() => {
    setCurrency(selectedCurrency)
  }, [selectedCurrency])

  const getAddress = () => {
    if (!wallet) return ''
    return wallet.addresses[currency.toLowerCase() as keyof typeof wallet.addresses]
  }

  const copyAddress = () => {
    const address = getAddress()
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQR = () => {
    const address = getAddress()
    const element = document.createElement('a')
    const file = new Blob([`${currency} Address: ${address}`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${currency.toLowerCase()}-address.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getCurrencyIcon = (curr: string) => {
    switch (curr) {
      case 'BTC':
        return '₿'
      case 'ETH':
        return 'Ξ'
      case 'LTC':
        return 'Ł'
      default:
        return '?'
    }
  }

  const getCurrencyName = (curr: string) => {
    switch (curr) {
      case 'BTC':
        return 'Bitcoin'
      case 'ETH':
        return 'Ethereum'
      case 'LTC':
        return 'Litecoin'
      default:
        return curr
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />

            <div className="p-8 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                    <Download className="w-5 h-5" />
                  </div>
                  Receive Crypto
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Currency Selector */}
                <div className="flex gap-2 p-1 bg-charcoal/50 rounded-xl overflow-hidden">
                  {['BTC', 'ETH', 'LTC'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c as any)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${currency === c
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium text-gray-300">Scan to deposit <span className="text-white font-bold">{getCurrencyName(currency)}</span></h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Only send {currency} to this address</p>
                </div>

                {/* QR Code Container */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl shadow-xl shadow-white/5 mx-auto">
                    {getAddress() ? (
                      <QRCode
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={getAddress()}
                        viewBox={`0 0 200 200`}
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded-lg" />
                    )}
                  </div>
                </div>

                {/* Address Box */}
                <div className="bg-charcoal/50 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Wallet Address</span>
                    {copied && <span className="text-xs text-green-400 font-bold animate-pulse">Copied to clipboard!</span>}
                  </div>

                  <p className="font-mono text-sm break-all text-center text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 select-all">
                    {getAddress() || 'Loading address...'}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={copyAddress}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 group-hover:text-primary-400 transition-colors" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadQR}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      <Share2 className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                  <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                    <span className="text-xs font-bold">i</span>
                  </div>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Transactions usually take 10-30 minutes to confirm.
                    Ensure you are sending via the correct network.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}