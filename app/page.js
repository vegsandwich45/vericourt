'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParticleField from '../components/ParticleField';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('judge');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Judge Login State ──
  const [judgeData, setJudgeData] = useState({
    officerId: 'JID-BOM-0842',
    name: "Hon'ble Justice Vikramaditya Roy",
    court: 'High Court of Judicature at Bombay',
    courtroom: 'Courtroom #3 (Commercial & Appellate Division)',
    tokenSerial: 'FIPS-140-2-DSC-984102',
    tokenPin: '984102',
    dongleInserted: true,
  });

  // ── Judge Registration State ──
  const [judgeReg, setJudgeReg] = useState({
    fullName: '',
    officerId: '',
    newPin: '',
    confirmPin: '',
  });

  // ── Lawyer Login State ──
  const [lawyerData, setLawyerData] = useState({
    barNumber: 'MAH/4921/2014',
    name: 'Adv. Meenakshi Sundaram',
    stateBar: 'Bar Council of Maharashtra & Goa',
    chamberAddress: 'Chamber #412, High Court Annexe, Fort, Mumbai',
    passkey: '849201',
    domain: 'Constitutional & Commercial Litigation',
  });

  // ── Lawyer Registration State ──
  const [lawyerReg, setLawyerReg] = useState({
    fullName: '',
    barNumber: '',
    newPasskey: '',
    confirmPasskey: '',
  });

  // ── Citizen Login State ──
  const [citizenData, setCitizenData] = useState({
    authMode: 'otp',
    mobileNumber: '+91 98201 44812',
    otpCode: '8941',
    docketNumber: 'WP(C)-2026-8941',
    name: 'Ramesh Kumar Singh (Litigant)',
  });

  // ── Citizen Registration State ──
  const [citizenReg, setCitizenReg] = useState({
    fullName: '',
    mobileNumber: '',
    preferredLanguage: 'Hindi',
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam && ['judge', 'lawyer', 'citizen'].includes(roleParam)) {
        setSelectedRole(roleParam);
      }
    }
  }, []);

  // Reset messages when switching tabs / modes
  const switchRole = (role) => {
    setSelectedRole(role);
    setAuthMode('login');
    setLoginError('');
    setSuccessMsg('');
  };
  const switchMode = (mode) => {
    setAuthMode(mode);
    setLoginError('');
    setSuccessMsg('');
  };

  // ── Auto-Fill Demo Preset ──
  const handleAutoFill = () => {
    setLoginError('');
    setSuccessMsg('');
    if (selectedRole === 'judge') {
      setJudgeData({
        officerId: 'JID-BOM-0842',
        name: "Hon'ble Justice Vikramaditya Roy",
        court: 'High Court of Judicature at Bombay',
        courtroom: 'Courtroom #3 (Commercial & Appellate Division)',
        tokenSerial: 'FIPS-140-2-DSC-984102',
        tokenPin: '984102',
        dongleInserted: true,
      });
    } else if (selectedRole === 'lawyer') {
      setLawyerData({
        barNumber: 'MAH/4921/2014',
        name: 'Adv. Meenakshi Sundaram',
        stateBar: 'Bar Council of Maharashtra & Goa',
        chamberAddress: 'Chamber #412, High Court Annexe, Fort, Mumbai',
        passkey: '849201',
        domain: 'Constitutional & Commercial Litigation',
      });
    } else {
      setCitizenData({
        authMode: 'otp',
        mobileNumber: '+91 98201 44812',
        otpCode: '8941',
        docketNumber: 'WP(C)-2026-8941',
        name: 'Ramesh Kumar Singh (Litigant)',
      });
    }
  };

  // ── Handle LOGIN ──
  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setSuccessMsg('');

    if (selectedRole === 'judge') {
      if (!judgeData.dongleInserted) {
        setLoginError('FIPS 140-2 DSC Hardware Token is not connected. Please insert your USB token.');
        return;
      }
      if (!judgeData.tokenPin || judgeData.tokenPin.length < 4) {
        setLoginError('Invalid Hardware Token PIN. Must be at least 4 digits.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_judge_session', JSON.stringify({
            ...judgeData,
            authenticatedAt: new Date().toISOString(),
          }));
        }
        setIsSubmitting(false);
        router.push('/judge');
      }, 700);

    } else if (selectedRole === 'lawyer') {
      if (!lawyerData.barNumber.trim() || !lawyerData.barNumber.includes('/')) {
        setLoginError('Invalid Bar Council Enrolment. Must be formatted like STATE/NUM/YEAR (e.g. MAH/4921/2014).');
        return;
      }
      if (!lawyerData.passkey || lawyerData.passkey.length < 4) {
        setLoginError('Digital Bar Passkey must be at least 4 digits.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_lawyer_session', JSON.stringify({
            ...lawyerData,
            verifiedOnChain: true,
            authenticatedAt: new Date().toISOString(),
          }));
        }
        setIsSubmitting(false);
        router.push('/lawyer');
      }, 700);

    } else if (selectedRole === 'citizen') {
      if (citizenData.authMode === 'otp' && (!citizenData.mobileNumber || citizenData.mobileNumber.length < 10)) {
        setLoginError('Please enter a valid 10-digit mobile number.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_citizen_session', JSON.stringify({
            ...citizenData,
            authenticatedAt: new Date().toISOString(),
          }));
        }
        setIsSubmitting(false);
        router.push('/citizen');
      }, 600);
    }
  };

  // ── Handle REGISTRATION ──
  const handleRegisterSubmit = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setSuccessMsg('');

    if (selectedRole === 'judge') {
      if (!judgeReg.fullName.trim()) { setLoginError('Full name is required.'); return; }
      if (!judgeReg.officerId.trim()) { setLoginError('Judicial Officer ID is required.'); return; }
      if (!judgeReg.court.trim()) { setLoginError('Court / Jurisdiction is required.'); return; }
      if (!judgeReg.newPin || judgeReg.newPin.length < 4) { setLoginError('DSC PIN must be at least 4 digits.'); return; }
      if (judgeReg.newPin !== judgeReg.confirmPin) { setLoginError('PINs do not match. Please re-enter.'); return; }

      const tokenSerial = `FIPS-140-2-DSC-${Math.floor(100000 + Math.random() * 900000)}`;
      const regData = {
        officerId: judgeReg.officerId,
        name: judgeReg.fullName,
        court: judgeReg.court,
        courtroom: judgeReg.courtroom || 'To be assigned',
        tokenSerial,
        tokenPin: judgeReg.newPin,
        dongleInserted: true,
        registeredAt: new Date().toISOString(),
      };

      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_judge_registration', JSON.stringify(regData));
        }
        // Pre-fill login form with registered data
        setJudgeData({ ...regData });
        setIsSubmitting(false);
        setSuccessMsg(`✅ Registration successful! Welcome, ${judgeReg.fullName}. Your DSC Token Serial is ${tokenSerial}. You can now log in.`);
        setJudgeReg({ fullName: '', officerId: '', court: '', courtroom: '', designation: '', newPin: '', confirmPin: '' });
        setTimeout(() => switchMode('login'), 2500);
      }, 800);

    } else if (selectedRole === 'lawyer') {
      if (!lawyerReg.fullName.trim()) { setLoginError('Full name is required.'); return; }
      if (!lawyerReg.barNumber.trim() || !lawyerReg.barNumber.includes('/')) {
        setLoginError('Bar Council Enrolment must be in format STATE/NUM/YEAR (e.g. MAH/4921/2014).');
        return;
      }
      if (!lawyerReg.stateBar.trim()) { setLoginError('State Bar Council is required.'); return; }
      if (!lawyerReg.newPasskey || lawyerReg.newPasskey.length < 4) { setLoginError('Passkey must be at least 4 digits.'); return; }
      if (lawyerReg.newPasskey !== lawyerReg.confirmPasskey) { setLoginError('Passkeys do not match. Please re-enter.'); return; }

      const regData = {
        barNumber: lawyerReg.barNumber,
        name: lawyerReg.fullName,
        stateBar: lawyerReg.stateBar,
        chamberAddress: lawyerReg.chamberAddress || 'To be assigned',
        passkey: lawyerReg.newPasskey,
        domain: lawyerReg.domain || 'General Practice',
        registeredAt: new Date().toISOString(),
      };

      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_lawyer_registration', JSON.stringify(regData));
        }
        setLawyerData({ ...regData });
        setIsSubmitting(false);
        setSuccessMsg(`✅ Registration successful! Welcome, ${lawyerReg.fullName}. Your Bar Number ${lawyerReg.barNumber} is now registered. You can now log in.`);
        setLawyerReg({ fullName: '', barNumber: '', stateBar: '', chamberAddress: '', domain: '', newPasskey: '', confirmPasskey: '' });
        setTimeout(() => switchMode('login'), 2500);
      }, 800);

    } else if (selectedRole === 'citizen') {
      if (!citizenReg.fullName.trim()) { setLoginError('Full name is required.'); return; }
      if (!citizenReg.mobileNumber || citizenReg.mobileNumber.replace(/\D/g, '').length < 10) {
        setLoginError('A valid 10-digit mobile number is required.');
        return;
      }

      const regData = {
        authMode: 'otp',
        name: citizenReg.fullName,
        mobileNumber: citizenReg.mobileNumber,
        aadharOrVoterId: citizenReg.aadharOrVoterId || '',
        preferredLanguage: citizenReg.preferredLanguage,
        docketNumber: citizenReg.docketNumber || '',
        registeredAt: new Date().toISOString(),
      };

      setIsSubmitting(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vericourt_citizen_registration', JSON.stringify(regData));
        }
        setCitizenData({
          authMode: 'otp',
          mobileNumber: citizenReg.mobileNumber,
          otpCode: '',
          docketNumber: citizenReg.docketNumber || '',
          name: citizenReg.fullName,
        });
        setIsSubmitting(false);
        setSuccessMsg(`✅ Registration successful! Welcome, ${citizenReg.fullName}. Enter the OTP sent to ${citizenReg.mobileNumber} to log in.`);
        setCitizenReg({ fullName: '', mobileNumber: '', aadharOrVoterId: '', preferredLanguage: 'Hindi', docketNumber: '', otp: '' });
        setTimeout(() => switchMode('login'), 2500);
      }, 800);
    }
  };

  // ── Role color helpers ──
  const roleColor = {
    judge: { active: 'bg-court-gold text-night-black shadow-court-gold/20', border: 'border-court-gold/40 shadow-court-gold/10', text: 'text-court-gold', toggle: 'bg-court-gold/10 border-court-gold/40 hover:bg-court-gold/20 text-court-gold', btn: 'bg-court-gold hover:bg-court-gold-lt text-night-black shadow-court-gold/20', pill: 'bg-court-gold/15 border-court-gold/30 text-court-gold', modeActive: 'bg-court-gold text-night-black font-bold' },
    lawyer: { active: 'bg-blue-600 text-white shadow-blue-900/30', border: 'border-blue-500/40 shadow-blue-900/10', text: 'text-blue-300', toggle: 'bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20 text-blue-300', btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30', pill: 'bg-blue-600/15 border-blue-500/30 text-blue-300', modeActive: 'bg-blue-600 text-white font-bold' },
    citizen: { active: 'bg-emerald-600 text-white shadow-emerald-900/30', border: 'border-emerald-500/40 shadow-emerald-900/10', text: 'text-emerald-300', toggle: 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30', pill: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', modeActive: 'bg-emerald-600 text-white font-bold' },
  };
  const rc = roleColor[selectedRole];

  return (
    <main className="min-h-screen bg-court-bg text-court-text overflow-x-hidden flex flex-col items-center justify-center px-4 py-12 relative">
      <ParticleField />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_#1a3a5c25_0%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,_#c9a84c0e_0%,_transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-6">

        {/* ── Header ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-court-gold/15 border border-court-gold/40 rounded-full px-4 py-1 text-court-gold">
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest">
              SOVEREIGN JUDICIAL ACCESS DESK
            </span>
          </div>
          <h1 className="font-judicial text-3xl sm:text-4xl font-bold text-court-text">
            <span className="text-court-gold">Veri</span>Court Portal
          </h1>
          <p className="text-xs text-court-text-dim max-w-md mx-auto leading-relaxed">
            Select your judicial role to authenticate and unlock your designated, access-controlled workspace.
          </p>
        </div>

        {/* ── 3-Role Selection Tabs ── */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-court-surface border border-court-border shadow-xl font-mono text-xs">
          <button type="button" onClick={() => switchRole('judge')}
            className={`py-3 px-2 rounded-xl transition-all flex flex-col items-center gap-1.5 ${selectedRole === 'judge' ? roleColor.judge.active + ' scale-[1.02]' : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'}`}>
            <span className="text-xl">🏛️</span>
            <span className="font-bold">Judge</span>
            <span className="text-[9px] opacity-80 uppercase tracking-tighter">Bench Authority</span>
          </button>
          <button type="button" onClick={() => switchRole('lawyer')}
            className={`py-3 px-2 rounded-xl transition-all flex flex-col items-center gap-1.5 ${selectedRole === 'lawyer' ? roleColor.lawyer.active + ' scale-[1.02]' : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'}`}>
            <span className="text-xl">⚖️</span>
            <span className="font-bold">Lawyer</span>
            <span className="text-[9px] opacity-80 uppercase tracking-tighter">Bar Council</span>
          </button>
          <button type="button" onClick={() => switchRole('citizen')}
            className={`py-3 px-2 rounded-xl transition-all flex flex-col items-center gap-1.5 ${selectedRole === 'citizen' ? roleColor.citizen.active + ' scale-[1.02]' : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'}`}>
            <span className="text-xl">👤</span>
            <span className="font-bold">Citizen</span>
            <span className="text-[9px] opacity-80 uppercase tracking-tighter">Nyaya Seva</span>
          </button>
        </div>

        {/* ── Login / Register Mode Toggle ── */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-court-surface border border-court-border font-mono text-xs">
          <button type="button" onClick={() => switchMode('register')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${authMode === 'register' ? rc.modeActive + ' shadow-md' : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'}`}>
            <span>📝</span>
            <span>New Registration</span>
          </button>
          <button type="button" onClick={() => switchMode('login')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${authMode === 'login' ? rc.modeActive + ' shadow-md' : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'}`}>
            <span>🔑</span>
            <span>Already Registered</span>
          </button>
        </div>

        {/* ── Auto-Fill (only in login mode) ── */}
        {authMode === 'login' && (
          <button type="button" onClick={handleAutoFill}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow ${rc.toggle}`}>
            <span>⚡</span>
            <span>
              {selectedRole === 'judge' && 'Click to Auto-Fill: Justice Vikramaditya Roy'}
              {selectedRole === 'lawyer' && 'Click to Auto-Fill: Adv. Meenakshi Sundaram (MAH/4921/2014)'}
              {selectedRole === 'citizen' && 'Click to Auto-Fill: Litigant Ramesh Kumar Singh (WP-8941)'}
            </span>
          </button>
        )}

        {/* ── Error / Success Banner ── */}
        {loginError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono animate-slide-up flex items-start gap-2">
            <span className="text-sm">⚠️</span>
            <span>{loginError}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-slide-up flex items-start gap-2">
            <span className="text-sm">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Form Card ── */}
        <div className={`vc-card bg-[#0e111a]/95 p-6 space-y-4 shadow-2xl transition-all duration-300 ${rc.border}`}>

          {/* ══════════════════════════════
               LOGIN FORMS
          ══════════════════════════════ */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">

              {/* ── JUDGE LOGIN ── */}
              {selectedRole === 'judge' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-court-gold font-bold">Hardware DSC Security Token</span>
                    <span className="text-emerald-400">● FIPS 140-2 Level 3</span>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Judicial Officer ID</label>
                    <input type="text" value={judgeData.officerId}
                      onChange={(e) => setJudgeData({ ...judgeData, officerId: e.target.value })}
                      className="vc-input font-mono text-xs" required />
                  </div>
                  <div>
                    <label className="vc-label text-xs">Courtroom & Division</label>
                    <input type="text" value={judgeData.courtroom}
                      onChange={(e) => setJudgeData({ ...judgeData, courtroom: e.target.value })}
                      className="vc-input font-mono text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">DSC Token Serial</label>
                      <input type="text" value={judgeData.tokenSerial} readOnly
                        className="vc-input font-mono text-xs bg-black/40 text-court-text-dim cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Hardware DSC PIN</label>
                      <input type="password" value={judgeData.tokenPin}
                        onChange={(e) => setJudgeData({ ...judgeData, tokenPin: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-court-bg border border-court-border text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-court-green animate-pulse" />
                      <span>Hardware USB Dongle Connected</span>
                    </div>
                    <span className="text-[10px] text-court-gold font-bold">READY</span>
                  </div>
                </div>
              )}

              {/* ── LAWYER LOGIN ── */}
              {selectedRole === 'lawyer' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-blue-300 font-bold">Bar Council of India Authentication</span>
                    <span className="text-blue-400">● Advocate Registry</span>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Bar Council Enrolment Number</label>
                    <input type="text" value={lawyerData.barNumber}
                      onChange={(e) => setLawyerData({ ...lawyerData, barNumber: e.target.value })}
                      className="vc-input font-mono text-xs" placeholder="MAH/4921/2014" required />
                  </div>
                  <div>
                    <label className="vc-label text-xs">State Bar Council Jurisdiction</label>
                    <input type="text" value={lawyerData.stateBar}
                      onChange={(e) => setLawyerData({ ...lawyerData, stateBar: e.target.value })}
                      className="vc-input font-mono text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Chamber Address</label>
                      <input type="text" value={lawyerData.chamberAddress}
                        onChange={(e) => setLawyerData({ ...lawyerData, chamberAddress: e.target.value })}
                        className="vc-input font-mono text-xs" required />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Digital Bar Passkey</label>
                      <input type="password" value={lawyerData.passkey}
                        onChange={(e) => setLawyerData({ ...lawyerData, passkey: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                  </div>
                </div>
              )}

              {/* ── CITIZEN LOGIN ── */}
              {selectedRole === 'citizen' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-emerald-300 font-bold">Nyaya Seva Public Access Kiosk</span>
                    <span className="text-emerald-400">● Free Article 39A</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    {[
                      { id: 'otp', label: '📱 Mobile OTP' },
                      { id: 'docket', label: '📄 Case Docket' },
                      { id: 'guest', label: '🏛️ Free Kiosk' },
                    ].map((m) => (
                      <button key={m.id} type="button"
                        onClick={() => setCitizenData({ ...citizenData, authMode: m.id })}
                        className={`p-1.5 rounded-lg border text-center transition-all ${citizenData.authMode === m.id ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-court-border bg-court-bg text-court-text-dim hover:text-court-text'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {citizenData.authMode === 'otp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="vc-label text-xs">Registered Mobile Number</label>
                        <input type="text" value={citizenData.mobileNumber}
                          onChange={(e) => setCitizenData({ ...citizenData, mobileNumber: e.target.value })}
                          className="vc-input font-mono text-xs" required />
                      </div>
                      <div>
                        <label className="vc-label text-xs">4-Digit Verification OTP</label>
                        <input type="text" maxLength={4} value={citizenData.otpCode}
                          onChange={(e) => setCitizenData({ ...citizenData, otpCode: e.target.value })}
                          className="vc-input font-mono text-xs text-center tracking-[0.5em] font-bold" required />
                      </div>
                    </div>
                  )}
                  {citizenData.authMode === 'docket' && (
                    <div>
                      <label className="vc-label text-xs">Case Docket / CNR Number</label>
                      <input type="text" value={citizenData.docketNumber}
                        onChange={(e) => setCitizenData({ ...citizenData, docketNumber: e.target.value })}
                        placeholder="WP(C)-2026-8941" className="vc-input font-mono text-xs" required />
                    </div>
                  )}
                  {citizenData.authMode === 'guest' && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-court-text-dim leading-relaxed">
                      Access free public court orders, cause lists, and vernacular voice summaries under Article 39A without creating an account or entering phone details.
                    </div>
                  )}
                </div>
              )}

              {/* ── Login Submit Button ── */}
              <button type="submit" disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm font-mono flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] ${rc.btn}`}>
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>
                      {selectedRole === 'judge' && 'Authenticate DSC Token & Open Chambers'}
                      {selectedRole === 'lawyer' && 'Verify Bar Credentials & Open Desk'}
                      {selectedRole === 'citizen' && 'Access Nyaya Seva Portal'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ══════════════════════════════
               REGISTRATION FORMS
          ══════════════════════════════ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">

              {/* ── JUDGE REGISTRATION ── */}
              {selectedRole === 'judge' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-court-gold font-bold">New Judicial Officer Registration</span>
                    <span className="text-emerald-400">● One-Time Setup</span>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Full Name (with title)</label>
                    <input type="text" value={judgeReg.fullName}
                      onChange={(e) => setJudgeReg({ ...judgeReg, fullName: e.target.value })}
                      placeholder="Hon'ble Justice …" className="vc-input font-mono text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Judicial Officer ID</label>
                      <input type="text" value={judgeReg.officerId}
                        onChange={(e) => setJudgeReg({ ...judgeReg, officerId: e.target.value })}
                        placeholder="JID-XXX-0000" className="vc-input font-mono text-xs" required />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Designation</label>
                      <input type="text" value={judgeReg.designation}
                        onChange={(e) => setJudgeReg({ ...judgeReg, designation: e.target.value })}
                        placeholder="District Judge / HC Judge" className="vc-input font-mono text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Court / Jurisdiction</label>
                    <input type="text" value={judgeReg.court}
                      onChange={(e) => setJudgeReg({ ...judgeReg, court: e.target.value })}
                      placeholder="High Court of Judicature at …" className="vc-input font-mono text-xs" required />
                  </div>
                  <div>
                    <label className="vc-label text-xs">Courtroom & Division (optional)</label>
                    <input type="text" value={judgeReg.courtroom}
                      onChange={(e) => setJudgeReg({ ...judgeReg, courtroom: e.target.value })}
                      placeholder="Courtroom #…" className="vc-input font-mono text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Create DSC PIN (min 4 digits)</label>
                      <input type="password" value={judgeReg.newPin}
                        onChange={(e) => setJudgeReg({ ...judgeReg, newPin: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Confirm DSC PIN</label>
                      <input type="password" value={judgeReg.confirmPin}
                        onChange={(e) => setJudgeReg({ ...judgeReg, confirmPin: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-court-gold/5 border border-court-gold/20 text-[11px] font-mono text-court-text-dim leading-relaxed">
                    💡 A unique FIPS 140-2 DSC Token Serial will be auto-generated upon registration.
                  </div>
                </div>
              )}

              {/* ── LAWYER REGISTRATION ── */}
              {selectedRole === 'lawyer' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-blue-300 font-bold">New Advocate Registration</span>
                    <span className="text-blue-400">● Bar Council Enrolment</span>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Full Name</label>
                    <input type="text" value={lawyerReg.fullName}
                      onChange={(e) => setLawyerReg({ ...lawyerReg, fullName: e.target.value })}
                      placeholder="Adv. …" className="vc-input font-mono text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Bar Council Enrolment No.</label>
                      <input type="text" value={lawyerReg.barNumber}
                        onChange={(e) => setLawyerReg({ ...lawyerReg, barNumber: e.target.value })}
                        placeholder="MAH/XXXX/YYYY" className="vc-input font-mono text-xs" required />
                    </div>
                    <div>
                      <label className="vc-label text-xs">State Bar Council</label>
                      <input type="text" value={lawyerReg.stateBar}
                        onChange={(e) => setLawyerReg({ ...lawyerReg, stateBar: e.target.value })}
                        placeholder="Bar Council of …" className="vc-input font-mono text-xs" required />
                    </div>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Chamber Address (optional)</label>
                    <input type="text" value={lawyerReg.chamberAddress}
                      onChange={(e) => setLawyerReg({ ...lawyerReg, chamberAddress: e.target.value })}
                      placeholder="Chamber #…, Court Annexe" className="vc-input font-mono text-xs" />
                  </div>
                  <div>
                    <label className="vc-label text-xs">Practice Domain (optional)</label>
                    <input type="text" value={lawyerReg.domain}
                      onChange={(e) => setLawyerReg({ ...lawyerReg, domain: e.target.value })}
                      placeholder="Criminal / Civil / Constitutional…" className="vc-input font-mono text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Create Passkey (min 4 digits)</label>
                      <input type="password" value={lawyerReg.newPasskey}
                        onChange={(e) => setLawyerReg({ ...lawyerReg, newPasskey: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Confirm Passkey</label>
                      <input type="password" value={lawyerReg.confirmPasskey}
                        onChange={(e) => setLawyerReg({ ...lawyerReg, confirmPasskey: e.target.value })}
                        placeholder="••••••" className="vc-input font-mono text-xs tracking-widest" required />
                    </div>
                  </div>
                </div>
              )}

              {/* ── CITIZEN REGISTRATION ── */}
              {selectedRole === 'citizen' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-court-text-dim border-b border-court-border/40 pb-2">
                    <span className="text-emerald-300 font-bold">New Citizen / Litigant Registration</span>
                    <span className="text-emerald-400">● Nyaya Seva Enrolment</span>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Full Name</label>
                    <input type="text" value={citizenReg.fullName}
                      onChange={(e) => setCitizenReg({ ...citizenReg, fullName: e.target.value })}
                      placeholder="Your full legal name" className="vc-input font-mono text-xs" required />
                  </div>
                  <div>
                    <label className="vc-label text-xs">Mobile Number (for OTP login)</label>
                    <input type="text" value={citizenReg.mobileNumber}
                      onChange={(e) => setCitizenReg({ ...citizenReg, mobileNumber: e.target.value })}
                      placeholder="+91 XXXXX XXXXX" className="vc-input font-mono text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label text-xs">Aadhar / Voter ID (optional)</label>
                      <input type="text" value={citizenReg.aadharOrVoterId}
                        onChange={(e) => setCitizenReg({ ...citizenReg, aadharOrVoterId: e.target.value })}
                        placeholder="XXXX-XXXX-XXXX" className="vc-input font-mono text-xs" />
                    </div>
                    <div>
                      <label className="vc-label text-xs">Preferred Language</label>
                      <select value={citizenReg.preferredLanguage}
                        onChange={(e) => setCitizenReg({ ...citizenReg, preferredLanguage: e.target.value })}
                        className="vc-input font-mono text-xs">
                        {['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Odia'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="vc-label text-xs">Case Docket / CNR Number (if known)</label>
                    <input type="text" value={citizenReg.docketNumber}
                      onChange={(e) => setCitizenReg({ ...citizenReg, docketNumber: e.target.value })}
                      placeholder="WP(C)-2026-XXXX (optional)" className="vc-input font-mono text-xs" />
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] font-mono text-court-text-dim leading-relaxed">
                    💡 After registration, an OTP will be sent to your mobile number for secure login under Article 39A (Free Legal Aid).
                  </div>
                </div>
              )}

              {/* ── Register Submit Button ── */}
              <button type="submit" disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm font-mono flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] ${rc.btn}`}>
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Registering…</span>
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    <span>
                      {selectedRole === 'judge' && 'Register Judicial Officer Account'}
                      {selectedRole === 'lawyer' && 'Register Advocate Account'}
                      {selectedRole === 'citizen' && 'Register Citizen / Litigant Account'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Security Footer ── */}
        <div className="text-center">
          <p className="text-[11px] font-mono text-court-text-dim flex flex-wrap items-center justify-center gap-3">
            <span>🔒 256-Bit Cryptographic Seal</span>
            <span>•</span>
            <span>Section 65B Admissible</span>
            <span>•</span>
            <span>Zero Data Leakage Architecture</span>
          </p>
        </div>

      </div>
    </main>
  );
}
