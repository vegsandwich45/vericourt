'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApostilleEscrowPage() {
  const [activeTab, setActiveTab] = useState('apostille'); // 'apostille' | 'escrow'

  // Apostille state
  const [apostilles, setApostilles] = useState([]);
  const [caseNumber, setCaseNumber] = useState('WP(C)-2026-8941');
  const [countryDestination, setCountryDestination] = useState('United Kingdom (UK Commercial Court, London)');
  const [signatoryOfficial, setSignatoryOfficial] = useState('Hon. K. R. Nambiar');
  const [signatoryCapacity, setSignatoryCapacity] = useState('Registrar Judicial, High Court of Bombay');
  const [generatingApostille, setGeneratingApostille] = useState(false);
  const [activeApostille, setActiveApostille] = useState(null);

  // Escrow state
  const [escrows, setEscrows] = useState([]);
  const [escrowStats, setEscrowStats] = useState(null);
  const [matterTitle, setMatterTitle] = useState('Commercial Patent & Trade Secret Royalty Escrow');
  const [escrowCase, setEscrowCase] = useState('CS(COMM)-2024-431');
  const [amountInr, setAmountInr] = useState('15000000');
  const [amountEth, setAmountEth] = useState('5.4');
  const [depositor, setDepositor] = useState('Innovate Solutions Ltd. (Respondent)');
  const [beneficiary, setBeneficiary] = useState('TechCorp Pvt. Ltd. (Petitioner)');
  const [depositing, setDepositing] = useState(false);
  const [releasingId, setReleasingId] = useState(null);
  const [escrowAlert, setEscrowAlert] = useState(null);

  const fetchApostilles = async () => {
    try {
      const res = await fetch('/api/apostille/generate');
      const data = await res.json();
      if (data.success) {
        setApostilles(data.records || []);
        if (data.records?.length > 0 && !activeApostille) {
          setActiveApostille(data.records[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEscrows = async () => {
    try {
      const res = await fetch('/api/escrow/manage');
      const data = await res.json();
      if (data.success) {
        setEscrows(data.escrows || []);
        setEscrowStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApostilles();
    fetchEscrows();
  }, []);

  const handleGenerateApostille = async (e) => {
    e.preventDefault();
    setGeneratingApostille(true);
    try {
      const res = await fetch('/api/apostille/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber: caseNumber.trim(),
          countryDestination,
          signatoryOfficial,
          signatoryCapacity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveApostille(data.apostille);
        fetchApostilles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingApostille(false);
    }
  };

  const handleCreateEscrow = async (e) => {
    e.preventDefault();
    setDepositing(true);
    try {
      const res = await fetch('/api/escrow/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          caseNumber: escrowCase.trim(),
          matterTitle: matterTitle.trim(),
          amountInr: Number(amountInr),
          amountEth: Number(amountEth),
          depositor,
          beneficiary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrowAlert('💰 Restitution funds locked in smart contract escrow!');
        setTimeout(() => setEscrowAlert(null), 5000);
        fetchEscrows();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDepositing(false);
    }
  };

  const handleReleaseEscrow = async (escrowId) => {
    setReleasingId(escrowId);
    try {
      const res = await fetch('/api/escrow/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          escrowId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrowAlert('⚡ Decree Finality Enforced: Funds transferred automatically to winning petitioner!');
        setTimeout(() => setEscrowAlert(null), 5000);
        fetchEscrows();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1 mb-2">
              <span className="text-xs">🌐</span>
              <span className="text-[11px] font-mono text-blue-300 uppercase font-bold tracking-widest">
                CROSS-BORDER RECIPROCITY · SECTION 44A CPC
              </span>
            </div>
            <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
              International e-Apostille &amp; Smart Escrow
            </h1>
            <p className="text-xs sm:text-sm text-court-text-dim mt-1 max-w-3xl leading-relaxed">
              Standardized digital legal instruments for overseas decree enforcement under the 
              <strong> 1961 Hague Apostille Convention</strong> and automated 
              <strong> Smart Contract Restitution Escrows</strong> for commercial arbitration awards.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-court-surface border border-court-border rounded-xl p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('apostille')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'apostille'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              📜 Hague e-Apostille
            </button>
            <button
              onClick={() => setActiveTab('escrow')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'escrow'
                  ? 'bg-court-gold text-night-black font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              💰 Commercial Escrow
            </button>
          </div>
        </div>

        {/* ── TAB 1: Hague Convention e-Apostille Generator ─────────── */}
        {activeTab === 'apostille' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Generator Form */}
              <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
                <div className="border-b border-court-border/60 pb-3">
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Generate Cross-Border e-Apostille Certificate
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Standardized 10-point certificate valid across 125+ Hague Convention member states.
                  </p>
                </div>

                <form onSubmit={handleGenerateApostille} className="space-y-3">
                  <div>
                    <label className="vc-label">Case Docket Number</label>
                    <input
                      className="vc-input font-mono text-sm"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="vc-label">Destination Country (Reciprocating Territory)</label>
                    <select
                      className="vc-input font-mono text-sm"
                      value={countryDestination}
                      onChange={(e) => setCountryDestination(e.target.value)}
                    >
                      <option value="United Kingdom (UK Commercial Court, London)">United Kingdom (London Commercial Court)</option>
                      <option value="Singapore (Singapore International Arbitration Centre SIAC)">Singapore (SIAC / Supreme Court of Singapore)</option>
                      <option value="United Arab Emirates (DIFC Courts Dubai)">United Arab Emirates (DIFC Courts Dubai)</option>
                      <option value="United States (US Federal District Court, New York)">United States (US Federal Court, New York)</option>
                      <option value="France (Cour d'Appel de Paris)">France (Cour d&apos;Appel de Paris)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="vc-label">Signatory Judicial Official</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={signatoryOfficial}
                        onChange={(e) => setSignatoryOfficial(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="vc-label">Official Capacity</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={signatoryCapacity}
                        onChange={(e) => setSignatoryCapacity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingApostille}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 active:scale-[0.99] mt-2"
                  >
                    {generatingApostille ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Sealing Hague Certificate...</span>
                      </>
                    ) : (
                      <>
                        <span>🌐</span>
                        <span>Generate &amp; Anchor International e-Apostille</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Official 10-Point Apostille Document Preview */}
              <div className="vc-card bg-[#0e1117] border-2 border-blue-500/40 p-6 space-y-4 font-mono text-xs shadow-2xl relative">
                <div className="text-center border-b border-blue-500/30 pb-3 space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                    APOSTILLE
                  </div>
                  <div className="text-[11px] font-bold text-court-text">
                    (Convention de La Haye du 5 Octobre 1961)
                  </div>
                  <div className="text-[9px] text-court-text-dim">
                    REPUBLIC OF INDIA · MINISTRY OF EXTERNAL AFFAIRS
                  </div>
                </div>

                {activeApostille ? (
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="p-2 bg-blue-950/20 rounded border border-blue-500/20">
                      <strong>1. Country:</strong> Republic of India (Bharat)
                    </div>
                    <div className="text-court-text-dim">
                      This public document has been signed by:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-court-text">
                      <div><strong>2. Name:</strong> {activeApostille.signatory_official}</div>
                      <div><strong>3. Acting in capacity of:</strong> {activeApostille.signatory_capacity}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-court-text">
                      <div><strong>4. Bears the seal/stamp of:</strong> High Court of Judicature</div>
                      <div><strong>5. Destination:</strong> {activeApostille.country_destination}</div>
                    </div>
                    <div className="border-t border-blue-500/20 pt-2 text-court-text-dim">
                      Certified at New Delhi:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-court-text">
                      <div><strong>6. Date:</strong> {new Date(activeApostille.issued_at).toLocaleDateString()}</div>
                      <div><strong>7. By:</strong> Ministry of External Affairs</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-court-text">
                      <div><strong>8. No:</strong> <span className="text-blue-400 font-bold">{activeApostille.apostille_number}</span></div>
                      <div><strong>9. Seal/Stamp:</strong> EVM On-Chain Certified</div>
                    </div>
                    <div className="p-2 bg-black/50 rounded border border-blue-500/30 text-[10px] break-all text-blue-300">
                      <strong>10. Digital Signature (EVM Hash):</strong><br />
                      {activeApostille.certificate_hash}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-court-text-dim">
                    Generate an e-Apostille on the left to preview the international certificate.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: Smart Commercial Arbitration Escrow ───────────── */}
        {activeTab === 'escrow' && (
          <div className="space-y-6 animate-fade-in">
            {/* Escrow Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="vc-card bg-court-surface/80 border-court-border">
                <p className="text-court-text-dim text-xs font-mono uppercase">Total Locked In Smart Escrow</p>
                <h3 className="font-judicial text-3xl font-bold text-court-gold mt-1">
                  ₹{((escrowStats?.totalLockedInr || 15000000) / 10000000).toFixed(2)} Cr
                </h3>
                <p className="text-[11px] text-court-text-dim mt-1">Simulated Restitution Capital</p>
              </div>

              <div className="vc-card bg-court-surface/80 border-court-green/30">
                <p className="text-court-text-dim text-xs font-mono uppercase">Automated Payouts Released</p>
                <h3 className="font-judicial text-3xl font-bold text-court-green mt-1">
                  {escrowStats?.releasedPayouts || 0}
                </h3>
                <p className="text-[11px] text-court-green mt-1">Executed Post-Decree Finality</p>
              </div>

              <div className="vc-card bg-court-surface/80 border-amber-500/30">
                <p className="text-court-text-dim text-xs font-mono uppercase">Active Locked Contracts</p>
                <h3 className="font-judicial text-3xl font-bold text-amber-400 mt-1">
                  {escrowStats?.activeLocked || 1}
                </h3>
                <p className="text-[11px] text-amber-300/80 mt-1">Awaiting Final Bench Disposal</p>
              </div>
            </div>

            {escrowAlert && (
              <div className="p-3 rounded-lg bg-court-green/10 border border-court-green/40 text-court-green font-mono text-xs animate-slide-up flex items-center justify-between">
                <span>{escrowAlert}</span>
                <span className="text-[10px] uppercase font-bold">SMART ESCROW EXECUTED</span>
              </div>
            )}

            {/* Deposit Form & Escrows Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Deposit Form */}
              <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
                <div className="border-b border-court-border/60 pb-3">
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Deposit Disputed Escrow Funds
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Lock arbitral compensation into smart contract awaiting decree finality.
                  </p>
                </div>

                <form onSubmit={handleCreateEscrow} className="space-y-3">
                  <div>
                    <label className="vc-label">Case Docket</label>
                    <input
                      className="vc-input font-mono text-xs"
                      value={escrowCase}
                      onChange={(e) => setEscrowCase(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="vc-label">Dispute Matter Title</label>
                    <input
                      className="vc-input font-mono text-xs"
                      value={matterTitle}
                      onChange={(e) => setMatterTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="vc-label">Amount (INR ₹)</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={amountInr}
                        onChange={(e) => setAmountInr(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="vc-label">Amount (ETH)</label>
                      <input
                        className="vc-input font-mono text-xs"
                        value={amountEth}
                        onChange={(e) => setAmountEth(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="vc-label">Depositor (Liable Entity)</label>
                    <input
                      className="vc-input font-mono text-xs"
                      value={depositor}
                      onChange={(e) => setDepositor(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="vc-label">Beneficiary (Petitioner)</label>
                    <input
                      className="vc-input font-mono text-xs"
                      value={beneficiary}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={depositing}
                    className="w-full py-2.5 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {depositing ? 'Locking...' : '🔒 Deposit into Smart Escrow'}
                  </button>
                </form>
              </div>

              {/* Live Escrows Table */}
              <div className="lg:col-span-2 vc-card bg-court-surface/90 border-court-border space-y-4">
                <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
                  <h3 className="font-judicial text-base font-bold text-court-gold">
                    Active Commercial Escrow Contracts
                  </h3>
                  <span className="text-xs font-mono text-court-text-dim">
                    Autonomous On-Chain Settlement
                  </span>
                </div>

                <div className="space-y-3">
                  {escrows.map((e) => (
                    <div
                      key={e.id}
                      className="p-4 rounded-xl bg-court-bg border border-court-border hover:border-court-gold/40 transition-all space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-court-gold">{e.case_number} · {e.escrow_id}</span>
                        {e.status === 'RELEASED_TO_BENEFICIARY' ? (
                          <span className="px-2 py-0.5 rounded bg-court-green/20 text-court-green font-bold text-[10px]">
                            ✓ RELEASED TO WINNER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            🔒 FUNDS LOCKED IN ESCROW
                          </span>
                        )}
                      </div>

                      <div className="text-court-text font-sans font-semibold text-sm">
                        {e.matter_title}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-court-text-dim text-[11px] pt-1">
                        <div>Value: <strong className="text-court-text">₹{(e.amount_inr / 100000).toFixed(1)} Lakhs ({e.amount_eth} ETH)</strong></div>
                        <div>Depositor: <span className="text-court-text truncate">{e.depositor}</span></div>
                        <div>Beneficiary: <span className="text-court-gold truncate">{e.beneficiary}</span></div>
                        <div>Contract: <code className="text-court-text-dim">{e.escrow_contract_address.slice(0, 10)}…</code></div>
                      </div>

                      {e.status !== 'RELEASED_TO_BENEFICIARY' && (
                        <div className="pt-2 border-t border-court-border/40 flex items-center justify-between">
                          <span className="text-[10px] text-court-text-dim">Decree pronounced without appeal</span>
                          <button
                            onClick={() => handleReleaseEscrow(e.id)}
                            disabled={releasingId === e.id}
                            className="px-3 py-1 rounded-lg bg-court-green/20 hover:bg-court-green text-court-green hover:text-night-black font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>⚡</span>
                            <span>{releasingId === e.id ? 'Releasing...' : 'Enforce Decree & Release Escrow'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Footer Navigation ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-court-border text-xs text-court-text-dim font-mono">
          <Link href="/explorer" className="hover:text-court-gold">
            ← Sovereign Gazette
          </Link>
          <Link href="/admin" className="hover:text-court-gold">
            Executive Chambers →
          </Link>
        </div>

      </div>
    </div>
  );
}
