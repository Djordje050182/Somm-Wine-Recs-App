
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MapPin, Thermometer, History, Droplets, Mountain, Sun, CloudRain, Wind, Calendar, Leaf, Map, Star, X } from 'lucide-react';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import MapLayer from './MapLayer';
import { WINERIES } from '../data/wineries';
import { EXPERIENCES } from '../data/experiences';
import GuideModal from './GuideModal';

const HUNTER_DATA = [
  { name: 'Semillon', value: 45 },
  { name: 'Shiraz', value: 30 },
  { name: 'Chardonnay', value: 20 },
  { name: 'Verdelho/Other', value: 5 },
];

const VINTAGE_DATA = [
  { year: '2017', rating: 98, quality: 'Exceptional' },
  { year: '2018', rating: 92, quality: 'Great' },
  { year: '2019', rating: 89, quality: 'Good' },
  { year: '2020', rating: 75, quality: 'Difficult' },
  { year: '2021', rating: 91, quality: 'Very Good' },
  { year: '2022', rating: 88, quality: 'Good' },
  { year: '2023', rating: 94, quality: 'Excellent' },
];

const COLORS = ['#6b1e2e', '#a68d60', '#e5e1da', '#1a1a1a'];

const SUBREGIONS = [
  {
    name: 'Pokolbin',
    desc: 'The heart of the action. Home to the most famous cellar doors, restaurants, and history.',
    icon: <Star className="w-5 h-5" />,
    features: ['Historic Vines', 'Fine Dining', 'Resorts']
  },
  {
    name: 'Broke Fordwich',
    desc: 'The quiet achiever. Sitting against the brokenback range, offering a laid-back, organic vibe.',
    icon: <Mountain className="w-5 h-5" />,
    features: ['Biodynamic', 'Scenic Views', 'Tranquility']
  },
  {
    name: 'Mount View',
    desc: 'Higher altitude, cooler breezes. Known for panoramic lookouts and steeper vineyard sites.',
    icon: <Wind className="w-5 h-5" />,
    features: ['Views', 'Cool Climate', 'Boutique']
  },
  {
    name: 'Lovedale',
    desc: 'Relaxed and spread out. Famous for the Long Lunch event and tree-lined country lanes.',
    icon: <Leaf className="w-5 h-5" />,
    features: ['Long Lunches', 'Family Friendly', 'Open Spaces']
  }
];

const SEASONS = [
  { name: 'Summer', range: 'Dec - Feb', icon: <Sun className="w-6 h-6 text-amber-500" />, desc: 'Harvest time! High energy, warm days, and the smell of fermenting grapes.', temp: '28°C' },
  { name: 'Autumn', range: 'Mar - May', icon: <Leaf className="w-6 h-6 text-orange-500" />, desc: 'Golden vines, misty mornings, and the Jazz Festival. Perfect touring weather.', temp: '22°C' },
  { name: 'Winter', range: 'Jun - Aug', icon: <CloudRain className="w-6 h-6 text-blue-400" />, desc: 'Burning of the canes, fireside reds, and clear crisp blue skies.', temp: '16°C' },
  { name: 'Spring', range: 'Sep - Nov', icon: <Wind className="w-6 h-6 text-green-500" />, desc: 'Budburst. The vineyards turn vibrant green. Great for outdoor concerts.', temp: '24°C' },
];

const RegionExplorer: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState('Hunter Valley');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Interactive Map State
  const [selectedSubregion, setSelectedSubregion] = useState<string | null>(null);
  const [selectedMapItem, setSelectedMapItem] = useState<{item: any, type: 'winery' | 'experience' | 'wine'} | null>(null);

  useEffect(() => {
    getCurrentWeather().then(setWeather);
    
    // Check for mobile to adjust charts
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mapStops = useMemo(() => {
    // Combine Wineries and Experiences
    let items: any[] = [
        ...WINERIES.map(w => ({...w, type: 'winery'})), 
        ...EXPERIENCES.map(e => ({...e, type: 'experience'}))
    ];
    
    if (selectedSubregion) {
        items = items.filter(i => i.subregion === selectedSubregion);
    }
    
    return items.map(item => ({
        id: item.id,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        image: item.image,
        type: item.type,
        // Extras
        arrival: item.rating ? `⭐ ${item.rating}` : undefined
    }));
  }, [selectedSubregion]);

  return (
    <div className="p-4 md:p-10 bg-[#fdfcfb] animate-in fade-in duration-700">
      {/* Guide Modal for Map Clicks */}
      {selectedMapItem && (
        <GuideModal 
            item={selectedMapItem.item} 
            type={selectedMapItem.type as any} 
            onClose={() => setSelectedMapItem(null)} 
        />
      )}

      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* Header Section with Interactive Map */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a68d60] text-[#a68d60] text-xs font-bold uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              New South Wales, Australia
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#6b1e2e] font-serif leading-tight">{activeRegion}</h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-serif italic">
              "A region of contradictions: subtropical heat producing world-class long-lived whites, and medium-bodied savory reds that defy the Australian stereotype."
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white rounded-2xl border border-[#e5e1da] shadow-sm">
                 <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider"><History className="w-4 h-4" /> Established</div>
                 <div className="text-xl md:text-2xl font-bold text-[#1a1a1a]">1828</div>
               </div>
               <div className="p-4 bg-white rounded-2xl border border-[#e5e1da] shadow-sm">
                 <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider"><Thermometer className="w-4 h-4" /> Live Temp</div>
                 <div className="text-xl md:text-2xl font-bold text-[#1a1a1a]">
                   {weather ? `${weather.temp}°C` : 'Loading...'}
                 </div>
               </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="w-full lg:flex-1 h-[400px] md:h-[500px] bg-white rounded-[2rem] border border-[#e5e1da] shadow-xl relative overflow-hidden flex flex-col group">
             {/* Map Controls Overlay */}
             <div className="absolute top-4 left-4 z-[400] flex gap-2">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold shadow-md border border-[#e5e1da] flex items-center gap-2">
                    <Map className="w-3 h-3 text-[#a68d60]" />
                    {selectedSubregion ? selectedSubregion : 'All Regions'}
                </div>
             </div>
             
             {selectedSubregion && (
                 <button 
                    onClick={() => setSelectedSubregion(null)}
                    className="absolute top-4 right-4 z-[400] bg-white/90 text-[#1a1a1a] p-2 rounded-full shadow-md hover:bg-[#6b1e2e] hover:text-white transition-colors border border-[#e5e1da]"
                    title="Clear Selection"
                 >
                    <X className="w-4 h-4" />
                 </button>
             )}

             <MapLayer 
                stops={mapStops} 
                onMarkerClick={(stop) => {
                    const original = stop.type === 'winery' 
                        ? WINERIES.find(w => w.id === stop.id)
                        : EXPERIENCES.find(e => e.id === stop.id);
                    if (original) setSelectedMapItem({item: original, type: stop.type as any});
                }}
             />
             
             {/* Legend */}
             <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-[10px] font-bold shadow-md border border-[#e5e1da] flex flex-col gap-1">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#6b1e2e]"></div> Winery</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]"></div> Experience</div>
             </div>
          </div>
        </div>

        {/* Subregion Guide */}
        <div>
          <h3 className="text-3xl font-bold text-[#6b1e2e] font-serif mb-8 flex items-center gap-3">
            <Map className="w-8 h-8 text-[#a68d60]" /> 
            Lay of the Land
          </h3>
          <p className="text-gray-500 mb-6 -mt-4">Click a region below to filter the map above.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBREGIONS.map((region) => (
              <div 
                key={region.name} 
                onClick={() => setSelectedSubregion(region.name)}
                className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${selectedSubregion === region.name ? 'border-[#6b1e2e] ring-4 ring-[#6b1e2e]/5 shadow-xl scale-[1.02]' : 'border-[#e5e1da] hover:border-[#a68d60] hover:shadow-lg'}`}
              >
                {selectedSubregion === region.name && <div className="absolute top-0 right-0 p-4"><div className="w-2 h-2 bg-[#6b1e2e] rounded-full animate-ping"></div></div>}
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${selectedSubregion === region.name ? 'bg-[#6b1e2e] text-white' : 'bg-[#f8f4f0] text-[#6b1e2e] group-hover:bg-[#6b1e2e] group-hover:text-white'}`}>
                  {region.icon}
                </div>
                <h4 className="text-xl font-bold text-[#1a1a1a] mb-2">{region.name}</h4>
                <p className="text-sm text-gray-500 mb-4 h-16">{region.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {region.features.map(f => (
                    <span key={f} className="text-[10px] font-bold uppercase tracking-wider bg-[#f8f4f0] px-2 py-1 rounded-md text-gray-600">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Statistics */}
        <div>
          <h3 className="text-3xl font-bold text-[#6b1e2e] font-serif mb-8 flex items-center gap-3">
            <Droplets className="w-8 h-8 text-[#a68d60]" /> 
            Vital Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#e5e1da] shadow-sm flex flex-col">
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-6">Varietal Breakdown</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={HUNTER_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 60 : 80}
                      outerRadius={isMobile ? 80 : 100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {HUNTER_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend 
                      verticalAlign={isMobile ? "bottom" : "middle"} 
                      align={isMobile ? "center" : "right"} 
                      layout={isMobile ? "horizontal" : "vertical"} 
                      iconType="circle" 
                      wrapperStyle={isMobile ? { paddingTop: '20px' } : {}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#e5e1da] shadow-sm flex flex-col">
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-6">Vintage Report Card</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={VINTAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b1e2e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6b1e2e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis domain={[60, 100]} hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="rating" stroke="#6b1e2e" fillOpacity={1} fill="url(#colorRating)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 px-2">
                <span>2017 (Legendary)</span>
                <span>2023 (Current Release)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seasonal Planner */}
        <div className="bg-[#1a1a1a] rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <Calendar className="w-8 h-8 text-[#a68d60]" />
              <h3 className="text-3xl font-bold font-serif">Seasonal Planner</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {SEASONS.map((season) => (
                <div key={season.name} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-serif italic text-2xl">{season.name}</span>
                    <span className="text-[#a68d60] font-bold text-sm">{season.temp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                    {season.icon} {season.range}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{season.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6b1e2e] rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        </div>

        {/* Terroir Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-[#6b1e2e] font-serif">The Terroir Profile</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Hunter Valley soils are ancient. Unlike many wine regions, the vines here struggle in nutrient-poor earth, which is exactly why the wines are so intense.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#8B4513] shrink-0 shadow-inner flex items-center justify-center text-white/50 text-xs font-bold">CLAY</div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Red Volcanic Clay</h4>
                  <p className="text-sm text-gray-500">Found on the hills. Produces powerful Shiraz with earthy, leathery notes and structure.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#D2B48C] shrink-0 shadow-inner flex items-center justify-center text-white/50 text-xs font-bold">LOAM</div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Sandy Alluvial Loam</h4>
                  <p className="text-sm text-gray-500">Found on the flats (ancient creek beds). Ideally suited for Semillon, giving it zest and citrus purity.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1597916829826-0a0d1794713c?auto=format&fit=crop&q=80&w=800"
               className="w-full h-full object-cover"
               alt="Soil Texture"
             />
             <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg">
               <div className="text-xs font-bold uppercase tracking-widest text-[#a68d60] mb-1">Did you know?</div>
               <p className="text-sm font-medium text-[#1a1a1a]">Old vines here are often dry-grown (no irrigation), forcing roots deep into the clay.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegionExplorer;
