'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);

  // Determine role based on pathname
  const isJudge = pathname.startsWith('/judge');
  const isLawyer = pathname.startsWith('/lawyer');
  const isCitizen = pathname.startsWith('/citizen');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isJudge) {
        const raw = localStorage.getItem('vericourt_judge_session');
        if (raw) try { setSession({ role: 'judge', data: JSON.parse(raw) }); } catch {}
      } else if (isLawyer) {
        const raw = localStorage.getItem('vericourt_lawyer_session');
        if (raw) try { setSession({ role: 'lawyer', data: JSON.parse(raw) }); } catch {}
      } else if (isCitizen) {
        const raw = localStorage.getItem('vericourt_citizen_session');
        if (raw) try { setSession({ role: 'citizen', data: JSON.parse(raw) }); } catch {}
      }
    }
  }, [pathname, isJudge, isLawyer, isCitizen]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (isJudge) localStorage.removeItem('vericourt_judge_session');
      if (isLawyer) localStorage.removeItem('vericourt_lawyer_session');
      if (isCitizen) localStorage.removeItem('vericourt_citizen_session');
    }
    router.push('/');
  };

  const handleSwitchRole = () => {
    router.push('/');
  };

  if (!isJudge && !isLawyer && !isCitizen) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0c12]/95 border border-court-border/70 rounded-2xl px-4 py-3 backdrop-blur-md shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* Current Active Session Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-court-green animate-ping flex-shrink-0" />
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap min-w-0">
            {isJudge && (
              <>
                <span className="px-2.5 py-0.5 rounded-full border border-court-gold/50 bg-court-gold/15 text-court-gold font-bold text-[11px]">
                  🏛️ HON&apos;BLE JUDGE
                </span>
                <span className="text-court-text font-bold truncate">
                  {session?.data?.name || "Hon'ble Justice Vikramaditya Roy"}
                </span>
                <span className="text-[10px] text-court-text-dim">
                  (Courtroom #3 · Commercial &amp; Appellate)
                </span>
              </>
            )}

            {isLawyer && (
              <>
                <span className="px-2.5 py-0.5 rounded-full border border-blue-500/50 bg-blue-500/15 text-blue-300 font-bold text-[11px]">
                  ⚖️ ADVOCATE ON RECORD
                </span>
                <span className="text-court-text font-bold truncate">
                  {session?.data?.name || 'Adv. Meenakshi Sundaram'}
                </span>
                <span className="text-[10px] text-court-text-dim">
                  ({session?.data?.barNumber || 'MAH/4921/2014'})
                </span>
              </>
            )}

            {isCitizen && (
              <>
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold text-[11px]">
                  👤 CITIZEN / LITIGANT
                </span>
                <span className="text-court-text font-bold truncate">
                  {session?.data?.name || 'Ramesh Kumar Singh'}
                </span>
                <span className="text-[10px] text-court-text-dim">
                  (Docket: {session?.data?.docketNumber || 'WP(C)-2026-8941'})
                </span>
              </>
            )}

            <span className="text-[10px] font-mono text-court-green font-bold uppercase tracking-wider bg-court-green/10 px-2 py-0.5 rounded border border-court-green/30">
              ● SESSION ACTIVE
            </span>
          </div>
        </div>

        {/* Switch Role and Logout Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSwitchRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-court-border text-court-text-dim hover:text-court-gold hover:border-court-gold/50 text-xs font-mono font-semibold transition-all"
            title="Switch to another judicial role"
          >
            <span>🔄</span>
            <span>Switch Role</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500 text-xs font-mono font-semibold transition-all"
            title="End current session and lock access"
          >
            <span>🔒</span>
            <span>Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}
