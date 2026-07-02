import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, WifiOff } from 'lucide-react';
import { sommelierChat, isAIEnabled } from '../services/claudeService';
import { getWeatherContextString } from '../services/weatherService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { Kicker } from './ui';

// Ask the Somm — a conversation with the region's resident sommelier.
// The Somm is a person, not a feature: no badges, no sparkle.

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SommelierChat: React.FC = () => {
  const { region } = useRegion();
  const { wineries } = useCatalog();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Good to see you. I've spent twenty years walking ${region.shortName} — ask me about the wines, the estates, or where you should be at four o'clock.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiEnabled = isAIEnabled();

  // Suggested openers, drawn from the region itself.
  const suggestions = useMemo(() => {
    const producer = region.ai.signatureProducers[0];
    const secondProducer = region.ai.signatureProducers[1];
    const subregion = region.subregions[0]?.name;
    const list: string[] = [];
    if (producer) list.push(`What should I taste at ${producer}?`);
    if (subregion) list.push(`Plan a slow afternoon in ${subregion}`);
    if (secondProducer) list.push(`Is ${secondProducer} worth the detour?`);
    list.push(`Which bottles from ${region.shortName} deserve a decade in the cellar?`);
    return list.slice(0, 4);
  }, [region]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    const up = () => setIsOffline(false);
    const down = () => setIsOffline(true);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const handleSend = async (text = input) => {
    if (isOffline || !text.trim() || isLoading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const weather = await getWeatherContextString(region);
      const context = `Weather: ${weather}. Wineries available: ${wineries.map(w => w.name).join(', ')}.`;
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const reply = await sommelierChat(region, text, history, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'The cellar doors seem quiet right now. Give me a moment and ask again.' },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[78vh] max-w-3xl mx-auto my-8 bg-parchment border border-hairline rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-hairline bg-paper shrink-0 flex items-baseline justify-between">
        <div>
          <Kicker>The Somm</Kicker>
          <h2 className="font-display text-2xl text-ink mt-1">Ask the Somm</h2>
        </div>
        <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40">
          {isOffline ? 'Offline' : region.name}
        </p>
      </div>

      {/* Suggested openers */}
      {messages.length === 1 && (
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2 shrink-0 border-b border-hairline">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              disabled={!aiEnabled || isOffline}
              className="font-ui text-xs text-ink/70 border border-hairline bg-paper hover:border-claret hover:text-claret px-3 py-1.5 rounded-sm transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-claret text-parchment font-ui'
                  : 'bg-paper border border-hairline text-ink font-body text-[15px]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-paper border border-hairline px-4 py-3 rounded-sm">
              <span className="font-ui text-[10px] font-semibold text-brass uppercase tracking-kicker">
                The Somm is thinking
              </span>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(n => (
                  <span
                    key={n}
                    className="w-1.5 h-1.5 bg-claret/30 rounded-full animate-bounce"
                    style={{ animationDelay: `${n * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-paper border-t border-hairline shrink-0">
        {(isOffline || !aiEnabled) && (
          <div className="flex items-center gap-2 font-ui text-xs text-terracotta border border-terracotta/40 rounded-sm px-4 py-2.5 mb-3">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            {isOffline
              ? 'You are offline — the Somm will be quiet until you are back.'
              : 'The Somm is away from the table. Set VITE_AI_PROXY_URL to bring them back.'}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            disabled={isOffline || isLoading || !aiEnabled}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={aiEnabled ? `Ask anything about ${region.shortName}…` : 'The Somm is unavailable'}
            className="flex-1 bg-parchment border border-hairline rounded-sm py-3 px-4 font-ui text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-claret disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || isOffline || !aiEnabled}
            className="px-4 bg-claret text-parchment rounded-sm hover:bg-claret-deep transition-colors disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SommelierChat;
