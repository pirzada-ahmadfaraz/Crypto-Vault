'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertTriangle, Info, ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react'
import { estimateTransactionFee, sendTransaction } from '@/lib/api'
import { useWalletStore } from '@/store/wallet'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCurrency?: 'BTC' | 'LTC' | 'ETH'
}

type FeeSpeed = 'slow' | 'standard' | 'fast'

export default function SendModal({ isOpen, onClose, selectedCurrency = 'BTC' }: SendModalProps) {
  const [currency, setCurrency] = useState<'BTC' | 'LTC' | 'ETH'>(selectedCurrency)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [amountInUSD, setAmountInUSD] = useState(false) // Toggle between crypto and USD
  const [feeSpeed, setFeeSpeed] = useState<FeeSpeed>('standard')
  const [estimatedFee, setEstimatedFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { wallet, balances, prices } = useWalletStore()

  useEffect(() => {
    setCurrency(selectedCurrency)
  }, [selectedCurrency])

  useEffect(() => {
    const cryptoAmount = getCryptoAmount()
    if (amount && parseFloat(cryptoAmount) > 0) {
      estimateFee()
    } else {
      setEstimatedFee('')
    }
  }, [amount, currency, feeSpeed, amountInUSD])

  const estimateFee = async () => {
    try {
      setLoading(true)

      if (currency === 'LTC') {
        const prices = await import('@/lib/api').then(m => m.fetchPrices())
        const ltcPrice = prices.LTC
        const feeInLTC = (0.01 / ltcPrice).toFixed(8)
        setEstimatedFee(feeInLTC)
      } else {
        const cryptoAmount = getCryptoAmount()
        const fee = await estimateTransactionFee(currency, cryptoAmount, feeSpeed)
        setEstimatedFee(fee)
      }
    } catch (error) {
      console.error('Failed to estimate fee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!wallet || !recipientAddress || !amount || parseFloat(amount) <= 0) {
      setError('Please fill in all required fields')
      return
    }

    const cryptoAmount = getCryptoAmount()
    const balance = balances[currency]
    if (!balance || parseFloat(cryptoAmount) > parseFloat(balance.balance)) {
      setError('Insufficient balance')
      return
    }

    setSending(true)
    setError('')

    try {
      const fromAddress = wallet.addresses[currency.toLowerCase() as keyof typeof wallet.addresses]
      const privateKey = wallet.privateKeys[currency.toLowerCase() as keyof typeof wallet.privateKeys]

      const result = await sendTransaction(
        fromAddress,
        recipientAddress,
        cryptoAmount,
        currency,
        privateKey
      )

      if (result.success) {
        setSuccess(`✅ Transaction completed!`)
        setTimeout(() => {
          onClose()
          resetForm()
        }, 5000)
      } else {
        setError(result.error || 'Transaction failed')
      }
    } catch (error) {
      setError('Failed to send transaction')
      console.error('Send transaction error:', error)
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setRecipientAddress('')
    setAmount('')
    setAmountInUSD(false)
    setFeeSpeed('standard')
    setEstimatedFee('')
    setError('')
    setSuccess('')
  }

  const calculateTotal = () => {
    const cryptoAmount = getCryptoAmount()
    const amountNum = parseFloat(cryptoAmount) || 0
    const feeNum = parseFloat(estimatedFee) || 0
    return (amountNum + feeNum).toFixed(8)
  }

  const calculateUSDValue = (cryptoAmount: string) => {
    const price = prices?.[currency]
    if (!price || !cryptoAmount) return '$0.00'

    const value = parseFloat(cryptoAmount) * price
    return `$${value.toFixed(2)}`
  }

  const convertUSDToCrypto = (usdAmount: string) => {
    const price = prices?.[currency]
    if (!price || !usdAmount) return '0'

    const cryptoValue = parseFloat(usdAmount) / price
    return cryptoValue.toFixed(currency === 'BTC' ? 8 : currency === 'LTC' ? 8 : 6)
  }

  const convertCryptoToUSD = (cryptoAmount: string) => {
    const price = prices?.[currency]
    if (!price || !cryptoAmount) return '0'

    const usdValue = parseFloat(cryptoAmount) * price
    return usdValue.toFixed(2)
  }

  const getCryptoAmount = () => {
    if (amountInUSD) {
      return convertUSDToCrypto(amount)
    }
    return amount
  }

  const feeSpeedLabels = {
    slow: { label: 'Slow', time: '~60 min', icon: Clock },
    standard: { label: 'Standard', time: '~20 min', icon: TrendingUp },
    fast: { label: 'Fast', time: '~5 min', icon: Zap },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-neon-purple to-neon-pink" />

            <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                    <Send className="w-5 h-5" />
                  </div>
                  Send Assets
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
                    <Send className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Transaction Sent!</h3>
                  <p className="text-gray-400 mb-8">{success}</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Network Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Select Network</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['BTC', 'ETH', 'LTC'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${currency === c
                              ? 'bg-primary-500/20 border-primary-500/50 text-white shadow-glow'
                              : 'bg-charcoal/50 border-white/5 text-gray-500 hover:bg-charcoal hover:text-gray-300'
                            }`}
                        >
                          <span className="font-bold">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Recipient Address</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => {
                        setRecipientAddress(e.target.value)
                        setError('')
                      }}
                      className="w-full p-4 bg-charcoal/50 border border-white/10 rounded-xl focus:border-primary-500/50 focus:bg-charcoal focus:outline-none transition-all font-mono text-sm placeholder:text-gray-600 text-white"
                      placeholder={`Enter ${currency} address`}
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-medium text-gray-400">Amount</label>
                      {balances[currency] && (
                        <span className="text-xs text-primary-400 cursor-pointer hover:underline" onClick={() => {
                          // Logic to set max amount - keeping simple for UI demo
                          setAmount(balances[currency].balance)
                        }}>
                          Max: {balances[currency].balance}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value)
                          setError('')
                        }}
                        className="w-full p-4 bg-charcoal/50 border border-white/10 rounded-xl focus:border-primary-500/50 focus:bg-charcoal focus:outline-none transition-all text-xl font-bold pr-24 placeholder:text-gray-700 text-white"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => setAmountInUSD(!amountInUSD)}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors text-gray-300"
                      >
                        {amountInUSD ? 'USD' : currency}
                      </button>
                    </div>
                    <div className="flex justify-end px-1">
                      <p className="text-xs text-gray-500">
                        ≈ {amountInUSD
                          ? `${convertUSDToCrypto(amount)} ${currency}`
                          : calculateUSDValue(amount)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Fee Selection */}
                  {currency !== 'LTC' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-medium text-gray-400 ml-1">Transaction Speed</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(feeSpeedLabels) as FeeSpeed[]).map((speed) => {
                          const Icon = feeSpeedLabels[speed].icon
                          return (
                            <button
                              key={speed}
                              onClick={() => setFeeSpeed(speed)}
                              className={`p-3 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-1 ${feeSpeed === speed
                                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                                  : 'bg-charcoal/30 border-white/5 hover:bg-charcoal/50 text-gray-500'
                                }`}
                            >
                              <Icon className="w-4 h-4 mb-1" />
                              <span className="text-xs font-semibold">{feeSpeedLabels[speed].label}</span>
                              <span className="text-[10px] opacity-70">{feeSpeedLabels[speed].time}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fee Summary */}
                  {estimatedFee && (
                    <div className="bg-charcoal/40 rounded-xl p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Network Fee</span>
                        <span className="text-gray-300">{estimatedFee} {currency}</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Total</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{calculateTotal()} {currency}</p>
                          <p className="text-xs text-gray-500">≈ {calculateUSDValue(calculateTotal())}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors & Notices */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 font-semibold transition-colors text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSend}
                      disabled={sending || loading || !amount || !recipientAddress}
                      className="flex-[2] py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sending ? 'Processing...' : 'Confirm Transaction'}
                      {!sending && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}