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

const getCurrencyGradient = (currency: string) => {
  switch (currency) {
    case 'BTC':
      return 'from-[#F7931A] to-[#F7931A]/60'
    case 'ETH':
      return 'from-[#627EEA] to-[#627EEA]/60'
    case 'LTC':
      return 'from-[#345D9D] to-[#345D9D]/60'
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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`glass-panel rounded-3xl p-6 relative overflow-hidden group ${className}`}
    >
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${getCurrencyGradient(balance.currency)} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCurrencyGradient(balance.currency)} shadow-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-2xl">
                {getCurrencyIcon(balance.currency)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">
                {balance.currency === 'BTC' ? 'Bitcoin' :
                  balance.currency === 'ETH' ? 'Ethereum' : 'Litecoin'}
              </h3>
              <p className="text-sm text-gray-400 font-medium">{balance.currency}</p>
            </div>
          </div>

          <button
            onClick={copyAddress}
            className="p-2 rounded-xl bg-charcoal/50 hover:bg-charcoal text-gray-400 hover:text-white transition-all duration-300 border border-white/5"
            title="Copy address"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Balance */}
        <div className="space-y-1 mb-8">
          <p className="text-sm text-gray-400 font-medium">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{balance.balance}</span>
            <span className="text-lg text-gray-500 font-medium">{balance.currency}</span>
          </div>
          <p className="text-lg font-medium text-primary-400">${balance.balanceUSD}</p>
        </div>

        {/* Address & Actions */}
        <div className="space-y-4">
          <div className="bg-charcoal/40 border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between group/addr hover:border-primary-500/30 transition-colors">
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm font-mono text-gray-300 group-hover/addr:text-white transition-colors">
              {formatAddress(balance.address)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSend}
              className="py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReceive}
              className="py-3 bg-charcoal hover:bg-charcoal-light border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Receive
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}