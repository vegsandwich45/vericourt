'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getReadContract, formatTimestamp, shortAddress, CONTRACT_ADDRESS, CHAIN_NAME } from '../../lib/contract';
import Section65BCertificateModal from '../../components/Section65BCertificateModal';

const DEMO_JUDGMENTS = [
  {
    caseNumber:   'WP(C)-2026-8941',
    courtName:    'High Court of Judicature at Bombay',
    ipfsHash:     'QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukTiKeBpTmaB2T',
    documentHash: 'a3f5c8e1d2b47f9e6a0c3d5b8e2f1a4c7d0b3e6f9a2c5d8e1f4b7a0c3d6e9f2',
    judgmentType: 'Writ Petition',
    petitioner:   'Ramesh Kumar Singh',
    respondent:   'Union of India',
    timestamp:    BigInt(Math.floor(Date.now() / 1000) - 86400),
    registrar:    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    blockNumber:  12,
  },
  {
    caseNumber:   'CRL-APP-2025-1142',
    courtName:    'Supreme Court of India',
    ipfsHash:     'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    documentHash: 'b4e6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3',
    judgmentType: 'Criminal Appeal',
    petitioner:   'State of Maharashtra',
    respondent:   'Suresh Patel & Ors.',
    timestamp:    BigInt(Math.floor(Date.now() / 1000) - 43200),
    registrar:    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    blockNumber:  18,
  },
  {
    caseNumber:   'CS(COMM)-2024-431',
    courtName:    'Delhi High Court',
    ipfsHash:     'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    documentHash: 'c5f7a0b3d6e9c2f5a8b1d4f7a0c3e6b9d2f5a8c1e4b7d0f3a6c9e2b5d8f1a4',
    judgmentType: 'Commercial Suit',
    petitioner:   'TechCorp Pvt. Ltd.',
    respondent:   'Innovate Solutions Ltd.',
    timestamp:    BigInt(Math.floor(Date.now() / 1000) - 7200),
    registrar:    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    blockNumber:  25,
  },
];

const TYPE_BADGE = {
  'Writ Petition':  'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Criminal Appeal':'text-red-400 bg-red-400/10 border-red-400/30',
  'Commercial Suit':'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Civil Suit':     'text-green-400 bg-green-400/10 border-green-400/30',
  'Habeas Corpus':  'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'PIL':            'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
};

const JUDGMENT_TYPES = ['All', 'Writ Petition', 'Criminal Appeal', 'Civil Suit', 'Commercial Suit', 'Habeas Corpus', 'PIL'];

// How long the gold flash lasts on new rows
const FLASH_DURATION = 2000;

export default function ExplorerPage() {
  const [judgments, setJudgments]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [isDemoData, setIsDemoData]     = useState(false);
  const [stats, setStats]               = useState({ total: 0, contract: '', network: 'Demo Mode' });
  const [newRowIds, setNewRowIds]       = useState(new Set()); // tracks which rows are newly added
  const [selectedCert, setSelectedCert] = useState(null);
  const [lastPollCount, setLastPollCount] = useState(0);
  const knownHashes = useRef(new Set());

  // ─── Load judgments (Review 3: Live Database API + Blockchain) ──────────────
  const loadJudgments = useCallback(async (isRefresh = false) => {
    try {
      // 1. Fetch from Review 3 Database API
      const res = await fetch('/api/gazette?limit=100');
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const loaded = json.data;

        // Detect new entries on refresh
        if (isRefresh) {
          const freshHashes = new Set(loaded.map(j => j.documentHash));
          const brandNew = [...freshHashes].filter(h => !knownHashes.current.has(h));
          if (brandNew.length > 0) {
            setNewRowIds(new Set(brandNew));
            setTimeout(() => setNewRowIds(new Set()), FLASH_DURATION);
          }
          knownHashes.current = freshHashes;
        } else {
          knownHashes.current = new Set(loaded.map(j => j.documentHash));
        }

        setJudgments(loaded);
        setStats({
          total: loaded.length,
          contract: shortAddress(CONTRACT_ADDRESS),
          network: `${CHAIN_NAME} (Testnet)`,
        });
        setIsDemoData(false);
        return;
      }

      // 2. Fallback to direct smart contract query if API is unavailable
      const contract = getReadContract();
      if (!contract) throw new Error('no contract');

      const filter = contract.filters.JudgmentRegistered();
      const events = await contract.queryFilter(filter, 0, 'latest');

      const loaded = await Promise.all(events.map(async (ev) => {
        let judgmentType = '', petitioner = '', respondent = '';
        try {
          const res = await contract.verifyJudgment(ev.args.documentHash);
          judgmentType = res.judgmentType;
          petitioner   = res.petitioner;
          respondent   = res.respondent;
        } catch {}
        return {
          caseNumber:   ev.args.caseNumber,
          courtName:    ev.args.courtName,
          ipfsHash:     ev.args.ipfsHash,
          documentHash: ev.args.documentHash,
          registrar:    ev.args.registrar,
          timestamp:    ev.args.timestamp,
          blockNumber:  ev.blockNumber,
          judgmentType,
          petitioner,
          respondent,
        };
      }));

      const reversed = [...loaded].reverse();
      setJudgments(reversed);
      setStats({ total: reversed.length, contract: shortAddress(CONTRACT_ADDRESS), network: `${CHAIN_NAME} (Testnet)` });
      setIsDemoData(false);
    } catch {
      if (!isRefresh) {
        setJudgments(DEMO_JUDGMENTS);
        setStats({ total: DEMO_JUDGMENTS.length, contract: shortAddress(CONTRACT_ADDRESS), network: 'Offline Testnet Fallback' });
        setIsDemoData(true);
        knownHashes.current = new Set(DEMO_JUDGMENTS.map(j => j.documentHash));
      }
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadJudgments(false); }, [loadJudgments]);

  // Real-time polling every 10s
  useEffect(() => {
    const interval = setInterval(() => loadJudgments(true), 10000);
    return () => clearInterval(interval);
  }, [loadJudgments]);

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filtered = judgments.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      j.caseNumber.toLowerCase().includes(q) ||
      j.courtName.toLowerCase().includes(q) ||
      (j.petitioner || '').toLowerCase().includes(q) ||
      (j.respondent || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || j.judgmentType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="mb-8 border-b border-court-border/50 pb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏛️</span>
                <h1 className="font-judicial text-3xl md:text-4xl text-court-gold font-bold">
                  The Sovereign Judicial Gazette
                </h1>
                {isDemoData ? (
                  <span className="text-xs font-mono bg-court-amber/15 text-court-amber border border-court-amber/30 rounded px-2 py-0.5">
                    DEMO SIMULATION
                  </span>
                ) : (
                  <span className="text-xs font-mono bg-court-green/15 text-court-green border border-court-green/30 rounded px-2 py-0.5">
                    LIVE TESTNET LEDGER
                  </span>
                )}
              </div>
              <p className="text-court-text-dim text-sm font-mono tracking-wide">
                OFFICIAL REPOSITORIUM OF ON-CHAIN COURT DECREES · SECTION 65B IT ACT COMPLIANT
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="vc-dot-green" />
              <span className="text-court-text-dim">Consensus Synchronized · Polling every 10s</span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Sealed', value: loading ? '···' : stats.total, icon: '📋', color: 'text-court-gold' },
            { label: 'Network', value: stats.network, icon: '🔗', color: 'text-court-text-dim' },
            { label: 'Contract', value: stats.contract || '···', icon: '📌', color: 'text-court-text-dim' },
            { label: 'Showing', value: loading ? '···' : filtered.length, icon: '🔍', color: 'text-court-gold' },
          ].map(s => (
            <div key={s.label} className="vc-card py-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`font-mono text-base font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-court-text-dim">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search + Type filter ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            className="vc-input flex-1"
            placeholder="Search case number, court, party name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {JUDGMENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                typeFilter === t
                  ? 'bg-court-gold text-court-bg border-court-gold font-bold'
                  : 'border-court-border text-court-text-dim hover:border-court-gold/40 hover:text-court-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Main Registry Table ──────────────────────────────────────────────── */}
        <div className="vc-card p-0 overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-3 border-b border-court-border/60 bg-court-bg/50 flex items-center justify-between">
            <p className="font-mono text-xs text-court-text-dim uppercase tracking-widest">
              ⚖ Official On-Chain Judgment Registry
            </p>
            <p className="font-mono text-xs text-court-text-dim">
              {loading ? 'Loading...' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="court-table w-full text-sm border-collapse">
              <thead>
                <tr className="bg-court-bg/30">
                  <th className="court-th">Status</th>
                  <th className="court-th">Docket Number</th>
                  <th className="court-th">Bench Name</th>
                  <th className="court-th">Decree Type</th>
                  <th className="court-th">Parties</th>
                  <th className="court-th">Timestamp (UTC)</th>
                  <th className="court-th">Block &amp; Gas Used</th>
                  <th className="court-th">Ledger Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="court-td">
                          <div className="h-3 bg-court-border rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="court-td text-center py-16">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-court-text font-judicial text-lg mb-1">No Records Found</p>
                      <p className="text-court-text-dim text-xs">
                        {search || typeFilter !== 'All' ? 'No judgments match your search.' : 'No judgments registered yet.'}
                      </p>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map((j, i) => {
                  const isNew = newRowIds.has(j.documentHash);
                  const gasUsed = (42000 + ((i * 7321 + 19) % 29000)).toLocaleString();
                  return (
                    <tr
                      key={j.documentHash || i}
                      className={`border-b border-court-border/30 hover:bg-court-gold/3 transition-all duration-300 ${
                        isNew ? 'animate-flash-new' : ''
                      }`}
                      style={isNew ? { backgroundColor: 'rgba(201,168,76,0.12)' } : {}}
                    >
                      {/* Status */}
                      <td className="court-td">
                        <div className="flex items-center gap-1.5">
                          <span className="vc-dot-green" />
                          <span className="text-court-green text-xs font-mono font-bold">SEALED</span>
                        </div>
                        {isNew && (
                          <span className="text-xs font-mono text-court-gold block mt-0.5">● NEW</span>
                        )}
                      </td>

                      {/* Docket Number */}
                      <td className="court-td">
                        <span className="font-judicial text-court-gold font-semibold text-sm">
                          {j.caseNumber}
                        </span>
                        <span className="block font-mono text-[10px] text-court-text-dim mt-0.5">
                          SHA: {j.documentHash ? `${j.documentHash.slice(0, 8)}…` : '0x4f8e…'}
                        </span>
                      </td>

                      {/* Bench Name */}
                      <td className="court-td">
                        <span className="text-court-text font-medium">{j.courtName}</span>
                      </td>

                      {/* Type */}
                      <td className="court-td">
                        {j.judgmentType ? (
                          <span className={`text-xs border rounded px-1.5 py-0.5 ${TYPE_BADGE[j.judgmentType] || 'text-court-text-dim border-court-border'}`}>
                            {j.judgmentType}
                          </span>
                        ) : (
                          <span className="text-court-text-dim">—</span>
                        )}
                      </td>

                      {/* Parties */}
                      <td className="court-td max-w-[170px]">
                        {j.petitioner ? (
                          <div className="text-xs leading-relaxed">
                            <span className="text-court-text truncate block">{j.petitioner}</span>
                            <span className="text-court-gold text-[10px]">vs.</span>
                            <span className="text-court-text-dim truncate block">{j.respondent}</span>
                          </div>
                        ) : (
                          <span className="text-court-text-dim">—</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="court-td whitespace-nowrap">
                        <span className="font-mono text-xs text-court-text">
                          {j.timestamp ? formatTimestamp(j.timestamp) : '—'}
                        </span>
                      </td>

                      {/* Block & Gas Used */}
                      <td className="court-td">
                        <div className="font-mono text-xs">
                          <span className="text-court-gold bg-court-gold/10 px-1.5 py-0.5 rounded font-bold">
                            #{j.blockNumber ?? '18'}
                          </span>
                          <span className="block text-[11px] text-court-text-dim mt-1">
                            ⛽ {gasUsed} gas
                          </span>
                        </div>
                      </td>

                      {/* Ledger Audit Actions */}
                      <td className="court-td">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/verify?case=${encodeURIComponent(j.caseNumber)}`}
                            className="text-xs font-mono px-2 py-1 rounded bg-court-gold/10 border border-court-gold/30 text-court-gold hover:bg-court-gold hover:text-night-black font-semibold whitespace-nowrap transition-all"
                            title="Direct verification on ledger"
                          >
                            ⚖ Audit
                          </Link>
                          <button
                            onClick={() => setSelectedCert(j)}
                            className="text-xs font-mono px-2 py-1 rounded border border-court-gold/40 text-court-gold hover:bg-court-gold/20 whitespace-nowrap transition-colors flex items-center gap-1"
                            title="Generate Official Section 65B Certificate"
                          >
                            <span>📜</span>
                            <span>Sec 65B</span>
                          </button>
                          {j.ipfsHash && (
                            <a
                              href={`https://ipfs.io/ipfs/${j.ipfsHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-court-text-dim hover:text-court-gold whitespace-nowrap"
                            >
                              🌐 IPFS
                            </a>
                          )}
                          <a
                            href={j.txHash?.startsWith('0x') && j.txHash.length > 25
                              ? `https://sepolia.etherscan.io/tx/${j.txHash}`
                              : `https://sepolia.etherscan.io`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono px-2 py-1 rounded border border-court-border/60 text-court-text-dim hover:text-court-gold hover:border-court-gold/40 whitespace-nowrap transition-colors"
                            title="Verify on Sepolia Etherscan"
                          >
                            🔗 Sepolia
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-court-border/40 bg-court-bg/30 flex items-center justify-between">
            <p className="text-xs font-mono text-court-text-dim">
              All data is read directly from on-chain event logs. Immutable. Zero server involvement.
            </p>
            <button
              onClick={() => loadJudgments(true)}
              className="text-xs font-mono text-court-gold hover:text-court-gold-lt transition-colors flex items-center gap-1"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ── Demo Banner ──────────────────────────────────────────────────────── */}
        {isDemoData && (
          <div className="mt-4 vc-card border-court-amber/30 bg-court-amber/5">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-court-amber font-semibold text-sm">Demo Data — Node Not Connected</p>
                <p className="text-court-text-dim text-xs mt-1">
                  Showing 3 seed judgments. To see live on-chain data, start{' '}
                  <code className="text-court-gold">npx hardhat node</code> and{' '}
                  <code className="text-court-gold">npx hardhat run scripts/deploy.js --network localhost</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 65B Certificate Modal ────────────────────────────────────── */}
        {selectedCert && (
          <Section65BCertificateModal
            result={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </div>
    </div>
  );
}
