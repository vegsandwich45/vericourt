'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleSwitcher from '@/components/RoleSwitcher';
import VoiceSpeechAssistant from '@/components/VoiceSpeechAssistant';

export default function CitizenDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('WP(C)-2026-8941');
  const [caseRecord, setCaseRecord] = useState({
    caseNumber: 'WP(C)-2026-8941',
    courtName: 'High Court of Judicature at Bombay',
    bench: "Hon'ble Justice Vikramaditya Roy",
    title: 'Ramesh Kumar Singh vs Union of India',
    status: 'DECREE_PRONOUNCED',
    plainEnglishSummary: 'The High Court has decided in your favor. The Court cancelled the arbitrary government order and directed the revenue authority to update your property title deed within 14 days.',
    vernacularSummary: 'मा. मुंबई उच्च न्यायालयाने याचिकाकर्ते रमेश कुमार सिंह यांच्या बाजूने निकाल दिला असून, संबंधित प्राधिकरणास १४ दिवसांत फेरफार नोंद प्रमाणित करण्याचे आदेश दिले आहेत.',
    nextStep: 'Final Certified Order is ready. You do NOT need to visit court again. Download the certified decree below for bank or land registration.',
    evmBlock: 12,
    bailStatus: 'Bail Granted on ₹25,000 Personal Bond',
    fasterStatus: 'Dispatched to Arthur Road Central Prison (Release Token Verified)',
  });

  // Session Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('vericourt_citizen_session');
      if (!raw) {
        router.replace('/?role=citizen');
        return;
      }
      try {
        setSession(JSON.parse(raw));
      } catch {
        router.replace('/?role=citizen');
        return;
      }
    }
  }, [router]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setCaseRecord({
      caseNumber: searchQuery.trim(),
      courtName: 'High Court of Judicature at Bombay',
      bench: "Hon'ble Justice Vikramaditya Roy",
      title: 'Ramesh Kumar Singh vs Union of India',
      status: 'DECREE_PRONOUNCED',
      plainEnglishSummary: 'The Court has granted full relief to petitioner. The administrative delay has been quashed and official directions have been issued to municipal officers.',
      vernacularSummary: 'अदालत ने याचिकाकर्ता के पक्ष में फैसला सुनाया है और प्रशासनिक आदेश को रद्द कर दिया है।',
      nextStep: 'Your final certified copy is ready for official download.',
      evmBlock: 12,
      bailStatus: 'Bail Granted on ₹25,000 Personal Bond',
      fasterStatus: 'Dispatched to Jail Superintendent via FASTER',
    });
  };

  const handleDownloadCitizenCopy = () => {
    const certText = `================================================================================
OFFICIAL CERTIFIED COURT DECREE · CITIZEN PUBLIC COPY
National Judicial Evidentiary Portal · Government of India
================================================================================
Case Docket Number   : ${caseRecord.caseNumber}
Court Jurisdiction   : ${caseRecord.courtName}
Presiding Bench      : ${caseRecord.bench}
Litigants            : ${caseRecord.title}
Decree Status        : FINAL RELIEF GRANTED (IN FORCE)

PLAIN SUMMARY FOR CITIZENS & INSTITUTIONS:
${caseRecord.plainEnglishSummary}

VERIFIED AUTHENTICITY DETAILS:
• Blockchain Block Height : Block #${caseRecord.evmBlock}
• Document Integrity      : 100% Authentic (0 Bytes Modified)
• Section 65B Validity    : Certified Admissible under Indian Evidence Act

Official Verification URL: https://vericourt.gov.in/verify?case=${encodeURIComponent(caseRecord.caseNumber)}
================================================================================`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certified_Court_Order_${caseRecord.caseNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-court-bg flex items-center justify-center">
        <div className="text-center font-mono text-sm text-emerald-300 animate-pulse">
          Opening Nyaya Seva Kiosk…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Role Switcher ─────────────────────────────────────────── */}
        <RoleSwitcher />

        {/* ── Citizen Header ───────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-court-border pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/20 flex-shrink-0">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-judicial text-2xl sm:text-3xl font-bold text-emerald-300">
                  {session?.name || 'Nyaya Seva · Citizen Justice Access Kiosk'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold uppercase tracking-wider">
                  PUBLIC PORTAL
                </span>
              </div>
              <p className="text-xs text-court-text-dim mt-0.5">
                {session?.mobileNumber && session?.mobileNumber !== 'Guest User'
                  ? `Mobile: ${session.mobileNumber}`
                  : session?.docketNumber
                  ? `Docket: ${session.docketNumber}`
                  : 'Plain-Language Case Tracking, Vernacular Explanations & Bail Status'}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-court-text-dim flex-wrap">
                <span className="text-emerald-400">✓ Free Citizen Service</span>
                <span>•</span>
                <span>Zero Legal Jargon</span>
                <span>•</span>
                <span className="text-court-gold">Article 39A Sovereign Free Access</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/whatsapp"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <span>📲</span>
              <span>WhatsApp Bot</span>
            </Link>
            <Link
              href="/translate"
              className="px-3.5 py-2 rounded-xl bg-court-surface border border-court-border hover:border-court-gold text-court-gold font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>🇮🇳</span>
              <span>Bhashini AI</span>
            </Link>
          </div>
        </div>

        {/* ── TASK 1: Voice Speech-to-Speech Assistant (Hindi / Marathi) ── */}
        <div id="voice">
          <VoiceSpeechAssistant
            onCaseSelected={(c) => {
              setSearchQuery(c);
              handleSearch();
            }}
          />
        </div>

        {/* ── TASK 2: Case Search ──────────────────────────────────── */}
        <div id="track" className="vc-card bg-court-surface/90 border-court-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="vc-label text-base font-bold text-court-gold">
              🔍 Where is My Case? (Case Docket or CNR Number)
            </label>
            <span className="text-xs font-mono text-court-text-dim">No Account Required</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="vc-input flex-1 font-mono text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. WP(C)-2026-8941"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <span>🔍</span>
              <span>Track Case Status</span>
            </button>
          </div>
        </div>

        {/* ── TASK 3 & 4: Plain Language Case Result & Bail Tracker ─── */}
        {caseRecord && (
          <div className="space-y-6 animate-slide-up">

            {/* 4-Stage Visual Progress Timeline */}
            <div className="vc-card bg-court-surface/90 border-court-border space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-court-gold font-bold">Case Progression: 100% Completed</span>
                <span className="text-court-green font-bold flex items-center gap-1">
                  <span>✓</span>
                  <span>Final Order Sealed &amp; Active</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                {[
                  { icon: '📋', label: '1. Petition Filed' },
                  { icon: '📬', label: '2. Notice Issued' },
                  { icon: '⚖️', label: '3. Arguments Concluded' },
                  { icon: '📜', label: '4. Final Order Sealed', sub: 'Relief Granted' },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-court-green/20 text-court-green border border-court-green/40 font-bold space-y-1">
                    <div className="text-base">{s.icon}</div>
                    <div>{s.label}</div>
                    <div className="text-[10px] text-court-text-dim">{s.sub || 'Completed'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plain Language Explainer Card */}
            <div className="vc-card bg-court-surface/90 border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-court-border/60 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Official Court Judgment
                  </span>
                  <h3 className="font-judicial text-xl font-bold text-court-gold mt-1">
                    {caseRecord.title}
                  </h3>
                  <p className="text-xs text-court-text-dim">
                    {caseRecord.courtName} · Presided by {caseRecord.bench}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-court-green/20 text-court-green font-bold font-mono text-xs border border-court-green/40">
                  RELIEF GRANTED
                </span>
              </div>

              {/* Plain English Box */}
              <div className="p-4 rounded-xl bg-court-bg border border-court-border space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-court-gold font-mono">
                  <span>🇬🇧</span>
                  <span>Plain-English Verdict (What This Means For You):</span>
                </div>
                <p className="text-xs text-court-text leading-relaxed">
                  {caseRecord.plainEnglishSummary}
                </p>
              </div>

              {/* Vernacular Box */}
              <div className="p-4 rounded-xl bg-court-bg border border-court-border space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                  <span>🇮🇳</span>
                  <span>प्रादेशिक भाषा सारांश (मराठी / हिंदी स्पष्टीकरण):</span>
                </div>
                <p className="text-xs text-court-text leading-relaxed font-sans">
                  {caseRecord.vernacularSummary}
                </p>
              </div>

              {/* Bail & Next Step Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-court-surface border border-court-border space-y-1">
                  <div className="text-[11px] text-court-text-dim">Bail &amp; Detention Status:</div>
                  <div className="text-court-green font-bold">{caseRecord.bailStatus}</div>
                  <div className="text-[10px] text-court-text-dim">{caseRecord.fasterStatus}</div>
                </div>

                <div className="p-3 rounded-lg bg-court-surface border border-court-border space-y-1">
                  <div className="text-[11px] text-court-text-dim">Your Next Action:</div>
                  <div className="text-court-text">{caseRecord.nextStep}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadCitizenCopy}
                  className="flex-1 py-3 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow"
                >
                  <span>📥</span>
                  <span>Download Official Certified Order (For Banks &amp; Revenue Offices)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── TASK 6, 7 & 8: WhatsApp Bot, Bhashini AI & Public Check ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-court-surface border border-emerald-500/30 space-y-2">
            <div className="text-2xl">📲</div>
            <h3 className="font-judicial text-sm font-bold text-emerald-300">WhatsApp Case Bot</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Send your case number on WhatsApp to get instant plain-language status updates.
            </p>
            <Link
              href="/whatsapp"
              className="inline-block text-xs font-mono font-bold text-emerald-400 hover:underline pt-1"
            >
              Open WhatsApp Bot →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-court-surface border border-court-border space-y-2">
            <div className="text-2xl">🇮🇳</div>
            <h3 className="font-judicial text-sm font-bold text-court-gold">Bhashini AI Translation</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Read any judgment in 22 regional Indian languages with certified translation seals.
            </p>
            <Link
              href="/translate"
              className="inline-block text-xs font-mono font-bold text-court-gold hover:underline pt-1"
            >
              Translate Order →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-court-surface border border-court-border space-y-2">
            <div className="text-2xl">🛡️</div>
            <h3 className="font-judicial text-sm font-bold text-court-text">Check Order Authenticity</h3>
            <p className="text-xs text-court-text-dim leading-relaxed">
              Upload any court PDF to check if it has been forged or if the seal is genuine.
            </p>
            <Link
              href="/verify"
              className="inline-block text-xs font-mono font-bold text-court-blue-lt hover:underline pt-1"
            >
              Verify Document →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
