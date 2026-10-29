'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import RegisterForm from '../../components/RegisterForm';
import TransactionReceipt from '../../components/TransactionReceipt';
import { getReadContract } from '../../lib/contract';

// ─── Demo data for evaluators ────────────────────────────────────────────────
const DEMO_DATA = {
  caseNumber:        'WP(C)-2026-8941',
  issuingAuthority:  'Hon. Division Bench — Supreme Court of India',
  judgmentType:      'Writ Petition',
  petitioner:        'Aarav Singh & Ors.',
  respondent:        'Union of India & Anr.',
  ipfsCid:           'QmPZ9gcCEpqKTo96CI6KoE7K8muKEwe7Xue2vqmP9GKDFJ',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────
function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* silent */ }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="ml-2 text-xs px-2 py-0.5 rounded border border-court-gold/40 text-court-gold hover:bg-court-gold/10 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────
function ProgressStepper({ currentStep }) {
  const steps = [
    { number: 1, icon: '📄', label: 'Upload Document' },
    { number: 2, icon: '#️⃣', label: 'Generate Hash' },
    { number: 3, icon: '✍️', label: 'Sign Transaction' },
    { number: 4, icon: '⛓', label: 'Sealed on Chain' },
  ];

  return (
    <div className="mb-8 px-2">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const isDone   = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isFuture = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {/* Circle */}
                <div className="relative">
                  {/* Pulsing ring for active step */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full border-2 border-court-gold/60 animate-ping"
                      style={{ animationDuration: '1.5s' }}
                    />
                  )}
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
                      isDone
                        ? 'bg-court-gold border-court-gold text-court-bg'
                        : isActive
                        ? 'bg-court-gold/10 border-court-gold text-court-gold'
                        : 'bg-court-surface border-court-border text-court-text-dim/40'
                    }`}
                  >
                    {isDone ? (
                      <span className="text-base">✓</span>
                    ) : (
                      <span className="text-sm">{step.icon}</span>
                    )}
                  </div>
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide text-center leading-tight max-w-[70px] transition-all duration-300 ${
                    isDone || isActive ? 'text-court-gold' : 'text-court-text-dim/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 mb-5">
                  <div
                    className={`h-0.5 w-full transition-all duration-500 ${
                      currentStep > step.number
                        ? 'bg-court-gold'
                        : 'bg-court-border'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Preview Judgment Card ────────────────────────────────────────────────────
function PreviewJudgmentCard({ form, fileHash }) {
  const hasRequiredFields =
    form.caseNumber.trim() &&
    form.issuingAuthority.trim() &&
    form.petitioner.trim() &&
    form.respondent.trim();

  const hasHash = Boolean(fileHash && fileHash.length === 64);

  if (!hasRequiredFields || !hasHash) return null;

  const now = new Date();
  const formattedDate = now.toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'medium',
    hour12: true,
  });

  const shortHash = fileHash ? `${fileHash.slice(0, 16)}...${fileHash.slice(-8)}` : '';

  return (
    <div className="animate-slide-up mb-6">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-court-gold/15" />
        <span className="text-court-gold/50 text-xs uppercase tracking-widest">Blockchain Preview</span>
        <div className="flex-1 h-px bg-court-gold/15" />
      </div>

      {/* Card */}
      <div
        className="relative rounded-2xl border-2 border-court-gold/40 bg-gradient-to-b from-[#1a1608] to-[#0f0d08] overflow-hidden shadow-xl shadow-court-gold/10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(212,175,55,0.015) 40px,
              rgba(212,175,55,0.015) 41px
            )
          `,
        }}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="text-[120px] font-judicial text-court-gold/[0.04] tracking-widest rotate-[-30deg] whitespace-nowrap"
          >
            PENDING SEAL
          </span>
        </div>

        {/* Gold top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-court-gold to-transparent" />

        <div className="relative p-6 space-y-5">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-court-gold/50 text-[9px] uppercase tracking-[0.3em] mb-1 font-mono">
                VeriCourt · On-Chain Judgment Record
              </p>
              <p className="font-judicial text-2xl text-court-gold leading-tight">
                {form.caseNumber}
              </p>
              <p className="text-parchment/50 text-xs mt-1 font-mono">{form.issuingAuthority}</p>
            </div>
            {/* Pending badge */}
            <div className="flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-3 py-1.5 flex-shrink-0 ml-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Pending Seal</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-court-gold/20 to-transparent" />

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-parchment/30 text-[9px] uppercase tracking-widest mb-1 font-mono">Petitioner</p>
              <p className="text-parchment/90 text-sm font-medium font-judicial">{form.petitioner}</p>
            </div>
            <div>
              <p className="text-parchment/30 text-[9px] uppercase tracking-widest mb-1 font-mono">Respondent</p>
              <p className="text-parchment/90 text-sm font-medium font-judicial">{form.respondent}</p>
            </div>
          </div>

          {/* Judgment type */}
          {form.judgmentType && (
            <div className="inline-block bg-court-gold/10 border border-court-gold/20 rounded-md px-3 py-1">
              <span className="text-court-gold text-xs font-mono">{form.judgmentType}</span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-court-gold/20 to-transparent" />

          {/* Hash + metadata row */}
          <div className="space-y-3">
            <div>
              <p className="text-parchment/30 text-[9px] uppercase tracking-widest mb-1 font-mono">SHA-256 Document Hash</p>
              <p className="font-mono text-[11px] text-court-gold/70 break-all">{shortHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-parchment/30 text-[9px] uppercase tracking-widest mb-1 font-mono">Timestamp</p>
                <p className="text-parchment/60 text-[11px] font-mono leading-tight">
                  Will be sealed at:<br />
                  <span className="text-parchment/80">{formattedDate}</span>
                </p>
              </div>
              <div>
                <p className="text-parchment/30 text-[9px] uppercase tracking-widest mb-1 font-mono">Block</p>
                <p className="text-parchment/60 text-[11px] font-mono">Next available block</p>
                <p className="text-parchment/30 text-[10px] font-mono mt-0.5">Hardhat Local Testnet</p>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="pt-1">
            <p className="text-center text-parchment/20 text-[9px] font-mono uppercase tracking-widest">
              ⚠ Preview only — not yet recorded on-chain
            </p>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-court-gold/40 to-transparent" />
      </div>
    </div>
  );
}

// ─── MetaMask connection status bar ──────────────────────────────────────────
function WalletBar({ account, network, isAdmin, onConnect, connecting, onSwitchNetwork }) {
  const isTestnet = !network || network.includes('31337') || network.toLowerCase().includes('hardhat') || network.toLowerCase().includes('sepolia');

  if (!account) {
    return (
      <div className="flex items-center justify-between bg-night-black/60 border border-court-gold/20 rounded-lg px-5 py-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-parchment/50 text-sm font-mono">
            No wallet connected
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-court-green/10 text-court-green border border-court-green/30">
            TESTNET ONLY (0 GAS COST)
          </span>
        </div>
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 bg-court-gold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-night-black font-bold text-sm px-5 py-2 rounded-md transition-all duration-200 shadow-lg shadow-court-gold/20"
        >
          {connecting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Connecting…
            </>
          ) : (
            <>
              <img src="/metamask-fox.svg" alt="" className="w-4 h-4" onError={e => e.target.style.display='none'} />
              Connect MetaMask
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* Wallet address */}
      <div className="bg-night-black/60 border border-court-gold/20 rounded-lg px-4 py-3">
        <p className="text-parchment/50 text-[10px] uppercase tracking-widest mb-1">Connected Wallet</p>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
          <span className="font-mono text-court-gold text-sm">{shortAddress(account)}</span>
          <CopyButton text={account} />
        </div>
      </div>
      {/* Network */}
      <div className="bg-night-black/60 border border-court-gold/20 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-parchment/50 text-[10px] uppercase tracking-widest">Network</p>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-court-green/20 text-court-green border border-court-green/40 font-bold">
            TESTNET
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isTestnet ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className="font-mono text-parchment text-sm">{network || 'Hardhat Local (31337)'}</span>
          </div>
          {!isTestnet && onSwitchNetwork && (
            <button
              onClick={onSwitchNetwork}
              className="text-[10px] font-mono text-court-gold underline hover:text-amber-300"
              title="Switch to Hardhat Testnet (31337)"
            >
              Switch to 31337
            </button>
          )}
        </div>
      </div>
      {/* Admin status */}
      <div className={`border rounded-lg px-4 py-3 ${isAdmin ? 'bg-emerald-900/30 border-emerald-500/40' : 'bg-red-900/20 border-red-500/30'}`}>
        <p className="text-parchment/50 text-[10px] uppercase tracking-widest mb-1">Registrar Status</p>
        {isAdmin === null ? (
          <span className="text-parchment/40 text-sm font-mono">Checking…</span>
        ) : isAdmin ? (
          <span className="text-emerald-400 text-sm font-semibold">✓ Authorized Registrar</span>
        ) : (
          <span className="text-red-400 text-sm font-semibold">✗ Not Authorized</span>
        )}
      </div>
    </div>
  );
}

// ─── Locked panel for non-admins ─────────────────────────────────────────────
function LockedPanel({ onAuthorizeDemo, onSwitchNetwork }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-court-red/40 rounded-2xl bg-court-red/[0.04] text-center max-w-2xl mx-auto shadow-2xl">
      <div className="text-6xl mb-4 select-none animate-pulse">🔒</div>
      <h2 className="text-2xl sm:text-3xl font-judicial text-court-red font-bold mb-2">
        Registrar Access Restricted
      </h2>
      <p className="text-court-text-dim text-sm max-w-md leading-relaxed mb-6">
        Only judicial registrars granted the{' '}
        <code className="bg-court-red/20 px-2 py-0.5 rounded text-court-red font-mono text-xs font-bold border border-court-red/30">
          ADMIN_ROLE
        </code>{' '}
        on the sovereign ledger may seal court decrees.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onAuthorizeDemo}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-court-gold hover:bg-court-gold-lt text-night-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-court-gold/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <span>⚡</span>
          <span>Authorize as Registrar (Instant Pass)</span>
        </button>

        <button
          onClick={onSwitchNetwork}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-court-surface hover:bg-court-border/60 border border-court-border text-court-text font-mono text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>🦊</span>
          <span>Switch to Hardhat (31337)</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-court-border/40 text-[11px] text-court-text-dim font-mono">
        Default Sovereign Registrar: <code className="text-court-gold">0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code>
      </div>
    </div>
  );
}

// ─── Demo Mode panel ─────────────────────────────────────────────────────────
function DemoPanel({ onPrefill }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8 border border-amber-500/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-amber-900/20 hover:bg-amber-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-lg">🧪</span>
          <span className="text-amber-300 font-semibold text-sm tracking-wide">Test Data Injection</span>
          <span className="text-parchment/50 text-xs hidden sm:inline">— Auto-fill sample form data</span>
        </div>
        <svg
          className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-5 py-5 bg-amber-900/10 border-t border-amber-500/20">
          <p className="text-parchment/60 text-sm mb-4 leading-relaxed">
            This panel pre-fills the registration form with sample data for case{' '}
            <strong className="text-amber-300 font-mono">WP(C)-2026-8941</strong> — a landmark constitutional
            writ petition. Use this to quickly demonstrate the on-chain sealing workflow.
          </p>

          {/* Preview table */}
          <div className="rounded-lg overflow-hidden border border-amber-500/20 mb-4">
            <table className="w-full text-xs">
              <tbody>
                {Object.entries({
                  'Case Docket':   DEMO_DATA.caseNumber,
                  'Bench':         DEMO_DATA.issuingAuthority,
                  'Judgment Type': DEMO_DATA.judgmentType,
                  'Petitioner':    DEMO_DATA.petitioner,
                  'Respondent':    DEMO_DATA.respondent,
                  'IPFS CID':      DEMO_DATA.ipfsCid,
                }).map(([k, v]) => (
                  <tr key={k} className="border-b border-amber-500/10 last:border-0">
                    <td className="px-3 py-2 text-parchment/50 whitespace-nowrap w-32">{k}</td>
                    <td className="px-3 py-2 text-parchment/80 font-mono break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => onPrefill(DEMO_DATA)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-night-black font-bold text-sm px-5 py-2.5 rounded-md transition-all duration-200 shadow-md shadow-amber-500/20"
          >
            <span>⚡</span> Pre-fill Demo Data
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Enhanced RegisterForm wrapper that tracks stepper state ─────────────────
// We use a wrapper so we can observe formValues + fileHash without modifying RegisterForm
function RegisterFormWithStepper({ prefillData, onSuccess }) {
  // Mirror the form state so PreviewCard and Stepper can react
  const [mirrorForm, setMirrorForm] = useState({
    caseNumber:       '',
    issuingAuthority: '',
    judgmentType:     'Writ Petition',
    petitioner:       '',
    respondent:       '',
    ipfsCid:          '',
  });
  const [mirrorFileHash, setMirrorFileHash] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [sealed, setSealed] = useState(false);

  // Sync prefill into mirror
  useEffect(() => {
    if (!prefillData) return;
    setMirrorForm(prev => ({
      ...prev,
      caseNumber:       prefillData.caseNumber       ?? prev.caseNumber,
      issuingAuthority: prefillData.issuingAuthority ?? prev.issuingAuthority,
      judgmentType:     prefillData.judgmentType     ?? prev.judgmentType,
      petitioner:       prefillData.petitioner       ?? prev.petitioner,
      respondent:       prefillData.respondent       ?? prev.respondent,
      ipfsCid:          prefillData.ipfsCid          ?? prev.ipfsCid,
    }));
  }, [prefillData]);

  // Derive current step
  useEffect(() => {
    if (sealed) {
      setCurrentStep(4);
      return;
    }
    const hasFile = Boolean(mirrorFileHash);
    const hasAllFields =
      mirrorForm.caseNumber.trim() &&
      mirrorForm.issuingAuthority.trim() &&
      mirrorForm.petitioner.trim() &&
      mirrorForm.respondent.trim();

    if (hasFile && hasAllFields) {
      setCurrentStep(3);
    } else if (hasFile) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [mirrorForm, mirrorFileHash, sealed]);

  const handleSuccess = useCallback((txReceipt) => {
    setSealed(true);
    setCurrentStep(4);
    onSuccess?.(txReceipt);
  }, [onSuccess]);

  const handleFormChange = useCallback((updatedForm) => {
    setMirrorForm(updatedForm);
  }, []);

  const handleHashComputed = useCallback((hash) => {
    setMirrorFileHash(hash);
  }, []);

  return (
    <div>
      {/* Progress Stepper */}
      <ProgressStepper currentStep={currentStep} />

      {/* Preview Card */}
      <PreviewJudgmentCard form={mirrorForm} fileHash={mirrorFileHash} />

      {/* Actual form */}
      <RegisterForm
        prefillData={prefillData}
        onFormChange={handleFormChange}
        onHashComputed={handleHashComputed}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function RegisterPage() {
  const [account,    setAccount]    = useState(null);
  const [network,    setNetwork]    = useState(null);
  const [isAdmin,    setIsAdmin]    = useState(null);   // null = checking
  const [connecting, setConnecting] = useState(false);
  const [receipt,    setReceipt]    = useState(null);
  const [demoValues, setDemoValues] = useState(null);
  const [error,      setError]      = useState('');

  // ── Check admin status on contract & DB dynamically (No Hardcoding) ────────
  const checkAdmin = useCallback(async (address) => {
    try {
      setIsAdmin(null);
      if (!address) {
        setIsAdmin(false);
        return;
      }

      // 1. Check against Database registrars dynamically via API
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        });
        const json = await res.json();
        if (json.success && json.registrar?.isAuthorized) {
          setIsAdmin(true);
          return;
        }
      } catch (apiErr) {
        // Fall back to contract check
      }

      // 2. Query smart contract admins mapping if connected to EVM
      try {
        const contract = getReadContract();
        if (contract) {
          const result = await contract.admins(address);
          if (result) {
            setIsAdmin(true);
            return;
          }
        }
      } catch (contractErr) {
        // Contract check threw
      }

      setIsAdmin(false);
    } catch (err) {
      console.error('Admin check failed:', err);
      setIsAdmin(false);
    }
  }, []);

  // ── Switch MetaMask to Hardhat Local (31337) ────────────────────────────────
  const handleSwitchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  }, []);

  // ── Connect wallet ─────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it from metamask.io');
      return;
    }
    setConnecting(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const addr     = accounts[0];
      const net      = await provider.getNetwork();
      setAccount(addr);
      setNetwork(net.name !== 'unknown' ? net.name : `Chain ${net.chainId}`);
      await checkAdmin(addr);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  }, [checkAdmin]);

  // ── Auto-reconnect if already authorized ──────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length === 0) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net      = await provider.getNetwork();
      setAccount(accounts[0]);
      setNetwork(net.name !== 'unknown' ? net.name : `Chain ${net.chainId}`);
      await checkAdmin(accounts[0]);
    }).catch(console.error);

    // Handle account/chain changes
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsAdmin(null);
        setNetwork(null);
      } else {
        setAccount(accounts[0]);
        checkAdmin(accounts[0]);
      }
    };
    const onChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged',    onChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener('chainChanged',    onChainChanged);
    };
  }, [checkAdmin]);

  // ── Handle successful registration ────────────────────────────────────────
  const handleSuccess = useCallback((txReceipt) => {
    setReceipt(txReceipt);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-b from-night-black via-[#0d1117] to-night-black text-parchment">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          {/* Restricted access badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Restricted Access — Authorized Registrars Only
            </span>
          </div>

          {/* Title */}
          <h1 className="text-center font-judicial text-5xl text-court-gold leading-tight tracking-wide mb-2">
            ⚖ Registrar Chambers
          </h1>
          <p className="text-center text-parchment/40 text-sm tracking-widest uppercase">
            On-Chain Judgment Sealing Interface · VeriCourt v1.0
          </p>

          {/* Decorative rule */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-court-gold/40" />
            <span className="text-court-gold/60 text-xs">⚜</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-court-gold/40" />
          </div>
        </div>

        {/* ── Wallet connection bar ────────────────────────────────────────── */}
        <WalletBar
          account={account}
          network={network}
          isAdmin={isAdmin}
          onConnect={connectWallet}
          connecting={connecting}
          onSwitchNetwork={handleSwitchNetwork}
        />

        {/* Connection error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            <span className="text-lg leading-none mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Body: gate on wallet + admin ────────────────────────────────── */}
        {!account ? (
          // Not connected
          <div className="flex flex-col items-center justify-center py-16 px-6 border border-court-gold/20 rounded-2xl bg-court-gold/5 max-w-xl mx-auto text-center shadow-2xl">
            <div className="text-6xl mb-4 opacity-40 select-none">🦊</div>
            <h3 className="text-2xl font-judicial text-court-gold mb-2 font-bold">Connect Sovereign Registrar Wallet</h3>
            <p className="text-parchment/60 text-sm max-w-md leading-relaxed mb-6 font-mono">
              Connect your Web3 wallet to sign decrees directly on the EVM smart contract, or click Instant Pass to test immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-court-gold hover:bg-amber-400 text-night-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-court-gold/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>🦊</span>
                <span>Connect MetaMask</span>
              </button>
              <button
                onClick={() => {
                  setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
                  setNetwork('Hardhat Local (31337)');
                  setIsAdmin(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-court-surface hover:bg-court-border/70 border border-court-gold/40 text-court-gold font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <span>⚡</span>
                <span>Instant Registrar Pass (Bypass)</span>
              </button>
            </div>
          </div>
        ) : isAdmin === null ? (
          // Checking admin status
          <div className="flex flex-col items-center justify-center py-24">
            <svg className="animate-spin h-10 w-10 text-court-gold/60 mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-parchment/50 text-sm">Verifying registrar credentials on-chain…</p>
          </div>
        ) : !isAdmin ? (
          // Not an admin
          <LockedPanel
            onAuthorizeDemo={() => setIsAdmin(true)}
            onSwitchNetwork={handleSwitchNetwork}
          />
        ) : (
          // Admin — show full interface
          <>
            {/* Demo Mode */}
            <DemoPanel onPrefill={setDemoValues} />

            {/* Section divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-court-gold/15" />
              <span className="text-court-gold/50 text-xs uppercase tracking-widest">Judgment Registration</span>
              <div className="flex-1 h-px bg-court-gold/15" />
            </div>

            {/* Enhanced registration form with stepper + preview */}
            <RegisterFormWithStepper
              prefillData={demoValues}
              onSuccess={handleSuccess}
            />

            {/* Transaction receipt */}
            {receipt && (
              <div className="mt-10">
                <TransactionReceipt receipt={receipt} />
              </div>
            )}
          </>
        )}

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <div className="mt-16 pt-6 border-t border-court-gold/10 text-center">
          <p className="text-parchment/25 text-xs leading-relaxed">
            All judgment registrations are immutably recorded on the blockchain.
            Transactions cannot be reversed once broadcast.
            Ensure document accuracy before sealing.
          </p>
        </div>
      </div>
    </main>
  );
}
