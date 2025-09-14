'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getStoredEncryptedWallet, clearStoredWallet } from '@/lib/storage'
import { decryptWallet } from '@/lib/crypto'
import { useWalletStore } from '@/store/wallet'

export default function UnlockPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasWallet, setHasWallet] = useState(false)
  
  const router = useRouter()
  const setWallet = useWalletStore(state => state.setWallet)
  
  useEffect(() => {
    const encryptedWallet = getStoredEncryptedWallet()
    if (encryptedWallet) {
      setHasWallet(true)
    } else {
      // Redirect to home if no wallet found
      router.push('/')
    }
  }, [router])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const encryptedWallet = getStoredEncryptedWallet()
      if (!encryptedWallet) {
        throw new Error('No wallet found')
      }

      const walletData = decryptWallet(encryptedWallet, password)
      
      if (!walletData) {
        throw new Error('Invalid password')
      }

      setWallet(walletData)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleResetWallet = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your wallet? This action cannot be undone. Make sure you have your recovery phrase backed up.'
    )
    
    if (confirmed) {
      clearStoredWallet()
      router.push('/')
    }
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="w-8 h-8 text-gray-400" />
          </motion.div>
          <p className="text-gray-400">No wallet found. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-primary-400 mb-2">Unlock Wallet</h1>
            <p className="text-gray-400">Enter your password to access your wallet</p>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full p-4 bg-dark-card border border-dark-border rounded-xl focus:border-primary-500 focus:outline-none transition-colors pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Unlock Wallet
                </>
              )}
            </motion.button>
          </form>

          {/* Reset Option */}
          <div className="mt-8 pt-6 border-t border-dark-border">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">
                Forgot your password?
              </p>
              <button
                onClick={handleResetWallet}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Reset Wallet
              </button>
              <p className="text-xs text-gray-500 mt-2">
                You'll need your recovery phrase to restore access
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div>
              <h3 className="font-medium text-blue-400 mb-1">Security Notice</h3>
              <p className="text-sm text-blue-200">
                Your wallet data is encrypted and stored locally in your browser. 
                We never have access to your private keys or funds.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}