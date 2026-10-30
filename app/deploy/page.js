'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import artifact from '@/lib/VeriCourtArtifact.json';
import { getActiveContractAddress } from '@/lib/contract';

const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export default function DeployPage() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0.0');
  const [connecting, setConnecting] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  
  // Deployment state
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [txHash, setTxHash] = useState('');
  const [deployedAddress, setDeployedAddress] = useState('');
  const [deployError, setDeployError] = useState('');
  const [existingContract, setExistingContract] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasEth = !!window.ethereum;
      setHasMetaMask(hasEth);

      const active = getActiveContractAddress();
      if (active && active.startsWith('0x') && active !== '0x5FbDB2315678afecb367f032d93F642f64180aa3') {
        setExistingContract(active);
      }

      if (hasEth) {
        checkWalletConnection();
        // Listeners for account and chain changes
        window.ethereum.on?.('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchBalance(accounts[0]);
          } else {
            setAccount('');
            setBalance('0.0');
          }
        });
        window.ethereum.on?.('chainChanged', (chain) => {
          setChainId(parseInt(chain, 16));
        });
      }
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      }
    } catch (e) {
      console.warn('Wallet check failed:', e);
    }
  };

  const fetchBalance = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(addr);
      setBalance(Number(ethers.formatEther(bal)).toFixed(4));
    } catch (e) {
      console.warn('Balance check failed:', e);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;
    setConnecting(true);
    setDeployError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      }
    } catch (err) {
      setDeployError(err.message || 'Failed to connect MetaMask');
    } finally {
      setConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    setSwitchingNetwork(true);
    setDeployError('');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    } catch (switchError) {
      // Chain not added error code: 4902
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          setDeployError('Failed to add Sepolia testnet to MetaMask.');
        }
      } else {
        setDeployError(switchError.message || 'Failed to switch network.');
      }
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const handleDeployContract = async () => {
    if (!window.ethereum) {
      setDeployError('MetaMask is required to deploy.');
      return;
    }
    if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
      setDeployError('Please switch MetaMask to Sepolia Testnet first.');
      return;
    }
    if (parseFloat(balance) <= 0) {
      setDeployError('Insufficient Sepolia ETH for gas. Please claim free test ETH from the faucet below.');
      return;
    }

    setDeploying(true);
    setDeployError('');
    setDeployStep('1/3: Prompting MetaMask for deployment signature...');
    setTxHash('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
      
      setDeployStep('2/3: Broadcasting contract deployment to Sepolia mempool...');
      const contract = await factory.deploy();
      
      const deploymentTx = contract.deploymentTransaction();
      if (deploymentTx) {
        setTxHash(deploymentTx.hash);
      }

      setDeployStep('3/3: Mining transaction into Sepolia block (takes ~12 seconds)...');
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setDeployedAddress(address);
      setExistingContract(address);

      // Save locally in browser
      localStorage.setItem('vericourt_contract_address', address);
      localStorage.setItem('vericourt_chain_id', '11155111');

      // Sync with server API
      try {
        await fetch('/api/config/update-contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractAddress: address,
            chainId: 11155111,
            networkName: 'Sepolia',
            txHash: deploymentTx?.hash || '',
          }),
        });
      } catch (syncErr) {
        console.warn('Config sync warning:', syncErr);
      }

      setDeployStep('Deployment Completed Successfully!');
    } catch (err) {
      console.error('Deployment error:', err);
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected')) {
        setDeployError('Transaction was rejected in MetaMask.');
      } else {
        setDeployError(err.message || 'Deployment failed. Check your MetaMask balance.');
      }
    } finally {
      setDeploying(false);
    }
  };

  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DEC;
  const hasFunds = parseFloat(balance) > 0;

  return (
    <div className="min-h-screen bg-night-black text-court-text pb-24">
      {/* Top Banner */}
      <div className="border-b border-court-border/40 bg-court-surface/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🏛️</span>
                <span className="font-judicial tracking-widest text-xs uppercase text-court-gold font-bold">
                  Sovereign Infrastructure Deployment
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-court-gold/10 text-court-gold border border-court-gold/30 rounded">
                  Public EVM
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-judicial font-bold text-court-text">
                Deploy VeriCourt Smart Contract to Ethereum Sepolia
              </h1>
              <p className="text-court-text-dim text-sm mt-1">
                One-click deployment using your connected MetaMask wallet. Raw cryptographic immutability viewable on Etherscan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/judge"
                className="px-4 py-2 rounded text-xs font-mono border border-court-border hover:border-court-gold text-court-text hover:text-court-gold transition-colors"
              >
                ⚖️ Judge Chambers
              </Link>
              <Link
                href="/explorer"
                className="px-4 py-2 rounded text-xs font-mono bg-court-gold/10 border border-court-gold/40 text-court-gold hover:bg-court-gold hover:text-night-black transition-colors"
              >
                📜 Gazette Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Active Contract Banner (if any) */}
        {existingContract && (
          <div className="vc-card bg-court-surface/80 border-court-gold/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-court-green/10 border border-court-green/40 flex items-center justify-center text-lg text-court-green">
                ✓
              </div>
              <div>
                <div className="text-xs font-mono text-court-green font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-court-green animate-pulse" />
                  CURRENTLY ACTIVE SEPOLIA CONTRACT
                </div>
                <div className="font-mono text-xs text-court-gold select-all break-all mt-0.5">
                  {existingContract}
                </div>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/address/${existingContract}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded text-xs font-mono bg-court-gold text-night-black font-bold hover:bg-court-gold/90 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>View on Etherscan</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* Step-by-Step Deployment Card */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-6 p-6 md:p-8">
          <div className="border-b border-court-border/50 pb-4">
            <h2 className="text-lg font-judicial font-bold text-court-text flex items-center gap-2">
              <span>🦊</span>
              <span>MetaMask Connection & Network Status</span>
            </h2>
            <p className="text-xs text-court-text-dim mt-1">
              Connect your MetaMask wallet to deploy the Solidity smart contract directly to the public testnet.
            </p>
          </div>

          {!hasMetaMask ? (
            <div className="p-4 rounded-lg bg-court-red/10 border border-court-red/40 text-court-red text-sm">
              <p className="font-bold">⚠️ MetaMask Extension Not Detected</p>
              <p className="text-xs mt-1">
                Please install MetaMask from{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-court-gold"
                >
                  metamask.io
                </a>{' '}
                and refresh this page.
              </p>
            </div>
          ) : !account ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-court-text-dim">
                Connect the MetaMask account you will use as the Chief Registrar & Sovereign Owner.
              </p>
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="px-6 py-3 rounded-lg font-mono text-sm bg-court-gold text-night-black font-bold hover:bg-court-gold/90 transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <span>🦊</span>
                <span>{connecting ? 'Connecting...' : 'Connect MetaMask Wallet'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-night-black/60 border border-court-border/60">
                  <span className="text-[10px] font-mono uppercase text-court-text-dim block">
                    Connected Wallet
                  </span>
                  <span className="font-mono text-xs text-court-gold truncate block mt-1" title={account}>
                    {account.slice(0, 8)}…{account.slice(-6)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-night-black/60 border border-court-border/60">
                  <span className="text-[10px] font-mono uppercase text-court-text-dim block">
                    Target Network
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {isSepolia ? (
                      <span className="text-xs font-mono text-court-green font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-court-green" />
                        Sepolia (11155111)
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-court-red font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-court-red" />
                        Wrong Net ({chainId || 'Unknown'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-night-black/60 border border-court-border/60">
                  <span className="text-[10px] font-mono uppercase text-court-text-dim block">
                    Sepolia Balance
                  </span>
                  <span className={`font-mono text-xs font-bold block mt-1 ${hasFunds ? 'text-court-green' : 'text-court-red'}`}>
                    {balance} Sepolia ETH
                  </span>
                </div>
              </div>

              {/* Warning if on wrong network */}
              {!isSepolia && (
                <div className="p-4 rounded-lg bg-court-red/10 border border-court-red/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-court-red block">
                      ⚠️ MetaMask is connected to an unsupported network
                    </span>
                    <span className="text-xs text-court-text-dim mt-0.5 block">
                      Switch to Ethereum Sepolia Testnet to deploy the contract.
                    </span>
                  </div>
                  <button
                    onClick={switchToSepolia}
                    disabled={switchingNetwork}
                    className="px-4 py-2 rounded text-xs font-mono bg-court-red text-white font-bold hover:bg-court-red/90 transition-colors whitespace-nowrap"
                  >
                    {switchingNetwork ? 'Switching...' : 'Switch to Sepolia ↗'}
                  </button>
                </div>
              )}

              {/* Warning if no funds */}
              {isSepolia && !hasFunds && (
                <div className="p-4 rounded-lg bg-court-gold/10 border border-court-gold/40 space-y-2">
                  <div className="flex items-center gap-2 text-court-gold font-bold text-xs">
                    <span>⛽</span>
                    <span>Zero Sepolia ETH Detected</span>
                  </div>
                  <p className="text-xs text-court-text-dim leading-relaxed">
                    Deploying a smart contract requires free testnet gas. Claim 0.05 Sepolia ETH for free in 30 seconds using these faucets:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded text-xs font-mono bg-court-gold text-night-black font-bold hover:bg-court-gold/90 transition-colors"
                    >
                      Google Cloud Sepolia Faucet ↗
                    </a>
                    <a
                      href="https://sepolia-faucet.pk910.de/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded text-xs font-mono border border-court-gold/40 text-court-gold hover:bg-court-gold/20 transition-colors"
                    >
                      PoW Faucet (Zero Login) ↗
                    </a>
                    <button
                      onClick={() => fetchBalance(account)}
                      className="px-3 py-1.5 rounded text-xs font-mono border border-court-border text-court-text-dim hover:text-court-text hover:border-court-text transition-colors"
                    >
                      🔄 Refresh Balance
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {deployError && (
            <div className="p-3 rounded-lg bg-court-red/10 border border-court-red/40 text-court-red text-xs">
              {deployError}
            </div>
          )}

          {/* Deployment Button */}
          {hasMetaMask && account && (
            <div className="pt-4 border-t border-court-border/50">
              <button
                onClick={handleDeployContract}
                disabled={deploying || !isSepolia || !hasFunds}
                className="w-full py-4 rounded-lg font-mono text-sm uppercase tracking-wider font-bold bg-gradient-to-r from-court-gold to-yellow-600 text-night-black hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-night-black border-t-transparent rounded-full animate-spin" />
                    <span>{deployStep || 'Deploying Contract...'}</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Deploy VeriCourt Smart Contract to Sepolia</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Live Deployment Receipt Card */}
        {deployedAddress && (
          <div className="vc-card bg-court-surface/95 border-court-green/60 p-6 md:p-8 space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-court-green/20 border-2 border-court-green flex items-center justify-center text-2xl text-court-green">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-court-green font-bold block">
                  DEPLOYMENT CONFIRMED ON ETHEREUM SEPOLIA
                </span>
                <h3 className="text-xl font-judicial font-bold text-court-text">
                  VeriCourt Sovereign Contract is Live!
                </h3>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs bg-night-black/70 p-4 rounded-lg border border-court-border/60">
              <div>
                <span className="text-court-text-dim block text-[10px]">NEW CONTRACT ADDRESS:</span>
                <span className="text-court-gold font-bold select-all text-sm break-all">{deployedAddress}</span>
              </div>
              {txHash && (
                <div>
                  <span className="text-court-text-dim block text-[10px]">DEPLOYMENT TX HASH:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-court-text hover:text-court-gold underline break-all"
                  >
                    {txHash} ↗
                  </a>
                </div>
              )}
              <div>
                <span className="text-court-text-dim block text-[10px]">CHIEF REGISTRAR (DEPLOYER):</span>
                <span className="text-court-text">{account}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://sepolia.etherscan.io/address/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded text-xs font-mono bg-court-gold text-night-black font-bold hover:bg-court-gold/90 transition-colors flex items-center gap-1.5"
              >
                <span>View on Sepolia Etherscan</span>
                <span>↗</span>
              </a>
              <Link
                href="/judge"
                className="px-4 py-2 rounded text-xs font-mono bg-court-green/20 border border-court-green/40 text-court-green font-bold hover:bg-court-green hover:text-night-black transition-colors"
              >
                ⚖️ Open Judge Chambers & Seal Judgment
              </Link>
              <Link
                href="/explorer"
                className="px-4 py-2 rounded text-xs font-mono border border-court-border text-court-text hover:border-court-gold hover:text-court-gold transition-colors"
              >
                📜 Open Gazette Audit Explorer
              </Link>
            </div>
          </div>
        )}

        {/* Technical Architecture Info Box */}
        <div className="p-5 rounded-lg bg-court-surface/40 border border-court-border/40 space-y-3 text-xs text-court-text-dim leading-relaxed font-mono">
          <div className="text-court-gold font-bold text-sm font-judicial flex items-center gap-2">
            <span>🛡️</span>
            <span>Why This Direct MetaMask Deployment is Superior</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>
              <strong>No private keys exposed:</strong> Hardhat and external scripts do not need your private key; MetaMask handles the cryptographic signing securely in your browser.
            </li>
            <li>
              <strong>Immediate Public Etherscan Verification:</strong> Once deployed, the contract is directly indexable on Ethereum Sepolia public blockchain.
            </li>
            <li>
              <strong>Native VeriCourt Wiring:</strong> The new contract address is automatically saved to your browser session and active configuration.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
