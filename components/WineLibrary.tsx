
import React, { useState, useMemo, useEffect } from 'react';
import { WINES, WINERIES } from '../data/wineries';
import { Search, Wine as WineIcon, Sparkles, Star, ChevronDown, ArrowUpDown, Heart, Building2, Utensils, ShoppingBag, Droplets, Flame, RefreshCcw, MapPin, CalendarCheck, ArrowRight, ExternalLink, X, Baby, Dog, Ticket, Check } from 'lucide-react';
import GuideModal from './GuideModal';
import ImageWithLoader from './ImageWithLoader';
import { addToCart, getWinePricing } from '../services/commerceService';

// Helper to determine taste style for novices
const getTasteStyle = (variety: string): string => {
    const v = variety.toLowerCase();
    if (v.includes('shiraz') || v.includes('cabernet')) return 'Bold Red';
    if (v.includes('semillon') || v.includes('verdelho') || v.includes('pinot gris')) return 'Crisp White';
    if (v.includes('chardonnay')) return 'Rich White';
    if (v.includes('rosé') || v.includes('rose')) return 'Fruity Rosé';
    if (v.includes('barbera') || v.includes('pinot noir')) return 'Light Red';
    return 'Other';
};

const WineLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'wines' | 'wineries'>('wines');
  const [search, setSearch] = useState('');
  
  // Wine Filters
  const [varietyFilter, setVarietyFilter] = useState('All');
  const [tasteFilter, setTasteFilter] = useState('All');
  const [wineryFilter, setWineryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high' | 'rating' | 'trending'>('rating');
  
  // Winery Filters
  const [regionFilter, setRegionFilter] = useState('All');
  const [amenityFilter, setAmenityFilter] = useState('All');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteWineries, setFavoriteWineries] = useState<number[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<{item: any, type: 'wine' | 'winery'} | null>(null);
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0);
  
  // Active Filter Banner State
  const [showActiveFilterBanner, setShowActiveFilterBanner] = useState(false);

  useEffect(() => {
    const loadData = () => {
        try {
            const savedWines = JSON.parse(localStorage.getItem('favWines') || '[]');
            const savedWineries = JSON.parse(localStorage.getItem('favWineries') || '[]');
            setFavorites(savedWines);
            setFavoriteWineries(savedWineries);
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    };
    loadData();

    const handlePriceUpdate = () => setPriceUpdateTrigger(prev => prev + 1);
    window.addEventListener('somm-price-update', handlePriceUpdate);

    // Check for Deep Link signal from Discover (e.g., "Book a Tasting" clicked)
    const initialFilter = localStorage.getItem('wineLib_initialFilter');
    if (initialFilter === 'Bookable') {
        setViewMode('wineries');
        setAmenityFilter('Bookable');
        setShowActiveFilterBanner(true);
        localStorage.removeItem('wineLib_initialFilter');
    }

    return () => window.removeEventListener('somm-price-update', handlePriceUpdate);
  }, []);

  const varieties = useMemo(() => ['All', ...new Set(WINES.map(w => w.variety).sort())], []);
  const tasteStyles = ['All', 'Crisp White', 'Rich White', 'Bold Red', 'Light Red', 'Fruity Rosé'];
  const wineriesList = useMemo(() => ['All', ...WINERIES.map(w => w.name).sort()], []);
  const regions = useMemo(() => ['All', ...new Set(WINERIES.map(w => w.subregion).sort())], []);
  const amenities = ['All', 'Bookable', 'Restaurant', 'Kid Friendly', 'Dog Friendly', 'Walk-ins OK'];

  // --- WINE FILTERING ---
  const filteredWines = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return WINES.filter(w => {
        const winery = WINERIES.find(winery => winery.id === w.wineryId);
        const wineryName = winery?.name || '';
        
        // Search
        if (search && !w.name.toLowerCase().includes(lowerSearch) && !wineryName.toLowerCase().includes(lowerSearch)) return false;
        
        // Filters
        if (varietyFilter !== 'All' && w.variety !== varietyFilter) return false;
        if (wineryFilter !== 'All' && wineryName !== wineryFilter) return false;
        if (tasteFilter !== 'All' && getTasteStyle(w.variety) !== tasteFilter) return false;
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return b.rating - a.rating;
        
        const priceA = parseInt(a.price.replace(/[^0-9]/g, '') || '0');
        const priceB = parseInt(b.price.replace(/[^0-9]/g, '') || '0');
        
        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'trending') return (parseInt(b.id.replace('w','')) % 10) - (parseInt(a.id.replace('w','')) % 10);
        return 0;
      });
  }, [search, varietyFilter, wineryFilter, tasteFilter, sortBy, priceUpdateTrigger]);

  // --- WINERY FILTERING ---
  const filteredWineries = useMemo(() => {
      const lowerSearch = search.toLowerCase();

      return WINERIES.filter(w => {
          if (search && !w.name.toLowerCase().includes(lowerSearch) && !w.specialty.toLowerCase().includes(lowerSearch)) return false;
          if (regionFilter !== 'All' && w.subregion !== regionFilter) return false;
          
          if (amenityFilter === 'Restaurant' && !w.hasRestaurant) return false;
          if (amenityFilter === 'Kid Friendly' && !w.kidFriendly) return false;
          if (amenityFilter === 'Dog Friendly' && !w.dogFriendly) return false;
          if (amenityFilter === 'Walk-ins OK' && w.bookingRequired) return false;
          if (amenityFilter === 'Bookable' && !w.bookingUrl) return false;

          return true;
      }).sort((a,b) => b.rating - a.rating);
  }, [search, regionFilter, amenityFilter]);

  const toggleFavoriteWine = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = favorites.includes(id) 
      ? favorites.filter(fId => fId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('favWines', JSON.stringify(updated));
  };

  const toggleFavoriteWinery = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = favoriteWineries.includes(id) 
      ? favoriteWineries.filter(fId => fId !== id)
      : [...favoriteWineries, id];
    setFavoriteWineries(updated);
    localStorage.setItem('favWineries', JSON.stringify(updated));
  };

  const handleAddToCart = (e: React.MouseEvent, wineId: string) => {
    e.stopPropagation();
    addToCart(wineId);
  };

  const handleBookClick = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      window.open(url, '_blank');
  };

  const clearFilters = () => {
      setSearch(''); 
      setRegionFilter('All'); 
      setAmenityFilter('All');
      setVarietyFilter('All');
      setTasteFilter('All');
      setWineryFilter('All');
      setShowActiveFilterBanner(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {selectedItem && (
        <GuideModal 
            item={selectedItem.item} 
            type={selectedItem.type} 
            onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* ACTIVE FILTER BANNER (Contextual Help) */}
      {showActiveFilterBanner && amenityFilter === 'Bookable' && (
          <div className="bg-[#1a1a1a] text-white p-4 rounded-2xl mb-8 flex justify-between items-center shadow-lg animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                  <div className="bg-[#a68d60] p-2 rounded-full text-white">
                      <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                      <h4 className="font-bold text-sm">Instant Reservations</h4>
                      <p className="text-xs text-gray-400">Showing venues with real-time online booking available.</p>
                  </div>
              </div>
              <button onClick={clearFilters} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  Clear Filter <X className="w-4 h-4" />
              </button>
          </div>
      )}

      <div className="text-center mb-10">
        <h2 className="text-5xl font-bold text-[#6b1e2e] mb-4 font-serif italic">
            {viewMode === 'wines' ? 'The Cellar Library' : 'The Estate Directory'}
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {viewMode === 'wines' 
                ? "From heritage Shiraz to crystalline Semillon, explore the definitive ranking of Hunter Valley excellence."
                : "Discover the historic cellar doors and boutique vineyards that define the region."
            }
        </p>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex justify-center mb-12">
          <div className="bg-[#f8f4f0] p-1.5 rounded-full flex gap-1 border border-[#e5e1da] shadow-inner relative">
              <button 
                onClick={() => setViewMode('wines')} 
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all relative z-10 ${viewMode === 'wines' ? 'text-white shadow-md' : 'text-gray-500 hover:text-[#6b1e2e]'}`}
              >
                  Bottles
              </button>
              <button 
                onClick={() => setViewMode('wineries')} 
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all relative z-10 ${viewMode === 'wineries' ? 'text-white shadow-md' : 'text-gray-500 hover:text-[#6b1e2e]'}`}
              >
                  Estates
              </button>
              
              {/* Sliding Background */}
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#6b1e2e] rounded-full transition-transform duration-300 ease-out ${viewMode === 'wines' ? 'translate-x-0' : 'translate-x-full left-1.5'}`}
              />
          </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col gap-6 mb-12">
          <div className="bg-white rounded-3xl p-4 border border-[#e5e1da] shadow-sm flex flex-col md:flex-row gap-4 sticky top-4 z-30">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={viewMode === 'wines' ? "Search for a wine..." : "Search estates..."}
                    className="w-full bg-[#f8f4f0] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20"
                />
            </div>
            
            {viewMode === 'wines' && (
                <div className="relative group w-full md:w-auto">
                    <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-[#f8f4f0] rounded-2xl py-3 pl-4 pr-10 focus:outline-none font-bold text-sm text-[#6b1e2e] cursor-pointer w-full md:min-w-[180px]"
                    >
                    <option value="rating">Top Rated</option>
                    <option value="trending">🔥 Trending Now</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Alphabetical</option>
                    </select>
                    <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b1e2e] pointer-events-none opacity-50" />
                </div>
            )}
          </div>
          
          {viewMode === 'wines' ? (
              /* WINE FILTERS */
              <>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">By Variety</h4>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {varieties.map(v => (
                            <button 
                                key={v}
                                onClick={() => { setVarietyFilter(v); setTasteFilter('All'); }}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${varietyFilter === v ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#e5e1da] text-gray-500 hover:border-[#1a1a1a]'}`}
                            >
                                {v === 'All' ? 'All Varieties' : v}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">By Style</h4>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {tasteStyles.map(style => (
                            <button 
                                key={style}
                                onClick={() => { setTasteFilter(style); setVarietyFilter('All'); }}
                                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${tasteFilter === style ? 'bg-[#6b1e2e] text-white shadow-md transform scale-105' : 'bg-white border border-[#e5e1da] text-gray-600 hover:border-[#6b1e2e]'}`}
                            >
                                {style === 'All' ? 'All Styles' : style}
                            </button>
                        ))}
                    </div>
                </div>
              </>
          ) : (
              /* WINERY FILTERS */
              <>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Subregion</h4>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {regions.map(r => (
                            <button 
                                key={r}
                                onClick={() => setRegionFilter(r)}
                                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${regionFilter === r ? 'bg-[#6b1e2e] text-white shadow-md transform scale-105' : 'bg-white border border-[#e5e1da] text-gray-600 hover:border-[#6b1e2e]'}`}
                            >
                                {r === 'All' ? 'All Regions' : r}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Amenities</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {amenities.map(a => (
                            <button 
                                key={a} 
                                onClick={() => { setAmenityFilter(a); if(a!=='Bookable') setShowActiveFilterBanner(false); }}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${amenityFilter === a ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#e5e1da] text-gray-500 hover:border-[#1a1a1a]'}`}
                            >
                                {a === 'All' ? 'All Features' : a}
                            </button>
                        ))}
                    </div>
                </div>
              </>
          )}
      </div>

      {/* GRID CONTENT */}
      {viewMode === 'wines' ? (
          /* WINE GRID */
          filteredWines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredWines.map(wine => {
                const winery = WINERIES.find(w => w.id === wine.wineryId);
                const pricing = getWinePricing(wine.id);
                const isNew = parseInt(wine.id.replace('w', '')) > 45; 

                return (
                    <div 
                        key={wine.id} 
                        onClick={() => setSelectedItem({item: wine, type: 'wine'})}
                        className="bg-white rounded-[2.5rem] overflow-hidden border border-[#e5e1da] shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col h-full"
                    >
                    <div className="relative h-72 overflow-hidden shrink-0">
                        <ImageWithLoader 
                            src={wine.image} 
                            alt={wine.name}
                            className="h-full w-full group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="text-sm font-black text-[#1a1a1a]">{wine.rating.toFixed(1)}</span>
                        </div>

                        {/* New Badge */}
                        {isNew && (
                            <div className="absolute top-6 right-6 bg-[#6b1e2e] text-white px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest">
                                New Arrival
                            </div>
                        )}

                        {/* Sale Badge */}
                        {pricing.isSale && (
                            <div className="absolute top-6 left-24 bg-red-600 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold animate-pulse">
                                {pricing.discount}% OFF
                            </div>
                        )}

                        <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 opacity-90">
                            <WineIcon className="w-3 h-3 text-[#a68d60]" /> {wine.variety}
                        </div>
                        <h3 className="text-2xl font-bold leading-tight mb-1">{wine.name}</h3>
                        <p className="text-sm opacity-80">{winery?.name} • {wine.vintage}</p>
                        </div>
                        
                        <div className="absolute top-16 right-6">
                        <button 
                            onClick={(e) => toggleFavoriteWine(e, wine.id)}
                            className={`p-3 bg-white/90 backdrop-blur rounded-full shadow-lg transition-all active:scale-90 ${favorites.includes(wine.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-300'}`}
                        >
                            <Heart className={`w-5 h-5 ${favorites.includes(wine.id) ? 'fill-current' : ''}`} />
                        </button>
                        </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1">
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{wine.description}"</p>
                        
                        {/* Pairing Preview */}
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="bg-[#f8f4f0] p-2 rounded-lg">
                                <Utensils className="w-4 h-4 text-[#a68d60]" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wine.pairings.slice(0, 2).map(p => (
                                    <span key={p} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p}</span>
                                ))}
                                {wine.pairings.length > 2 && <span className="text-[10px] font-bold text-gray-400">+More</span>}
                            </div>
                        </div>

                        <div className="mt-auto space-y-6">
                            {/* Anecdote Section */}
                            <div className="bg-[#6b1e2e]/5 rounded-2xl p-5 border border-[#6b1e2e]/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Sparkles className="w-12 h-12 text-[#6b1e2e]" />
                                </div>
                                <div className="flex items-center gap-2 mb-2 relative z-10">
                                    <Sparkles className="w-3.5 h-3.5 text-[#6b1e2e]" />
                                    <span className="text-[10px] font-bold text-[#6b1e2e] uppercase tracking-wider">VinoAI Insider Tidbit</span>
                                </div>
                                <p className="text-xs text-[#6b1e2e] font-serif italic font-medium leading-relaxed relative z-10">
                                    "{wine.aiTake}"
                                </p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    {pricing.isSale && (
                                        <span className="text-sm text-gray-400 line-through font-medium decoration-red-400">{pricing.original}</span>
                                    )}
                                    <span className={`text-2xl font-serif font-bold ${pricing.isSale ? 'text-red-700' : 'text-[#1a1a1a]'}`}>
                                        {pricing.display}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => handleAddToCart(e, wine.id)}
                                    className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#6b1e2e] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                                >
                                <ShoppingBag className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
          ) : (
            <div className="py-20 px-4">
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-[#e5e1da] p-12 text-center max-w-2xl mx-auto">
                    <WineIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-serif">No bottles found.</h3>
                    <p className="text-gray-500 mb-8">Try adjusting your filters or search.</p>
                    <button onClick={clearFilters} className="flex items-center gap-2 mx-auto text-gray-400 hover:text-[#6b1e2e] font-bold text-sm transition-colors">
                        <RefreshCcw className="w-4 h-4" /> Reset Filters
                    </button>
                </div>
            </div>
          )
      ) : (
          /* WINERY GRID */
          filteredWineries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredWineries.map(winery => (
                    <div 
                        key={winery.id}
                        onClick={() => setSelectedItem({item: winery, type: 'winery'})}
                        className="bg-white rounded-[2rem] overflow-hidden border border-[#e5e1da] shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row h-full"
                    >
                        <div className="relative md:w-2/5 h-64 md:h-auto shrink-0">
                            <ImageWithLoader src={winery.image} alt={winery.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                {winery.rating}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                {winery.kidFriendly && <div className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur" title="Kid Friendly"><Baby className="w-3 h-3" /></div>}
                                {winery.dogFriendly && <div className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur" title="Dog Friendly"><Dog className="w-3 h-3" /></div>}
                                {winery.hasRestaurant && <div className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur" title="Restaurant On-site"><Utensils className="w-3 h-3" /></div>}
                            </div>
                            <button 
                                onClick={(e) => toggleFavoriteWinery(e, winery.id)}
                                className={`absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg transition-all ${favoriteWineries.includes(winery.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-300'}`}
                            >
                                <Heart className={`w-4 h-4 ${favoriteWineries.includes(winery.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-1">{winery.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a68d60]">
                                        <MapPin className="w-3 h-3" /> {winery.subregion}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 italic">"{winery.description}"</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 bg-[#f8f4f0] rounded-full text-xs font-bold text-gray-500 border border-[#e5e1da]">{winery.style}</span>
                                <span className="px-3 py-1 bg-[#f8f4f0] rounded-full text-xs font-bold text-gray-500 border border-[#e5e1da] flex items-center gap-1"><Ticket className="w-3 h-3" /> ${winery.tastingFee}</span>
                                {winery.bookingRequired ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> Booking Req</span>
                                ) : (
                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Walk-ins OK</span>
                                )}
                            </div>
                            <div className="mt-auto pt-4 border-t border-[#f8f4f0] flex justify-between items-center">
                                {winery.bookingUrl ? (
                                    <button 
                                        onClick={(e) => handleBookClick(e, winery.bookingUrl!)}
                                        className="bg-[#6b1e2e] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#852539] transition-colors shadow-sm hover:shadow-md"
                                    >
                                        Book Now <ExternalLink className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        Established {winery.established}
                                    </div>
                                )}
                                <span className="text-[#6b1e2e] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Guide <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="py-20 px-4">
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-[#e5e1da] p-12 text-center max-w-2xl mx-auto">
                    <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-serif">No estates found.</h3>
                    <p className="text-gray-500 mb-8">Try adjusting your filters or search.</p>
                    <button onClick={clearFilters} className="flex items-center gap-2 mx-auto text-gray-400 hover:text-[#6b1e2e] font-bold text-sm transition-colors">
                        <RefreshCcw className="w-4 h-4" /> Reset Filters
                    </button>
                </div>
            </div>
          )
      )}
    </div>
  );
};

// Quick helper component for icon
const CheckCircle = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);

export default WineLibrary;
