"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, ShieldCheck, ShieldAlert, FileSignature, CheckCircle2, Terminal, UploadCloud, Lock } from "lucide-react";
import CryptoJS from "crypto-js";

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState(["[SYSTEM] Initializing VeriCourt Simulation Environment..."]);
  const [cursorPos, setCursorPos] = useState({ x: 150, y: 250 });
  const [cursorOpacity, setCursorOpacity] = useState(0);
  const [showMetamask, setShowMetamask] = useState(false);
  
  // Mini-game state
  const originalText = "The defendant is fined Rs. 1,000.";
  const [tamperText, setTamperText] = useState(originalText);
  const currentHash = "0x" + CryptoJS.SHA256(tamperText).toString(CryptoJS.enc.Hex);
  const isTampered = tamperText !== originalText;

  const terminalRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Step sequences (Auto-Pilot)
  useEffect(() => {
    let timeoutIds = [];

    if (step === 0) {
      setCursorOpacity(0);
      setLogs(["[SYSTEM] Initializing VeriCourt Simulation Environment...", "[CLIENT] Awaiting document upload..."]);
      
      timeoutIds.push(setTimeout(() => { setCursorOpacity(1); setCursorPos({ x: 150, y: 150 }); }, 1000));
      timeoutIds.push(setTimeout(() => { addLog("[USER] Clicked 'Upload Document'"); }, 2000));
      timeoutIds.push(setTimeout(() => { addLog("[CLIENT] Reading file to ArrayBuffer..."); }, 2500));
      timeoutIds.push(setTimeout(() => { addLog("[CLIENT] Calculating SHA-256 Hash locally..."); }, 3500));
      timeoutIds.push(setTimeout(() => { addLog(`[RESULT] Fingerprint: 0x8f43a9b2...`); }, 4500));
    } 
    else if (step === 1) {
      setLogs(["[SYSTEM] Proceeding to On-Chain Registration..."]);
      timeoutIds.push(setTimeout(() => { setCursorOpacity(1); setCursorPos({ x: 150, y: 220 }); }, 1000));
      timeoutIds.push(setTimeout(() => { addLog("[USER] Clicked 'Execute On-Chain Seal'"); setShowMetamask(true); }, 2000));
      timeoutIds.push(setTimeout(() => { addLog("[WEB3] Requesting wallet signature via MetaMask..."); }, 2500));
    }
    else if (step === 2) {
      setShowMetamask(false);
      setCursorOpacity(0);
      setLogs(["[SYSTEM] Verifying document authenticity..."]);
      timeoutIds.push(setTimeout(() => { addLog("[RPC] Querying Smart Contract: verifyJudgment(hash)"); }, 1000));
      timeoutIds.push(setTimeout(() => { addLog("[NODE] O(1) Lookup executed. Gas Cost: 0 WEI"); }, 2000));
      timeoutIds.push(setTimeout(() => { addLog("[RESULT] Authentic match found in mapping."); }, 3000));
    }
    else if (step === 3) {
      setCursorOpacity(0);
      setTamperText(originalText);
      setLogs(["[SYSTEM] Entering Tamper Detection Sandbox...", "[CLIENT] Real-time hash monitoring active."]);
    }

    return () => timeoutIds.forEach(clearTimeout);
  }, [step]);

  // Tamper detection effect
  useEffect(() => {
    if (step === 3 && isTampered) {
      addLog("[WARNING] Avalanche Effect triggered! Content mutated.");
      addLog(`[CALCULATING] New Hash: ${currentHash.substring(0, 16)}...`);
      addLog("[BLOCKCHAIN] Hash mismatch. INTEGRITY VIOLATION.");
    }
  }, [tamperText, step, isTampered]);

  const confirmMetamask = () => {
    setShowMetamask(false);
    addLog("[METAMASK] Signature received. Tx Signed.");
    addLog("[RPC] Broadcasting transaction to mempool...");
    setTimeout(() => addLog("[MINER] Mining Block #1042..."), 1000);
    setTimeout(() => addLog("[CONTRACT] Judgment mapped to Hash. Gas: 42,041 WEI"), 2000);
    setTimeout(() => addLog("[SUCCESS] Document cryptographically sealed."), 3000);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const demoSteps = [
    {
      title: "Step 1: The Ghost Cursor & Client Hashing",
      desc: "Watch the automated cursor upload a document. The PDF never leaves the browser; a cryptographic fingerprint is generated locally."
    },
    {
      title: "Step 2: Web3 Wallet Signature",
      desc: "To seal the document, a real Web3 transaction is required. Watch the simulated MetaMask popup ask for a cryptographically secure signature."
    },
    {
      title: "Step 3: O(1) Smart Contract Verification",
      desc: "When an auditor uploads the same document, the system queries the blockchain in constant time without gas fees, confirming its authenticity."
    },
    {
      title: "Step 4: The Avalanche Effect (Mini-Game)",
      desc: "Try altering the text below. Watch how changing a single number completely destroys the 256-bit hash, immediately exposing the forgery."
    }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
        
        {/* Header */}
        <div className="text-center mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            Interactive Simulation Sandbox
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-gray-100 mb-3 flex items-center justify-center">
            VeriCourt Protocol
          </h1>
          <p className="text-gray-400 font-light max-w-2xl mx-auto">
            Experience the full cryptographic verification flow in a simulated, isolated environment. No Web3 wallet required.
          </p>
        </div>

        <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
          
          {/* LEFT SIDE: Visual UI Simulator */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-900 absolute top-0 left-0 z-10">
              <motion.div 
                className="h-full bg-[#C9A84C]"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / demoSteps.length) * 100}%` }}
              />
            </div>

            {/* Fake MetaMask Popup */}
            <AnimatePresence>
              {showMetamask && (
                <motion.div 
                  initial={{ y: -500, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -500, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="absolute top-4 right-4 w-72 bg-[#121212] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center text-orange-500 font-bold text-sm">
                      <span className="w-6 h-6 mr-2 bg-orange-500/20 rounded-full flex items-center justify-center">🦊</span>
                      MetaMask Simulation
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-400 mb-1">Signature Request</div>
                    <div className="text-sm text-gray-200 break-all bg-black p-2 rounded border border-gray-800 mb-4 font-mono">
                      registerJudgment(0x8f43...a9b2)
                    </div>
                    <div className="flex justify-between text-xs mb-6">
                      <span className="text-gray-400">Estimated Gas:</span>
                      <span className="text-gray-200">~0.0012 ETH ($3.40)</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setShowMetamask(false)} className="flex-1 px-3 py-2 border border-gray-600 rounded text-gray-300 text-sm hover:bg-gray-800 transition-colors">Reject</button>
                      <button onClick={confirmMetamask} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm font-semibold transition-colors">Sign & Confirm</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ghost Cursor */}
            <motion.div 
              animate={{ x: cursorPos.x, y: cursorPos.y, opacity: cursorOpacity }}
              transition={{ type: "tween", ease: "easeInOut", duration: 1 }}
              className="absolute z-40 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: 24, height: 24 }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.33984 2.80957L17.5898 11.4596C18.3698 11.9696 18.0698 13.2096 17.1598 13.3196L12.3098 13.9196L9.66984 19.3896C9.30984 20.1396 8.23984 20.0896 7.95984 19.3096L4.01984 8.04957" fill="white"/>
                <path d="M4.33984 2.80957L17.5898 11.4596C18.3698 11.9696 18.0698 13.2096 17.1598 13.3196L12.3098 13.9196L9.66984 19.3896C9.30984 20.1396 8.23984 20.0896 7.95984 19.3096L4.01984 8.04957L4.33984 2.80957Z" stroke="black" strokeWidth="1.5"/>
              </svg>
            </motion.div>

            {/* UI Window Content */}
            <div className="flex-1 p-8 flex flex-col justify-center items-center relative z-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md"
                >
                  {step === 0 && (
                    <div className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-gray-900 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="text-gray-300 font-medium mb-1">Upload Decree.pdf</div>
                      <div className="text-xs text-gray-500">Auto-generating hash...</div>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "100%" }} 
                        transition={{ delay: 2.5, duration: 1 }}
                        className="h-1 bg-[#C9A84C] mt-4 rounded-full"
                      />
                    </div>
                  )}
                  
                  {step === 1 && (
                    <div className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center">
                      <FileSignature className="w-16 h-16 text-[#C9A84C] mx-auto mb-4" />
                      <div className="text-sm font-mono text-gray-400 break-all bg-gray-900 p-3 rounded border border-gray-800 mb-6">
                        Hash: 0x8f43a9b2...
                      </div>
                      <button className="bg-[#C9A84C] text-black font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center hover:bg-yellow-600 transition-colors">
                        <Lock className="w-4 h-4 mr-2" /> Execute On-Chain Seal
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="bg-green-950/20 border border-green-900/50 rounded-xl p-8 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                      <ShieldCheck className="w-20 h-20 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-serif text-gray-100 mb-1">AUTHENTIC JUDGMENT</h3>
                      <div className="text-green-500/80 font-mono text-sm">Blockchain Match Verified</div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 relative">
                        <div className="absolute -top-3 left-4 bg-[#111] px-2 text-xs font-mono text-[#C9A84C]">Document Text (Editable)</div>
                        <textarea 
                          value={tamperText}
                          onChange={(e) => setTamperText(e.target.value)}
                          className={`w-full bg-black/50 border rounded-lg p-4 text-gray-200 focus:outline-none transition-colors ${isTampered ? 'border-red-500/50' : 'border-gray-700 focus:border-[#C9A84C]'}`}
                          rows={3}
                        />
                      </div>
                      
                      <div className={`p-6 rounded-xl border transition-all duration-300 ${isTampered ? 'bg-red-950/30 border-red-900/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'bg-black/50 border-gray-800'}`}>
                        <div className="flex items-center mb-3">
                          {isTampered ? <ShieldAlert className="w-6 h-6 text-red-500 mr-2" /> : <ShieldCheck className="w-6 h-6 text-[#C9A84C] mr-2" />}
                          <span className={`font-mono text-sm ${isTampered ? 'text-red-500' : 'text-gray-400'}`}>
                            {isTampered ? 'INTEGRITY VIOLATION' : 'CURRENT SHA-256 HASH'}
                          </span>
                        </div>
                        <div className={`font-mono text-xs break-all p-3 rounded transition-colors ${isTampered ? 'bg-red-900/20 text-red-300' : 'bg-gray-900 text-[#C9A84C]'}`}>
                          {currentHash}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls Footer */}
            <div className="bg-[#0a0a0a] border-t border-gray-800 p-4 flex items-center justify-between">
              <button onClick={prevStep} disabled={step === 0} className="px-4 py-2 text-sm text-gray-400 disabled:opacity-30 hover:text-white transition-colors">Previous</button>
              <div className="text-center flex-1 px-4">
                <div className="text-[#C9A84C] font-serif text-lg">{demoSteps[step].title}</div>
                <div className="text-gray-500 text-xs hidden md:block mt-1">{demoSteps[step].desc}</div>
              </div>
              <button onClick={nextStep} disabled={step === 3} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-30 transition-colors">Next Step</button>
            </div>
          </div>

          {/* RIGHT SIDE: Hacker Terminal */}
          <div className="bg-[#050505] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center">
              <Terminal className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs font-mono text-gray-400">Node Logs / Web3 Environment</span>
              <div className="ml-auto flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 p-6 font-mono text-xs overflow-y-auto scroll-smooth leading-relaxed"
            >
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 ${
                    log.includes("[WARNING]") || log.includes("VIOLATION") ? "text-red-400" :
                    log.includes("[SUCCESS]") || log.includes("[RESULT]") ? "text-green-400" :
                    log.includes("[METAMASK]") ? "text-orange-400" :
                    log.includes("[MINER]") || log.includes("Hash") ? "text-[#C9A84C]" :
                    "text-gray-400"
                  }`}
                >
                  <span className="text-gray-600 mr-3">{new Date().toISOString().split('T')[1].substring(0, 8)}</span>
                  {log}
                </motion.div>
              ))}
              {/* Blinking Cursor */}
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-3 bg-gray-400 mt-1"
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
