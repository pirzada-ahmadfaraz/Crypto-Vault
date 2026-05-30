'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Download, Check, AlertTriangle, Eye, EyeOff, Shield, KeyRound, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { generateWallet, restoreWalletFromMnemonic, encryptWallet, validatePasswordStrength } from '@/lib/crypto'
import { storeEncryptedWallet } from '@/lib/storage'
import { useWalletStore } from '@/store/wallet'

const STEPS = ['Generate', 'Secure', 'Confirm']
const ease = [0.16, 1, 0.3, 1] as const

function StepRail({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mono-label text-[0.55rem] transition-all ${
                done ? 'bg-gold-sheen text-[#1a1408]'
                  : active ? 'border border-gold-400 text-gold-300'
                    : 'border border-white/10 text-ink-faint'
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`mono-label text-[0.55rem] hidden sm:block ${active ? 'text-ink' : 'text-ink-faint'}`}>{label}</span>
            </div>
            {n < STEPS.length && <div className={`w-8 h-px ${done ? 'bg-gold-500' : 'bg-white/10'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function CreateWalletPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmations, setConfirmations] = useState({ writtenDown: false, understood: false })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const setWallet = useWalletStore((s) => s.setWallet)
  const passwordStrength = validatePasswordStrength(password)

  const generateNewWallet = async () => {
    setLoading(true)
    setTimeout(async () => {
      try {
        const wallet = await generateWallet()
        setMnemonic(wallet.mnemonic.split(' '))
      } catch (error) {
        console.error('Failed to generate wallet:', error)
      } finally {
        setLoading(false)
      }
    }, 900)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic.join(' '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadMnemonic = () => {
    const element = document.createElement('a')
    const file = new Blob([mnemonic.join(' ')], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'cryptovault-recovery-phrase.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const nextStep = () => {
    if (currentStep === 1 && mnemonic.length === 0) { generateNewWallet(); return }
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }
  const previousStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  const finishWalletCreation = async () => {
    if (!passwordStrength.isValid || password !== confirmPassword) return
    setLoading(true)
    try {
      const walletData = await restoreWalletFromMnemonic(mnemonic.join(' '))
      if (!walletData) throw new Error('Failed to restore wallet from mnemonic')
      const encryptedWallet = encryptWallet(walletData, password)
      const stored = storeEncryptedWallet(encryptedWallet)
      if (stored) { setWallet(walletData); router.push('/dashboard') }
      else throw new Error('Failed to store wallet')
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStep2Valid = passwordStrength.isValid && password === confirmPassword
  const isStep3Valid = confirmations.writtenDown && confirmations.understood
  const strengthLabel = passwordStrength.score <= 2 ? 'Weak' : passwordStrength.score <= 4 ? 'Medium' : 'Strong'
  const strengthColor = passwordStrength.score <= 2 ? 'bg-down' : passwordStrength.score <= 4 ? 'bg-gold-400' : 'bg-up'
  const strengthText = passwordStrength.score <= 2 ? 'text-down' : passwordStrength.score <= 4 ? 'text-gold-300' : 'text-up'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mono-label text-[0.6rem] text-ink-faint hover:text-ink mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold">Create your <span className="gold-text">vault</span></h1>
          <p className="text-ink-dim mt-2">Three steps to fully self-custodied crypto</p>
        </div>

        <StepRail current={currentStep} />

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-5 h-5 text-gold-300" />
                <h2 className="font-display text-2xl font-bold">Recovery phrase</h2>
              </div>
              <p className="text-sm text-ink-dim mb-6 leading-relaxed">
                These 12 words are your master key. Write them down, store them offline, and never share them with anyone.
              </p>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/6 bg-white/[0.02] p-3.5 animate-pulse"><div className="h-4 bg-white/5 rounded" /></div>
                  ))}
                </div>
              ) : mnemonic.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {mnemonic.map((word, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 flex items-center gap-2 hover:border-gold-500/40 transition-colors"
                    >
                      <span className="font-mono text-[0.6rem] text-ink-faint w-4">{index + 1}</span>
                      <span className="font-mono text-sm font-medium">{word}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 mb-6">
                  <Shield className="w-7 h-7 text-ink-faint mx-auto mb-3" />
                  <p className="text-sm text-ink-dim">Generate a fresh, cryptographically-secure phrase</p>
                </div>
              )}

              {mnemonic.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={copyToClipboard} className="btn-ghost rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
                    {copied ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={downloadMnemonic} className="btn-ghost rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              )}

              <button onClick={nextStep} disabled={loading} className="btn-gold w-full rounded-xl py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? 'Generating…' : mnemonic.length > 0 ? <>Continue <ArrowRight className="w-4 h-4" /></> : 'Generate phrase'}
              </button>
            </motion.div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-gold-300" />
                <h2 className="font-display text-2xl font-bold">Seal it</h2>
              </div>
              <p className="text-sm text-ink-dim mb-6">Choose a strong password to encrypt your vault locally with AES-256.</p>

              <div className="space-y-4">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="field px-4 py-3.5 pr-12" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field px-4 py-3.5" placeholder="Confirm password" />

                {password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full ${strengthColor} rounded-full transition-all duration-300`} style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
                      </div>
                      <span className={`mono-label text-[0.55rem] ${strengthText}`}>{strengthLabel}</span>
                    </div>
                    <p className="text-xs text-ink-faint">{passwordStrength.feedback}</p>
                    {confirmPassword && password !== confirmPassword && <p className="text-xs text-down">Passwords do not match</p>}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={previousStep} className="btn-ghost rounded-xl px-6 py-3.5 font-medium">Back</button>
                <button onClick={nextStep} disabled={!isStep2Valid} className="btn-gold flex-1 rounded-xl py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease }} className="panel rounded-3xl p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-gold-300" />
                <h2 className="font-display text-2xl font-bold">Confirm backup</h2>
              </div>
              <p className="text-sm text-ink-dim mb-6">Confirm you've safely stored your recovery phrase.</p>

              <div className="rounded-2xl border border-down/25 bg-down/[0.07] p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-down mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-down mb-1 text-sm">No recovery, no exceptions</h3>
                  <p className="text-xs text-down/80 leading-relaxed">If you lose your recovery phrase, your funds are gone forever. There is no reset, no support line, no backdoor.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'writtenDown', label: 'I have written down my 12-word recovery phrase and stored it safely offline.' },
                  { key: 'understood', label: 'I understand that losing my phrase means losing access to my wallet forever.' },
                ].map((c) => {
                  const checked = confirmations[c.key as keyof typeof confirmations]
                  return (
                    <label key={c.key} className="flex items-start gap-3 cursor-pointer rounded-2xl border border-white/8 bg-white/[0.015] p-4 hover:border-white/15 transition-colors">
                      <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-gold-sheen' : 'border border-white/20'}`}>
                        {checked && <Check className="w-3.5 h-3.5 text-[#1a1408]" />}
                      </span>
                      <input type="checkbox" checked={checked} onChange={(e) => setConfirmations({ ...confirmations, [c.key]: e.target.checked })} className="sr-only" />
                      <span className="text-sm text-ink-dim">{c.label}</span>
                    </label>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={previousStep} className="btn-ghost rounded-xl px-6 py-3.5 font-medium">Back</button>
                <button onClick={finishWalletCreation} disabled={!isStep3Valid || loading} className="btn-gold flex-1 rounded-xl py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? 'Creating vault…' : <>Open my vault <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
