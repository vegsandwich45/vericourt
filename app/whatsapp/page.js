'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function WhatsAppBotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '⚖️ *Namaste! Welcome to VeriCourt Official Citizen Gazette.* \n\nI am the automated Supreme Court & High Court evidentiary verification assistant.\n\nSend any Case Docket Number (e.g. *WP(C)-2026-8941*) or document hash to verify authentic orders instantly.',
      time: '11:45 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    setInputText('');

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data?.reply || (data?.error ? `⚠️ Error: ${data.error}` : 'System temporarily unavailable. Please try again.'),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuthentic: data?.isAuthentic,
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 600);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ Network connection timeout. Please verify your connection to the sovereign gateway.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-court-bg text-court-text py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 mb-2">
            <span className="text-xs">📲</span>
            <span className="text-[11px] font-mono text-emerald-300 uppercase font-bold tracking-widest">
              CITIZEN LEGAL TECH · 500M+ WHATSAPP REACH
            </span>
          </div>
          <h1 className="font-judicial text-3xl sm:text-4xl text-court-gold font-bold">
            Citizen WhatsApp Verification Bot Simulator
          </h1>
          <p className="text-xs sm:text-sm text-court-text-dim max-w-2xl mx-auto leading-relaxed">
            Eliminates the complexity of Web3 wallets and hexadecimal hashes for common citizens. 
            Allows rural property buyers, advocates, and police constables on duty to verify court orders via WhatsApp.
          </p>
        </div>

        {/* ── Quick Test Scenario Pills ────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-mono text-court-text-dim">⚡ Click to Simulate User Action:</span>
          <button
            onClick={() => handleSendMessage('WP(C)-2026-8941')}
            className="px-3 py-1.5 rounded-lg bg-court-surface border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs font-mono transition-colors"
          >
            🟢 Verify Bail Order (WP(C)-2026-8941)
          </button>
          <button
            onClick={() => handleSendMessage('CRL-APP-2025-1142')}
            className="px-3 py-1.5 rounded-lg bg-court-surface border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs font-mono transition-colors"
          >
            🟢 Verify Supreme Court Appeal
          </button>
          <button
            onClick={() => handleSendMessage('Mata v. Avianca, 2023 F.Supp.3d 104')}
            className="px-3 py-1.5 rounded-lg bg-court-surface border border-red-500/40 text-red-300 hover:bg-red-950/40 text-xs font-mono transition-colors"
          >
            🔴 Test AI Hallucination (Mata v. Avianca)
          </button>
          <button
            onClick={() => handleSendMessage('HELP')}
            className="px-3 py-1.5 rounded-lg bg-court-surface border border-court-border text-court-text-dim hover:text-court-gold text-xs font-mono transition-colors"
          >
            ❓ Help &amp; Commands
          </button>
        </div>

        {/* ── Smartphone Frame (WhatsApp UI) ────────────────────────── */}
        <div className="max-w-md mx-auto rounded-3xl border-4 border-[#2a2f38] bg-[#111b21] shadow-2xl shadow-black/80 overflow-hidden font-sans">
          
          {/* WhatsApp Chat Header */}
          <div className="bg-[#202c33] p-3.5 flex items-center justify-between border-b border-[#2a2f38]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/40 border border-emerald-500/50 flex items-center justify-center text-xl shadow">
                ⚖️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-[#e9edef]">VeriCourt e-Courts Bot</span>
                  <span className="text-[10px] bg-emerald-500 text-night-black font-bold px-1 rounded-full" title="Verified Business Account">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-[#8696a0] leading-none">Official Judicial Gazette · online</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[#aebac1] text-sm">
              <span>📞</span>
              <span>⋮</span>
            </div>
          </div>

          {/* WhatsApp Chat Messages Stream */}
          <div className="p-4 space-y-3 min-h-[420px] max-h-[460px] overflow-y-auto bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow ${
                    m.sender === 'user'
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#d1d7db] rounded-tl-none border border-court-border/30'
                  }`}
                >
                  <p className="whitespace-pre-line font-mono">{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                    <span>{m.time}</span>
                    {m.sender === 'user' && <span className="text-[#53bdeb]">✓✓</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#202c33] text-[#8696a0] rounded-2xl rounded-tl-none p-2.5 text-xs flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono ml-1">Auditing sovereign ledger...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* WhatsApp Input Bar */}
          <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#2a2f38]">
            <span className="text-[#8696a0] text-lg px-1 cursor-pointer">📎</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type docket number e.g. WP(C)-2026-8941..."
              className="flex-1 bg-[#2a3942] rounded-lg px-3 py-2 text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-8 h-8 rounded-full bg-[#00a884] text-night-black flex items-center justify-center font-bold text-sm shadow hover:bg-[#02906f] transition-colors"
            >
              ➤
            </button>
          </div>

        </div>

        {/* ── Architecture & Integration Notes ─────────────────────── */}
        <div className="vc-card bg-court-surface/90 border-court-border space-y-3 text-xs">
          <div className="flex items-center gap-2 text-court-gold font-bold font-mono">
            <span>⚙️</span>
            <span>Enterprise WhatsApp Business API Integration</span>
          </div>
          <p className="text-court-text-dim leading-relaxed">
            The active backend endpoint <code className="text-court-gold">/api/webhook/whatsapp</code> conforms to Meta WhatsApp Cloud API / Twilio webhook specifications. When configured with production webhook tokens, incoming citizen WhatsApp messages automatically trigger zero-cost EVM consensus lookups and reply within 1.5 seconds.
          </p>
        </div>

        {/* ── Footer Navigation ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-court-border text-xs text-court-text-dim font-mono">
          <Link href="/verify" className="hover:text-court-gold">
            ← Verification Bench
          </Link>
          <Link href="/faster" className="hover:text-court-gold">
            FASTER e-Prisons System →
          </Link>
        </div>

      </div>
    </div>
  );
}
