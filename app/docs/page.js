'use client';

import { useState } from 'react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/health',
    title: 'System Health & Ledger Status',
    desc: 'Returns status of EVM Testnet, SQLite DB, and IPFS storage gateway.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/documents/verify/0x8b32d1a49f5c2e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e39',
    title: 'Verify Document by SHA-256 Hash',
    desc: 'O(1) verification check against both SQLite B-Tree index and EVM smart contract mapping.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/precedents/audit?citation=2024%20INSC%20482',
    title: 'AI Citation Precedent Audit',
    desc: 'Cross-checks citation against the sovereign gazette to intercept ChatGPT/Claude hallucinations.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/gazette?limit=5',
    title: 'Sovereign Judicial Gazette Query',
    desc: 'Paginated list of all court decrees sealed on-chain with Section 65B metadata.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/ipfs/pin',
    title: 'List IPFS Pinned Documents',
    desc: 'Returns all decentralized content-addressed file objects with CIDs.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/multisig/proposals',
    title: 'List Multi-Signature Quorum Decrees',
    desc: 'Retrieves all active constitutional bench proposals awaiting M-of-N judicial co-signatures.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/njdg/sync',
    title: 'NJDG e-Courts Bridge Status',
    desc: 'Returns live synchronization status with the National Judicial Data Grid CIS 3.2 daemon.',
    sampleQuery: '',
  },
  {
    method: 'GET',
    path: '/api/analytics/stats',
    title: 'Forensic Telemetry & Security Metrics',
    desc: 'Returns overall platform integrity metrics, authentic verifications, and blocked tamper probes.',
    sampleQuery: '',
  },
];

export default function DocsPage() {
  const [activeResults, setActiveResults] = useState({});
  const [loading, setLoading] = useState({});

  const handleTestEndpoint = async (ep) => {
    setLoading((prev) => ({ ...prev, [ep.path]: true }));
    try {
      const res = await fetch(ep.path);
      const json = await res.json();
      setActiveResults((prev) => ({ ...prev, [ep.path]: json }));
    } catch (err) {
      setActiveResults((prev) => ({ ...prev, [ep.path]: { error: err.message } }));
    } finally {
      setLoading((prev) => ({ ...prev, [ep.path]: false }));
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 bg-court-bg text-court-text">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-court-border pb-6">
          <div className="inline-flex items-center gap-2 bg-court-gold/10 border border-court-gold/30 rounded-full px-3 py-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-court-gold animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-court-gold uppercase tracking-widest">
              OpenAPI / REST Integration Suite
            </span>
          </div>
          <h1 className="font-judicial text-3xl md:text-4xl text-court-gold font-bold">
            VeriCourt Developer &amp; Court IT Registry API
          </h1>
          <p className="text-court-text-dim text-sm mt-1 max-w-3xl">
            Standardized RESTful interfaces for sovereign court registries, police forensic labs, and legal research software to automate decree verification and Section 65B certificate generation.
          </p>
        </div>

        {/* ── Endpoints Sandbox ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {ENDPOINTS.map((ep) => {
            const result = activeResults[ep.path];
            const isLoading = loading[ep.path];

            return (
              <div key={ep.path} className="vc-card border-court-border bg-court-surface/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-court-green/15 text-court-green border border-court-green/30">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-court-text font-bold break-all">
                      {ep.path}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTestEndpoint(ep)}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-court-gold/15 hover:bg-court-gold text-court-gold hover:text-night-black border border-court-gold/30 text-xs font-mono font-bold transition-all whitespace-nowrap self-start sm:self-auto"
                  >
                    {isLoading ? 'Executing...' : '⚡ Try It Out'}
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-court-text mb-0.5">{ep.title}</h4>
                <p className="text-xs text-court-text-dim mb-3">{ep.desc}</p>

                {/* Response Viewer */}
                {result && (
                  <div className="mt-3 pt-3 border-t border-court-border/40">
                    <span className="text-[10px] font-mono uppercase text-court-gold font-bold block mb-1">
                      Response Payload (200 OK):
                    </span>
                    <pre className="p-3 rounded-lg bg-court-bg border border-court-border text-court-text-dim font-mono text-[11px] overflow-x-auto max-h-56">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
