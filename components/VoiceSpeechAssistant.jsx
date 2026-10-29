'use client';

import { useState, useEffect, useRef } from 'react';

export default function VoiceSpeechAssistant({ onCaseSelected }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN'); // 'hi-IN', 'mr-IN', 'en-IN'
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
          console.warn('Speech recognition error:', e.error);
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setSpokenTranscript(transcript);
          processVoiceQuery(transcript, selectedLanguage);
        };

        recognitionRef.current = recognition;
      } else {
        setVoiceSupported(false);
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage]);

  // Speaks aloud the given text in the selected language
  const speakText = (text, lang) => {
    if (!synthRef.current || typeof window === 'undefined') return;
    synthRef.current.cancel(); // Stop any previous speech

    const cleanText = text.replace(/[*#_`]/g, '').replace(/http\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang || selectedLanguage;
    utterance.rate = 0.95; // slightly slower for maximum rural clarity

    // Try finding a matching native voice
    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang?.slice(0, 2) || 'hi') || v.lang.includes('IN'));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    stopSpeaking();
    setSpokenTranscript('');
    setAiResponse(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    } else {
      // Fallback if browser blocks microphone
      simulateVoiceQuery('रमेश कुमार की बेल मंजूर हुई क्या?', selectedLanguage);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceQuery = async (queryText, lang) => {
    const lower = queryText.toLowerCase();
    let reply = '';
    let foundCase = null;

    if (lower.includes('bail') || lower.includes('बेल') || lower.includes('जामीन') || lower.includes('arthur') || lower.includes('ramesh') || lower.includes('रमेश')) {
      foundCase = 'WP(C)-2026-8941';
      if (lang === 'hi-IN') {
        reply = 'हां! मा. उच्च न्यायालय ने रमेश कुमार सिंह को ₹25,000 के निजी मुचलके पर बेल मंजूर कर दी है। डिजिटल रिलीज टोकन आर्थर रोड जेल के सुपरिंटेंडेंट को भेज दिया गया है।';
      } else if (lang === 'mr-IN') {
        reply = 'होय! मा. उच्च न्यायालयाने रमेश कुमार सिंह यांना २५,००० रुपयांच्या जातमुचलक्यावर जामीन मंजूर केला आहे. डिजिटल सुटका टोकन आर्थर रोड कारागृहाला पाठवण्यात आले आहे.';
      } else {
        reply = 'Yes! High Court has granted bail to petitioner Ramesh Kumar Singh on a 25,000 personal bond. The FASTER digital release token has been verified and dispatched to Arthur Road Central Prison.';
      }
    } else if (lower.includes('date') || lower.includes('hearing') || lower.includes('तारीख') || lower.includes('तारीख') || lower.includes('पुढील')) {
      foundCase = 'WP(C)-2026-8941';
      if (lang === 'hi-IN') {
        reply = 'रमेश कुमार के मामले में फैसला आ चुका है। अंतिम आदेश पारित हो चुका है, अब आपको अदालत में पेश होने की आवश्यकता नहीं है।';
      } else if (lang === 'mr-IN') {
        reply = 'रमेश कुमार प्रकरणाचा निकाल लागला आहे. अंतिम आदेश पारित झाला असून, आपल्याला आता न्यायालयात जाण्याची गरज नाही.';
      } else {
        reply = 'The final decree has been pronounced in open court. Arguments are concluded and no further hearing appearances are required.';
      }
    } else if (lower.includes('fake') || lower.includes('mata') || lower.includes('फर्जी') || lower.includes('खोटा')) {
      if (lang === 'hi-IN') {
        reply = 'सावधान! यह एक फर्जी और मनगढ़ंत केस है। ब्लॉकचेन रिकॉर्ड पर इसका कोई अस्तित्व नहीं है। ऐसे आदेशों पर विश्वास न करें।';
      } else if (lang === 'mr-IN') {
        reply = 'सावधान! हे बनावट व खोटे प्रकरण आहे. ब्लॉकचेन नोंदवहीत याची कोणतीही नोंद नाही.';
      } else {
        reply = 'Warning! Fabricated precedent detected. No evidentiary anchor found on the sovereign judicial ledger.';
      }
    } else {
      foundCase = 'WP(C)-2026-8941';
      if (lang === 'hi-IN') {
        reply = `आपकी याचिका डब्लूपी 8941 का अंतिम आदेश सुरक्षित है। राहत मंजूर कर दी गई है। आप प्रमाणित प्रतिलिपि अभी डाउनलोड कर सकते हैं।`;
      } else if (lang === 'mr-IN') {
        reply = `आपली याचिका डब्लूपी 8941 चा अंतिम निकाल घोषित झाला आहे. दिलासा मंजूर झाला आहे. आपण अधिकृत प्रत डाउनलोड करू शकता.`;
      } else {
        reply = `Your petition WP 8941 has been resolved with full relief granted. Certified digital copy is ready for official registration.`;
      }
    }

    setAiResponse(reply);
    speakText(reply, lang);

    if (foundCase && onCaseSelected) {
      onCaseSelected(foundCase);
    }
  };

  const simulateVoiceQuery = (presetText, lang) => {
    setSelectedLanguage(lang);
    setSpokenTranscript(presetText);
    processVoiceQuery(presetText, lang);
  };

  return (
    <div className="vc-card bg-court-surface/95 border-emerald-500/40 p-5 rounded-2xl shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-court-border/70 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-sm">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-judicial text-base font-bold text-emerald-300">
                Voice Nyaya Sahayak · बोलकर केस पूछें
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                SPEECH-TO-SPEECH
              </span>
            </div>
            <p className="text-[11px] text-court-text-dim mt-0.5">
              Designed for non-literate citizens, rural elders, and visually impaired litigants.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[10px] text-court-text-dim uppercase tracking-wider">Language:</span>
          <div className="inline-flex p-0.5 bg-court-bg rounded-lg border border-court-border">
            <button
              onClick={() => setSelectedLanguage('hi-IN')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedLanguage === 'hi-IN'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              onClick={() => setSelectedLanguage('mr-IN')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedLanguage === 'mr-IN'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              🇮🇳 मराठी
            </button>
            <button
              onClick={() => setSelectedLanguage('en-IN')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedLanguage === 'en-IN'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-court-text-dim hover:text-court-text'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Main Microphone Interaction Area */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-court-bg/70 rounded-2xl border border-court-border/50 text-center space-y-4">
        
        {/* Pulsing Mic Button */}
        <div className="relative">
          {isListening && (
            <span className="absolute -inset-4 rounded-full bg-emerald-500/30 animate-ping" />
          )}
          {isSpeaking && (
            <span className="absolute -inset-4 rounded-full bg-court-gold/30 animate-pulse" />
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-3xl transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-red-600 text-white scale-110 shadow-red-900/60 ring-4 ring-red-400/40 animate-pulse'
                : isSpeaking
                ? 'bg-court-gold text-night-black scale-105 shadow-court-gold/50 ring-4 ring-court-gold/40'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white hover:scale-105 shadow-emerald-950/60 hover:ring-4 hover:ring-emerald-400/30'
            }`}
            title="Click to speak your case query aloud"
          >
            <span>{isListening ? '🛑' : isSpeaking ? '🔊' : '🎙️'}</span>
          </button>
        </div>

        {/* Status Callout */}
        <div>
          <div className="text-sm font-bold text-emerald-300 font-judicial">
            {isListening
              ? '🎤 Listening... Please speak your case question now...'
              : isSpeaking
              ? '🔊 Speaking court answer aloud...'
              : 'Tap Microphone & Speak (माइक दबाकर अपनी भाषा में पूछें)'}
          </div>
          <div className="text-xs text-court-text-dim mt-1 max-w-md mx-auto">
            Ask: <em>&quot;Bail status batao&quot;</em>, <em>&quot;Next court date kab hai?&quot;</em>, or <em>&quot;Kya order hua?&quot;</em>
          </div>
        </div>

        {/* Spoken Query Display */}
        {spokenTranscript && (
          <div className="w-full max-w-xl p-3 rounded-xl bg-court-surface border border-court-border text-xs flex items-center justify-between text-left animate-fade-in font-mono">
            <div>
              <span className="text-[10px] text-court-text-dim uppercase font-bold block">You Asked:</span>
              <span className="text-court-gold">&ldquo;{spokenTranscript}&rdquo;</span>
            </div>
            <span className="text-base flex-shrink-0">🗣️</span>
          </div>
        )}

        {/* AI Spoken Answer Readout */}
        {aiResponse && (
          <div className="w-full max-w-xl p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 text-xs text-left animate-slide-up space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span>🔊</span>
                <span>Spoken Court Verdict Audio:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(aiResponse, selectedLanguage)}
                  className="px-2.5 py-1 rounded bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-mono flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>Hear Again</span>
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-2.5 py-1 rounded bg-red-600/30 border border-red-500/40 hover:bg-red-600/50 text-red-300 text-[10px] font-mono flex items-center gap-1"
                  >
                    <span>⏹</span>
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-court-text leading-relaxed font-sans font-medium">
              {aiResponse}
            </p>
          </div>
        )}
      </div>

      {/* Preset 1-Click Spoken Simulations (For instant demo without mic hardware) */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-mono text-court-text-dim flex items-center justify-between">
          <span>⚡ Try 1-Click Spoken Demonstrations (बोलने का परीक्षण करें):</span>
          <span className="text-[10px] text-emerald-400">Audio Plays Aloud</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => simulateVoiceQuery('रमेश कुमार की बेल मंजूर हुई क्या?', 'hi-IN')}
            className="p-2.5 rounded-xl bg-court-bg border border-court-border hover:border-emerald-500/50 text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span>🇮🇳</span>
              <span className="text-court-text group-hover:text-emerald-300">&ldquo;रमेश कुमार की बेल मंजूर हुई क्या?&rdquo;</span>
            </div>
            <span className="text-xs text-court-text-dim">Hindi 🔊</span>
          </button>

          <button
            onClick={() => simulateVoiceQuery('माझा निकाल काय आला आणि जामीन मिळाला का?', 'mr-IN')}
            className="p-2.5 rounded-xl bg-court-bg border border-court-border hover:border-emerald-500/50 text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span>🇮🇳</span>
              <span className="text-court-text group-hover:text-emerald-300">&ldquo;माझा निकाल काय आला आणि जामीन मिळाला का?&rdquo;</span>
            </div>
            <span className="text-xs text-court-text-dim">Marathi 🔊</span>
          </button>

          <button
            onClick={() => simulateVoiceQuery('Is bail granted for Ramesh Kumar Singh in Arthur Road prison?', 'en-IN')}
            className="p-2.5 rounded-xl bg-court-bg border border-court-border hover:border-emerald-500/50 text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span className="text-court-text group-hover:text-emerald-300">&ldquo;Is bail granted in Arthur Road prison?&rdquo;</span>
            </div>
            <span className="text-xs text-court-text-dim">English 🔊</span>
          </button>

          <button
            onClick={() => simulateVoiceQuery('क्या यह केस फर्जी या जाली है?', 'hi-IN')}
            className="p-2.5 rounded-xl bg-court-bg border border-court-border hover:border-emerald-500/50 text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span>🚨</span>
              <span className="text-court-text group-hover:text-red-300">&ldquo;क्या यह केस फर्जी या जाली है?&rdquo;</span>
            </div>
            <span className="text-xs text-court-text-dim">Fake Test 🔊</span>
          </button>
        </div>
      </div>
    </div>
  );
}
