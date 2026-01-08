
import React, { useState } from 'react';
import { EXPERIENCES } from '../data/experiences';
import { Search, MapPin, Star, Sparkles, Filter, Utensils, Bird, Mountain, ShoppingBag, Flag } from 'lucide-react';
import GuideModal from './GuideModal';

const Experiences: React.FC = () => {
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Dining', 'Adventure', 'Nature', 'Golf', 'Shopping', 'Family'];

  const filteredExperiences = EXPERIENCES.filter(exp => 
    filter === 'All' || exp.category === filter
  );

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Dining': return <Utensils className="w-4 h-4" />;
      case 'Nature': return <Bird className="w-4 h-4" />;
      case 'Adventure': return <Mountain className="w-4 h-4" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'Golf': return <Flag className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {selectedExperience && (
        <GuideModal 
            item={selectedExperience} 
            type="experience" 
            onClose={() => setSelectedExperience(null)} 
        />
      )}

      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-[#6b1e2e] mb-4 font-serif italic">Beyond the Vine</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover the region's best golf courses, fine dining, wildlife encounters, and adventures.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all border ${filter === cat ? 'bg-[#6b1e2e] text-white border-[#6b1e2e] shadow-lg' : 'bg-white text-gray-500 border-[#e5e1da] hover:border-[#6b1e2e]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperiences.map(exp => (
          <div 
            key={exp.id} 
            onClick={() => setSelectedExperience(exp)}
            className="bg-white rounded-[2rem] overflow-hidden border border-[#e5e1da] shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer"
          >
            <div className="relative h-64 overflow-hidden">
              <img src={exp.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={exp.name} />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#6b1e2e] shadow-sm flex items-center gap-2">
                {getCategoryIcon(exp.category)}
                {exp.category}
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-[#1a1a1a]">{exp.name}</h3>
                <div className="flex items-center text-amber-500 shrink-0">
                   <Star className="w-4 h-4 fill-current" />
                   <span className="text-sm font-bold ml-1 text-gray-700">{exp.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                <MapPin className="w-3 h-3" /> {exp.subregion} • {exp.priceRange}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">{exp.description}</p>
              
              <div className="bg-[#a68d60]/10 p-3 rounded-xl border border-[#a68d60]/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-[#a68d60]" />
                  <span className="text-[9px] font-bold text-[#a68d60] uppercase tracking-wider">VinoAI Tip</span>
                </div>
                <p className="text-[11px] text-[#a68d60] font-bold leading-relaxed italic">
                  "{exp.aiTake}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experiences;
