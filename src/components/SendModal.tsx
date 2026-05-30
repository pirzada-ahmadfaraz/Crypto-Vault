'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ArrowRight, ArrowUpRight, Zap, Clock, Gauge, CheckCircle2 } from 'lucide-react'
import { estimateTransactionFee, sendTransaction } from '@/lib/api'
import { useWalletStore } from '@/store/wallet'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCurrency?: 'BTC' | 'LTC' | 'ETH'
}

type FeeSpeed = 'slow' | 'standard' | 'fast'

const CHAIN_COLOR: Record<string, string> = { BTC: 'text-chain-btc', ETH: 'text-chain-eth', LTC: 'text-chain-ltc' }

export default function SendModal({ isOpen, onClose, selectedCurrency = 'BTC' }: SendModalProps) {
  const [currency, setCurrency] = useState<'BTC' | 'LTC' | 'ETH'>(selectedCurrency)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [amountInUSD, setAmountInUSD] = useState(false)
  const [feeSpeed, setFeeSpeed] = useState<FeeSpeed>('standard')
  const [estimatedFee, setEstimatedFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { wallet, balances, prices } = useWalletStore()

  useEffect(() => { setCurrency(selectedCurrency) }, [selectedCurrency])

  useEffect(() => {
    const cryptoAmount = getCryptoAmount()
    if (amount && parseFloat(cryptoAmount) > 0) estimateFee()
    else setEstimatedFee('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, feeSpeed, amountInUSD])

  const estimateFee = async () => {
    try {
      setLoading(true)
      if (currency === 'LTC') {
        const p = await import('@/lib/api').then((m) => m.fetchPrices())
        const ltcPrice = p.LTC
        setEstimatedFee((0.01 / ltcPrice).toFixed(8))
      } else {
        const fee = await estimateTransactionFee(currency, getCryptoAmount(), feeSpeed)
        setEstimatedFee(fee)
      }
    } catch (error) {
      console.error('Failed to estimate fee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!wallet || !recipientAddress || !amount || parseFloat(amount) <= 0) { setError('Please fill in all required fields'); return }
    const cryptoAmount = getCryptoAmount()
    const balance = balances[currency]
    if (!balance || parseFloat(cryptoAmount) > parseFloat(balance.balance)) { setError('Insufficient balance'); return }
    setSending(true)
    setError('')
    try {
      const fromAddress = wallet.addresses[currency.toLowerCase() as keyof typeof wallet.addresses]
      const privateKey = wallet.privateKeys[currency.toLowerCase() as keyof typeof wallet.privateKeys]
      const result = await sendTransaction(fromAddress, recipientAddress, cryptoAmount, currency, privateKey)
      if (result.success) {
        setSuccess('Your transaction has been broadcast to the network.')
        setTimeout(() => { onClose(); resetForm() }, 5000)
      } else setError(result.error || 'Transaction failed')
    } catch (error) {
      setError('Failed to send transaction')
      console.error('Send transaction error:', error)
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setRecipientAddress(''); setAmount(''); setAmountInUSD(false); setFeeSpeed('standard'); setEstimatedFee(''); setError(''); setSuccess('')
  }

  const calculateTotal = () => {
    const amountNum = parseFloat(getCryptoAmount()) || 0
    const feeNum = parseFloat(estimatedFee) || 0
    return (amountNum + feeNum).toFixed(8)
  }
  const calculateUSDValue = (cryptoAmount: string) => {
    const price = prices?.[currency]
    if (!price || !cryptoAmount) return '$0.00'
    return `$${(parseFloat(cryptoAmount) * price).toFixed(2)}`
  }
  const convertUSDToCrypto = (usdAmount: string) => {
    const price = prices?.[currency]
    if (!price || !usdAmount) return '0'
    return (parseFloat(usdAmount) / price).toFixed(currency === 'ETH' ? 6 : 8)
  }
  const getCryptoAmount = () => (amountInUSD ? convertUSDToCrypto(amount) : amount)

  const feeSpeedLabels = {
    slow: { label: 'Slow', time: '~60 min', icon: Clock },
    standard: { label: 'Standard', time: '~20 min', icon: Gauge },
    fast: { label: 'Fast', time: '~5 min', icon: Zap },
  }

  const networks = ['BTC', 'ETH', 'LTC'] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="frost w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />

            <div className="p-7 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-300"><ArrowUpRight className="w-5 h-5" /></span>
                  Send
                </h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-ink-faint hover:text-ink hover:border-white/20 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-up/15 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-up" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Transaction sent</h3>
                  <p className="text-ink-dim mb-8 text-sm">{success}</p>
                  <button onClick={onClose} className="btn-ghost rounded-xl px-8 py-3 font-semibold">Done</button>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {/* network */}
                  <div className="space-y-2">
                    <label className="mono-label text-[0.55rem] text-ink-faint">Network</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {networks.map((c) => (
                        <button key={c} onClick={() => setCurrency(c)} className={`py-3 rounded-xl border transition-all ${currency === c ? 'border-gold-500/50 bg-gold-500/10 text-ink' : 'border-white/8 bg-white/[0.02] text-ink-faint hover:text-ink-dim'}`}>
                          <span className={`font-bold ${currency === c ? CHAIN_COLOR[c] : ''}`}>{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* recipient */}
                  <div className="space-y-2">
                    <label className="mono-label text-[0.55rem] text-ink-faint">Recipient address</label>
                    <input type="text" value={recipientAddress} onChange={(e) => { setRecipientAddress(e.target.value); setError('') }} className="field px-4 py-3.5 font-mono text-sm" placeholder={`Enter ${currency} address`} />
                  </div>

                  {/* amount */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="mono-label text-[0.55rem] text-ink-faint">Amount</label>
                      {balances[currency] && (
                        <button className="mono-label text-[0.5rem] text-gold-300 hover:text-gold-200 transition-colors" onClick={() => setAmount(balances[currency].balance)}>
                          Max {balances[currency].balance}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError('') }} className="field px-4 py-3.5 pr-20 text-xl font-mono font-medium tabular-nums" placeholder="0.00" />
                      <button type="button" onClick={() => setAmountInUSD(!amountInUSD)} className="absolute right-2 top-2 bottom-2 px-3 rounded-lg border border-white/8 bg-white/[0.03] mono-label text-[0.55rem] text-ink-dim hover:text-ink transition-colors">
                        {amountInUSD ? 'USD' : currency}
                      </button>
                    </div>
                    <p className="text-right text-xs text-ink-faint font-mono">
                      ≈ {amountInUSD ? `${convertUSDToCrypto(amount)} ${currency}` : calculateUSDValue(amount)}
                    </p>
                  </div>

                  {/* fee speed */}
                  {currency !== 'LTC' && (
                    <div className="space-y-2">
                      <label className="mono-label text-[0.55rem] text-ink-faint">Speed</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(Object.keys(feeSpeedLabels) as FeeSpeed[]).map((speed) => {
                          const Icon = feeSpeedLabels[speed].icon
                          const active = feeSpeed === speed
                          return (
                            <button key={speed} onClick={() => setFeeSpeed(speed)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${active ? 'border-gold-500/50 bg-gold-500/10 text-gold-300' : 'border-white/8 bg-white/[0.02] text-ink-faint hover:text-ink-dim'}`}>
                              <Icon className="w-4 h-4" />
                              <span className="mono-label text-[0.5rem]">{feeSpeedLabels[speed].label}</span>
                              <span className="text-[0.6rem] opacity-70">{feeSpeedLabels[speed].time}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* fee summary */}
                  {estimatedFee && (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-faint">Network fee</span>
                        <span className="font-mono text-ink-dim tabular-nums">{estimatedFee} {currency}</span>
                      </div>
                      <div className="border-t border-white/8 pt-2.5 flex justify-between items-center">
                        <span className="text-sm font-medium text-ink-dim">Total</span>
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums">{calculateTotal()} {currency}</p>
                          <p className="text-[0.65rem] text-ink-faint font-mono">≈ {calculateUSDValue(calculateTotal())}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-down/25 bg-down/[0.08] p-3.5 flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-down flex-shrink-0" /> <p className="text-sm text-down">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="btn-ghost flex-1 rounded-xl py-3.5 font-semibold">Cancel</button>
                    <button onClick={handleSend} disabled={sending || loading || !amount || !recipientAddress} className="btn-gold flex-[1.6] rounded-xl py-3.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {sending ? 'Broadcasting…' : <>Confirm send <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
