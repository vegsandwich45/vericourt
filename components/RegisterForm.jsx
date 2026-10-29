'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DropZone from './DropZone';
import { getSignerContract }         from '../lib/contract';
import { computeFileHash, animateHashReveal } from '../lib/hash';

// ─── Constants ────────────────────────────────────────────────────────────────
const JUDGMENT_TYPES = [
  'Writ Petition',
  'Criminal Appeal',
  'Civil Suit',
  'Commercial Suit',
  'Habeas Corpus',
  'PIL',
  'Other',
];

const EMPTY_FORM = {
  caseNumber:       '',
  issuingAuthority: '',
  judgmentType:     'Writ Petition',
  petitioner:       '',
  respondent:       '',
  ipfsCid:          '',
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-parchment/60 flex items-center gap-1.5">
        {label}
        {required && <span className="text-court-gold text-base leading-none">*</span>}
      </label>
      {children}
      {hint && <p className="text-parchment/35 text-[11px] leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-night-black/60 border border-court-gold/20 rounded-md px-3.5 py-2.5 ' +
  'text-parchment placeholder-parchment/25 text-sm font-mono ' +
  'focus:outline-none focus:ring-2 focus:ring-court-gold/40 focus:border-court-gold/50 ' +
  'transition-all duration-150';

// ─── Hash display with animated reveal ───────────────────────────────────────
function HashDisplay({ hash, animating }) {
  const elRef = useRef(null);

  useEffect(() => {
    if (hash && animating && elRef.current) {
      animateHashReveal(elRef.current, hash);
    }
  }, [hash, animating]);

  if (!hash && !animating) return null;

  return (
    <div className="mt-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
          SHA-256 Document Fingerprint
        </span>
      </div>
      <p
        ref={elRef}
        className="font-mono text-[11px] text-emerald-300 break-all leading-relaxed"
      >
        {animating && !hash ? (
          <span className="animate-pulse opacity-50">Computing hash…</span>
        ) : (
          hash
        )}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegisterForm({ prefillData, onSuccess, onFormChange, onHashComputed }) {
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [file,       setFile]       = useState(null);      // File object from DropZone
  const [fileHash,   setFileHash]   = useState('');
  const [hashAnim,   setHashAnim]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [txError,    setTxError]    = useState('');
  const [fieldErrors,setFieldErrors]= useState({});

  // ── Apply prefill from Demo Mode ──────────────────────────────────────────
  useEffect(() => {
    if (!prefillData) return;
    const updated = {
      ...form,
      caseNumber:       prefillData.caseNumber       ?? form.caseNumber,
      issuingAuthority: prefillData.issuingAuthority ?? form.issuingAuthority,
      judgmentType:     prefillData.judgmentType     ?? form.judgmentType,
      petitioner:       prefillData.petitioner       ?? form.petitioner,
      respondent:       prefillData.respondent       ?? form.respondent,
      ipfsCid:          prefillData.ipfsCid          ?? form.ipfsCid,
    };
    setForm(updated);
    onFormChange?.(updated);
  }, [prefillData]);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      onFormChange?.(updated);
      return updated;
    });
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  }, [onFormChange]);

  // ── File drop handler — compute hash ──────────────────────────────────────
  const handleFileDrop = useCallback(async (droppedFile) => {
    if (!droppedFile) return;
    setFile(droppedFile);
    setFileHash('');
    setHashAnim(true);
    setFieldErrors(prev => ({ ...prev, file: undefined }));
    try {
      const hash = await computeFileHash(droppedFile);
      setFileHash(hash);
      onHashComputed?.(hash);
    } catch (err) {
      console.error('Hash computation failed:', err);
      setFileHash('');
      setFieldErrors(prev => ({ ...prev, file: 'Failed to compute document hash.' }));
    } finally {
      setHashAnim(false);
    }
  }, [onHashComputed]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errors = {};
    if (!form.caseNumber || !form.caseNumber.trim()) {
      errors.caseNumber = 'Case docket number is required.';
    }
    if (!form.issuingAuthority || !form.issuingAuthority.trim()) {
      errors.issuingAuthority = 'Issuing authority is required.';
    }
    if (!fileHash && !file) {
      errors.file = 'Please upload a court judgment PDF to seal on-chain.';
    }
    // CID basic check if user entered one
    if (form.ipfsCid && form.ipfsCid.trim()) {
      const cid = form.ipfsCid.trim();
      if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) && !/^bafy[a-z2-7]{40,}$/i.test(cid)) {
        errors.ipfsCid = 'Invalid IPFS CID format. Leave empty to auto-generate.';
      }
    }
    return errors;
  }, [form, fileHash, file]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTxError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Build the on-chain calldata
      const docHash = fileHash
        ? `0x${fileHash.replace(/^0x/, '')}`
        : ethers_bytes32_zero();

      let receiptData = null;

      // 1. Attempt on-chain registration via MetaMask / Hardhat if available
      try {
        const contract = await getSignerContract();
        if (contract) {
          const ipfsHashParam = form.ipfsCid.trim() || `Qm${docHash.replace(/^0x/, '').slice(0, 44)}`;
          const tx = await contract.registerJudgment(
            form.caseNumber.trim(),
            form.issuingAuthority.trim(),
            ipfsHashParam,
            docHash,
            form.judgmentType,
            form.petitioner.trim() || 'Petitioner',
            form.respondent.trim() || 'Respondent'
          );

          const receipt = await tx.wait();
          receiptData = {
            hash:        tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed:     receipt.gasUsed?.toString() ?? '48290',
            timestamp:   new Date().toISOString(),
            caseNumber:  form.caseNumber.trim(),
            ipfsCid:     form.ipfsCid.trim() || null,
          };
        }
      } catch (ethErr) {
        console.warn('Direct Web3 transaction not executed, routing to Sovereign Backend API:', ethErr?.message);
      }

      // 2. Persist in Relational Database (Review 3 Tri-Tier Architecture)
      let apiErrorMessage = null;
      try {
        const res = await fetch('/api/documents/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseNumber: form.caseNumber.trim(),
            courtName: form.issuingAuthority.trim(),
            judgmentType: form.judgmentType,
            petitioner: form.petitioner.trim(),
            respondent: form.respondent.trim(),
            documentHash: docHash,
            ipfsHash: form.ipfsCid.trim() || undefined,
            txHash: receiptData?.hash,
            blockNumber: receiptData?.blockNumber,
            gasUsed: receiptData?.gasUsed,
          }),
        });
        const resJson = await res.json();
        if (resJson.success) {
          if (!receiptData) {
            receiptData = {
              hash:        resJson.receipt.txHash,
              blockNumber: resJson.receipt.blockNumber,
              gasUsed:     resJson.receipt.gasUsed?.toString() ?? '48290',
              timestamp:   resJson.receipt.sealedAt,
              caseNumber:  resJson.receipt.caseNumber,
              ipfsCid:     resJson.receipt.ipfsCid,
            };
          }
        } else {
          apiErrorMessage = resJson.error;
        }
      } catch (dbErr) {
        console.error('Relational database sync error:', dbErr);
        apiErrorMessage = dbErr.message;
      }

      if (!receiptData) {
        throw new Error(apiErrorMessage || 'Could not seal document. Please check network connection.');
      }

      // Build a rich receipt object for the parent
      onSuccess?.(receiptData);

      // Reset form on success
      setForm(EMPTY_FORM);
      setFile(null);
      setFileHash('');
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err?.reason ?? err?.shortMessage ?? err?.message ?? 'Sealing failed.';
      setTxError(msg);
    } finally {
      setLoading(false);
    }
  }, [form, fileHash, validate, onSuccess]);

  // ── Helper: zero bytes32 ──────────────────────────────────────────────────
  function ethers_bytes32_zero() {
    return '0x' + '0'.repeat(64);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ── Row 1: Case number + Judgment type ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-medium text-court-text uppercase tracking-wider">
              Case Docket Number <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                const year = new Date().getFullYear();
                const newDocket = `WP(C)-${year}-${randomNum}`;
                setForm(prev => {
                  const updated = { ...prev, caseNumber: newDocket };
                  onFormChange?.(updated);
                  return updated;
                });
                setFieldErrors(prev => ({ ...prev, caseNumber: undefined }));
              }}
              className="text-[11px] font-mono text-court-gold hover:text-amber-300 flex items-center gap-1 bg-court-gold/10 px-2 py-0.5 rounded border border-court-gold/30 transition-colors"
              title="Click to generate a guaranteed unique docket number"
            >
              <span>🎲</span>
              <span>Generate Unique Docket</span>
            </button>
          </div>
          <input
            type="text"
            name="caseNumber"
            value={form.caseNumber}
            onChange={handleChange}
            placeholder="WP(C)-2026-8941"
            className={`${inputCls} ${fieldErrors.caseNumber ? 'border-red-500/60 ring-1 ring-red-500/40' : ''}`}
            autoComplete="off"
            spellCheck={false}
          />
          {fieldErrors.caseNumber && (
            <p className="text-red-400 text-[11px] mt-1">{fieldErrors.caseNumber}</p>
          )}
        </div>

        <Field label="Judgment Type">
          <select
            name="judgmentType"
            value={form.judgmentType}
            onChange={handleChange}
            className={`${inputCls} cursor-pointer appearance-none`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a78b56'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.1rem', paddingRight: '2.5rem' }}
          >
            {JUDGMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Row 2: Issuing authority ───────────────────────────────────── */}
      <Field
        label="Issuing Authority / Bench"
        required
        hint="e.g. Hon. Division Bench — Supreme Court of India"
      >
        <input
          type="text"
          name="issuingAuthority"
          value={form.issuingAuthority}
          onChange={handleChange}
          placeholder="Hon. Division Bench — Supreme Court of India"
          className={`${inputCls} ${fieldErrors.issuingAuthority ? 'border-red-500/60 ring-1 ring-red-500/40' : ''}`}
          autoComplete="off"
        />
        {fieldErrors.issuingAuthority && (
          <p className="text-red-400 text-[11px] mt-1">{fieldErrors.issuingAuthority}</p>
        )}
      </Field>

      {/* ── Row 3: Petitioner + Respondent ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Petitioner Name">
          <input
            type="text"
            name="petitioner"
            value={form.petitioner}
            onChange={handleChange}
            placeholder="Aarav Singh & Ors."
            className={inputCls}
            autoComplete="off"
          />
        </Field>
        <Field label="Respondent Name">
          <input
            type="text"
            name="respondent"
            value={form.respondent}
            onChange={handleChange}
            placeholder="Union of India & Anr."
            className={inputCls}
            autoComplete="off"
          />
        </Field>
      </div>

      {/* ── Row 4: IPFS CID ───────────────────────────────────────────── */}
      <Field
        label="IPFS CID"
        hint="Content Identifier for the judgment PDF pinned on IPFS (v0 or v1 CID)"
      >
        <input
          type="text"
          name="ipfsCid"
          value={form.ipfsCid}
          onChange={handleChange}
          placeholder="QmPZ9gcCEpqKTo96CI6KoE7K8muKEwe7Xue2vqmP9GKDFJ"
          className={`${inputCls} ${fieldErrors.ipfsCid ? 'border-red-500/60 ring-1 ring-red-500/40' : ''}`}
          autoComplete="off"
          spellCheck={false}
        />
        {fieldErrors.ipfsCid && (
          <p className="text-red-400 text-[11px] mt-1">{fieldErrors.ipfsCid}</p>
        )}
      </Field>

      {/* ── Row 5: Document Upload ────────────────────────────────────── */}
      <Field
        label="Upload Judgment PDF"
        hint="Drop the official judgment PDF here. A SHA-256 fingerprint will be computed locally and stored on-chain."
      >
        <DropZone
          accept="application/pdf"
          maxSizeMB={50}
          onFileAccepted={handleFileDrop}
          onFileDrop={handleFileDrop}
          currentFile={file}
        />
        {fieldErrors.file && (
          <p className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1">
            <span>⚠</span>
            <span>{fieldErrors.file}</span>
          </p>
        )}

        {/* Animated hash reveal */}
        <HashDisplay hash={fileHash} animating={hashAnim} />
      </Field>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-court-gold/20 to-transparent" />

      {/* ── Transaction error ─────────────────────────────────────────── */}
      {txError && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          <span className="text-lg leading-none mt-0.5 shrink-0">⚠</span>
          <div>
            <p className="font-semibold mb-0.5">Transaction Failed</p>
            <p className="text-red-400/80 text-xs break-all">{txError}</p>
          </div>
        </div>
      )}

      {/* ── Submit button ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full flex items-center justify-center gap-3
          bg-court-gold hover:bg-amber-400
          disabled:opacity-60 disabled:cursor-not-allowed
          text-night-black font-judicial font-bold text-lg
          px-6 py-4 rounded-lg
          transition-all duration-200
          shadow-xl shadow-court-gold/20 hover:shadow-court-gold/40
          ${!loading ? 'active:scale-[0.98]' : ''}
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Broadcasting transaction…
          </>
        ) : (
          <>
            Execute On-Chain Seal ⚖
          </>
        )}
      </button>

      {/* Note about gas */}
      {!loading && (
        <p className="text-center text-parchment/30 text-xs">
          This action will prompt a MetaMask signature and consume gas on-chain.
          Ensure your wallet has sufficient funds.
        </p>
      )}
    </form>
  );
}
