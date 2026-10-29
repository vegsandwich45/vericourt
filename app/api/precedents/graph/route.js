import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const nodes = [
      {
        id: 'kesavananda',
        title: 'Kesavananda Bharati v. State of Kerala',
        citation: 'AIR 1973 SC 1461',
        year: 1973,
        bench: '13-Judge Constitution Bench',
        ratio: 'Established the Basic Structure Doctrine; Parliament cannot alter the essential identity of the Constitution.',
        status: 'LANDMARK_ANCHOR',
        color: '#c5a059',
        blockNumber: 1,
        evmStateSeal: '0x1461_KESAVANANDA_BHARATI_BASIC_STRUCTURE_ANCHOR_1973',
      },
      {
        id: 'maneka',
        title: 'Maneka Gandhi v. Union of India',
        citation: 'AIR 1978 SC 597',
        year: 1978,
        bench: '7-Judge Constitution Bench',
        ratio: 'Expanded Article 21; procedure depriving personal liberty must be just, fair, and reasonable, not arbitrary.',
        status: 'AFFIRMED',
        color: '#34d399',
        blockNumber: 4,
        evmStateSeal: '0x0597_MANEKA_GANDHI_ARTICLE_21_DUE_PROCESS_1978',
      },
      {
        id: 'minerva',
        title: 'Minerva Mills v. Union of India',
        citation: 'AIR 1980 SC 1789',
        year: 1980,
        bench: '5-Judge Constitution Bench',
        ratio: 'Reaffirmed that judicial review is an integral part of the basic structure of the Constitution.',
        status: 'AFFIRMED',
        color: '#60a5fa',
        blockNumber: 9,
        evmStateSeal: '0x1789_MINERVA_MILLS_JUDICIAL_REVIEW_ANCHOR_1980',
      },
      {
        id: 'puttaswamy',
        title: 'Justice K.S. Puttaswamy v. Union of India',
        citation: '(2017) 10 SCC 1',
        year: 2017,
        bench: '9-Judge Constitution Bench',
        ratio: 'Unanimously declared that privacy is a fundamental right protected under Article 21 and Part III.',
        status: 'AFFIRMED',
        color: '#a855f7',
        blockNumber: 21,
        evmStateSeal: '0x0001_PUTTASWAMY_PRIVACY_FUNDAMENTAL_RIGHT_2017',
      },
      {
        id: 'electoral_bonds',
        title: 'Association for Democratic Reforms (Electoral Bonds)',
        citation: '2024 INSC 482',
        year: 2024,
        bench: '5-Judge Constitution Bench',
        ratio: 'Struck down Electoral Bonds Scheme as unconstitutional, holding that voter information is protected under Article 19(1)(a).',
        status: 'AFFIRMED',
        color: '#f59e0b',
        blockNumber: 42,
        evmStateSeal: '0x0482_ELECTORAL_BONDS_CONSTITUTION_BENCH_SEAL_2024',
      },
      {
        id: 'shilpa_sailesh',
        title: 'Shilpa Sailesh v. Varun Sreenivasan',
        citation: 'AIR 2023 SC 1109',
        year: 2023,
        bench: '5-Judge Constitution Bench',
        ratio: 'Supreme Court can grant divorce on grounds of irretrievable breakdown using extraordinary powers under Article 142.',
        status: 'AFFIRMED',
        color: '#ec4899',
        blockNumber: 35,
        evmStateSeal: '0x7a2c5d8e1f4b7a0c3d6e9f2a3f5c8e1d2b47f9e6a0c3d5b8e2f1a4c7d0b3e6f9',
      },
      {
        id: 'vericourt_wp',
        title: 'Ramesh Kumar Singh v. Union of India',
        citation: 'WP(C)-2026-8941',
        year: 2026,
        bench: 'High Court of Judicature at Bombay',
        ratio: 'Citizen evidentiary certification under Section 65B(4) IEA anchored to immutable EVM consensus blocks.',
        status: 'LIVE_ANCHORED',
        color: '#10b981',
        blockNumber: 12,
        evmStateSeal: '0xa3f5c8e1d2b47f9e6a0c3d5b8e2f1a4c7d0b3e6f9a2c5d8e1f4b7a0c3d6e9f2b',
      },
      {
        id: 'mata_avianca',
        title: 'Mata v. Avianca, Inc. (AI Fake Case)',
        citation: '2023 F.Supp.3d 104',
        year: 2023,
        bench: 'US Federal District Court',
        ratio: 'Synthetic precedent hallucinated by ChatGPT. Attorneys sanctioned for citing non-existent case law.',
        status: 'HALLUCINATED_ALERT',
        color: '#ef4444',
        blockNumber: 0,
        evmStateSeal: '0xZERO_ANCHOR_HALLUCINATED_SYNTHETIC_PRECEDENT',
      },
    ];

    const links = [
      { source: 'kesavananda', target: 'minerva', relationship: 'Reaffirmed Basic Structure' },
      { source: 'kesavananda', target: 'electoral_bonds', relationship: 'Constitutional Scrutiny' },
      { source: 'maneka', target: 'puttaswamy', relationship: 'Substantive Article 21 Due Process' },
      { source: 'puttaswamy', target: 'electoral_bonds', relationship: 'Informational Privacy & Transparency' },
      { source: 'puttaswamy', target: 'vericourt_wp', relationship: 'Evidentiary Privacy & Data Rights' },
      { source: 'kesavananda', target: 'maneka', relationship: 'Fundamental Rights Synthesis' },
      { source: 'maneka', target: 'shilpa_sailesh', relationship: 'Article 142 Substantive Justice' },
    ];

    return NextResponse.json({
      success: true,
      graph: {
        nodes,
        links,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
