import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || null;
    const proposals = db.multisig.findMany(status);

    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      proposalTitle,
      caseNumber,
      courtName,
      benchId,
      judgmentType,
      petitioner,
      respondent,
      documentHash,
      ipfsCid,
      proposerAddress,
      proposerName,
      requiredSignatures,
    } = body;

    if (!proposalTitle || !caseNumber || !documentHash) {
      return NextResponse.json(
        { success: false, error: 'Proposal title, case number, and document hash are required' },
        { status: 400 }
      );
    }

    const proposal = db.multisig.create({
      proposalTitle,
      caseNumber: caseNumber.trim(),
      courtName: courtName || 'Supreme Court of India (Constitution Bench)',
      benchId: benchId || 'bench-1',
      judgmentType: judgmentType || 'Constitutional Bench',
      petitioner: petitioner || 'Petitioner',
      respondent: respondent || 'Respondent',
      documentHash: documentHash.trim().toLowerCase(),
      ipfsCid: ipfsCid || `Qm${documentHash.replace(/^0x/, '').slice(0, 44)}`,
      proposerAddress: proposerAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      proposerName: proposerName || 'Hon. K. R. Nambiar (Registrar Judicial)',
      requiredSignatures: Number(requiredSignatures) || 2,
    });

    return NextResponse.json({
      success: true,
      message: 'Multi-Signature Proposal created successfully. Awaiting co-signature.',
      proposal,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
