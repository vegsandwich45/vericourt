'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MultiSigPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [alert, setAlert] = useState(null);

  // New proposal form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    proposalTitle: '',
    caseNumber: '',
    courtName: 'Supreme Court of India (Constitution Bench)',
    judgmentType: 'Constitutional Bench',
    petitioner: '',
    respondent: '',
    documentHash: '',
  });

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/multisig/proposals');
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleApprove = async (proposalId) => {
    setActingId(proposalId);
    setAlert(null);
    try {
      const res = await fetch('/api/multisig/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          approverAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          approverName: 'Adv. Sunita Deshmukh (Chief Appellate Clerk)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: data.message,
        });
        await fetchProposals();
      } else {
        setAlert({ type: 'error', message: data.error || 'Approval failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActingId(null);
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!form.proposalTitle || !form.caseNumber) return;

    try {
      const randomHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const res = await fetch('/api/multisig/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          documentHash: form.documentHash || randomHash,
          requiredSignatures: 2,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'New Multi-Signature proposal initiated successfully!' });
        setShowForm(false);
        setForm({
          proposalTitle: '',
          caseNumber: '',
          courtName: 'Supreme Court of India (Constitution Bench)',
          judgmentType: 'Constitutional Bench',
          petitioner: '',
          respondent: '',
          documentHash: '',
        });
        await fetchProposals();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 bg-court-bg text-court-text">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-court-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                100% Phase · Quorum Consensus Engine
              </span>
            </div>
            <h1 className="font-judicial text-3xl md:text-4xl text-court-gold font-bold">
              Multi-Signature Judicial Quorum Bench
            </h1>
            <p className="text-court-text-dim text-sm mt-1 max-w-3xl">
              Constitutional and high-stakes decrees cannot be sealed by a single clerk. They require an M-of-N quorum (Hon&apos;ble Presiding Judge + Registrar Judicial co-signatures) before being committed to the immutable blockchain.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-lg bg-court-gold hover:bg-court-gold-lt text-night-black font-bold text-xs uppercase tracking-wider transition-all self-start md:self-auto shadow-lg shadow-court-gold/20"
          >
            {showForm ? '✕ Close Proposal Form' : '➕ Propose New Quorum Decree'}
          </button>
        </div>

        {/* Alert Notification */}
        {alert && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-slide-up ${
            alert.type === 'success'
              ? 'bg-court-green/10 border-court-green/40 text-court-green'
              : 'bg-court-red/10 border-court-red/40 text-court-red'
          }`}>
            <span className="text-sm font-medium">{alert.message}</span>
            <button onClick={() => setAlert(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── New Proposal Form Modal / Collapse ───────────────────────────── */}
        {showForm && (
          <form onSubmit={handleCreateProposal} className="vc-card border-court-gold/30 bg-court-surface/90 space-y-4 animate-slide-up">
            <h3 className="font-judicial text-lg text-court-gold font-bold">
              Initiate Multi-Signature Proposal (Requires 2 Judicial Co-Signatures)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="vc-label">Proposal Title</label>
                <input
                  className="vc-input"
                  placeholder="e.g. Constitutional Bench: Inter-State River Water Dispute"
                  value={form.proposalTitle}
                  onChange={(e) => setForm({ ...form, proposalTitle: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="vc-label">Case Docket Number</label>
                <input
                  className="vc-input font-mono"
                  placeholder="e.g. WP(C)-2026-9055"
                  value={form.caseNumber}
                  onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="vc-label">Petitioner Party</label>
                <input
                  className="vc-input"
                  placeholder="Petitioner Name"
                  value={form.petitioner}
                  onChange={(e) => setForm({ ...form, petitioner: e.target.value })}
                />
              </div>
              <div>
                <label className="vc-label">Respondent Party</label>
                <input
                  className="vc-input"
                  placeholder="Respondent Name"
                  value={form.respondent}
                  onChange={(e) => setForm({ ...form, respondent: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="vc-btn-primary px-6 py-2.5 text-xs">
              ⚖ Submit for Multi-Signatory Judicial Quorum
            </button>
          </form>
        )}

        {/* ── Proposals List ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-court-text-dim">
              Active Quorum Proposals ({proposals.length})
            </h2>
            <span className="text-xs font-mono text-court-text-dim">Consensus Rule: 2 / 2 Required</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-court-text-dim font-mono text-sm">
              Loading Multi-Signature Quorum Registry...
            </div>
          ) : proposals.length === 0 ? (
            <div className="vc-card text-center py-12 text-court-text-dim">
              No pending multi-signature proposals found.
            </div>
          ) : (
            proposals.map((p) => {
              const isApproved = p.status === 'APPROVED' || p.current_signatures >= p.required_signatures;
              const hasSecondSigned = p.approvals?.some((a) => a.approver_address === '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

              return (
                <div key={p.id} className={`vc-card border transition-all ${
                  isApproved ? 'border-court-green/40 bg-court-green/[0.02]' : 'border-court-border bg-court-surface/80'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isApproved
                            ? 'bg-court-green/15 text-court-green border-court-green/30'
                            : 'bg-court-amber/15 text-court-amber border-court-amber/30'
                        }`}>
                          {isApproved ? 'QUORUM ACHIEVED · SEALED ON-CHAIN' : 'PENDING 2ND CO-SIGNATURE'}
                        </span>
                        <span className="text-xs font-mono text-court-gold font-bold">{p.case_number}</span>
                        <span className="text-xs text-court-text-dim">· {p.judgment_type}</span>
                      </div>

                      <h3 className="font-judicial text-lg font-bold text-court-text">{p.proposal_title}</h3>

                      <p className="text-xs text-court-text-dim font-mono">
                        Parties: <span className="text-court-text">{p.petitioner || 'Petitioner'}</span> vs <span className="text-court-text">{p.respondent || 'Respondent'}</span>
                      </p>

                      <div className="pt-2">
                        <span className="text-[11px] font-mono text-court-text-dim block mb-1">
                          Quorum Signatures Progress: {p.current_signatures} / {p.required_signatures}
                        </span>
                        <div className="w-full bg-court-bg rounded-full h-2.5 overflow-hidden border border-court-border">
                          <div
                            className={`h-full transition-all duration-500 ${isApproved ? 'bg-court-green' : 'bg-court-gold'}`}
                            style={{ width: `${(p.current_signatures / p.required_signatures) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Approval signatures list */}
                      <div className="pt-3 space-y-1.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-court-text-dim">Recorded Digital Signatures:</p>
                        {p.approvals?.map((a, idx) => (
                          <div key={a.id || idx} className="flex items-center gap-2 text-xs font-mono bg-court-bg/60 p-2 rounded border border-court-border/40">
                            <span className="text-court-green">✓</span>
                            <span className="text-court-gold font-semibold">{a.approver_name}</span>
                            <span className="text-court-text-dim text-[11px]">({a.approver_address.slice(0, 8)}...{a.approver_address.slice(-6)})</span>
                            <span className="ml-auto text-[10px] text-court-text-dim">{new Date(a.approved_at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Column */}
                    <div className="md:w-64 flex flex-col justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-court-border md:pl-6">
                      <div className="text-left font-mono text-xs space-y-1">
                        <span className="text-court-text-dim block text-[10px] uppercase">SHA-256 Fingerprint:</span>
                        <span className="break-all text-[11px] text-court-gold-lt">{p.document_hash.slice(0, 18)}...</span>
                        <span className="text-court-text-dim block text-[10px] uppercase pt-2">Canonical IPFS CID:</span>
                        <span className="break-all text-[11px] text-court-text-dim">{p.ipfs_cid.slice(0, 18)}...</span>
                      </div>

                      {isApproved ? (
                        <div className="p-3 bg-court-green/10 rounded-lg border border-court-green/30 text-center">
                          <span className="text-xs font-mono text-court-green font-bold block">✓ Decree Finalized</span>
                          <Link href="/explorer" className="text-[11px] text-court-gold underline hover:text-court-gold-lt mt-1 inline-block">
                            View in Sovereign Gazette →
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actingId === p.id || hasSecondSigned}
                          className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actingId === p.id ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            '✍ Co-Sign as 2nd Registrar'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
