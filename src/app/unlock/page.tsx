'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getStoredEncryptedWallet, clearStoredWallet } from '@/lib/storage'
import { decryptWallet } from '@/lib/crypto'
import { useWalletStore } from '@/store/wallet'

const ease = [0.16, 1, 0.3, 1] as const

export default function UnlockPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasWallet, setHasWallet] = useState(false)

  const router = useRouter()
  const setWallet = useWalletStore((s) => s.setWallet)

  useEffect(() => {
    const encryptedWallet = getStoredEncryptedWallet()
    if (encryptedWallet) setHasWallet(true)
    else router.push('/')
  }, [router])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const encryptedWallet = getStoredEncryptedWallet()
      if (!encryptedWallet) throw new Error('No wallet found')
      const walletData = decryptWallet(encryptedWallet, password)
      if (!walletData) throw new Error('Invalid password')
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
    if (confirmed) { clearStoredWallet(); router.push('/') }
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-ink-faint" />
          </div>
          <p className="mono-label text-[0.6rem] text-ink-faint">No vault found — redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mono-label text-[0.6rem] text-ink-faint hover:text-ink mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-40 bg-gold-500/[0.1] blur-[80px] pointer-events-none" />

          <div className="relative text-center mb-8">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, ease }} className="w-16 h-16 rounded-2xl bg-gold-sheen flex items-center justify-center mx-auto mb-5 shadow-gold">
              <Lock className="w-7 h-7 text-[#1a1408]" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="text-ink-dim mt-2 text-sm">Enter your password to open the vault</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-5 relative">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="field px-4 py-3.5 pr-12"
                placeholder="Password"
                required
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-down/25 bg-down/[0.08] p-3 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-down flex-shrink-0" />
                <span className="text-sm text-down">{error}</span>
              </motion.div>
            )}

            <button type="submit" disabled={loading || !password.trim()} className="btn-gold w-full rounded-xl py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-[#1a1408]/40 border-t-[#1a1408] rounded-full animate-spin" /> Unlocking…</>
              ) : (
                <>Unlock vault <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/8 text-center">
            <p className="text-xs text-ink-faint mb-2">Forgot your password?</p>
            <button onClick={handleResetWallet} className="mono-label text-[0.55rem] text-down hover:text-down/80 transition-colors">Reset wallet</button>
            <p className="text-[0.65rem] text-ink-faint mt-2">You'll need your recovery phrase to restore access</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-2xl border border-white/8 bg-white/[0.015] p-4 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-gold-300 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-ink-dim leading-relaxed">
            Your vault is encrypted and stored only in this browser. We never have access to your keys or funds.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
