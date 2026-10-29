'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FasterPortalPage() {
  const [dispatches, setDispatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'warden'

  // Form state
  const [caseNumber, setCaseNumber] = useState('CRL-APP-2025-1142');
  const [prisonerName, setPrisonerName] = useState('Suresh Baburao Patel');
  const [undertrialId, setUndertrialId] = useState('UT-78491-BOM');
  const [jailName, setJailName] = useState('Arthur Road Central Prison, Mumbai');
  const [bailAmount, setBailAmount] = useState('₹25,000 PR Bond + 1 Local Surety');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  // Warden terminal state
  const [wardenTokenInput, setWardenTokenInput] = useState('');
  const [wardenProcessing, setWardenProcessing] = useState(false);
  const [wardenResult, setWardenResult] = useState(null);

  const fetchDispatches = async () => {
    try {
      const res = await fetch('/api/faster/dispatch');
      const data = await res.json();
      if (data.success) {
        setDispatches(data.dispatches);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchAlert(null);

    try {
      const res = await fetch('/api/faster/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispatch',
          caseNumber: caseNumber.trim(),
          prisonerName: prisonerName.trim(),
          undertrialId: undertrialId.trim(),
          jailName,
          bailAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchAlert(`🚀 FASTER Token Generated: Dispatched to ${jailName}!`);
        setTimeout(() => setDispatchAlert(null), 5000);
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const handleWardenRelease = async (tokenToVerify) => {
    const token = tokenToVerify || wardenTokenInput;
    if (!token) return;
    setWardenProcessing(true);
    setWardenResult(null);

    try {
      const res = await fetch('/api/faster/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_warden',
          token: token.trim(),
        }),
      });
      const data = await res.json();
      setWardenResult(data);
      if (data.success) {
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWardenProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono text-amber-300 uppercase font-bold tracking-widest">
                SUPREME COURT OF INDIA · FASTER SYSTEM
              </span>
            </div>
            <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
              ⚡ FASTER &amp; e-Prisons Instant Bail Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-court-text-dim mt-1 max-w-3xl leading-relaxed">
              Fast and Secured Electronic Transmission of Records (FASTER) protocol connecting 
              the sovereign judicial ledger directly with the Ministry of Home Affairs&apos; 
              <strong> e-Prisons / ICJS network</strong> to eliminate detention delays post-bail.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-court-surface border border-court-border rounded-xl p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'registry'
                  ? 'bg-court-gold text-night-black font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              🏛️ Court Dispatcher
            </button>
            <button
              onClick={() => setActiveTab('warden')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'warden'
                  ? 'bg-amber-500 text-night-black font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              👮 Jail Warden Terminal
            </button>
          </div>
        </div>

        {/* ── Operational Telemetry Row ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="vc-card bg-court-surface/80 border-court-border">
            <p className="text-court-text-dim text-xs font-mono uppercase">Total Dispatches Transmitted</p>
            <h3 className="font-judicial text-3xl font-bold text-court-gold mt-1">
              {loading ? '…' : stats?.totalDispatched || 2}
            </h3>
            <p className="text-[11px] text-court-text-dim mt-1">Direct e-Prisons Node Pipe</p>
          </div>

          <div className="vc-card bg-court-surface/80 border-court-green/30">
            <p className="text-court-text-dim text-xs font-mono uppercase">Immediate Releases Executed</p>
            <h3 className="font-judicial text-3xl font-bold text-court-green mt-1">
              {loading ? '…' : stats?.releasedZeroDelay || 1}
            </h3>
            <p className="text-[11px] text-court-green mt-1">Zero Post-Bail Detention Delays</p>
          </div>

          <div className="vc-card bg-court-surface/80 border-amber-500/30">
            <p className="text-court-text-dim text-xs font-mono uppercase">Awaiting Warden Check-in</p>
            <h3 className="font-judicial text-3xl font-bold text-amber-400 mt-1">
              {loading ? '…' : stats?.pendingWardenVerification || 1}
            </h3>
            <p className="text-[11px] text-amber-300/80 mt-1">Active Cryptographic Tokens</p>
          </div>
        </div>

        {/* ── TAB 1: Court Registry Dispatch Console ───────────────── */}
        {activeTab === 'registry' && (
          <div className="space-y-6 animate-fade-in">
            <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
              <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
                <div>
                  <h3 className="font-judicial text-lg text-court-gold font-bold">
                    Transmit Sovereign Bail Release Token
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    Generates a cryptographically signed digital release order transmitting to the Prison Superintendent.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-gold/10 text-court-gold border border-court-gold/30">
                  SEC. 439 CrPC / SEC. 483 BNSS
                </span>
              </div>

              {dispatchAlert && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs animate-slide-up flex items-center justify-between">
                  <span>{dispatchAlert}</span>
                  <span className="text-[10px] uppercase">COMMITTED TO ICJS PIPE</span>
                </div>
              )}

              <form onSubmit={handleCreateDispatch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <label className="vc-label">Undertrial Prisoner Name</label>
                    <input
                      className="vc-input font-mono text-sm"
                      value={prisonerName}
                      onChange={(e) => setPrisonerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="vc-label">Undertrial Prison ID</label>
                    <input
                      className="vc-input font-mono text-sm"
                      value={undertrialId}
                      onChange={(e) => setUndertrialId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="vc-label">Target Detention Jail Complex</label>
                    <select
                      className="vc-input font-mono text-sm"
                      value={jailName}
                      onChange={(e) => setJailName(e.target.value)}
                    >
                      <option value="Arthur Road Central Prison, Mumbai">Arthur Road Central Prison, Mumbai (MH)</option>
                      <option value="Tihar Central Jail No. 4, New Delhi">Tihar Central Jail No. 4, New Delhi (DL)</option>
                      <option value="Yerawada Central Jail, Pune">Yerawada Central Jail, Pune (MH)</option>
                      <option value="Alipore Central Correctional Home, Kolkata">Alipore Central Correctional Home, Kolkata (WB)</option>
                      <option value="Bangalore Central Prison, Parappana Agrahara">Bangalore Central Prison (KA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="vc-label">Bail Conditions &amp; Bond Amount</label>
                    <input
                      className="vc-input font-mono text-sm"
                      value={bailAmount}
                      onChange={(e) => setBailAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={dispatching}
                  className="w-full py-3 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-court-gold/20 active:scale-[0.99]"
                >
                  {dispatching ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-night-black/40 border-t-night-black rounded-full animate-spin" />
                      <span>Transmitting FASTER Encrypted Token...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Dispatch Encrypted Release Token to Jail Superintendent</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: Jail Superintendent Terminal ───────────────────── */}
        {activeTab === 'warden' && (
          <div className="space-y-6 animate-fade-in">
            <div className="vc-card bg-court-surface/90 border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                    👮
                  </div>
                  <div>
                    <h3 className="font-judicial text-lg text-amber-300 font-bold">
                      Jail Superintendent &amp; Prison Gate Scanner Terminal
                    </h3>
                    <p className="text-xs text-court-text-dim">
                      Simulates the prison warden receiving and verifying cryptographic FASTER tokens for instant prisoner release.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  e-PRISONS RECEPTION
                </span>
              </div>

              {/* Release Token Input */}
              <div className="space-y-2">
                <label className="vc-label">Enter or Paste Cryptographic Release Token</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="vc-input flex-1 font-mono text-sm"
                    value={wardenTokenInput}
                    onChange={(e) => setWardenTokenInput(e.target.value)}
                    placeholder="e.g. FASTER-TOKEN-BOM-2025-884192"
                  />
                  <button
                    onClick={() => handleWardenRelease()}
                    disabled={wardenProcessing || !wardenTokenInput.trim()}
                    className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {wardenProcessing ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-night-black/40 border-t-night-black rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Verify &amp; Authorize Immediate Release</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Warden Result Display */}
              {wardenResult && (
                <div className="animate-slide-up pt-2">
                  {wardenResult.success ? (
                    <div className="p-4 rounded-xl bg-court-green/10 border border-court-green/40 space-y-2">
                      <div className="flex items-center gap-2 text-court-green font-bold text-sm">
                        <span>✅</span>
                        <span>{wardenResult.message}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-court-text-dim pt-2 border-t border-court-green/20">
                        <div>Prisoner: <strong className="text-court-text">{wardenResult.dispatch.prisoner_name}</strong></div>
                        <div>Docket: <strong className="text-court-text">{wardenResult.dispatch.case_number}</strong></div>
                        <div>Jail: <span className="text-court-text">{wardenResult.dispatch.jail_name}</span></div>
                        <div>Status: <span className="text-court-green font-bold">RELEASED (ZERO DELAY)</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 font-mono text-xs">
                      ⚠️ Verification Error: {wardenResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Active Dispatches Live Feed ─────────────────────────── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
            <h3 className="font-judicial text-base font-bold text-court-gold">
              Live FASTER Bail Dispatch Registry
            </h3>
            <span className="text-xs font-mono text-court-text-dim">
              Synchronized with State Prisons Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-court-text-dim border-b border-court-border/40 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Docket No</th>
                  <th className="py-2.5 px-3">Undertrial Prisoner</th>
                  <th className="py-2.5 px-3">Detention Jail</th>
                  <th className="py-2.5 px-3">Bail Conditions</th>
                  <th className="py-2.5 px-3">Release Token</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-border/30">
                {dispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-court-gold/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-court-gold">{d.case_number}</td>
                    <td className="py-2.5 px-3 text-court-text">
                      <div>{d.prisoner_name}</div>
                      <div className="text-[10px] text-court-text-dim">{d.undertrial_id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-court-text-dim max-w-[160px] truncate">{d.jail_name}</td>
                    <td className="py-2.5 px-3 text-court-text-dim text-[11px]">{d.bail_amount}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300">
                      <code>{d.release_token}</code>
                    </td>
                    <td className="py-2.5 px-3">
                      {d.status === 'RELEASED' ? (
                        <span className="px-2 py-0.5 rounded bg-court-green/20 text-court-green font-bold border border-court-green/40 text-[10px]">
                          ✓ RELEASED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                          ⏳ IN TRANSIT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {d.status !== 'RELEASED' && (
                        <button
                          onClick={() => {
                            setWardenTokenInput(d.release_token);
                            setActiveTab('warden');
                            handleWardenRelease(d.release_token);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-night-black font-bold text-[10px] transition-colors"
                        >
                          Scan &amp; Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
