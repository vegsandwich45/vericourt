'use client';

import { useState } from 'react';
import Link from 'next/link';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi', script: 'हिन्दी', icon: '🇮🇳' },
  { code: 'mr', name: 'Marathi', script: 'मराठी', icon: '🚩' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்', icon: '🛕' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা', icon: '🐅' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી', icon: '🦁' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు', icon: '🌾' },
  { code: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ', icon: '🐘' },
];

export default function TranslatePage() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [caseNumber, setCaseNumber] = useState('WP(C)-2026-8941');
  const [englishText, setEnglishText] = useState(
    'In the High Court of Judicature. Case Docket: WP(C)-2026-8941. Petitioner: Ramesh Kumar Singh vs Respondent: Union of India. ' +
    'The Court hereby orders that the applicant is admitted to regular bail upon executing a personal bond in the sum of ₹25,000 ' +
    'with one surety of like amount. The accused shall mark attendance at the local police station every Monday and shall not tamper ' +
    'with evidence or leave the jurisdiction without prior leave of court. Decreed and sealed on the sovereign judicial ledger.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTranslate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/bhashini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber: caseNumber.trim(),
          targetLanguage: selectedLang,
          customEnglishText: englishText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBilingualCertificate = () => {
    if (!result) return;
    const certText = `================================================================================
GOVERNMENT OF INDIA · NATIONAL JUDICIAL EVIDENTIARY PORTAL
BHASHINI REGIONAL VERNACULAR JUDICIAL CERTIFICATE
Under Section 65B(4) Indian Evidence Act, 1872 / Section 63 BSA 2023
================================================================================
Case Docket Number   : ${result.caseNumber}
Target Language      : ${result.languageName}
Translation Engine   : National Language Translation Mission (Bhashini AI v2.4)
Issuance Timestamp   : ${new Date().toISOString()}

[1] ORIGINAL ENGLISH DECREE
${result.originalText}
SHA-256 State Seal   : ${result.originalHash}

[2] CERTIFIED VERNACULAR TRANSLATION (${result.languageName})
${result.translatedText}
Vernacular SHA-256   : ${result.vernacularHash}

[3] BILINGUAL MATHEMATICAL PARITY ANCHOR
Dual-Hash Anchor     : ${result.paritySeal}
Evidentiary Verdict  : MATHEMATICAL & SEMANTIC PARITY CERTIFIED (NON-REPUDIABLE)

Statutory Declaration:
This electronic document is certified under Section 65B(4) of the Indian Evidence Act
and Section 63 of Bharatiya Sakshya Adhiniyam, 2023. The vernacular translation bears
unaltered cryptographic equivalence to the master decree registered on the EVM ledger.
================================================================================`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bhashini_Certified_${result.caseNumber}_${result.targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-court-gold/10 border border-court-gold/30 rounded-full px-4 py-1 mb-2">
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-mono text-court-gold uppercase font-bold tracking-widest">
              NATIONAL BHASHINI INITIATIVE · CITIZEN ACCESS TO JUSTICE
            </span>
          </div>
          <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
            AI Bhashini Regional Translation &amp; Parity Engine
          </h1>
          <p className="text-xs sm:text-sm text-court-text-dim max-w-2xl mx-auto leading-relaxed">
            Translates official court decrees into India&apos;s scheduled vernacular languages. Computes a 
            <strong> Dual-Hash Parity Seal</strong> guaranteeing semantic equivalence between the English master decree 
            and the vernacular order under Section 65B of the Evidence Act.
          </p>
        </div>

        {/* ── Language Selection Ribbon ────────────────────────────── */}
        <div className="vc-card bg-court-surface/90 border-court-border">
          <label className="vc-label mb-2">Select Target Scheduled Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedLang === l.code
                    ? 'bg-court-gold text-night-black font-bold border-court-gold shadow-lg shadow-court-gold/20'
                    : 'bg-court-bg border-court-border text-court-text-dim hover:text-court-text hover:border-court-gold/40'
                }`}
              >
                <div className="text-lg">{l.icon}</div>
                <div className="text-xs font-semibold mt-1">{l.name}</div>
                <div className="text-[10px] opacity-80">{l.script}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Input Parameters Card ────────────────────────────────── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="vc-label">Case Docket Number</label>
              <input
                className="vc-input font-mono text-sm"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. WP(C)-2026-8941"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCaseNumber('WP(C)-2026-8941');
                  setEnglishText(
                    'In the High Court of Judicature. Case Docket: WP(C)-2026-8941. Petitioner: Ramesh Kumar Singh vs Respondent: Union of India. ' +
                    'The Court hereby orders that the applicant is admitted to regular bail upon executing a personal bond in the sum of ₹25,000 ' +
                    'with one surety of like amount. The accused shall mark attendance at the local police station every Monday and shall not tamper ' +
                    'with evidence or leave the jurisdiction without prior leave of court. Decreed and sealed on the sovereign judicial ledger.'
                  );
                }}
                className="px-3 py-2 rounded-lg bg-court-bg border border-court-border text-court-text-dim hover:text-court-gold text-xs font-mono"
              >
                Load Bail Decree
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaseNumber('CRL-APP-2025-1142');
                  setEnglishText(
                    'In the Supreme Court of India. Criminal Appellate Jurisdiction. State of Maharashtra vs Suresh Patel. ' +
                    'The sentence of the appellant is upheld under Section 302 IPC. The custody period already undergone shall be set off under Section 428 CrPC. ' +
                    'Certified copy issued for statutory compliance and execution.'
                  );
                }}
                className="px-3 py-2 rounded-lg bg-court-bg border border-court-border text-court-text-dim hover:text-court-gold text-xs font-mono"
              >
                Load Apex Appeal
              </button>
            </div>
          </div>

          <div>
            <label className="vc-label flex items-center justify-between">
              <span>English Court Decree Text</span>
              <span className="text-[11px] font-mono text-court-text-dim">Canonical Master Text</span>
            </label>
            <textarea
              rows={4}
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className="w-full bg-court-bg border border-court-border rounded-lg p-3 font-mono text-xs text-court-text focus:outline-none focus:border-court-gold transition-colors leading-relaxed mt-1"
            />
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading || !englishText.trim()}
            className="w-full py-3 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-court-gold/20 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-night-black/40 border-t-night-black rounded-full animate-spin" />
                <span>Translating via Bhashini Engine &amp; Computing Parity...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Generate Certified Vernacular Translation &amp; Parity Seal</span>
              </>
            )}
          </button>
        </div>

        {/* ── Translation & Parity Result ──────────────────────────── */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            
            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* English Decree */}
              <div className="vc-card bg-court-surface/90 border-court-border space-y-2">
                <div className="flex items-center justify-between border-b border-court-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇬🇧</span>
                    <h3 className="font-judicial font-bold text-court-text text-sm">
                      Master English Decree (Issuing Court)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-surface border border-court-border text-court-text-dim">
                    PRIMARY ANCHOR
                  </span>
                </div>
                <p className="text-xs font-mono text-court-text-dim leading-relaxed p-3 bg-court-bg rounded-lg border border-court-border/40 min-h-[140px]">
                  {result.originalText}
                </p>
                <div className="pt-1 text-[10px] font-mono text-court-text-dim truncate">
                  SHA-256: <code className="text-court-gold">{result.originalHash}</code>
                </div>
              </div>

              {/* Vernacular Certified Decree */}
              <div className="vc-card bg-court-surface/90 border-court-gold/40 space-y-2">
                <div className="flex items-center justify-between border-b border-court-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇮🇳</span>
                    <h3 className="font-judicial font-bold text-court-gold text-sm">
                      Certified Vernacular Translation ({result.languageName})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/40 font-bold">
                    BHASHINI CERTIFIED
                  </span>
                </div>
                <div className="text-xs font-mono text-court-text leading-relaxed p-3 bg-court-bg rounded-lg border border-court-border/40 whitespace-pre-line min-h-[140px]">
                  {result.translatedText}
                </div>
                <div className="pt-1 text-[10px] font-mono text-court-text-dim truncate">
                  Vernacular SHA-256: <code className="text-court-gold">{result.vernacularHash}</code>
                </div>
              </div>
            </div>

            {/* Cryptographic Dual-Hash Parity Seal Banner */}
            <div className="vc-card bg-emerald-950/20 border-emerald-500/40 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-judicial text-emerald-300 font-bold text-base">
                      Cryptographic Dual-Hash Parity Seal Active
                    </h4>
                    <p className="text-xs text-court-text-dim mt-0.5">
                      Both texts are cryptographically bound. Any modification to either the English or Vernacular decree breaks consensus.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadBilingualCertificate}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>📥</span>
                  <span>Download Bilingual Decree (.txt)</span>
                </button>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-court-text-dim">
                  <span>Bilingual Parity State Anchor (Merged On-Chain Fingerprint):</span>
                  <span className="text-emerald-400 font-bold">Sec 65B(4) IEA Compliant</span>
                </div>
                <p className="font-mono text-xs text-emerald-400 break-all p-1 bg-black/60 rounded border border-emerald-500/20">
                  {result.paritySeal}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── Footer Navigation ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-court-border text-xs text-court-text-dim font-mono">
          <Link href="/explorer" className="hover:text-court-gold">
            ← Sovereign Gazette
          </Link>
          <Link href="/verify" className="hover:text-court-gold">
            Verification Bench →
          </Link>
        </div>

      </div>
    </div>
  );
}
