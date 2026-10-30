import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { contractAddress, chainId = 11155111, networkName = 'Sepolia', txHash = '' } = await request.json();

    if (!contractAddress || !contractAddress.startsWith('0x')) {
      return NextResponse.json({ success: false, error: 'Invalid contract address' }, { status: 400 });
    }

    // Update public/VeriCourtABI.json if possible
    try {
      const publicAbiPath = path.join(process.cwd(), 'public/VeriCourtABI.json');
      if (fs.existsSync(publicAbiPath)) {
        const abiData = JSON.parse(fs.readFileSync(publicAbiPath, 'utf8'));
        abiData.address = contractAddress;
        abiData.network = {
          name: networkName,
          chainId: Number(chainId),
          rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
        };
        abiData.deployedAt = new Date().toISOString();
        if (txHash) abiData.deploymentTxHash = txHash;
        fs.writeFileSync(publicAbiPath, JSON.stringify(abiData, null, 2));
      }
    } catch (e) {
      console.warn('Could not update VeriCourtABI.json (filesystem may be read-only on Vercel):', e.message);
    }

    // Update .env.local if running locally
    try {
      const envLocalPath = path.join(process.cwd(), '.env.local');
      const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n` +
        `NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com\n` +
        `NEXT_PUBLIC_CHAIN_ID=${chainId}\n` +
        `NEXT_PUBLIC_CHAIN_NAME=${networkName}\n` +
        `NEXT_PUBLIC_NETWORK_CURRENCY=ETH\n`;
      fs.writeFileSync(envLocalPath, envContent);
    } catch (e) {
      console.warn('Could not update .env.local:', e.message);
    }

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      networkName,
      txHash,
      etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
    });
  } catch (err) {
    console.error('Update contract config error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
