'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JudgeLoginPage() {
  const router = useRouter();
  const [officerId, setOfficerId] = useState('JID-BOM-0842');
  const [courtroom, setCourtroom] = useState('Courtroom #3 (Commercial & Appellate Division)');
  const [tokenSerial, setTokenSerial] = useState('FIPS-140-2-DSC-984102');
  const [tokenPin, setTokenPin] = useState('984102');
  const [dongleInserted, setDongleInserted] = useState(true);
  const [coramType, setCoramType] = useState('SINGLE_JUDGE');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!dongleInserted) {
      setAuthError('FIPS 140-2 Cryptographic Hardware Token is not inserted. Please connect your judicial USB token.');
      return;
    }
    if (!tokenPin || tokenPin.length < 4) {
      setAuthError('Invalid Hardware DSC PIN. Must be at least 4 digits.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'vericourt_judge_session',
          JSON.stringify({
            officerId,
            name: "Hon'ble Justice Vikramaditya Roy",
            court: 'High Court of Bombay',
            courtroom,
            tokenSerial,
            coramType,
            authenticatedAt: new Date().toISOString(),
          })
        );
      }
      setIsAuthenticating(false);
      router.push('/judge');
    }, 1200);
  };

  const handleDemoFill = () => {
    setOfficerId('JID-BOM-0842');
    setCourtroom('Courtroom #3 (Commercial & Appellate Division)');
    setTokenSerial('FIPS-140-2-DSC-984102');
    setTokenPin('984102');
    setDongleInserted(true);
    setCoramType('SINGLE_JUDGE');
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        
        {/* ── Official Crest & Header ─────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-court-gold/15 border border-court-gold/40 rounded-full px-4 py-1 text-court-gold">
            <span className="text-sm">🏛️</span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest">
              BENCH AUTHORITY ACCESS ONLY
            </span>
          </div>

          <h1 className="font-judicial text-2xl sm:text-3xl text-court-gold font-bold">
            Hon&apos;ble Judge&apos;s Chambers
          </h1>
          <p className="text-xs text-court-text-dim">
            FIPS 140-2 Cryptographic Hardware Token Authentication · High Court Judicial Division
          </p>
        </div>

        {/* ── Demo Preset Quick Pill ───────────────────────────────── */}
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full py-2.5 px-4 rounded-xl bg-court-gold/10 border border-court-gold/40 hover:bg-court-gold/20 text-court-gold text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow"
        >
          <span>⚡</span>
          <span>Click to Auto-Fill: Justice Vikramaditya Roy</span>
        </button>

        {/* ── Main Form Card ───────────────────────────────────────── */}
        <div className="vc-card bg-[#0e111a]/95 border-court-gold/40 p-6 space-y-4 shadow-2xl shadow-black/90">
          
          {authError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono animate-slide-up flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            {/* Hardware Token Status Toggle */}
            <div className="p-3 rounded-xl bg-court-bg border border-court-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${dongleInserted ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                <div>
                  <div className="font-bold text-court-text text-[11px]">
                    {dongleInserted ? 'Hardware DSC Dongle: DETECTED' : 'Hardware DSC Dongle: DISCONNECTED'}
                  </div>
                  <div className="text-[10px] text-court-text-dim">
                    {dongleInserted ? 'USB Slot #1 · Token Serial: FIPS-140-2-DSC-984102' : 'Please insert judicial hardware key'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDongleInserted(!dongleInserted)}
                className="text-[10px] text-court-gold underline hover:text-court-gold-lt"
              >
                {dongleInserted ? 'Unplug' : 'Plug In'}
              </button>
            </div>

            {/* Officer ID */}
            <div>
              <label className="vc-label text-[11px]">Judicial Officer Identification (JID)</label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="vc-input text-xs"
                placeholder="e.g. JID-BOM-0842"
                required
              />
            </div>

            {/* Assigned Courtroom */}
            <div>
              <label className="vc-label text-[11px]">Presiding Courtroom / Division</label>
              <select
                value={courtroom}
                onChange={(e) => setCourtroom(e.target.value)}
                className="vc-input text-xs"
              >
                <option value="Courtroom #3 (Commercial & Appellate Division)">
                  Courtroom #3 (Commercial &amp; Appellate Division)
                </option>
                <option value="Courtroom #1 (Chief Justice's Bench)">
                  Courtroom #1 (Chief Justice&apos;s Bench)
                </option>
                <option value="Courtroom #5 (Constitutional & Writ Bench)">
                  Courtroom #5 (Constitutional &amp; Writ Bench)
                </option>
              </select>
            </div>

            {/* Coram Type */}
            <div>
              <label className="vc-label text-[11px]">Coram Jurisdiction Type</label>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCoramType('SINGLE_JUDGE')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    coramType === 'SINGLE_JUDGE'
                      ? 'bg-court-gold text-night-black font-bold border-court-gold'
                      : 'bg-court-bg border-court-border text-court-text-dim hover:text-court-text'
                  }`}
                >
                  Single Judge Bench
                </button>
                <button
                  type="button"
                  onClick={() => setCoramType('DIVISION_BENCH')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    coramType === 'DIVISION_BENCH'
                      ? 'bg-court-gold text-night-black font-bold border-court-gold'
                      : 'bg-court-bg border-court-border text-court-text-dim hover:text-court-text'
                  }`}
                >
                  Division Bench (2 Judges)
                </button>
              </div>
            </div>

            {/* DSC Hardware Security PIN */}
            <div>
              <div className="flex items-center justify-between">
                <label className="vc-label text-[11px]">Hardware Token Security PIN</label>
                <span className="text-[10px] text-court-gold font-bold">FIPS Level 3</span>
              </div>
              <input
                type="password"
                value={tokenPin}
                onChange={(e) => setTokenPin(e.target.value)}
                maxLength={8}
                className="vc-input text-xs tracking-widest text-center font-mono text-court-gold"
                placeholder="••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-court-gold to-court-gold-lt hover:from-court-gold-lt hover:to-court-gold text-night-black font-bold font-mono text-sm transition-all shadow-lg shadow-court-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isAuthenticating ? '⏳' : '🔒'}</span>
              <span>
                {isAuthenticating
                  ? 'Verifying DSC Signature with Sovereign Ledger...'
                  : 'Authenticate & Enter Chambers'}
              </span>
            </button>
          </form>

          {/* Legal Compliance Footnote */}
          <div className="pt-3 border-t border-court-border/60 text-[10px] text-court-text-dim leading-relaxed text-center font-mono">
            Sec. 35 Information Technology Act, 2000 · Digital Signatures anchored to Supreme Court of India National Ledger.
          </div>
        </div>

        {/* ── Switch to Other Role Logins ─────────────────────────── */}
        <div className="flex items-center justify-between text-xs font-mono text-court-text-dim px-2">
          <Link href="/lawyer/login" className="hover:text-blue-400 flex items-center gap-1">
            <span>⚖️</span>
            <span>Advocate Login →</span>
          </Link>
          <Link href="/citizen/login" className="hover:text-emerald-400 flex items-center gap-1">
            <span>👤</span>
            <span>Citizen Portal →</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
