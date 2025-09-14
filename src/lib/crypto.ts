import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { sha256 } from 'js-sha256';
import * as RIPEMD160 from 'ripemd160';

// Dynamic imports for crypto libraries to avoid SSR issues
let bitcoin: any = null;
let ECPair: any = null;

async function initializeCrypto() {
  if (typeof window !== 'undefined' && !bitcoin) {
    bitcoin = await import('bitcoinjs-lib');
    const ECPairFactory = (await import('ecpair')).default;
    const ecc = await import('tiny-secp256k1');
    ECPair = ECPairFactory(ecc);
  }
}
// Simple Base58 encoder implementation
function base58Encode(buffer: Buffer): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = [0];
  
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  
  // Count leading zeros
  let leadingZeros = 0;
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    leadingZeros++;
  }
  
  // Convert digits to string
  let result = '';
  for (let i = 0; i < leadingZeros; i++) {
    result += alphabet[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += alphabet[digits[i]];
  }
  
  return result;
}

export interface WalletData {
  mnemonic: string;
  addresses: {
    btc: string;
    ltc: string;
    eth: string;
  };
  privateKeys: {
    btc: string;
    ltc: string;
    eth: string;
  };
}

export interface EncryptedWallet {
  encryptedData: string;
  salt: string;
}

/**
 * Generate a new wallet with seed phrase and addresses for BTC, LTC, ETH
 */
export async function generateWallet(): Promise<WalletData> {
  // Generate 12-word mnemonic
  const mnemonic = bip39.generateMnemonic(128);

  // Generate ETH wallet
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
  
  // Generate real BTC and LTC addresses from mnemonic using BIP44 derivation
  const btcWallet = await generateBitcoinWallet(mnemonic);
  const ltcWallet = await generateLitecoinWallet(mnemonic);

  return {
    mnemonic,
    addresses: {
      btc: btcWallet.address,
      ltc: ltcWallet.address,
      eth: ethWallet.address,
    },
    privateKeys: {
      btc: btcWallet.privateKey,
      ltc: ltcWallet.privateKey,
      eth: ethWallet.privateKey,
    },
  };
}

/**
 * Generate REAL Bitcoin wallet from mnemonic using proper cryptography
 */
async function generateBitcoinWallet(mnemonic: string): Promise<{ address: string; privateKey: string }> {
  try {
    await initializeCrypto();
    
    // Use ethers.js to derive key from mnemonic with Bitcoin path
    const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", "m/44'/0'/0'/0/0");
    
    // Convert to bitcoinjs-lib format for proper WIF encoding
    const privateKeyBuffer = Buffer.from(hdWallet.privateKey.slice(2), 'hex');
    const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { network: bitcoin.networks.bitcoin });
    
    // Generate Bitcoin address using bitcoinjs-lib
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: Buffer.from(keyPair.publicKey), 
      network: bitcoin.networks.bitcoin 
    });
    
    return {
      address: address!,
      privateKey: keyPair.toWIF() // WIF format for Bitcoin transactions
    };
  } catch (error) {
    console.error('Bitcoin wallet generation failed:', error);
    throw error;
  }
}

/**
 * Generate REAL Litecoin wallet from mnemonic using proper cryptography
 */
async function generateLitecoinWallet(mnemonic: string): Promise<{ address: string; privateKey: string }> {
  try {
    await initializeCrypto();
    
    // Use ethers.js to derive key from mnemonic with Litecoin path
    const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", "m/44'/2'/0'/0/0");
    
    // Litecoin network parameters
    const LITECOIN_NETWORK = {
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bech32: 'ltc',
      bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
      },
      pubKeyHash: 0x30,
      scriptHash: 0x32,
      wif: 0xb0,
    };
    
    // Convert to bitcoinjs-lib format for proper WIF encoding
    const privateKeyBuffer = Buffer.from(hdWallet.privateKey.slice(2), 'hex');
    const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { network: LITECOIN_NETWORK });
    
    // Generate Litecoin address using bitcoinjs-lib
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: Buffer.from(keyPair.publicKey), 
      network: LITECOIN_NETWORK 
    });
    
    return {
      address: address!,
      privateKey: keyPair.toWIF() // WIF format for Litecoin transactions
    };
  } catch (error) {
    console.error('Litecoin wallet generation failed:', error);
    throw error;
  }
}

/**
 * Generate Bitcoin P2PKH address from public key using proper Bitcoin cryptography
 */
function generateBitcoinP2PKHAddress(publicKey: Buffer): string {
  // Step 1: SHA256 hash of public key
  const sha256Hash = Buffer.from(sha256.arrayBuffer(publicKey));
  
  // Step 2: RIPEMD160 hash
  const ripemd160Hash = new RIPEMD160().update(sha256Hash).digest();
  
  // Step 3: Add version byte (0x00 for Bitcoin mainnet P2PKH)
  const versionedPayload = Buffer.concat([Buffer.from([0x00]), ripemd160Hash]);
  
  // Step 4: Double SHA256 for checksum
  const firstHash = Buffer.from(sha256.arrayBuffer(versionedPayload));
  const checksum = Buffer.from(sha256.arrayBuffer(firstHash)).slice(0, 4);
  
  // Step 5: Combine payload and checksum
  const fullAddress = Buffer.concat([versionedPayload, checksum]);
  
  // Step 6: Base58 encode
  return base58Encode(fullAddress);
}

/**
 * Generate Litecoin P2PKH address from public key using proper Litecoin cryptography
 */
function generateLitecoinP2PKHAddress(publicKey: Buffer): string {
  // Step 1: SHA256 hash of public key
  const sha256Hash = Buffer.from(sha256.arrayBuffer(publicKey));
  
  // Step 2: RIPEMD160 hash
  const ripemd160Hash = new RIPEMD160().update(sha256Hash).digest();
  
  // Step 3: Add version byte (0x30 for Litecoin mainnet P2PKH - starts with 'L')
  const versionedPayload = Buffer.concat([Buffer.from([0x30]), ripemd160Hash]);
  
  // Step 4: Double SHA256 for checksum
  const firstHash = Buffer.from(sha256.arrayBuffer(versionedPayload));
  const checksum = Buffer.from(sha256.arrayBuffer(firstHash)).slice(0, 4);
  
  // Step 5: Combine payload and checksum
  const fullAddress = Buffer.concat([versionedPayload, checksum]);
  
  // Step 6: Base58 encode
  return base58Encode(fullAddress);
}

/**
 * Encrypt wallet data with password
 */
export function encryptWallet(walletData: WalletData, password: string): EncryptedWallet {
  const salt = CryptoJS.lib.WordArray.random(128/8).toString();
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(walletData), key.toString()).toString();
  
  return {
    encryptedData: encrypted,
    salt: salt
  };
}

/**
 * Decrypt wallet data with password
 */
export function decryptWallet(encryptedWallet: EncryptedWallet, password: string): WalletData | null {
  try {
    const key = CryptoJS.PBKDF2(password, encryptedWallet.salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedWallet.encryptedData, key.toString());
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedData) {
      return null;
    }
    
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Restore wallet from mnemonic
 */
export async function restoreWalletFromMnemonic(mnemonic: string): Promise<WalletData | null> {
  try {
    if (!bip39.validateMnemonic(mnemonic)) {
      return null;
    }
    
    // Generate ETH wallet
    const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
    
    // Generate real BTC and LTC wallets from mnemonic
    const btcWallet = await generateBitcoinWallet(mnemonic);
    const ltcWallet = await generateLitecoinWallet(mnemonic);

    return {
      mnemonic,
      addresses: {
        btc: btcWallet.address,
        ltc: ltcWallet.address,
        eth: ethWallet.address,
      },
      privateKeys: {
        btc: btcWallet.privateKey,
        ltc: ltcWallet.privateKey,
        eth: ethWallet.privateKey,
      },
    };
  } catch (error) {
    console.error('Failed to restore wallet:', error);
    return null;
  }
}


/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string;
  isValid: boolean;
} {
  let score = 0;
  let feedback = '';
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    feedback = 'Weak password. Add more characters and complexity.';
  } else if (score <= 4) {
    feedback = 'Medium strength. Consider adding special characters.';
  } else {
    feedback = 'Strong password!';
  }
  
  return {
    score,
    feedback,
    isValid: score >= 4 && password.length >= 8,
  };
}