'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LawyerLoginPage() {
  const router = useRouter();
  const [barNumber, setBarNumber] = useState('MAH/4921/2014');
  const [stateBar, setStateBar] = useState('Bar Council of Maharashtra & Goa');
  const [chamberAddress, setChamberAddress] = useState('Chamber #412, High Court Annexe, Fort, Mumbai');
  const [passkey, setPasskey] = useState('849201');
  const [domain, setDomain] = useState('Constitutional & Commercial Litigation');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!barNumber.trim() || !barNumber.includes('/')) {
      setErrorMsg('Invalid Bar Council Enrolment format. Must be like STATE/NUM/YEAR (e.g. MAH/4921/2014).');
      return;
    }
    if (!passkey || passkey.length < 4) {
      setErrorMsg('Digital Bar Passkey must be at least 4 digits.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'vericourt_lawyer_session',
          JSON.stringify({
            barNumber,
            name: 'Adv. Meenakshi Sundaram',
            stateBar,
            chamberAddress,
            domain,
            verifiedOnChain: true,
            authenticatedAt: new Date().toISOString(),
          })
        );
      }
      setIsVerifying(false);
      router.push('/lawyer');
    }, 1200);
  };

  const handleDemoFill = () => {
    setBarNumber('MAH/4921/2014');
    setStateBar('Bar Council of Maharashtra & Goa');
    setChamberAddress('Chamber #412, High Court Annexe, Fort, Mumbai');
    setPasskey('849201');
    setDomain('Constitutional & Commercial Litigation');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        
        {/* ── Official Bar Emblem & Header ────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/40 rounded-full px-4 py-1 text-blue-300">
            <span className="text-sm">⚖️</span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest">
              BAR COUNCIL OF INDIA · PRACTITIONER DESK
            </span>
          </div>

          <h1 className="font-judicial text-2xl sm:text-3xl text-blue-300 font-bold">
            Advocate &amp; Legal Counsel Portal
          </h1>
          <p className="text-xs text-court-text-dim">
            Enrolment Verification, Client Brief Portfolio &amp; Secure SHA-256 E-Filing Desk
          </p>
        </div>

        {/* ── Demo Preset Quick Pill ───────────────────────────────── */}
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 border border-blue-500/40 hover:bg-blue-500/20 text-blue-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow"
        >
          <span>⚡</span>
          <span>Click to Auto-Fill: Adv. Meenakshi Sundaram (MAH/4921/2014)</span>
        </button>

        {/* ── Main Form Card ───────────────────────────────────────── */}
        <div className="vc-card bg-[#0e1220]/95 border-blue-500/40 p-6 space-y-4 shadow-2xl shadow-black/90">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono animate-slide-up flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            {/* Active Bar Roll Status */}
            <div className="p-3 rounded-xl bg-court-bg border border-court-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                <div>
                  <div className="font-bold text-court-text text-[11px]">
                    State Bar Roll: ACTIVE PRACTITIONER
                  </div>
                  <div className="text-[10px] text-court-text-dim">
                    Section 30 Advocates Act, 1961 · Right to Practice
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold">
                VERIFIED
              </span>
            </div>

            {/* Bar Council Enrolment Number */}
            <div>
              <label className="vc-label text-[11px]">Bar Council Enrolment Number</label>
              <input
                type="text"
                value={barNumber}
                onChange={(e) => setBarNumber(e.target.value)}
                className="vc-input text-xs"
                placeholder="e.g. MAH/4921/2014 or D/1429/2018"
                required
              />
            </div>

            {/* State Bar Selection */}
            <div>
              <label className="vc-label text-[11px]">Enrolled State Bar Council</label>
              <select
                value={stateBar}
                onChange={(e) => setStateBar(e.target.value)}
                className="vc-input text-xs"
              >
                <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra &amp; Goa</option>
                <option value="Bar Council of Delhi">Bar Council of Delhi</option>
                <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu &amp; Puducherry</option>
                <option value="Bar Council of Karnataka">Bar Council of Karnataka</option>
                <option value="Supreme Court Bar Association (SCBA)">Supreme Court Bar Association (SCBA)</option>
              </select>
            </div>

            {/* Chamber Address */}
            <div>
              <label className="vc-label text-[11px]">Chamber / Practice Annexe Address</label>
              <input
                type="text"
                value={chamberAddress}
                onChange={(e) => setChamberAddress(e.target.value)}
                className="vc-input text-xs"
                placeholder="Chamber No. and High Court Annexe"
                required
              />
            </div>

            {/* Practice Domain */}
            <div>
              <label className="vc-label text-[11px]">Primary Practice Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="vc-input text-xs"
              >
                <option value="Constitutional & Commercial Litigation">Constitutional &amp; Commercial Litigation</option>
                <option value="Criminal Defense & Special Leave Appeals">Criminal Defense &amp; Special Leave Appeals</option>
                <option value="Insolvency (NCLT) & Arbitration">Insolvency (NCLT) &amp; Arbitration</option>
                <option value="Intellectual Property & Patents">Intellectual Property &amp; Patents</option>
              </select>
            </div>

            {/* Advocate Passkey */}
            <div>
              <div className="flex items-center justify-between">
                <label className="vc-label text-[11px]">Digital Bar Passkey / OTP</label>
                <span className="text-[10px] text-blue-400 font-bold">2FA Enabled</span>
              </div>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                maxLength={6}
                className="vc-input text-xs tracking-widest text-center font-mono text-blue-300"
                placeholder="••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold font-mono text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isVerifying ? '⏳' : '⚖️'}</span>
              <span>
                {isVerifying
                  ? 'Verifying Bar Enrolment with Sovereign Ledger...'
                  : 'Authenticate & Enter Advocate Workspace'}
              </span>
            </button>
          </form>

          {/* Statutory Notice */}
          <div className="pt-3 border-t border-court-border/60 text-[10px] text-court-text-dim leading-relaxed text-center font-mono">
            Unauthorized access by non-advocates is an offense under Section 45 Advocates Act, 1961.
          </div>
        </div>

        {/* ── Switch to Other Role Logins ─────────────────────────── */}
        <div className="flex items-center justify-between text-xs font-mono text-court-text-dim px-2">
          <Link href="/judge/login" className="hover:text-court-gold flex items-center gap-1">
            <span>🏛️</span>
            <span>Judge Chambers Login →</span>
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
