import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Heart, Clock, CalendarCheck, UtensilsCrossed, Baby, PawPrint,
  ChevronDown, ExternalLink, Star, Camera,
} from 'lucide-react';
import { isAIEnabled } from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import { SectionHeading, Kicker, Tag, Button, EmptyState } from './ui';
import ImageWithLoader from './ImageWithLoader';
import GuideModal from './GuideModal';
import { Winery } from '../types';

// The shoppable library — every bottle and estate in the region, set in the
// wine-list idiom. Deep-linkable via ?variety= and ?winery= (id or name).

// Broad taste styles for people who shop by mood rather than grape.
const getTasteStyle = (variety: string): string => {
  const v = variety.toLowerCase();
  if (v.includes('shiraz') || v.includes('cabernet')) return 'Bold red';
  if (v.includes('semillon') || v.includes('verdelho') || v.includes('pinot gris')) return 'Crisp white';
  if (v.includes('chardonnay')) return 'Rich white';
  if (v.includes('rosé') || v.includes('rose')) return 'Fruity rosé';
  if (v.includes('barbera') || v.includes('pinot noir')) return 'Light red';
  return 'Other';
};

const TASTE_STYLES = ['All', 'Crisp white', 'Rich white', 'Bold red', 'Light red', 'Fruity rosé'];
const AMENITIES = ['All', 'Bookable online', 'Restaurant', 'Kid-friendly', 'Dog-friendly', 'Walk-ins welcome'];

type SortKey = 'rating' | 'price_low' | 'price_high' | 'name';

const SAVED_WINES_KEY = 'sommFavWines';
const SAVED_WINERIES_KEY = 'sommFavWineries';

const readSaved = (key: string): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const FilterPill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm whitespace-nowrap shrink-0 transition-colors ${
      active ? 'border-claret bg-claret text-parchment' : 'border-hairline bg-paper text-ink/60 hover:border-ink/40'
    }`}
  >
    {children}
  </button>
);

const WineLibrary: React.FC = () => {
  const { region } = useRegion();
  const navigate = useNavigate();
  const { wines, wineries, getWinery, getPricing } = useCatalog();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'wines' | 'wineries'>('wines');
  const [search, setSearch] = useState('');

  // Bottle filters
  const [varietyFilter, setVarietyFilter] = useState('All');
  const [tasteFilter, setTasteFilter] = useState('All');
  const [wineryFilter, setWineryFilter] = useState('All'); // winery id or 'All'
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  // Estate filters
  const [subregionFilter, setSubregionFilter] = useState('All');
  const [amenityFilter, setAmenityFilter] = useState('All');

  // Saved (hearts) — shared with the Cellar's Saved tab
  const [savedWines, setSavedWines] = useState<string[]>(() => readSaved(SAVED_WINES_KEY));
  const [savedWineries, setSavedWineries] = useState<string[]>(() => readSaved(SAVED_WINERIES_KEY));

  const [selectedWinery, setSelectedWinery] = useState<Winery | null>(null);

  const varieties = useMemo(() => ['All', ...new Set(wines.map(w => w.variety).sort())], [wines]);
  const wineryOptions = useMemo(() => [...wineries].sort((a, b) => a.name.localeCompare(b.name)), [wineries]);

  // Deep links: /wines?variety=Semillon or /wines?winery=hv-tyrrells
  useEffect(() => {
    const varietyParam = searchParams.get('variety');
    const wineryParam = searchParams.get('winery');
    if (!varietyParam && !wineryParam) return;

    if (varietyParam) {
      const match = varieties.find(v => v !== 'All' && v.toLowerCase() === varietyParam.toLowerCase());
      if (match) {
        setViewMode('wines');
        setVarietyFilter(match);
        setTasteFilter('All');
      }
    }
    if (wineryParam) {
      const match = wineries.find(
        w => w.id === wineryParam || w.name.toLowerCase() === wineryParam.toLowerCase()
      );
      if (match) {
        setViewMode('wines');
        setWineryFilter(match.id);
      }
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, varieties, wineries]);

  // --- Bottle filtering -----------------------------------------------------
  const filteredWines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wines
      .filter(w => {
        const wineryName = getWinery(w.wineryId)?.name || '';
        if (
          q &&
          !w.name.toLowerCase().includes(q) &&
          !wineryName.toLowerCase().includes(q) &&
          !w.variety.toLowerCase().includes(q)
        )
          return false;
        if (varietyFilter !== 'All' && w.variety !== varietyFilter) return false;
        if (tasteFilter !== 'All' && getTasteStyle(w.variety) !== tasteFilter) return false;
        if (wineryFilter !== 'All' && w.wineryId !== wineryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return b.rating - a.rating;
        const priceA = getPricing(a.id).price;
        const priceB = getPricing(b.id).price;
        return sortBy === 'price_low' ? priceA - priceB : priceB - priceA;
      });
  }, [wines, search, varietyFilter, tasteFilter, wineryFilter, sortBy, getWinery, getPricing]);

  // --- Estate filtering -----------------------------------------------------
  const filteredWineries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wineries
      .filter(w => {
        if (q && !w.name.toLowerCase().includes(q) && !w.specialty.toLowerCase().includes(q)) return false;
        if (subregionFilter !== 'All' && w.subregion !== subregionFilter) return false;
        if (amenityFilter === 'Restaurant' && !w.hasRestaurant) return false;
        if (amenityFilter === 'Kid-friendly' && !w.kidFriendly) return false;
        if (amenityFilter === 'Dog-friendly' && !w.dogFriendly) return false;
        if (amenityFilter === 'Walk-ins welcome' && w.bookingRequired) return false;
        if (amenityFilter === 'Bookable online' && !w.bookingUrl) return false;
        return true;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [wineries, search, subregionFilter, amenityFilter]);

  const toggleSavedWine = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedWines.includes(id) ? savedWines.filter(x => x !== id) : [...savedWines, id];
    setSavedWines(updated);
    localStorage.setItem(SAVED_WINES_KEY, JSON.stringify(updated));
  };

  const toggleSavedWinery = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedWineries.includes(id) ? savedWineries.filter(x => x !== id) : [...savedWineries, id];
    setSavedWineries(updated);
    localStorage.setItem(SAVED_WINERIES_KEY, JSON.stringify(updated));
  };

  const clearFilters = () => {
    setSearch('');
    setVarietyFilter('All');
    setTasteFilter('All');
    setWineryFilter('All');
    setSubregionFilter('All');
    setAmenityFilter('All');
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {selectedWinery && (
        <GuideModal item={selectedWinery} type="winery" onClose={() => setSelectedWinery(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <SectionHeading
          kicker={viewMode === 'wines' ? `${wines.length} bottles in the library` : `${wineries.length} estates pouring`}
          title={viewMode === 'wines' ? 'The wine list' : 'The estates'}
          standfirst={
            viewMode === 'wines'
              ? `Every bottle here earns its place on the list. Filter by grape, style or estate, and build your case from ${region.shortName}.`
              : 'The cellar doors behind the bottles — who pours what, when the doors open, and where the dog can come too.'
          }
        />

        {/* View toggle + scanner shortcut (the scanner appears once the AI proxy is live) */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          {isAIEnabled() && (
            <button
              onClick={() => navigate(`/${region.id}/sommelier?scan=1`)}
              className="flex items-center gap-2 border border-hairline bg-paper font-ui text-xs font-semibold uppercase tracking-kicker text-ink/60 px-4 py-2.5 rounded-sm hover:border-claret hover:text-claret transition-colors"
              aria-label="Scan a label"
            >
              <Camera className="w-3.5 h-3.5" /> Scan a label
            </button>
          )}
        <div className="flex border border-hairline rounded-sm">
          {(['wines', 'wineries'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`font-ui text-xs font-semibold uppercase tracking-kicker px-5 py-2.5 transition-colors ${
                viewMode === mode ? 'bg-ink text-parchment' : 'bg-paper text-ink/60 hover:text-ink'
              }`}
            >
              {mode === 'wines' ? 'Bottles' : 'Estates'}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Search and sort */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={viewMode === 'wines' ? 'Search bottles, grapes or estates…' : 'Search estates…'}
            className="w-full bg-paper border border-hairline rounded-sm py-3 pl-10 pr-4 font-ui text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40"
          />
        </div>
        {viewMode === 'wines' && (
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              aria-label="Sort bottles"
              className="appearance-none w-full sm:w-auto bg-paper border border-hairline rounded-sm py-3 pl-4 pr-10 font-ui text-xs font-semibold uppercase tracking-kicker text-ink cursor-pointer focus:outline-none focus:border-ink/40"
            >
              <option value="rating">Top rated</option>
              <option value="price_low">Price, low to high</option>
              <option value="price_high">Price, high to low</option>
              <option value="name">Alphabetical</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-4">
        {viewMode === 'wines' ? (
          <>
            <div>
              <Kicker className="mb-2">By grape</Kicker>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {varieties.map(v => (
                  <FilterPill
                    key={v}
                    active={varietyFilter === v}
                    onClick={() => {
                      setVarietyFilter(v);
                      setTasteFilter('All');
                    }}
                  >
                    {v === 'All' ? 'All grapes' : v}
                  </FilterPill>
                ))}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Kicker className="mb-2">By style</Kicker>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {TASTE_STYLES.map(style => (
                    <FilterPill
                      key={style}
                      active={tasteFilter === style}
                      onClick={() => {
                        setTasteFilter(style);
                        setVarietyFilter('All');
                      }}
                    >
                      {style === 'All' ? 'All styles' : style}
                    </FilterPill>
                  ))}
                </div>
              </div>
              <div className="lg:w-72">
                <Kicker className="mb-2">By estate</Kicker>
                <div className="relative">
                  <select
                    value={wineryFilter}
                    onChange={e => setWineryFilter(e.target.value)}
                    aria-label="Filter by estate"
                    className="appearance-none w-full bg-paper border border-hairline rounded-sm py-2.5 pl-3 pr-9 font-ui text-sm text-ink cursor-pointer focus:outline-none focus:border-ink/40"
                  >
                    <option value="All">All estates</option>
                    {wineryOptions.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <Kicker className="mb-2">Corner of the valley</Kicker>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <FilterPill active={subregionFilter === 'All'} onClick={() => setSubregionFilter('All')}>
                  All
                </FilterPill>
                {region.subregions.map(s => (
                  <FilterPill
                    key={s.id}
                    active={subregionFilter === s.name}
                    onClick={() => setSubregionFilter(s.name)}
                  >
                    {s.name}
                  </FilterPill>
                ))}
              </div>
            </div>
            <div>
              <Kicker className="mb-2">The practicalities</Kicker>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {AMENITIES.map(a => (
                  <FilterPill key={a} active={amenityFilter === a} onClick={() => setAmenityFilter(a)}>
                    {a}
                  </FilterPill>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Bottles: the wine list ------------------------------------------ */}
      {viewMode === 'wines' &&
        (filteredWines.length === 0 ? (
          <EmptyState
            title="Nothing on the list matches"
            body="Loosen a filter or two — the valley is more generous than that."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="mt-10 border border-hairline bg-paper">
            {filteredWines.map((wine, i) => {
              const winery = getWinery(wine.wineryId);
              const pricing = getPricing(wine.id);
              const saved = savedWines.includes(wine.id);
              return (
                <article
                  key={wine.id}
                  className={`flex gap-4 sm:gap-6 p-4 sm:p-6 ${i > 0 ? 'border-t border-hairline' : ''}`}
                >
                  <div className="w-20 sm:w-28 shrink-0">
                    <ImageWithLoader asset={wine.image} className="w-full aspect-[3/4] rounded-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Kicker>
                          {wine.variety}
                          {pricing.isSale && (
                            <span className="text-terracotta ml-2">Cellar door offer</span>
                          )}
                        </Kicker>
                        <h3 className="font-display text-xl sm:text-2xl text-ink leading-snug mt-1">
                          {wine.name}
                        </h3>
                        <p className="font-ui text-xs text-ink/50 mt-1">
                          {winery?.name} · {wine.vintage} · {wine.rating.toFixed(1)}
                        </p>
                        {wine.community && (
                          <p className="font-ui text-[11px] text-ink/45 mt-1 flex items-center gap-1">
                            <Star className="w-3 h-3 text-brass fill-current" />
                            {wine.community.score.toFixed(1)} on {wine.community.source}
                            <span className="text-ink/30">· {wine.community.count.toLocaleString()} ratings</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={e => toggleSavedWine(e, wine.id)}
                        aria-label={saved ? 'Remove from saved' : 'Save this bottle'}
                        className={`shrink-0 mt-1 transition-colors ${
                          saved ? 'text-claret' : 'text-ink/25 hover:text-claret'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <p className="font-body text-sm text-ink/60 leading-relaxed mt-3 line-clamp-2">
                      {wine.description}
                    </p>

                    {wine.sommNote && (
                      <p className="font-body text-sm italic text-ink/70 mt-2 line-clamp-2">
                        <span className="font-ui not-italic text-[10px] font-semibold uppercase tracking-kicker text-brass mr-2">
                          The Somm's note
                        </span>
                        {wine.sommNote}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mt-4 pt-3 border-t border-hairline">
                      <div className="font-ui text-[10px] uppercase tracking-kicker text-ink/40">
                        {wine.drinkFrom && wine.drinkTo
                          ? `Drink ${wine.drinkFrom}–${wine.drinkTo}`
                          : wine.drinkFrom
                          ? `Drink from ${wine.drinkFrom}`
                          : wine.pairings[0]
                          ? `Pairs with ${wine.pairings[0].toLowerCase()}`
                          : ''}
                      </div>
                      <div className="flex items-center gap-4">
                        {pricing.isSale && (
                          <Tag tone="sale">{pricing.discount}% off</Tag>
                        )}
                        <div className="text-right leading-none">
                          {pricing.isSale && (
                            <span className="block font-ui text-xs text-ink/40 line-through mb-1">
                              {pricing.original}
                            </span>
                          )}
                          <span className="font-display text-xl font-medium text-brass">
                            {pricing.display}
                          </span>
                        </div>
                        <Button size="sm" onClick={() => addToCart(wine.id)}>
                          Add to case
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ))}

      {/* --- Estates ---------------------------------------------------------- */}
      {viewMode === 'wineries' &&
        (filteredWineries.length === 0 ? (
          <EmptyState
            title="No estates match"
            body="Loosen a filter or two — the valley is more generous than that."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
            {filteredWineries.map(w => {
              const saved = savedWineries.includes(w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWinery(w)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedWinery(w)}
                  className="bg-paper text-left group flex flex-col cursor-pointer hover:bg-parchment transition-colors"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <ImageWithLoader
                      asset={w.image}
                      className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <button
                      onClick={e => toggleSavedWinery(e, w.id)}
                      aria-label={saved ? 'Remove from saved' : 'Save this estate'}
                      className={`absolute top-3 right-3 p-1.5 bg-paper border border-hairline rounded-sm transition-colors ${
                        saved ? 'text-claret' : 'text-ink/30 hover:text-claret'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl text-ink leading-snug">{w.name}</h3>
                      <span className="font-ui text-xs font-semibold text-brass shrink-0">
                        {w.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                      {w.subregion} · est. {w.established}
                    </p>
                    <p className="font-body text-sm text-ink/60 mt-3 leading-relaxed line-clamp-2">
                      {w.description}
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-hairline text-ink/40">
                      <span className="font-ui text-[10px] uppercase tracking-kicker truncate">
                        {w.specialty}
                      </span>
                      <span className="flex-1" />
                      {w.bookingRequired && <CalendarCheck className="w-3.5 h-3.5" aria-label="Booking required" />}
                      {w.hasRestaurant && <UtensilsCrossed className="w-3.5 h-3.5" aria-label="Restaurant" />}
                      {w.kidFriendly && <Baby className="w-3.5 h-3.5" aria-label="Kid-friendly" />}
                      {w.dogFriendly && <PawPrint className="w-3.5 h-3.5" aria-label="Dog-friendly" />}
                      <span className="font-ui text-[10px] flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {w.opens}–{w.closes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        {w.tastingFee === 0 && <Tag tone="success">Free tasting</Tag>}
                        {!w.bookingRequired && <Tag>Walk-ins welcome</Tag>}
                      </div>
                      {w.bookingUrl && (
                        <a
                          href={w.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-claret hover:text-claret-deep inline-flex items-center gap-1"
                        >
                          Book a tasting <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default WineLibrary;
