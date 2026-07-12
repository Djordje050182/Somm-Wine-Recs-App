import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  X, Loader2, Wine, MapPin, Phone, Globe, CalendarCheck, Clock, Star, Users,
  ArrowRight, Utensils, Image as ImageIcon, ExternalLink, ChevronLeft, ShoppingBag,
  Copy, Check, Baby, Dog, Heart, MessageCircleQuestion, Lightbulb, Grape,
} from 'lucide-react';
import {
  generateInsiderGuide, getVintageReport, getFoodPairings, isAIEnabled,
} from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import { ImageAsset } from '../types';
import ImageWithLoader, { optimised } from './ImageWithLoader';
import { buildBookingHandoff, calendarHold, nextDays, BookingHandoff } from '../services/booking';
import { hasTasted, recordTasting, removeTasting } from '../services/tasteProfile';
import { Kicker, Button, Tag } from './ui';

interface GuideModalProps {
  item: any; // Winery, WineDetail or Experience
  type: 'winery' | 'wine' | 'experience';
  onClose: () => void;
}

// stop.image on legacy callers may still be a bare URL — normalise to ImageAsset.
const toAsset = (image: ImageAsset | string | undefined, alt: string): ImageAsset =>
  typeof image === 'string'
    ? { url: image, source: 'winery', alt }
    : image ?? { url: '', source: 'winery', alt };

// Open/closed is judged on the REGION's clock, not the viewer's — a guest in
// Sydney reading about a Perth-time cellar door is three hours in the future.
const getClosingStatus = (
  opens?: string,
  closes?: string,
  timeZone?: string
): { label: string; tone: 'success' | 'sale' | 'default' } | null => {
  if (!closes) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(new Date());
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? NaN);
    const nowMinutes = (get('hour') % 24) * 60 + get('minute');
    if (Number.isNaN(nowMinutes)) return null;
    const [closeHour, closeMinute] = closes.split(':').map(Number);
    const closeAt = closeHour * 60 + closeMinute;
    if (opens) {
      const [openHour, openMinute] = opens.split(':').map(Number);
      const openAt = openHour * 60 + openMinute;
      if (nowMinutes < openAt) return { label: `Opens at ${opens}`, tone: 'default' };
    }
    const diff = closeAt - nowMinutes;
    if (diff < 0) return { label: 'Closed for the day', tone: 'default' };
    if (diff <= 60) return { label: `Closing soon (${diff}m)`, tone: 'sale' };
    return { label: 'Open now', tone: 'success' };
  } catch {
    return null;
  }
};

const getBookingLabel = (url?: string | null): string => {
  if (!url) return 'Request a visit';
  const u = url.toLowerCase();
  if (u.includes('exploretock.com')) return 'Reserve on Tock';
  if (u.includes('opentable')) return 'Book on OpenTable';
  if (u.includes('rezdy')) return 'Book via Rezdy';
  if (u.includes('sevenrooms')) return 'Reserve via SevenRooms';
  if (u.includes('obee')) return 'Book on Obee';
  if (u.includes('thefork')) return 'Book on TheFork';
  return 'Book online';
};

// Favourites — string[] of slug ids, one key per kind.
const FAV_KEYS: Record<string, string> = { winery: 'sommFavWineries', wine: 'sommFavWines' };

const readFavs = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const GuideModal: React.FC<GuideModalProps> = ({ item: initialItem, type: initialType, onClose }) => {
  const { region } = useRegion();
  const { getWinery, getPricing, winesForWinery } = useCatalog();
  const { addToCart } = useCart();

  const [currentItem, setCurrentItem] = useState(initialItem);
  const [currentType, setCurrentType] = useState(initialType);
  const [history, setHistory] = useState<{ item: any; type: 'winery' | 'wine' | 'experience' }[]>([]);

  const [insiderInfo, setInsiderInfo] = useState<{ icebreaker: string; proMove: string; hiddenGem: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guide' | 'visitors'>('guide');
  const [currentImage, setCurrentImage] = useState<ImageAsset | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // On-demand Somm extras
  const [vintageReport, setVintageReport] = useState<string | null>(null);
  const [loadingVintage, setLoadingVintage] = useState(false);
  const [extraPairings, setExtraPairings] = useState<Array<{ food: string; reason: string }> | null>(null);
  const [loadingPairings, setLoadingPairings] = useState(false);

  // Booking sheet
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState(() => nextDays(1)[0].iso);
  const [bookingParty, setBookingParty] = useState(2);
  const [handoff, setHandoff] = useState<BookingHandoff | null>(null);

  const closeBooking = () => {
    setShowBooking(false); setBookingStep(1); setSelectedTime(null); setHandoff(null);
  };

  // Hourly tasting slots inside the venue's own hours.
  const bookingSlots = useMemo(() => {
    const opens = currentItem?.opens ?? '10:00';
    const closes = currentItem?.closes ?? '17:00';
    const [oh] = opens.split(':').map(Number);
    const [ch] = closes.split(':').map(Number);
    const slots: string[] = [];
    for (let h = oh; h < ch && slots.length < 8; h++) slots.push(`${String(h).padStart(2, '0')}:00`);
    return slots.slice(0, 6);
  }, [currentItem]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [tastedTick, setTastedTick] = useState(0); // re-render after tasting-book writes

  // Swipe-down to dismiss on phones: the sheet follows the finger when the
  // content is scrolled to the top, and lets go past the threshold.
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const touchStartY = React.useRef<number | null>(null);
  const [sheetOffset, setSheetOffset] = useState(0);

  const onSheetTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return;
    if ((sheetRef.current?.scrollTop ?? 0) <= 0) touchStartY.current = e.touches[0].clientY;
    else touchStartY.current = null;
  };
  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setSheetOffset(dy);
  };
  const onSheetTouchEnd = () => {
    if (touchStartY.current === null) return;
    if (sheetOffset > 120) onClose();
    setSheetOffset(0);
    touchStartY.current = null;
  };

  const aiEnabled = isAIEnabled();

  const closingStatus = useMemo(
    () => getClosingStatus(currentItem?.opens, currentItem?.closes, region.timezone),
    [currentItem, region.timezone]
  );
  const bookingLabel = useMemo(() => getBookingLabel(currentItem?.bookingUrl), [currentItem]);
  const heroAsset = useMemo(
    () => currentImage ?? toAsset(currentItem?.image, currentItem?.name ?? ''),
    [currentImage, currentItem]
  );
  const gallery: ImageAsset[] = useMemo(
    () => (currentItem?.gallery ?? []).map((g: ImageAsset | string) => toAsset(g, currentItem?.name ?? '')),
    [currentItem]
  );

  // Everything the lightbox can page through: the hero first, then the gallery.
  const lightboxImages: ImageAsset[] = useMemo(
    () => [toAsset(currentItem?.image, currentItem?.name ?? ''), ...gallery].filter(a => a.url),
    [currentItem, gallery]
  );

  const stepLightbox = React.useCallback(
    (dir: 1 | -1) => {
      setLightboxIdx(idx =>
        idx === null ? null : (idx + dir + lightboxImages.length) % lightboxImages.length
      );
    },
    [lightboxImages.length]
  );

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setLightboxIdx(null); }
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [lightboxIdx, stepLightbox]);
  const pricing = useMemo(
    () => (currentType === 'wine' && currentItem ? getPricing(currentItem.id) : null),
    [currentType, currentItem, getPricing]
  );
  const parentWinery = useMemo(
    () => (currentType === 'wine' && currentItem?.wineryId ? getWinery(currentItem.wineryId) : undefined),
    [currentType, currentItem, getWinery]
  );

  useEffect(() => {
    setCurrentItem(initialItem);
    setCurrentType(initialType);
    setHistory([]);
  }, [initialItem, initialType]);

  useEffect(() => {
    setCurrentImage(null);
    setActiveTab('guide');
    setVintageReport(null);
    setExtraPairings(null);
    const key = FAV_KEYS[currentType];
    setIsFavourite(key ? readFavs(key).includes(currentItem?.id) : false);
  }, [currentItem, currentType]);

  useEffect(() => {
    const loadGuide = async () => {
      if (!currentItem) return;
      // Every estate carries its own hand-written briefing in the data —
      // the AI path only serves items that lack one.
      if (currentItem.briefing) {
        setInsiderInfo(currentItem.briefing);
        setLoading(false);
        return;
      }

      setLoading(true);
      setInsiderInfo(null);
      try {
        const details =
          currentItem.description +
          (currentItem.specialty ? ` Known for ${currentItem.specialty}.` : '') +
          (currentItem.category ? ` Category: ${currentItem.category}.` : '');
        const parsed = await generateInsiderGuide(region, currentItem.name, currentType, details);
        setInsiderInfo(parsed);
      } catch {
        setInsiderInfo({
          icebreaker: 'Ask what they were doing at six this morning — in the valley, the answer is always a good story.',
          proMove: 'Come mid-week. The pours are longer and the conversation better.',
          hiddenGem: currentItem.sommNote || 'This spot has more history than it lets on. Ask.',
        });
      } finally {
        setLoading(false);
      }
    };
    loadGuide();
  }, [currentItem, currentType, region]);

  // The visitors' word, from real numbers: the venue's rating plus the crowd
  // verdict — Vivino for an estate's wines, Google for an experience. Nothing invented.
  const visitorsWord = useMemo(() => {
    if (currentType === 'winery') {
      const estateWines = winesForWinery(currentItem.id);
      const rated = estateWines.filter((w: any) => w.community);
      const totalCount = rated.reduce((acc: number, w: any) => acc + w.community.count, 0);
      const avg = rated.length
        ? rated.reduce((acc: number, w: any) => acc + w.community.score * w.community.count, 0) / totalCount
        : null;
      return {
        kind: 'winery' as const,
        rating: currentItem.rating as number | undefined,
        crowdLabel: 'Wines on Vivino',
        crowdAvg: avg,
        crowdCount: totalCount,
        googleAvg: currentItem.community?.score ?? null,
        googleCount: currentItem.community?.count ?? 0,
        ratedWines: [...rated].sort((a: any, b: any) => b.community.score - a.community.score),
      };
    }
    if (currentType === 'experience') {
      return {
        kind: 'experience' as const,
        rating: currentItem.rating as number | undefined,
        crowdLabel: 'On Google',
        crowdAvg: currentItem.community?.score ?? null,
        crowdCount: currentItem.community?.count ?? 0,
        googleAvg: null,
        googleCount: 0,
        ratedWines: [],
      };
    }
    return null;
  }, [currentType, currentItem, winesForWinery]);

  const loadVintageReport = async () => {
    if (loadingVintage) return;
    setLoadingVintage(true);
    try {
      setVintageReport(await getVintageReport(region, currentItem.name));
    } catch {
      setVintageReport('The Somm is away from the cellar — try again shortly.');
    } finally {
      setLoadingVintage(false);
    }
  };

  const loadExtraPairings = async () => {
    if (loadingPairings) return;
    setLoadingPairings(true);
    try {
      const result = await getFoodPairings(region, currentItem.name, currentItem.variety, currentItem.description);
      setExtraPairings(result.pairings ?? []);
    } catch {
      setExtraPairings([]);
    } finally {
      setLoadingPairings(false);
    }
  };

  const toggleFavourite = useCallback(() => {
    const key = FAV_KEYS[currentType];
    if (!key || !currentItem?.id) return;
    const favs = readFavs(key);
    const next = favs.includes(currentItem.id) ? favs.filter(id => id !== currentItem.id) : [...favs, currentItem.id];
    localStorage.setItem(key, JSON.stringify(next));
    setIsFavourite(next.includes(currentItem.id));
  }, [currentType, currentItem]);

  const handleBooking = (target = currentItem) => {
    if (target.bookingUrl) window.open(target.bookingUrl, '_blank');
    else setShowBooking(true);
  };

  const navigateToWinery = () => {
    if (!parentWinery) return;
    setHistory(prev => [...prev, { item: currentItem, type: currentType }]);
    setCurrentItem(parentWinery);
    setCurrentType('winery');
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCurrentItem(prev.item);
    setCurrentType(prev.type);
    setHistory(h => h.slice(0, -1));
  };

  const copyToClipboard = (text: string | undefined, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!currentItem) return null;

  const kickerLabel =
    currentType === 'winery' ? 'Cellar door' : currentType === 'wine' ? `${currentItem.vintage} vintage` : currentItem.category;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-ink/70" onClick={onClose} />

      <div
        ref={sheetRef}
        onTouchStart={onSheetTouchStart}
        onTouchMove={onSheetTouchMove}
        onTouchEnd={onSheetTouchEnd}
        className="relative bg-paper border border-hairline md:rounded-sm rounded-t-xl w-full max-w-2xl h-[94dvh] md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col animate-slide-up md:animate-scale-in"
        style={{ transform: sheetOffset ? `translateY(${sheetOffset}px)` : undefined, transition: sheetOffset ? 'none' : 'transform 0.25s ease' }}
      >
        {/* Grab handle — phones only */}
        <div className="md:hidden sticky top-0 z-30 flex justify-center pt-2 pb-1 bg-transparent pointer-events-none">
          <span className="w-10 h-1 rounded-full bg-parchment/70 shadow-sm" />
        </div>
        {/* Hero — tap to view large */}
        <div className="relative h-64 shrink-0">
          <button
            onClick={() => setLightboxIdx(0)}
            className="block w-full h-full cursor-zoom-in"
            aria-label="View photo larger"
          >
            <ImageWithLoader asset={heroAsset} className="w-full h-full" showCredit />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {FAV_KEYS[currentType] && (
              <button
                onClick={toggleFavourite}
                className={`p-2 rounded-sm transition-colors ${
                  isFavourite ? 'bg-claret text-parchment' : 'bg-ink/50 text-parchment hover:bg-ink/70'
                }`}
                aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
              >
                <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-ink/50 hover:bg-ink/70 p-2 rounded-sm text-parchment transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={goBack}
              className="absolute top-4 left-4 z-20 bg-ink/50 hover:bg-ink/70 text-parchment px-3 py-2 rounded-sm font-ui text-xs font-semibold uppercase tracking-kicker flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="absolute bottom-5 left-6 right-6 text-parchment z-10">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft">{kickerLabel}</span>
              {closingStatus && (
                <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-parchment/80 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {closingStatus.label}
                </span>
              )}
              {typeof currentItem.rating === 'number' && (
                <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-parchment/80 flex items-center gap-1">
                  <Star className="w-3 h-3" /> {currentItem.rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex items-end gap-3">
              {currentItem.logo && (
                <img
                  src={currentItem.logo}
                  alt={`${currentItem.name} logo`}
                  className="h-12 w-12 object-contain bg-parchment rounded-sm p-1 shrink-0"
                />
              )}
              <h2 className="font-display text-3xl md:text-4xl font-medium leading-tight">{currentItem.name}</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hairline shrink-0 bg-paper sticky top-0 z-10 px-6 gap-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`font-ui text-sm font-semibold py-4 -mb-px border-b-2 transition-colors ${
              activeTab === 'guide' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            The guide
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`font-ui text-sm font-semibold py-4 -mb-px border-b-2 transition-colors ${
              activeTab === 'visitors' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            What visitors say
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {activeTab === 'guide' ? (
            <>
              <p className="font-body text-lg text-ink/70 leading-relaxed">{currentItem.description}</p>

              {/* The long read — the estate's researched history */}
              {currentItem.story && (
                <div>
                  <Kicker className="mb-2">The story</Kicker>
                  <p className="font-body text-ink/70 leading-relaxed whitespace-pre-line">{currentItem.story}</p>
                </div>
              )}

              {currentItem.sommNote && (
                <div className="border-l-2 border-brass pl-4">
                  <Kicker className="mb-1">The Somm's note</Kicker>
                  <p className="font-body italic text-ink/70 leading-relaxed">{currentItem.sommNote}</p>
                </div>
              )}

              {/* Winery fast facts */}
              {currentType === 'winery' && (
                <div className="grid grid-cols-2 md:grid-cols-4 border border-hairline divide-x divide-hairline rounded-sm">
                  <div className="p-4 text-center">
                    <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1">Tasting</p>
                    <p className="font-display text-lg text-ink">
                      {currentItem.tastingFee === 0 ? 'Free' : `$${currentItem.tastingFee ?? '—'} pp`}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1">Booking</p>
                    <p className="font-display text-lg text-ink">{currentItem.bookingRequired ? 'Required' : 'Walk in'}</p>
                  </div>
                  <div className="p-4 text-center border-t md:border-t-0 border-hairline">
                    <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1">Style</p>
                    <p className="font-display text-lg text-ink truncate">{currentItem.style || 'Classic'}</p>
                  </div>
                  <div className="p-4 text-center border-t md:border-t-0 border-hairline">
                    <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1">Guests</p>
                    <div className="flex justify-center gap-2 pt-1 text-claret">
                      {currentItem.kidFriendly && <Baby className="w-4 h-4" aria-label="Kid friendly" />}
                      {currentItem.dogFriendly && <Dog className="w-4 h-4" aria-label="Dog friendly" />}
                      {!currentItem.kidFriendly && !currentItem.dogFriendly && <span className="font-display text-lg text-ink/40">—</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata line */}
              <div className="flex gap-4 flex-wrap font-ui text-xs text-ink/60">
                {currentItem.subregion && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brass" /> {currentItem.subregion}</span>
                )}
                {currentType === 'winery' && currentItem.specialty && (
                  <span className="flex items-center gap-1.5"><Wine className="w-3.5 h-3.5 text-brass" /> {currentItem.specialty}</span>
                )}
                {currentType === 'wine' && currentItem.variety && (
                  <span className="flex items-center gap-1.5"><Grape className="w-3.5 h-3.5 text-brass" /> {currentItem.variety}</span>
                )}
                {currentItem.opens && currentItem.closes && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brass" /> {currentItem.opens}–{currentItem.closes}</span>
                )}
              </div>

              {/* Wine: pairings, price, parent estate */}
              {currentType === 'wine' && (
                <div className="space-y-6">
                  {currentItem.pairings?.length > 0 && (
                    <div>
                      <Kicker className="mb-3">At the table</Kicker>
                      <div className="flex flex-wrap gap-2">
                        {currentItem.pairings.map((p: string) => <Tag key={p}>{p}</Tag>)}
                      </div>
                      {aiEnabled && !extraPairings && (
                        <button
                          onClick={loadExtraPairings}
                          className="mt-3 font-ui text-xs font-semibold text-claret hover:text-claret-deep flex items-center gap-1.5 transition-colors"
                        >
                          {loadingPairings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Utensils className="w-3.5 h-3.5" />}
                          Ask the Somm for more pairings
                        </button>
                      )}
                      {extraPairings && extraPairings.length > 0 && (
                        <ul className="mt-4 space-y-2 border-t border-hairline pt-4">
                          {extraPairings.map(p => (
                            <li key={p.food} className="font-body text-sm text-ink/70">
                              <span className="font-semibold text-ink">{p.food}</span> — {p.reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {(currentItem.drinkFrom || currentItem.drinkTo) && (
                    <p className="font-ui text-xs text-ink/60">
                      Drinking window: <span className="text-ink font-semibold">{currentItem.drinkFrom ?? 'now'}–{currentItem.drinkTo ?? 'now'}</span>
                    </p>
                  )}

                  {/* The tasting book — one honest tap at the cellar door */}
                  <div className="flex items-center gap-2">
                    <Kicker className="mr-1">Your tasting book</Kicker>
                    {hasTasted(currentItem.id) ? (
                      <>
                        <Tag tone="success">In the book</Tag>
                        <button
                          onClick={() => { recordTasting({ wineId: currentItem.id, regionId: region.id, loved: true }); setTastedTick(x => x + 1); }}
                          className="font-ui text-xs font-semibold text-claret hover:text-claret-deep"
                        >
                          Loved it
                        </button>
                        <button
                          onClick={() => { removeTasting(currentItem.id); setTastedTick(x => x + 1); }}
                          className="font-ui text-xs text-ink/40 hover:text-ink"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { recordTasting({ wineId: currentItem.id, regionId: region.id }); setTastedTick(x => x + 1); }}
                        className="font-ui text-xs font-semibold border border-hairline hover:border-claret hover:text-claret rounded-sm px-3 py-1.5 transition-colors"
                      >
                        I tasted this
                      </button>
                    )}
                  </div>

                  {/* Price row */}
                  <div className="flex justify-between items-center border border-hairline rounded-sm p-4 gap-4">
                    <div>
                      <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1">Cellar door price</p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {pricing?.isSale && (
                          <span className="font-body text-sm line-through text-ink/40">{pricing.original}</span>
                        )}
                        <span className={`font-display text-2xl ${pricing?.isSale ? 'text-terracotta' : 'text-ink'}`}>
                          {pricing && pricing.price > 0 ? pricing.display : currentItem.price}
                        </span>
                        {pricing?.isSale && <Tag tone="sale">Save {pricing.discount}%</Tag>}
                      </div>
                    </div>
                    <Button onClick={() => addToCart(currentItem.id)}>
                      <ShoppingBag className="w-4 h-4" /> Add to case
                    </Button>
                  </div>

                  {parentWinery && (
                    <div className="border border-hairline rounded-sm p-5">
                      <Kicker className="mb-3">Taste it at the source</Kicker>
                      <div className="flex items-start gap-4">
                        <ImageWithLoader asset={parentWinery.image} className="w-16 h-16 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-lg text-ink leading-tight">{parentWinery.name}</h4>
                          <p className="font-ui text-xs text-ink/50 mb-3">{parentWinery.subregion}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" onClick={() => handleBooking(parentWinery)}>
                              <CalendarCheck className="w-3.5 h-3.5" /> Book a tasting
                            </Button>
                            <Button size="sm" variant="secondary" onClick={navigateToWinery}>
                              View the estate <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Winery: vintage report on request */}
              {currentType === 'winery' && aiEnabled && (
                <div className="border border-hairline rounded-sm p-5">
                  <Kicker className="mb-2">The last vintage</Kicker>
                  {vintageReport ? (
                    <p className="font-body italic text-ink/70 leading-relaxed">{vintageReport}</p>
                  ) : (
                    <button
                      onClick={loadVintageReport}
                      className="font-ui text-xs font-semibold text-claret hover:text-claret-deep flex items-center gap-1.5 transition-colors"
                    >
                      {loadingVintage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Grape className="w-3.5 h-3.5" />}
                      Ask the Somm how the season went
                    </button>
                  )}
                </div>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <div>
                  <Kicker className="mb-3 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> In pictures</Kicker>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIdx(idx + 1)}
                        className="relative w-24 h-24 shrink-0 overflow-hidden rounded-sm border border-hairline opacity-80 hover:opacity-100 transition-opacity"
                        aria-label={`View larger: ${img.alt || currentItem.name}`}
                      >
                        <ImageWithLoader asset={img} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* The estate's own film */}
              {currentItem.videoUrl && (
                <div>
                  <Kicker className="mb-3">In motion</Kicker>
                  <div className="aspect-video border border-hairline rounded-sm overflow-hidden">
                    <iframe
                      src={currentItem.videoUrl}
                      title={`${currentItem.name} — film`}
                      className="w-full h-full"
                      allow="accelerometer; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {(currentType === 'winery' || currentType === 'experience') && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleBooking(currentItem)} className="flex-1 min-w-[10rem]">
                    {currentItem.bookingUrl ? <ExternalLink className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
                    {bookingLabel}
                  </Button>
                  {currentItem.website && (
                    <a
                      href={currentItem.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[8rem] font-ui text-sm font-semibold tracking-wide border border-ink/20 text-ink hover:border-ink rounded-sm px-5 py-2.5 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  {currentItem.phone && (
                    <a
                      href={`tel:${currentItem.phone}`}
                      className="flex-1 min-w-[8rem] font-ui text-sm font-semibold tracking-wide border border-ink/20 text-ink hover:border-ink rounded-sm px-5 py-2.5 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                </div>
              )}

              {/* The Somm's briefing */}
              <div className="bg-ink rounded-sm p-6 md:p-8 text-parchment">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircleQuestion className="w-6 h-6 text-brass-soft" />
                  <div>
                    <h3 className="font-display text-xl font-medium">The Somm's briefing</h3>
                    <p className="font-ui text-[10px] uppercase tracking-kicker text-parchment/50">What to say when you get there</p>
                  </div>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-6 h-6 text-brass-soft animate-spin" />
                    <span className="font-body text-sm text-parchment/60 italic">The Somm is gathering his thoughts…</span>
                  </div>
                ) : (
                  <div className="space-y-7 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft">The icebreaker</span>
                        <button
                          onClick={() => copyToClipboard(insiderInfo?.icebreaker, 'icebreaker')}
                          className="text-parchment/40 hover:text-parchment transition-colors"
                          aria-label="Copy icebreaker"
                        >
                          {copiedField === 'icebreaker' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="font-body text-lg italic leading-relaxed border-l-2 border-brass-soft/40 pl-4">
                        {insiderInfo?.icebreaker}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft">The pro move</span>
                        <button
                          onClick={() => copyToClipboard(insiderInfo?.proMove, 'promove')}
                          className="text-parchment/40 hover:text-parchment transition-colors"
                          aria-label="Copy pro move"
                        >
                          {copiedField === 'promove' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="font-body text-lg italic leading-relaxed border-l-2 border-brass-soft/40 pl-4">
                        {insiderInfo?.proMove}
                      </p>
                    </div>
                    <div className="pt-5 border-t border-parchment/10 flex gap-4">
                      <Lightbulb className="w-5 h-5 text-brass-soft shrink-0 mt-0.5" />
                      <div>
                        <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft mb-1">Worth knowing</p>
                        <p className="font-body text-sm text-parchment/80 leading-relaxed">{insiderInfo?.hiddenGem}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              {visitorsWord ? (
                <div className="space-y-8">
                  <div className="border border-hairline rounded-sm p-6 text-center">
                    <Kicker className="mb-4">The visitors' book, in numbers</Kicker>
                    <div className="flex justify-center gap-10">
                      {visitorsWord.rating && (
                        <div className="text-center">
                          <div className="font-display text-2xl text-claret">{visitorsWord.rating.toFixed(1)}</div>
                          <div className="font-ui text-[10px] uppercase font-semibold tracking-kicker text-ink/40">{visitorsWord.kind === 'winery' ? 'Cellar door' : 'Our rating'}</div>
                        </div>
                      )}
                      {visitorsWord.googleAvg && (
                        <div className="text-center">
                          <div className="font-display text-2xl text-claret">{visitorsWord.googleAvg.toFixed(1)}</div>
                          <div className="font-ui text-[10px] uppercase font-semibold tracking-kicker text-ink/40">
                            On Google{visitorsWord.googleCount > 0 ? ` (${visitorsWord.googleCount.toLocaleString()})` : ''}
                          </div>
                        </div>
                      )}
                      {visitorsWord.crowdAvg && (
                        <div className="text-center">
                          <div className="font-display text-2xl text-claret">{visitorsWord.crowdAvg.toFixed(1)}</div>
                          <div className="font-ui text-[10px] uppercase font-semibold tracking-kicker text-ink/40">
                            {visitorsWord.crowdLabel}
                          </div>
                        </div>
                      )}
                      {visitorsWord.crowdCount > 0 && (
                        <div className="text-center">
                          <div className="font-display text-2xl text-claret">{visitorsWord.crowdCount.toLocaleString()}</div>
                          <div className="font-ui text-[10px] uppercase font-semibold tracking-kicker text-ink/40">Crowd ratings</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentItem.visitorSummary && (
                    <div className="border-l-2 border-brass pl-4">
                      <Kicker className="mb-2">What they keep saying</Kicker>
                      <p className="font-body text-ink/70 leading-relaxed">{currentItem.visitorSummary}</p>
                      <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/30 mt-2">
                        Summarised from public visitor reviews · themes only, nothing invented
                      </p>
                    </div>
                  )}

                  {visitorsWord.ratedWines.length > 0 ? (
                    <div>
                      <h4 className="font-display text-lg text-ink flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-brass" /> What the crowd rates here
                      </h4>
                      <div className="space-y-0 border-t border-hairline">
                        {visitorsWord.ratedWines.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between gap-4 py-3 border-b border-hairline">
                            <div className="min-w-0">
                              <p className="font-body text-[15px] text-ink leading-snug truncate">{w.name}</p>
                              <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-0.5">{w.variety} · {w.vintage}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-display text-lg text-claret flex items-center gap-1.5 justify-end">
                                <Star className="w-3.5 h-3.5 text-brass fill-current" /> {w.community.score.toFixed(1)}
                              </span>
                              <span className="font-ui text-[10px] text-ink/40">{w.community.count.toLocaleString()} ratings</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/30 mt-4 text-center">
                        Community scores from Vivino · gathered, never invented
                      </p>
                    </div>
                  ) : (
                    <p className="font-body text-ink/50 text-center leading-relaxed py-6">
                      {visitorsWord.kind === 'winery'
                        ? "The crowd hasn't weighed in on these bottles yet — which the regulars would call a blessing. Taste first, tell your friends later."
                        : visitorsWord.crowdAvg
                          ? 'The crowd has spoken in numbers; the details they keep for the car ride home.'
                          : "The crowd hasn't left its verdict here yet — go and form your own."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="font-display text-xl text-ink mb-2">Nothing in the book yet</p>
                  <p className="font-body text-ink/50">The visitors' word covers the estates — step back out to the winery to read it.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking sheet — an honest handoff into the venue's own system */}
      {showBooking && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={closeBooking} />
          <div className="relative bg-paper border border-hairline rounded-sm w-full max-w-sm animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-5 py-4 border-b border-hairline">
              <h3 className="font-display text-lg text-ink">Book a visit</h3>
              <button onClick={closeBooking} className="text-ink/40 hover:text-ink transition-colors" aria-label="Close booking">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {bookingStep === 1 ? (
                <>
                  <div className="mb-5">
                    <Kicker className="mb-1">Booking at</Kicker>
                    <p className="font-display text-xl text-ink">{currentItem.name}</p>
                  </div>
                  <div className="mb-5">
                    <Kicker className="mb-2">Date</Kicker>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {nextDays(14).map(d => (
                        <button
                          key={d.iso}
                          onClick={() => setBookingDate(d.iso)}
                          className={`shrink-0 px-3 py-2 rounded-sm border text-center transition-colors ${
                            bookingDate === d.iso ? 'bg-claret text-parchment border-claret' : 'border-hairline text-ink/60 hover:border-ink/40'
                          }`}
                        >
                          <span className="block font-ui text-[10px] uppercase tracking-kicker opacity-70">{d.weekday}</span>
                          <span className="block font-ui text-sm font-semibold">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <Kicker className="mb-2">Guests</Kicker>
                    <div className="flex items-center gap-4 border border-hairline rounded-sm px-4 py-2.5 w-fit">
                      <button
                        onClick={() => setBookingParty(p => Math.max(1, p - 1))}
                        className="font-display text-xl text-ink/60 hover:text-claret px-1"
                        aria-label="Fewer guests"
                      >−</button>
                      <span className="font-ui text-sm font-semibold text-ink w-14 text-center">
                        {bookingParty} {bookingParty === 1 ? 'guest' : 'guests'}
                      </span>
                      <button
                        onClick={() => setBookingParty(p => Math.min(12, p + 1))}
                        className="font-display text-xl text-ink/60 hover:text-claret px-1"
                        aria-label="More guests"
                      >+</button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <Kicker className="mb-2">Preferred time (optional)</Kicker>
                    <div className="grid grid-cols-3 gap-2">
                      {bookingSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(selectedTime === time ? null : time)}
                          className={`py-2.5 rounded-sm font-ui text-sm font-semibold border transition-colors ${
                            selectedTime === time ? 'bg-claret text-parchment border-claret' : 'border-hairline text-ink/60 hover:border-ink/40'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const h = buildBookingHandoff(currentItem.bookingUrl, currentItem.website, {
                        date: bookingDate,
                        time: selectedTime ?? undefined,
                        party: bookingParty,
                      });
                      if (!h) return;
                      setHandoff(h);
                      window.open(h.url, '_blank', 'noopener');
                      setBookingStep(2);
                    }}
                  >
                    Continue on {getBookingLabel(currentItem.bookingUrl) === 'Request a visit' ? 'their site' : getBookingLabel(currentItem.bookingUrl).replace(/^(Book on |Book via |Reserve on |Reserve via )/, '')}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <p className="font-body text-xs text-ink/40 mt-3 text-center">
                    You complete the booking in {currentItem.name}'s own system — Somm never takes a commission.
                  </p>
                </>
              ) : (
                <div className="py-2">
                  <Check className="w-8 h-8 text-vine mx-auto mb-4" />
                  <h3 className="font-display text-2xl text-ink mb-2 text-center">Over to {currentItem.name}</h3>
                  <p className="font-body text-ink/60 mb-5 text-center text-sm">
                    We've opened {handoff?.provider ?? 'their booking page'}
                    {handoff?.prefilled ? ' with your date and party filled in' : ''} — finish the booking there.
                    Pop a hold in your calendar so the day is safe:
                  </p>
                  {(() => {
                    const hold = calendarHold(
                      `Tasting at ${currentItem.name}`,
                      `${currentItem.name}, ${currentItem.subregion ?? region.name}`,
                      `Booked via ${handoff?.provider ?? 'their site'}. Party of ${bookingParty}.`,
                      bookingDate,
                      selectedTime ?? '11:00'
                    );
                    return hold ? (
                      <div className="flex flex-col gap-2 mb-4">
                        <a href={hold.gcalUrl} target="_blank" rel="noopener" className="font-ui text-sm font-semibold text-claret hover:text-claret-deep text-center border border-hairline rounded-sm py-2.5">
                          Add to Google Calendar — {hold.when}
                        </a>
                        <a href={hold.icsUrl} download={`somm-${currentItem.id}.ics`} className="font-ui text-xs text-ink/50 hover:text-ink text-center">
                          …or download for Apple/Outlook (.ics)
                        </a>
                      </div>
                    ) : null;
                  })()}
                  <div className="flex gap-2 justify-center">
                    {handoff && (
                      <Button variant="secondary" size="sm" onClick={() => window.open(handoff.url, '_blank', 'noopener')}>
                        Reopen booking page
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={closeBooking}>Done</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox — full-screen view of the hero and gallery */}
      {lightboxIdx !== null && lightboxImages[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[70] bg-ink/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-parchment/80 hover:text-parchment p-2"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>
          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); stepLightbox(-1); }}
                className="absolute left-2 md:left-6 text-parchment/70 hover:text-parchment p-3"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); stepLightbox(1); }}
                className="absolute right-2 md:right-6 text-parchment/70 hover:text-parchment p-3"
                aria-label="Next photo"
              >
                <ChevronLeft className="w-8 h-8 rotate-180" />
              </button>
            </>
          )}
          <figure
            className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={optimised(lightboxImages[lightboxIdx].url, 1600)}
              alt={lightboxImages[lightboxIdx].alt || currentItem?.name}
              referrerPolicy="no-referrer"
              onError={e => {
                const img = e.currentTarget;
                if (img.src !== lightboxImages[lightboxIdx].url) img.src = lightboxImages[lightboxIdx].url;
              }}
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
            />
            <figcaption className="font-ui text-xs text-parchment/70 text-center px-4">
              {lightboxImages[lightboxIdx].alt || currentItem?.name}
              {lightboxImages.length > 1 && (
                <span className="text-parchment/40"> · {lightboxIdx + 1} of {lightboxImages.length}</span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
};

export default GuideModal;
