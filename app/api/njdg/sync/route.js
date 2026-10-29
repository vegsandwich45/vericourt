import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const history = db.njdg.findMany();
    return NextResponse.json({
      success: true,
      service: 'National Judicial Data Grid (NJDG) e-Courts Bridge v3.2',
      status: 'SYNCHRONIZED',
      totalSyncBatches: history.length,
      history,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const courtCode = body.courtCode || 'IN-SC';

    // Simulate batch ingestion of 3 live court disposals
    const batchId = Date.now();
    const disposals = [
      {
        caseNumber: `NJDG-${courtCode}-${batchId}-01`,
        courtName: courtCode === 'IN-SC' ? 'Supreme Court of India' : 'High Court of Judicature at Bombay',
        judgmentType: 'Civil Disposal Decree',
        petitioner: 'National Infrastructure Logistics Corp',
        respondent: 'Department of Revenue & Customs',
        sha256Hash: '0x' + crypto.randomBytes(32).toString('hex'),
        ipfsCid: 'QmNJDG' + crypto.randomBytes(21).toString('hex'),
      },
      {
        caseNumber: `NJDG-${courtCode}-${batchId}-02`,
        courtName: courtCode === 'IN-SC' ? 'Supreme Court of India' : 'High Court of Judicature at Bombay',
        judgmentType: 'Commercial Arbitration Award',
        petitioner: 'Bharat Telecom Ltd.',
        respondent: 'Spectrum Operations Authority',
        sha256Hash: '0x' + crypto.randomBytes(32).toString('hex'),
        ipfsCid: 'QmNJDG' + crypto.randomBytes(21).toString('hex'),
      },
    ];

    const ingested = [];
    for (const d of disposals) {
      const created = db.judgments.create({
        caseNumber: d.caseNumber,
        courtName: d.courtName,
        benchId: 'bench-1',
        judgmentType: d.judgmentType,
        petitioner: d.petitioner,
        respondent: d.respondent,
        sha256Hash: d.sha256Hash,
        ipfsCid: d.ipfsCid,
        blockNumber: 45,
        txHash: '0x' + crypto.randomBytes(32).toString('hex'),
        gasUsed: 49800,
        registrarAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      });
      ingested.push(created);
    }

    const batchHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(disposals)).digest('hex');
    const syncEvent = db.njdg.createSyncEvent({
      courtCode,
      disposalCount: disposals.length,
      syncBatchHash: batchHash,
      syncedBy: 'e-Courts CIS 3.2 Automated Webhook Ingestion',
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${disposals.length} judicial disposals from NJDG e-Courts Grid.`,
      syncEvent,
      ingestedCases: ingested.map((i) => i.case_number),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
