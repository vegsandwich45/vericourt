import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const benchCode = searchParams.get('bench') || 'ALL';
    const judgmentType = searchParams.get('type') || 'All';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const startTime = Date.now();
    const rows = db.judgments.findMany({ search, benchCode, judgmentType, limit, offset });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      total: rows.length,
      page,
      limit,
      queryLatencyMs: latencyMs,
      data: rows.map((r) => ({
        id: r.id,
        caseNumber: r.case_number,
        courtName: r.court_name,
        benchCode: r.bench_code,
        benchName: r.bench_name,
        benchIcon: r.bench_icon,
        judgmentType: r.judgment_type,
        petitioner: r.petitioner,
        respondent: r.respondent,
        documentHash: r.sha256_hash,
        ipfsHash: r.ipfs_cid,
        blockNumber: r.block_number,
        txHash: r.tx_hash,
        gasUsed: r.gas_used,
        registrar: r.registrar_address,
        timestamp: Math.floor(new Date(r.sealed_at).getTime() / 1000),
        sealedAt: r.sealed_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
