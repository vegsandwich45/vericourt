import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const logs = db.auditLogs.findMany({ limit });
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { caseNumber, queriedHash, verdict, latencyMs } = body;

    if (!queriedHash || !verdict) {
      return NextResponse.json(
        { success: false, error: 'queriedHash and verdict are required' },
        { status: 400 }
      );
    }

    const created = db.auditLogs.create({
      caseNumber: caseNumber || null,
      queriedHash,
      verdict, // 'AUTHENTIC', 'TAMPERED', 'AI_HALLUCINATION'
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'VeriCourt Client',
      latencyMs: latencyMs || 3.2,
    });

    return NextResponse.json({ success: true, message: 'Audit event logged', data: created });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
