'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check } from 'lucide-react'
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

  const address = getAddress()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-dark-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-dark-border mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-primary-400" />
                Receive Crypto
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Network</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'BTC' | 'LTC' | 'ETH')}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="LTC">Litecoin (LTC)</option>
                </select>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">
                      {getCurrencyIcon(currency)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{getCurrencyName(currency)}</h3>
                  <p className="text-sm text-gray-400">Send only {currency} to this address</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
                <div className="text-center">
                  {address ? (
                    <QRCode
                      size={180}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      value={address}
                      viewBox={`0 0 180 180`}
                    />
                  ) : (
                    <div className="w-45 h-45 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-700 mt-3">QR Code</p>
                  <p className="text-xs text-gray-500">Scan to get address</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your {currency} Address</label>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <p className="font-mono text-sm break-all text-center mb-3">
                    {address}
                  </p>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={copyAddress}
                      className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadQR}
                      className="flex-1 py-2 border border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Save
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                  <div className="text-sm text-amber-200">
                    <p className="font-medium mb-1">Important Notice:</p>
                    <p>
                      Only send {getCurrencyName(currency)} ({currency}) to this address. 
                      Sending other cryptocurrencies may result in permanent loss of funds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-bg rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span>{getCurrencyName(currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Confirmations:</span>
                  <span>{currency === 'BTC' ? '3-6' : currency === 'ETH' ? '12-20' : '6-12'} blocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Time:</span>
                  <span>
                    {currency === 'BTC' ? '30-60 min' : currency === 'ETH' ? '5-15 min' : '15-30 min'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}