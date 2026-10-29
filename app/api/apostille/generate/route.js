import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const records = db.apostilles.findMany();
    return NextResponse.json({
      success: true,
      service: 'Hague Apostille Convention (1961) · Section 44A CPC Enforcement Bridge',
      records,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      caseNumber = 'WP(C)-2026-8941',
      countryDestination = 'United Kingdom (UK Commercial Court, London)',
      signatoryOfficial = 'Hon. K. R. Nambiar',
      signatoryCapacity = 'Registrar Judicial, High Court of Bombay',
      issuingAuthority = 'Ministry of External Affairs, Legal & Treaties Division, New Delhi',
    } = body;

    const certPayload = `${caseNumber}:${countryDestination}:${signatoryOfficial}:${Date.now()}`;
    const certificateHash = '0x' + crypto.createHash('sha256').update(certPayload).digest('hex');

    const created = db.apostilles.create({
      caseNumber,
      countryDestination,
      signatoryOfficial,
      signatoryCapacity,
      issuingAuthority,
      certificateHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Official International e-Apostille Certificate Generated under Hague Convention 1961',
      apostille: created,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
