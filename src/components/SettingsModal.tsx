'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Download, Trash2, Key, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { clearStoredWallet } from '@/lib/storage'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState('')
  
  const { wallet, clearWallet } = useWalletStore()
  const router = useRouter()

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const downloadBackup = () => {
    if (!wallet) return
    
    const backupData = {
      mnemonic: wallet.mnemonic,
      addresses: wallet.addresses,
      privateKeys: wallet.privateKeys,
      createdAt: new Date().toISOString(),
    }
    
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = `cryptovault-backup-${Date.now()}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDeleteWallet = () => {
    clearStoredWallet()
    clearWallet()
    router.push('/')
  }

  if (!wallet) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-dark-card rounded-2xl p-6 w-full max-w-lg border border-dark-border max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-400" />
                Wallet Settings
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Seed Phrase Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-400" />
                  Recovery Phrase
                </h3>
                
                <div className="bg-dark-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Seed Phrase</span>
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 text-sm"
                    >
                      {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showMnemonic ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  <div className="bg-black/20 rounded p-3 font-mono text-sm">
                    {showMnemonic ? (
                      <div className="grid grid-cols-3 gap-2">
                        {wallet.mnemonic.split(' ').map((word, index) => (
                          <span key={index} className="bg-dark-card px-2 py-1 rounded text-center">
                            {index + 1}. {word}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        Click "Show" to reveal your seed phrase
                      </div>
                    )}
                  </div>
                  
                  {showMnemonic && (
                    <button
                      onClick={() => copyToClipboard(wallet.mnemonic, 'mnemonic')}
                      className="mt-3 w-full py-2 bg-primary-500 hover:bg-primary-600 rounded font-medium transition-colors text-sm"
                    >
                      {copied === 'mnemonic' ? 'Copied!' : 'Copy Seed Phrase'}
                    </button>
                  )}
                </div>
              </div>

              {/* Private Keys Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary-400" />
                  Private Keys
                </h3>
                
                <div className="bg-dark-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Private Keys</span>
                    <button
                      onClick={() => setShowPrivateKeys(!showPrivateKeys)}
                      className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 text-sm"
                    >
                      {showPrivateKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPrivateKeys ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {showPrivateKeys ? (
                    <div className="space-y-3">
                      {Object.entries(wallet.privateKeys).map(([currency, key]) => (
                        <div key={currency} className="bg-black/20 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase">{currency}</span>
                            <button
                              onClick={() => copyToClipboard(key, `${currency}-key`)}
                              className="text-primary-400 hover:text-primary-300 transition-colors text-xs"
                            >
                              {copied === `${currency}-key` ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div className="font-mono text-xs break-all text-gray-300">{key}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      Click "Show" to reveal private keys
                    </div>
                  )}
                </div>
              </div>

              {/* Backup Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary-400" />
                  Backup
                </h3>
                
                <button
                  onClick={downloadBackup}
                  className="w-full py-3 bg-accent-purple hover:bg-accent-purple/80 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Wallet Backup
                </button>
                
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div className="text-xs text-amber-200">
                      <p className="font-medium mb-1">Security Notice:</p>
                      <p>Keep your backup file secure. Anyone with access to this file can control your wallet.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t border-dark-border">
                <h3 className="text-lg font-medium flex items-center gap-2 text-red-400">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-3 border-2 border-red-500 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                  >
                    Delete Wallet
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div className="text-sm text-red-200">
                          <p className="font-medium mb-1">Are you sure?</p>
                          <p>This action cannot be undone. Make sure you have backed up your wallet.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2 border border-gray-600 hover:bg-gray-800 rounded font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteWallet}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded font-medium transition-colors"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}