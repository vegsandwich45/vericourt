// ─── DropZone.jsx ─────────────────────────────────────────────────────────────
// Drag-and-drop file acceptance zone with court-themed visual states.
// Accepts PDF and common document formats. Calls onFileAccepted(file) on drop.

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// ── Accepted MIME types ───────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

// ── File size formatter ───────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ── MIME → display label ──────────────────────────────────────────────────────
function mimeLabel(type) {
  const map = {
    "application/pdf": "PDF Document",
    "application/msword": "Word Document (.doc)",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document (.docx)",
    "text/plain": "Plain Text",
    "image/png": "PNG Image",
    "image/jpeg": "JPEG Image",
  };
  return map[type] || type;
}

// ── Upload icon SVG ───────────────────────────────────────────────────────────
function UploadIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Arrow up */}
      <path
        d="M32 42V22M22 32l10-10 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Document outline */}
      <path
        d="M18 50h28a4 4 0 004-4V30l-10-14H18a4 4 0 00-4 4v26a4 4 0 004 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M40 16v10h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── PDF icon SVG ──────────────────────────────────────────────────────────────
function PdfIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8h24l12 12v36H14z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M38 8v12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="28" width="32" height="18" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <text x="14" y="41" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="monospace">PDF</text>
    </svg>
  );
}

// ── Check circle SVG ──────────────────────────────────────────────────────────
function CheckIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Rejected X icon ───────────────────────────────────────────────────────────
function XCircleIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main DropZone Component ──────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {Function} props.onFileAccepted  - Called with the accepted File object.
 * @param {boolean}  [props.disabled]      - Disable the dropzone.
 * @param {File}     [props.currentFile]   - Externally controlled current file.
 */
export default function DropZone({ onFileAccepted, onFileDrop, disabled = false, currentFile = null }) {
  const [rejectedReason, setRejectedReason] = useState(null);
  const handleAccepted = onFileAccepted || onFileDrop;

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setRejectedReason(null);

      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === "file-too-large") {
          setRejectedReason("File exceeds 50 MB limit.");
        } else if (err.code === "file-invalid-type") {
          setRejectedReason("Unsupported file type. Please upload a PDF or document.");
        } else {
          setRejectedReason(err.message || "File rejected.");
        }
        return;
      }

      if (acceptedFiles.length > 0 && handleAccepted) {
        handleAccepted(acceptedFiles[0]);
      }
    },
    [handleAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50 MB
    disabled,
    multiple: false,
  });

  // ── Derive visual state ─────────────────────────────────────────────────────
  const isAccepted = !!currentFile;
  const state = isDragReject || rejectedReason
    ? "rejected"
    : isDragActive
    ? "hover"
    : isAccepted
    ? "accepted"
    : "idle";

  // ── State-driven style maps ─────────────────────────────────────────────────
  const containerStyles = {
    idle:     "border-court-border hover:border-court-gold/50 hover:bg-court-gold/[0.02]",
    hover:    "border-court-gold bg-court-gold/5 shadow-[0_0_30px_rgba(201,168,76,0.15)]",
    accepted: "border-court-green/60 bg-court-green/[0.03]",
    rejected: "border-court-red/60 bg-court-red/[0.03]",
  };

  const iconColor = {
    idle:     "text-court-text-dim",
    hover:    "text-court-gold animate-float",
    accepted: "text-court-green",
    rejected: "text-court-red",
  };

  return (
    <div className="space-y-3">
      {/* ── Drop area ──────────────────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={[
          "relative border-2 border-dashed rounded-2xl p-8 md:p-12",
          "cursor-pointer transition-all duration-300 ease-out",
          "flex flex-col items-center justify-center text-center min-h-[220px]",
          "outline-none focus-visible:ring-2 focus-visible:ring-court-gold focus-visible:ring-offset-1 focus-visible:ring-offset-court-bg",
          containerStyles[state],
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        {/* Animated background glow for hover state */}
        {state === "hover" && (
          <div className="absolute inset-0 rounded-2xl bg-court-gold/5 animate-pulse pointer-events-none" />
        )}

        {/* ── IDLE state ─────────────────────────────────────────────────── */}
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <UploadIcon className={`w-16 h-16 ${iconColor.idle} transition-all duration-300`} />
            <div>
              <p className="text-court-text font-semibold text-lg leading-snug">
                Drag &amp; drop your judgment PDF
              </p>
              <p className="text-court-text-dim text-sm mt-1">
                or{" "}
                <span className="text-court-gold underline underline-offset-2 decoration-dotted">
                  click to browse
                </span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["PDF", "DOC", "DOCX", "TXT", "PNG", "JPG"].map((ext) => (
                <span
                  key={ext}
                  className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-court-border text-court-text-dim tracking-widest"
                >
                  .{ext}
                </span>
              ))}
            </div>
            <p className="text-court-text-dim text-xs mt-1">Maximum file size: 50 MB</p>
          </div>
        )}

        {/* ── HOVER state ────────────────────────────────────────────────── */}
        {state === "hover" && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <UploadIcon className={`w-16 h-16 ${iconColor.hover}`} />
            <div>
              <p className="text-court-gold font-judicial text-xl font-semibold">
                Release to submit document
              </p>
              <p className="text-court-gold/60 text-sm mt-1">Cryptographic fingerprint will be computed locally</p>
            </div>
          </div>
        )}

        {/* ── ACCEPTED state ─────────────────────────────────────────────── */}
        {state === "accepted" && currentFile && (
          <div className="flex flex-col items-center gap-4 animate-slide-up w-full max-w-sm">
            <PdfIcon className={`w-14 h-14 ${iconColor.accepted}`} />
            <div className="text-center">
              <p className="text-court-green font-semibold text-base truncate max-w-[260px]" title={currentFile.name}>
                {currentFile.name}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-court-text-dim text-sm">
                  {formatBytes(currentFile.size)}
                </span>
                <span className="text-court-border">·</span>
                <span className="text-court-text-dim text-sm">
                  {mimeLabel(currentFile.type)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-court-green/10 border border-court-green/30">
              <CheckIcon className="w-5 h-5 text-court-green" />
              <span className="text-court-green text-sm font-medium">Document accepted</span>
            </div>
            <p className="text-court-text-dim text-xs">
              Drop a different file to replace, or{" "}
              <span className="text-court-gold underline underline-offset-2 decoration-dotted cursor-pointer">
                click to re-select
              </span>
            </p>
          </div>
        )}

        {/* ── REJECTED state ─────────────────────────────────────────────── */}
        {state === "rejected" && (
          <div className="flex flex-col items-center gap-4 animate-shake-alert">
            <XCircleIcon className={`w-14 h-14 ${iconColor.rejected}`} />
            <div>
              <p className="text-court-red font-semibold text-lg">File Rejected</p>
              <p className="text-court-red/70 text-sm mt-1">{rejectedReason}</p>
            </div>
            <p className="text-court-text-dim text-xs">Click or drag again to try another file</p>
          </div>
        )}
      </div>

      {/* ── File metadata row (shown below zone after acceptance) ─────────── */}
      {isAccepted && currentFile && (
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <MetaCell label="File Name" value={currentFile.name} mono={false} truncate />
          <MetaCell label="File Size" value={formatBytes(currentFile.size)} />
          <MetaCell label="Document Type" value={mimeLabel(currentFile.type)} />
        </div>
      )}

      {/* ── Privacy notice ────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-court-accent/20 border border-court-border/50">
        <span className="text-court-gold text-sm mt-0.5 flex-shrink-0">🔒</span>
        <p className="text-court-text-dim text-xs leading-relaxed">
          <span className="text-court-gold-lt font-medium">Privacy guaranteed: </span>
          Your document bytes never leave your device. Only the cryptographic SHA-256 fingerprint is
          transmitted to the blockchain for verification.
        </p>
      </div>
    </div>
  );
}

// ── Small metadata display cell ───────────────────────────────────────────────
function MetaCell({ label, value, mono = true, truncate = false }) {
  return (
    <div className="bg-court-bg border border-court-border rounded-lg px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-court-gold mb-1">
        {label}
      </span>
      <span
        className={[
          "block text-court-text-dim text-xs leading-snug",
          mono ? "font-mono" : "",
          truncate ? "truncate" : "",
        ].join(" ")}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
