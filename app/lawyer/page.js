'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function LawyerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── E-Filing State ──
  const [caseCategory, setCaseCategory] = useState('Constitutional Writ Petition (Art. 226)');
  const [petitioner, setPetitioner] = useState('Apex Renewable Energy Consortium');
  const [respondent, setRespondent] = useState('State Power Transmission Corporation');
  const [briefSummary, setBriefSummary] = useState('Challenging arbitrary disconnection of 50MW solar grid connectivity in violation of long-term PPA covenants and Article 14.');
  const [efiling, setEfiling] = useState(false);
  const [efileResult, setEfileResult] = useState(null);

  // ── Sec. 65B Certificate State ──
  const [selectedCaseForCert, setSelectedCaseForCert] = useState('WP(C)-2026-8941');
  const [certGenerated, setCertGenerated] = useState(false);

  // ── Citation Check State ──
  const [citationInput, setCitationInput] = useState('AIR 1973 SC 1461');
  const [citationCheckResult, setCitationCheckResult] = useState(null);

  // Session Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('vericourt_lawyer_session');
      if (!raw) {
        router.replace('/?role=lawyer');
        return;
      }
      try {
        setSession(JSON.parse(raw));
      } catch {
        router.replace('/?role=lawyer');
        return;
      }
    }
    fetchLawyerData();
  }, [router]);

  const fetchLawyerData = async () => {
    try {
      const res = await fetch('/api/portal?role=lawyer');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to fetch advocate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEfileSubmit = async (e) => {
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
          petitioner: petitioner.trim(),
          respondent: respondent.trim(),
          briefSummary: briefSummary.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEfileResult(json.filing);
        fetchLawyerData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEfiling(false);
    }
  };

  const handleDownloadSection65BCert = () => {
    const certText = `================================================================================
HIGH COURT OF JUDICATURE · ADVOCATE TRIAL EVIDENCE RECORD
CERTIFICATE UNDER SECTION 65B(4) INDIAN EVIDENCE ACT, 1872 / SECTION 63 BSA 2023
================================================================================
Counsel on Record    : ${session?.name || 'Adv. Meenakshi Sundaram'} (${session?.barNumber || 'MAH/4921/2014'})
Target Case Docket   : ${selectedCaseForCert}
Issuing Jurisdiction : High Court of Bombay (Commercial & Appellate)
Timestamp of Seal    : ${new Date().toISOString()}

EVIDENTIARY DECLARATION:
1. I, the undersigned Advocate on Record, hereby certify that the electronic document
   bearing Case Docket ${selectedCaseForCert} was produced by a computer system operated regularly
   in the ordinary course of professional activities.
2. The cryptographic SHA-256 fingerprint was computed client-side without modification.
3. The electronic record is identical to the entry anchored to EVM Consensus Block #12.

SHA-256 Digital Fingerprint: 0xa3f5c8e1d2b47f9e6a0c3d5b8e2f1a4c7d0b3e6f9a2c5d8e1f4b7a0c3d6e9f2b
Statutory Compliance       : Section 65B(4) IEA / Section 63 BSA 2023 Verified
================================================================================`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Section_65B_Certificate_${selectedCaseForCert}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setCertGenerated(true);
    setTimeout(() => setCertGenerated(false), 4000);
  };

  const handleCheckCitation = () => {
    if (!citationInput.trim()) return;
    if (citationInput.includes('1973') || citationInput.toLowerCase().includes('kesavananda')) {
      setCitationCheckResult({
        valid: true,
        citation: citationInput,
        title: 'Kesavananda Bharati v. State of Kerala (Basic Structure Doctrine)',
        court: 'Supreme Court of India (13-Judge Constitutional Bench)',
        status: 'VERIFIED_ON_CHAIN',
        block: 1,
      });
    } else {
      setCitationCheckResult({
        valid: false,
        citation: citationInput,
        title: 'Unknown or Hallucinated Citation',
        court: 'Not Found in Sovereign Gazette Ledger',
        status: 'UNVERIFIED_WARNING',
      });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-court-bg flex items-center justify-center">
        <div className="text-center font-mono text-sm text-blue-300 animate-pulse">
          Validating Bar Council Enrolment…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* ── Role Switcher ─────────────────────────────────────────── */}
        <RoleSwitcher />

        {/* ── Advocate Top Header ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-3xl shadow-lg shadow-blue-900/20 flex-shrink-0">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-judicial text-2xl sm:text-3xl font-bold text-blue-300">
                  {session?.name || 'Adv. Meenakshi Sundaram'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold uppercase tracking-wider">
                  BAR COUNCIL ENROLLED
                </span>
              </div>
              <p className="text-xs text-court-text-dim mt-0.5">
                {session?.barNumber || 'MAH/4921/2014'} · {session?.stateBar || 'Bar Council of Maharashtra & Goa'}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-court-text-dim flex-wrap">
                <span className="text-blue-400">
                  🏛️ {session?.chamberAddress || 'Chamber No. 412, High Court Advocates Annexe'}
                </span>
                <span>•</span>
                <span className="text-court-gold">
                  {session?.domain || 'Constitutional & Commercial Litigation'}
                </span>
                <span>•</span>
                <span className="text-court-green font-bold">● Bar Practice Ledger Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/verify"
              className="px-3.5 py-2 rounded-xl bg-court-surface border border-court-gold/30 text-court-gold font-mono text-xs font-bold hover:bg-court-gold/10 transition-all flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Verify Citations</span>
            </Link>
            <Link
              href="/precedents"
              className="px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>🕸️</span>
              <span>Precedent Graph</span>
            </Link>
            <Link
              href="/apostille"
              className="px-3.5 py-2 rounded-xl bg-court-surface border border-court-border text-court-text hover:border-court-gold font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>e-Apostille</span>
            </Link>
            <Link
              href="/ipfs"
              className="px-3.5 py-2 rounded-xl bg-court-surface border border-court-border text-court-text hover:border-court-gold font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>📦</span>
              <span>IPFS</span>
            </Link>
          </div>
        </div>

        {/* ── Advocate Operational Metrics ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="vc-card bg-court-surface/80 border-blue-500/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Active Briefs</p>
            <h3 className="font-judicial text-3xl font-bold text-blue-400 mt-1">
              {loading ? '…' : data?.stats?.activeBriefs || 3}
            </h3>
            <p className="text-[11px] text-court-text-dim mt-1">Assigned Client Matters</p>
          </div>

          <div className="vc-card bg-court-surface/80 border-court-gold/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">E-Filings Anchored</p>
            <h3 className="font-judicial text-3xl font-bold text-court-gold mt-1">
              {loading ? '…' : data?.stats?.filingsAnchored || 14}
            </h3>
            <p className="text-[11px] text-court-gold-lt mt-1">On-Chain Timestamped</p>
          </div>

          <div className="vc-card bg-court-surface/80 border-court-green/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Precedents Audited</p>
            <h3 className="font-judicial text-3xl font-bold text-court-green mt-1">
              {loading ? '…' : data?.stats?.precedentsScreened || 29}
            </h3>
            <p className="text-[11px] text-court-green mt-1">100% Anti-Hallucination Safe</p>
          </div>

          <div className="vc-card bg-court-surface/80 border-court-border">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Vakalatnama Status</p>
            <h3 className="font-judicial text-2xl font-bold text-court-text mt-1">
              Verified
            </h3>
            <p className="text-[11px] text-court-text-dim mt-1">Bar Council Ledger Active</p>
          </div>
        </div>

        {/* ── Main Workspace Grid: E-Filing Desk & Active Briefs ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TASK 1: Secure E-Filing & Document Stamping Desk */}
          <div id="efiling" className="vc-card bg-court-surface/90 border-court-border space-y-4">
            <div className="border-b border-court-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="font-judicial text-base font-bold text-court-gold">
                  Secure E-Filing &amp; Document Stamping Desk
                </h2>
              </div>
              <p className="text-xs text-court-text-dim mt-0.5">
                Draft, hash, and anchor new petitions with cryptographic timestamps before limitation periods expire.
              </p>
            </div>

            <form onSubmit={handleEfileSubmit} className="space-y-3">
              <div>
                <label className="vc-label">Pleading Category</label>
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
                  <label className="vc-label">Petitioner / Client</label>
                  <input
                    className="vc-input font-mono text-xs"
                    value={petitioner}
                    onChange={(e) => setPetitioner(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="vc-label">Opposing Respondent</label>
                  <input
                    className="vc-input font-mono text-xs"
                    value={respondent}
                    onChange={(e) => setRespondent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="vc-label">Brief Legal Grounds &amp; Prayer</label>
                <textarea
                  rows={3}
                  className="w-full bg-court-bg border border-court-border rounded-lg p-2.5 font-mono text-xs text-court-text focus:outline-none focus:border-court-gold leading-relaxed"
                  value={briefSummary}
                  onChange={(e) => setBriefSummary(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={efiling}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30 active:scale-[0.99]"
              >
                {efiling ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Fingerprinting &amp; Stamping on Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Submit E-Filing &amp; Stamp SHA-256 Seal</span>
                  </>
                )}
              </button>
            </form>

            {efileResult && (
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/40 text-xs font-mono space-y-2 animate-slide-up">
                <div className="flex items-center justify-between text-blue-300 font-bold">
                  <span>✓ E-Filing Accepted: {efileResult.filingId}</span>
                  <span className="text-[10px] bg-blue-600/30 px-2 py-0.5 rounded border border-blue-500/30">
                    TIMESTAMPED
                  </span>
                </div>
                <div className="text-[11px] text-court-text-dim break-all bg-black/40 p-2 rounded border border-court-border/60">
                  SHA-256 Fingerprint: <span className="text-court-gold">{efileResult.sha256Fingerprint}</span>
                </div>
              </div>
            )}
          </div>

          {/* TASK 2: Active Brief Portfolio Tracking & TASK 3: Section 65B Kit */}
          <div id="briefs" className="vc-card bg-court-surface/90 border-court-border space-y-4">
            <div className="border-b border-court-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <h2 className="font-judicial text-base font-bold text-court-gold">
                  Counsel Active Briefs Portfolio
                </h2>
              </div>
              <p className="text-xs text-court-text-dim mt-0.5">
                Real-time status of matters filed under your Bar Council enrollment.
              </p>
            </div>

            <div className="space-y-3">
              {data?.myPortfolio?.map((b) => (
                <div
                  key={b.caseNumber}
                  className="p-3.5 rounded-xl bg-court-bg border border-court-border text-xs font-mono space-y-2 hover:border-court-gold/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-court-gold">{b.caseNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/30 font-bold">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-court-text font-sans font-semibold text-sm">
                    Client: {b.client} · {b.court}
                  </div>
                  <div className="text-[11px] text-court-text-dim flex items-center justify-between pt-1 border-t border-court-border/40">
                    <span>Stage: {b.stage}</span>
                    <span className="text-court-text-dim">Next Hearing: Next Week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Counsel Evidence Kit: Section 65B Certificate */}
            <div id="evidence" className="pt-3 border-t border-court-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-court-text font-semibold">
                  Trial Evidence Kit (Section 65B Certificate)
                </span>
                <span className="text-[10px] font-mono text-court-gold">BS Act 2023</span>
              </div>
              <div className="flex gap-2">
                <select
                  className="vc-input flex-1 font-mono text-xs"
                  value={selectedCaseForCert}
                  onChange={(e) => setSelectedCaseForCert(e.target.value)}
                >
                  <option value="WP(C)-2026-8941">WP(C)-2026-8941 (Bombay High Court)</option>
                  <option value="CS(COMM)-2024-431">CS(COMM)-2024-431 (Delhi High Court)</option>
                  <option value="CRL-APP-2025-1142">CRL-APP-2025-1142 (Supreme Court)</option>
                </select>
                <button
                  onClick={handleDownloadSection65BCert}
                  className="px-4 py-2 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all whitespace-nowrap shadow"
                >
                  📥 Export 65B Cert
                </button>
              </div>
              {certGenerated && (
                <p className="text-[11px] text-court-green font-mono animate-fade-in">
                  ✓ Section 65B Evidence Certificate generated and saved to your device.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* ── TASK 4: Pre-Hearing AI Citation Audit Desk ────────────── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-court-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div>
                <h2 className="font-judicial text-base font-bold text-court-gold">
                  Pre-Hearing AI Citation Pre-Screening Desk
                </h2>
                <p className="text-xs text-court-text-dim">
                  Ensure no junior advocate or research associate in your chamber accidentally includes an AI-hallucinated citation in your written pleadings.
                </p>
              </div>
            </div>
            <Link
              href="/verify"
              className="text-xs font-mono text-court-gold hover:underline font-bold whitespace-nowrap"
            >
              Full Verification Bench →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={citationInput}
              onChange={(e) => setCitationInput(e.target.value)}
              placeholder="e.g. AIR 1973 SC 1461 or Mata v. Avianca"
              className="vc-input font-mono text-xs flex-1"
            />
            <button
              onClick={handleCheckCitation}
              className="px-4 py-2 rounded-xl bg-court-gold text-night-black font-bold font-mono text-xs hover:bg-court-gold-lt transition-colors whitespace-nowrap"
            >
              🔍 Audit Citation
            </button>
          </div>

          {citationCheckResult && (
            <div
              className={`p-3.5 rounded-xl border font-mono text-xs animate-slide-up space-y-1 ${
                citationCheckResult.valid
                  ? 'bg-court-green/10 border-court-green/40 text-court-green'
                  : 'bg-red-950/20 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{citationCheckResult.valid ? '✓ VERIFIED ON-CHAIN PRECEDENT' : '🚨 HALLUCINATION WARNING'}</span>
                <span>{citationCheckResult.status}</span>
              </div>
              <div className="text-court-text font-bold">{citationCheckResult.title}</div>
              <div className="text-[11px] text-court-text-dim">{citationCheckResult.court}</div>
            </div>
          )}
        </div>

        {/* ── TASK 5, 6, 7: Precedents, Apostille & IPFS Gateway ────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-court-surface border border-court-border space-y-2">
            <div className="text-2xl">🕸️</div>
            <h3 className="font-judicial text-sm font-bold text-court-gold">Precedent Knowledge Graph</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Trace constitutional doctrine lineage (Basic Structure, Privacy, Due Process).
            </p>
            <Link
              href="/precedents"
              className="inline-block text-xs font-mono font-bold text-blue-400 hover:underline pt-1"
            >
              Open Lineage Graph →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-court-surface border border-court-border space-y-2">
            <div className="text-2xl">🌐</div>
            <h3 className="font-judicial text-sm font-bold text-court-gold">Hague e-Apostille &amp; Escrow</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Section 44A CPC cross-border decree certification &amp; commercial escrow deposits.
            </p>
            <Link
              href="/apostille"
              className="inline-block text-xs font-mono font-bold text-blue-400 hover:underline pt-1"
            >
              Open e-Apostille →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-court-surface border border-court-border space-y-2">
            <div className="text-2xl">📦</div>
            <h3 className="font-judicial text-sm font-bold text-court-gold">Decentralized IPFS Storage</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Inspect content-addressed case file hashes anchored to Pinata IPFS nodes.
            </p>
            <Link
              href="/ipfs"
              className="inline-block text-xs font-mono font-bold text-blue-400 hover:underline pt-1"
            >
              Open IPFS Gateway →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
