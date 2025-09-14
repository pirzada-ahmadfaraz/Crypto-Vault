'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  RefreshCw, 
  TrendingUp, 
  Wallet as WalletIcon,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { useWalletStore, useWalletAuth } from '@/store/wallet'
import { fetchBalance, fetchTransactions, fetchPrices } from '@/lib/api'
import { clearStoredWallet } from '@/lib/storage'
import WalletCard from '@/components/WalletCard'
import TransactionHistory from '@/components/TransactionHistory'
import SendModal from '@/components/SendModal'
import ReceiveModal from '@/components/ReceiveModal'
import SettingsModal from '@/components/SettingsModal'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useWalletAuth()
  const [hideBalances, setHideBalances] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'LTC' | 'ETH'>('BTC')
  
  const {
    wallet,
    balances,
    transactions,
    prices,
    loading,
    setBalances,
    setTransactions,
    setPrices,
    setLoading,
    clearWallet,
    getTotalBalanceUSD,
    getAllTransactions,
  } = useWalletStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    if (wallet) {
      loadWalletData()
    }
  }, [isAuthenticated, wallet, router])

  const loadWalletData = async () => {
    if (!wallet) return

    setLoading(true)
    
    try {
      const priceData = await fetchPrices()
      setPrices(priceData)

      const balancePromises = Object.entries(wallet.addresses).map(
        async ([currency, address]) => {
          const balance = await fetchBalance(address, currency.toUpperCase() as 'BTC' | 'LTC' | 'ETH')
          return [currency.toUpperCase(), balance] as const
        }
      )

      const balanceResults = await Promise.all(balancePromises)
      const newBalances = Object.fromEntries(balanceResults)
      setBalances(newBalances)

      const txPromises = Object.entries(wallet.addresses).map(
        async ([currency, address]) => {
          const txs = await fetchTransactions(address, currency.toUpperCase() as 'BTC' | 'LTC' | 'ETH')
          return [currency.toUpperCase(), txs] as const
        }
      )

      const txResults = await Promise.all(txPromises)
      const newTransactions = Object.fromEntries(txResults)
      setTransactions(newTransactions)
    } catch (error) {
      console.error('Failed to load wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearStoredWallet()
    clearWallet()
    router.push('/')
  }

  const handleSend = (currency: 'BTC' | 'LTC' | 'ETH') => {
    setSelectedCurrency(currency)
    setSendModalOpen(true)
  }

  const handleReceive = (currency: 'BTC' | 'LTC' | 'ETH') => {
    setSelectedCurrency(currency)
    setReceiveModalOpen(true)
  }

  const formatBalance = (balance: number) => {
    if (hideBalances) return '****'
    return `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (!isAuthenticated || !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  const totalBalance = getTotalBalanceUSD()
  const allTransactions = getAllTransactions()
  const currencies = ['BTC', 'LTC', 'ETH'] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border backdrop-blur-sm bg-dark-bg/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-400">CryptoVault</h1>
                <p className="text-xs text-gray-400">Multi-Chain Wallet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Refresh Page"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideBalances(!hideBalances)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={hideBalances ? 'Show balances' : 'Hide balances'}
              >
                {hideBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Portfolio Overview</h2>
            <div className="flex items-center space-x-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">+2.34%</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-2">Total Balance</p>
              <p className="text-4xl font-bold text-primary-400 mb-4">
                {formatBalance(totalBalance)}
              </p>
              <p className="text-sm text-gray-400">
                Across {currencies.length} cryptocurrencies
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {currencies.map((currency) => {
                const balance = balances[currency]
                const price = prices?.[currency]
                
                return (
                  <div key={currency} className="text-center p-4 bg-dark-card rounded-lg">
                    <div className="text-2xl mb-2">
                      {currency === 'BTC' ? '₿' : currency === 'ETH' ? 'Ξ' : 'Ł'}
                    </div>
                    <p className="text-xs text-gray-400">{currency}</p>
                    {balance && (
                      <p className="text-sm font-medium">
                        {hideBalances ? '****' : balance.balance}
                      </p>
                    )}
                    {price && (
                      <p className="text-xs text-gray-500">
                        ${price.toLocaleString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Wallet Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Wallets</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {currencies.map((currency, index) => {
              const balance = balances[currency]
              
              if (!balance) {
                return (
                  <div
                    key={currency}
                    className="glass-effect rounded-2xl p-6 animate-pulse"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                      <div>
                        <div className="w-20 h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="w-8 h-3 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="w-32 h-8 bg-gray-600 rounded"></div>
                      <div className="w-24 h-6 bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-600 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-600 rounded"></div>
                      <div className="flex-1 h-8 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                )
              }
              
              return (
                <WalletCard
                  key={currency}
                  balance={balance}
                  onSend={() => handleSend(currency)}
                  onReceive={() => handleReceive(currency)}
                />
              )
            })}
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory
          transactions={allTransactions}
          walletAddresses={wallet.addresses}
        />
      </main>

      {/* Modals */}
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        selectedCurrency={selectedCurrency}
      />
      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        selectedCurrency={selectedCurrency}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  )
}