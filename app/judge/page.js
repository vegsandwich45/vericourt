'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function JudgeDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pronouncingCase, setPronouncingCase] = useState(null);
  const [judgeMessage, setJudgeMessage] = useState(null);
  const [fasterAlert, setFasterAlert] = useState(null);

  // ── Judgment Sealing (Register) State ──
  const [sealForm, setSealForm] = useState({
    caseNumber: 'WP(C)-2026-8941',
    petitioner: 'Aarav Singh & Ors.',
    respondent: 'Union of India & Anr.',
    judgmentType: 'Writ Petition',
    issuingAuthority: "Hon'ble Justice Vikramaditya Roy — High Court of Bombay",
    ipfsCid: 'QmPZ9gcCEpqKTo96CI6KoE7K8muKEwe7Xue2vqmP9GKDFJ',
  });
  const [sealing, setSealing] = useState(false);
  const [sealResult, setSealResult] = useState(null);

  // ── Gazette & Registry Search State ──
  const [registryQuery, setRegistryQuery] = useState('');
  const [gazetteResults, setGazetteResults] = useState([
    { caseNumber: 'WP(C)-2026-8941', coram: 'Vikramaditya Roy, J.', parties: 'Ramesh Kumar Singh vs UOI', block: 12, status: 'DECREE_SEALED' },
    { caseNumber: 'CS(COMM)-2024-431', coram: 'D.Y. Chandrachud, CJI', parties: 'Tata Sons vs NTT Docomo', block: 9, status: 'DECREE_SEALED' },
    { caseNumber: 'CRL-APP-2025-1142', coram: 'Vikramaditya Roy, J.', parties: 'State of Maharashtra vs Suresh Patel', block: 11, status: 'FASTER_RELEASED' },
  ]);

  // Session Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('vericourt_judge_session');
      if (!raw) {
        router.replace('/?role=judge');
        return;
      }
      try {
        setSession(JSON.parse(raw));
      } catch {
        router.replace('/?role=judge');
        return;
      }
    }
    fetchJudgeData();
  }, [router]);

  const fetchJudgeData = async () => {
    try {
      const res = await fetch('/api/portal?role=judge');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to fetch judicial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePronounceDecree = async (caseNumber) => {
    setPronouncingCase(caseNumber);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'judge_pronounce', caseNumber }),
      });
      const json = await res.json();
      if (json.success) {
        setJudgeMessage(`⚖️ Decree for ${caseNumber} officially pronounced and anchored to EVM Block #${json.blockNumber}!`);
        setTimeout(() => setJudgeMessage(null), 6000);
        fetchJudgeData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPronouncingCase(null);
    }
  };

  const handleFasterBail = async (caseNumber, prisonerName, jailName) => {
    try {
      const res = await fetch('/api/faster/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispatch',
          caseNumber,
          prisonerName,
          undertrialId: `UT-${Date.now().toString().slice(-5)}`,
          jailName,
          bailAmount: '₹25,000 PR Bond + 1 Local Surety',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFasterAlert(`⚡ FASTER Release Token dispatched to ${jailName} for ${prisonerName}!`);
        setTimeout(() => setFasterAlert(null), 5000);
        fetchJudgeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSealJudgment = async (e) => {
    e.preventDefault();
    setSealing(true);
    setSealResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    const mockHash = '0xa3f5c8e1d2b4' + Math.random().toString(16).slice(2, 14) + '7f9e6a0c3d5b8e2f';
    const mockBlock = Math.floor(12000 + Math.random() * 500);
    setSealResult({
      caseNumber: sealForm.caseNumber,
      sha256Hash: mockHash,
      blockNumber: mockBlock,
      timestamp: new Date().toISOString(),
      status: 'SEALED_ON_CHAIN',
    });
    setSealing(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-court-bg flex items-center justify-center">
        <div className="text-center font-mono text-sm text-court-gold animate-pulse">
          Authenticating Judicial Hardware Token…
        </div>
      </div>
    );
  }

  const filteredGazette = registryQuery
    ? gazetteResults.filter(
        (g) =>
          g.caseNumber.toLowerCase().includes(registryQuery.toLowerCase()) ||
          g.parties.toLowerCase().includes(registryQuery.toLowerCase())
      )
    : gazetteResults;

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* ── Role Switcher ───────────────────────────────────────── */}
        <RoleSwitcher />

        {/* ── Judge Bench Header ───────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-court-gold/15 border border-court-gold/40 flex items-center justify-center text-3xl shadow-lg shadow-court-gold/20 flex-shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-judicial text-2xl sm:text-3xl font-bold text-court-gold">
                  {session?.name || "Hon'ble Justice Vikramaditya Roy"}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-gold text-night-black font-bold uppercase tracking-wider">
                  JUDICIAL CHAMBERS
                </span>
              </div>
              <p className="text-xs text-court-text-dim mt-0.5">
                {session?.court || 'High Court of Judicature at Bombay'} · Senior Judge, Commercial &amp; Appellate Division
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-court-text-dim flex-wrap">
                <span className="text-court-gold">🏛️ {session?.courtroom || 'Courtroom No. 3'}</span>
                <span>•</span>
                <span className="text-emerald-400">🔒 Token: <code>{session?.tokenSerial || 'FIPS-140-2-DSC-984102'}</code></span>
                <span>•</span>
                <span className="text-court-green font-bold">● Bench Session ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/faster"
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>FASTER Protocol</span>
            </Link>
            <Link
              href="/multisig"
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Constitution Bench</span>
            </Link>
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl bg-court-gold/10 border border-court-gold/30 text-court-gold font-mono text-xs font-bold hover:bg-court-gold/20 transition-all flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>Chambers DB</span>
            </Link>
          </div>
        </div>

        {/* ── Alerts ──────────────────────────────────────────────── */}
        {judgeMessage && (
          <div className="p-4 rounded-xl bg-court-green/10 border border-court-green/40 text-court-green font-mono text-xs flex items-center justify-between animate-slide-up shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span>{judgeMessage}</span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-court-green/20 px-2 py-0.5 rounded">
              COMMITTED TO TIER 1 EVM
            </span>
          </div>
        )}
        {fasterAlert && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>{fasterAlert}</span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 px-2 py-0.5 rounded">
              e-PRISONS TOKEN DISPATCHED
            </span>
          </div>
        )}
        {sealResult && (
          <div className="p-4 rounded-xl bg-court-gold/10 border border-court-gold/40 text-court-gold font-mono text-xs space-y-2 animate-slide-up">
            <div className="font-bold flex items-center gap-2">
              <span>📜</span>
              <span>✓ Judgment SEALED ON CHAIN — {sealResult.caseNumber}</span>
              <span className="text-[10px] bg-court-gold/20 px-2 py-0.5 rounded border border-court-gold/40">
                BLOCK #{sealResult.blockNumber}
              </span>
            </div>
            <div className="text-[11px] text-court-text-dim break-all bg-black/30 p-2 rounded border border-court-border/60">
              SHA-256: <span className="text-court-gold">{sealResult.sha256Hash}</span>
            </div>
          </div>
        )}

        {/* ── Bench Operational Metrics ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="vc-card bg-court-surface/80 border-court-border">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Matters Listed</p>
            <h3 className="font-judicial text-3xl font-bold text-court-gold mt-1">
              {loading ? '…' : data?.stats?.listedToday || 5}
            </h3>
            <p className="text-[11px] text-court-text-dim mt-1">Daily Cause List Items</p>
          </div>
          <div className="vc-card bg-court-surface/80 border-amber-500/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Awaiting Seal</p>
            <h3 className="font-judicial text-3xl font-bold text-court-amber mt-1">
              {loading ? '…' : data?.stats?.awaitingSeal || 1}
            </h3>
            <p className="text-[11px] text-amber-300/80 mt-1">Ready for Pronouncement</p>
          </div>
          <div className="vc-card bg-court-surface/80 border-court-green/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">FASTER Emergency Bail</p>
            <h3 className="font-judicial text-3xl font-bold text-court-green mt-1">
              {loading ? '…' : data?.stats?.fasterBailPending || 1}
            </h3>
            <p className="text-[11px] text-court-green mt-1">Zero-Delay Prison Release</p>
          </div>
          <div className="vc-card bg-court-surface/80 border-purple-500/30">
            <p className="text-court-text-dim text-xs font-mono uppercase tracking-wider">Statutory Redactions</p>
            <h3 className="font-judicial text-3xl font-bold text-purple-300 mt-1">Active</h3>
            <p className="text-[11px] text-purple-300/80 mt-1">POCSO Sec. 33(7) Masking</p>
          </div>
        </div>

        {/* ── TASK 1: Seal & Register Judgment (Judge-Only Work) ─────── */}
        <div id="seal" className="vc-card bg-court-surface/90 border-court-gold/40 space-y-5">
          <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <div>
                <h2 className="font-judicial text-lg font-bold text-court-gold">
                  Seal &amp; Register Judgment on Blockchain
                </h2>
                <p className="text-xs text-court-text-dim mt-0.5">
                  Official on-chain anchoring of judicial orders. Only authorised bench officers with FIPS 140-2 DSC tokens may seal.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold hidden sm:inline">
              JUDGE BENCH ONLY
            </span>
          </div>

          <form onSubmit={handleSealJudgment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="vc-label">Case Docket Number</label>
              <input
                className="vc-input font-mono text-xs"
                value={sealForm.caseNumber}
                onChange={(e) => setSealForm({ ...sealForm, caseNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="vc-label">Judgment / Order Type</label>
              <select
                className="vc-input font-mono text-xs"
                value={sealForm.judgmentType}
                onChange={(e) => setSealForm({ ...sealForm, judgmentType: e.target.value })}
              >
                <option value="Writ Petition">Writ Petition (Art. 226)</option>
                <option value="Special Leave Petition">Special Leave Petition</option>
                <option value="Bail Order">Bail Order (Sec. 439 CrPC)</option>
                <option value="Interlocutory Order">Interlocutory Order</option>
                <option value="Final Decree">Final Decree</option>
              </select>
            </div>
            <div>
              <label className="vc-label">Petitioner / Appellant</label>
              <input
                className="vc-input font-mono text-xs"
                value={sealForm.petitioner}
                onChange={(e) => setSealForm({ ...sealForm, petitioner: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="vc-label">Respondent</label>
              <input
                className="vc-input font-mono text-xs"
                value={sealForm.respondent}
                onChange={(e) => setSealForm({ ...sealForm, respondent: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="vc-label">Issuing Authority (Bench)</label>
              <input
                className="vc-input font-mono text-xs"
                value={sealForm.issuingAuthority}
                onChange={(e) => setSealForm({ ...sealForm, issuingAuthority: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="vc-label">IPFS Content Identifier (Optional Pinata CID)</label>
              <input
                className="vc-input font-mono text-xs"
                value={sealForm.ipfsCid}
                onChange={(e) => setSealForm({ ...sealForm, ipfsCid: e.target.value })}
                placeholder="QmPZ9gcCEpq..."
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={sealing}
                className="w-full py-3 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-court-gold/20 active:scale-[0.99]"
              >
                {sealing ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-night-black/30 border-t-night-black rounded-full animate-spin" />
                    <span>Anchoring Order to Ethereum Ledger…</span>
                  </>
                ) : (
                  <>
                    <span>📜</span>
                    <span>Seal &amp; Register Judgment On-Chain (FIPS DSC Signed)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── TASK 2: Daily Cause List & Hearing Roster ─────────────── */}
        <div id="causelist" className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-court-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <h2 className="font-judicial text-lg font-bold text-court-gold">
                Official Daily Cause List &amp; Bench Roster
              </h2>
            </div>
            <div className="text-xs font-mono text-court-text-dim bg-court-bg px-3 py-1.5 rounded-lg border border-court-border">
              Courtroom #3 · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-court-text-dim border-b border-court-border/40 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Item #</th>
                  <th className="py-2.5 px-3">Docket No</th>
                  <th className="py-2.5 px-3">Parties</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Counsel</th>
                  <th className="py-2.5 px-3">Judicial Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-border/30">
                {data?.causeList?.map((item) => (
                  <tr key={item.itemNo} className="hover:bg-court-gold/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-court-gold">#{item.itemNo}</td>
                    <td className="py-3 px-3 font-bold text-court-text">{item.caseNumber}</td>
                    <td className="py-3 px-3 text-court-text max-w-[200px] truncate">{item.parties}</td>
                    <td className="py-3 px-3 text-court-text-dim">{item.stage}</td>
                    <td className="py-3 px-3 text-court-text-dim">{item.advocate}</td>
                    <td className="py-3 px-3">
                      {item.status === 'READY_TO_SEAL' ? (
                        <button
                          onClick={() => handlePronounceDecree(item.caseNumber)}
                          disabled={pronouncingCase === item.caseNumber}
                          className="px-3 py-1.5 rounded-lg bg-court-gold text-night-black font-bold text-[11px] transition-all hover:bg-court-gold-lt shadow active:scale-95 flex items-center gap-1"
                        >
                          <span>⚖️</span>
                          <span>{pronouncingCase === item.caseNumber ? 'Sealing…' : 'Pronounce Decree'}</span>
                        </button>
                      ) : item.status === 'FASTER_QUEUED' ? (
                        <button
                          onClick={() => handleFasterBail(item.caseNumber, 'Suresh Baburao Patel', 'Arthur Road Central Prison, Mumbai')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-night-black font-bold text-[11px] transition-all flex items-center gap-1"
                        >
                          <span>⚡</span>
                          <span>Dispatch FASTER Bail</span>
                        </button>
                      ) : item.status === 'MULTI_SIG_PENDING' ? (
                        <Link
                          href="/multisig"
                          className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-colors"
                        >
                          Constitution Quorum →
                        </Link>
                      ) : (
                        <span className="text-[10px] text-court-text-dim bg-court-bg px-2 py-0.5 rounded border border-court-border">
                          In Arguments
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TASK 3 & 4: Chambers Registry Search & Sovereign Gazette Audit ── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-court-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <div>
                <h2 className="font-judicial text-base font-bold text-court-gold">
                  Chambers Registry &amp; Sovereign Gazette Ledger Search
                </h2>
                <p className="text-xs text-court-text-dim">
                  Audit past judgments and decrees anchored by this bench to the decentralized ledger.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search docket or party..."
                value={registryQuery}
                onChange={(e) => setRegistryQuery(e.target.value)}
                className="vc-input font-mono text-xs w-48 sm:w-60"
              />
              <Link
                href="/explorer"
                className="px-3 py-1.5 rounded-lg bg-court-surface border border-court-gold/30 text-court-gold hover:bg-court-gold/10 text-xs font-mono font-bold whitespace-nowrap transition-colors"
              >
                Full Explorer →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-court-text-dim border-b border-court-border/40 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">Docket No</th>
                  <th className="py-2 px-3">Parties</th>
                  <th className="py-2 px-3">Bench Coram</th>
                  <th className="py-2 px-3">EVM Block</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-border/30">
                {filteredGazette.map((g) => (
                  <tr key={g.caseNumber} className="hover:bg-court-gold/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-court-gold">{g.caseNumber}</td>
                    <td className="py-2.5 px-3 text-court-text">{g.parties}</td>
                    <td className="py-2.5 px-3 text-court-text-dim">{g.coram}</td>
                    <td className="py-2.5 px-3 text-court-blue-lt">Block #{g.block}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-court-green/20 text-court-green border border-court-green/30">
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TASK 5: AI Precedent Anti-Hallucination Monitor ───────── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h2 className="font-judicial text-base font-bold text-court-gold">
                Chambers AI Precedent Anti-Hallucination Monitor
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
              MATA V. AVIANCA GUARD
            </span>
          </div>
          <p className="text-xs text-court-text-dim leading-relaxed">
            Automated screening engine parsing legal citations in counsels&apos; written submissions before oral arguments. Prevents attorneys from citing fictitious AI-generated case law.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-court-bg border border-court-border space-y-1">
              <div className="flex items-center justify-between text-court-green font-bold text-[11px]">
                <span>✓ Verified Authority in Brief #1</span>
                <span>INSC Consensus</span>
              </div>
              <p className="text-court-text text-xs">AIR 1973 SC 1461 (Kesavananda Bharati)</p>
              <p className="text-[10px] text-court-text-dim">Anchored to EVM Block #1 · Binding Precedent</p>
            </div>
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1">
              <div className="flex items-center justify-between text-red-400 font-bold text-[11px]">
                <span>🚨 AI Hallucination Intercepted in Brief #3</span>
                <span>Zero On-Chain Anchor</span>
              </div>
              <p className="text-court-text text-xs">Mata v. Avianca, Inc. (2023 F.Supp.3d 104)</p>
              <p className="text-[10px] text-red-300/80">Synthetic citation invented by Generative AI · Alerted to Bench</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
