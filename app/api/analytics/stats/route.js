import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = db.analytics.getStats();
    const benches = db.courtBenches.findMany();
    const registrars = db.registrars.findMany();

    return NextResponse.json({
      success: true,
      stats,
      benches,
      registrarsCount: registrars.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
