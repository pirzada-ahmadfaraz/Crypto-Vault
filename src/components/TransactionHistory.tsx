'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Filter, Search, Clock } from 'lucide-react'
import { Transaction } from '@/lib/api'

interface TransactionHistoryProps {
  transactions: Transaction[]
  walletAddresses?: {
    btc: string
    ltc: string
    eth: string
  }
  className?: string
}

export default function TransactionHistory({
  transactions,
  walletAddresses,
  className = ''
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'BTC' | 'LTC' | 'ETH'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by currency
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.currency === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [transactions, filter, searchTerm])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  const formatAmount = (value: string, currency: string) => {
    const num = parseFloat(value)
    if (num === 0) return '0'

    // Using string manipulation to preserve high precision if contained in string
    // but simplified to concise display for UI
    const decimals = currency === 'BTC' ? 8 : currency === 'ETH' ? 6 : 8
    return parseFloat(value).toFixed(decimals).replace(/\.?0+$/, '')
  }

  const getTransactionType = (tx: Transaction): 'sent' | 'received' => {
    if (!walletAddresses) return 'sent'

    const myAddresses = Object.values(walletAddresses).map(addr => addr.toLowerCase())
    const fromIsMe = myAddresses.includes(tx.from.toLowerCase())
    const toIsMe = myAddresses.includes(tx.to.toLowerCase())

    if (fromIsMe && !toIsMe) return 'sent'
    if (!fromIsMe && toIsMe) return 'received'
    return 'sent' // Default for same wallet transfers
  }

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return 'bitcoin text-[#F7931A]' // Using specific colors
      case 'ETH':
        return 'ethereum text-[#627EEA]'
      case 'LTC':
        return 'litecoin text-[#345D9D]'
      default:
        return 'coins'
    }
  }

  const openExplorer = (hash: string, currency: string) => {
    const explorers = {
      BTC: `https://blockstream.info/tx/${hash}`,
      ETH: `https://etherscan.io/tx/${hash}`,
      LTC: `https://blockchair.com/litecoin/transaction/${hash}`
    }

    window.open(explorers[currency as keyof typeof explorers] || '#', '_blank')
  }

  return (
    <div className={`glass-panel rounded-3xl p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            Transaction History
          </h2>
          <p className="text-sm text-gray-400 mt-1">Your recent activity</p>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-charcoal/50 border border-white/5 rounded-xl focus:border-primary-500/50 focus:bg-charcoal focus:outline-none transition-all text-sm w-40 sm:w-64 placeholder:text-gray-600 text-gray-300"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-charcoal/50 border border-white/5 rounded-xl focus:border-primary-500/50 focus:bg-charcoal focus:outline-none transition-all text-sm appearance-none text-gray-300 cursor-pointer hover:bg-charcoal"
            >
              <option value="all">All</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="LTC">LTC</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/2">
          <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Search className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">No transactions found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => {
            const type = getTransactionType(tx)
            const isReceived = type === 'received'

            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 bg-charcoal/30 hover:bg-charcoal/60 border border-transparent hover:border-primary-500/20 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${isReceived ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isReceived ? (
                      <ArrowDownLeft className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">
                        {isReceived ? 'Received' : 'Sent'} <span className={tx.currency === 'BTC' ? 'text-orange-500' : tx.currency === 'ETH' ? 'text-blue-500' : 'text-gray-400'}>{tx.currency}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-mono text-xs">{formatHash(tx.hash)}</span>
                      <button
                        onClick={() => openExplorer(tx.hash, tx.currency)}
                        className="hover:text-primary-400 transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>{formatDate(tx.timestamp)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isReceived ? 'text-green-400' : 'text-white'}`}>
                      {isReceived ? '+' : '-'}{formatAmount(tx.value, tx.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Fee: {formatAmount(tx.fee, tx.currency)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}