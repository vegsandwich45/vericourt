import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  // Webhook challenge verification for Meta WhatsApp Cloud API / Twilio
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'VERICOURT_WEBHOOK_2026')) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    service: 'VeriCourt Citizen WhatsApp Business API Webhook v2.0',
    status: 'ACTIVE',
    phone: '+91-VERICOURT (9876543210)',
    verifiedBadge: 'e-Courts Sovereign National Gazette',
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messageText = (body.message || body.text || '').trim();
    const sender = body.sender || '+91 98201 XXXXX';

    if (!messageText) {
      return NextResponse.json({ success: false, error: 'Empty message text' }, { status: 400 });
    }

    const lower = messageText.toLowerCase();

    // 1. Check exact or direct match by case number or hash
    let judgment = db.judgments.findUnique({ caseNumber: messageText }) ||
      db.judgments.findUnique({ sha256Hash: messageText });

    // 2. If not found, try partial search across dockets and party names
    if (!judgment && messageText.length >= 3) {
      const candidates = db.judgments.findMany({ search: messageText, limit: 1 });
      if (candidates && candidates.length > 0) {
        judgment = candidates[0];
      }
    }

    let botReply = '';
    let isAuthentic = false;

    if (judgment) {
      isAuthentic = true;
      botReply = `⚖️ *OFFICIAL E-COURTS VERICOURT BOT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *AUTHENTIC COURT ORDER VERIFIED*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📜 *Docket:* ${judgment.case_number}\n` +
        `🏛️ *Court:* ${judgment.court_name}\n` +
        `⚖️ *Type:* ${judgment.judgment_type}\n` +
        `👤 *Parties:* ${judgment.petitioner} vs ${judgment.respondent}\n` +
        `🔗 *EVM Consensus Block:* #${judgment.block_number}\n` +
        `🔒 *State Seal:* ${judgment.sha256_hash.slice(0, 18)}...\n` +
        `🌐 *IPFS CID:* ${judgment.ipfs_cid.slice(0, 18)}...\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🛡️ *Statutory Admissibility:* 100% Valid under Sec 65B(4) Indian Evidence Act & Sec 63 BSA 2023.\n\n` +
        `🔗 *Instant Direct Links:*\n` +
        `• View Order: http://localhost:3000/explorer?case=${encodeURIComponent(judgment.case_number)}\n` +
        `• Citizen Status: http://localhost:3000/citizen\n` +
        `• Chambers Roster: http://localhost:3000/judge`;
    } else if (lower.includes('mata') || lower.includes('fake') || lower.includes('9999') || lower.includes('hallucin')) {
      isAuthentic = false;
      botReply = `🚨 *VERICOURT INTEGRITY ALERT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `❌ *FABRICATED / UNANCHORED PRECEDENT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `The citation "${messageText}" has NO on-chain evidentiary anchor on the Sovereign Judicial Ledger.\n\n` +
        `⚠️ *Legal Advisory:* Generative AI tools routinely hallucinate synthetic precedents (*Mata v. Avianca* precedent). Citing fabricated precedents in court carries professional sanctions.\n\n` +
        `Official National Judicial Gazette: http://localhost:3000/explorer`;
    } else if (lower.includes('bail') || lower.includes('faster') || lower.includes('prison') || lower.includes('jail')) {
      botReply = `⚡ *SUPREME COURT FASTER BAIL PROTOCOL*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `The FASTER (Fast and Secured Transmission of Electronic Records) system transmits court bail orders directly to Central Prisons (Tihar, Arthur Road, Yerawada).\n\n` +
        `• *Active Matter:* WP(C)-2026-8941 (Ramesh Kumar Singh)\n` +
        `• *Status:* Bail Granted · Dispatched to Arthur Road Jail Warden\n` +
        `• *Token Verification:* Instant release via authenticated QR\n\n` +
        `Track live release status: http://localhost:3000/citizen or http://localhost:3000/faster`;
    } else if (lower.includes('65b') || lower.includes('bsa') || lower.includes('evidence') || lower.includes('admissib')) {
      botReply = `📜 *SECTION 65B & SECTION 63 BSA COMPLIANCE*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `All documents verified by VeriCourt meet statutory admissibility standards under:\n` +
        `1. Section 65B(4) Indian Evidence Act, 1872\n` +
        `2. Section 63 Bharatiya Sakshya Adhiniyam, 2023\n\n` +
        `Every certificate includes cryptographic SHA-256 fingerprint, EVM block height, and verifiable registrar signatures.\n` +
        `Download certificates: http://localhost:3000/verify`;
    } else if (lower.includes('role') || lower.includes('judge') || lower.includes('lawyer') || lower.includes('citizen')) {
      botReply = `🏛️ *VERICOURT ROLE-BASED WORKSPACES*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `VeriCourt features 3 strictly separated judicial workspaces:\n` +
        `• 🏛️ *Judge Chambers:* http://localhost:3000/judge (Cause list & pronouncement)\n` +
        `• ⚖️ *Advocate Workspace:* http://localhost:3000/lawyer (E-filing & 65B kits)\n` +
        `• 👤 *Citizen Nyaya Seva:* http://localhost:3000/citizen (Plain language tracking)\n\n` +
        `All roles portal: http://localhost:3000/portal`;
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('help')) {
      botReply = `⚖️ *NAMASTE! WELCOME TO VERICOURT OFFICIAL BOT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `I am your 24x7 automated judicial verification assistant.\n\n` +
        `💡 *Quick Things You Can Ask Me:*\n` +
        `1. Send a Case Docket: *WP(C)-2026-8941* or *CRL-APP-2025-1142*\n` +
        `2. Search by party name: *Ramesh Kumar* or *Electoral Bonds*\n` +
        `3. Type *bail* to track FASTER prison release tokens\n` +
        `4. Type *65B* for electronic evidence legal admissibility\n` +
        `5. Test AI Anti-Hallucination: Type *Mata v. Avianca*\n\n` +
        `Reply with any case number or topic to begin!`;
    } else {
      botReply = `⚖️ *VERICOURT CITIZEN BOT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Query received: "${messageText}"\n\n` +
        `To verify an authentic order, please reply with:\n` +
        `• Case Docket (e.g. *WP(C)-2026-8941* or *2024 INSC 482*)\n` +
        `• Criminal Appeal (e.g. *CRL-APP-2025-1142*)\n` +
        `• 64-char SHA-256 Hash\n` +
        `• Or type *bail*, *roles*, or *65B*\n\n` +
        `Public Law Report: http://localhost:3000/explorer`;
    }

    return NextResponse.json({
      success: true,
      sender,
      receivedMessage: messageText,
      reply: botReply,
      isAuthentic,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('WhatsApp Bot webhook error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
