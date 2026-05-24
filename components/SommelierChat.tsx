import React, { useState, useRef, useEffect } from 'react';
import { sommelierChat, isAIEnabled } from '../services/claudeService';
import { WINERIES } from '../data/wineries';
import { Send, User, Bot, Sparkles, Loader2, Globe, WifiOff } from 'lucide-react';
import { getWeatherContextString } from '../services/weatherService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Best Semillon producers for cellaring?',
  'What food pairs with Hunter Shiraz?',
  'Plan a romantic afternoon in Pokolbin',
  'Hidden gem wineries locals love?',
];

const SommelierChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome. I'm your AI sommelier for the Hunter Valley — ask me anything about wine, wineries, food pairings, or planning your visit." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiEnabled = isAIEnabled();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    const up = () => setIsOffline(false);
    const down = () => setIsOffline(true);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  const handleSend = async (text = input) => {
    if (isOffline || !text.trim() || isLoading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const weather = await getWeatherContextString();
      const context = `Weather: ${weather}. Wineries available: ${WINERIES.map(w => w.name).join(', ')}.`;
      const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const reply = await sommelierChat(text, history, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "The cellar doors seem quiet right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-white shadow-2xl md:my-6 md:rounded-3xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-[#1a1a1a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-wine rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold font-serif">Somm AI</h2>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled && !isOffline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest">
                {isOffline ? 'Offline' : aiEnabled ? 'Claude Sonnet · Active' : 'AI Proxy Not Configured'}
              </span>
            </div>
          </div>
        </div>
        <Globe className="w-4 h-4 text-white/30" />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2 shrink-0 border-b border-gray-50">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs bg-cream-dark text-gray-600 hover:bg-wine hover:text-white px-3 py-1.5 rounded-full transition-colors font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-cream">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gold text-white' : 'bg-white border border-gray-200 text-wine'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#1a1a1a] text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm font-serif'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-wine">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-sm">
                <span className="text-xs font-bold text-wine/70 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Consulting the cellar...
                </span>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-wine/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        {(isOffline || !aiEnabled) && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-3">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            {isOffline ? 'You\'re offline — connect to chat with the sommelier.' : 'AI proxy not configured. Set VITE_AI_PROXY_URL to enable.'}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            disabled={isOffline || isLoading || !aiEnabled}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={aiEnabled ? "Ask anything about Hunter Valley wine..." : "AI not configured"}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-wine/20 focus:border-wine/40 disabled:opacity-50 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || isOffline || !aiEnabled}
            className="p-3.5 bg-[#1a1a1a] text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SommelierChat;
