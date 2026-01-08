
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Wine, Sparkles, ChevronRight, Building2, Utensils, Mountain } from 'lucide-react';
import { WINERIES, WINES } from '../data/wineries';
import { EXPERIENCES } from '../data/experiences';
import GuideModal from './GuideModal';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string, items: any[] }[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ item: any, type: 'winery' | 'wine' | 'experience' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Search Wineries
    const matchedWineries = WINERIES.filter(w => 
      w.name.toLowerCase().includes(lowerQuery) || 
      w.subregion.toLowerCase().includes(lowerQuery) ||
      w.specialty.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    // Search Wines
    const matchedWines = WINES.filter(w => 
      w.name.toLowerCase().includes(lowerQuery) ||
      w.variety.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    // Search Experiences
    const matchedExperiences = EXPERIENCES.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) ||
      e.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    const newResults = [];
    if (matchedWineries.length > 0) newResults.push({ type: 'Wineries', items: matchedWineries });
    if (matchedWines.length > 0) newResults.push({ type: 'Wines', items: matchedWines });
    if (matchedExperiences.length > 0) newResults.push({ type: 'Experiences', items: matchedExperiences });

    setResults(newResults);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: any, type: string) => {
     let itemType: 'winery' | 'wine' | 'experience' = 'winery';
     if (type === 'Wines') itemType = 'wine';
     if (type === 'Experiences') itemType = 'experience';
     
     setSelectedItem({ item, type: itemType });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 sm:pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {selectedItem && (
        <div className="relative z-[110]">
             <GuideModal 
                item={selectedItem.item} 
                type={selectedItem.type} 
                onClose={() => setSelectedItem(null)} 
             />
             {/* Hack to keep the underlying search visible but allow modal interaction */}
             <div className="hidden"></div> 
        </div>
      )}

      <div className="relative w-full max-w-2xl bg-[#fdfcfb] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Search Bar */}
        <div className="flex items-center gap-4 p-4 border-b border-[#e5e1da]">
          <Search className="w-6 h-6 text-[#a68d60]" />
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wineries, wines, or experiences..."
            className="flex-1 bg-transparent text-xl font-medium text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none"
          />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-2">
          {results.length === 0 && query.trim() && (
            <div className="p-12 text-center text-gray-400">
               <p>No results found for "{query}"</p>
            </div>
          )}

          {results.length === 0 && !query.trim() && (
             <div className="p-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</h4>
                <div className="flex gap-2 flex-wrap">
                   {['Shiraz', 'Semillon', 'Tyrrells', 'Brokenwood', 'Fine Dining'].map(tag => (
                       <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 bg-gray-50 rounded-full text-sm font-bold text-gray-600 hover:bg-[#6b1e2e] hover:text-white transition-colors">
                          {tag}
                       </button>
                   ))}
                </div>
             </div>
          )}

          {results.map((group) => (
            <div key={group.type} className="mb-4">
              <h4 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-[#fdfcfb]">{group.type}</h4>
              <div className="space-y-1">
                {group.items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item, group.type)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                       <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-[#1a1a1a] group-hover:text-[#6b1e2e]">{item.name}</h5>
                      <p className="text-xs text-gray-500">
                        {group.type === 'Wines' ? item.variety : item.subregion || item.category}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b1e2e]" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center border-t border-[#e5e1da]">
            Press ESC to close
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
