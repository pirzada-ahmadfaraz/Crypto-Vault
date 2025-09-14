'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, EyeOff, Download, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { restoreWalletFromMnemonic, encryptWallet } from '@/lib/crypto'
import { storeEncryptedWallet } from '@/lib/storage'
import { useWalletStore } from '@/store/wallet'

export default function RecoverWalletPage() {
  const router = useRouter()
  const { setWallet } = useWalletStore()
  const [step, setStep] = useState(1)
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveredWallet, setRecoveredWallet] = useState<any>(null)

  const validateMnemonic = () => {
    const words = mnemonic.trim().split(/\s+/)
    if (words.length !== 12) {
      setError('Seed phrase must be exactly 12 words')
      return false
    }
    
    if (words.some(word => word.length < 2)) {
      setError('Invalid seed phrase format')
      return false
    }
    
    return true
  }

  const handleRecoverWallet = async () => {
    setError('')
    
    if (!validateMnemonic()) {
      return
    }

    setLoading(true)
    
    try {
      const walletData = await restoreWalletFromMnemonic(mnemonic.trim())
      
      if (!walletData) {
        setError('Invalid seed phrase. Please check your words and try again.')
        setLoading(false)
        return
      }

      setRecoveredWallet(walletData)
      setStep(2)
    } catch (error) {
      console.error('Recovery failed:', error)
      setError('Failed to recover wallet. Please check your seed phrase.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    setError('')
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!recoveredWallet) {
      setError('No wallet to secure')
      return
    }

    setLoading(true)
    
    try {
      const encryptedWallet = encryptWallet(recoveredWallet, password)
      storeEncryptedWallet(encryptedWallet)
      setWallet(recoveredWallet)
      
      setStep(3)
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Failed to secure wallet:', error)
      setError('Failed to secure wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mnemonicWords = mnemonic.trim().split(/\s+/).filter(word => word.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold mb-2"
          >
            Recover Wallet
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400"
          >
            Enter your 12-word seed phrase to recover your wallet
          </motion.p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-8 space-y-6"
          >
            {/* Seed Phrase Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Recovery Phrase</label>
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 text-sm"
                >
                  {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showMnemonic ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                onPaste={(e) => {
                  // Allow pasting and clean up the input
                  setTimeout(() => {
                    const pasted = e.currentTarget.value
                    const cleaned = pasted.trim().replace(/\s+/g, ' ')
                    setMnemonic(cleaned)
                  }, 0)
                }}
                rows={4}
                className={`w-full p-4 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors resize-none font-mono text-sm ${
                  showMnemonic ? '' : 'text-security-disc'
                }`}
                placeholder="Enter your 12-word recovery phrase separated by spaces"
                style={showMnemonic ? {} : { WebkitTextSecurity: 'disc' } as any}
              />
              
              {mnemonicWords.length > 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  Word count: {mnemonicWords.length}/12
                  {mnemonicWords.length === 12 && <span className="text-green-400 ml-2">✓</span>}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium mb-1">Security Notice:</p>
                  <p>
                    Make sure you're on the correct website and in a secure environment. 
                    Never share your seed phrase with anyone.
                  </p>
                </div>
              </div>
            </div>

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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <button className="w-full py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRecoverWallet}
                disabled={loading || mnemonicWords.length !== 12}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Recover Wallet
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-8 space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Wallet Recovered!</h2>
              <p className="text-gray-400 text-sm">Now secure your wallet with a password</p>
            </div>

            {/* Recovered Wallet Info */}
            <div className="bg-dark-bg rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">Recovered Addresses:</h3>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-gray-400">BTC:</span>
                  <div className="text-orange-400 break-all">{recoveredWallet?.addresses.btc}</div>
                </div>
                <div>
                  <span className="text-gray-400">LTC:</span>
                  <div className="text-gray-300 break-all">{recoveredWallet?.addresses.ltc}</div>
                </div>
                <div>
                  <span className="text-gray-400">ETH:</span>
                  <div className="text-blue-400 break-all">{recoveredWallet?.addresses.eth}</div>
                </div>
              </div>
            </div>

            {/* Password Setup */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors pr-12"
                    placeholder="Enter a strong password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSetPassword}
                disabled={loading || !password || !confirmPassword}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Securing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Secure Wallet
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-8 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Recovery Successful!</h2>
              <p className="text-gray-400">
                Your wallet has been recovered and secured. You'll be redirected to your dashboard.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 text-sm">
                ✅ Wallet recovered from seed phrase<br />
                ✅ All addresses and keys restored<br />
                ✅ Wallet encrypted and stored securely
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}