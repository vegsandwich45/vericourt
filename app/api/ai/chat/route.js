import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const query = (body.message || body.query || '').trim();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Empty query' }, { status: 400 });
    }

    const lower = query.toLowerCase();

    // 1. Direct or partial judgment lookup
    let judgment = db.judgments.findUnique({ caseNumber: query }) ||
      db.judgments.findUnique({ sha256Hash: query });

    if (!judgment && query.length >= 3) {
      const candidates = db.judgments.findMany({ search: query, limit: 1 });
      if (candidates && candidates.length > 0) {
        judgment = candidates[0];
      }
    }

    let responseText = '';
    let category = 'general';
    let relatedLinks = [];

    if (judgment) {
      category = 'case_verification';
      responseText = `⚖️ **Authentic Judicial Record Found:**\n\n` +
        `• **Docket:** \`${judgment.case_number}\`\n` +
        `• **Court:** ${judgment.court_name}\n` +
        `• **Bench:** ${judgment.bench_name || 'Appellate Division'}\n` +
        `• **Litigants:** ${judgment.petitioner} vs ${judgment.respondent}\n` +
        `• **EVM Consensus Block:** #${judgment.block_number}\n` +
        `• **SHA-256 State Seal:** \`${judgment.sha256_hash.slice(0, 24)}...\`\n` +
        `• **Statutory Status:** Certified under Section 65B(4) IEA 1872 & Section 63 BSA 2023.`;
      
      relatedLinks = [
        { label: 'View in Gazette', url: `/explorer?case=${encodeURIComponent(judgment.case_number)}` },
        { label: 'Verify On-Chain', url: `/verify` },
        { label: 'Citizen View', url: `/citizen` }
      ];
    } else if (lower.includes('mata') || lower.includes('fake') || lower.includes('hallucin') || lower.includes('9999')) {
      category = 'ai_alert';
      responseText = `🚨 **AI Hallucination Detected (Mata v. Avianca Advisory):**\n\n` +
        `The citation "${query}" does not exist on the Sovereign Judicial Ledger. Generative AI models frequently synthesize fabricated precedents with fake docket numbers. Citing unanchored precedents in court violates Bar Council ethics rules and judicial conduct.`;
      
      relatedLinks = [
        { label: 'Audit Precedent Guard', url: `/verify` },
        { label: 'Sovereign Gazette', url: `/explorer` }
      ];
    } else if (lower.includes('bail') || lower.includes('faster') || lower.includes('prison') || lower.includes('jail')) {
      category = 'faster_bail';
      responseText = `⚡ **Supreme Court FASTER Bail Protocol:**\n\n` +
        `VeriCourt's FASTER bridge digitally transmits authenticated bail decrees directly to Central Prisons (Tihar, Arthur Road, Yerawada) with instant release vouchers, preventing wrongful detention delays.`;
      
      relatedLinks = [
        { label: 'FASTER Bail Terminal', url: `/faster` },
        { label: 'Citizen Release Tracker', url: `/citizen` },
        { label: 'Judge Dispatch Queue', url: `/judge` }
      ];
    } else if (lower.includes('65b') || lower.includes('bsa') || lower.includes('admissib') || lower.includes('evidence')) {
      category = 'statutory_compliance';
      responseText = `📜 **Section 65B(4) IEA & Section 63 BSA 2023:**\n\n` +
        `Electronic records anchored on VeriCourt are legally admissible in all Indian courts. Every verified order generates a statutory Section 65B certificate containing the device operating status, EVM block height, and verifiable SHA-256 state seal.`;
      
      relatedLinks = [
        { label: 'Generate 65B Certificate', url: `/lawyer` },
        { label: 'Verification Center', url: `/verify` }
      ];
    } else if (lower.includes('role') || lower.includes('judge') || lower.includes('lawyer') || lower.includes('citizen')) {
      category = 'roles';
      responseText = `🏛️ **Role-Based Judicial Operating System:**\n\n` +
        `VeriCourt features 3 strictly separated workspaces:\n` +
        `1. **Hon'ble Judge's Chambers (\`/judge\`):** Cause list, 1-click decree pronouncement & FASTER prison bail dispatch.\n` +
        `2. **Advocate Workspace (\`/lawyer\`):** Client brief portfolio, client-side SHA-256 e-filing desk, and Section 65B evidence kits.\n` +
        `3. **Citizen Nyaya Seva (\`/citizen\`):** Plain-language 4-stage case tracker, vernacular AI translation, and certified copy download.`;
      
      relatedLinks = [
        { label: 'Judge Dashboard', url: `/judge` },
        { label: 'Lawyer Desk', url: `/lawyer` },
        { label: 'Citizen Kiosk', url: `/citizen` }
      ];
    } else if (lower.includes('translate') || lower.includes('language') || lower.includes('bhashini') || lower.includes('hindi')) {
      category = 'translation';
      responseText = `🇮🇳 **Bhashini AI Vernacular Judicial Translation:**\n\n` +
        `VeriCourt supports 22 scheduled Indian languages with dual-hash mathematical parity seals, ensuring that translated orders are legally identical in meaning to the English master decree.`;
      
      relatedLinks = [
        { label: 'Bhashini Translator', url: `/translate` },
        { label: 'Citizen Kiosk', url: `/citizen` }
      ];
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('help')) {
      category = 'greeting';
      responseText = `⚖️ **Namaste! I am the VeriCourt AI Judicial Assistant.**\n\n` +
        `I can help you verify court orders, search case dockets, track bail release status, explain legal terms in plain English, and navigate between court workspaces.\n\n` +
        `Try asking:\n` +
        `• *"Check case WP(C)-2026-8941"*\n` +
        `• *"What is the FASTER bail system?"*\n` +
        `• *"How does Section 65B work?"*\n` +
        `• *"Show me the Judge Dashboard"*`;
      
      relatedLinks = [
        { label: 'Case WP(C)-2026-8941', url: `/citizen` },
        { label: 'Open WhatsApp Bot', url: `/whatsapp` },
        { label: 'Role Portals', url: `/portal` }
      ];
    } else {
      category = 'general_assistance';
      responseText = `I analyzed your query: *"I am searching the judicial repository for '${query}'."*\n\n` +
        `To verify an official court order, you can enter any:\n` +
        `• **Case Docket Number** (e.g., \`WP(C)-2026-8941\`, \`2024 INSC 482\`, \`CRL-APP-2025-1142\`)\n` +
        `• **Litigant Party Name** (e.g., \`Ramesh Kumar\`, \`Electoral Bonds\`)\n` +
        `• **64-character SHA-256 Hash**\n` +
        `• Or ask about **Bail**, **Roles**, or **Section 65B** legal compliance.`;
      
      relatedLinks = [
        { label: 'Search Gazette', url: `/explorer` },
        { label: 'Upload PDF to Verify', url: `/verify` },
        { label: 'Citizen WhatsApp Bot', url: `/whatsapp` }
      ];
    }

    return NextResponse.json({
      success: true,
      query,
      category,
      reply: responseText,
      relatedLinks,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
