/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills for crypto libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };
    
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Exclude crypto libraries from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bitcoinjs-lib': 'bitcoinjs-lib',
        'ecpair': 'ecpair',
        'tiny-secp256k1': 'tiny-secp256k1',
        '@scure/bip32': '@scure/bip32',
        '@scure/bip39': '@scure/bip39',
      });
    }

    return config;
  },
}

module.exports = nextConfig