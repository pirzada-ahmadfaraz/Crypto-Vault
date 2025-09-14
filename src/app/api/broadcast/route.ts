import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to broadcast transactions to blockchain networks
 * This solves CORS issues by handling the broadcast server-side
 */
export async function POST(request: NextRequest) {
  try {
    const { txHex, currency } = await request.json();
    
    if (!txHex || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing txHex or currency' },
        { status: 400 }
      );
    }

    let result;

    if (currency === 'LTC') {
      result = await broadcastLitecoin(txHex);
    } else if (currency === 'BTC') {
      result = await broadcastBitcoin(txHex);
    } else if (currency === 'ETH') {
      result = await broadcastEthereum(txHex);
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported currency' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Broadcast API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function broadcastLitecoin(txHex: string) {
  const broadcastMethods = [
    // Method 1: Try SoChain first (more reliable)
    async () => {
      console.log('Trying SoChain API...');
      const response = await fetch('https://sochain.com/api/v2/send_tx/LTC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hex: txHex }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          return { success: true, txHash: data.data.txid };
        }
        throw new Error(data.message || 'SoChain broadcast failed');
      }
      throw new Error(await response.text());
    },

    // Method 2: Try LiteCore with force flag
    async () => {
      console.log('Trying LiteCore broadcast...');
      const response = await fetch('https://insight.litecore.io/api/tx/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rawtx: txHex,
          allowHighFees: true
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, txHash: data.txid };
      }
      throw new Error(await response.text());
    },

    // Method 3: Try BlockCypher with relaxed validation
    async () => {
      console.log('Trying BlockCypher with relaxed validation...');
      const response = await fetch('https://api.blockcypher.com/v1/ltc/main/txs/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tx: txHex,
          // Try to bypass orphan validation
          confidence: 0.01,
          fee_kb: 100000
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, txHash: data.tx.hash };
      }
      throw new Error(await response.text());
    },

    // Method 4: Raw POST to different endpoint
    async () => {
      console.log('Trying raw broadcast...');
      const response = await fetch('https://chainz.cryptoid.info/ltc/api.dws?q=pushtx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `hex=${txHex}`,
      });
      
      const result = await response.text();
      if (response.ok && !result.includes('error')) {
        return { success: true, txHash: result.trim() };
      }
      throw new Error(result);
    }
  ];

  let lastError = '';
  
  for (const method of broadcastMethods) {
    try {
      const result = await method();
      console.log('✅ Litecoin broadcast successful');
      return result;
    } catch (error: any) {
      console.log('❌ Broadcast method failed:', error.message);
      lastError = error.message;
    }
  }

  return {
    success: false,
    error: `All broadcast methods failed. Last error: ${lastError}`
  };
}

async function broadcastBitcoin(txHex: string) {
  try {
    const response = await fetch('https://api.blockcypher.com/v1/btc/main/txs/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tx: txHex }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, txHash: data.tx.hash };
    }
    
    const error = await response.text();
    return { success: false, error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function broadcastEthereum(txHex: string) {
  try {
    // Ethereum broadcasts would typically use ethers.js provider
    // For now, return an error as this needs more complex setup
    return { 
      success: false, 
      error: 'Ethereum broadcasting not yet implemented in API route' 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}