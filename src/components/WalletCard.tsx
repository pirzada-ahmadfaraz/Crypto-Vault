'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Send, Download } from 'lucide-react'
import { Balance } from '@/lib/api'

interface WalletCardProps {
  balance: Balance
  onSend: () => void
  onReceive: () => void
  className?: string
}

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
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

const getCurrencyColor = (currency: string) => {
  switch (currency) {
    case 'BTC':
      return 'from-orange-500 to-orange-600'
    case 'ETH':
      return 'from-blue-500 to-blue-600'
    case 'LTC':
      return 'from-gray-400 to-gray-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

export default function WalletCard({ balance, onSend, onReceive, className = '' }: WalletCardProps) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(balance.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`gradient-border ${className}`}
    >
      <div className="gradient-border-content p-6 h-full">
        {/* Currency Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getCurrencyColor(balance.currency)} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">
                {getCurrencyIcon(balance.currency)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {balance.currency === 'BTC' ? 'Bitcoin' : 
                 balance.currency === 'ETH' ? 'Ethereum' : 'Litecoin'}
              </h3>
              <p className="text-xs text-gray-400">{balance.currency}</p>
            </div>
          </div>
          
          <button
            onClick={copyAddress}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Balance Display */}
        <div className="space-y-2 mb-6">
          <p className="text-2xl font-bold">{balance.balance} {balance.currency}</p>
          <p className="text-lg font-medium text-green-400">${balance.balanceUSD}</p>
        </div>

        {/* Address */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">Address</p>
          <p className="text-sm font-mono text-gray-300 bg-dark-bg px-3 py-2 rounded-lg">
            {formatAddress(balance.address)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSend}
            className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            Send
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReceive}
            className="flex-1 py-2 border border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Receive
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}