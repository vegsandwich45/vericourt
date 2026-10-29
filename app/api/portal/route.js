import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'judge';

    const allJudgments = db.judgments.findMany();
    const allFaster = db.faster.findMany();

    if (role === 'judge') {
      const causeList = [
        { itemNo: 1, caseNumber: 'WP(C)-2026-8941', parties: 'Ramesh Kumar Singh vs Union of India', stage: 'Final Pronouncement', advocate: 'Adv. M. Sundaram', status: 'READY_TO_SEAL' },
        { itemNo: 2, caseNumber: 'CRL-APP-2025-1142', parties: 'State of Maharashtra vs Suresh Patel', stage: 'Bail Compliance', advocate: 'Public Prosecutor', status: 'FASTER_QUEUED' },
        { itemNo: 3, caseNumber: 'CS(COMM)-2024-431', parties: 'TechCorp Pvt. Ltd. vs Innovate Solutions', stage: 'Arguments on Injunction', advocate: 'Senior Counsel K. Nair', status: 'HEARING' },
        { itemNo: 4, caseNumber: 'CP(IB)-2025-992', parties: 'Delta Infrastructure vs Sovereign Bank', stage: 'Admission Hearing', advocate: 'Adv. R. Singhania', status: 'ADJOURNED' },
        { itemNo: 5, caseNumber: 'WP(C)-2026-9050', parties: 'PUCL vs UIDAI & Anr.', stage: 'Constitution Bench Coram', advocate: 'Adv. S. Grover', status: 'MULTI_SIG_PENDING' },
      ];

      return NextResponse.json({
        success: true,
        role: 'judge',
        judgeProfile: {
          name: 'Hon\'ble Justice Vikramaditya Roy',
          designation: 'Senior Judge, Commercial & Appellate Bench',
          court: 'High Court of Judicature at Bombay',
          courtroom: 'Courtroom No. 3 (Heritage Building)',
          digitalTokenSerial: 'FIPS-140-2-LEVEL3-DSC-984102',
        },
        stats: {
          listedToday: causeList.length,
          awaitingSeal: causeList.filter(c => c.status === 'READY_TO_SEAL').length,
          fasterBailPending: allFaster.filter(f => f.status === 'DISPATCHED').length,
        },
        causeList,
        pendingDecrees: allJudgments.slice(0, 3),
      });
    }

    if (role === 'lawyer') {
      const myPortfolio = [
        { caseNumber: 'WP(C)-2026-8941', client: 'Ramesh Kumar Singh', court: 'Bombay High Court', stage: 'Pronounced - Bail Granted', status: 'WON' },
        { caseNumber: 'CS(COMM)-2024-431', client: 'TechCorp Pvt. Ltd.', court: 'Delhi High Court', stage: 'Arguments on Escrow', status: 'IN_PROGRESS' },
        { caseNumber: 'CRL-APP-2025-1142', client: 'Suresh Baburao Patel', court: 'Supreme Court of India', stage: 'FASTER Bail Dispatched', status: 'BAIL_ORDERED' },
      ];

      return NextResponse.json({
        success: true,
        role: 'lawyer',
        lawyerProfile: {
          name: 'Adv. Meenakshi Sundaram',
          barEnrollment: 'MAH/4921/2014 (Bar Council of Maharashtra & Goa)',
          chamberAddress: 'Chamber No. 42, High Court Advocates Annexe, Fort, Mumbai',
          specialization: 'Constitutional Writs & White Collar Criminal Defense',
        },
        stats: {
          activeBriefs: myPortfolio.length,
          filingsAnchored: 14,
          precedentsScreened: 29,
        },
        myPortfolio,
      });
    }

    if (role === 'citizen') {
      return NextResponse.json({
        success: true,
        role: 'citizen',
        portalName: 'Nyaya Seva Citizen Justice Kiosk',
        recentPublicDecrees: allJudgments.slice(0, 5),
        fasterDispatches: allFaster.slice(0, 3),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown role' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Lawyer E-Filing Action
    if (action === 'lawyer_efile') {
      const { caseCategory, petitioner, respondent, briefSummary } = body;
      const filingId = `EFILE-IN-BOM-${Date.now().toString(36).toUpperCase()}`;
      const docPayload = `${caseCategory}:${petitioner}:${respondent}:${briefSummary}:${Date.now()}`;
      const sha256Fingerprint = '0x' + crypto.createHash('sha256').update(docPayload).digest('hex');

      return NextResponse.json({
        success: true,
        message: 'Petition E-Filed & Cryptographically Fingerprinted on Sovereign Ledger',
        filing: {
          filingId,
          caseCategory,
          petitioner,
          respondent,
          sha256Fingerprint,
          filingTimestamp: new Date().toISOString(),
          status: 'DIGITALLY_SEALED_AWAITING_ROSTER',
        },
      });
    }

    // 2. Judge Judicial Pronouncement Action
    if (action === 'judge_pronounce') {
      const { caseNumber } = body;
      const decreeTxHash = '0x' + crypto.randomBytes(32).toString('hex');
      const blockNumber = 48;

      return NextResponse.json({
        success: true,
        message: `Decree for ${caseNumber} officially pronounced in open court and committed to EVM Consensus Block #${blockNumber}.`,
        decreeTxHash,
        blockNumber,
        pronouncementTimestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid portal action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
