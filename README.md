# CryptoVault - Multi-Chain Web Wallet

A secure, non-custodial multi-chain cryptocurrency wallet built with Next.js and TypeScript. Supports Bitcoin (BTC), Litecoin (LTC), and Ethereum (ETH) with military-grade encryption and a modern, dark-themed interface.

## 🚀 Features

### 🔐 Security First
- **Non-custodial**: Your private keys never leave your browser
- **Password-based encryption**: Military-grade AES encryption for local storage
- **Seed phrase generation**: Standard BIP39 12-word mnemonic phrases
- **Client-side only**: No servers, no signups, no data collection

### 💰 Multi-Chain Support
- **Bitcoin (BTC)**: Full support with P2PKH addresses
- **Litecoin (LTC)**: Compatible with Litecoin network
- **Ethereum (ETH)**: Support for ETH transactions
- **Real-time prices**: Live cryptocurrency price data
- **USD conversion**: View balances in USD

### ✨ Modern Interface
- **Dark theme**: Clean, professional dark UI
- **Responsive design**: Works on desktop, tablet, and mobile
- **Smooth animations**: Framer Motion powered interactions
- **Glass morphism**: Modern glassmorphic design elements
- **Neon accents**: Futuristic blue, purple, and green highlights

### 🛠️ Wallet Management
- **Create new wallets**: Generate secure wallets with seed phrases
- **Import existing wallets**: Restore from mnemonic phrases
- **Multiple addresses**: Separate addresses for each cryptocurrency
- **Transaction history**: View detailed transaction records
- **Send & receive**: Full transaction capabilities with fee estimation

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom dark theme
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Crypto Libraries**: 
  - `bip39` for mnemonic generation
  - `bitcoinjs-lib` for Bitcoin operations
  - `ethers` for Ethereum operations
  - `crypto-js` for encryption


## 🎯 Usage

### Creating a New Wallet

1. Click "Create Wallet" on the landing page
2. **Step 1**: Generate and securely store your 12-word recovery phrase
3. **Step 2**: Set a strong password for local encryption
4. **Step 3**: Confirm you've backed up your seed phrase
5. Access your new multi-chain wallet dashboard

### Unlocking Your Wallet

1. Click "Unlock Wallet" on the landing page
2. Enter your password
3. Access your wallet dashboard

### Sending Cryptocurrency

1. From the dashboard, click "Send" on any wallet card
2. Select the cryptocurrency network
3. Enter recipient address and amount
4. Choose transaction speed (affects fees)
5. Review and confirm the transaction

### Receiving Cryptocurrency

1. Click "Receive" on any wallet card
2. Copy your wallet address or save the QR code
3. Share with the sender

## 🔒 Security Notes

### ⚠️ Important Warnings
- **Backup your seed phrase**: Write it down and store it safely offline
- **Never share your seed phrase**: Anyone with it can access your funds
- **Use a strong password**: Your wallet is only as secure as your password
- **Verify addresses**: Double-check recipient addresses before sending

### 🛡️ Security Features
- All cryptographic operations happen client-side
- Private keys are encrypted with PBKDF2 and AES
- No data is sent to external servers
- No tracking, analytics, or data collection

## 🔧 Development

### Mock Data
The application uses mock APIs for demonstration purposes. In a production environment, you would replace these with real blockchain APIs:

- **Balance fetching**: Connect to blockchain explorers (BlockCypher, Alchemy, etc.)
- **Transaction broadcasting**: Use proper RPC endpoints
- **Price data**: Integrate with CoinGecko or CoinMarketCap APIs

---

**Built with ❤️ by Pirzada Ahmad Faraz**

© 2025 Pirzada Ahmad Faraz. All rights reserved.
