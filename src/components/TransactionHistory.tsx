'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Filter, Search } from 'lucide-react'
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

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
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

  const openExplorer = (hash: string, currency: string) => {
    const explorers = {
      BTC: `https://blockstream.info/tx/${hash}`,
      ETH: `https://etherscan.io/tx/${hash}`,
      LTC: `https://blockchair.com/litecoin/transaction/${hash}`
    }
    
    window.open(explorers[currency as keyof typeof explorers] || '#', '_blank')
  }

  return (
    <div className={`glass-effect rounded-2xl p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-sm"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-dark-card border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-sm appearance-none"
            >
              <option value="all">All</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="LTC">Litecoin</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUpRight className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => {
            const type = getTransactionType(tx)
            const isReceived = type === 'received'
            
            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-dark-card rounded-lg hover:bg-dark-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isReceived ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {isReceived ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {isReceived ? 'Received' : 'Sent'} {getCurrencyIcon(tx.currency)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="font-mono">{formatHash(tx.hash)}</span>
                      <button
                        onClick={() => openExplorer(tx.hash, tx.currency)}
                        className="hover:text-white transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(tx.timestamp)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-semibold ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
                      {isReceived ? '+' : '-'}{formatAmount(tx.value, tx.currency)} {tx.currency}
                    </p>
                    <p className="text-xs text-gray-400">
                      Fee: {formatAmount(tx.fee, tx.currency)} {tx.currency}
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