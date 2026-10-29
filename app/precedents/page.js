'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrecedentsGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch('/api/precedents/graph');
        const data = await res.json();
        if (data.success && data.graph) {
          setNodes(data.graph.nodes);
          setLinks(data.graph.links);
          setSelectedNode(data.graph.nodes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  const filteredNodes = nodes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.ratio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1 mb-2">
              <span className="text-xs">🕸️</span>
              <span className="text-[11px] font-mono text-purple-300 uppercase font-bold tracking-widest">
                CONSTITUTIONAL JURISPRUDENCE · CITATION LINEAGE
              </span>
            </div>
            <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
              Interactive Precedent Lineage &amp; Citation Graph
            </h1>
            <p className="text-xs sm:text-sm text-court-text-dim mt-1 max-w-3xl leading-relaxed">
              Explore the mathematical lineage of Supreme Court landmark authorities. Trace how constitutional ratios 
              flow from <em>Kesavananda Bharati</em> through <em>Puttaswamy</em> to present-day electronic evidence decrees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search precedent or doctrine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 rounded-lg bg-court-surface border border-court-border text-xs font-mono text-court-text placeholder-court-text-dim/60 focus:outline-none focus:border-court-gold w-64"
            />
          </div>
        </div>

        {/* ── Main Graph & Inspector Grid ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Visual Node-Link Canvas */}
          <div className="lg:col-span-2 vc-card bg-court-surface/90 border-court-border min-h-[520px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-court-text-dim">
                <span className="w-2 h-2 rounded-full bg-court-gold" />
                <span>Constitutional Node Canvas</span>
              </div>
              <span className="text-[10px] font-mono text-court-gold bg-court-gold/10 px-2 py-0.5 rounded border border-court-gold/30">
                Click any node to inspect ratio decidendi
              </span>
            </div>

            {/* Interactive Precedent Node Matrix */}
            <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                const isHallucinated = n.status === 'HALLUCINATED_ALERT';

                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-4 rounded-xl text-left border transition-all duration-200 relative group ${
                      isSelected
                        ? 'border-court-gold bg-court-gold/10 shadow-lg shadow-court-gold/15'
                        : isHallucinated
                        ? 'border-red-500/40 bg-red-950/20 hover:border-red-500'
                        : 'border-court-border/70 bg-court-bg/70 hover:border-court-gold/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-court-surface border border-court-border text-court-gold font-bold">
                        {n.year} · {n.citation}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          isHallucinated
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {n.status}
                      </span>
                    </div>

                    <h4 className="font-judicial font-bold text-sm text-court-text mt-2 group-hover:text-court-gold transition-colors">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-court-text-dim mt-1 font-mono">
                      {n.bench}
                    </p>
                    <p className="text-xs text-court-text-dim mt-2 line-clamp-2 leading-relaxed">
                      {n.ratio}
                    </p>

                    <div className="mt-3 pt-2 border-t border-court-border/40 flex items-center justify-between text-[10px] font-mono text-court-text-dim">
                      <span>EVM Block: #{n.blockNumber}</span>
                      <span className="text-court-gold group-hover:underline">Inspect →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Links / Citation Flow Bar */}
            <div className="pt-4 border-t border-court-border/60">
              <p className="text-[11px] font-mono text-court-text-dim uppercase tracking-wider mb-2">
                Active Precedent Citations &amp; Doctrine Flow:
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {links.slice(0, 4).map((l, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-court-bg border border-court-border text-court-text-dim flex items-center gap-1.5">
                    <span className="text-court-gold font-bold">{l.source}</span>
                    <span>→</span>
                    <span className="text-court-text">{l.target}</span>
                    <span className="text-court-gold/80 italic">({l.relationship})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Detailed Precedent Inspector */}
          <div className="vc-card bg-court-surface/90 border-court-gold/30 space-y-4">
            <div className="border-b border-court-border/60 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-court-gold font-bold">
                Precedent Ratio Inspector
              </span>
              <h3 className="font-judicial text-xl font-bold text-court-gold mt-1">
                {selectedNode ? selectedNode.title : 'Select a Precedent'}
              </h3>
              <p className="text-xs font-mono text-court-text-dim mt-0.5">
                {selectedNode?.citation} · {selectedNode?.bench}
              </p>
            </div>

            {selectedNode && (
              <div className="space-y-4 text-xs">
                {/* Ratio Decidendi Box */}
                <div className="p-3 bg-court-bg rounded-xl border border-court-border space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-court-gold font-semibold">
                    Core Judicial Ratio (Binding Law):
                  </p>
                  <p className="text-court-text leading-relaxed text-xs">
                    &ldquo;{selectedNode.ratio}&rdquo;
                  </p>
                </div>

                {/* On-Chain Cryptographic Anchor */}
                <div className="p-3 bg-court-bg rounded-xl border border-court-border space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-court-text-dim">
                    <span>EVM Consensual Block:</span>
                    <span className="text-court-gold font-bold">Block #{selectedNode.blockNumber}</span>
                  </div>
                  <div className="pt-1 text-[10px] text-court-text-dim">
                    State Seal Anchor:
                  </div>
                  <div className="p-1.5 bg-black/40 rounded border border-court-border/60 break-all text-court-gold text-[10px]">
                    {selectedNode.evmStateSeal}
                  </div>
                </div>

                {/* Status Advisory Card */}
                {selectedNode.status === 'HALLUCINATED_ALERT' ? (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>🚨</span>
                      <span>Fabricated AI Citation Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-300/80">
                      This citation is synthetic and does not exist in any physical law report or sovereign smart contract. Citing this before a bench carries professional sanction liabilities under the Advocates Act.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>✓</span>
                      <span>Binding Constitutional Precedent</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-300/80">
                      Anchored to sovereign EVM consensus. Non-repudiable under Article 141 of the Constitution of India (Law declared by Supreme Court to be binding on all courts).
                    </p>
                  </div>
                )}

                {/* Quick Audit Action */}
                <div className="pt-2">
                  <Link
                    href={`/verify?citation=${encodeURIComponent(selectedNode.citation)}`}
                    className="w-full py-2.5 rounded-lg bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>🛡️</span>
                    <span>Audit Citation on Verification Bench</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer Navigation ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-court-border text-xs text-court-text-dim font-mono">
          <Link href="/explorer" className="hover:text-court-gold">
            ← Sovereign Gazette
          </Link>
          <Link href="/verify" className="hover:text-court-gold">
            AI Citation Guard →
          </Link>
        </div>

      </div>
    </div>
  );
}
