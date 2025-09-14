import { EncryptedWallet } from './crypto';

const STORAGE_KEY = 'cryptovault_wallet';

/**
 * Store encrypted wallet in localStorage
 */
export function storeEncryptedWallet(encryptedWallet: EncryptedWallet): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedWallet));
    return true;
  } catch (error) {
    console.error('Failed to store wallet:', error);
    return false;
  }
}

/**
 * Retrieve encrypted wallet from localStorage
 */
export function getStoredEncryptedWallet(): EncryptedWallet | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as EncryptedWallet;
  } catch (error) {
    console.error('Failed to retrieve wallet:', error);
    return null;
  }
}

/**
 * Check if wallet exists in storage
 */
export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Clear stored wallet
 */
export function clearStoredWallet(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear wallet:', error);
    return false;
  }
}

/**
 * Store user preferences
 */
interface UserPreferences {
  currency: 'USD' | 'EUR' | 'GBP';
  theme: 'dark' | 'light';
  language: string;
}

const PREFERENCES_KEY = 'cryptovault_preferences';

export function storeUserPreferences(preferences: UserPreferences): boolean {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to store preferences:', error);
    return false;
  }
}

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return { currency: 'USD', theme: 'dark', language: 'en' };
    }
    
    return JSON.parse(stored) as UserPreferences;
  } catch (error) {
    console.error('Failed to retrieve preferences:', error);
    return { currency: 'USD', theme: 'dark', language: 'en' };
  }
}