'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Download, Trash2, Key, Shield, Eye, EyeOff, AlertTriangle, Copy, Check } from 'lucide-react'
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
    const backupData = { mnemonic: wallet.mnemonic, addresses: wallet.addresses, privateKeys: wallet.privateKeys, createdAt: new Date().toISOString() }
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = `cryptovault-backup-${Date.now()}.json`
    document.body.appendChild(element); element.click(); document.body.removeChild(element)
  }

  const handleDeleteWallet = () => { clearStoredWallet(); clearWallet(); router.push('/') }

  if (!wallet) return null

  const sectionHead = 'flex items-center gap-2.5 mb-3'
  const revealBtn = 'flex items-center gap-1.5 mono-label text-[0.55rem] text-gold-300 hover:text-gold-200 transition-colors'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="frost w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />

            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-300"><Settings className="w-5 h-5" /></span>
                  Settings
                </h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-ink-faint hover:text-ink hover:border-white/20 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Recovery phrase */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={sectionHead + ' mb-0'}><Shield className="w-4 h-4 text-gold-300" /><h3 className="font-semibold text-sm">Recovery phrase</h3></div>
                    <button onClick={() => setShowMnemonic(!showMnemonic)} className={revealBtn}>
                      {showMnemonic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showMnemonic ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showMnemonic ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {wallet.mnemonic.split(' ').map((word, index) => (
                          <span key={index} className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 font-mono text-xs">
                            <span className="text-ink-faint mr-1.5">{index + 1}</span>{word}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => copyToClipboard(wallet.mnemonic, 'mnemonic')} className="btn-ghost w-full rounded-xl py-2.5 mt-3 text-sm font-medium flex items-center justify-center gap-2">
                        {copied === 'mnemonic' ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />} {copied === 'mnemonic' ? 'Copied' : 'Copy phrase'}
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-ink-faint text-sm py-4">Tap "Show" to reveal your seed phrase</p>
                  )}
                </div>

                {/* Private keys */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={sectionHead + ' mb-0'}><Key className="w-4 h-4 text-gold-300" /><h3 className="font-semibold text-sm">Private keys</h3></div>
                    <button onClick={() => setShowPrivateKeys(!showPrivateKeys)} className={revealBtn}>
                      {showPrivateKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPrivateKeys ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showPrivateKeys ? (
                    <div className="space-y-2.5">
                      {Object.entries(wallet.privateKeys).map(([currency, key]) => (
                        <div key={currency} className="rounded-lg border border-white/6 bg-black/20 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="mono-label text-[0.5rem] text-ink-faint">{currency}</span>
                            <button onClick={() => copyToClipboard(key, `${currency}-key`)} className="mono-label text-[0.5rem] text-gold-300 hover:text-gold-200 transition-colors">
                              {copied === `${currency}-key` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="font-mono text-[0.65rem] break-all text-ink-dim">{key}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-ink-faint text-sm py-4">Tap "Show" to reveal private keys</p>
                  )}
                </div>

                {/* Backup */}
                <div className="space-y-3">
                  <button onClick={downloadBackup} className="btn-gold w-full rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download wallet backup
                  </button>
                  <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.05] p-3.5 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-gold-300 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gold-200/80 leading-relaxed">Keep your backup file secure. Anyone with this file can control your wallet.</p>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="pt-4 border-t border-white/8">
                  <div className="flex items-center gap-2.5 mb-3 text-down"><Trash2 className="w-4 h-4" /><h3 className="font-semibold text-sm">Danger zone</h3></div>
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-xl border border-down/40 text-down hover:bg-down/10 font-medium transition-colors">
                      Delete wallet
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-down/30 bg-down/[0.08] p-3.5 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-down mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-down/90">This cannot be undone. Make sure your recovery phrase is backed up first.</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1 rounded-xl py-2.5 font-medium">Cancel</button>
                        <button onClick={handleDeleteWallet} className="flex-1 py-2.5 rounded-xl bg-down text-white font-semibold hover:brightness-110 transition-all">Delete forever</button>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={onClose} className="btn-ghost w-full rounded-xl py-3 font-medium">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
