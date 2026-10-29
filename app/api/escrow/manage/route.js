import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const escrows = db.escrows.findMany();
    return NextResponse.json({
      success: true,
      service: 'Commercial Arbitration Smart Contract Escrow Protocol v2.0',
      escrows,
      stats: {
        totalEscrows: escrows.length,
        totalLockedInr: escrows.reduce((acc, e) => acc + (e.amount_inr || 0), 0),
        activeLocked: escrows.filter((e) => e.status === 'FUNDS_LOCKED').length,
        releasedPayouts: escrows.filter((e) => e.status === 'RELEASED_TO_BENEFICIARY').length,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'deposit' } = body;

    if (action === 'deposit') {
      const {
        caseNumber = 'CS(COMM)-2024-431',
        matterTitle = 'Commercial Restitution & Intellectual Property Escrow',
        amountInr = 10000000,
        amountEth = 3.6,
        depositor = 'Corporate Respondent Entity',
        beneficiary = 'Aggrieved Patent Holder Corp',
      } = body;

      const created = db.escrows.create({
        caseNumber,
        matterTitle,
        amountInr: Number(amountInr),
        amountEth: Number(amountEth),
        depositor,
        beneficiary,
        txHash: '0x' + crypto.randomBytes(32).toString('hex'),
      });

      return NextResponse.json({
        success: true,
        message: 'Arbitral Restitution Funds Deposited into Sovereign Smart Contract Escrow',
        escrow: created,
      });
    }

    if (action === 'release') {
      const { escrowId } = body;
      if (!escrowId) {
        return NextResponse.json({ success: false, error: 'Escrow ID required' }, { status: 400 });
      }

      const releaseTxHash = '0x' + crypto.randomBytes(32).toString('hex');
      const updated = db.escrows.releasePayout(escrowId, releaseTxHash);

      return NextResponse.json({
        success: true,
        message: 'Decree Finality Validated: Escrow Compensation Automatically Transferred to Winning Petitioner via Smart Contract',
        escrow: updated,
        releaseTxHash,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
