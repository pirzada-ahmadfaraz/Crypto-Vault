import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Warm obsidian canvas
        void: '#070605',
        obsidian: '#0b0a08',
        panel: '#100e0b',
        'panel-2': '#16130d',

        // Warm ink
        ink: '#f5f1e8',
        'ink-dim': '#a8a097',
        'ink-faint': '#6a645b',

        // Molten gold — the "value" accent
        gold: {
          100: '#f9ecc9',
          200: '#f4dca0',
          300: '#eccb78',
          400: '#e0b455',
          500: '#cf9b35',
          600: '#b27f26',
          700: '#8a611d',
          DEFAULT: '#cf9b35',
        },

        // Per-chain identity (muted to fit the palette)
        chain: {
          btc: '#f7931a',
          eth: '#8a9cf0',
          ltc: '#c2c4cf',
        },

        // Market semantics
        up: '#62c79b',
        down: '#df6f5e',

        // Back-compat aliases (so any stray reference still renders on-theme)
        primary: {
          100: '#f9ecc9',
          200: '#f4dca0',
          300: '#eccb78',
          400: '#e0b455',
          500: '#cf9b35',
          600: '#b27f26',
          700: '#8a611d',
          DEFAULT: '#cf9b35',
        },
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #f4dca0 0%, #cf9b35 45%, #b27f26 100%)',
        'gold-text': 'linear-gradient(180deg, #f9ecc9 0%, #e0b455 60%, #b27f26 100%)',
        'panel-grad': 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0) 100%)',
        'grid-lines':
          'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 30px 60px -32px rgba(0,0,0,0.95)',
        gold: '0 10px 30px -8px rgba(207,155,53,0.45)',
        'gold-lg': '0 16px 50px -10px rgba(207,155,53,0.55)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 7s ease-in-out infinite',
        sheen: 'sheen 6s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
        marquee: 'marquee 38s linear infinite',
        'pulse-soft': 'pulseSoft 3.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        sheen: {
          '0%, 100%': { transform: 'translateX(-120%)' },
          '50%': { transform: 'translateX(120%)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
    },
  },
  plugins: [],
}

export default config
