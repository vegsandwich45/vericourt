'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import BlockchainStatus from './BlockchainStatus';

export const JURISDICTIONS = [
  { id: 'sci',    name: 'Supreme Court of India',         code: 'IN-SC',   icon: '🏛️', status: 'Active Node' },
  { id: 'bombay', name: 'High Court of Bombay',           code: 'IN-BOM',  icon: '⚖️', status: 'Active Node' },
  { id: 'delhi',  name: 'High Court of Delhi',            code: 'IN-DEL',  icon: '⚖️', status: 'Active Node' },
  { id: 'nclt',   name: 'National Company Law Tribunal',  code: 'IN-NCLT', icon: '🏢', status: 'Active Node' },
  { id: 'global', name: 'International Commercial Ledger', code: 'INT-ARB', icon: '🌐', status: 'Multi-Sig' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [jurisdictionOpen, setJurisdictionOpen] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(JURISDICTIONS[1]); // Bombay HC default
  const [activeSession, setActiveSession] = useState(null);
  const dropdownRef = useRef(null);

  // Detect current role from pathname or session
  const isJudge = pathname.startsWith('/judge') || ['/faster', '/multisig', '/admin', '/explorer'].includes(pathname);
  const isLawyer = pathname.startsWith('/lawyer') || ['/precedents', '/apostille', '/ipfs'].includes(pathname);
  const isCitizen = pathname.startsWith('/citizen') || ['/translate', '/whatsapp'].includes(pathname);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menus on route change and read active session
  useEffect(() => {
    setMenuOpen(false);
    setJurisdictionOpen(false);

    if (typeof window !== 'undefined') {
      if (isJudge) {
        const raw = localStorage.getItem('vericourt_judge_session');
        if (raw) try { setActiveSession({ role: 'judge', data: JSON.parse(raw) }); } catch {}
      } else if (isLawyer) {
        const raw = localStorage.getItem('vericourt_lawyer_session');
        if (raw) try { setActiveSession({ role: 'lawyer', data: JSON.parse(raw) }); } catch {}
      } else if (isCitizen) {
        const raw = localStorage.getItem('vericourt_citizen_session');
        if (raw) try { setActiveSession({ role: 'citizen', data: JSON.parse(raw) }); } catch {}
      } else {
        setActiveSession(null);
      }
    }
  }, [pathname, isJudge, isLawyer, isCitizen]);

  // Handle outside click for jurisdiction dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setJurisdictionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (role) => {
    if (typeof window !== 'undefined') {
      if (role === 'judge') localStorage.removeItem('vericourt_judge_session');
      if (role === 'lawyer') localStorage.removeItem('vericourt_lawyer_session');
      if (role === 'citizen') localStorage.removeItem('vericourt_citizen_session');
    }
    setActiveSession(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ── Sovereign Top Ribbon ─────────────────────────────────── */}
      <div className="bg-[#0b0c10] border-b border-court-border/60 py-1 px-4 sm:px-6 lg:px-8 text-[11px] flex items-center justify-between font-mono text-court-text-dim">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-court-gold font-semibold tracking-wider">
            <span>🇮🇳</span>
            <span>NATIONAL JUDICIAL EVIDENTIARY LEDGER</span>
          </span>
          <span className="hidden md:inline text-court-border">•</span>
          <span className="hidden md:inline text-court-text-dim/80">
            SEC. 65B IT ACT COMPLIANT · IMMUTABLE EVM AUDIT
          </span>
        </div>

        {/* Jurisdiction dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setJurisdictionOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-court-border bg-court-surface/60 hover:border-court-gold/50 text-court-text hover:text-court-gold transition-colors"
            title="Switch Court Bench / Jurisdiction"
          >
            <span>{selectedJurisdiction.icon}</span>
            <span className="font-semibold text-court-gold-lt">{selectedJurisdiction.name}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-court-gold/10 text-court-gold border border-court-gold/30">
              {selectedJurisdiction.code}
            </span>
            <svg width="12" height="12" className={`w-3 h-3 text-court-text-dim transition-transform ${jurisdictionOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Jurisdiction Dropdown Menu */}
          {jurisdictionOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-[#0f1117] border border-court-gold/30 shadow-2xl shadow-black/80 p-2 z-50 animate-fade-in font-sans">
              <div className="px-2.5 py-1.5 border-b border-court-border/50 mb-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-court-gold font-bold">
                  Select Judicial Bench
                </p>
                <p className="text-[11px] text-court-text-dim mt-0.5">
                  Route cryptographic audit queries across synchronized court registries.
                </p>
              </div>

              <div className="space-y-1">
                {JURISDICTIONS.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setSelectedJurisdiction(j);
                      setJurisdictionOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      selectedJurisdiction.id === j.id
                        ? 'bg-court-gold/15 text-court-gold font-semibold border border-court-gold/40'
                        : 'text-court-text hover:bg-court-surface hover:text-court-gold-lt'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{j.icon}</span>
                      <div>
                        <div className="leading-snug">{j.name}</div>
                        <div className="text-[10px] text-court-text-dim font-mono">{j.code}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-court-green/10 text-court-green border border-court-green/30">
                      {j.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Navbar ─────────────────────────────────────────── */}
      <nav
        className={`border-b border-court-border backdrop-blur-md bg-court-bg/95 transition-shadow duration-300 ${
          scrolled ? 'shadow-xl shadow-black/50' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 font-judicial text-xl text-court-gold hover:text-court-gold-lt transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-court-gold/10 border border-court-gold/30 flex items-center justify-center text-xl group-hover:border-court-gold transition-colors shadow-sm shadow-court-gold/20">
                ⚖️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="tracking-wide font-bold text-lg text-court-text group-hover:text-court-gold transition-colors">VeriCourt</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-court-gold/20 text-court-gold border border-court-gold/40 font-mono font-bold">
                    v2.4 SOVEREIGN
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-widest text-court-text-dim uppercase leading-none">
                  Decentralized Judicial Ledger
                </div>
              </div>
            </Link>

            {/* ── Role-Specific Desktop Navigation ────────────────── */}
            <div className="hidden md:flex items-center gap-1.5">

              {/* 1. NOT LOGGED IN / ON LOGIN PAGE (Clean sovereign header, NO common links) */}
              {!isJudge && !isLawyer && !isCitizen && (
                <div className="flex items-center gap-3 text-xs font-mono text-court-text-dim">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-court-surface border border-court-border">
                    <span className="w-2 h-2 rounded-full bg-court-gold animate-pulse" />
                    <span>Role-Based Authentication Desk</span>
                  </span>
                  <Link
                    href="/"
                    className="px-3 py-1.5 rounded-lg bg-court-gold/10 hover:bg-court-gold/20 text-court-gold border border-court-gold/30 font-bold transition-all"
                  >
                    🔐 Login Portal
                  </Link>
                </div>
              )}

              {/* 2. JUDGE LOGGED IN (ONLY JUDGE TOOLS) */}
              {isJudge && (
                <div className="flex items-center gap-1 font-mono text-xs">
                  <Link
                    href="/judge"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                      pathname === '/judge'
                        ? 'bg-court-gold text-night-black shadow'
                        : 'text-court-text-dim hover:text-court-gold hover:bg-court-surface'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>Bench Dashboard</span>
                  </Link>
                  <Link
                    href="/faster"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/faster'
                        ? 'bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold'
                        : 'text-court-text-dim hover:text-court-gold hover:bg-court-surface'
                    }`}
                  >
                    <span>⚡</span>
                    <span>FASTER Bail</span>
                  </Link>
                  <Link
                    href="/multisig"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/multisig'
                        ? 'bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold'
                        : 'text-court-text-dim hover:text-court-gold hover:bg-court-surface'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>Multi-Sig</span>
                  </Link>
                  <Link
                    href="/admin"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/admin'
                        ? 'bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold'
                        : 'text-court-text-dim hover:text-court-gold hover:bg-court-surface'
                    }`}
                  >
                    <span>📋</span>
                    <span>Chambers DB</span>
                  </Link>
                  <Link
                    href="/explorer"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/explorer'
                        ? 'bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold'
                        : 'text-court-text-dim hover:text-court-gold hover:bg-court-surface'
                    }`}
                  >
                    <span>📜</span>
                    <span>Gazette Audit</span>
                  </Link>

                  <div className="h-4 w-px bg-court-border mx-1" />

                  <button
                    onClick={() => handleLogout('judge')}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    title="Lock Judicial Chambers"
                  >
                    <span>🔒</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* 3. LAWYER LOGGED IN (ONLY LAWYER TOOLS) */}
              {isLawyer && (
                <div className="flex items-center gap-1 font-mono text-xs">
                  <Link
                    href="/lawyer"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                      pathname === '/lawyer'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-court-text-dim hover:text-blue-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>⚖️</span>
                    <span>Counsel Workspace</span>
                  </Link>
                  <Link
                    href="/verify"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/verify'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-court-text-dim hover:text-blue-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Verify Citations</span>
                  </Link>
                  <Link
                    href="/precedents"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/precedents'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-court-text-dim hover:text-blue-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>🕸️</span>
                    <span>Precedent Graph</span>
                  </Link>
                  <Link
                    href="/apostille"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/apostille'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-court-text-dim hover:text-blue-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>🌐</span>
                    <span>e-Apostille</span>
                  </Link>
                  <Link
                    href="/ipfs"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/ipfs'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-court-text-dim hover:text-blue-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>📦</span>
                    <span>IPFS</span>
                  </Link>

                  <div className="h-4 w-px bg-court-border mx-1" />

                  <button
                    onClick={() => handleLogout('lawyer')}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    title="Lock Bar Practice Desk"
                  >
                    <span>🔒</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* 4. CITIZEN LOGGED IN (ONLY CITIZEN TOOLS) */}
              {isCitizen && (
                <div className="flex items-center gap-1 font-mono text-xs">
                  <Link
                    href="/citizen"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                      pathname === '/citizen'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-court-text-dim hover:text-emerald-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>👤</span>
                    <span>Nyaya Seva</span>
                  </Link>
                  <Link
                    href="/whatsapp"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/whatsapp'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-court-text-dim hover:text-emerald-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>📲</span>
                    <span>WhatsApp Bot</span>
                  </Link>
                  <Link
                    href="/translate"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/translate'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-court-text-dim hover:text-emerald-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>🇮🇳</span>
                    <span>Bhashini</span>
                  </Link>
                  <Link
                    href="/verify"
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      pathname === '/verify'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-court-text-dim hover:text-emerald-300 hover:bg-court-surface'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Check Order</span>
                  </Link>

                  <div className="h-4 w-px bg-court-border mx-1" />

                  <button
                    onClick={() => handleLogout('citizen')}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    title="Exit Nyaya Seva Kiosk"
                  >
                    <span>🔒</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}

            </div>

            {/* ── Right side: BlockchainStatus + Mobile hamburger ──── */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <BlockchainStatus />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                className="md:hidden p-2 rounded-md text-court-text-dim hover:text-court-text hover:bg-court-surface transition-colors"
              >
                {menuOpen ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-court-border bg-court-bg/95 px-4 py-3 space-y-2 text-xs font-mono">
            {!isJudge && !isLawyer && !isCitizen && (
              <div className="space-y-2">
                <p className="text-[10px] text-court-gold uppercase font-bold tracking-wider">Select Role to Login:</p>
                <Link href="/?role=judge" className="block p-2 rounded bg-court-surface text-court-gold font-bold">🏛️ Hon&apos;ble Judge Login</Link>
                <Link href="/?role=lawyer" className="block p-2 rounded bg-court-surface text-blue-300 font-bold">⚖️ Advocate &amp; Counsel Login</Link>
                <Link href="/?role=citizen" className="block p-2 rounded bg-court-surface text-emerald-300 font-bold">👤 Citizen Access Kiosk</Link>
              </div>
            )}

            {isJudge && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-court-gold uppercase font-bold tracking-wider">Judicial Bench Workspace:</p>
                <Link href="/judge" className="block p-2 rounded bg-court-surface text-court-gold">🏛️ Bench Dashboard &amp; Cause List</Link>
                <Link href="/faster" className="block p-2 rounded bg-court-surface text-amber-300">⚡ FASTER Bail Protocol</Link>
                <Link href="/multisig" className="block p-2 rounded bg-court-surface text-purple-300">🏛️ Multi-Sig Quorum</Link>
                <Link href="/admin" className="block p-2 rounded bg-court-surface text-court-text">📋 Chambers Registry Database</Link>
                <Link href="/explorer" className="block p-2 rounded bg-court-surface text-court-text">📜 Gazette Audit Explorer</Link>
                <button onClick={() => handleLogout('judge')} className="w-full text-left p-2 rounded bg-red-950/30 text-red-300 border border-red-500/30 font-bold">
                  🔒 Lock Bench &amp; Logout
                </button>
              </div>
            )}

            {isLawyer && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Advocate Workspace:</p>
                <Link href="/lawyer" className="block p-2 rounded bg-court-surface text-blue-300">⚖️ Counsel Desk &amp; E-Filing</Link>
                <Link href="/verify" className="block p-2 rounded bg-court-surface text-court-gold">🛡️ Pre-Screen Citations</Link>
                <Link href="/precedents" className="block p-2 rounded bg-court-surface text-court-text">🕸️ Precedent Lineage Graph</Link>
                <Link href="/apostille" className="block p-2 rounded bg-court-surface text-court-text">🌐 Hague e-Apostille</Link>
                <Link href="/ipfs" className="block p-2 rounded bg-court-surface text-court-text">📦 IPFS Gateway</Link>
                <button onClick={() => handleLogout('lawyer')} className="w-full text-left p-2 rounded bg-red-950/30 text-red-300 border border-red-500/30 font-bold">
                  🔒 Lock Desk &amp; Logout
                </button>
              </div>
            )}

            {isCitizen && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Citizen Nyaya Seva:</p>
                <Link href="/citizen" className="block p-2 rounded bg-court-surface text-emerald-300">👤 Case Status &amp; Voice Sahayak</Link>
                <Link href="/whatsapp" className="block p-2 rounded bg-court-surface text-emerald-400">📲 WhatsApp Bot</Link>
                <Link href="/translate" className="block p-2 rounded bg-court-surface text-court-gold">🇮🇳 Bhashini AI Translation</Link>
                <Link href="/verify" className="block p-2 rounded bg-court-surface text-court-text">🛡️ Verify Order Authenticity</Link>
                <button onClick={() => handleLogout('citizen')} className="w-full text-left p-2 rounded bg-red-950/30 text-red-300 border border-red-500/30 font-bold">
                  🔒 Exit Kiosk &amp; Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
