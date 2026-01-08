
import React, { useState, useEffect } from 'react';
import { WINERIES, WINES } from '../data/wineries';
import { Winery, WineDetail } from '../types';
import { Heart, Wine as WineIcon, MapPin, Star, Trash2, Sparkles, GlassWater, AlertCircle, CloudOff } from 'lucide-react';

interface FavoritesProps {
  user?: { name: string; email: string; tier?: string } | null;
}

const Favorites: React.FC<FavoritesProps> = ({ user }) => {
  const [favoriteWineries, setFavoriteWineries] = useState<number[]>([]);
  const [favoriteWines, setFavoriteWines] = useState<string[]>([]);

  // Function to load favorites from localStorage
  const loadFavorites = () => {
    const savedWineries = JSON.parse(localStorage.getItem('favWineries') || '[]');
    const savedWines = JSON.parse(localStorage.getItem('favWines') || '[]');
    setFavoriteWineries(savedWineries);
    setFavoriteWines(savedWines);
  };

  useEffect(() => {
    loadFavorites();

    // Listen for cross-component updates (e.g., from Chat)
    const handleStorageUpdate = () => loadFavorites();
    window.addEventListener('somm-storage-update', handleStorageUpdate);

    return () => {
      window.removeEventListener('somm-storage-update', handleStorageUpdate);
    };
  }, []);

  const removeWinery = (id: number) => {
    const updated = favoriteWineries.filter(wId => wId !== id);
    setFavoriteWineries(updated);
    localStorage.setItem('favWineries', JSON.stringify(updated));
  };

  const removeWine = (id: string) => {
    const updated = favoriteWines.filter(wId => wId !== id);
    setFavoriteWines(updated);
    localStorage.setItem('favWines', JSON.stringify(updated));
  };

  const savedWineryData = WINERIES.filter(w => favoriteWineries.includes(w.id));
  const savedWineData = WINES.filter(w => favoriteWines.includes(w.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      
      {/* Guest Mode Warning */}
      {!user && (
         <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-amber-100 p-2 rounded-full text-amber-700">
                  <CloudOff className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-amber-900">Guest Mode Active</h4>
                  <p className="text-xs text-amber-700">Your cellar is saved to this device only. Sign in to sync across devices.</p>
               </div>
            </div>
         </div>
      )}

      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-[#6b1e2e] mb-4 font-serif italic">
          {user ? `${user.name.split(' ')[0]}'s Cellar` : 'Your Personal Cellar'}
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">A curated collection of your most loved Hunter Valley estates and exceptional vintage finds.</p>
      </div>

      <div className="space-y-20">
        {/* Saved Wineries Section */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-[#e5e1da] pb-4">
            <MapPin className="w-6 h-6 text-[#a68d60]" />
            <h3 className="text-2xl font-bold text-[#6b1e2e] font-serif">Saved Wineries</h3>
            <span className="bg-[#6b1e2e]/10 text-[#6b1e2e] px-3 py-1 rounded-full text-xs font-bold">{savedWineryData.length}</span>
          </div>

          {savedWineryData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedWineryData.map(winery => (
                <div key={winery.id} className="bg-white rounded-3xl overflow-hidden border border-[#e5e1da] shadow-sm hover:shadow-lg transition-all relative group">
                  <img src={winery.image} className="w-full h-48 object-cover brightness-95 group-hover:brightness-100 transition-all" alt={winery.name} />
                  <button 
                    onClick={() => removeWinery(winery.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-[#1a1a1a]">{winery.name}</h4>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold ml-1 text-gray-700">{winery.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#a68d60] font-bold uppercase tracking-widest mb-4">{winery.subregion} • {winery.style}</p>
                    <p className="text-sm text-gray-500 line-clamp-2 italic mb-6">"{winery.aiTake}"</p>
                    <button className="w-full py-2.5 bg-[#f8f4f0] text-[#6b1e2e] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#6b1e2e] hover:text-white transition-all">View Estate</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-[#e5e1da] text-center">
              <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">You haven't saved any wineries yet.</p>
              <p className="text-xs text-gray-300 mt-1">Explore the Planner to find your favorite estates.</p>
            </div>
          )}
        </section>

        {/* Saved Wines Section */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-[#e5e1da] pb-4">
            <GlassWater className="w-6 h-6 text-[#a68d60]" />
            <h3 className="text-2xl font-bold text-[#6b1e2e] font-serif">Exceptional Bottles</h3>
            <span className="bg-[#a68d60]/10 text-[#a68d60] px-3 py-1 rounded-full text-xs font-bold">{savedWineData.length}</span>
          </div>

          {savedWineData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedWineData.map(wine => (
                <div key={wine.id} className="bg-white rounded-3xl overflow-hidden border border-[#e5e1da] shadow-sm hover:shadow-lg transition-all relative group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={wine.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={wine.name} />
                    <div className="absolute inset-0 bg-black/20" />
                    <button 
                      onClick={() => removeWine(wine.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-bold text-lg leading-tight">{wine.name}</h4>
                      <p className="text-white/80 text-xs font-medium">{wine.vintage} Vintage</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-[#6b1e2e]/5 p-3 rounded-xl border border-[#6b1e2e]/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-[#6b1e2e]" />
                        <span className="text-[9px] font-bold text-[#6b1e2e] uppercase tracking-wider">The Take</span>
                      </div>
                      <p className="text-[10px] text-[#6b1e2e] font-serif italic leading-relaxed">"{wine.aiTake}"</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-400 uppercase tracking-widest">{WINERIES.find(w => w.id === wine.wineryId)?.name}</span>
                      <span className="text-[#6b1e2e]">{wine.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-[#e5e1da] text-center">
              <WineIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Your cellar is currently empty.</p>
              <p className="text-xs text-gray-300 mt-1">Visit The Wines to browse legendary bottles.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Favorites;
