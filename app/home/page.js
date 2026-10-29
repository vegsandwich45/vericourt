'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-court-bg text-court-text py-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-court-gold/10 border border-court-gold/30 rounded-full px-4 py-1">
            <span className="text-xs">⚖️</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-court-gold font-bold">About VeriCourt</span>
          </div>
          <h1 className="font-judicial text-4xl sm:text-5xl">
            <span className="text-court-gold">Veri</span>Court
          </h1>
          <p className="text-base text-court-text-dim max-w-2xl mx-auto leading-relaxed">
            The Immutable Judicial Ledger — Where AI Hallucinations and PDF Forgery Have No Place.
          </p>
        </div>

        {/* What it is */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-3">
          <h2 className="font-judicial text-xl text-court-gold">What is VeriCourt?</h2>
          <p className="text-sm text-court-text-dim leading-relaxed">
            VeriCourt is a decentralized legal verification platform built on Ethereum-compatible blockchain.
            It anchors court judgments as SHA-256 cryptographic hashes immutably on-chain, making document
            forgery and AI-hallucinated citations technically impossible to pass undetected.
          </p>
          <p className="text-sm text-court-text-dim leading-relaxed">
            The platform serves three distinct roles — Judges who seal orders, Advocates who file petitions,
            and Citizens who track their cases in plain language — each with a dedicated, access-controlled workspace.
          </p>
        </div>

        {/* How it works */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <h2 className="font-judicial text-xl text-court-gold">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { num: '01', icon: '📂', title: 'Document Upload', desc: 'Your PDF is loaded in-browser. No bytes leave your device.' },
              { num: '02', icon: '🔐', title: 'SHA-256 Hash', desc: 'A 64-character cryptographic fingerprint is computed locally.' },
              { num: '03', icon: '🌐', title: 'IPFS Reference', desc: 'An optional IPFS CID (via Pinata) is stored alongside the hash.' },
              { num: '04', icon: '⛓️', title: 'On-Chain Seal', desc: 'Only the hash is written to the smart contract — permanently.' },
            ].map((s) => (
              <div key={s.num} className="flex items-start gap-3 p-4 rounded-xl bg-court-bg border border-court-border">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-xs font-mono text-court-gold font-bold">Step {s.num}</div>
                  <div className="font-semibold text-court-text mt-0.5">{s.title}</div>
                  <div className="text-xs text-court-text-dim mt-1 leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three problems solved */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <h2 className="font-judicial text-xl text-court-gold">Three Problems Solved</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: '🤖', title: 'AI Hallucinations', desc: 'LLMs invent fake case citations. VeriCourt checks every citation against the immutable ledger in under 0.2 seconds.' },
              { icon: '📄', title: 'PDF Forgery', desc: 'A single-byte change to any court PDF produces an entirely different SHA-256 hash — instantly detected.' },
              { icon: '🏛️', title: 'Centralised Failure', desc: 'No single server to hack, manipulate, or take offline. Every node holds the same truth.' },
            ].map((p) => (
              <div key={p.title} className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 space-y-2">
                <span className="text-2xl">{p.icon}</span>
                <div className="font-judicial text-base text-red-300">{p.title}</div>
                <p className="text-xs text-court-text-dim leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h2 className="font-judicial text-2xl text-court-text">Ready to Access the System?</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="vc-btn-primary px-8 py-3">
              <span>🏠</span> Select Your Role
            </Link>
            <Link href="/verify" className="vc-btn-outline px-8 py-3">
              <span>🔍</span> Verify a Document
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
