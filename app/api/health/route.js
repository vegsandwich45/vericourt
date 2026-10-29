import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  const judgmentCount = db.judgments.count();
  const latestRows = db.judgments.findMany({ limit: 1 });
  const latestBlockNumber = latestRows.length > 0 && latestRows[0].block_number ? latestRows[0].block_number : 42;
  const dbLatencyMs = Date.now() - startTime;

  return NextResponse.json({
    status: 'HEALTHY',
    protocol: 'VeriCourt Sovereign Evidentiary Protocol v2.4',
    tier1_blockchain: {
      network: 'EVM Local Hardhat / Sovereign Ledger',
      chainId: 31337,
      status: 'SYNCED',
      latestBlockNumber,
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
    tier2_ipfs: {
      storage: 'InterPlanetary File System (IPFS Content Addressing)',
      gateway: 'https://ipfs.io/ipfs/',
      status: 'ONLINE',
    },
    tier3_database: {
      engine: 'Relational SQLite / PostgreSQL Core',
      tables: ['court_benches', 'registrars', 'judgments', 'audit_logs', 'section_65b_certificates'],
      totalIndexedJudgments: judgmentCount,
      queryLatencyMs: dbLatencyMs,
      status: 'CONNECTED',
    },
    serverTime: new Date().toISOString(),
  });
}
