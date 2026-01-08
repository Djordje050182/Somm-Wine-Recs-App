
import React, { useState } from 'react';
import { generateTripItinerary, generateTrailArt } from '../services/geminiService';
import { WINERIES } from '../data/wineries';
import { Sparkles, Loader2, Calendar, Users, Briefcase, MapPin, Coffee, Wine, Footprints, ChevronRight, AlertCircle, DollarSign, Grape, RefreshCcw, Map as MapIcon, List, ExternalLink, Share2, Image as ImageIcon, Download, Gauge, X } from 'lucide-react';
import GuideModal from './GuideModal';
import MapLayer from './MapLayer';

const Concierge: React.FC = () => {
  const [days, setDays] = useState(1);
  const [group, setGroup] = useState('Couple');
  const [vibe, setVibe] = useState('Relaxed');
  const [wineStyle, setWineStyle] = useState('Mix');
  const [budget, setBudget] = useState('Any');
  const [pace, setPace] = useState('Balanced'); 
  
  const [generating, setGenerating] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [generatingArt, setGeneratingArt] = useState(false);
  const [aiArtUrl, setAiArtUrl] = useState<string | null>(null);

  const getFilteredWineries = () => {
    return WINERIES.filter(w => {
      let matchesBudget = true;
      if (budget === 'Save') matchesBudget = w.priceRange === '$' || w.tastingFee <= 10;
      if (budget === 'Splurge') matchesBudget = w.priceRange === '$$$' || w.tastingFee >= 20;

      let matchesStyle = true;
      const specialties = (w.specialty + w.wines.join(' ')).toLowerCase();
      if (wineStyle === 'Reds') matchesStyle = specialties.includes('shiraz') || specialties.includes('cabernet') || specialties.includes('red');
      if (wineStyle === 'Whites') matchesStyle = specialties.includes('semillon') || specialties.includes('chardonnay') || specialties.includes('verdelho');
      if (wineStyle === 'Sparkling') matchesStyle = specialties.includes('sparkling') || specialties.includes('bubbles') || specialties.includes('frizzante');

      let matchesGroup = true;
      if (group.includes('Kids') || group.includes('Family')) matchesGroup = w.kidFriendly;

      return matchesBudget && matchesStyle && matchesGroup;
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setTrip(null);
    setAiArtUrl(null);
    setErrorMessage(null);
    setViewMode('list'); 
    try {
      const relevantWineries = getFilteredWineries();
      const finalWineryList = relevantWineries.length < 3 ? WINERIES : relevantWineries;
      const wineryNames = finalWineryList.map(w => w.name);

      const augmentedVibe = `${vibe} with a ${pace} pace`;

      const jsonStr = await generateTripItinerary(days, group, augmentedVibe, wineryNames);
      
      if (!jsonStr || jsonStr === '{}') {
        throw new Error("No itinerary received. Please try again.");
      }

      let parsedTrip: any;
      try {
        parsedTrip = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error("Parse Error:", parseErr);
        throw new Error("Received malformed data. Let's try once more.");
      }
      
      const findDays = (obj: any): any[] | null => {
        if (obj.days && Array.isArray(obj.days)) return obj.days;
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findDays(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };

      const itineraryDays = findDays(parsedTrip);
      
      if (!itineraryDays || itineraryDays.length === 0) {
        throw new Error("The AI failed to build a valid route. Retrying often helps!");
      }

      setTrip({
        tripName: parsedTrip.tripName || `${days}-Day ${vibe} Trip`,
        summary: parsedTrip.summary || "A custom wine-country escape.",
        days: itineraryDays
      });

    } catch (e: any) {
      console.error("Concierge Error:", e);
      setErrorMessage(e.message || "Something went wrong. The cellar doors are busy!");
    } finally {
      setGenerating(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('winery') || t.includes('wine')) return <Wine className="w-5 h-5 text-[#6b1e2e]" />;
    if (t.includes('food') || t.includes('lunch') || t.includes('dinner')) return <Coffee className="w-5 h-5 text-amber-600" />;
    return <Footprints className="w-5 h-5 text-green-600" />;
  };

  const handleActivityClick = (activityName: string) => {
    const winery = WINERIES.find(w => activityName.toLowerCase().includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(activityName.toLowerCase()));
    if (winery) setSelectedActivity(winery);
  };

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
      const newTrip = { ...trip };
      newTrip.days[dayIndex].activities.splice(activityIndex, 1);
      setTrip(newTrip);
  };

  const getAllStops = () => {
      if (!trip) return [];
      const stops: any[] = [];
      trip.days.forEach((day: any) => {
          day.activities.forEach((act: any) => {
              const winery = WINERIES.find(w => act.activity.toLowerCase().includes(w.name.toLowerCase()));
              if (winery) {
                  stops.push({
                      id: winery.id,
                      name: winery.name,
                      lat: winery.lat,
                      lng: winery.lng,
                      arrival: act.time,
                      type: 'winery'
                  });
              }
          });
      });
      return stops;
  };

  const handleOpenMaps = () => {
      const stops = getAllStops();
      if (stops.length === 0) return;
      
      const origin = "My+Location";
      const destination = `${stops[stops.length-1].lat},${stops[stops.length-1].lng}`;
      const waypoints = stops.slice(0, stops.length-1).map(s => `${s.lat},${s.lng}`).join('|');
      
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      window.open(url, '_blank');
  };

  const handleShare = async () => {
      if (!trip) return;
      const text = `Check out my ${trip.tripName} in the Hunter Valley!\n${trip.summary}`;
      if (navigator.share) {
          await navigator.share({ title: trip.tripName, text: text, url: window.location.href });
      } else {
          navigator.clipboard.writeText(text);
          alert("Trip summary copied to clipboard!");
      }
  };

  const handleGenerateArt = async () => {
      if (!navigator.onLine || !trip) return;
      setGeneratingArt(true);
      const stops = getAllStops().map(s => s.name);
      const names = stops.length > 0 ? stops : trip.days.flatMap((d:any) => d.activities.map((a:any) => a.activity)).slice(0,5);
      
      try {
          const url = await generateTrailArt(names);
          setAiArtUrl(url);
      } catch(e) {
          console.error(e);
          alert("Could not generate art at this time.");
      } finally {
          setGeneratingArt(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      
      {selectedActivity && (
        <GuideModal 
          item={selectedActivity} 
          type="winery" 
          onClose={() => setSelectedActivity(null)} 
        />
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-[#a68d60]/10 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-[#a68d60]" />
        </div>
        <h2 className="text-5xl font-bold text-[#6b1e2e] mb-4 font-serif italic">AI Concierge</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Personalized planning using Gemini 3 Pro reasoning. We optimize routes across the Hunter Valley based on your palate.
        </p>
      </div>

      {/* Input Form */}
      {!trip && (
        <div className="bg-white rounded-[2rem] border border-[#e5e1da] shadow-xl p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <Calendar className="w-4 h-4 text-[#a68d60]" /> Duration
                </label>
                <div className="flex bg-[#f8f4f0] p-1.5 rounded-xl">
                {[1, 2, 3].map(d => (
                    <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${days === d ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    {d} Day{d > 1 ? 's' : ''}
                    </button>
                ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <Users className="w-4 h-4 text-[#a68d60]" /> Who's Coming?
                </label>
                <select 
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-[#f8f4f0] p-4 rounded-xl font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/10 appearance-none"
                >
                <option value="Couple">Couple (Romantic)</option>
                <option value="Family with Kids">Family (Kid Friendly)</option>
                <option value="Group of Friends">Group of Friends</option>
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Corporate">Corporate Team</option>
                </select>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <Briefcase className="w-4 h-4 text-[#a68d60]" /> The Vibe
                </label>
                <select 
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full bg-[#f8f4f0] p-4 rounded-xl font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/10 appearance-none"
                >
                <option value="Relaxed & Scenic">Relaxed & Scenic</option>
                <option value="Foodie & Luxe">Foodie & Luxe</option>
                <option value="Adventure & Active">Adventure & Active</option>
                <option value="History & Heritage">History & Heritage</option>
                <option value="Hidden Gems">Hidden Gems (Off-beat)</option>
                <option value="Instagram Worthy">Instagram Worthy</option>
                </select>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <Gauge className="w-4 h-4 text-[#a68d60]" /> The Pace
                </label>
                <div className="flex bg-[#f8f4f0] p-1.5 rounded-xl">
                {['Chill', 'Balanced', 'Packed'].map(p => (
                    <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${pace === p ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    {p}
                    </button>
                ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <Grape className="w-4 h-4 text-[#a68d60]" /> Wine Preference
                </label>
                <select 
                value={wineStyle}
                onChange={(e) => setWineStyle(e.target.value)}
                className="w-full bg-[#f8f4f0] p-4 rounded-xl font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/10 appearance-none"
                >
                <option value="Mix">Anything Good</option>
                <option value="Reds">Big Reds (Shiraz/Cab)</option>
                <option value="Whites">Crisp Whites (Sem/Chard)</option>
                <option value="Sparkling">Sparkling & Bubbles</option>
                <option value="Natural">Organic / Natural</option>
                </select>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wider text-xs">
                <DollarSign className="w-4 h-4 text-[#a68d60]" /> Budget Tier
                </label>
                <div className="flex bg-[#f8f4f0] p-1.5 rounded-xl">
                {['Any', 'Save', 'Splurge'].map(b => (
                    <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${budget === b ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    {b}
                    </button>
                ))}
                </div>
            </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#f8f4f0] flex justify-center">
            <button 
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#6b1e2e] text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-[#852539] transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3 w-full md:w-auto justify-center disabled:cursor-not-allowed"
            >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {generating ? 'Thinking & Planning Route...' : 'Generate Itinerary'}
            </button>
            </div>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-50 text-red-600 rounded-[2rem] flex flex-col items-center gap-4 border border-red-100 text-center animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <p className="font-bold text-lg">{errorMessage}</p>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest bg-white px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Retry AI Generation
          </button>
        </div>
      )}

      {trip && (
        <div className="animate-in slide-in-from-bottom duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
             <div className="text-center md:text-left flex-1">
                <h3 className="text-4xl font-bold text-[#1a1a1a] mb-2 font-serif">{trip.tripName}</h3>
                <p className="text-[#a68d60] italic font-serif text-xl mb-4">"{trip.summary}"</p>
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                    <button onClick={handleOpenMaps} className="flex items-center gap-2 bg-[#6b1e2e] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#852539] transition-all shadow-md">
                        <ExternalLink className="w-4 h-4" /> Open in Maps
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 bg-white text-[#1a1a1a] border border-[#e5e1da] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#f8f4f0] transition-all shadow-sm">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button onClick={handleGenerateArt} disabled={generatingArt} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md disabled:opacity-50">
                        {generatingArt ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        Visualize
                    </button>
                </div>
             </div>
             
             {/* VIEW TOGGLE */}
             <div className="flex bg-[#f8f4f0] p-1 rounded-xl shrink-0">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-500'}`}
                 >
                     <List className="w-4 h-4" /> Schedule
                 </button>
                 <button 
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-500'}`}
                 >
                     <MapIcon className="w-4 h-4" /> Map View
                 </button>
             </div>
          </div>

          {/* AI ART DISPLAY */}
          {aiArtUrl && (
            <div className="mb-10 bg-[#fdfcfb] border-2 border-[#e5e1da] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-[#6b1e2e] font-serif italic flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Your Visual Journey
                    </h4>
                    <button onClick={() => {const link = document.createElement('a'); link.href = aiArtUrl; link.download='my-trip.png'; link.click();}} className="text-gray-400 hover:text-[#6b1e2e]">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
                <img src={aiArtUrl} className="w-full rounded-2xl shadow-inner" alt="AI Generated Map" />
            </div>
          )}

          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trip.days.map((day: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-[#e5e1da] shadow-lg relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#6b1e2e]"></div>
                    <h4 className="font-bold text-xl mb-6 text-[#1a1a1a] font-serif">{day.dayTitle}</h4>
                    
                    <div className="space-y-8 relative flex-1">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                    {day.activities && day.activities.map((act: any, aIdx: number) => {
                        const isWinery = WINERIES.some(w => act.activity.toLowerCase().includes(w.name.toLowerCase()));
                        
                        return (
                        <div key={aIdx} className="relative pl-12 group">
                            <div className={`absolute left-0 top-0 w-10 h-10 border rounded-full flex items-center justify-center z-10 shadow-sm transition-colors ${isWinery ? 'bg-[#6b1e2e] text-white border-[#6b1e2e]' : 'bg-white border-[#e5e1da]'}`}>
                            {getActivityIcon(act.type)}
                            </div>
                            
                            <div 
                                onClick={() => handleActivityClick(act.activity)}
                                className={`p-3 -ml-3 rounded-xl transition-all relative ${isWinery ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="bg-[#f8f4f0] text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{act.time}</span>
                                    {/* Remove Button - Only visible on hover */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveActivity(idx, aIdx); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all absolute top-2 right-2 z-20"
                                        title="Remove item"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <h5 className={`font-bold text-lg mt-1 ${isWinery ? 'text-[#6b1e2e] underline decoration-dotted decoration-1 underline-offset-4' : 'text-[#1a1a1a]'}`}>
                                    {act.activity}
                                </h5>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{act.description}</p>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                ))}
            </div>
          ) : (
              <div className="bg-white p-2 rounded-[2rem] border border-[#e5e1da] shadow-lg h-[500px] animate-in fade-in relative">
                  <MapLayer stops={getAllStops()} onMarkerClick={(stop) => setSelectedActivity(WINERIES.find(w => w.id === stop.id))} />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold shadow-lg pointer-events-none text-gray-600">
                      Showing stops found in database
                  </div>
              </div>
          )}
          
          <div className="mt-12 text-center">
              <button 
                onClick={() => setTrip(null)} 
                className="text-sm text-gray-400 font-bold underline hover:text-[#6b1e2e] transition-colors"
              >
                  Start Over
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Concierge;
