import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin, Clock, Navigation, Share2, Trash2, Plus, Loader2, Search,
  ExternalLink, LocateFixed, Check, ArrowRight, Star, UtensilsCrossed,
} from 'lucide-react';
import { Itinerary, ItineraryStop, Winery, Experience } from '../types';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { calculateDistance } from '../services/geoUtils';
import GuideModal from './GuideModal';
import MapLayer from './MapLayer';
import ImageWithLoader from './ImageWithLoader';
import { SectionHeading, Button, Kicker, Tag } from './ui';

// Plan the perfect run — pick up to six stops and we thread them into the
// shortest sensible loop (greedy nearest-neighbour, refined by taste).

type PlannerItem = (Winery | Experience) & {
  type: 'winery' | 'experience';
  specialty: string;
  style: string;
};

type KindFilter = 'All' | 'Wineries' | 'Experiences';
const KIND_FILTERS: KindFilter[] = ['All', 'Wineries', 'Experiences'];

const ItineraryBuilder: React.FC = () => {
  const { region } = useRegion();
  const { wineries, experiences } = useCatalog();

  const plannerKey = `sommPlannerIds-${region.id}`;
  const itineraryKey = `sommItinerary-${region.id}`;

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(plannerKey) || '[]'); } catch { return []; }
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(() => {
    try {
      const saved = localStorage.getItem(itineraryKey);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [viewingItem, setViewingItem] = useState<{ item: any; type: 'winery' | 'experience' } | null>(null);

  // Start location — the region decides where a run begins by default.
  const [startLocation, setStartLocation] = useState<{ name: string; lat: number; lng: number }>(region.defaultStart);
  const [startInput, setStartInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [notice, setNotice] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const generateBtnRef = useRef<HTMLDivElement>(null);

  // A change of region means a fresh slate: reload that region's saved run.
  useEffect(() => {
    setStartLocation(region.defaultStart);
    setStartInput('');
    try {
      setSelectedIds(JSON.parse(localStorage.getItem(plannerKey) || '[]'));
      const saved = localStorage.getItem(itineraryKey);
      setItinerary(saved ? JSON.parse(saved) : null);
    } catch {
      setSelectedIds([]);
      setItinerary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region.id]);

  // One catalogue of stops: estates and everything around them.
  const allLocations = useMemo<PlannerItem[]>(() => {
    const wineryItems = wineries.map(w => ({ ...w, type: 'winery' as const }));
    const expItems = experiences.map(e => ({
      ...e,
      type: 'experience' as const,
      specialty: e.category,
      style: e.category,
    }));
    return [...wineryItems, ...expItems];
  }, [wineries, experiences]);

  useEffect(() => {
    localStorage.setItem(plannerKey, JSON.stringify(selectedIds));
  }, [selectedIds, plannerKey]);

  useEffect(() => {
    if (itinerary) localStorage.setItem(itineraryKey, JSON.stringify(itinerary));
  }, [itinerary, itineraryKey]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  // Ready-made runs, drawn from the live catalogue.
  const templates = useMemo(() => {
    const topWineries = [...wineries].sort((a, b) => b.rating - a.rating);
    const dining = [...experiences].filter(e => e.category === 'Dining').sort((a, b) => b.rating - a.rating);
    const outdoors = [...experiences]
      .filter(e => e.category === 'Nature' || e.category === 'Adventure')
      .sort((a, b) => b.rating - a.rating);

    const list: { name: string; description: string; ids: string[]; image?: any }[] = [];

    if (topWineries.length >= 3) {
      list.push({
        name: 'The icons',
        description: 'The estates everyone should stand in once.',
        ids: topWineries.slice(0, 3).map(w => w.id),
        image: topWineries[0].image,
      });
    }
    if (topWineries.length >= 2 && dining.length > 0) {
      list.push({
        name: 'The long lunch',
        description: 'Two proper tastings either side of a serious table.',
        ids: [topWineries[0].id, dining[0].id, topWineries[1].id],
        image: dining[0].image,
      });
    }
    if (topWineries.length >= 1 && outdoors.length >= 2) {
      list.push({
        name: 'Beyond the vines',
        description: 'One great cellar door, then out into the landscape.',
        ids: [topWineries[0].id, outdoors[0].id, outdoors[1].id],
        image: outdoors[0].image,
      });
    }
    return list;
  }, [wineries, experiences]);

  const filteredLocations = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return allLocations
      .filter(item => {
        const matchesSearch =
          !searchTerm ||
          item.name.toLowerCase().includes(lowerSearch) ||
          item.specialty.toLowerCase().includes(lowerSearch) ||
          item.subregion.toLowerCase().includes(lowerSearch);
        const matchesKind =
          kindFilter === 'All' ||
          (kindFilter === 'Wineries' && item.type === 'winery') ||
          (kindFilter === 'Experiences' && item.type === 'experience');
        return matchesSearch && matchesKind;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [searchTerm, kindFilter, allLocations]);

  const toggleLocation = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 6) {
        setNotice('Six stops is a full day. Remove one to add another.');
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const applyTemplate = (templateIds: string[]) => {
    setSelectedIds(templateIds);
    setItinerary(null);
    setTimeout(() => {
      generateBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const distToRegion = calculateDistance(latitude, longitude, region.centre.lat, region.centre.lng);
          if (distToRegion > 200) {
            setNotice(`You seem a long way off — we'll start from ${region.defaultStart.name}.`);
            setStartLocation(region.defaultStart);
            setStartInput(region.defaultStart.name);
          } else {
            setStartLocation({ name: 'Current location', lat: latitude, lng: longitude });
            setStartInput('Current location');
          }
          setIsLocating(false);
        },
        () => {
          setNotice('Could not find your location.');
          setIsLocating(false);
        }
      );
    } else {
      setNotice('Your browser does not offer location.');
      setIsLocating(false);
    }
  };

  const handleLocationSearch = () => {
    if (!startInput.trim()) return;
    // Geocoding not wired yet — pin the custom name to the region's default start.
    setStartLocation({ name: startInput, lat: region.defaultStart.lat, lng: region.defaultStart.lng });
  };

  const generateItinerary = () => {
    if (selectedIds.length === 0) return;

    let remaining = allLocations.filter(item => selectedIds.includes(item.id));
    if (remaining.length === 0) {
      setNotice('Those stops could not be found. Clear the selection and start again.');
      return;
    }

    const stops: ItineraryStop[] = [];
    let currentLat = startLocation.lat;
    let currentLng = startLocation.lng;
    let timeMinutes = 10 * 60;

    // Greedy nearest-neighbour with a safety break
    let safetyCounter = 0;
    while (remaining.length > 0) {
      safetyCounter++;
      if (safetyCounter > 20) break;

      let nearestIdx = 0;
      let minDistance = Infinity;

      remaining.forEach((item, i) => {
        const d = calculateDistance(currentLat, currentLng, item.lat, item.lng);
        if (d < minDistance) { minDistance = d; nearestIdx = i; }
      });

      const next = remaining[nearestIdx];
      if (!next) break;

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
        stay = stops.length === 2 && (next as Winery).hasRestaurant ? 90 : 60;
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
        isLunchStop: (stops.length === 2 && (next as Winery).hasRestaurant) || next.specialty === 'Dining',
      });

      timeMinutes += stay;
      currentLat = next.lat;
      currentLng = next.lng;
    }

    setItinerary({
      wineries: stops,
      totalDriveTime: stops.reduce((acc, s) => acc + s.driveTime, 0),
      startLocation: startLocation.name,
      estimatedEnd: `${Math.floor(timeMinutes / 60)}:${(timeMinutes % 60).toString().padStart(2, '0')}`,
    });
  };

  const removeStop = (stopId: string) => {
    if (!itinerary) return;
    setItinerary({ ...itinerary, wineries: itinerary.wineries.filter(w => w.id !== stopId) });
    setSelectedIds(prev => prev.filter(id => id !== stopId));
  };

  const openInGoogleMaps = () => {
    if (!itinerary || itinerary.wineries.length === 0) return;
    const destination = itinerary.wineries[itinerary.wineries.length - 1];
    const waypoints = itinerary.wineries
      .slice(0, itinerary.wineries.length - 1)
      .map(w => `${w.lat},${w.lng}`)
      .join('|');
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${startLocation.lat},${startLocation.lng}&destination=${destination.lat},${destination.lng}&waypoints=${waypoints}&travelmode=driving`,
      '_blank'
    );
  };

  const shareItinerary = async () => {
    if (!itinerary) return;
    const text = `My ${region.name} trail: ${startLocation.name} → ${itinerary.wineries.map(w => w.name).join(' → ')}`;
    if (navigator.share) {
      await navigator.share({ title: `My ${region.name} trail`, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2400);
    }
  };

  const findCatalogueItem = (stop: ItineraryStop) =>
    (stop.type === 'winery'
      ? wineries.find(w => w.id === stop.id)
      : experiences.find(e => e.id === stop.id)) ?? stop;

  return (
    <div className="py-10 flex flex-col lg:flex-row gap-12 animate-fade-in">
      {viewingItem && (
        <GuideModal item={viewingItem.item} type={viewingItem.type} onClose={() => setViewingItem(null)} />
      )}

      {notice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] bg-ink text-parchment font-ui text-xs font-semibold px-5 py-3 rounded-sm animate-slide-up">
          {notice}
        </div>
      )}

      {/* Left: pick the stops */}
      <div className="lg:w-2/5 space-y-8">
        <SectionHeading
          kicker="Step one"
          title="Plan the perfect run"
          standfirst="Pick up to six stops, or let a ready-made run do the choosing."
        />

        {/* Ready-made runs */}
        {selectedIds.length === 0 && templates.length > 0 && (
          <div className="border border-hairline divide-y divide-hairline bg-paper">
            {templates.map(template => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template.ids)}
                className="w-full flex items-center gap-4 p-4 text-left group hover:bg-parchment transition-colors"
              >
                <ImageWithLoader asset={template.image} className="w-16 h-16 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-display text-lg text-ink leading-tight">{template.name}</h5>
                  <p className="font-body text-sm text-ink/50 mt-0.5">{template.description}</p>
                </div>
                <Plus className="w-4 h-4 text-ink/30 group-hover:text-claret transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Counter & clear */}
        {selectedIds.length > 0 && (
          <div className="flex justify-between items-center border border-hairline bg-paper p-3 rounded-sm">
            <div className="font-ui text-sm font-semibold text-claret flex items-center gap-2">
              <Check className="w-4 h-4" /> {selectedIds.length} {selectedIds.length === 1 ? 'stop' : 'stops'} chosen
            </div>
            <button
              onClick={() => { setSelectedIds([]); setItinerary(null); }}
              className="font-ui text-xs font-semibold uppercase tracking-kicker text-ink/40 hover:text-terracotta transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Start location */}
        <div className="bg-paper p-4 border border-hairline rounded-sm">
          <Kicker className="mb-3 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5" /> Setting off from
          </Kicker>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={startInput}
                onChange={e => setStartInput(e.target.value)}
                onBlur={handleLocationSearch}
                onKeyDown={e => e.key === 'Enter' && handleLocationSearch()}
                placeholder={region.defaultStart.name}
                className="w-full bg-parchment border border-hairline rounded-sm py-3 pl-10 pr-4 font-ui text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-claret transition-colors"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
              {isLocating && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claret animate-spin" />
              )}
            </div>
            <button
              onClick={handleCurrentLocation}
              className="p-3 border border-hairline rounded-sm text-claret hover:bg-claret hover:text-parchment hover:border-claret transition-colors"
              aria-label="Use current location"
            >
              <LocateFixed className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search estates and experiences…"
              className="w-full bg-paper border border-hairline rounded-sm py-3 pl-10 pr-4 font-ui text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-claret transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {KIND_FILTERS.map(k => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
                  kindFilter === k
                    ? 'border-claret bg-claret text-parchment'
                    : 'border-hairline bg-paper text-ink/60 hover:border-ink/40'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* The list */}
        <div className="max-h-[520px] overflow-y-auto border border-hairline divide-y divide-hairline bg-paper">
          {filteredLocations.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleLocation(item.id)}
                className={`p-4 cursor-pointer group transition-colors ${
                  isSelected ? 'bg-parchment border-l-2 border-l-claret' : 'hover:bg-parchment'
                }`}
              >
                <div className="flex gap-4">
                  <ImageWithLoader asset={item.image} className="w-16 h-16 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-display text-base text-ink leading-snug truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-ui text-xs font-semibold text-brass flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {item.rating.toFixed(1)}
                        </span>
                        {isSelected ? (
                          <Trash2 className="w-4 h-4 text-terracotta" />
                        ) : (
                          <Plus className="w-4 h-4 text-ink/20 group-hover:text-claret transition-colors" />
                        )}
                      </div>
                    </div>
                    <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                      {item.subregion}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <Tag>{item.type === 'winery' ? item.style : item.specialty}</Tag>
                      <button
                        onClick={e => { e.stopPropagation(); setViewingItem({ item, type: item.type }); }}
                        className="font-ui text-xs font-semibold text-ink/40 hover:text-claret transition-colors"
                      >
                        Details & booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredLocations.length === 0 && (
            <p className="p-8 text-center font-body text-ink/40">Nothing matches. Loosen the net.</p>
          )}
        </div>

        <div className="pt-4 border-t border-hairline" ref={generateBtnRef}>
          <Kicker className="mb-4">Step two — set the route</Kicker>
          <Button
            size="lg"
            className="w-full"
            onClick={generateItinerary}
            disabled={selectedIds.length === 0}
          >
            Thread the route
          </Button>
        </div>
      </div>

      {/* Right: the route */}
      <div className="flex-1">
        {!itinerary ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-paper border border-hairline rounded-sm text-center px-6">
            <MapPin className="w-12 h-12 text-brass/40 mb-4" />
            <h3 className="font-display text-2xl text-ink mb-2">Nothing routed yet</h3>
            <p className="font-body text-ink/50 max-w-sm">
              Pick your stops and the trail will draw itself — shortest sensible loop, lunch where it belongs.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Kicker>Your run</Kicker>
                <h3 className="font-display text-3xl text-ink mt-1">A day in {region.shortName}</h3>
                <p className="font-ui text-[10px] uppercase tracking-kicker text-vine mt-2">Saved to this device</p>
              </div>
              <div className="flex gap-5 font-ui text-xs font-semibold uppercase tracking-kicker text-brass">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Finish {itinerary.estimatedEnd}</span>
                <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4" /> {itinerary.totalDriveTime} min drive</span>
              </div>
            </div>

            <div className="bg-paper border border-hairline rounded-sm h-[400px] relative overflow-hidden">
              <MapLayer
                stops={itinerary.wineries}
                onMarkerClick={stop =>
                  setViewingItem({ item: findCatalogueItem(stop as ItineraryStop), type: (stop.type as any) || 'winery' })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={openInGoogleMaps}>
                <ExternalLink className="w-4 h-4" /> Open in Maps
              </Button>
              <Button variant="secondary" onClick={shareItinerary}>
                {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {shared ? 'Copied' : 'Share the trail'}
              </Button>
            </div>

            <div>
              <Kicker className="mb-6">Step three — book and go</Kicker>
              <div className="space-y-0">
                {itinerary.wineries.map((w, i) => {
                  const catalogueItem = findCatalogueItem(w);
                  return (
                    <div key={w.id} className="relative pl-12 pb-8 last:pb-0">
                      {i < itinerary.wineries.length - 1 && (
                        <div className="absolute left-[15px] top-10 bottom-0 border-l border-hairline" />
                      )}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-claret text-parchment flex items-center justify-center font-ui text-xs font-bold z-10">
                        {i + 1}
                      </div>

                      <div className="bg-paper border border-hairline rounded-sm p-5 flex flex-col sm:flex-row gap-5 group">
                        <div className="relative shrink-0">
                          <ImageWithLoader asset={w.image} className="w-full sm:w-28 h-28" />
                          <button
                            onClick={() => removeStop(w.id)}
                            className="absolute top-2 right-2 p-1.5 bg-paper border border-hairline rounded-sm text-terracotta opacity-0 group-hover:opacity-100 transition-opacity hover:bg-terracotta hover:text-parchment"
                            title="Remove from the run"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {w.type === 'experience' && w.specialty && <Tag>{w.specialty}</Tag>}
                                <h4
                                  className="font-display text-xl text-ink leading-snug cursor-pointer hover:text-claret transition-colors"
                                  onClick={() => setViewingItem({ item: catalogueItem, type: w.type })}
                                >
                                  {w.name}
                                </h4>
                              </div>
                              {w.type === 'winery' && (
                                <p className="font-ui text-[10px] uppercase tracking-kicker text-brass mt-1">{w.specialty}</p>
                              )}
                            </div>
                            <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/50 border border-hairline px-2 py-1 rounded-sm shrink-0">
                              {w.arrival}
                            </span>
                          </div>
                          {(catalogueItem as any).sommNote ? (
                            <p className="font-body text-sm text-ink/60 italic mb-4 line-clamp-2">
                              {(catalogueItem as any).sommNote}
                            </p>
                          ) : (
                            <p className="font-body text-sm text-ink/60 mb-4 line-clamp-2">{w.description}</p>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewingItem({ item: catalogueItem, type: w.type })}
                          >
                            View & book <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {itinerary.wineries.some(w => w.isLunchStop) && (
              <p className="font-body text-sm text-ink/50 flex items-center gap-2 border-t border-hairline pt-5">
                <UtensilsCrossed className="w-4 h-4 text-brass shrink-0" />
                Lunch is built in where the kitchen deserves it.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryBuilder;
