// About / Architecture page — static server component (no 'use client')
import Link from 'next/link';

export const metadata = {
  title: 'About VeriCourt — Architecture & Technology',
  description: 'Learn how VeriCourt uses blockchain, IPFS, and SHA-256 hashing to solve AI hallucination and PDF forgery in legal documents.',
};

const techStack = [
  { layer: 'Smart Contract',  tech: 'Solidity 0.8.20',     purpose: 'Immutable on-chain judgment registry with access control',    icon: '📝' },
  { layer: 'Local Node',      tech: 'Hardhat 2.22',         purpose: 'EVM-compatible local blockchain for development & testing',    icon: '⛏' },
  { layer: 'Frontend',        tech: 'Next.js 14',           purpose: 'App Router multi-page React application with SSR support',    icon: '⚛' },
  { layer: 'Web3 Provider',   tech: 'ethers.js v6',         purpose: 'Type-safe Ethereum contract interaction and provider bridge', icon: '🔗' },
  { layer: 'Client Hashing',  tech: 'crypto-js SHA-256',    purpose: 'Browser-side document fingerprinting — no file upload',      icon: '🔐' },
  { layer: 'IPFS Storage',    tech: 'Pinata / IPFS',    purpose: 'Decentralized canonical PDF storage via Content Identifier',  icon: '🌐' },
  { layer: 'Styling',         tech: 'Tailwind CSS 3.4',     purpose: 'Utility-first judicial dark theme with custom animations',   icon: '🎨' },
];

const securityProperties = [
  {
    title: 'Client-Side Privacy',
    icon: '🔒',
    desc: 'Raw PDF bytes never leave the user\'s browser. Only the SHA-256 hash is ever transmitted. Zero data leakage risk.',
    color: 'border-blue-500/30 bg-blue-500/5',
  },
  {
    title: 'Immutability',
    icon: '⛓',
    desc: 'Once written to the EVM chain, a judgment record cannot be altered, deleted, or censored by any single party.',
    color: 'border-court-gold/30 bg-court-gold/5',
  },
  {
    title: 'O(1) Verification',
    icon: '⚡',
    desc: 'verifyJudgment() is a pure view function using mapping lookup — constant time regardless of total records.',
    color: 'border-green-500/30 bg-green-500/5',
  },
  {
    title: 'Avalanche Effect',
    icon: '🌊',
    desc: 'A 1-byte change in the PDF produces a completely different 256-bit hash. AI-generated text changes are instantly detected.',
    color: 'border-red-500/30 bg-red-500/5',
  },
  {
    title: 'No Single Point of Failure',
    icon: '🕸',
    desc: 'Smart contract on distributed EVM + IPFS for document storage. No central server to hack, take down, or corrupt.',
    color: 'border-purple-500/30 bg-purple-500/5',
  },
  {
    title: 'Admin Access Control',
    icon: '🛡',
    desc: 'onlyAdmin modifier restricts judgment registration to authorized court registrars only. Owner manages the admin list.',
    color: 'border-amber-500/30 bg-amber-500/5',
  },
];



export default function AboutPage() {
  return (
    <div className="min-h-screen bg-court-bg py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center gap-2 bg-court-surface border border-court-border rounded-full px-4 py-1.5 mb-4">
            <span className="text-court-gold text-xs font-mono tracking-widest">⚖ VERICOURT</span>
          </div>
          <h1 className="font-judicial text-4xl md:text-5xl text-court-gold mb-4">
            About VeriCourt
          </h1>
          <p className="text-court-text-dim text-lg max-w-2xl mx-auto leading-relaxed">
            A decentralized evidentiary ledger that eliminates AI hallucinations, PDF forgery,
            and centralized database failures from the judicial system.
          </p>
        </div>

        {/* ── The Problem ──────────────────────────────────────────── */}
        <section>
          <div className="vc-divider">
            <span className="text-court-gold font-mono text-xs tracking-widest uppercase">The Problem</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'AI Hallucinations',
                impact: 'Critical',
                desc: 'Large language models can generate convincing-sounding but completely fabricated legal precedents, case citations, and even fake court orders that look legitimate to the untrained eye.',
                color: 'border-red-500/30',
              },
              {
                icon: '🖊',
                title: 'PDF Forgery',
                impact: 'High',
                desc: 'Modern PDF editing tools allow bad actors to modify court orders, change party names, alter monetary values, or fabricate entire decrees with minimal forensic traces.',
                color: 'border-orange-500/30',
              },
              {
                icon: '🏢',
                title: 'Centralized Failure',
                impact: 'Systemic',
                desc: 'Official legal databases hosted on centralized servers are vulnerable to unauthorized modification by insiders, DDoS attacks, data corruption, or government censorship.',
                color: 'border-yellow-500/30',
              },
            ].map((p) => (
              <div key={p.title} className={`vc-card border ${p.color}`}>
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-judicial text-court-text text-lg">{p.title}</h3>
                  <span className="text-xs border border-red-500/40 text-red-400 rounded px-2 py-0.5 font-mono">{p.impact}</span>
                </div>
                <p className="text-court-text-dim text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── System Architecture ───────────────────────────────────── */}
        <section>
          <div className="vc-divider">
            <span className="text-court-gold font-mono text-xs tracking-widest uppercase">System Architecture</span>
          </div>

          <div className="vc-card">
            <h2 className="font-judicial text-2xl text-court-gold mb-6 text-center">How VeriCourt Works</h2>

            {/* Architecture flow diagram */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
              {/* Browser */}
              <div className="flex-1 bg-court-bg rounded-xl border border-blue-500/30 p-4 text-center max-w-xs">
                <div className="text-3xl mb-2">🌐</div>
                <p className="font-judicial text-blue-400 text-sm font-semibold mb-1">Browser (Client)</p>
                <p className="text-court-text-dim text-xs">PDF read locally</p>
                <p className="text-court-text-dim text-xs">crypto-js SHA-256</p>
                <p className="text-xs font-mono text-blue-300 mt-2 border border-blue-500/20 rounded px-2 py-0.5">
                  Hash: a3f5c8...e9f2
                </p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mx-2 md:mx-0 rotate-90 md:rotate-0">
                <div className="text-court-gold text-xs font-mono mb-1 hidden md:block">hash only →</div>
                <div className="text-court-gold text-2xl">→</div>
              </div>

              {/* Smart Contract */}
              <div className="flex-1 bg-court-bg rounded-xl border border-court-gold/40 p-4 text-center max-w-xs">
                <div className="text-3xl mb-2">⛓</div>
                <p className="font-judicial text-court-gold text-sm font-semibold mb-1">VeriCourt.sol</p>
                <p className="text-court-text-dim text-xs">EVM Smart Contract</p>
                <p className="text-court-text-dim text-xs">Hardhat / Ethereum</p>
                <p className="text-xs font-mono text-court-gold mt-2 border border-court-gold/20 rounded px-2 py-0.5">
                  mapping(hash → Judgment)
                </p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mx-2 md:mx-0 rotate-90 md:rotate-0">
                <div className="text-court-gold text-xs font-mono mb-1 hidden md:block">CID ref →</div>
                <div className="text-court-gold text-2xl">→</div>
              </div>

              {/* IPFS */}
              <div className="flex-1 bg-court-bg rounded-xl border border-cyan-500/30 p-4 text-center max-w-xs">
                <div className="text-3xl mb-2">🌍</div>
                <p className="font-judicial text-cyan-400 text-sm font-semibold mb-1">IPFS / Pinata</p>
                <p className="text-court-text-dim text-xs">Decentralized Storage</p>
                <p className="text-court-text-dim text-xs">Content Addressable</p>
                <p className="text-xs font-mono text-cyan-300 mt-2 border border-cyan-500/20 rounded px-2 py-0.5">
                  CID: QmPZ9gc...
                </p>
              </div>
            </div>

            {/* Key principle */}
            <div className="mt-6 p-4 bg-court-gold/5 border border-court-gold/20 rounded-xl text-center">
              <p className="text-court-gold font-semibold mb-1">Core Privacy Principle</p>
              <p className="text-court-text-dim text-sm">
                Raw court judgment PDFs are <strong className="text-court-text">never uploaded</strong> to any server, blockchain, or IPFS node by VeriCourt.
                Only the SHA-256 cryptographic fingerprint and IPFS Content Identifier are stored on-chain.
              </p>
            </div>
          </div>
        </section>



        {/* ── Security Properties ───────────────────────────────────── */}
        <section>
          <div className="vc-divider">
            <span className="text-court-gold font-mono text-xs tracking-widest uppercase">Security Properties</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityProperties.map((s) => (
              <div key={s.title} className={`vc-card border ${s.color}`}>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-judicial text-court-text mb-2">{s.title}</h3>
                <p className="text-court-text-dim text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>



        {/* ── Smart Contract Reference ──────────────────────────────── */}
        <section>
          <div className="vc-divider">
            <span className="text-court-gold font-mono text-xs tracking-widest uppercase">Smart Contract Functions</span>
          </div>
          <div className="vc-card overflow-x-auto">
            <table className="w-full text-xs font-mono min-w-[600px]">
              <thead>
                <tr className="border-b border-court-border">
                  <th className="text-left text-court-gold py-3 pr-4">FUNCTION</th>
                  <th className="text-left text-court-gold py-3 pr-4">TYPE</th>
                  <th className="text-left text-court-gold py-3 pr-4">ACCESS</th>
                  <th className="text-left text-court-gold py-3">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['registerJudgment(...)', 'Write', 'Admin', 'Seal a judgment fingerprint on-chain; emits event'],
                  ['verifyJudgment(hash)', 'View', 'Public', 'O(1) hash lookup, zero gas cost'],
                  ['getJudgmentByCase(case)', 'View', 'Public', 'Lookup by docket number'],
                  ['addAdmin(addr)', 'Write', 'Owner', 'Authorize a court registrar'],
                  ['removeAdmin(addr)', 'Write', 'Owner', 'Revoke registrar privileges'],
                  ['deactivateJudgment(hash)', 'Write', 'Admin', 'Expungement override (soft-delete)'],
                  ['totalJudgments()', 'View', 'Public', 'Count of all registered judgments'],
                  ['getContractInfo()', 'View', 'Public', 'Owner, deploy timestamp, total count'],
                ].map(([fn, type, access, desc]) => (
                  <tr key={fn} className="border-b border-court-border/30 hover:bg-court-gold/3">
                    <td className="py-3 pr-4 text-court-gold">{fn}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        type === 'Write'
                          ? 'bg-court-amber/15 text-court-amber border border-court-amber/30'
                          : 'bg-court-green/15 text-court-green border border-court-green/30'
                      }`}>
                        {type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        access === 'Owner' ? 'text-red-400' : access === 'Admin' ? 'text-court-amber' : 'text-court-text-dim'
                      }`}>
                        {access}
                      </span>
                    </td>
                    <td className="py-3 text-court-text-dim">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Project Engineering & Author ──────────────────────────── */}
        <section>
          <div className="vc-divider">
            <span className="text-court-gold font-mono text-xs tracking-widest uppercase">Lead Developer &amp; Project Authority</span>
          </div>
          <div className="vc-card bg-court-gold/5 border-court-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍💻</span>
              <div>
                <h4 className="font-judicial text-lg font-bold text-court-gold">Bhargav Patel</h4>
                <p className="font-mono text-xs text-court-text-dim">
                  Registration Number: <span className="text-court-text font-bold">25BCE1528</span>
                </p>
                <p className="text-[11px] text-court-text-dim mt-0.5">
                  Full-Stack Blockchain Engineering · Smart Contract Architecture · IPFS Decentralized Node Cluster
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-court-gold/20 text-court-gold border border-court-gold/40 text-xs font-mono font-bold">
              Lead Project Developer
            </span>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="text-center pb-10">
          <div className="vc-card text-center">
            <p className="font-judicial text-2xl text-court-gold mb-2">Ready to Try VeriCourt?</p>
            <p className="text-court-text-dim mb-6 text-sm">
              Verify a court judgment or register one on the immutable ledger.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/verify" className="vc-btn-primary">⚖ Verify a Document</Link>
              <Link href="/register" className="vc-btn-outline">📝 Register a Judgment</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
