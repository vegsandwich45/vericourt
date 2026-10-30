// ─── VeriCourt Smart Contract Integration ────────────────────────────────────
// Provides ethers.js provider, signer, and typed contract instance.
// Reads ABI from /public/VeriCourtABI.json (auto-exported by deploy.js).

"use client";

import { ethers } from "ethers";

// ── Constants ─────────────────────────────────────────────────────────────────
export const RPC_URL          = process.env.NEXT_PUBLIC_RPC_URL          || "https://ethereum-sepolia-rpc.publicnode.com";
export const CHAIN_ID         = Number(process.env.NEXT_PUBLIC_CHAIN_ID  || 11155111);
export const CHAIN_NAME       = process.env.NEXT_PUBLIC_CHAIN_NAME       || "Sepolia";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS  || "0x27f0323E526Edf3769A621Ee3c60a9f3bd2EC56c";

// ── Dynamic Contract & Network Resolution ─────────────────────────────────────
export function getActiveContractAddress() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem('vericourt_contract_address');
    if (saved && saved.startsWith('0x')) return saved;
  }
  return CONTRACT_ADDRESS || "0x27f0323E526Edf3769A621Ee3c60a9f3bd2EC56c";
}

export function getActiveNetworkConfig() {
  let chainId = CHAIN_ID;
  let chainName = CHAIN_NAME;
  let rpcUrl = RPC_URL;

  if (typeof window !== "undefined") {
    const savedChain = localStorage.getItem('vericourt_chain_id');
    if (savedChain === '11155111' || (!process.env.NEXT_PUBLIC_CHAIN_ID && window.location.hostname !== 'localhost')) {
      chainId = 11155111;
      chainName = 'Sepolia';
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    }
  }
  return { chainId, chainName, rpcUrl };
}

// ── Minimal ABI (all functions needed by frontend) ───────────────────────────
// This is inlined as fallback if /public/VeriCourtABI.json fails to load.
export const VERICOURT_ABI = [
  // Register
  "function registerJudgment(string caseNumber, string courtName, string ipfsHash, string documentHash, string judgmentType, string petitioner, string respondent) external",

  // Verify by hash
  "function verifyJudgment(string documentHash) external view returns (bool isAuthentic, string caseNumber, string courtName, string ipfsHash, uint256 timestamp, string judgmentType, string petitioner, string respondent)",

  // Lookup by case number
  "function getJudgmentByCase(string caseNumber) external view returns (bool isAuthentic, string documentHash, string courtName, string ipfsHash, uint256 timestamp, string judgmentType, string petitioner, string respondent, address registrar)",

  // Admin
  "function addAdmin(address admin) external",
  "function removeAdmin(address admin) external",
  "function deactivateJudgment(string documentHash) external",

  // View
  "function owner() external view returns (address)",
  "function totalJudgments() external view returns (uint256)",
  "function admins(address) external view returns (bool)",
  "function getTotalJudgments() external view returns (uint256)",
  "function getHashAtIndex(uint256 index) external view returns (string)",
  "function getContractInfo() external view returns (address owner, uint256 deployedAt, uint256 totalJudgments)",

  // Events
  "event JudgmentRegistered(string indexed documentHash, string indexed caseNumber, string courtName, string ipfsHash, address registrar, uint256 timestamp)",
  "event JudgmentDeactivated(string indexed documentHash, address deactivatedBy, uint256 timestamp)",
  "event AdminAdded(address indexed admin, address indexed addedBy)",
  "event AdminRemoved(address indexed admin, address indexed removedBy)",
];

// ── Read-only JSON-RPC Provider (no wallet needed for verify) ─────────────────
export function getReadProvider() {
  try {
    const { chainId, chainName, rpcUrl } = getActiveNetworkConfig();
    const net = ethers.Network.from({
      chainId,
      name:    chainName,
    });
    return new ethers.JsonRpcProvider(
      rpcUrl,
      net,
      { staticNetwork: net }
    );
  } catch {
    return null;
  }
}

// ── Read-only contract (for verifyJudgment, explorer) ─────────────────────────
export function getReadContract(address = null) {
  const targetAddress = address || getActiveContractAddress();
  const provider = getReadProvider();
  if (!provider || !targetAddress) return null;
  return new ethers.Contract(targetAddress, VERICOURT_ABI, provider);
}

// ── Signer-connected contract (for registerJudgment — requires MetaMask) ──────
export async function getSignerContract(address = null) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install the MetaMask extension.");
  }

  const targetAddress = address || getActiveContractAddress();
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Request account access
  await provider.send("eth_requestAccounts", []);

  // Verify network
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const isTestnet = currentChainId === 31337 || currentChainId === 11155111;

  if (currentChainId === 1) {
    throw new Error(
      "Ethereum Mainnet Detected! Real gas fees are disabled for this portal. Please switch MetaMask to Sepolia Testnet or Hardhat Local."
    );
  }

  if (!isTestnet) {
    throw new Error(
      `Unsupported network (Chain ID: ${currentChainId}). Please switch MetaMask to Sepolia Testnet (Chain ID 11155111).`
    );
  }

  const signer = await provider.getSigner();
  return new ethers.Contract(targetAddress, VERICOURT_ABI, signer);
}

// ── Current connected account ─────────────────────────────────────────────────
export async function getCurrentAccount() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts[0] || null;
}

// ── Network info ──────────────────────────────────────────────────────────────
export async function getNetworkInfo() {
  try {
    const provider  = getReadProvider();
    if (!provider) return { connected: false };
    const block     = await provider.getBlock("latest");
    if (!block || typeof block.number !== "number") return { connected: false };
    const gasPrice  = await provider.getFeeData();
    const network   = await provider.getNetwork();
    return {
      blockNumber:  block.number,
      timestamp:    block.timestamp,
      gasPrice:     gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : "0.0",
      chainId:      Number(network.chainId),
      chainName:    CHAIN_NAME,
      rpcUrl:       RPC_URL,
      connected:    true,
    };
  } catch {
    return { connected: false };
  }
}

// ── Format address ─────────────────────────────────────────────────────────────
export function shortAddress(addr) {
  if (!addr) return "N/A";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Format timestamp ───────────────────────────────────────────────────────────
export function formatTimestamp(ts) {
  if (!ts) return "N/A";
  return new Date(Number(ts) * 1000).toLocaleString("en-IN", {
    timeZone:    "Asia/Kolkata",
    year:        "numeric",
    month:       "long",
    day:         "numeric",
    hour:        "2-digit",
    minute:      "2-digit",
    second:      "2-digit",
    hour12:      true,
  });
}
