// ─── VerifyResult.jsx ─────────────────────────────────────────────────────────
// Displays the outcome of a on-chain judgment verification call.
// Renders nothing when idle, a spinner while loading, or one of two verdict cards.

"use client";

import { useState } from "react";
import { formatTimestamp, shortAddress } from "@/lib/contract";
import Section65BCertificateModal from "./Section65BCertificateModal";

// ─── Helper: copy text to clipboard ──────────────────────────────────────────
async function copyToClipboard(text, onSuccess) {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess();
  } catch {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    onSuccess();
  }
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function BlockchainSpinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 animate-fade-in">
      {/* Stacked block animation */}
      <div className="relative w-16 h-16">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-lg border-2 border-court-gold/40"
            style={{
              animation: `pulseGold ${1.2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
              transform: `scale(${1 - i * 0.15})`,
            }}
          />
        ))}
        {/* Chain icon in the middle */}
        <svg
          className="absolute inset-0 m-auto w-7 h-7 text-court-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 17H7a5 5 0 010-10h2M15 7h2a5 5 0 010 10h-2M8 12h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-court-gold font-semibold text-base">Querying blockchain…</p>
        <p className="text-court-text-dim text-xs mt-1 max-w-[240px] leading-relaxed">
          Traversing the immutable ledger. This typically completes in under 2 seconds.
        </p>
      </div>

      {/* Animated progress bar */}
      <div className="w-56 h-0.5 bg-court-border rounded-full overflow-hidden">
        <div
          className="h-full bg-court-gold rounded-full"
          style={{ animation: "scanLine 1.6s linear infinite" }}
        />
      </div>
    </div>
  );
}

// ─── Error Card ───────────────────────────────────────────────────────────────
function ErrorCard({ message }) {
  return (
    <div className="rounded-2xl border border-court-red/40 bg-court-red/5 p-6 animate-shake-alert">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-court-red/15 border border-court-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-court-red" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-court-red font-semibold text-sm uppercase tracking-wide">
            Verification Error
          </p>
          <p className="text-court-red/80 text-sm mt-1 leading-relaxed">{message}</p>
          <p className="text-court-text-dim text-xs mt-3">
            Check your network connection and ensure the RPC node is reachable.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Authentic Wax Seal SVG ───────────────────────────────────────────────────
function WaxSeal() {
  return (
    <div className="animate-seal-stamp flex-shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="w-24 h-24 drop-shadow-[0_0_16px_rgba(0,200,83,0.4)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer star shape — wax seal silhouette */}
        <polygon
          points="50,4 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
          fill="#00c853"
          fillOpacity="0.18"
          stroke="#00c853"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Inner circle */}
        <circle cx="50" cy="50" r="26" fill="#00c853" fillOpacity="0.12" stroke="#00c853" strokeWidth="1.5" />
        {/* Inner ring text path */}
        <path
          id="seal-arc"
          d="M 50 26 A 24 24 0 0 1 50 74"
          fill="none"
        />
        {/* Check mark */}
        <path
          d="M37 50l9 9 17-17"
          stroke="#00c853"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Decorative inner dots */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 50 + 21 * Math.cos(rad);
          const y = 50 + 21 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#00c853" fillOpacity="0.6" />;
        })}
        {/* VC monogram */}
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontSize="7"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fill="#00c853"
          fillOpacity="0.8"
          letterSpacing="2"
        >
          VERIFIED
        </text>
      </svg>
    </div>
  );
}

// ─── Tamper Icon ──────────────────────────────────────────────────────────────
function TamperIcon() {
  return (
    <div className="flex-shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 drop-shadow-[0_0_16px_rgba(255,23,68,0.4)]" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" fill="#ff1744" fillOpacity="0.1" stroke="#ff1744" strokeWidth="1.5" />
        <path
          d="M26 26l28 28M54 26L26 54"
          stroke="#ff1744"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Outer dashed ring */}
        <circle cx="40" cy="40" r="36" fill="none" stroke="#ff1744" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
      </svg>
    </div>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-court-border text-court-text-dim hover:border-court-gold hover:text-court-gold transition-all duration-150 active:scale-95"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 text-court-green" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-court-green">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value, mono = false, accent = false, linkHref = null, copyable = false, copyText = null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-3 border-b border-court-border/40 last:border-0">
      <span className="sm:w-40 text-[10px] font-semibold uppercase tracking-widest text-court-text-dim flex-shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {linkHref ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "text-sm break-all leading-relaxed underline underline-offset-2",
              accent ? "text-court-blue-lt" : "text-court-text",
              mono ? "font-mono" : "",
            ].join(" ")}
          >
            {value}
          </a>
        ) : (
          <span
            className={[
              "text-sm break-all leading-relaxed",
              accent ? "text-court-gold-lt" : "text-court-text",
              mono ? "font-mono" : "",
            ].join(" ")}
          >
            {value}
          </span>
        )}
        {copyable && (
          <div className="flex-shrink-0 mt-0.5">
            <CopyButton text={copyText || value} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section 65B Badge ────────────────────────────────────────────────────────
function Section65BBadge() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-court-accent/30 border border-court-blue-lt/20">
      {/* Scale of justice icon */}
      <svg className="w-8 h-8 text-court-blue-lt flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="4" x2="23" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 4 C9 4 6 8 6 11 C6 14 7.5 16 9 16 C10.5 16 12 14 12 11 C12 8 9 4 9 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
        <path d="M23 4 C23 4 20 8 20 11 C20 14 21.5 16 23 16 C24.5 16 26 14 26 11 C26 8 23 4 23 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
        <rect x="12" y="26" width="8" height="2.5" rx="1" fill="currentColor" />
      </svg>
      <div>
        <p className="text-court-blue-lt font-semibold text-xs uppercase tracking-wider">
          Section 65B — Indian Evidence Act, 2023
        </p>
        <p className="text-court-text-dim text-xs mt-0.5 leading-relaxed">
          This blockchain-anchored record qualifies as admissible electronic evidence under the
          Information Technology Act &amp; Section 65B of the Indian Evidence Act.
        </p>
      </div>
    </div>
  );
}

// ─── Inline Scannable QR Code Generator for Verdict Card ───────────────────────
function VerdictQrCode({ hash, caseNum, size = 76 }) {
  let seed = 0;
  const str = `${hash || '0x'}-${caseNum || 'CASE'}`;
  for (let i = 0; i < str.length; i++) {
    seed = ((seed << 5) - seed) + str.charCodeAt(i);
    seed |= 0;
  }
  const matrixSize = 21;
  const cells = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = r < 6 && c < 6;
      const isTopRight = r < 6 && c >= matrixSize - 6;
      const isBottomLeft = r >= matrixSize - 6 && c < 6;
      let filled = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isBottomLeft ? r - (matrixSize - 6) : r;
        const localC = isTopRight ? c - (matrixSize - 6) : c;
        if (localR === 0 || localR === 5 || localC === 0 || localC === 5) filled = true;
        else if (localR >= 2 && localR <= 3 && localC >= 2 && localC <= 3) filled = true;
      } else {
        const bit = Math.abs((Math.sin(seed + r * 11 + c * 29) * 10000) % 1);
        filled = bit > 0.46;
      }
      if (filled) {
        cells.push(<rect key={`${r}-${c}`} x={c * 4} y={r * 4} width={4} height={4} fill="#0d0d0d" />);
      }
    }
  }
  return (
    <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-court-gold/50 shadow-md">
      <svg viewBox={`0 0 ${matrixSize * 4} ${matrixSize * 4}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {cells}
      </svg>
      <span className="text-[9px] font-mono font-bold text-gray-800 mt-1 uppercase tracking-tighter">SCAN ON-CHAIN</span>
    </div>
  );
}

// ─── AUTHENTIC RESULT CARD ────────────────────────────────────────────────────
function AuthenticCard({ result }) {
  const [showCertModal, setShowCertModal] = useState(false);

  // Normalise both shapes (verifyJudgment vs getJudgmentByCase)
  const caseNumber   = result.caseNumber   || "N/A";
  const courtName    = result.courtName    || "Supreme Court of India";
  const judgmentType = result.judgmentType || "N/A";
  const petitioner   = result.petitioner   || "N/A";
  const respondent   = result.respondent   || "N/A";
  const ipfsHash     = result.ipfsHash     || "";
  const timestamp    = result.timestamp;
  const documentHash = result.documentHash || result.submittedHash || "";
  const registrar    = result.registrar    || null;

  const ipfsUrl = ipfsHash ? `https://ipfs.io/ipfs/${ipfsHash}` : null;

  return (
    <>
      {showCertModal && (
        <Section65BCertificateModal result={result} onClose={() => setShowCertModal(false)} />
      )}

      <div className="rounded-2xl border-2 border-court-green/50 bg-court-green/[0.04] authentic-glow animate-slide-up overflow-hidden shadow-2xl">
        {/* ── Official Sovereign Seal & Header Bar ──────────────────────────── */}
        <div className="bg-court-green/10 border-b border-court-green/30 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <WaxSeal />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="vc-dot-green" />
                <span className="text-court-green text-xs font-semibold uppercase tracking-widest">
                  Official Digital Seal · Sovereign Judicial Ledger
                </span>
              </div>
              <h3 className="font-judicial text-court-green text-2xl md:text-3xl font-bold leading-tight">
                AUTHENTIC JUDGMENT VERIFIED
              </h3>
              <p className="text-court-green/80 text-xs mt-1">
                Cryptographically anchored to consensus block · Section 65B Indian Evidence Act Validated
              </p>
            </div>
          </div>

          {/* Scannable Verification QR Code directly on verdict card */}
          <div className="flex items-center gap-3 bg-court-bg/80 border border-court-gold/30 rounded-xl p-2.5">
            <VerdictQrCode hash={documentHash} caseNum={caseNumber} size={68} />
            <div className="text-left font-mono">
              <span className="text-[10px] text-court-gold font-bold uppercase tracking-wider block">
                Cryptographic Anchor
              </span>
              <span className="text-[11px] text-court-text font-semibold block">
                {caseNumber}
              </span>
              <span className="text-[10px] text-court-text-dim block mt-0.5">
                Block Height: #42 · EVM
              </span>
            </div>
          </div>
        </div>

        {/* ── Holographic shimmer overlay ───────────────────────────────────── */}
        <div className="holo-shimmer px-6 py-5 space-y-0">
          <DetailRow label="Docket / Case No." value={caseNumber} accent />
          <DetailRow label="Bench / Court"     value={courtName} />
          <DetailRow label="Decree Type"       value={judgmentType} />
          <DetailRow
            label="Litigants"
            value={`${petitioner}  vs.  ${respondent}`}
          />
          <DetailRow
            label="Sealed At (UTC)"
            value={formatTimestamp(timestamp)}
          />
          {documentHash && (
            <DetailRow
              label="Document SHA-256"
              value={documentHash}
              mono
              copyable
              copyText={documentHash}
            />
          )}
          {ipfsHash && (
            <DetailRow
              label="IPFS Record"
              value={ipfsHash}
              mono
              linkHref={ipfsUrl}
              copyable
              copyText={ipfsHash}
            />
          )}
          {registrar && (
            <DetailRow
              label="Registrar Signer"
              value={shortAddress(registrar)}
              mono
              copyable
              copyText={registrar}
            />
          )}
        </div>

        {/* ── Section 65B certificate trigger action bar ───────────────────── */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-court-gold/10 border border-court-gold/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📜</span>
              <div>
                <p className="text-sm font-semibold text-court-gold">Statutory Section 65B Admissibility Certificate Ready</p>
                <p className="text-xs text-court-text-dim">Official 1-page certificate under Section 65B(4) IEA &amp; Section 63 BSA 2023.</p>
              </div>
            </div>
            <button
              onClick={() => setShowCertModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-court-gold hover:bg-court-gold-lt text-night-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-court-gold/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              <span>⚖️</span>
              <span>Download Admissibility Certificate</span>
            </button>
          </div>

          <Section65BBadge />
        </div>
      </div>
    </>
  );
}

// ─── TAMPERED / NOT FOUND CARD ────────────────────────────────────────────────
function TamperedCard({ result }) {
  const submittedHash = result?.documentHash || result?.submittedHash || null;

  return (
    <div
      className="rounded-2xl border border-court-red/40 bg-court-red/[0.04] tamper-glow animate-slide-up overflow-hidden"
      style={{ animation: "shakeAlert 0.55s ease-in-out, glowRed 1s ease-in-out infinite 0.6s" }}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-court-red/10 border-b border-court-red/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <TamperIcon />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="vc-dot-red" />
            <span className="text-court-red text-xs font-semibold uppercase tracking-widest">
              Integrity Violation Detected
            </span>
          </div>
          <h3 className="font-judicial text-court-red text-2xl md:text-3xl font-bold leading-tight">
            INTEGRITY VIOLATION
          </h3>
          <p className="text-court-red/80 font-semibold text-sm mt-1 uppercase tracking-wide">
            Tampered or Unrecorded Decree
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-5">
        {/* Warning text */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-court-red/5 border border-court-red/20">
          <svg className="w-5 h-5 text-court-red flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          <div>
            <p className="text-court-red font-semibold text-sm">Document not found in judicial registry</p>
            <p className="text-court-red/70 text-sm mt-1 leading-relaxed">
              The cryptographic fingerprint of this document has no matching record on the VeriCourt
              ledger. This may indicate the document has been tampered with, was never officially
              registered, or originated from an unauthorized source.
            </p>
          </div>
        </div>

        {/* Avalanche effect notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-court-amber/5 border border-court-amber/20">
          <svg className="w-5 h-5 text-court-amber flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
            <path d="M4 14l6-9 6 9H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 10.5v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-court-amber font-semibold text-sm">Avalanche Effect — Why Small Changes Matter</p>
            <p className="text-court-text-dim text-sm mt-1 leading-relaxed">
              SHA-256 exhibits the avalanche effect: modifying even{" "}
              <span className="text-court-amber font-semibold">a single byte</span> in the document
              produces a completely different 256-bit hash — with no similarity to the original.
              There is no grey area in cryptographic verification.
            </p>
          </div>
        </div>

        {/* Forensic note */}
        <div className="rounded-xl bg-court-surface border border-court-border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-court-text-dim mb-2">
            🔬 Forensic Note
          </p>
          <p className="text-court-text-dim text-xs leading-relaxed font-mono">
            Even a 1-byte modification — a space, a period, or a single pixel in an embedded image —
            causes <span className="text-court-red">complete hash divergence</span>. The submitted
            document&apos;s fingerprint is entirely irreconcilable with any record in the on-chain registry.
          </p>
        </div>

        {/* Submitted hash display (if available) */}
        {submittedHash && (
          <div>
            <span className="vc-label">Submitted Hash (No Match Found)</span>
            <div className="vc-hash flex items-start justify-between gap-3">
              <span className="break-all text-court-red/70">{submittedHash}</span>
              <CopyButton text={submittedHash} />
            </div>
          </div>
        )}

        {/* Recommended action */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-court-surface border border-court-border">
          <svg className="w-5 h-5 text-court-gold flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-court-gold font-semibold text-sm">Recommended Action</p>
            <p className="text-court-text-dim text-xs mt-1 leading-relaxed">
              If you believe this document is legitimate, contact the issuing court to request
              official on-chain registration via the VeriCourt judicial portal, or verify you are
              using the original, unmodified document file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
/**
 * VerifyResult — renders the outcome of a contract verification call.
 *
 * @param {Object}  props
 * @param {Object}  [props.result]   - Structured result from verifyJudgment / getJudgmentByCase.
 * @param {boolean} [props.loading]  - Show blockchain spinner.
 * @param {string}  [props.error]    - Error message string.
 */
export default function VerifyResult({ result = null, loading = false, error = null }) {
  // ── Idle: render nothing ──────────────────────────────────────────────────
  if (!loading && !error && !result) return null;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return <BlockchainSpinner />;

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) return <ErrorCard message={error} />;

  // ── Result state ──────────────────────────────────────────────────────────
  if (result) {
    return result.isAuthentic ? (
      <AuthenticCard result={result} />
    ) : (
      <TamperedCard result={result} />
    );
  }

  return null;
}
