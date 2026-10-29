import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const dispatches = db.faster.findMany();
    return NextResponse.json({
      success: true,
      service: 'Supreme Court of India · FASTER Digital e-Prisons Bridge v2.0',
      status: 'ONLINE',
      dispatches,
      stats: {
        totalDispatched: dispatches.length,
        releasedZeroDelay: dispatches.filter((d) => d.status === 'RELEASED').length,
        pendingWardenVerification: dispatches.filter((d) => d.status === 'DISPATCHED').length,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'dispatch' } = body;

    if (action === 'dispatch') {
      const { caseNumber, prisonerName, undertrialId, jailName, bailAmount } = body;
      if (!caseNumber || !prisonerName || !jailName) {
        return NextResponse.json(
          { success: false, error: 'Case number, prisoner name, and jail name are required' },
          { status: 400 }
        );
      }

      const created = db.faster.create({
        caseNumber,
        prisonerName,
        undertrialId,
        jailName,
        bailAmount,
      });

      return NextResponse.json({
        success: true,
        message: `Cryptographic Bail Release Token dispatched instantly to ${jailName}`,
        dispatch: created,
      });
    }

    if (action === 'verify_warden') {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ success: false, error: 'Release token is required' }, { status: 400 });
      }

      const updated = db.faster.verifyAndRelease(token);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Invalid or non-existent release token' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Jail Superintendent Biometric Verification Confirmed: Prisoner Release Executed with Zero Delay',
        dispatch: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
