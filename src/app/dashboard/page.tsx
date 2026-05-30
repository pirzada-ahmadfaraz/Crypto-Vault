'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react'
import { useWalletStore, useWalletAuth } from '@/store/wallet'
import { fetchBalance, fetchTransactions, fetchPrices } from '@/lib/api'
import { clearStoredWallet } from '@/lib/storage'
import WalletCard from '@/components/WalletCard'
import TransactionHistory from '@/components/TransactionHistory'
import SendModal from '@/components/SendModal'
import ReceiveModal from '@/components/ReceiveModal'
import SettingsModal from '@/components/SettingsModal'

const CHAIN_META = {
  BTC: { name: 'Bitcoin', glyph: '₿', color: 'text-chain-btc', bar: 'bg-chain-btc' },
  ETH: { name: 'Ethereum', glyph: 'Ξ', color: 'text-chain-eth', bar: 'bg-chain-eth' },
  LTC: { name: 'Litecoin', glyph: 'Ł', color: 'text-chain-ltc', bar: 'bg-chain-ltc' },
} as const

const ease = [0.16, 1, 0.3, 1] as const

/* Count-up number for the total balance readout */
function CountUp({ value, hidden }: { value: number; hidden: boolean }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>()
  const from = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const dur = 900
    const begin = from.current
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(begin + (value - begin) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else from.current = value
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value])

  if (hidden) return <>••••••</>
  return <>{display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useWalletAuth()
  const [hideBalances, setHideBalances] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'LTC' | 'ETH'>('BTC')

  const {
    wallet, balances, prices, loading,
    setBalances, setTransactions, setPrices, setLoading,
    clearWallet, getTotalBalanceUSD, getAllTransactions,
  } = useWalletStore()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return }
    if (wallet) loadWalletData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, wallet, router])

  const loadWalletData = async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const priceData = await fetchPrices()
      setPrices(priceData)

      const balanceResults = await Promise.all(
        Object.entries(wallet.addresses).map(async ([currency, address]) => {
          const balance = await fetchBalance(address, currency.toUpperCase() as 'BTC' | 'LTC' | 'ETH')
          return [currency.toUpperCase(), balance] as const
        })
      )
      setBalances(Object.fromEntries(balanceResults))

      const txResults = await Promise.all(
        Object.entries(wallet.addresses).map(async ([currency, address]) => {
          const txs = await fetchTransactions(address, currency.toUpperCase() as 'BTC' | 'LTC' | 'ETH')
          return [currency.toUpperCase(), txs] as const
        })
      )
      setTransactions(Object.fromEntries(txResults))
    } catch (error) {
      console.error('Failed to load wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { clearStoredWallet(); clearWallet(); router.push('/') }
  const handleSend = (c: 'BTC' | 'LTC' | 'ETH') => { setSelectedCurrency(c); setSendModalOpen(true) }
  const handleReceive = (c: 'BTC' | 'LTC' | 'ETH') => { setSelectedCurrency(c); setReceiveModalOpen(true) }

  if (!isAuthenticated || !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="mono-label text-[0.6rem] text-ink-faint">Opening vault…</p>
        </div>
      </div>
    )
  }

  const totalBalance = getTotalBalanceUSD()
  const allTransactions = getAllTransactions()
  const currencies = ['BTC', 'LTC', 'ETH'] as const

  const allocations = currencies.map((c) => {
    const usd = parseFloat(balances[c]?.balanceUSD || '0')
    return { currency: c, usd, pct: totalBalance > 0 ? (usd / totalBalance) * 100 : 0 }
  })

  const iconBtn = 'w-10 h-10 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-ink-dim hover:text-ink hover:border-white/20 transition-all'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-obsidian/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative w-9 h-9 rounded-full bg-gold-sheen flex items-center justify-center shadow-gold">
              <span className="font-display font-extrabold text-[#1a1408] text-sm leading-none">V</span>
            </span>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">CryptoVault</h1>
              <p className="mono-label text-[0.5rem] text-ink-faint mt-1">Multi-chain wallet</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadWalletData} disabled={loading} className={iconBtn} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-300' : ''}`} />
            </button>
            <button onClick={() => setHideBalances((v) => !v)} className={iconBtn} title={hideBalances ? 'Show balances' : 'Hide balances'}>
              {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button onClick={() => setSettingsModalOpen(true)} className={iconBtn} title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl border border-down/20 bg-down/5 flex items-center justify-center text-down hover:bg-down/10 transition-all" title="Lock & exit">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Portfolio overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
          className="panel rounded-3xl p-7 sm:p-9 mb-6 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-gold-500/[0.08] blur-[90px] pointer-events-none" />
          <div className="relative grid lg:grid-cols-[1fr_1px_1fr] gap-8 items-center">
            <div>
              <p className="mono-label text-[0.55rem] text-ink-faint mb-3">Total Vault Value</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl text-ink-dim">$</span>
                <span className="font-display text-5xl sm:text-6xl font-extrabold gold-text tabular-nums tracking-tight">
                  <CountUp value={totalBalance} hidden={hideBalances} />
                </span>
              </div>
              <p className="text-sm text-ink-faint mt-3">Across {currencies.length} networks · self-custodied</p>

              {/* allocation bar */}
              <div className="mt-6">
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                  {allocations.map((a) => (
                    <motion.div
                      key={a.currency}
                      className={`h-full ${CHAIN_META[a.currency].bar} opacity-80`}
                      initial={{ width: 0 }}
                      animate={{ width: `${a.pct}%` }}
                      transition={{ duration: 1, ease, delay: 0.3 }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {allocations.map((a) => (
                    <span key={a.currency} className="flex items-center gap-1.5 mono-label text-[0.5rem] text-ink-dim">
                      <span className={`h-2 w-2 rounded-full ${CHAIN_META[a.currency].bar}`} />
                      {a.currency} {a.pct.toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block h-full w-px bg-white/8" />

            <div className="grid grid-cols-3 gap-3">
              {currencies.map((currency) => {
                const balance = balances[currency]
                const price = prices?.[currency]
                const m = CHAIN_META[currency]
                return (
                  <div key={currency} className="rounded-2xl border border-white/6 bg-white/[0.015] p-4 text-center">
                    <div className={`text-xl font-bold ${m.color} mb-2`}>{m.glyph}</div>
                    <p className="mono-label text-[0.5rem] text-ink-faint">{currency}</p>
                    <p className="font-mono text-sm font-medium mt-2 tabular-nums truncate">
                      {hideBalances ? '••••' : balance?.balance ?? '0'}
                    </p>
                    {price != null && (
                      <p className="font-mono text-[0.6rem] text-ink-faint mt-1 tabular-nums">${price.toLocaleString()}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Wallets */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold">Your wallets</h2>
            <span className="mono-label text-[0.55rem] text-ink-faint">{currencies.length} networks</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {currencies.map((currency) => {
              const balance = balances[currency]
              if (!balance) {
                return (
                  <div key={currency} className="panel rounded-3xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/5" />
                      <div className="space-y-2">
                        <div className="w-24 h-3.5 bg-white/5 rounded" />
                        <div className="w-10 h-2.5 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="w-32 h-7 bg-white/5 rounded mb-2" />
                    <div className="w-20 h-4 bg-white/5 rounded mb-8" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-11 bg-white/5 rounded-xl" />
                      <div className="h-11 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                )
              }
              return (
                <WalletCard
                  key={currency}
                  balance={balance}
                  hidden={hideBalances}
                  onSend={() => handleSend(currency)}
                  onReceive={() => handleReceive(currency)}
                />
              )
            })}
          </div>
        </div>

        {/* Transactions */}
        <TransactionHistory transactions={allTransactions} walletAddresses={wallet.addresses} />
      </main>

      <SendModal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} selectedCurrency={selectedCurrency} />
      <ReceiveModal isOpen={receiveModalOpen} onClose={() => setReceiveModalOpen(false)} selectedCurrency={selectedCurrency} />
      <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </div>
  )
}
