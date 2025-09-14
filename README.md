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

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── create-wallet/     # Wallet creation flow
│   ├── unlock/            # Wallet unlock page
│   ├── dashboard/         # Main wallet dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── WalletCard.tsx     # Individual wallet display
│   ├── TransactionHistory.tsx # Transaction list
│   ├── SendModal.tsx      # Send transaction modal
│   └── ReceiveModal.tsx   # Receive address modal
├── lib/                   # Utility libraries
│   ├── crypto.ts          # Cryptographic operations
│   ├── storage.ts         # Browser storage utilities
│   └── api.ts            # Mock API for blockchain data
└── store/                 # Zustand state management
    └── wallet.ts          # Wallet state store
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cryptovault.git
   cd cryptovault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

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

### Customization
- **Add new cryptocurrencies**: Extend the crypto utilities in `src/lib/crypto.ts`
- **Modify UI theme**: Update TailwindCSS configuration in `tailwind.config.ts`
- **Change animations**: Customize Framer Motion animations in components

### Testing
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📱 Browser Compatibility

- Chrome 90+ ✅
- Firefox 90+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is educational software. Use at your own risk. The developers are not responsible for any loss of funds. Always test with small amounts first and ensure you understand the risks involved with cryptocurrency transactions.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for beautiful icons
- The open-source cryptocurrency community

---

**Built with ❤️ by the CryptoVault team**