'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AIAssistantBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '⚖️ **Namaste! I am the VeriCourt AI Judicial Assistant.**\n\nAsk me any question about case dockets, bail status, Section 65B certificates, or court workspaces.',
      time: 'Just now',
      relatedLinks: [
        { label: 'Verify WP(C)-2026-8941', action: 'WP(C)-2026-8941' },
        { label: 'FASTER Bail Info', action: 'Tell me about FASTER bail' },
        { label: 'Check AI Hallucination', action: 'Mata v. Avianca' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if any role session exists (re-check on every page change)
  useEffect(() => {
    const hasSession =
      localStorage.getItem('vericourt_judge_session') ||
      localStorage.getItem('vericourt_lawyer_session') ||
      localStorage.getItem('vericourt_citizen_session');
    setIsLoggedIn(!!hasSession);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Hide on login page or when not logged in
  if (pathname === '/' || !isLoggedIn) return null;

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: data.reply,
            relatedLinks: data.relatedLinks || [],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `⚠️ **Notice:** ${data.error || 'Could not process query. Please try again.'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ **Network Offline:** Unable to reach the judicial verification gateway. Please ensure the local server is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Pill / Button ────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#12151e] border border-court-gold/60 text-court-gold shadow-2xl shadow-court-gold/20 hover:scale-105 hover:border-court-gold transition-all duration-200 group"
          aria-label="Open VeriCourt AI Legal Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xl group-hover:rotate-12 transition-transform">⚖️</span>
          <div className="text-left leading-none pr-1">
            <div className="text-xs font-bold font-mono tracking-wide">Nyaya AI Assistant</div>
            <div className="text-[10px] text-court-text-dim mt-0.5">Instant Legal Help</div>
          </div>
        </button>
      )}

      {/* ── Expanded Chat Modal / Window ───────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col bg-[#0f1118] border border-court-gold/40 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden animate-fade-in font-sans">
          
          {/* Header */}
          <div className="p-3.5 bg-[#141724] border-b border-court-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-court-gold/15 border border-court-gold/40 flex items-center justify-center text-lg shadow-sm">
                ⚖️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-judicial font-bold text-sm text-court-gold">Nyaya AI Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] font-mono text-court-text-dim">
                  24x7 Judicial Evidentiary Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/whatsapp"
                title="Open Dedicated WhatsApp View"
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs"
              >
                📲
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-court-text-dim hover:text-court-text hover:bg-court-surface transition-colors"
                title="Minimize AI Assistant"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Preset Action Chips */}
          <div className="px-3 py-2 bg-[#0b0c12] border-b border-court-border/40 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-thin">
            <button
              onClick={() => handleSend('WP(C)-2026-8941')}
              className="px-2.5 py-1 rounded-md bg-court-surface border border-court-border hover:border-court-gold/50 text-court-text-dim hover:text-court-gold whitespace-nowrap transition-colors"
            >
              🔍 Case 8941
            </button>
            <button
              onClick={() => handleSend('Tell me about FASTER bail')}
              className="px-2.5 py-1 rounded-md bg-court-surface border border-court-border hover:border-court-gold/50 text-court-text-dim hover:text-court-gold whitespace-nowrap transition-colors"
            >
              ⚡ FASTER Bail
            </button>
            <button
              onClick={() => handleSend('Mata v. Avianca')}
              className="px-2.5 py-1 rounded-md bg-court-surface border border-court-border hover:border-court-gold/50 text-court-text-dim hover:text-court-gold whitespace-nowrap transition-colors"
            >
              🚨 Fake Case Test
            </button>
            <button
              onClick={() => handleSend('What are the 3 roles?')}
              className="px-2.5 py-1 rounded-md bg-court-surface border border-court-border hover:border-court-gold/50 text-court-text-dim hover:text-court-gold whitespace-nowrap transition-colors"
            >
              🏛️ Roles
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-court-bg/95">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-court-gold text-night-black font-medium rounded-br-none shadow-md shadow-court-gold/20'
                      : 'bg-[#151926] border border-court-border text-court-text rounded-bl-none shadow-md'
                  }`}
                >
                  <div>{m.text}</div>

                  {/* Related Action Links */}
                  {m.relatedLinks && m.relatedLinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-court-border/60 flex flex-wrap gap-1.5">
                      {m.relatedLinks.map((link, idx) => (
                        link.url ? (
                          <Link
                            key={idx}
                            href={link.url}
                            className="px-2 py-0.5 rounded bg-court-surface/80 border border-court-gold/30 hover:border-court-gold text-court-gold text-[10px] font-mono transition-colors flex items-center gap-1"
                          >
                            <span>{link.label}</span>
                            <span>↗</span>
                          </Link>
                        ) : (
                          <button
                            key={idx}
                            onClick={() => handleSend(link.action)}
                            className="px-2 py-0.5 rounded bg-court-surface/80 border border-court-gold/30 hover:border-court-gold text-court-gold text-[10px] font-mono transition-colors text-left"
                          >
                            {link.label}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-court-text-dim font-mono mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#151926] border border-court-border max-w-[70%]">
                <span className="text-xs">⚖️</span>
                <span className="text-xs text-court-text-dim font-mono">Nyaya AI is verifying...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-court-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-court-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-court-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#121520] border-t border-court-border/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cases, bail, 65B, precedents..."
              className="flex-1 bg-[#1a1e2d] border border-court-border rounded-xl px-3.5 py-2 text-xs text-court-text placeholder-court-text-dim/60 focus:outline-none focus:border-court-gold font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 rounded-xl bg-court-gold text-night-black font-bold text-xs hover:bg-court-gold-lt disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-md shadow-court-gold/20"
            >
              <span>Send</span>
              <span>→</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
