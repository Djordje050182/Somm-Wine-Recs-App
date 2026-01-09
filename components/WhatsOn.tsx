
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, RefreshCw, Loader2, Music, ShoppingBag, Utensils, PartyPopper, AlertCircle } from 'lucide-react';
import { searchLocalEvents } from '../services/geminiService';

const WhatsOn: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const fetchEvents = async () => {
    if (!navigator.onLine) {
        setError("You are currently offline. Connect to the internet to see live events.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
        const { events: fetchedEvents, groundingMetadata } = await searchLocalEvents();
        setEvents(fetchedEvents);
        
        // Extract grounding chunks for citations
        if (groundingMetadata?.groundingChunks) {
            setSources(groundingMetadata.groundingChunks.filter((c: any) => c.web).map((c: any) => c.web));
        }
    } catch (e) {
        console.error(e);
        setError("Unable to fetch live events right now. The AI Sommelier might be busy.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['All', 'Concert', 'Food & Wine', 'Market', 'Festival'];

  const filteredEvents = events.filter(evt => 
      filter === 'All' || (evt.category && evt.category.includes(filter))
  );

  const getCategoryIcon = (cat: string) => {
      if (cat.includes('Concert') || cat.includes('Music')) return <Music className="w-4 h-4" />;
      if (cat.includes('Food') || cat.includes('Wine') || cat.includes('Dinner')) return <Utensils className="w-4 h-4" />;
      if (cat.includes('Market')) return <ShoppingBag className="w-4 h-4" />;
      return <PartyPopper className="w-4 h-4" />;
  };

  const getCategoryColor = (cat: string) => {
      if (cat.includes('Concert')) return 'bg-purple-100 text-purple-700';
      if (cat.includes('Food')) return 'bg-orange-100 text-orange-700';
      if (cat.includes('Market')) return 'bg-green-100 text-green-700';
      return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      
      {/* Hero Section (VERIFIED WORKING URL) */}
      <div className="relative rounded-[3rem] overflow-hidden mb-12 bg-[#1a1a1a] min-h-[300px] flex items-center">
          <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-40" alt="Concert Crowd" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          </div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
              <div className="flex items-center gap-2 text-[#a68d60] font-bold text-xs uppercase tracking-widest mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live from the Web
              </div>
              <h2 className="text-5xl font-serif font-bold text-white mb-6">What's On in the Valley</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                  We use Gemini to scour the web for the latest concerts, markets, and special events happening right now in the Hunter.
              </p>
          </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${filter === cat ? 'bg-[#6b1e2e] text-white shadow-md' : 'bg-white border border-[#e5e1da] text-gray-500 hover:border-[#6b1e2e]'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
          <button 
            onClick={fetchEvents} 
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#6b1e2e] transition-colors"
          >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Events
          </button>
      </div>

      {/* Content */}
      {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#a68d60] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Scanning local event calendars...</p>
          </div>
      ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Connection Issue</h3>
              <p className="text-red-700">{error}</p>
              <button onClick={fetchEvents} className="mt-6 px-6 py-2 bg-white text-red-600 font-bold rounded-full shadow-sm hover:shadow-md">Try Again</button>
          </div>
      ) : filteredEvents.length === 0 ? (
          <div className="bg-[#f8f4f0] rounded-3xl p-12 text-center border-2 border-dashed border-[#e5e1da]">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1a1a1a]">No events found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] border border-[#e5e1da] p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getCategoryColor(evt.category)}`}>
                              {getCategoryIcon(evt.category)}
                              {evt.category}
                          </div>
                          <div className="text-center bg-[#f8f4f0] px-3 py-2 rounded-xl">
                              <span className="block text-xs font-bold text-gray-400 uppercase">Date</span>
                              <span className="block text-sm font-bold text-[#1a1a1a]">{evt.date}</span>
                          </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#6b1e2e] transition-colors line-clamp-2">
                          {evt.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                          <MapPin className="w-3 h-3" /> {evt.location}
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                          {evt.description}
                      </p>
                      
                      {evt.link && (
                          <a 
                            href={evt.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#6b1e2e] transition-colors mt-auto"
                          >
                              Ticket / Info <ExternalLink className="w-3 h-3" />
                          </a>
                      )}
                  </div>
              ))}
          </div>
      )}

      {/* Sources / Citations */}
      {sources.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#e5e1da]">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Data Sources & Citations</h4>
              <div className="flex flex-wrap gap-3">
                  {sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 hover:text-[#6b1e2e] truncate max-w-xs transition-colors"
                      >
                          {source.title}
                      </a>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default WhatsOn;
