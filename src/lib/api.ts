
export interface Balance {
  address: string;
  balance: string;
  balanceUSD: string;
  currency: 'BTC' | 'LTC' | 'ETH';
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  currency: 'BTC' | 'LTC' | 'ETH';
  fee: string;
}

export interface PriceData {
  BTC: number;
  LTC: number;
  ETH: number;
}

export async function fetchPrices(): Promise<PriceData> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin,ethereum&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    
    return {
      BTC: data.bitcoin?.usd || 0,
      LTC: data.litecoin?.usd || 0,
      ETH: data.ethereum?.usd || 0,
    };
  } catch (error) {
    console.error('Failed to fetch real prices, using fallback:', error);
    return {
      BTC: 43250.50,
      LTC: 72.30,
      ETH: 2650.80,
    };
  }
}

export async function fetchPricesWithChange(): Promise<{
  BTC: { price: number; change24h: number };
  LTC: { price: number; change24h: number };
  ETH: { price: number; change24h: number };
}> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices with change');
    }

    const data = await response.json();
    
    return {
      BTC: {
        price: data.bitcoin?.usd || 0,
        change24h: data.bitcoin?.usd_24h_change || 0
      },
      LTC: {
        price: data.litecoin?.usd || 0,
        change24h: data.litecoin?.usd_24h_change || 0
      },
      ETH: {
        price: data.ethereum?.usd || 0,
        change24h: data.ethereum?.usd_24h_change || 0
      },
    };
  } catch (error) {
    console.error('Failed to fetch prices with change, using fallback:', error);
    
    return {
      BTC: { price: 43250.50, change24h: 2.5 },
      LTC: { price: 72.30, change24h: -1.2 },
      ETH: { price: 2650.80, change24h: 3.8 },
    };
  }
}

export async function fetchBalance(address: string, currency: 'BTC' | 'LTC' | 'ETH'): Promise<Balance> {
  try {
    let balance = '0';
    
    if (currency === 'BTC') {
      balance = await fetchBitcoinBalance(address);
    } else if (currency === 'LTC') {
      balance = await fetchLitecoinBalance(address);
    } else if (currency === 'ETH') {
      balance = await fetchEthereumBalance(address);
    }
    
    const prices = await fetchPrices();
    const balanceUSD = (parseFloat(balance) * prices[currency]).toFixed(2);
    
    return {
      address,
      balance,
      balanceUSD,
      currency,
    };
  } catch (error) {
    console.error(`Failed to fetch ${currency} balance for ${address}:`, error);
    
    return {
      address,
      balance: '0',
      balanceUSD: '0.00',
      currency,
    };
  }
}

async function fetchBitcoinBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bitcoin API error: ${response.status}`);
    }

    const data = await response.json();
    const balanceInBTC = (data.balance || 0) / 100000000;
    return balanceInBTC.toFixed(8);
  } catch (error) {
    console.error('Failed to fetch Bitcoin balance:', error);
    return '0';
  }
}

async function fetchLitecoinBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/ltc/main/addrs/${address}/balance`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Litecoin API error: ${response.status}`);
    }

    const data = await response.json();
    const balanceInLTC = (data.balance || 0) / 100000000;
    return balanceInLTC.toFixed(8);
  } catch (error) {
    console.error('Failed to fetch Litecoin balance:', error);
    return '0';
  }
}

async function fetchEthereumBalance(address: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
    const apiKeyParam = apiKey ? `&apikey=${apiKey}` : '';
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest${apiKeyParam}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Ethereum API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message || data.result}`);
    }

    const balanceInWei = BigInt(data.result || '0');
    const balanceInETH = Number(balanceInWei) / 1000000000000000000;
    return balanceInETH.toFixed(6);
  } catch (error) {
    console.error('Failed to fetch Ethereum balance:', error);
    return '0';
  }
}

export async function fetchTransactions(address: string, currency: 'BTC' | 'LTC' | 'ETH'): Promise<Transaction[]> {
  try {
    if (currency === 'BTC') {
      return await fetchBitcoinTransactions(address);
    } else if (currency === 'LTC') {
      return await fetchLitecoinTransactions(address);
    } else if (currency === 'ETH') {
      return await fetchEthereumTransactions(address);
    }
    return [];
  } catch (error) {
    console.error(`Failed to fetch ${currency} transactions for ${address}:`, error);
    return [];
  }
}

async function fetchBitcoinTransactions(address: string): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}/full?limit=10`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bitcoin transactions API error: ${response.status}`);
    }

    const data = await response.json();
    const transactions: Transaction[] = [];

    if (data.txs && Array.isArray(data.txs)) {
      for (const tx of data.txs.slice(0, 10)) { // Limit to 10 transactions
        const transaction: Transaction = {
          hash: tx.hash,
          from: tx.inputs?.[0]?.addresses?.[0] || 'Unknown',
          to: tx.outputs?.[0]?.addresses?.[0] || 'Unknown',
          value: ((tx.outputs?.[0]?.value || 0) / 100000000).toFixed(8),
          timestamp: new Date(tx.confirmed || tx.received).getTime(),
          status: tx.confirmed ? 'confirmed' : 'pending',
          currency: 'BTC',
          fee: ((tx.fees || 0) / 100000000).toFixed(8),
        };
        transactions.push(transaction);
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to fetch Bitcoin transactions:', error);
    return [];
  }
}

async function fetchLitecoinTransactions(address: string): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/ltc/main/addrs/${address}/full?limit=10`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Litecoin transactions API error: ${response.status}`);
    }

    const data = await response.json();
    const transactions: Transaction[] = [];

    if (data.txs && Array.isArray(data.txs)) {
      for (const tx of data.txs.slice(0, 10)) { // Limit to 10 transactions
        const transaction: Transaction = {
          hash: tx.hash,
          from: tx.inputs?.[0]?.addresses?.[0] || 'Unknown',
          to: tx.outputs?.[0]?.addresses?.[0] || 'Unknown',
          value: ((tx.outputs?.[0]?.value || 0) / 100000000).toFixed(8),
          timestamp: new Date(tx.confirmed || tx.received).getTime(),
          status: tx.confirmed ? 'confirmed' : 'pending',
          currency: 'LTC',
          fee: ((tx.fees || 0) / 100000000).toFixed(8),
        };
        transactions.push(transaction);
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to fetch Litecoin transactions:', error);
    return [];
  }
}

async function fetchEthereumTransactions(address: string): Promise<Transaction[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
    const apiKeyParam = apiKey ? `&apikey=${apiKey}` : '';
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc${apiKeyParam}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Ethereum transactions API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== '1') {
      throw new Error(`Etherscan transactions API error: ${data.message || data.result}`);
    }

    const transactions: Transaction[] = [];

    if (data.result && Array.isArray(data.result)) {
      for (const tx of data.result.slice(0, 10)) { // Limit to 10 transactions
        const transaction: Transaction = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: (Number(tx.value) / 1000000000000000000).toFixed(6),
          timestamp: Number(tx.timeStamp) * 1000,
          status: tx.isError === '0' ? 'confirmed' : 'failed',
          currency: 'ETH',
          fee: (Number(tx.gasUsed) * Number(tx.gasPrice) / 1000000000000000000).toFixed(6),
        };
        transactions.push(transaction);
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to fetch Ethereum transactions:', error);
    return [];
  }
}

export async function estimateTransactionFee(
  currency: 'BTC' | 'LTC' | 'ETH',
  amount: string,
  priority: 'slow' | 'standard' | 'fast' = 'standard'
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const baseAmount = parseFloat(amount);
  
  // Mock fee estimation
  const feeMultipliers = {
    slow: 1,
    standard: 1.5,
    fast: 2,
  };
  
  const baseFees = {
    BTC: 0.00001,
    LTC: 0.0001,
    ETH: 0.005,
  };
  
  const estimatedFee = baseFees[currency] * feeMultipliers[priority];
  return estimatedFee.toFixed(currency === 'BTC' ? 8 : currency === 'LTC' ? 8 : 6);
}

// Dynamic import for real transaction functionality to avoid SSR issues

// Configuration for real vs simulation mode
const ENABLE_REAL_TRANSACTIONS = process.env.NODE_ENV === 'production' || 
                                 process.env.NEXT_PUBLIC_ENABLE_REAL_TX === 'true';

/**
 * Send transaction - can be real or simulation based on configuration
 * 
 * ⚠️  WARNING: Set NEXT_PUBLIC_ENABLE_REAL_TX=true for real transactions
 * Real transactions move actual cryptocurrency and cannot be reversed!
 */
export async function sendTransaction(
  fromAddress: string,
  toAddress: string,
  amount: string,
  currency: 'BTC' | 'LTC' | 'ETH',
  privateKey: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Check if real transactions are enabled
  if (ENABLE_REAL_TRANSACTIONS) {
    console.log(`🔥 REAL TRANSACTION MODE ENABLED - ${currency}`);
    console.log('⚠️  This will send ACTUAL cryptocurrency!');
    
    // Use simple direct method for LTC
    if (currency === 'LTC') {
      const { sendLitecoinNow } = await import('./simpleLTC');
      const amountInLitoshis = Math.round(parseFloat(amount) * 100000000);
      return await sendLitecoinNow(fromAddress, toAddress, amountInLitoshis, privateKey);
    }
    
    // For BTC and ETH, return error as not implemented
    return { 
      success: false, 
      error: `Real ${currency} transactions not implemented. Only LTC is supported.` 
    };
  }

  // Simulation mode
  console.log(`🚀 Initiating ${currency} transaction simulation...`);
  console.log('⚠️  SIMULATION MODE - Set NEXT_PUBLIC_ENABLE_REAL_TX=true for real transactions');
  console.log('📤 Transaction Details:', {
    from: fromAddress,
    to: toAddress,
    amount: `${amount} ${currency}`,
    timestamp: new Date().toISOString()
  });
  
  console.log('💡 To enable real transactions:');
  console.log('   1. Add NEXT_PUBLIC_ENABLE_REAL_TX=true to your .env file');
  console.log('   2. Ensure you have sufficient balance in your wallet');
  console.log('   3. Double-check recipient addresses');
  console.log('   4. Understand that real transactions cannot be reversed');
  
  // Simulate network delay and processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enhanced validation
  if (!toAddress || !amount || parseFloat(amount) <= 0) {
    return { success: false, error: 'Invalid transaction parameters' };
  }
  
  if (!fromAddress || !privateKey) {
    return { success: false, error: 'Missing wallet credentials' };
  }
  
  // Validate address formats with detailed error messages
  if (currency === 'BTC' && !toAddress.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return { success: false, error: 'Invalid Bitcoin address format. Must start with 1 or 3.' };
  }
  if (currency === 'LTC' && !toAddress.match(/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/)) {
    return { success: false, error: 'Invalid Litecoin address format. Must start with L, M, or 3.' };
  }
  if (currency === 'ETH' && !toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { success: false, error: 'Invalid Ethereum address format. Must start with 0x followed by 40 hex characters.' };
  }
  
  // Simulate amount validation (check for reasonable ranges)
  const amountNum = parseFloat(amount);
  if (currency === 'BTC' && amountNum > 100) {
    return { success: false, error: 'Amount too large for simulation (max 100 BTC)' };
  }
  if (currency === 'LTC' && amountNum > 1000) {
    return { success: false, error: 'Amount too large for simulation (max 1000 LTC)' };
  }
  if (currency === 'ETH' && amountNum > 1000) {
    return { success: false, error: 'Amount too large for simulation (max 1000 ETH)' };
  }
  
  // Generate realistic transaction hash based on currency
  let txHash: string;
  if (currency === 'ETH') {
    txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  } else {
    // BTC and LTC use SHA256 hash format
    txHash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  
  // Simulate network conditions with higher success rate for demo
  const networkConditions = Math.random();
  let success = false;
  let errorMessage = '';
  
  if (networkConditions < 0.92) { // Increased success rate from 85% to 92%
    success = true;
  } else if (networkConditions < 0.97) {
    success = false;
    errorMessage = `${currency} network congestion - please try again later`;
  } else {
    success = false;
    errorMessage = `Transaction rejected - insufficient network fee for current conditions`;
  }
  
  if (success) {
    // Log successful transaction details
    console.log(`✅ ${currency} Transaction Simulation Successful!`);
    console.log('⚠️  REMINDER: This is a SIMULATION - No real funds were moved!');
    console.log('📊 Transaction Summary:', {
      hash: txHash + ' (SIMULATED)',
      from: fromAddress,
      to: toAddress,
      amount: `${amount} ${currency}`,
      network: `${currency} ${currency === 'ETH' ? 'Mainnet' : 'Network'} (SIMULATION)`,
      status: 'Simulation Completed - NOT on real blockchain',
      confirmations: 'N/A - Simulation only',
      timestamp: new Date().toISOString()
    });
    
    console.log('🚫 Real blockchain integration would require:');
    console.log('   1. Server-side API endpoints');
    console.log('   2. UTXO management for BTC/LTC');
    console.log('   3. Gas estimation for ETH');
    console.log('   4. Transaction broadcasting to nodes');
    console.log('   5. Proper error handling & retries');
    
    // Note: These URLs won't work as transactions are simulated
    const explorerUrl = currency === 'BTC' ? `https://blockchair.com/bitcoin/transaction/${txHash}` :
                       currency === 'LTC' ? `https://blockchair.com/litecoin/transaction/${txHash}` :
                       `https://etherscan.io/tx/${txHash}`;
    
    console.log(`🔗 Simulated explorer URL: ${explorerUrl}`);
    console.log(`⚠️  Note: This URL won't work as the transaction is simulated`);
    
    return {
      success: true,
      txHash: txHash,
    };
  } else {
    console.log(`❌ ${currency} Transaction Simulation Failed:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}