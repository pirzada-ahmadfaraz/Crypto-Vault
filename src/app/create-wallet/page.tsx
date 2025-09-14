'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Download, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { generateWallet, restoreWalletFromMnemonic, encryptWallet, validatePasswordStrength } from '@/lib/crypto'
import { storeEncryptedWallet } from '@/lib/storage'
import { useWalletStore } from '@/store/wallet'

interface StepProps {
  currentStep: number
  totalSteps: number
}

const StepIndicator = ({ currentStep, totalSteps }: StepProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  isCompleted
                    ? 'bg-primary-500 text-white'
                    : isActive
                    ? 'bg-primary-500 text-white animate-pulse-glow'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              {stepNumber < totalSteps && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-primary-500' : 'bg-gray-700'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CreateWalletPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmations, setConfirmations] = useState({
    writtenDown: false,
    understood: false,
  })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const router = useRouter()
  const setWallet = useWalletStore(state => state.setWallet)
  
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
    }, 1000)
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
    if (currentStep === 1 && mnemonic.length === 0) {
      generateNewWallet()
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const finishWalletCreation = async () => {
    if (!passwordStrength.isValid || password !== confirmPassword) return
    
    setLoading(true)
    
    try {
      // Restore wallet from mnemonic to get all data
      const walletData = await restoreWalletFromMnemonic(mnemonic.join(' '))
      
      if (!walletData) {
        throw new Error('Failed to restore wallet from mnemonic')
      }
      
      // Encrypt and store wallet
      const encryptedWallet = encryptWallet(walletData, password)
      const stored = storeEncryptedWallet(encryptedWallet)
      
      if (stored) {
        setWallet(walletData)
        router.push('/dashboard')
      } else {
        throw new Error('Failed to store wallet')
      }
    } catch (error) {
      console.error('Failed to create wallet:', error)
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const isStep2Valid = passwordStrength.isValid && password === confirmPassword
  const isStep3Valid = confirmations.writtenDown && confirmations.understood

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-primary-400 mb-2">Create New Wallet</h1>
          <p className="text-gray-400">Set up your secure multi-chain wallet</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <AnimatePresence mode="wait">
          {/* Step 1: Generate Seed Phrase */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-effect rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-4">Your Recovery Phrase</h2>
              <p className="text-gray-400 mb-6">
                This 12-word phrase is your master key. Write it down and store it safely offline.
                Never share it with anyone.
              </p>
              
              {loading ? (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-dark-card p-4 rounded-lg border border-dark-border animate-pulse"
                    >
                      <div className="h-4 bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : mnemonic.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {mnemonic.map((word, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-dark-card p-4 rounded-lg border border-dark-border text-center hover:border-primary-500 transition-colors"
                    >
                      <span className="text-xs text-gray-500 block">{index + 1}</span>
                      <span className="font-mono font-medium">{word}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Click the button below to generate your recovery phrase</p>
                </div>
              )}

              {mnemonic.length > 0 && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadMnemonic}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}

              <button
                onClick={nextStep}
                disabled={loading}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
              >
                {loading ? 'Generating...' : mnemonic.length > 0 ? 'Continue' : 'Generate Wallet'}
              </button>
            </motion.div>
          )}

          {/* Step 2: Set Password */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-effect rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-4">Set Password</h2>
              <p className="text-gray-400 mb-6">
                Choose a strong password to encrypt your wallet locally in your browser.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-dark-card border border-dark-border rounded-xl focus:border-primary-500 focus:outline-none transition-colors pr-12"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-dark-card border border-dark-border rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                    placeholder="Confirm password"
                  />
                </div>
                
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score <= 2
                              ? 'bg-red-500'
                              : passwordStrength.score <= 4
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          passwordStrength.score <= 2
                            ? 'text-red-500'
                            : passwordStrength.score <= 4
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}
                      >
                        {passwordStrength.score <= 2 ? 'Weak' : passwordStrength.score <= 4 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{passwordStrength.feedback}</p>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-red-400">Passwords do not match</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={previousStep}
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!isStep2Valid}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm Backup */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-effect rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-4">Confirm Backup</h2>
              <p className="text-gray-400 mb-6">
                Please confirm that you have safely backed up your recovery phrase.
              </p>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-400 mb-1">Important Warning</h3>
                    <p className="text-sm text-amber-200">
                      If you lose your recovery phrase, you will permanently lose access to your wallet and funds. 
                      There is no way to recover them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmations.writtenDown}
                    onChange={(e) =>
                      setConfirmations({ ...confirmations, writtenDown: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-primary-500 rounded border-gray-600 bg-dark-card focus:ring-primary-500"
                  />
                  <span className="text-sm">
                    I have written down my 12-word recovery phrase and stored it in a safe place.
                  </span>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmations.understood}
                    onChange={(e) =>
                      setConfirmations({ ...confirmations, understood: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-primary-500 rounded border-gray-600 bg-dark-card focus:ring-primary-500"
                  />
                  <span className="text-sm">
                    I understand that if I lose my recovery phrase, I will lose access to my wallet forever.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={previousStep}
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={finishWalletCreation}
                  disabled={!isStep3Valid || loading}
                  className="flex-1 py-3 bg-accent-green hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creating Wallet...' : 'Create Wallet'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}