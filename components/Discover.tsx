
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Star, Wine as WineIcon, ScanLine, MessageCircle, Map as MapIcon, ArrowRight, X, Sparkles, Layers, CloudSun, Wind, Droplets, CalendarCheck } from 'lucide-react';
import { WINERIES } from '../data/wineries';
import { AppTab } from '../types';
import GuideModal from './GuideModal';
import { getCurrentWeather, WeatherData } from '../services/weatherService';

interface DiscoverProps {
  onNavigate: (tab: AppTab) => void;
}

// Data for the new Themed Collections
const COLLECTIONS = [
  {
    id: 'c1',
    title: 'Heritage Icons',
    subtitle: 'The Founding Fathers',
    description: 'Walk the soil of the oldest vines in the valley. These estates defined the Hunter style over 150 years ago.',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=800',
    wineryIds: [1, 8, 2], // Tyrrells, Mt Pleasant, Audrey
    color: 'bg-[#6b1e2e]'
  },
  {
    id: 'c2',
    title: 'Modern Mavericks',
    subtitle: 'Architecture & Innovation',
    description: 'Where cutting-edge design meets contemporary winemaking. Expect sleek lines and bold flavors.',
    image: 'https://images.unsplash.com/photo-1562601579-599dec564e06?auto=format&fit=crop&q=80&w=800',
    wineryIds: [3, 4, 10], // Brokenwood, Tempus, Gundog
    color: 'bg-[#1a1a1a]'
  },
  {
    id: 'c3',
    title: 'Hidden Gems',
    subtitle: 'Off the Beaten Track',
    description: 'Intimate cellar doors tucked away in the sub-regions. Smaller crowds, bigger conversations.',
    image: 'https://images.unsplash.com/photo-1596450514735-300486842270?auto=format&fit=crop&q=80&w=800',
    wineryIds: [5, 6, 9], // Keith Tulloch, Margan, Thomas
    color: 'bg-[#a68d60]'
  }
];

const Discover: React.FC<DiscoverProps> = ({ onNavigate }) => {
  const [selectedWinery, setSelectedWinery] = useState<any>(null);
  const [activeCollection, setActiveCollection] = useState<any>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    getCurrentWeather().then(setWeather);
  }, []);

  // Helper to get wineries for the active collection
  const displayedWineries = activeCollection 
    ? WINERIES.filter(w => activeCollection.wineryIds.includes(w.id))
    : [];

  const handleBookTasting = () => {
      // Set a flag so WineLibrary knows to switch to Bookable view immediately
      localStorage.setItem('wineLib_initialFilter', 'Bookable');
      onNavigate(AppTab.WINES);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      {selectedWinery && (
          <GuideModal 
            item={selectedWinery} 
            type="winery" 
            onClose={() => setSelectedWinery(null)} 
          />
      )}

      {/* COLLECTION OVERLAY */}
      {activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveCollection(null)} />
          <div className="relative bg-[#fdfcfb] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className={`relative h-48 shrink-0 ${activeCollection.color}`}>
              <img src={activeCollection.image} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
              <button 
                onClick={() => setActiveCollection(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1 block">{activeCollection.subtitle}</span>
                <h3 className="text-3xl font-serif font-bold">{activeCollection.title}</h3>
              </div>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <p className="text-gray-600 mb-6 italic border-l-2 border-[#a68d60] pl-4">{activeCollection.description}</p>
              
              <div className="space-y-4">
                {displayedWineries.map((winery, idx) => (
                  <div 
                    key={winery.id}
                    onClick={() => setSelectedWinery(winery)}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-[#e5e1da] hover:border-[#a68d60] hover:shadow-md transition-all cursor-pointer bg-white group"
                  >
                    <div className="relative w-16 h-16 shrink-0">
                      <img src={winery.image} className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1a1a1a] truncate group-hover:text-[#6b1e2e] transition-colors">{winery.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{winery.subregion} • {winery.style}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#6b1e2e]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-[#e5e1da] bg-gray-50">
               <button 
                  onClick={() => onNavigate(AppTab.PLANNER)}
                  className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors"
               >
                 <MapIcon className="w-4 h-4" /> View All on Map
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover"
              alt="Hunter Valley Landscape"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-lg">
              <span className="w-2 h-2 bg-[#a68d60] rounded-full animate-pulse" />
              AI-Powered Discovery
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 leading-[1.1] tracking-tight shadow-sm">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a68d60] to-[#e5e1da]">Taste.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-10 font-light max-w-xl leading-relaxed drop-shadow-md">
              Experience wine like never before. From the Hunter Valley to the world, use AI to scan labels, chat with a Master Sommelier, and craft personalized journeys.
            </p>
            
            {/* Live Weather Widget */}
            {weather && (
              <div className="mb-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:items-center max-w-2xl animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-4 border-r border-white/10 pr-4 shrink-0">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#a68d60]">
                    <CloudSun className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{weather.temp}°C</div>
                    <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">{weather.condition}</div>
                  </div>
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2 text-[#a68d60] text-xs font-bold uppercase tracking-widest mb-1">
                      <Sparkles className="w-3 h-3" /> Sommelier's Forecast
                   </div>
                   <p className="text-white/90 text-sm font-medium italic">"{weather.recommendation}"</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate(AppTab.PLANNER)}
                className="bg-white text-[#1a1a1a] px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Plan My Trip <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onNavigate(AppTab.SCANNER)}
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ScanLine className="w-5 h-5" /> Scan a Bottle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pills */}
      <section className="relative z-20 -mt-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div onClick={() => onNavigate(AppTab.SCANNER)} className="bg-white/95 backdrop-blur p-6 rounded-3xl border border-[#e5e1da] shadow-xl hover:-translate-y-1 transition-transform cursor-pointer group">
                <div className="w-12 h-12 bg-[#f8f4f0] rounded-2xl flex items-center justify-center text-[#6b1e2e] mb-4 group-hover:bg-[#6b1e2e] group-hover:text-white transition-colors">
                    <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Visual Scanner</h3>
                <p className="text-sm text-gray-500">Instant label analysis.</p>
            </div>
            {/* BOOK A TASTING: Direct Link Logic */}
            <div onClick={handleBookTasting} className="bg-white/95 backdrop-blur p-6 rounded-3xl border border-[#e5e1da] shadow-xl hover:-translate-y-1 transition-transform cursor-pointer group">
                <div className="w-12 h-12 bg-[#f8f4f0] rounded-2xl flex items-center justify-center text-[#6b1e2e] mb-4 group-hover:bg-[#6b1e2e] group-hover:text-white transition-colors">
                    <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Book a Tasting</h3>
                <p className="text-sm text-gray-500">Reserve your spot instantly.</p>
            </div>
            <div onClick={() => onNavigate(AppTab.LIVE)} className="bg-white/95 backdrop-blur p-6 rounded-3xl border border-[#e5e1da] shadow-xl hover:-translate-y-1 transition-transform cursor-pointer group">
                <div className="w-12 h-12 bg-[#f8f4f0] rounded-2xl flex items-center justify-center text-[#6b1e2e] mb-4 group-hover:bg-[#6b1e2e] group-hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Live Sommelier</h3>
                <p className="text-sm text-gray-500">Real-time voice chat.</p>
            </div>
            <div onClick={() => onNavigate(AppTab.CONCIERGE)} className="bg-white/95 backdrop-blur p-6 rounded-3xl border border-[#e5e1da] shadow-xl hover:-translate-y-1 transition-transform cursor-pointer group">
                <div className="w-12 h-12 bg-[#f8f4f0] rounded-2xl flex items-center justify-center text-[#6b1e2e] mb-4 group-hover:bg-[#6b1e2e] group-hover:text-white transition-colors">
                    <MapIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Intelligent Trips</h3>
                <p className="text-sm text-gray-500">AI itinerary planning.</p>
            </div>
        </div>
      </section>

      {/* Sommelier Sets */}
      <section className="py-20 px-4 md:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-[#a68d60] font-bold text-xs uppercase tracking-widest">
                <Layers className="w-4 h-4" />
                Editorial Picks
            </div>
            <h3 className="text-4xl font-bold mb-3 text-[#1a1a1a] font-serif">Sommelier Sets</h3>
            <p className="text-gray-500 text-lg max-w-xl">
                Expertly grouped collections to help you find your perfect vibe, from historic estates to hidden gems.
            </p>
          </div>
          <button 
            onClick={() => onNavigate(AppTab.WINES)}
            className="text-[#1a1a1a] font-bold bg-[#f8f4f0] px-6 py-3 rounded-full hover:bg-[#e5e1da] transition-all flex items-center gap-2"
          >
            Browse Full Library <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLLECTIONS.map((collection) => (
            <div 
                key={collection.id} 
                onClick={() => setActiveCollection(collection)}
                className="group cursor-pointer relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-lg transition-transform hover:-translate-y-2"
            >
              <img 
                src={collection.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={collection.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
              
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full text-white group-hover:bg-white group-hover:text-black transition-all">
                <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Sparkles className="w-4 h-4 text-[#a68d60]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#a68d60]">{collection.wineryIds.length} Wineries</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">{collection.subtitle}</p>
                <h3 className="text-3xl font-serif font-bold mb-4">{collection.title}</h3>
                <p className="text-gray-300 text-sm line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {collection.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vintage News / Insights */}
      <section className="bg-[#1a1a1a] py-20 px-4 md:px-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6b1e2e] rounded-full blur-[150px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 border border-[#a68d60] text-[#a68d60] rounded-full text-xs font-bold uppercase tracking-widest mb-6">Vintage Report</div>
            <h3 className="text-5xl font-bold mb-6 font-serif">2025 Growing Season</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              The early pick for Semillon looks promising this season. Winemakers are reporting high natural acidity and pristine fruit quality, echoing the legendary conditions of the 2017 vintage.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <span className="text-3xl font-bold text-[#a68d60]">98/100</span>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Shiraz Outlook</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <span className="text-3xl font-bold text-[#a68d60]">A++</span>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Semillon Quality</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <img 
              src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800" 
              className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 border-8 border-white/5"
              alt="Wine barrels"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Discover;
