'use client';

import { formatTimestamp } from '../lib/contract';

/**
 * CaseTimeline — renders a vertical timeline of on-chain JudgmentRegistered events.
 * Props:
 *   events: Array<{
 *     caseNumber, courtName, judgmentType, timestamp, blockNumber, registrar, ipfsHash
 *   }>
 */
export default function CaseTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 vc-card">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-court-text font-judicial text-lg mb-1">No Events Found</p>
        <p className="text-court-text-dim text-sm">
          No JudgmentRegistered events were detected on this network.
        </p>
      </div>
    );
  }

  const typeColors = {
    'Writ Petition':  'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'Criminal Appeal':'bg-red-500/15 text-red-400 border-red-500/30',
    'Commercial Suit':'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Civil Suit':     'bg-green-500/15 text-green-400 border-green-500/30',
    'Habeas Corpus':  'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'PIL':            'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="relative">
      {/* Vertical gold line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-court-gold/60 via-court-gold/20 to-transparent" />

      <div className="space-y-6 pl-12">
        {events.map((ev, i) => (
          <div
            key={ev.documentHash || i}
            className="relative animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            {/* Timeline dot */}
            <div className="absolute -left-[2.35rem] top-3 w-4 h-4 rounded-full border-2 border-court-gold bg-court-bg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-court-gold" />
            </div>

            {/* Card */}
            <div className="vc-card hover:border-court-gold/30 transition-all duration-200 group">
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs bg-court-gold/10 border border-court-gold/20 text-court-gold rounded px-2 py-0.5">
                  Block #{ev.blockNumber ?? '—'}
                </span>
                {ev.judgmentType && (
                  <span className={`text-xs border rounded px-2 py-0.5 ${typeColors[ev.judgmentType] || 'text-court-text-dim border-court-border bg-court-bg'}`}>
                    {ev.judgmentType}
                  </span>
                )}
                <span className="ml-auto text-xs font-mono text-court-text-dim">
                  {ev.timestamp ? formatTimestamp(ev.timestamp) : '—'}
                </span>
              </div>

              {/* Case number */}
              <h3 className="font-judicial text-court-gold text-base mb-0.5">{ev.caseNumber}</h3>
              <p className="text-court-text text-sm mb-2">{ev.courtName}</p>

              {/* Footer row */}
              <div className="flex items-center gap-4 pt-2 border-t border-court-border/40 text-xs font-mono text-court-text-dim">
                {ev.registrar && (
                  <span title={ev.registrar}>
                    👤 {ev.registrar.slice(0, 6)}…{ev.registrar.slice(-4)}
                  </span>
                )}
                {ev.ipfsHash && (
                  <a
                    href={`https://ipfs.io/ipfs/${ev.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-court-gold transition-colors"
                  >
                    🌐 IPFS ↗
                  </a>
                )}
                <span className="ml-auto flex items-center gap-1">
                  <span className="vc-dot-green" />
                  Verified on-chain
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
