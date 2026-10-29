import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, walletAddress } = body;

    const allRegistrars = db.registrars.findMany();

    let matched = null;
    if (email) {
      matched = allRegistrars.find((r) => r.email.toLowerCase() === email.toLowerCase());
    } else if (walletAddress) {
      matched = allRegistrars.find(
        (r) => r.wallet_address.toLowerCase() === walletAddress.toLowerCase()
      );
    } else {
      // Default to chief registrar for quick demo
      matched = allRegistrars[0];
    }

    if (!matched) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Registrar credentials not found in court registry.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registrar authentication successful.',
      registrar: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        walletAddress: matched.wallet_address,
        role: matched.role,
        benchName: matched.bench_name,
        benchCode: matched.bench_code,
        isAuthorized: Boolean(matched.is_authorized),
      },
      token: 'vc_sec_token_' + Buffer.from(matched.wallet_address).toString('base64'),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
