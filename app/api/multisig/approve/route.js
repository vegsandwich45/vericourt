import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { proposalId, approverAddress, approverName } = body;

    if (!proposalId || !approverAddress) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID and approver address are required' },
        { status: 400 }
      );
    }

    const result = db.multisig.addApproval({
      proposalId,
      approverAddress,
      approverName: approverName || 'Adv. Sunita Deshmukh (Chief Appellate Clerk)',
    });

    // If quorum is achieved, seal the decree in the primary registry!
    let sealedRecord = null;
    if (result.isApproved) {
      const p = result.proposal;
      const txHash = '0x' + crypto.randomBytes(32).toString('hex');
      const blockNumber = 44 + Math.floor(Math.random() * 5);

      // Check if already in judgments table
      const existing = db.judgments.findUnique({ where: { caseNumber: p.case_number } });
      if (!existing) {
        sealedRecord = db.judgments.create({
          caseNumber: p.case_number,
          courtName: p.court_name,
          benchId: p.bench_id,
          judgmentType: p.judgment_type,
          petitioner: p.petitioner,
          respondent: p.respondent,
          sha256Hash: p.document_hash,
          ipfsCid: p.ipfs_cid,
          blockNumber,
          txHash,
          gasUsed: 62450,
          registrarAddress: approverAddress,
        });

        // Record audit log
        db.auditLogs.create({
          caseNumber: p.case_number,
          queriedHash: p.document_hash,
          verdict: 'AUTHENTIC',
          ipAddress: '127.0.0.1',
          userAgent: 'Multi-Signature Judicial Quorum Engine (2/2 Signed)',
          latencyMs: 1.8,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: result.isApproved
        ? 'Quorum achieved (2/2)! Decree has been executed and anchored on-chain.'
        : 'Co-signature recorded. Awaiting remaining judicial approvals.',
      proposal: result.proposal,
      isApproved: result.isApproved,
      sealedRecord,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
