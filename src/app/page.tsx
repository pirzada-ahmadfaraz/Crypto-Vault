'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Wallet, ArrowRight, ArrowUpRight, Lock, KeyRound,
  Menu, X, Layers, Fingerprint, TrendingUp, TrendingDown,
} from 'lucide-react'
import { hasStoredWallet } from '@/lib/storage'
import { fetchPricesWithChange } from '@/lib/api'

type Priced = { price: number; change24h: number }

const CHAINS = [
  { sym: 'BTC', name: 'Bitcoin', glyph: '₿', color: 'text-chain-btc', ring: 'ring-chain-btc/40' },
  { sym: 'ETH', name: 'Ethereum', glyph: 'Ξ', color: 'text-chain-eth', ring: 'ring-chain-eth/40' },
  { sym: 'LTC', name: 'Litecoin', glyph: 'Ł', color: 'text-chain-ltc', ring: 'ring-chain-ltc/40' },
] as const

const ease = [0.16, 1, 0.3, 1] as const

export default function HomePage() {
  const [hasWallet, setHasWallet] = useState(false)
  const [prices, setPrices] = useState<{ BTC: Priced; LTC: Priced; ETH: Priced } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setHasWallet(hasStoredWallet())
    fetchPricesWithChange().then(setPrices).catch((e) => console.error('price fetch failed', e))
  }, [])

  const fmtPrice = (n?: number) =>
    n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const features = [
    { icon: KeyRound, kbd: '01', title: 'Non-custodial', body: 'Keys are derived and encrypted in your browser. We never see your seed phrase or funds — ever.' },
    { icon: Layers, kbd: '02', title: 'Multi-chain', body: 'Bitcoin, Ethereum and Litecoin under one precise interface. One seed, three networks.' },
    { icon: Fingerprint, kbd: '03', title: 'AES-256 vault', body: 'Your wallet is sealed with military-grade encryption and stored only on your device.' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* ───────── Nav ───────── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4">
        <div className="max-w-6xl mx-auto panel rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <VaultMark />
            <span className="font-display text-lg font-bold tracking-tight">
              Crypto<span className="gold-text">Vault</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="mono-label text-[0.62rem] text-ink-dim hover:text-ink transition-colors">Features</a>
            <a href="#security" className="mono-label text-[0.62rem] text-ink-dim hover:text-ink transition-colors">Security</a>
            <a href="https://github.com/pirzada-ahmadfaraz/Crypto-Vault" target="_blank" rel="noopener noreferrer" className="mono-label text-[0.62rem] text-ink-dim hover:text-ink transition-colors">GitHub</a>
            <Link href={hasWallet ? '/unlock' : '/create-wallet'}>
              <button className="btn-gold rounded-full px-5 py-2 mono-label text-[0.62rem]">
                {hasWallet ? 'Open Vault' : 'Launch'}
              </button>
            </Link>
          </div>

          <button className="md:hidden text-ink-dim hover:text-ink p-1" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="md:hidden max-w-6xl mx-auto mt-2 panel rounded-2xl p-4 flex flex-col gap-1"
            >
              {[['Features', '#features'], ['Security', '#security'], ['GitHub', 'https://github.com/pirzada-ahmadfaraz/Crypto-Vault']].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className="mono-label text-[0.65rem] text-ink-dim hover:text-ink px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">{label}</a>
              ))}
              <Link href={hasWallet ? '/unlock' : '/create-wallet'} onClick={() => setMenuOpen(false)}>
                <button className="btn-gold w-full rounded-xl px-5 py-3 mono-label text-[0.65rem] mt-1">{hasWallet ? 'Open Vault' : 'Launch'}</button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ───────── Hero ───────── */}
      <main className="flex-1 flex items-center px-4 sm:px-6 pt-36 pb-20">
        <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.06 }}
              className="font-display font-extrabold leading-[0.95] tracking-tight text-5xl sm:text-6xl xl:text-7xl"
            >
              Your keys.
              <br />
              Your coins.
              <br />
              <span className="gold-text">Engineered.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.14 }}
              className="mt-7 max-w-md text-base sm:text-lg text-ink-dim leading-relaxed"
            >
              A non-custodial vault for Bitcoin, Ethereum and Litecoin — sealed with AES-256 and built entirely around one principle: only you hold the key.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.22 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <Link href={hasWallet ? '/unlock' : '/create-wallet'}>
                <button className="btn-gold w-full sm:w-auto rounded-xl px-7 py-4 font-semibold flex items-center justify-center gap-2 group">
                  <Wallet className="w-4 h-4" />
                  {hasWallet ? 'Unlock Vault' : 'Create New Vault'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/recover-wallet">
                <button className="btn-ghost w-full sm:w-auto rounded-xl px-7 py-4 font-semibold flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" /> Import Seed Phrase
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
              className="mt-10 flex items-center gap-8"
            >
              <div>
                <p className="mono-label text-[0.55rem] text-ink-faint mb-2">Networks</p>
                <div className="flex -space-x-2">
                  {CHAINS.map((c) => (
                    <div key={c.sym} className={`w-8 h-8 rounded-full panel flex items-center justify-center ${c.color} font-bold ring-2 ring-obsidian`}>
                      <span className="text-sm">{c.glyph}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="mono-label text-[0.55rem] text-ink-faint mb-2">Encryption</p>
                <div className="flex items-center gap-2 text-gold-300">
                  <Shield className="w-4 h-4" />
                  <span className="font-mono text-sm font-medium">AES-256-GCM</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* instrument visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease, delay: 0.3 }}
            className="relative"
          >
            {/* rotating vault dial behind */}
            <div className="absolute -inset-6 -z-10 flex items-center justify-center opacity-60">
              <VaultDial />
            </div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
              {/* scan line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent animate-[float_7s_ease-in-out_infinite]" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="mono-label text-[0.55rem] text-ink-faint">Live Markets</p>
                  <p className="font-display text-2xl font-bold mt-1">Spot prices</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-up/25 bg-up/10 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-up animate-pulse-soft" />
                  <span className="mono-label text-[0.5rem] text-up">Live</span>
                </span>
              </div>

              <div className="space-y-2">
                {CHAINS.map((c, i) => {
                  const p = prices?.[c.sym]
                  const up = (p?.change24h ?? 0) >= 0
                  return (
                    <motion.div
                      key={c.sym}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12, duration: 0.6, ease }}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.015] px-4 py-3.5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl panel flex items-center justify-center ${c.color} text-lg font-bold`}>{c.glyph}</div>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="mono-label text-[0.5rem] text-ink-faint mt-0.5">{c.sym}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium tabular-nums">${fmtPrice(p?.price)}</p>
                        <p className={`mono-label text-[0.55rem] mt-0.5 flex items-center justify-end gap-1 ${up ? 'text-up' : 'text-down'}`}>
                          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {p ? `${up ? '+' : ''}${p.change24h.toFixed(2)}%` : '—'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] px-4 py-3">
                <span className="mono-label text-[0.55rem] text-gold-200">Sealed · Non-custodial</span>
                <Lock className="w-4 h-4 text-gold-300" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ───────── Live ticker strip ───────── */}
      <div className="border-y border-white/8 overflow-hidden py-3.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {CHAINS.map((c) => {
                const p = prices?.[c.sym]
                const up = (p?.change24h ?? 0) >= 0
                return (
                  <span key={c.sym} className="flex items-center gap-3 px-8">
                    <span className={`${c.color} font-bold`}>{c.glyph}</span>
                    <span className="mono-label text-[0.6rem] text-ink-dim">{c.sym}</span>
                    <span className="font-mono text-sm tabular-nums">${fmtPrice(p?.price)}</span>
                    <span className={`mono-label text-[0.55rem] ${up ? 'text-up' : 'text-down'}`}>{p ? `${up ? '+' : ''}${p.change24h.toFixed(2)}%` : '—'}</span>
                    <span className="text-ink-faint px-2">✦</span>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ───────── Features ───────── */}
      <section id="features" className="py-24 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="max-w-2xl mb-14">
            <p className="mono-label text-[0.6rem] text-gold-300 mb-5">Why CryptoVault</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Built like a vault, <span className="gold-text">not an app.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease }}
                className="panel panel-hover rounded-3xl p-7 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-gold-300 group-hover:border-gold-500/40 transition-colors">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-ink-faint">{f.kbd}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2.5">{f.title}</h3>
                <p className="text-sm text-ink-dim leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Security band ───────── */}
      <section id="security" className="px-4 sm:px-6 pb-28">
        <div className="max-w-6xl mx-auto panel rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gold-500/[0.08] blur-[100px]" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="mono-label text-[0.6rem] text-gold-300 mb-5">The protocol</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
                Three steps to absolute ownership.
              </h2>
              <p className="text-ink-dim leading-relaxed">
                No accounts. No email. No middlemen. Generate a seed, seal it with a password, and you're the only person on earth who can open the vault.
              </p>
              <Link href={hasWallet ? '/unlock' : '/create-wallet'}>
                <button className="btn-gold rounded-xl px-6 py-3.5 mt-8 font-semibold inline-flex items-center gap-2 group">
                  {hasWallet ? 'Open your vault' : 'Generate your seed'}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { n: '01', t: 'Generate', d: '12-word BIP-39 seed created locally in your browser.' },
                { n: '02', t: 'Seal', d: 'Encrypted with your password using AES-256 — stored on-device only.' },
                { n: '03', t: 'Own', d: 'Send, receive and track across three chains. Keys never leave you.' },
              ].map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease }}
                  className="flex gap-4 rounded-2xl border border-white/6 bg-white/[0.015] p-4"
                >
                  <span className="font-display text-2xl font-bold gold-text shrink-0 w-9">{s.n}</span>
                  <div>
                    <h4 className="font-semibold">{s.t}</h4>
                    <p className="text-sm text-ink-dim mt-0.5">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-white/8 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <VaultMark sm />
            <span className="text-sm text-ink-dim">© 2025 Ahmad Faraz — Open source, self-custodial.</span>
          </div>
          <div className="flex gap-8">
            {[['Privacy', '#'], ['Terms', '#'], ['Source', 'https://github.com/pirzada-ahmadfaraz/Crypto-Vault']].map(([l, h]) => (
              <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mono-label text-[0.58rem] text-ink-faint hover:text-gold-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ───────── Brand mark ───────── */
function VaultMark({ sm = false }: { sm?: boolean }) {
  const s = sm ? 'w-7 h-7' : 'w-9 h-9'
  return (
    <span className={`relative ${s} rounded-full bg-gold-sheen flex items-center justify-center shadow-gold`}>
      <span className="absolute inset-[3px] rounded-full border border-[#1a1408]/30" />
      <span className="font-display font-extrabold text-[#1a1408] text-sm leading-none">V</span>
    </span>
  )
}

/* ───────── Decorative vault dial ───────── */
function VaultDial() {
  return (
    <svg viewBox="0 0 400 400" className="w-[34rem] h-[34rem] max-w-none animate-spin-slow text-white/[0.06]">
      <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="currentColor" strokeWidth="1" />
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2
        const r1 = 190, r2 = i % 4 === 0 ? 170 : 180
        return (
          <line
            key={i}
            x1={200 + Math.cos(a) * r1} y1={200 + Math.sin(a) * r1}
            x2={200 + Math.cos(a) * r2} y2={200 + Math.sin(a) * r2}
            stroke="currentColor" strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}
