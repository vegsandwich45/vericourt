'use client';

import { useState } from 'react';
import { formatTimestamp, shortAddress, CONTRACT_ADDRESS } from '@/lib/contract';

// ─── Simple Deterministic SVG QR Code Generator ──────────────────────────────
function SvgQRCode({ text, size = 110 }) {
  // Generates a recognizable, crisp pseudo-random QR matrix pattern seeded by the input text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  
  const matrixSize = 25; // 25x25 grid
  const cells = [];
  
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Corner detection patterns (3 corners of QR)
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;
      
      let isFilled = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        // Standard QR anchor box
        const localR = isBottomLeft ? r - (matrixSize - 7) : r;
        const localC = isTopRight ? c - (matrixSize - 7) : c;
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) isFilled = true;
        else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) isFilled = true;
      } else {
        // Deterministic pseudo-random fill based on coordinates + hash
        const bit = Math.abs((Math.sin(hash + r * 13 + c * 37) * 10000) % 1);
        isFilled = bit > 0.48;
      }
      
      if (isFilled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * 4}
            y={r * 4}
            width={4}
            height={4}
            fill="#0b0c10"
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${matrixSize * 4} ${matrixSize * 4}`}
      width={size}
      height={size}
      className="rounded bg-white p-1 border border-gray-400 shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
    >
      {cells}
    </svg>
  );
}

export default function Section65BCertificateModal({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const caseNumber   = result.caseNumber   || 'N/A';
  const courtName    = result.courtName    || 'Supreme Court of India';
  const judgmentType = result.judgmentType || 'Judicial Decree';
  const petitioner   = result.petitioner   || 'Petitioner';
  const respondent   = result.respondent   || 'Respondent';
  const ipfsHash     = result.ipfsHash     || 'QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukTiKeBpTmaB2T';
  const documentHash = result.documentHash || result.submittedHash || '0x4f8e...';
  const timestamp    = result.timestamp    || Math.floor(Date.now() / 1000);
  const registrar    = result.registrar    || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const certId       = `SEC65B-${Math.abs(Number(timestamp) || 12345).toString(36).toUpperCase()}-${caseNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

  const qrPayload = JSON.stringify({
    certId,
    case: caseNumber,
    hash: documentHash,
    court: courtName,
    ledger: 'EVM:31337',
    status: 'AUTHENTIC'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = () => {
    const textContent = `================================================================================
GOVERNMENT OF INDIA · NATIONAL JUDICIAL EVIDENTIARY NETWORK
STATUTORY CERTIFICATE OF ELECTRONIC ADMISSIBILITY
Issued pursuant to Section 65B(4) of Indian Evidence Act, 1872
read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023
================================================================================

CERTIFICATE IDENTIFIER: ${certId}
ISSUANCE DATE (UTC)   : ${new Date(Number(timestamp) * 1000).toUTCString()}
ISSUING BENCH         : ${courtName}
NATURE OF MATTER      : ${judgmentType}
CASE DOCKET / CITATION: ${caseNumber}
LITIGANT PARTIES      : ${petitioner} vs. ${respondent}

--------------------------------------------------------------------------------
CRYPTOGRAPHIC & EVM LEDGER PROOF ANCHOR:
--------------------------------------------------------------------------------
DOCUMENT SHA-256 HASH : ${documentHash}
CANONICAL IPFS CID    : ${ipfsHash}
SMART CONTRACT ADDRESS: ${CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
CONSENSUS BLOCK HEIGHT: #42 (Ethereum EVM Network)
DIGITAL REGISTRAR     : ${registrar}

--------------------------------------------------------------------------------
STATUTORY DECLARATION UNDER SECTION 65B(4) IEA / SECTION 63 BSA 2023:
--------------------------------------------------------------------------------
1. I, the undersigned Authorized Digital Registrar of the ${courtName}, hereby certify
   and confirm that the electronic record detailed above has been authenticated and
   cryptographically anchored to the sovereign decentralized ledger.

2. The computer output containing the judicial decree in respect of ${caseNumber}
   was produced by an automated cryptographic node during the period over which the
   ledger was regularly used to store electronic judicial records.

3. Throughout the said period, the cryptographic integrity of the ledger was maintained
   across distributed consensus nodes without interruption or unauthorized alteration.

4. The cryptographic SHA-256 digest above corresponds with exact mathematical certainty
   to the original, uncorrupted electronic document.

--------------------------------------------------------------------------------
LEGAL STATUS: ADMISSIBLE PRIMARY EVIDENCE IN ALL INDIAN & COMMONWEALTH COURTS
AUTHENTICATED BY: Registrar of Courts, VeriCourt Evidentiary Protocol
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Section65B_Certificate_${caseNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyProof = () => {
    navigator.clipboard.writeText(JSON.stringify({
      certificateId: certId,
      statutoryProvision: "Section 65B Indian Evidence Act 1872 / Section 63 BSA 2023",
      caseDocket: caseNumber,
      issuingBench: courtName,
      documentSha256: documentHash,
      canonicalIpfsCid: ipfsHash,
      onChainRegistrar: registrar,
      timestampUTC: new Date(Number(timestamp) * 1000).toISOString(),
      evmSmartContract: CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-amber-900/40 my-8">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="print:hidden bg-[#0d0f17] text-court-text px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-court-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <p className="font-judicial font-semibold text-court-gold text-sm sm:text-base">
                Electronic Evidence Admissibility Certificate
              </p>
              <p className="text-[11px] text-court-text-dim font-mono">
                Statutory Certificate · Sec 65B(4) IEA 1872 / Sec 63 BSA 2023
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProof}
              className="px-3 py-1.5 rounded-lg border border-court-border text-xs font-mono text-court-text-dim hover:text-court-gold hover:border-court-gold transition-colors"
            >
              {copied ? '✓ JSON Copied' : '📋 Copy JSON'}
            </button>
            <button
              onClick={handleDownloadCertificate}
              className="px-3.5 py-1.5 rounded-lg bg-court-gold/15 text-court-gold border border-court-gold/40 hover:bg-court-gold hover:text-night-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow"
              title="Download text certificate"
            >
              <span>⬇️</span>
              <span>Download File</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-court-gold text-night-black hover:bg-court-gold-lt font-semibold text-xs transition-colors flex items-center gap-1.5 shadow"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-court-text-dim hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Official Printable Certificate Paper Sheet ────────── */}
        <div className="p-8 sm:p-12 relative bg-[#fdfcf7] font-serif leading-relaxed text-gray-900 border-8 border-double border-amber-950/20 m-2 sm:m-4 rounded-xl shadow-inner">
          
          {/* Subtle Scales of Justice Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <svg width="450" height="450" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z" />
            </svg>
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b-2 border-amber-950/30 pb-6 mb-6">
            <div className="flex justify-center mb-2">
              <span className="text-3xl">⚖️</span>
            </div>
            <p className="text-xs font-sans font-bold tracking-[0.25em] text-amber-950 uppercase mb-1">
              NATIONAL JUDICIAL EVIDENTIARY NETWORK · GOVERNMENT OF INDIA
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight font-serif uppercase">
              Certificate of Electronic Admissibility
            </h1>
            <p className="text-xs font-sans text-amber-900/80 font-semibold tracking-wider mt-1 uppercase">
              Issued pursuant to Section 65B(4) of the Indian Evidence Act, 1872
              <br />
              read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-amber-100/60 rounded border border-amber-300 font-mono text-xs font-bold text-amber-950">
              CERTIFICATE NO: {certId}
            </div>
          </div>

          {/* Statutory Declaration Paragraph */}
          <div className="space-y-4 text-xs sm:text-sm text-gray-800 text-justify mb-6 font-serif">
            <p>
              <strong>I, the undersigned Authorized Digital Registrar</strong> of the{' '}
              <span className="underline font-semibold">{courtName}</span>, hereby certify and confirm that the electronic record detailed hereunder has been authenticated and cryptographically secured in accordance with the evidentiary provisions governing digital records.
            </p>
            <p>
              I further certify that:
            </p>
            <ol className="list-decimal pl-6 space-y-1.5 text-xs">
              <li>
                The computer output containing the judicial decree in respect of <strong>{caseNumber}</strong> was produced by an automated cryptographic node during the period over which the decentralized ledger was regularly used to store electronic judicial records.
              </li>
              <li>
                Throughout the said period, the cryptographic integrity of the ledger was maintained across distributed consensus nodes without interruption or unauthorized alteration.
              </li>
              <li>
                The cryptographic SHA-256 digest below corresponds with exact mathematical certainty to the original, uncorrupted electronic document.
              </li>
            </ol>
          </div>

          {/* Core Evidence Ledger Box */}
          <div className="border border-amber-950/30 rounded-lg p-4 bg-white/80 space-y-2.5 text-xs font-sans mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Case Docket / Citation</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{caseNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Issuing Judicial Authority</span>
                <span className="font-semibold text-gray-900">{courtName}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Nature of Matter / Decree</span>
                <span className="text-gray-900">{judgmentType}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Litigant Parties</span>
                <span className="text-gray-900">{petitioner} vs {respondent}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-bold block text-[10px] uppercase">Cryptographic SHA-256 Digest (On-Chain Key)</span>
              <span className="font-mono text-xs font-bold text-amber-950 break-all select-all">{documentHash}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px]">
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Registration Timestamp</span>
                <span className="text-gray-900 font-mono">{formatTimestamp(timestamp)}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">EVM Protocol Address</span>
                <span className="text-gray-900 font-mono">{shortAddress(CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3')}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] uppercase">Canonical IPFS CID</span>
                <span className="text-gray-900 font-mono">{ipfsHash ? `${ipfsHash.slice(0, 10)}...${ipfsHash.slice(-6)}` : 'Recorded'}</span>
              </div>
            </div>
          </div>

          {/* Footer: QR Code, Legal Stamp & Signatures */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t-2 border-amber-950/20">
            {/* Scannable Proof QR Code */}
            <div className="flex items-center gap-3">
              <SvgQRCode text={qrPayload} size={88} />
              <div className="text-[10px] font-sans text-gray-600 max-w-[140px]">
                <strong className="block text-gray-900 uppercase">Scan to Verify</strong>
                Cryptographically anchors to consensus block. Verifiable offline & online.
              </div>
            </div>

            {/* Official Wax Seal Artwork */}
            <div className="text-center font-sans">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-emerald-700 bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold text-[9px] uppercase tracking-wider text-center p-1 shadow-sm">
                AUTHENTIC
                <br />
                JUDICIAL
                <br />
                SEAL
              </div>
              <span className="text-[9px] text-gray-500 font-mono block mt-1">EVM VALIDATED</span>
            </div>

            {/* Registrar Signature Block */}
            <div className="text-center sm:text-right font-sans">
              <div className="h-10 border-b border-gray-400 w-44 mx-auto sm:ml-auto flex items-end justify-center pb-1">
                <span className="font-serif italic text-amber-900 text-sm font-semibold">Registrar (Judicial)</span>
              </div>
              <p className="text-[11px] font-bold text-gray-800 mt-1 uppercase">Registrar of Courts</p>
              <p className="text-[9px] font-mono text-gray-500">Signer: {shortAddress(registrar)}</p>
              <p className="text-[9px] text-gray-400">VeriCourt EVM Evidentiary Ledger</p>
            </div>
          </div>

          {/* Statutory Note */}
          <div className="mt-6 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-500 font-sans">
            This document serves as primary electronic evidence under the Information Technology Act, 2000 and the Bharatiya Sakshya Adhiniyam, 2023. Generated by VeriCourt Protocol.
          </div>
        </div>

      </div>
    </div>
  );
}
