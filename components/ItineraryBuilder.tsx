
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WINERIES } from '../data/wineries';
import { EXPERIENCES } from '../data/experiences';
import { Itinerary, ItineraryStop } from '../types';
// Trail art and geocoding removed (Gemini-specific); future: use Claude service
import { MapPin, Clock, Navigation, Palette, Download, Share2, Wine, Trash2, Plus, Loader2, Star, ChevronRight, X, Sparkles, Image as ImageIcon, Map as MapIcon, Calendar, Baby, Dog, DollarSign, Info, Search, Filter, ArrowUpDown, Heart, ExternalLink, Save, LocateFixed, Compass, Utensils, Flag, ShoppingBag, Bird, Mountain, Copy, Check, Car, ArrowRight } from 'lucide-react';
import GuideModal from './GuideModal';
import MapLayer from './MapLayer';
import { calculateDistance } from '../services/geoUtils';

// Pre-defined routes for "One-Tap" planning (VERIFIED WORKING URLS)
const QUICK_TEMPLATES = [
  {
    name: "The Icons Trail",
    description: "Must-visits for first timers.",
    ids: [1, 3, 8], // Tyrrells, Brokenwood, Mt Pleasant
    icon: <Star className="w-5 h-5 text-amber-500" />,
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=400",
    color: "bg-[#1a1a1a] text-white"
  },
  {
    name: "Big Reds & Views",
    description: "Scenic drive seeking Shiraz.",
    ids: [2, 5, 9], // Audrey, Keith Tulloch, Thomas
    icon: <Mountain className="w-5 h-5 text-[#6b1e2e]" />,
    image: "https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&q=80&w=400",
    color: "bg-[#6b1e2e] text-white"
  },
  {
    name: "Foodie Indulgence",
    description: "Fine dining and premium tastings.",
    ids: [4, 'e3', 'e6'], // Tempus, Muse, Cheese Co
    icon: <Utensils className="w-5 h-5 text-orange-500" />,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400",
    color: "bg-orange-50 text-orange-900"
  }
];

const ItineraryBuilder: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [generatingAIArt, setGeneratingAIArt] = useState(false);
  const [aiArtUrl, setAiArtUrl] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<{item: any, type: 'winery' | 'experience'} | null>(null);

  // Start Location
  const [startLocation, setStartLocation] = useState<{name: string, lat: number, lng: number}>({
    name: 'Pokolbin Central',
    lat: -32.7850,
    lng: 151.3150
  });
  const [startInput, setStartInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'established'>('rating');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Refs for scrolling
  const generateBtnRef = useRef<HTMLButtonElement>(null);

  // Consolidate data
  const ALL_LOCATIONS = useMemo(() => {
    const wineryItems = WINERIES.map(w => ({ ...w, type: 'winery' as const }));
    const expItems = EXPERIENCES.map(e => ({ ...e, type: 'experience' as const, style: e.category, specialty: e.category }));
    return [...wineryItems, ...expItems];
  }, []);

  useEffect(() => {
    const loadData = () => {
      try {
          const savedFavs = JSON.parse(localStorage.getItem('favWineries') || '[]');
          setFavorites(savedFavs);
          const savedPlannerIds = JSON.parse(localStorage.getItem('plannerIds') || '[]');
          setSelectedIds(savedPlannerIds);
          const savedItinerary = localStorage.getItem('currentItinerary');
          if (savedItinerary) {
            setItinerary(JSON.parse(savedItinerary));
          }
      } catch (e) {
          console.error("Failed to load planner data", e);
      }
    };
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('somm-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('somm-storage-update', handleStorageUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem('plannerIds', JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    if (itinerary) localStorage.setItem('currentItinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  const styles = ['All', 'Experiences', ...new Set(WINERIES.map(w => w.style))];

  const filteredLocations = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return ALL_LOCATIONS
      .filter(item => {
        const matchesSearch = !searchTerm || item.name.toLowerCase().includes(lowerSearch) || 
                            item.specialty.toLowerCase().includes(lowerSearch) ||
                            item.subregion.toLowerCase().includes(lowerSearch);
        let matchesStyle = true;
        if (styleFilter !== 'All') {
            if (styleFilter === 'Experiences') matchesStyle = item.type === 'experience';
            else matchesStyle = item.type === 'winery' && item.style === styleFilter;
        }
        return matchesSearch && matchesStyle;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        const estA = (a as any).established || 2000;
        const estB = (b as any).established || 2000;
        if (sortBy === 'established') return estA - estB;
        return 0;
      });
  }, [searchTerm, styleFilter, sortBy, ALL_LOCATIONS]);

  const toggleFavorite = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    if (typeof id === 'number') {
        const updated = favorites.includes(id) ? favorites.filter(fId => fId !== id) : [...favorites, id];
        setFavorites(updated);
        localStorage.setItem('favWineries', JSON.stringify(updated));
    }
  };

  const toggleLocation = (id: number | string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 6) {
        alert("You can only add up to 6 stops to a daily route.");
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const applyTemplate = (templateIds: (string|number)[]) => {
      setSelectedIds(templateIds);
      setItinerary(null); // Reset current itinerary to force re-generation
      // Scroll to generate button to prompt user action
      setTimeout(() => {
          generateBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // QA Check: If user is ridiculously far (e.g. London), default to local
                const distToHunter = calculateDistance(latitude, longitude, -32.7850, 151.3150);
                if (distToHunter > 200) {
                    alert("You seem far away! We'll start your route from Pokolbin Central.");
                    setStartLocation({ name: 'Pokolbin Central', lat: -32.7850, lng: 151.3150 });
                    setStartInput('Pokolbin Central');
                } else {
                    setStartLocation({ name: 'Current Location', lat: latitude, lng: longitude });
                    setStartInput('Current Location');
                }
                setIsLocating(false);
            },
            (error) => { alert("Could not get location."); setIsLocating(false); }
        );
    } else {
        alert("Geolocation is not supported");
        setIsLocating(false);
    }
  };

  const handleLocationSearch = () => {
    if (!startInput.trim()) return;
    // Use Pokolbin Central as default fallback when geocoding unavailable
    setStartLocation({ name: startInput, lat: -32.785, lng: 151.318 });
  };

  const generateItinerary = () => {
    if (selectedIds.length === 0) return;
    
    // Safety check: ensure selected IDs actually exist in our data
    let remaining = ALL_LOCATIONS.filter(item => selectedIds.includes(item.id));
    
    if (remaining.length === 0) {
        alert("Selected locations could not be found. Try clearing and re-selecting.");
        return;
    }

    const stops: ItineraryStop[] = [];
    let currentLat = startLocation.lat;
    let currentLng = startLocation.lng;
    let timeMinutes = 10 * 60; 

    // Greedy nearest neighbor algorithm with safety break
    let safetyCounter = 0;
    while (remaining.length > 0) {
      safetyCounter++;
      if (safetyCounter > 20) break; // Prevent infinite loops

      let nearestIdx = 0;
      let minDistance = Infinity;
      
      remaining.forEach((item, i) => {
        const d = calculateDistance(currentLat, currentLng, item.lat, item.lng);
        if (d < minDistance) { minDistance = d; nearestIdx = i; }
      });

      const next = remaining[nearestIdx];
      if (!next) break; 

      // Remove from remaining
      remaining.splice(nearestIdx, 1);

      const driveTime = Math.round((minDistance / 40) * 60) + 5;
      timeMinutes += driveTime;
      const arrival = `${Math.floor(timeMinutes / 60)}:${(timeMinutes % 60).toString().padStart(2, '0')}`;
      
      let stay = 60;
      if (next.type === 'experience') {
         if (next.specialty === 'Golf') stay = 240;
         else if (next.specialty === 'Dining') stay = 90;
         else if (next.specialty === 'Adventure') stay = 120;
         else stay = 45;
      } else {
         stay = (stops.length === 2 && (next as any).hasRestaurant) ? 90 : 60;
      }

      stops.push({
        id: next.id,
        name: next.name,
        lat: next.lat,
        lng: next.lng,
        image: next.image,
        description: next.description,
        specialty: next.specialty,
        type: next.type,
        arrival,
        driveTime,
        stayDuration: stay,
        isLunchStop: (stops.length === 2 && (next as any).hasRestaurant) || (next.specialty === 'Dining')
      });

      timeMinutes += stay;
      currentLat = next.lat;
      currentLng = next.lng;
    }

    setItinerary({
      wineries: stops,
      totalDriveTime: stops.reduce((acc, s) => acc + s.driveTime, 0),
      startLocation: startLocation.name,
      estimatedEnd: `${Math.floor(timeMinutes / 60)}:${(timeMinutes % 60).toString().padStart(2, '0')}`
    });
    setAiArtUrl(null);
  };

  const removeStop = (stopId: number | string) => {
      if (!itinerary) return;
      const updatedStops = itinerary.wineries.filter(w => w.id !== stopId);
      // Recalculate itinerary without the stop? 
      // Simple removal for now, complex recalc would require re-running generate logic
      setItinerary({
          ...itinerary,
          wineries: updatedStops
      });
      // Also update selection state
      setSelectedIds(prev => prev.filter(id => id !== stopId));
  };

  const openInGoogleMaps = () => {
    if (!itinerary || itinerary.wineries.length === 0) return;
    const startLat = startLocation.lat;
    const startLng = startLocation.lng;
    const destination = itinerary.wineries[itinerary.wineries.length - 1];
    const waypoints = itinerary.wineries.slice(0, itinerary.wineries.length - 1).map(w => `${w.lat},${w.lng}`).join('|');
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destination.lat},${destination.lng}&waypoints=${waypoints}&travelmode=driving`, '_blank');
  };

  const shareItinerary = async () => {
    if (!itinerary) return;
    const text = `My Hunter Valley Trail: ${startLocation.name} -> ${itinerary.wineries.map(w => w.name).join(' -> ')}`;
    if (navigator.share) {
      await navigator.share({ title: 'My VinoAI Itinerary', text: text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert("Itinerary copied!");
    }
  };

  const handleGenerateAIArt = () => {
    // Trail art generation requires image model — coming in future update
    alert('Trail art generation coming soon!');
  };

  const getExperienceIcon = (category: string) => {
    switch(category) {
        case 'Dining': return <Utensils className="w-3 h-3" />;
        case 'Adventure': return <Mountain className="w-3 h-3" />;
        case 'Golf': return <Flag className="w-3 h-3" />;
        case 'Shopping': return <ShoppingBag className="w-3 h-3" />;
        case 'Nature': return <Bird className="w-3 h-3" />;
        default: return <Compass className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12 animate-in fade-in">
      {viewingItem && <GuideModal item={viewingItem.item} type={viewingItem.type} onClose={() => setViewingItem(null)} />}

      <div className="lg:w-2/5 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-[#6b1e2e] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</div>
             <h2 className="text-3xl font-bold text-[#1a1a1a] font-serif italic">Select Destinations</h2>
          </div>
          <p className="text-gray-500 pl-8">Pick up to 6 stops or use a template to auto-fill.</p>
        </div>

        {/* ONE-TAP TEMPLATES (Visual Redesign) */}
        {selectedIds.length === 0 && (
            <div className="grid grid-cols-1 gap-3">
                {QUICK_TEMPLATES.map(template => (
                    <button 
                        key={template.name}
                        onClick={() => applyTemplate(template.ids)}
                        className="relative overflow-hidden rounded-2xl h-24 group transition-all hover:scale-[1.02] shadow-sm hover:shadow-lg"
                    >
                        <img src={template.image} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute inset-0 p-4 flex items-center gap-4 text-white">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm bg-white/20`}>
                                {template.icon}
                            </div>
                            <div className="text-left flex-1">
                                <h5 className="font-bold text-lg leading-tight">{template.name}</h5>
                                <p className="text-xs text-white/80">{template.description}</p>
                            </div>
                            <Plus className="w-5 h-5 text-white/80" />
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Selected Counter & Clear */}
        {selectedIds.length > 0 && (
            <div className="flex justify-between items-center bg-[#f8f4f0] p-3 rounded-xl border border-[#e5e1da]">
                <div className="font-bold text-[#6b1e2e] text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" /> {selectedIds.length} stops selected
                </div>
                <button onClick={() => { setSelectedIds([]); setItinerary(null); }} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                    Clear Selection
                </button>
            </div>
        )}

        {/* Start Location */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e1da] shadow-sm">
            <label className="text-xs font-bold text-[#a68d60] uppercase tracking-widest mb-3 block flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Start Location
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        value={startInput}
                        onChange={(e) => setStartInput(e.target.value)}
                        onBlur={handleLocationSearch}
                        onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                        placeholder="e.g. Crowne Plaza"
                        className="w-full bg-[#f8f4f0] rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {isLocating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b1e2e] animate-spin" />}
                </div>
                <button onClick={handleCurrentLocation} className="p-3 bg-[#f8f4f0] text-[#6b1e2e] rounded-xl hover:bg-[#6b1e2e] hover:text-white transition-colors">
                    <LocateFixed className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* List & Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destinations..."
              className="w-full bg-white border border-[#e5e1da] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/10 shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {styles.map(s => (
              <button 
                key={s}
                onClick={() => setStyleFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${styleFilter === s ? 'bg-[#6b1e2e] text-white border-[#6b1e2e]' : 'bg-white text-gray-500 border-[#e5e1da] hover:border-[#6b1e2e]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLocations.map(item => {
             const isSelected = selectedIds.includes(item.id);
             const isWinery = item.type === 'winery';
             return (
            <div 
              key={item.id} 
              onClick={() => toggleLocation(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${isSelected ? (isWinery ? 'border-[#6b1e2e] bg-[#6b1e2e]/5 shadow-md' : 'border-blue-500 bg-blue-50 shadow-md') : 'border-[#e5e1da] bg-white hover:border-[#a68d60]'}`}
            >
              <div className="flex gap-4 relative z-10">
                <div className="relative shrink-0">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                  <div className="absolute -top-2 -left-2 bg-white rounded-lg px-2 py-0.5 shadow-sm border border-[#e5e1da] flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-[10px] font-bold">{item.rating}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-[#1a1a1a] truncate text-base pr-4">{item.name}</h4>
                    <div className="flex items-center gap-3 shrink-0">
                      {isWinery && (
                          <button onClick={(e) => toggleFavorite(e, item.id as number)} className={`p-1 transition-colors ${favorites.includes(item.id as number) ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}>
                            <Heart className={`w-4 h-4 ${favorites.includes(item.id as number) ? 'fill-current' : ''}`} />
                          </button>
                      )}
                      {isSelected ? <Trash2 className="w-4 h-4 text-red-400 shrink-0" /> : <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#6b1e2e] shrink-0" />}
                    </div>
                  </div>
                  <p className="text-xs text-[#a68d60] font-semibold mb-1 flex items-center gap-1 uppercase tracking-wider"><MapPin className="w-3 h-3" /> {item.subregion}</p>
                  <div className="flex justify-between items-center mt-1">
                      <div className="flex flex-wrap gap-2">
                        {isWinery ? (
                            <span className="bg-white/50 border border-[#e5e1da] px-2 py-0.5 rounded-md text-[9px] font-bold text-gray-600 uppercase flex items-center gap-1 shadow-sm">{item.style}</span>
                        ) : (
                            <span className="bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md text-[9px] font-bold text-blue-700 uppercase flex items-center gap-1 shadow-sm">{getExperienceIcon(item.specialty)} {item.specialty}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingItem({item: item, type: item.type}) }}
                        className="text-xs font-bold text-gray-400 hover:text-[#6b1e2e] underline transition-colors"
                      >
                          Info & Booking
                      </button>
                  </div>
                </div>
              </div>
            </div>
          );})}
        </div>

        <div className="pt-4 border-t border-[#e5e1da]">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#a68d60] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <h2 className="text-xl font-bold text-[#1a1a1a] font-serif italic">Create Route</h2>
            </div>
            <button 
                ref={generateBtnRef}
                onClick={generateItinerary} 
                disabled={selectedIds.length === 0} 
                className="w-full bg-[#6b1e2e] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#852539] disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
            <Sparkles className="w-5 h-5" /> Generate Optimized Route
            </button>
        </div>
      </div>

      {/* Result Panel */}
      <div className="flex-1">
        {!itinerary ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#f8f4f0] rounded-3xl border-2 border-dashed border-[#e5e1da]">
            <MapPin className="w-16 h-16 text-[#a68d60] mb-4 opacity-30" />
            <p className="text-gray-400 font-medium">Your curated trail will appear here</p>
            <div className="mt-4 flex gap-2 items-center text-xs text-gray-400"><Info className="w-3.5 h-3.5" /><span>Select destinations to start planning</span></div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                 <h3 className="text-3xl font-bold text-[#6b1e2e] font-serif italic">Your Hunter Experience</h3>
                 <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest"><Save className="w-3 h-3" /> Saved to Device</div>
              </div>
              <div className="flex gap-4 text-xs font-bold text-[#a68d60] uppercase tracking-widest">
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Finish {itinerary.estimatedEnd}</div>
                <div className="flex items-center gap-1"><Navigation className="w-4 h-4" /> {itinerary.totalDriveTime}m Drive</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-1 border border-[#e5e1da] shadow-sm mb-8 h-[400px] relative overflow-hidden">
                <MapLayer stops={itinerary.wineries} onMarkerClick={(stop) => setViewingItem({item: stop, type: stop.type || 'winery'})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={openInGoogleMaps} className="bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-colors"><ExternalLink className="w-5 h-5" /> Open Maps</button>
                <button onClick={shareItinerary} className="bg-[#a68d60] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#8e7850] transition-colors"><Share2 className="w-5 h-5" /> Share Plan</button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#a68d60] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                    <h2 className="text-xl font-bold text-[#1a1a1a] font-serif italic">Book & Go</h2>
                </div>
              {itinerary.wineries.map((w, i) => {
                const wineryRef = (w.type === 'winery' ? WINERIES.find(win => win.id === w.id) : EXPERIENCES.find(ex => ex.id === w.id)) || w;
                return (
                <div key={w.id} className="relative pl-12 pb-8 last:pb-0">
                  {i < itinerary.wineries.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-1 border-l-2 border-dashed border-[#e5e1da]" />}
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-lg z-10 ${w.type === 'experience' ? 'bg-blue-600' : 'bg-[#6b1e2e]'}`}>{i + 1}</div>
                  
                  <div className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group ${w.type === 'experience' ? 'border-blue-100 hover:border-blue-300' : 'border-[#e5e1da] hover:border-[#a68d60]'}`}>
                     <div className="relative">
                        <img src={w.image} className="w-full md:w-32 h-32 rounded-xl object-cover" />
                        {/* Remove Action */}
                        <button 
                            onClick={() => removeStop(w.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                            title="Remove from itinerary"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             {w.type === 'experience' && <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded">{w.specialty}</span>}
                             <h4 className="text-xl font-bold text-[#1a1a1a] cursor-pointer hover:underline" onClick={() => setViewingItem({item: w, type: w.type || 'winery'})}>{w.name}</h4>
                          </div>
                          {w.type === 'winery' && <p className="text-[#a68d60] text-sm font-semibold">{w.specialty}</p>}
                        </div>
                        <span className="bg-[#f8f4f0] px-3 py-1 rounded-full text-[10px] font-bold text-[#6b1e2e] uppercase tracking-wider">{w.arrival}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">"{w.description}"</p>
                      
                      {/* Direct Booking Action within Route Item */}
                      <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setViewingItem({item: w, type: w.type || 'winery'}); }}
                            className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#6b1e2e] transition-colors"
                          >
                              View & Book <ArrowRight className="w-3 h-3" />
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <div className="pt-8 border-t border-[#e5e1da]">
               <button onClick={handleGenerateAIArt} disabled={generatingAIArt || !navigator.onLine} className="w-full bg-gradient-to-r from-[#6b1e2e] to-[#a68d60] text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                {generatingAIArt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {generatingAIArt ? 'Painting Your Wine Ramble...' : 'Generate AI "Wine Ramble" Souvenir'}
              </button>
            </div>

            {aiArtUrl && (
                <div className="p-8 bg-[#fdfcfb] rounded-3xl border-2 border-[#e5e1da] shadow-2xl animate-in fade-in zoom-in duration-1000">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-bold text-[#6b1e2e] flex items-center gap-3 font-serif italic text-2xl"><Sparkles className="w-6 h-6 text-[#a68d60]" /> Your Personal Wine Ramble</h4>
                    <button onClick={() => {const link = document.createElement('a'); link.href = aiArtUrl; link.download='wine-ramble.png'; link.click();}} className="p-3 bg-[#6b1e2e] text-white rounded-full hover:bg-[#852539] transition-all shadow-lg"><Download className="w-5 h-5" /></button>
                  </div>
                  <div className="relative group bg-[#f5f1ea] p-4 rounded-2xl shadow-inner border border-[#e5e1da]/50">
                    <img src={aiArtUrl} className="w-full rounded-xl shadow-2xl" alt="AI Wine Ramble Map" />
                  </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryBuilder;
