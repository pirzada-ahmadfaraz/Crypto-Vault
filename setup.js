#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up CryptoVault...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  console.error('Please run: npm install');
  process.exit(1);
}

// Check if all required files exist
const requiredFiles = [
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/lib/crypto.ts',
  'src/lib/storage.ts',
  'src/store/wallet.ts'
];

console.log('\n🔍 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('\n❌ Some required files are missing. Please ensure all files are in place.');
} else {
  console.log('\n✅ All required files are present');
}

// Create .env.local with default values
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# CryptoVault Environment Variables
# Add your API keys here when ready to connect to real blockchain APIs
# NEXT_PUBLIC_BITCOIN_API_KEY=your_bitcoin_api_key
# NEXT_PUBLIC_ETHEREUM_API_KEY=your_ethereum_api_key
# NEXT_PUBLIC_LITECOIN_API_KEY=your_litecoin_api_key
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
}

console.log('\n🎉 Setup complete!');
console.log('\nTo start the development server:');
console.log('  npm run dev');
console.log('\nTo build for production:');
console.log('  npm run build');
console.log('  npm start');
console.log('\n📚 Check README.md for more information');
console.log('\n⚠️  Important Security Notes:');
console.log('  - This is a demo with mock APIs');
console.log('  - Never use real funds without proper testing');
console.log('  - Always backup your seed phrases securely');