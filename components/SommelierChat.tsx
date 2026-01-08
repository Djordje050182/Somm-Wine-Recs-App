
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WINERIES } from '../data/wineries';
import { addToPlanner, addToFavorites, toolsDef } from '../services/actionService';
import { Send, User, Bot, Sparkles, Loader2, Info, Compass, Utensils, Baby, Wine, WifiOff, MapPin, Heart, Mic, StopCircle, RefreshCcw } from 'lucide-react';
import { getWeatherContextString } from '../services/weatherService';

const SUGGESTIONS = [
  { label: 'Iconic Semillon', query: 'What are the must-visit wineries for iconic Hunter Valley Semillon?', icon: <Wine className="w-3 h-3" /> },
  { label: 'Hidden Gems', query: 'Show me some boutique, hidden gem wineries away from the crowds.', icon: <Compass className="w-3 h-3" /> },
  { label: 'Add Tyrrells', query: 'Add Tyrrell\'s Wines to my itinerary planner.', icon: <MapPin className="w-3 h-3" /> },
  { label: 'Family Friendly', query: 'Which cellar doors are best for visiting with kids?', icon: <Baby className="w-3 h-3" /> }
];

interface SommelierChatProps {
    user?: any;
}

const SommelierChat: React.FC<SommelierChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Welcome to your personal Hunter Valley cellar door experience. I can guide your palate or add wineries directly to your planner. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Timeout ref to handle hanging requests
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-AU';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [messages, isLoading]);

  const toggleDictation = () => {
      if (!recognitionRef.current) {
          alert("Voice dictation is not supported in this browser.");
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          setIsListening(true);
          recognitionRef.current.start();
      }
  };

  const handleSend = async (text?: string) => {
    if (isOffline) return;

    const userMsg = text || input;
    if (!userMsg.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Set a safety timeout
    timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to the cellar. Please check your connection and try again." }]);
    }, 12000); // 12 second timeout

    try {
      const weatherContext = await getWeatherContextString();
      const wineryContext = WINERIES.map(w => 
        `- ${w.name} (${w.subregion}): ${w.style} style. Specialty: ${w.specialty}.`
      ).join('\n');

      const systemInstruction = `You are a world-class Master Sommelier for the Hunter Valley.
      
      CONTEXT:
      ${weatherContext}
      Wineries Database:
      ${wineryContext}

      CAPABILITIES:
      - Answer questions about wine/history.
      - ADD items to planner using 'addToPlanner'.
      - SAVE favorites using 'addToFavorites'.
      
      RULES:
      1. Use tools if the user explicitly asks.
      2. Be concise.
      3. Bold winery names.
      `;

      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const client = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // STREAMING IMPLEMENTATION
      // We add a placeholder message for the model that we will update as chunks arrive
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      const result = await client.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction,
          tools: toolsDef,
        }
      });

      let fullText = '';
      let functionCalls: any[] = [];
      let firstChunkReceived = false;

      for await (const chunk of result) {
        // Clear timeout on first byte
        if (!firstChunkReceived) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            firstChunkReceived = true;
        }

        // Accumulate Text
        const chunkText = chunk.text;
        if (chunkText) {
            fullText += chunkText;
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = fullText;
                return updated;
            });
        }

        const calls = chunk.functionCalls;
        if (calls && calls.length > 0) {
            functionCalls.push(...calls);
        }
      }

      // Handle Function Calls (Post-Stream)
      if (functionCalls.length > 0) {
         setMessages(prev => [...prev, { role: 'model', content: "Processing your request..." }]);
         
         const functionResponses = [];
         for (const call of functionCalls) {
             let executionResult = '';
             if (call.name === 'addToPlanner') {
                 executionResult = addToPlanner(call.args['wineryName'] as string);
             } else if (call.name === 'addToFavorites') {
                 executionResult = addToFavorites(call.args['name'] as string, call.args['type'] as any);
             }
             
             functionResponses.push({
                 functionResponse: {
                     name: call.name,
                     response: { result: executionResult }
                 }
             });
         }

         const result2 = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                ...history,
                { role: 'model', parts: [{ functionCall: functionCalls[0] }] }, 
                { role: 'user', parts: functionResponses }
            ],
            config: { systemInstruction }
         });
         
         const finalText = result2.text || "Action completed.";
         setMessages(prev => {
             const updated = [...prev];
             updated[updated.length - 1].content = finalText;
             return updated;
         });
      }

    } catch (err) {
      console.error(err);
      // Remove the empty placeholder if we failed before streaming text
      setMessages(prev => {
          if (prev[prev.length - 1].content === '') {
              return [...prev.slice(0, -1), { role: 'model', content: "My apologies, the cellar door seems to be stuck. Please try again in a moment." }];
          }
          return prev;
      });
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white shadow-2xl md:my-10 md:rounded-3xl border border-[#e5e1da] overflow-hidden">
      {/* Header */}
      <div className={`p-6 flex items-center justify-between ${isOffline ? 'bg-gray-800' : 'bg-[#6b1e2e]'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6b1e2e] shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold font-serif italic">VinoAI Sommelier {isOffline && '(Offline)'}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-400 animate-pulse'}`}></span>
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-[0.2em]">
                {isOffline ? 'Connection Lost' : 'Connected to Cellar'}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-2 text-white/50 text-xs">
          <Info className="w-4 h-4" />
          <span>Planner & Favorites enabled</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-[#fdfcfb]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#a68d60] text-white' : 'bg-white border border-[#e5e1da] text-[#6b1e2e]'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#a68d60] text-white rounded-tr-none' : 'bg-white border border-[#e5e1da] text-[#1a1a1a] rounded-tl-none font-serif italic text-lg'}`}>
                {/* Simple markdown rendering */}
                <div className="prose prose-sm max-w-none text-inherit">
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        return (
                          <div key={idx} className="flex gap-2 mb-2">
                             <span className={`${msg.role === 'user' ? 'text-white' : 'text-[#a68d60]'} font-bold`}>•</span>
                             <span dangerouslySetInnerHTML={{ 
                               __html: line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                             }} />
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ 
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-white border border-[#e5e1da] flex items-center justify-center text-[#6b1e2e] animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-[#e5e1da] p-4 rounded-2xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#6b1e2e]" />
                <span className="text-sm italic text-gray-400">Pouring knowledge...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-[#fdfcfb] border-t border-[#e5e1da]">
        {/* New Suggestions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SUGGESTIONS.map((suggestion) => (
            <button 
              key={suggestion.label}
              onClick={() => handleSend(suggestion.query)}
              disabled={isOffline || isLoading}
              className={`flex items-center gap-2 justify-center p-3 rounded-xl bg-white border border-[#e5e1da] hover:border-[#6b1e2e] hover:bg-[#6b1e2e]/5 transition-all group ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-6 h-6 rounded-full bg-[#f8f4f0] group-hover:bg-[#6b1e2e] text-[#6b1e2e] group-hover:text-white flex items-center justify-center transition-colors">
                {suggestion.icon}
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-[#6b1e2e] uppercase tracking-wider">{suggestion.label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          {/* DICTATION BUTTON */}
          <button
            onClick={toggleDictation}
            className={`p-4 rounded-full transition-all shadow-md active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-[#e5e1da] text-[#6b1e2e] hover:bg-gray-50'}`}
            title="Voice Dictation"
          >
              {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input 
            value={input}
            disabled={isOffline || isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOffline ? "You are offline." : isListening ? "Listening..." : "Ask me anything..."}
            className={`flex-1 bg-white border border-[#e5e1da] rounded-full py-4 px-6 focus:outline-none focus:ring-4 focus:ring-[#6b1e2e]/10 text-lg shadow-inner ${isOffline ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || isOffline}
            className="p-4 bg-[#6b1e2e] text-white rounded-full hover:bg-[#852539] disabled:opacity-50 transition-all shadow-xl hover:scale-110 active:scale-95"
          >
            {isOffline ? <WifiOff className="w-6 h-6" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SommelierChat;
