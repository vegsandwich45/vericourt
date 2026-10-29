'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import RoleSwitcher from '@/components/RoleSwitcher';

function PortalContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'judge';

  const [activeRole, setActiveRole] = useState(initialRole);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Judge actions
  const [pronouncingCase, setPronouncingCase] = useState(null);
  const [judgeMessage, setJudgeMessage] = useState(null);

  // Lawyer E-Filing form
  const [caseCategory, setCaseCategory] = useState('Constitutional Writ Petition (Art. 226)');
  const [petitioner, setPetitioner] = useState('Apex Renewable Energy Consortium');
  const [respondent, setRespondent] = useState('State Power Transmission Corp.');
  const [briefSummary, setBriefSummary] = useState('Challenging arbitrary disconnection of grid connectivity in violation of PPA covenants and Article 14.');
  const [efiling, setEfiling] = useState(false);
  const [efileResult, setEfileResult] = useState(null);

  // Citizen search state
  const [citizenQuery, setCitizenQuery] = useState('WP(C)-2026-8941');
  const [citizenCase, setCitizenCase] = useState(null);

  const fetchRoleData = async (role) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal?role=${role}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleData(activeRole);
  }, [activeRole]);

  // Handle Judge Pronouncement
  const handleJudgePronounce = async (caseNo) => {
    setPronouncingCase(caseNo);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'judge_pronounce', caseNumber: caseNo }),
      });
      const json = await res.json();
      if (json.success) {
        setJudgeMessage(`⚖️ Order for ${caseNo} officially pronounced and anchored to EVM Block #${json.blockNumber}!`);
        setTimeout(() => setJudgeMessage(null), 6000);
        fetchRoleData('judge');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPronouncingCase(null);
    }
  };

  // Handle Lawyer E-Filing
  const handleLawyerEfile = async (e) => {
    e.preventDefault();
    setEfiling(true);
    setEfileResult(null);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lawyer_efile',
          caseCategory,
          petitioner,
          respondent,
          briefSummary,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEfileResult(json.filing);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEfiling(false);
    }
  };

  // Citizen Case Search
  const handleCitizenSearch = () => {
    if (!citizenQuery.trim()) return;
    setCitizenCase({
      caseNumber: 'WP(C)-2026-8941',
      courtName: 'High Court of Judicature at Bombay',
      bench: 'Hon\'ble Justice Vikramaditya Roy',
      title: 'Ramesh Kumar Singh vs Union of India',
      status: 'DECREE_PRONOUNCED',
      plainEnglishSummary: 'The Court has granted full relief to petitioner Ramesh Kumar Singh, quashing the arbitrary administrative order and directing municipal authorities to register the title deed within 14 days.',
      vernacularSummary: 'मा. उच्च न्यायालयाने याचिकाकर्ते रमेश कुमार सिंह यांच्या बाजूने निकाल दिला असून, संबंधित प्राधिकरणास १४ दिवसांत फेरफार नोंद प्रमाणित करण्याचे निर्देश दिले आहेत.',
      nextStep: 'Final Certified Copy available for download. No further court appearances required.',
      evmBlock: 12,
      txHash: '0x1a4c7d0b3e6f9a2c5d8e1f4b7a0c3d6e9f2ba3f5c8e1d2b47f9e6a0c3d5b8e2f',
    });
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Cross-Role Switcher ────────────────────────────────────── */}
        <RoleSwitcher />

        {/* ── Top Role Selector Ribbon ──────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-court-gold/10 border border-court-gold/30 rounded-full px-4 py-1">
            <span className="text-xs">🏛️</span>
            <span className="text-[11px] font-mono text-court-gold uppercase font-bold tracking-widest">
              SOVEREIGN ROLE-BASED JUDICIAL WORKSPACE
            </span>
          </div>
          <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
            Role-Based Judicial Operating System
          </h1>
          <p className="text-xs sm:text-sm text-court-text-dim max-w-2xl mx-auto leading-relaxed">
            Tailored workspaces for every participant in the justice delivery system: 
            Hon&apos;ble Judges, Practicing Advocates, and Everyday Citizens.
          </p>

          {/* Role Tabs */}
          <div className="inline-flex p-1.5 bg-court-surface border border-court-border rounded-2xl shadow-xl gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveRole('judge')}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeRole === 'judge'
                  ? 'bg-court-gold text-night-black font-bold shadow-lg shadow-court-gold/20'
                  : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'
              }`}
            >
              <span>🏛️</span>
              <span>Hon&apos;ble Judge&apos;s Chambers</span>
            </button>

            <button
              onClick={() => setActiveRole('lawyer')}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeRole === 'lawyer'
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/30'
                  : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'
              }`}
            >
              <span>⚖️</span>
              <span>Advocate &amp; Legal Counsel</span>
            </button>

            <button
              onClick={() => setActiveRole('citizen')}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeRole === 'citizen'
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30'
                  : 'text-court-text-dim hover:text-court-text hover:bg-court-bg'
              }`}
            >
              <span>👤</span>
              <span>Citizen Nyaya Seva</span>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ── 1. HON'BLE JUDGE'S CHAMBERS ───────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeRole === 'judge' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dedicated Dashboard Quick Access */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-court-gold/10 border border-court-gold/30 text-xs font-mono">
              <span className="text-court-gold font-semibold flex items-center gap-2">
                <span>🏛️</span>
                <span>Dedicated Judge Chambers View is active with Cause List &amp; Chambers AI Guard.</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/judge/login"
                  className="px-3 py-1.5 rounded-lg bg-court-surface border border-court-gold/40 text-court-gold font-bold hover:bg-court-gold/20 transition-colors flex items-center gap-1.5"
                >
                  <span>🔒 DSC Login</span>
                </Link>
                <Link
                  href="/judge"
                  className="px-3 py-1.5 rounded-lg bg-court-gold text-night-black font-bold hover:bg-court-gold-lt transition-colors flex items-center gap-1.5"
                >
                  <span>Open Chambers</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>

            {/* Judge Profile & Telemetry Card */}
            <div className="vc-card bg-court-surface/90 border-court-gold/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-court-gold/15 border border-court-gold/40 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-court-gold/20">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-judicial text-xl font-bold text-court-gold">
                      {data?.judgeProfile?.name || 'Hon\'ble Justice Vikramaditya Roy'}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-gold text-night-black font-bold uppercase">
                      BENCH JUDICIAL
                    </span>
                  </div>
                  <p className="text-xs text-court-text-dim mt-0.5">
                    {data?.judgeProfile?.designation} · {data?.judgeProfile?.court}
                  </p>
                  <p className="text-[11px] font-mono text-court-gold-lt mt-1">
                    {data?.judgeProfile?.courtroom} · Token ID: <code>{data?.judgeProfile?.digitalTokenSerial}</code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-court-gold">{data?.stats?.listedToday || 5}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">Listed Today</div>
                </div>
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-court-amber">{data?.stats?.awaitingSeal || 1}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">Ready to Seal</div>
                </div>
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-court-green">{data?.stats?.fasterBailPending || 1}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">FASTER Bail</div>
                </div>
              </div>
            </div>

            {judgeMessage && (
              <div className="p-4 rounded-xl bg-court-green/10 border border-court-green/40 text-court-green font-mono text-xs flex items-center justify-between animate-slide-up">
                <span>{judgeMessage}</span>
                <span className="text-[10px] uppercase font-bold">COMMITTED TO TIER 1 EVM</span>
              </div>
            )}

            {/* Daily Cause List Table */}
            <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
              <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
                <div>
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Daily Cause List (Official Court Roster)
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Matters listed before this Bench for hearing, arguments, and final pronouncement.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-court-text-dim bg-court-bg px-2 py-1 rounded border border-court-border">
                  Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-left text-court-text-dim border-b border-court-border/40 uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-3">Item #</th>
                      <th className="py-2 px-3">Docket Number</th>
                      <th className="py-2 px-3">Case Title &amp; Litigants</th>
                      <th className="py-2 px-3">Stage of Proceeding</th>
                      <th className="py-2 px-3">Counsel on Record</th>
                      <th className="py-2 px-3">Bench Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-court-border/30">
                    {data?.causeList?.map((item) => (
                      <tr key={item.itemNo} className="hover:bg-court-gold/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-court-gold">#{item.itemNo}</td>
                        <td className="py-2.5 px-3 font-bold text-court-text">{item.caseNumber}</td>
                        <td className="py-2.5 px-3 text-court-text max-w-[220px] truncate">{item.parties}</td>
                        <td className="py-2.5 px-3 text-court-text-dim">{item.stage}</td>
                        <td className="py-2.5 px-3 text-court-text-dim">{item.advocate}</td>
                        <td className="py-2.5 px-3">
                          {item.status === 'READY_TO_SEAL' ? (
                            <button
                              onClick={() => handleJudgePronounce(item.caseNumber)}
                              disabled={pronouncingCase === item.caseNumber}
                              className="px-3 py-1 rounded bg-court-gold text-night-black font-bold text-[10px] transition-all hover:bg-court-gold-lt shadow active:scale-95"
                            >
                              {pronouncingCase === item.caseNumber ? 'Sealing...' : '⚖️ Pronounce & Seal'}
                            </button>
                          ) : item.status === 'FASTER_QUEUED' ? (
                            <Link
                              href="/faster"
                              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 hover:bg-amber-500 hover:text-night-black transition-colors"
                            >
                              ⚡ FASTER Dispatch
                            </Link>
                          ) : (
                            <span className="text-[10px] text-court-text-dim font-mono">
                              In Hearing
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ── 2. ADVOCATE & LEGAL COUNSEL WORKSPACE ─────────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeRole === 'lawyer' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dedicated Dashboard Quick Access */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-mono">
              <span className="text-blue-300 font-semibold flex items-center gap-2">
                <span>⚖️</span>
                <span>Dedicated Advocate Workspace is active with Section 65B(4) Kit &amp; Client Portfolio.</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/lawyer/login"
                  className="px-3 py-1.5 rounded-lg bg-court-surface border border-blue-500/40 text-blue-300 font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                >
                  <span>🔒 Bar ID Login</span>
                </Link>
                <Link
                  href="/lawyer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                >
                  <span>Open Workspace</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>

            {/* Counsel Profile Card */}
            <div className="vc-card bg-court-surface/90 border-blue-500/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-blue-900/20">
                  ⚖️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-judicial text-xl font-bold text-blue-300">
                      {data?.lawyerProfile?.name || 'Adv. Meenakshi Sundaram'}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold uppercase">
                      BAR CERTIFIED
                    </span>
                  </div>
                  <p className="text-xs text-court-text-dim mt-0.5">
                    {data?.lawyerProfile?.barEnrollment}
                  </p>
                  <p className="text-[11px] font-mono text-court-text-dim mt-1">
                    {data?.lawyerProfile?.chamberAddress}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-blue-400">{data?.stats?.activeBriefs || 3}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">Active Briefs</div>
                </div>
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-court-gold">{data?.stats?.filingsAnchored || 14}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">E-Filings Stamped</div>
                </div>
                <div className="p-3 bg-court-bg rounded-xl border border-court-border">
                  <div className="text-xl font-bold text-emerald-400">{data?.stats?.precedentsScreened || 29}</div>
                  <div className="text-[10px] text-court-text-dim uppercase mt-0.5">Precedents Audited</div>
                </div>
              </div>
            </div>

            {/* E-Filing Form & Portfolio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Secure E-Filing Desk */}
              <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
                <div className="border-b border-court-border/60 pb-3">
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Secure E-Filing &amp; Document Stamping Desk
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Compute client-side SHA-256 fingerprint and timestamp new petitions on the sovereign ledger.
                  </p>
                </div>

                <form onSubmit={handleLawyerEfile} className="space-y-3">
                  <div>
                    <label className="vc-label">Matter Category</label>
                    <select
                      className="vc-input font-mono text-xs"
                      value={caseCategory}
                      onChange={(e) => setCaseCategory(e.target.value)}
                    >
                      <option value="Constitutional Writ Petition (Art. 226)">Constitutional Writ Petition (Article 226)</option>
                      <option value="Special Leave Petition (Civil)">Special Leave Petition (Civil)</option>
                      <option value="Commercial Arbitration Application (Sec. 9/11)">Commercial Arbitration Application (Sec. 9/11)</option>
                      <option value="Criminal Bail Application (Sec. 439 CrPC)">Criminal Bail Application (Sec. 439 CrPC)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label">Petitioner / Applicant</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={petitioner}
                        onChange={(e) => setPetitioner(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="vc-label">Respondent</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={respondent}
                        onChange={(e) => setRespondent(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="vc-label">Pleading Summary &amp; Prayer</label>
                    <textarea
                      rows={3}
                      className="w-full bg-court-bg border border-court-border rounded-lg p-2.5 font-mono text-xs text-court-text focus:outline-none focus:border-court-gold"
                      value={briefSummary}
                      onChange={(e) => setBriefSummary(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={efiling}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {efiling ? 'Fingerprinting & Anchoring...' : '⚡ Submit E-Filing & Stamp SHA-256 Seal'}
                  </button>
                </form>

                {efileResult && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/40 text-xs font-mono space-y-1 animate-slide-up">
                    <div className="flex items-center justify-between text-blue-300 font-bold">
                      <span>✓ Filing Accepted: {efileResult.filingId}</span>
                      <span className="text-[10px] bg-blue-600/30 px-1.5 py-0.2 rounded">TIMESTAMPED</span>
                    </div>
                    <p className="text-[11px] text-court-text-dim break-all">
                      SHA-256 Fingerprint: <span className="text-court-gold">{efileResult.sha256Fingerprint}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Active Portfolio */}
              <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
                <div className="border-b border-court-border/60 pb-3">
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Counsel Active Briefs &amp; Cause List Tracking
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Live status of matters assigned to your Bar Council enrollment.
                  </p>
                </div>

                <div className="space-y-3">
                  {data?.myPortfolio?.map((b) => (
                    <div
                      key={b.caseNumber}
                      className="p-3.5 rounded-xl bg-court-bg border border-court-border text-xs font-mono space-y-1.5 hover:border-court-gold/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-court-gold">{b.caseNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/30">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-court-text font-sans font-semibold">
                        Client: {b.client} · {b.court}
                      </div>
                      <div className="text-[11px] text-court-text-dim flex items-center justify-between">
                        <span>Stage: {b.stage}</span>
                        <Link
                          href={`/explorer?case=${encodeURIComponent(b.caseNumber)}`}
                          className="text-court-gold hover:underline"
                        >
                          View Decree →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Citation Pre-Check Link */}
                <div className="pt-2">
                  <Link
                    href="/verify"
                    className="w-full py-2.5 rounded-xl bg-court-surface border border-court-gold/30 hover:border-court-gold text-court-gold font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>🛡️</span>
                    <span>Pre-Screen Written Submissions for AI Hallucinations</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ── 3. CITIZEN & LITIGANT NYAYA SEVA PORTAL ───────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeRole === 'citizen' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dedicated Dashboard Quick Access */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono">
              <span className="text-emerald-300 font-semibold flex items-center gap-2">
                <span>👤</span>
                <span>Dedicated Citizen Nyaya Seva Kiosk is active with Speech-to-Speech &amp; 4-Stage Timeline.</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/citizen/login"
                  className="px-3 py-1.5 rounded-lg bg-court-surface border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                >
                  <span>🔑 Citizen Login</span>
                </Link>
                <Link
                  href="/citizen"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                >
                  <span>Open Kiosk</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>

            {/* Citizen Welcome Banner */}
            <div className="vc-card bg-court-surface/90 border-emerald-500/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-emerald-900/20">
                  👤
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-judicial text-xl font-bold text-emerald-300">
                      Nyaya Seva · Citizen Justice Access Kiosk
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold uppercase">
                      PUBLIC PORTAL
                    </span>
                  </div>
                  <p className="text-xs text-court-text-dim mt-0.5">
                    Zero-Jargon, Plain-Language Court Tracking for Common Citizens &amp; Litigants.
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-1">
                    Free Public Service · Section 65B Electronic Certified Copies Available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/whatsapp"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <span>📲</span>
                  <span>Open WhatsApp Bot</span>
                </Link>
              </div>
            </div>

            {/* Case Search & Tracker */}
            <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
              <label className="vc-label">Track Your Case (Enter Docket Number or CNR)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="vc-input flex-1 font-mono text-sm"
                  value={citizenQuery}
                  onChange={(e) => setCitizenQuery(e.target.value)}
                  placeholder="e.g. WP(C)-2026-8941"
                />
                <button
                  onClick={handleCitizenSearch}
                  className="px-6 py-2.5 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>🔍</span>
                  <span>Search Case Status</span>
                </button>
              </div>

              {citizenCase && (
                <div className="space-y-4 pt-4 border-t border-court-border/60 animate-slide-up">
                  
                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-court-text-dim mb-2">
                      <span className="text-court-gold font-bold">Case Progression: 100% Completed</span>
                      <span className="text-court-green font-bold">Decree Pronounced</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      <div className="p-2 rounded bg-court-green/20 text-court-green border border-court-green/40 font-bold">
                        1. Petition Filed ✓
                      </div>
                      <div className="p-2 rounded bg-court-green/20 text-court-green border border-court-green/40 font-bold">
                        2. Notice Issued ✓
                      </div>
                      <div className="p-2 rounded bg-court-green/20 text-court-green border border-court-green/40 font-bold">
                        3. Arguments Concluded ✓
                      </div>
                      <div className="p-2 rounded bg-court-green/20 text-court-green border border-court-green/40 font-bold">
                        4. Final Decree Sealed ✓
                      </div>
                    </div>
                  </div>

                  {/* Plain Language Explainer */}
                  <div className="p-4 rounded-xl bg-court-bg border border-court-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-judicial text-court-gold font-bold text-base">
                        {citizenCase.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-green/20 text-court-green font-bold">
                        RELIEF GRANTED
                      </span>
                    </div>

                    <p className="text-xs text-court-text leading-relaxed">
                      <strong>Plain English Summary:</strong> {citizenCase.plainEnglishSummary}
                    </p>

                    <div className="p-2.5 rounded-lg bg-court-surface border border-court-border text-xs text-court-gold-lt leading-relaxed">
                      <strong>प्रादेशिक भाषा सारांश (मराठी/हिंदी):</strong> {citizenCase.vernacularSummary}
                    </div>

                    <div className="text-[11px] font-mono text-court-text-dim pt-1 flex items-center justify-between">
                      <span>Consensus Block: #{citizenCase.evmBlock}</span>
                      <span>Next Step: {citizenCase.nextStep}</span>
                    </div>
                  </div>

                  {/* 1-Click Actions for Citizens */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <Link
                      href={`/explorer?case=${encodeURIComponent(citizenCase.caseNumber)}`}
                      className="p-3 rounded-xl bg-court-surface border border-court-border hover:border-court-gold text-center text-court-gold font-bold transition-colors"
                    >
                      📜 View Certified Copy
                    </Link>
                    <Link
                      href="/translate"
                      className="p-3 rounded-xl bg-court-surface border border-court-border hover:border-court-gold text-center text-court-gold font-bold transition-colors"
                    >
                      🇮🇳 Translate into 7 Languages
                    </Link>
                    <Link
                      href="/verify"
                      className="p-3 rounded-xl bg-court-surface border border-court-border hover:border-court-gold text-center text-court-gold font-bold transition-colors"
                    >
                      🛡️ Verify Genuine Seal
                    </Link>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer Navigation ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-court-border text-xs text-court-text-dim font-mono">
          <Link href="/explorer" className="hover:text-court-gold">
            ← Sovereign Gazette
          </Link>
          <Link href="/admin" className="hover:text-court-gold">
            System Architecture Chambers →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-court-bg flex items-center justify-center text-court-gold font-mono text-xs">Loading Judicial Portals...</div>}>
      <PortalContent />
    </Suspense>
  );
}
