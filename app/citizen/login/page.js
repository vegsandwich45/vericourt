'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CitizenLoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('otp'); // 'otp', 'docket', 'guest'
  const [mobileNumber, setMobileNumber] = useState('+91 98201 44812');
  const [otpCode, setOtpCode] = useState('8941');
  const [docketNumber, setDocketNumber] = useState('WP(C)-2026-8941');
  const [otpSent, setOtpSent] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (authMode === 'otp') {
      if (!mobileNumber.trim() || mobileNumber.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!otpCode || otpCode.length < 4) {
        setErrorMsg('Please enter the 4-digit OTP sent to your phone.');
        return;
      }
    } else if (authMode === 'docket') {
      if (!docketNumber.trim()) {
        setErrorMsg('Please enter a valid Case Docket or CNR Number.');
        return;
      }
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'vericourt_citizen_session',
          JSON.stringify({
            mobileNumber: authMode === 'otp' ? mobileNumber : 'Guest User',
            docketNumber: authMode === 'docket' ? docketNumber : 'WP(C)-2026-8941',
            name: 'Ramesh Kumar Singh (Litigant)',
            authMode,
            authenticatedAt: new Date().toISOString(),
          })
        );
      }
      setIsLoggingIn(false);
      router.push('/citizen');
    }, 800);
  };

  const handleDemoFill = () => {
    setAuthMode('otp');
    setMobileNumber('+91 98201 44812');
    setOtpCode('8941');
    setDocketNumber('WP(C)-2026-8941');
    setOtpSent(true);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        
        {/* ── Official Citizen Emblem & Header ────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-full px-4 py-1 text-emerald-300">
            <span className="text-sm">👤</span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest">
              NYAYA SEVA · FREE CITIZEN ACCESS
            </span>
          </div>

          <h1 className="font-judicial text-2xl sm:text-3xl text-emerald-300 font-bold">
            Citizen &amp; Litigant Access Kiosk
          </h1>
          <p className="text-xs text-court-text-dim">
            Zero-Jargon Case Tracking, Speech-to-Speech Voice Assistant &amp; Free Certified Copies
          </p>
        </div>

        {/* ── Demo Preset Quick Pill ───────────────────────────────── */}
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow"
        >
          <span>⚡</span>
          <span>Click to Auto-Fill: Litigant Ramesh Kumar Singh (WP-8941)</span>
        </button>

        {/* ── Main Form Card ───────────────────────────────────────── */}
        <div className="vc-card bg-[#0d1617]/95 border-emerald-500/40 p-6 space-y-4 shadow-2xl shadow-black/90">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-court-bg rounded-xl border border-court-border font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                authMode === 'otp'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              <span>📲</span>
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('docket')}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                authMode === 'docket'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              <span>📜</span>
              <span>Case Docket</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('guest')}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                authMode === 'guest'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              <span>⚡</span>
              <span>Guest Kiosk</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono animate-slide-up flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            
            {/* Mode 1: Mobile OTP Form */}
            {authMode === 'otp' && (
              <div className="space-y-3">
                <div>
                  <label className="vc-label text-[11px]">Citizen Mobile Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="vc-input text-xs flex-1 font-mono"
                      placeholder="+91 98XXX XXXXX"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="px-3 py-2 rounded-xl bg-court-surface border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 text-[10px] font-bold"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="vc-label text-[11px]">Enter 4-Digit SMS Code</label>
                    <span className="text-[10px] text-emerald-400">Demo Code: 8941</span>
                  </div>
                  <input
                    type="password"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    className="vc-input text-xs tracking-widest text-center font-mono text-emerald-300"
                    placeholder="••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Case Docket Direct Form */}
            {authMode === 'docket' && (
              <div className="space-y-3">
                <div>
                  <label className="vc-label text-[11px]">Case Docket or CNR Number</label>
                  <input
                    type="text"
                    value={docketNumber}
                    onChange={(e) => setDocketNumber(e.target.value)}
                    className="vc-input text-xs font-mono"
                    placeholder="e.g. WP(C)-2026-8941 or CRL-APP-2025-1142"
                    required
                  />
                </div>
                <div className="p-3 rounded-xl bg-court-bg border border-court-border text-[11px] text-court-text-dim leading-relaxed">
                  Enter your case number from your court receipt to directly view your plain-language judgment and bail release token.
                </div>
              </div>
            )}

            {/* Mode 3: Guest Kiosk Mode */}
            {authMode === 'guest' && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-court-text-dim space-y-2 leading-relaxed">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm font-judicial">
                  <span>🏛️</span>
                  <span>Open Public Justice Access (Article 39A)</span>
                </div>
                <p>
                  No password, mobile OTP, or identification required. Access the speech-to-speech voice assistant, vernacular translations, and public gazette orders instantly.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-mono text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoggingIn ? '⏳' : '👤'}</span>
              <span>
                {isLoggingIn
                  ? 'Connecting to Nyaya Seva Portal...'
                  : authMode === 'guest'
                  ? 'Enter as Guest Citizen'
                  : 'Verify & Enter Citizen Kiosk'}
              </span>
            </button>
          </form>

          {/* Accessibility Note */}
          <div className="pt-3 border-t border-court-border/60 text-[10px] text-court-text-dim leading-relaxed text-center font-mono">
            Free service operated by the National Judicial Evidentiary Portal · Zero Fees.
          </div>
        </div>

        {/* ── Switch to Other Role Logins ─────────────────────────── */}
        <div className="flex items-center justify-between text-xs font-mono text-court-text-dim px-2">
          <Link href="/judge/login" className="hover:text-court-gold flex items-center gap-1">
            <span>🏛️</span>
            <span>Judge Login →</span>
          </Link>
          <Link href="/lawyer/login" className="hover:text-blue-400 flex items-center gap-1">
            <span>⚖️</span>
            <span>Advocate Login →</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
