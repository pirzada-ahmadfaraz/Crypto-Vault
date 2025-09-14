import { create } from 'zustand';
import { WalletData } from '@/lib/crypto';
import { Balance, Transaction, PriceData } from '@/lib/api';

interface WalletState {
  // Wallet data
  wallet: WalletData | null;
  isUnlocked: boolean;
  
  // Balances and transactions
  balances: Record<string, Balance>;
  transactions: Record<string, Transaction[]>;
  prices: PriceData | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setWallet: (wallet: WalletData) => void;
  clearWallet: () => void;
  setUnlocked: (unlocked: boolean) => void;
  setBalances: (balances: Record<string, Balance>) => void;
  setTransactions: (transactions: Record<string, Transaction[]>) => void;
  setPrices: (prices: PriceData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed properties
  getTotalBalanceUSD: () => number;
  getBalance: (currency: 'BTC' | 'LTC' | 'ETH') => Balance | null;
  getTransactions: (currency: 'BTC' | 'LTC' | 'ETH') => Transaction[];
  getAllTransactions: () => Transaction[];
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  wallet: null,
  isUnlocked: false,
  balances: {},
  transactions: {},
  prices: null,
  loading: false,
  error: null,
  
  // Actions
  setWallet: (wallet) => set({ wallet, isUnlocked: true, error: null }),
  
  clearWallet: () => set({
    wallet: null,
    isUnlocked: false,
    balances: {},
    transactions: {},
    prices: null,
    error: null,
  }),
  
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  
  setBalances: (balances) => set({ balances }),
  
  setTransactions: (transactions) => set({ transactions }),
  
  setPrices: (prices) => set({ prices }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  // Computed properties
  getTotalBalanceUSD: () => {
    const { balances } = get();
    return Object.values(balances).reduce((total, balance) => {
      return total + parseFloat(balance.balanceUSD || '0');
    }, 0);
  },
  
  getBalance: (currency) => {
    const { balances } = get();
    return balances[currency] || null;
  },
  
  getTransactions: (currency) => {
    const { transactions } = get();
    return transactions[currency] || [];
  },
  
  getAllTransactions: () => {
    const { transactions } = get();
    const allTransactions = Object.values(transactions).flat();
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  },
}));

// Hook for wallet authentication status
export const useWalletAuth = () => {
  const { wallet, isUnlocked } = useWalletStore();
  return {
    isAuthenticated: wallet !== null && isUnlocked,
    hasWallet: wallet !== null,
  };
};