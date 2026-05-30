'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Balance } from '@/lib/api'

interface WalletCardProps {
  balance: Balance
  onSend: () => void
  onReceive: () => void
  hidden?: boolean
  className?: string
}

const META = {
  BTC: { name: 'Bitcoin', glyph: '₿', color: 'text-chain-btc', glow: 'bg-chain-btc' },
  ETH: { name: 'Ethereum', glyph: 'Ξ', color: 'text-chain-eth', glow: 'bg-chain-eth' },
  LTC: { name: 'Litecoin', glyph: 'Ł', color: 'text-chain-ltc', glow: 'bg-chain-ltc' },
} as const

export default function WalletCard({ balance, onSend, onReceive, hidden = false, className = '' }: WalletCardProps) {
  const [copied, setCopied] = useState(false)
  const m = META[balance.currency] ?? META.BTC

  const copyAddress = () => {
    navigator.clipboard.writeText(balance.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortAddr = (a: string) => (a.length <= 12 ? a : `${a.slice(0, 6)}…${a.slice(-6)}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`panel panel-hover rounded-3xl p-6 relative overflow-hidden group ${className}`}
    >
      {/* chain glow */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${m.glow} opacity-[0.07] blur-3xl group-hover:opacity-[0.13] transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-2xl font-bold ${m.color}`}>
              {m.glyph}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold leading-none">{m.name}</h3>
              <p className="mono-label text-[0.5rem] text-ink-faint mt-1.5">{balance.currency}</p>
            </div>
          </div>
          <button
            onClick={copyAddress}
            className="w-9 h-9 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-ink-faint hover:text-ink hover:border-white/20 transition-all"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* balance */}
        <div className="mb-6">
          <p className="mono-label text-[0.5rem] text-ink-faint mb-2">Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-medium tabular-nums tracking-tight">
              {hidden ? '••••' : balance.balance}
            </span>
            <span className="text-sm text-ink-faint font-medium">{balance.currency}</span>
          </div>
          <p className="font-mono text-sm text-gold-300 mt-1 tabular-nums">
            {hidden ? '••••' : `$${balance.balanceUSD}`}
          </p>
        </div>

        {/* address */}
        <div className="rounded-xl border border-white/6 bg-white/[0.015] px-3.5 py-2.5 flex items-center justify-between mb-4">
          <span className="mono-label text-[0.5rem] text-ink-faint">Address</span>
          <span className="font-mono text-xs text-ink-dim">{shortAddr(balance.address)}</span>
        </div>

        {/* actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button onClick={onSend} className="btn-gold rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <ArrowUpRight className="w-4 h-4" /> Send
          </button>
          <button onClick={onReceive} className="btn-ghost rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <ArrowDownLeft className="w-4 h-4" /> Receive
          </button>
        </div>
      </div>
    </motion.div>
  )
}
