'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowDownLeft, Copy, Check, Share2 } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import QRCode from 'react-qr-code'

interface ReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCurrency?: 'BTC' | 'LTC' | 'ETH'
}

const META = {
  BTC: { name: 'Bitcoin', color: 'text-chain-btc' },
  ETH: { name: 'Ethereum', color: 'text-chain-eth' },
  LTC: { name: 'Litecoin', color: 'text-chain-ltc' },
} as const

export default function ReceiveModal({ isOpen, onClose, selectedCurrency = 'BTC' }: ReceiveModalProps) {
  const [currency, setCurrency] = useState<'BTC' | 'LTC' | 'ETH'>(selectedCurrency)
  const [copied, setCopied] = useState(false)
  const { wallet } = useWalletStore()

  useEffect(() => { setCurrency(selectedCurrency) }, [selectedCurrency])

  const getAddress = () => (wallet ? wallet.addresses[currency.toLowerCase() as keyof typeof wallet.addresses] : '')

  const copyAddress = () => {
    const address = getAddress()
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const downloadQR = () => {
    const address = getAddress()
    const element = document.createElement('a')
    const file = new Blob([`${currency} Address: ${address}`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${currency.toLowerCase()}-address.txt`
    document.body.appendChild(element); element.click(); document.body.removeChild(element)
  }

  const networks = ['BTC', 'ETH', 'LTC'] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="frost w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />

            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-300"><ArrowDownLeft className="w-5 h-5" /></span>
                  Receive
                </h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-ink-faint hover:text-ink hover:border-white/20 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* network segmented */}
              <div className="flex gap-1 p-1 rounded-xl border border-white/8 bg-white/[0.02] mb-6">
                {networks.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} className={`flex-1 py-2.5 rounded-lg mono-label text-[0.55rem] transition-all ${currency === c ? 'bg-gold-sheen text-[#1a1408]' : 'text-ink-faint hover:text-ink'}`}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="text-center mb-5">
                <p className="text-sm text-ink-dim">Scan to deposit <span className={`font-semibold ${META[currency].color}`}>{META[currency].name}</span></p>
                <p className="mono-label text-[0.5rem] text-ink-faint mt-1.5">Only send {currency} to this address</p>
              </div>

              {/* QR */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-2xl">
                  {getAddress() ? (
                    <QRCode size={188} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} value={getAddress()} viewBox="0 0 188 188" />
                  ) : (
                    <div className="w-[188px] h-[188px] bg-neutral-200 animate-pulse rounded-lg" />
                  )}
                </div>
              </div>

              {/* address */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="mono-label text-[0.5rem] text-ink-faint">Wallet address</span>
                  {copied && <span className="mono-label text-[0.5rem] text-up">Copied!</span>}
                </div>
                <p className="font-mono text-xs break-all text-center text-ink-dim bg-black/30 p-3 rounded-lg border border-white/6 select-all">
                  {getAddress() || 'Loading…'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={copyAddress} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                    {copied ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />} Copy
                  </button>
                  <button onClick={downloadQR} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>

              <p className="mt-5 text-[0.7rem] text-ink-faint text-center leading-relaxed">
                Transactions usually confirm in 10–30 minutes. Always verify the network before sending.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
