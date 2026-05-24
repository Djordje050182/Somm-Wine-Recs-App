import React, { useState, useEffect } from 'react';
import { searchEvents, isAIEnabled } from '../services/claudeService';
import { Calendar, MapPin, Loader2, Sparkles, RefreshCcw, Tag } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Festival: 'bg-purple-100 text-purple-700',
  Music: 'bg-pink-100 text-pink-700',
  Dining: 'bg-orange-100 text-orange-700',
  Education: 'bg-blue-100 text-blue-700',
  Market: 'bg-green-100 text-green-700',
  Sport: 'bg-yellow-100 text-yellow-700',
};

const WhatsOn: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const aiEnabled = isAIEnabled();

  const load = async () => {
    if (!aiEnabled) return;
    setLoading(true);
    try {
      const data = await searchEvents();
      setEvents(data);
      setLoaded(true);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-wine font-serif">What's On</h2>
          <p className="text-gray-500 text-sm mt-1">Events, festivals & experiences in Hunter Valley</p>
        </div>
        {loaded && (
          <button onClick={load} className="p-2 rounded-full border border-gray-200 text-gray-500 hover:border-wine hover:text-wine transition">
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!loaded && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mb-4" />
          <p className="font-bold text-gray-500 mb-2">Discover events near you</p>
          <p className="text-sm text-gray-400 mb-6">AI will surface upcoming festivals, winemaker dinners, and seasonal events.</p>
          <button onClick={load} disabled={!aiEnabled} className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-bold shadow hover:bg-black transition disabled:opacity-40">
            <Sparkles className="w-4 h-4 text-gold" /> Load Events
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-wine mb-3" />
          <p className="text-sm text-gray-400">Finding events...</p>
        </div>
      )}

      {loaded && events.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-bold">No events found</p>
          <button onClick={load} className="mt-4 text-wine font-bold text-sm hover:underline">Try again</button>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-600'}`}>
                  {event.category}
                </span>
                <h3 className="font-black text-gray-900 mt-2 font-serif">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{event.description}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" /> {event.date}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" /> {event.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsOn;
