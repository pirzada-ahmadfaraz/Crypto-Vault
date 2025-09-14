'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertTriangle, Info } from 'lucide-react'
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
        // Fixed fee for LTC: $0.01 worth of LTC
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
        setSuccess(`✅ Transaction completed!... (Check history for full details)`)
        setTimeout(() => {
          onClose()
          resetForm()
        }, 5000) // Increased time to read the message
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
    slow: { label: 'Slow', time: '~30-60 min', multiplier: 1 },
    standard: { label: 'Standard', time: '~10-20 min', multiplier: 1.5 },
    fast: { label: 'Fast', time: '~2-5 min', multiplier: 2 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-dark-card rounded-2xl p-6 w-full max-w-md border border-dark-border max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-400" />
                Send Crypto
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">Transaction Sent!</h3>
                <p className="text-gray-400 text-sm">{success}</p>
              </motion.div>
            ) : (
              /* Main Form */
              <div className="space-y-4">
                {/* Network Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Network</label>
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

                {/* Available Balance */}
                {balances[currency] && (
                  <div className="bg-dark-bg rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Available Balance</span>
                      <div className="text-right">
                        <p className="font-medium">
                          {balances[currency].balance} {currency}
                        </p>
                        <p className="text-xs text-gray-400">
                          {calculateUSDValue(balances[currency].balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value)
                      setError('')
                    }}
                    className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder={`Enter ${currency} address`}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setError('')
                      }}
                      className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors pr-20"
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      onClick={() => setAmountInUSD(!amountInUSD)}
                      className="absolute right-3 top-3 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      {amountInUSD ? 'USD' : currency}
                    </button>
                  </div>
                  {amount && (
                    <p className="text-xs text-gray-400 mt-1">
                      {amountInUSD ? (
                        `≈ ${convertUSDToCrypto(amount)} ${currency}`
                      ) : (
                        `≈ ${calculateUSDValue(amount)}`
                      )}
                    </p>
                  )}
                </div>

                {/* Fee Selection - Only show for BTC and ETH, LTC has fixed fee */}
                {currency !== 'LTC' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction Speed</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(feeSpeedLabels) as FeeSpeed[]).map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setFeeSpeed(speed)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            feeSpeed === speed
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-dark-border hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {feeSpeedLabels[speed].label}
                          </div>
                          <div className="text-xs text-gray-400">
                            {feeSpeedLabels[speed].time}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fixed LTC Fee Notice */}
                {currency === 'LTC' && (
                  <div className="bg-dark-bg rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Network Fee (Fixed)</span>
                      <span className="text-primary-400 font-medium">$0.01</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Litecoin transactions use a fixed fee of $0.01
                    </p>
                  </div>
                )}

                {/* Fee Estimate */}
                {estimatedFee && (
                  <div className="bg-dark-bg rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee:</span>
                      <span>{estimatedFee} {currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Amount:</span>
                      <span className="font-medium">{calculateTotal()} {currency}</span>
                    </div>
                    <div className="border-t border-dark-border pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total (USD):</span>
                        <span className="font-medium text-primary-400">
                          {calculateUSDValue(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                  </motion.div>
                )}

                {/* Transaction Mode Warning */}
                {process.env.NEXT_PUBLIC_ENABLE_REAL_TX === 'true' ? (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-200">
                      <p className="font-bold mb-2">🔥 REAL TRANSACTION MODE ENABLED</p>
                      <p className="mb-2">
                        This will send ACTUAL {currency} to the specified address. 
                        Transactions are irreversible and cannot be undone!
                      </p>
                      <p className="text-xs text-orange-300">
                        Ensure you have sufficient balance and the recipient address is correct.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      <p className="font-bold mb-2">🧪 SIMULATION MODE</p>
                      <p className="mb-2">
                        Currently in demo mode. To enable real transactions, add 
                        <code className="mx-1 px-1 bg-blue-500/20 rounded">NEXT_PUBLIC_ENABLE_REAL_TX=true</code> 
                        to your .env file.
                      </p>
                      <p className="text-xs text-blue-300">
                        Simulation provides safe testing without moving real funds.
                      </p>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div className="text-xs text-amber-200">
                    <p className="font-medium mb-1">Important:</p>
                    <p>
                      Double-check the recipient address format. Real transactions cannot be reversed once confirmed.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    disabled={
                      sending ||
                      loading ||
                      !recipientAddress ||
                      !amount ||
                      parseFloat(getCryptoAmount()) <= 0 ||
                      !estimatedFee
                    }
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Transaction
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}