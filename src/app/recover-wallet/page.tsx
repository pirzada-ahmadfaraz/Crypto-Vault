'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield, Eye, EyeOff, KeyRound, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { restoreWalletFromMnemonic, encryptWallet } from '@/lib/crypto'
import { storeEncryptedWallet } from '@/lib/storage'
import { useWalletStore } from '@/store/wallet'

const ease = [0.16, 1, 0.3, 1] as const

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
    if (words.length !== 12) { setError('Seed phrase must be exactly 12 words'); return false }
    if (words.some((w) => w.length < 2)) { setError('Invalid seed phrase format'); return false }
    return true
  }

  const handleRecoverWallet = async () => {
    setError('')
    if (!validateMnemonic()) return
    setLoading(true)
    try {
      const walletData = await restoreWalletFromMnemonic(mnemonic.trim())
      if (!walletData) { setError('Invalid seed phrase. Please check your words and try again.'); setLoading(false); return }
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
    if (password.length < 8) { setError('Password must be at least 8 characters long'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!recoveredWallet) { setError('No wallet to secure'); return }
    setLoading(true)
    try {
      const encryptedWallet = encryptWallet(recoveredWallet, password)
      storeEncryptedWallet(encryptedWallet)
      setWallet(recoveredWallet)
      setStep(3)
      setTimeout(() => router.push('/dashboard'), 2600)
    } catch (error) {
      console.error('Failed to secure wallet:', error)
      setError('Failed to secure wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mnemonicWords = mnemonic.trim().split(/\s+/).filter((w) => w.length > 0)

  const addresses = [
    { label: 'BTC', value: recoveredWallet?.addresses.btc, color: 'text-chain-btc' },
    { label: 'ETH', value: recoveredWallet?.addresses.eth, color: 'text-chain-eth' },
    { label: 'LTC', value: recoveredWallet?.addresses.ltc, color: 'text-chain-ltc' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mono-label text-[0.6rem] text-ink-faint hover:text-ink mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gold-sheen flex items-center justify-center mx-auto mb-5 shadow-gold">
            <KeyRound className="w-7 h-7 text-[#1a1408]" />
          </div>
          <h1 className="font-display text-4xl font-bold">Import a <span className="gold-text">vault</span></h1>
          <p className="text-ink-dim mt-2 text-sm">Enter your 12-word seed phrase to restore access</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-7 sm:p-8 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="mono-label text-[0.55rem] text-ink-dim">Recovery phrase</label>
                  <button onClick={() => setShowMnemonic(!showMnemonic)} className="flex items-center gap-1.5 mono-label text-[0.55rem] text-gold-300 hover:text-gold-200 transition-colors">
                    {showMnemonic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showMnemonic ? 'Hide' : 'Show'}
                  </button>
                </div>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  onPaste={(e) => { setTimeout(() => { const cleaned = e.currentTarget.value.trim().replace(/\s+/g, ' '); setMnemonic(cleaned) }, 0) }}
                  rows={4}
                  className="field p-4 resize-none font-mono text-sm"
                  placeholder="word1 word2 word3 …"
                  style={showMnemonic ? {} : ({ WebkitTextSecurity: 'disc' } as any)}
                />
                {mnemonicWords.length > 0 && (
                  <div className="mt-2.5 mono-label text-[0.5rem] text-ink-faint">
                    {mnemonicWords.length}/12 words {mnemonicWords.length === 12 && <span className="text-up ml-1">✓ ready</span>}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] p-4 flex items-start gap-3">
                <Shield className="w-4 h-4 text-gold-300 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gold-200/80 leading-relaxed">Make sure you're on the correct site and in a private environment. Never share your seed phrase with anyone.</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-down/25 bg-down/[0.08] p-3 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-down flex-shrink-0" /> <span className="text-sm text-down">{error}</span>
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                <Link href="/" className="flex-1"><button className="btn-ghost w-full rounded-xl py-3.5 font-medium">Cancel</button></Link>
                <button onClick={handleRecoverWallet} disabled={loading || mnemonicWords.length !== 12} className="btn-gold flex-1 rounded-xl py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (<><div className="w-4 h-4 border-2 border-[#1a1408]/40 border-t-[#1a1408] rounded-full animate-spin" /> Recovering…</>) : (<>Recover <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-7 sm:p-8 space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-full bg-up/15 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-up" />
                </div>
                <h2 className="font-display text-2xl font-bold">Vault found</h2>
                <p className="text-sm text-ink-dim mt-1">Secure it with a new password</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-2.5">
                <h3 className="mono-label text-[0.5rem] text-ink-faint">Recovered addresses</h3>
                {addresses.map((a) => (
                  <div key={a.label}>
                    <span className={`mono-label text-[0.5rem] ${a.color}`}>{a.label}</span>
                    <p className="font-mono text-[0.7rem] break-all text-ink-dim mt-0.5">{a.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="field px-4 py-3.5 pr-12" placeholder="New password" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field px-4 py-3.5" placeholder="Confirm password" />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-down/25 bg-down/[0.08] p-3 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-down flex-shrink-0" /> <span className="text-sm text-down">{error}</span>
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)} className="btn-ghost rounded-xl px-6 py-3.5 font-medium">Back</button>
                <button onClick={handleSetPassword} disabled={loading || !password || !confirmPassword} className="btn-gold flex-1 rounded-xl py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (<><div className="w-4 h-4 border-2 border-[#1a1408]/40 border-t-[#1a1408] rounded-full animate-spin" /> Securing…</>) : (<><Shield className="w-4 h-4" /> Secure vault</>)}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-8 text-center space-y-5">
              <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-up/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-up" />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl font-bold">Recovery complete</h2>
                <p className="text-ink-dim text-sm mt-1">Taking you to your dashboard…</p>
              </div>
              <div className="rounded-2xl border border-up/20 bg-up/[0.06] p-4 text-left space-y-1.5">
                {['Wallet recovered from seed phrase', 'All addresses & keys restored', 'Encrypted and stored securely'].map((t) => (
                  <p key={t} className="text-xs text-up/90 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> {t}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
