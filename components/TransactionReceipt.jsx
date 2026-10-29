'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortAddress(str, head = 10, tail = 8) {
  if (!str || str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

function formatTimestamp(iso) {
  if (!iso) return 'N/A';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

function formatGas(gas) {
  if (!gas || gas === 'N/A') return 'N/A';
  const n = BigInt(gas);
  return n.toLocaleString('en-IN');
}

// ─── Copyable field ───────────────────────────────────────────────────────────
function CopyableValue({ value, display, mono = true }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <span className="inline-flex items-center gap-2 group">
      <span className={mono ? 'font-mono' : ''}>{display ?? value}</span>
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label="Copy"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10px] px-1.5 py-0.5 rounded border border-court-gold/30 text-court-gold hover:bg-court-gold/10 transition-all duration-150"
      >
        {copied ? '✓' : '⧉'}
      </button>
    </span>
  );
}

// ─── Single row in the receipt table ─────────────────────────────────────────
function ReceiptRow({ label, children }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3 py-3 border-b border-court-gold/10 last:border-0 items-start">
      <dt className="text-parchment/45 text-[11px] font-semibold uppercase tracking-widest pt-0.5">{label}</dt>
      <dd className="text-parchment text-sm break-all leading-relaxed">{children}</dd>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * @param {{ receipt: {
 *   hash: string,
 *   blockNumber: number,
 *   gasUsed: string,
 *   timestamp: string,
 *   caseNumber: string,
 *   ipfsCid?: string | null,
 * }}} props
 */
export default function TransactionReceipt({ receipt }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Mount animation: slide-in + glow
  useEffect(() => {
    if (!receipt) return;
    // Small delay so the transition fires
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [receipt]);

  if (!receipt) return null;

  const {
    hash,
    blockNumber,
    gasUsed,
    timestamp,
    caseNumber,
    ipfsCid,
  } = receipt;

  const ipfsGatewayUrl = ipfsCid
    ? `https://ipfs.io/ipfs/${ipfsCid}`
    : null;

  return (
    <div
      ref={containerRef}
      className={`
        relative overflow-hidden rounded-xl border
        transition-all duration-700 ease-out
        ${visible
          ? 'opacity-100 translate-y-0 border-emerald-500/50 shadow-2xl shadow-emerald-500/10'
          : 'opacity-0 translate-y-6 border-transparent shadow-none'
        }
        bg-gradient-to-br from-night-black via-emerald-950/20 to-night-black
      `}
      aria-live="polite"
      aria-label="Transaction receipt"
    >
      {/* ── Green glow ring (decorative) ──────────────────────────────── */}
      <div
        className={`
          pointer-events-none absolute inset-0 rounded-xl
          transition-opacity duration-1000
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          boxShadow: 'inset 0 0 40px -8px rgba(52,211,153,0.08)',
        }}
      />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-emerald-500/20 bg-emerald-900/15">
        {/* Animated checkmark circle */}
        <div
          className={`
            flex-shrink-0 w-11 h-11 rounded-full
            bg-emerald-500/20 border-2 border-emerald-400/60
            flex items-center justify-center
            transition-all duration-500 delay-200
            ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
          `}
        >
          <svg
            className="w-5 h-5 text-emerald-400"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 10 8 14 16 6" />
          </svg>
        </div>

        <div>
          <h2 className="font-judicial text-emerald-300 text-xl tracking-wide">
            Transaction Sealed on Ledger
          </h2>
          <p className="text-emerald-500/70 text-xs mt-0.5">
            Judgment permanently recorded on the blockchain
          </p>
        </div>

        {/* Live pulse dot */}
        <div className="ml-auto flex-shrink-0 hidden sm:flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-500/60 text-[10px] ml-2">Confirmed</span>
        </div>
      </div>

      {/* ── Data rows ─────────────────────────────────────────────────── */}
      <dl className="px-6 py-2">
        {/* Transaction hash */}
        <ReceiptRow label="Transaction Hash">
          {hash ? (
            <CopyableValue
              value={hash}
              display={shortAddress(hash, 12, 10)}
            />
          ) : (
            <span className="text-parchment/40">N/A</span>
          )}
        </ReceiptRow>

        {/* Block number */}
        <ReceiptRow label="Block Number">
          {blockNumber != null ? (
            <span className="font-mono text-court-gold">#{blockNumber.toLocaleString('en-IN')}</span>
          ) : (
            <span className="text-parchment/40">N/A</span>
          )}
        </ReceiptRow>

        {/* Gas consumed */}
        <ReceiptRow label="Gas Consumed">
          <span className="font-mono">{formatGas(gasUsed)}</span>
          <span className="text-parchment/35 text-xs ml-2">units</span>
        </ReceiptRow>

        {/* Case number */}
        <ReceiptRow label="Case Docket">
          <CopyableValue
            value={caseNumber}
            display={
              <span className="bg-court-gold/10 border border-court-gold/30 text-court-gold px-2 py-0.5 rounded text-xs">
                {caseNumber}
              </span>
            }
            mono={false}
          />
        </ReceiptRow>

        {/* Timestamp */}
        <ReceiptRow label="Sealed At">
          <span className="tabular-nums">{formatTimestamp(timestamp)}</span>
        </ReceiptRow>

        {/* IPFS link */}
        {ipfsGatewayUrl && (
          <ReceiptRow label="IPFS Document">
            <div className="flex flex-col gap-1">
              <CopyableValue
                value={ipfsCid}
                display={shortAddress(ipfsCid, 16, 8)}
              />
              <a
                href={ipfsGatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2 transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                View on IPFS Gateway
              </a>
            </div>
          </ReceiptRow>
        )}
      </dl>

      {/* ── Footer actions ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-5 border-t border-emerald-500/20 bg-emerald-900/10">
        {/* View on explorer */}
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 bg-court-gold hover:bg-amber-400 text-night-black font-bold text-sm px-4 py-2 rounded-md transition-all duration-150 shadow-md shadow-court-gold/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
          </svg>
          View on Explorer
        </Link>

        {/* Print / save */}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-parchment/20 hover:border-parchment/40 text-parchment/60 hover:text-parchment text-sm px-4 py-2 rounded-md transition-all duration-150"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9H5v-2h1v2zm9 0h-1v-2h1v2zm-2 2H7v-2h6v2z" clipRule="evenodd" />
          </svg>
          Print Receipt
        </button>

        {/* Info note */}
        <p className="ml-auto text-parchment/25 text-[10px] hidden md:block">
          Keep this receipt for your records.
        </p>
      </div>

      {/* ── Watermark ──────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute bottom-4 right-4 text-[80px] leading-none select-none opacity-[0.025] font-judicial text-emerald-300"
        aria-hidden="true"
      >
        ⚖
      </div>
    </div>
  );
}
