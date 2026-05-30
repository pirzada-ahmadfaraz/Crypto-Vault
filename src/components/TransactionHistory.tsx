'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Search, Activity } from 'lucide-react'
import { Transaction } from '@/lib/api'

interface TransactionHistoryProps {
  transactions: Transaction[]
  walletAddresses?: { btc: string; ltc: string; eth: string }
  className?: string
}

const CHAIN_COLOR: Record<string, string> = {
  BTC: 'text-chain-btc',
  ETH: 'text-chain-eth',
  LTC: 'text-chain-ltc',
}

export default function TransactionHistory({ transactions, walletAddresses, className = '' }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'BTC' | 'LTC' | 'ETH'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    let f = transactions
    if (filter !== 'all') f = f.filter((tx) => tx.currency === filter)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      f = f.filter((tx) => tx.hash.toLowerCase().includes(q) || tx.from.toLowerCase().includes(q) || tx.to.toLowerCase().includes(q))
    }
    return [...f].sort((a, b) => b.timestamp - a.timestamp)
  }, [transactions, filter, searchTerm])

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const formatHash = (h: string) => `${h.slice(0, 6)}…${h.slice(-6)}`

  const formatAmount = (value: string, currency: string) => {
    const num = parseFloat(value)
    if (num === 0) return '0'
    const decimals = currency === 'ETH' ? 6 : 8
    return parseFloat(value).toFixed(decimals).replace(/\.?0+$/, '')
  }

  const getType = (tx: Transaction): 'sent' | 'received' => {
    if (!walletAddresses) return 'sent'
    const mine = Object.values(walletAddresses).map((a) => a.toLowerCase())
    const fromMe = mine.includes(tx.from.toLowerCase())
    const toMe = mine.includes(tx.to.toLowerCase())
    if (fromMe && !toMe) return 'sent'
    if (!fromMe && toMe) return 'received'
    return 'sent'
  }

  const statusStyle = (s: Transaction['status']) =>
    s === 'confirmed' ? 'border-up/25 text-up bg-up/10'
      : s === 'pending' ? 'border-gold-500/25 text-gold-300 bg-gold-500/10'
        : s === 'failed' ? 'border-down/25 text-down bg-down/10'
          : 'border-white/10 text-ink-faint bg-white/5'

  const openExplorer = (hash: string, currency: string) => {
    const ex: Record<string, string> = {
      BTC: `https://blockstream.info/tx/${hash}`,
      ETH: `https://etherscan.io/tx/${hash}`,
      LTC: `https://blockchair.com/litecoin/transaction/${hash}`,
    }
    window.open(ex[currency] || '#', '_blank')
  }

  const filters = ['all', 'BTC', 'ETH', 'LTC'] as const

  return (
    <div className={`panel rounded-3xl p-6 sm:p-7 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-gold-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold leading-none">Activity</h2>
            <p className="mono-label text-[0.5rem] text-ink-faint mt-1.5">Recent transactions</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-gold-300 transition-colors" />
            <input
              type="text"
              placeholder="Search hash / address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field pl-10 pr-4 py-2.5 text-sm w-44 sm:w-64"
            />
          </div>
          {/* segmented filter */}
          <div className="flex items-center rounded-xl border border-white/8 bg-white/[0.02] p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg mono-label text-[0.55rem] transition-all ${
                  filter === f ? 'bg-gold-sheen text-[#1a1408]' : 'text-ink-faint hover:text-ink'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/8">
          <div className="w-14 h-14 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center mx-auto mb-4 text-ink-faint">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-sm text-ink-dim font-medium">No transactions yet</p>
          <p className="mono-label text-[0.5rem] text-ink-faint mt-2">Your activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, index) => {
            const received = getType(tx) === 'received'
            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
                className="group flex items-center gap-4 rounded-2xl border border-white/6 bg-white/[0.012] hover:bg-white/[0.03] hover:border-white/12 px-4 py-3.5 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${received ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`}>
                  {received ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {received ? 'Received' : 'Sent'}{' '}
                      <span className={CHAIN_COLOR[tx.currency] ?? 'text-ink'}>{tx.currency}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border mono-label text-[0.45rem] ${statusStyle(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-faint">
                    <span className="font-mono text-[0.7rem]">{formatHash(tx.hash)}</span>
                    <button onClick={() => openExplorer(tx.hash, tx.currency)} className="hover:text-gold-300 transition-colors" title="View on explorer">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="w-1 h-1 rounded-full bg-white/15" />
                    <span className="text-[0.7rem]">{formatDate(tx.timestamp)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-mono text-base font-medium tabular-nums ${received ? 'text-up' : 'text-ink'}`}>
                    {received ? '+' : '−'}{formatAmount(tx.value, tx.currency)}
                  </p>
                  <p className="mono-label text-[0.45rem] text-ink-faint mt-0.5">Fee {formatAmount(tx.fee, tx.currency)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
