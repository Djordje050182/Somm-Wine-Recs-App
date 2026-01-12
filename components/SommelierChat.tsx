
import React, { useState, useRef, useEffect } from 'react';
import { deepSommelierQuery, generateSpeech, decodeAudio } from '../services/geminiService';
import { WINERIES } from '../data/wineries';
import { addToPlanner, addToFavorites } from '../services/actionService';
import { Send, User, Bot, Sparkles, Loader2, Info, Compass, Wine, WifiOff, MapPin, Heart, Mic, StopCircle, Volume2, Globe, List } from 'lucide-react';
import { getWeatherContextString } from '../services/weatherService';

const SommelierChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, sources?: any[] }[]>([
    { role: 'model', content: "Welcome to your premium cellar door companion. I am powered by Gemini 3 Pro reasoning. How may I assist your palate today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const playTTS = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
      if (!base64) return;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioData = decodeAudio(base64);
      const dataInt16 = new Int16Array(audioData.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  const handleSend = async () => {
    if (isOffline || !input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const weather = await getWeatherContextString();
      const context = `
        Current Weather: ${weather}
        Hunter Valley Knowledge Base: ${WINERIES.map(w => w.name).join(', ')}
        Capabilities: You can analyze deep vintages, search real-time news, and think critically about pairings.
      `;

      const { text, sources } = await deepSommelierQuery(userMsg, context);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: text || "I've carefully considered your request, but the cellar doors seem quiet. Try another query.",
        sources: sources
      }]);
      
      // Auto-play TTS for model response if short
      if (text && text.length < 300) {
        playTTS(text);
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "My reasoning engine encountered a vintage anomaly. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-5xl mx-auto bg-white shadow-2xl md:my-6 md:rounded-3xl border border-[#e5e1da] overflow-hidden">
      <div className="p-6 bg-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#6b1e2e] rounded-full flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold font-serif">Deep Somm Pro</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span className="text-[10px] text-white/70 uppercase font-black tracking-widest">Thinking Mode Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-[#a68d60] border border-white/20 uppercase">
             Search Grounded
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-[#fdfcfb]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#a68d60] text-white' : 'bg-white border border-[#e5e1da] text-[#6b1e2e]'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="space-y-2">
                <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#a68d60] text-white rounded-tr-none' : 'bg-white border border-[#e5e1da] text-[#1a1a1a] rounded-tl-none font-serif italic text-lg'}`}>
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                    {msg.sources.map((s, idx) => s.web && (
                      <a key={idx} href={s.web.uri} target="_blank" rel="noreferrer" className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-200 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {s.web.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-white border border-[#e5e1da] flex items-center justify-center text-[#6b1e2e] animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white border border-[#e5e1da] p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-1">
                   <Sparkles className="w-3 h-3" /> Analyzing Vintages & Web Sources
                </span>
                <span className="text-sm italic text-gray-400">Gemini 3 Pro is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-[#e5e1da]">
        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input 
            value={input}
            disabled={isOffline || isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a complex question about Hunter Valley vintages..."
            className="flex-1 bg-gray-50 border border-[#e5e1da] rounded-2xl py-5 px-6 focus:outline-none focus:ring-4 focus:ring-[#6b1e2e]/5 text-lg"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isOffline}
            className="p-5 bg-[#1a1a1a] text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SommelierChat;
