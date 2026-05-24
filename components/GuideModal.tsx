
import React, { useEffect, useState, useMemo } from 'react';
import { X, MessageCircleQuestion, Lightbulb, Sparkles, Loader2, Wine, MapPin, Quote, Phone, Globe, CalendarCheck, Clock, AlertCircle, Star, Users, CheckCircle, ArrowRight, Camera, Utensils, Bird, Image as ImageIcon, ExternalLink, ChevronLeft, Building2, ShoppingBag, Copy, Check, Ticket, Baby, Dog } from 'lucide-react';
import { generateInsiderGuide, generateReviewSummary } from '../services/claudeService';
import { WINERIES } from '../data/wineries';
import { addToCart, getWinePricing } from '../services/commerceService';
import ImageWithLoader from './ImageWithLoader';

interface GuideModalProps {
  item: any; // Can be Winery, WineDetail, or Experience
  type: 'winery' | 'wine' | 'experience';
  onClose: () => void;
}

// Helper to determine closing status
const getClosingStatus = (closesTime: string | undefined) => {
    if (!closesTime) return null;
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const [closeHour, closeMinute] = closesTime.split(':').map(Number);
        
        const timeNow = currentHour * 60 + currentMinute;
        const timeClose = closeHour * 60 + closeMinute;
        const diff = timeClose - timeNow;
        
        if (diff < 0) return { status: 'Closed', color: 'bg-red-500' };
        if (diff <= 60) return { status: `Closing Soon (${diff}m)`, color: 'bg-amber-500' };
        return { status: 'Open', color: 'bg-green-500' };
    } catch(e) {
        return null;
    }
};

// Extracted booking config logic
const getBookingButtonConfig = (url: string | null) => {
  if (!url) return { label: 'Request Booking', icon: <CalendarCheck className="w-4 h-4" />, className: 'bg-[#6b1e2e] hover:bg-[#852539]' };
  
  const u = url.toLowerCase();
  
  if (u.includes('exploretock.com')) return { label: 'Reserve on Tock', icon: <ExternalLink className="w-4 h-4" />, className: 'bg-black hover:bg-gray-800' };
  if (u.includes('opentable')) return { label: 'Book on OpenTable', icon: <Utensils className="w-4 h-4" />, className: 'bg-[#da3743] hover:bg-[#b02a36]' };
  if (u.includes('rezdy')) return { label: 'Book via Rezdy', icon: <Ticket className="w-4 h-4" />, className: 'bg-[#00a3ad] hover:bg-[#008a93]' };
  if (u.includes('sevenrooms')) return { label: 'Reserve via SevenRooms', icon: <CalendarCheck className="w-4 h-4" />, className: 'bg-[#1a1a1a] hover:bg-black' };
  if (u.includes('obee')) return { label: 'Book on Obee', icon: <Utensils className="w-4 h-4" />, className: 'bg-[#f58220] hover:bg-[#d66e15]' };
  if (u.includes('nowbookit')) return { label: 'Book Table', icon: <CalendarCheck className="w-4 h-4" />, className: 'bg-[#1a1a1a] hover:bg-black' };
  if (u.includes('thefork')) return { label: 'Book on TheFork', icon: <Utensils className="w-4 h-4" />, className: 'bg-[#589442] hover:bg-[#467a32]' };

  return { label: 'Book Online', icon: <ExternalLink className="w-4 h-4" />, className: 'bg-[#6b1e2e] hover:bg-[#852539]' };
};

const GuideModal: React.FC<GuideModalProps> = ({ item: initialItem, type: initialType, onClose }) => {
  const [currentItem, setCurrentItem] = useState(initialItem);
  const [currentType, setCurrentType] = useState(initialType);
  const [history, setHistory] = useState<{item: any, type: string}[]>([]);

  const [insiderInfo, setInsiderInfo] = useState<any>(null);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'community'>('guide');
  const [currentImage, setCurrentImage] = useState<string>('');
  
  // Booking State
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Parent Winery & Pricing
  const [parentWinery, setParentWinery] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);

  // Copy Feedback State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Computed Values
  const closingStatus = useMemo(() => getClosingStatus(currentItem?.closes), [currentItem]);
  const bookingConfig = useMemo(() => getBookingButtonConfig(currentItem?.bookingUrl), [currentItem]);

  useEffect(() => {
    setCurrentItem(initialItem);
    setCurrentType(initialType);
    setHistory([]);
  }, [initialItem, initialType]);

  useEffect(() => {
    if (currentItem) {
        setCurrentImage(currentItem.image || ''); // Safety fallback
        if (currentType === 'wine') {
            setPricing(getWinePricing(currentItem.id));
        }
    }
  }, [currentItem]);

  useEffect(() => {
    const loadContent = async () => {
        if (!currentItem) return;
        setLoading(true);
        setInsiderInfo(null);
        setReviewSummary(null);
        setParentWinery(null);

        if (currentType === 'wine') {
            const winery = WINERIES.find(w => w.id === currentItem.wineryId);
            setParentWinery(winery);
        }

        try {
            const details = currentItem.description + (currentItem.specialty ? ` Known for ${currentItem.specialty}.` : '') + (currentItem.category ? ` Category: ${currentItem.category}` : '');
            const parsed = await generateInsiderGuide(currentItem.name, currentType, details);
            setInsiderInfo(parsed);
        } catch (e) { 
            console.error("Failed to fetch guide", e);
            // Fallback content if AI fails
            setInsiderInfo({
                icebreaker: "Ask about their flagship wine vintage.",
                proMove: "Try visiting mid-week for a private tasting.",
                hiddenGem: "This spot has a rich history in the valley."
            });
        } 
        finally { setLoading(false); }
    };
    loadContent();
  }, [currentItem, currentType]);

  const loadCommunityPulse = async () => {
    if (reviewSummary) return;
    setLoadingReviews(true);
    try {
        const result = await generateReviewSummary(currentItem.name);
        setReviewSummary(result);
    } catch (e) { console.error(e); } 
    finally { setLoadingReviews(false); }
  };

  const handleBooking = (targetItem = currentItem) => {
    if (targetItem.bookingUrl) window.open(targetItem.bookingUrl, '_blank');
    else setShowBooking(true);
  };

  const handleAddToCart = () => addToCart(currentItem.id);

  const navigateToWinery = () => {
      if (parentWinery) {
          setHistory(prev => [...prev, { item: currentItem, type: currentType }]);
          setCurrentItem(parentWinery);
          setCurrentType('winery');
          setActiveTab('guide');
      }
  };

  const goBack = () => {
      if (history.length > 0) {
          const prev = history[history.length - 1];
          setCurrentItem(prev.item);
          setCurrentType(prev.type as any);
          setHistory(prev => prev.slice(0, -1));
      }
  };

  const copyToClipboard = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
  };

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#fdfcfb] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        {/* Hero Image */}
        <div className="relative h-64 bg-gray-200 shrink-0">
          <ImageWithLoader
            src={currentImage} 
            className="w-full h-full object-cover" 
            alt={currentItem.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2 z-20">
             <button onClick={onClose} className="bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>

          {history.length > 0 && (
              <button onClick={goBack} className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white transition-colors z-20 flex items-center gap-1 pr-4">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
          )}
          
          <div className="absolute top-6 left-6">
              {currentItem.rating && (
                  <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-sm font-black text-[#1a1a1a]">{currentItem.rating.toFixed(1)}</span>
                  </div>
              )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
             <div className="flex gap-2 mb-2">
                {currentType === 'winery' && <div className="text-xs font-bold uppercase tracking-widest bg-[#a68d60] inline-block px-2 py-1 rounded">Cellar Door Guide</div>}
                {currentType === 'wine' && <div className="text-xs font-bold uppercase tracking-widest bg-[#6b1e2e] inline-block px-2 py-1 rounded">{currentItem.vintage} Vintage</div>}
                {currentType === 'experience' && <div className="text-xs font-bold uppercase tracking-widest bg-blue-600 inline-block px-2 py-1 rounded">{currentItem.category}</div>}
                {closingStatus && (
                    <div className={`text-xs font-bold uppercase tracking-widest text-white inline-flex items-center gap-1 px-2 py-1 rounded ${closingStatus.color}`}>
                        <Clock className="w-3 h-3" /> {closingStatus.status}
                    </div>
                )}
             </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">{currentItem.name}</h2>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#e5e1da] shrink-0 bg-white sticky top-0 z-10">
            <button onClick={() => setActiveTab('guide')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'guide' ? 'text-[#6b1e2e] border-b-2 border-[#6b1e2e]' : 'text-gray-400'}`}>Overview</button>
            <button onClick={() => { setActiveTab('community'); loadCommunityPulse(); }} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'community' ? 'text-[#6b1e2e] border-b-2 border-[#6b1e2e]' : 'text-gray-400'}`}>Community Pulse</button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {activeTab === 'guide' ? (
            <>
            <div>
                <p className="text-gray-600 text-lg leading-relaxed font-serif italic mb-6">"{currentItem.description}"</p>
                
                {/* WINERY FAST FACTS */}
                {currentType === 'winery' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-[#f8f4f0] rounded-2xl border border-[#e5e1da]">
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Tasting Cost</span>
                            <span className="font-bold text-[#1a1a1a]">${currentItem.tastingFee ?? '??'}pp</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Booking</span>
                            <span className="font-bold text-[#1a1a1a]">{currentItem.bookingRequired ? 'Required' : 'Walk-in'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Vibe</span>
                            <span className="font-bold text-[#1a1a1a]">{currentItem.style || 'Classic'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Guests</span>
                            <div className="flex gap-2">
                                {currentItem.kidFriendly && <Baby className="w-4 h-4 text-[#6b1e2e]" />}
                                {currentItem.dogFriendly && <Dog className="w-4 h-4 text-[#6b1e2e]" />}
                                {!currentItem.kidFriendly && !currentItem.dogFriendly && <span className="text-sm font-bold text-gray-600">-</span>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 flex-wrap mb-6">
                {currentType === 'winery' && (
                    <>
                        <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> {currentItem.subregion}</div>
                        <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2"><Wine className="w-4 h-4" /> {currentItem.specialty}</div>
                    </>
                )}
                {currentType === 'wine' && (
                    <>
                        <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2"><Wine className="w-4 h-4" /> {currentItem.variety}</div>
                        {pricing && <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {pricing.display}</div>}
                    </>
                )}
                </div>

                {currentType === 'wine' && (
                    <div className="space-y-6 mb-8">
                        <div>
                            <h4 className="font-bold text-[#1a1a1a] flex items-center gap-2 mb-3"><Utensils className="w-5 h-5 text-[#a68d60]" /> Sommelier Pairings</h4>
                            <div className="flex flex-wrap gap-2">
                                {currentItem.pairings?.map((p: string) => <span key={p} className="px-3 py-1 bg-[#f8f4f0] text-[#6b1e2e] rounded-full text-xs font-bold border border-[#6b1e2e]/10">{p}</span>)}
                            </div>
                        </div>
                        <div className="p-5 bg-[#6b1e2e]/5 rounded-2xl border border-[#6b1e2e]/10">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#6b1e2e] mb-2">The Anecdote</h4>
                            <p className="text-sm font-serif italic text-gray-700 leading-relaxed">"{currentItem.aiTake}"</p>
                        </div>
                        <div className="flex justify-between items-center bg-[#f8f4f0] p-4 rounded-2xl border border-[#e5e1da]">
                            <div>
                                <span className="text-xs font-bold uppercase text-gray-400">Cellar Door Price</span>
                                {pricing && (
                                    <div className="flex items-center gap-2">
                                        {pricing.isSale && <span className="text-sm line-through text-gray-400">{pricing.original}</span>}
                                        <div className={`text-2xl font-serif font-bold ${pricing.isSale ? 'text-[#b91c1c]' : 'text-[#1a1a1a]'}`}>{pricing.display}</div>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleAddToCart} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-bold shadow-lg hover:bg-[#6b1e2e] transition-all flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Add to Cart
                            </button>
                        </div>
                        {parentWinery && (
                            <div className="bg-white border border-[#e5e1da] rounded-2xl p-5 shadow-sm mt-8 relative overflow-hidden group hover:border-[#a68d60] transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="w-24 h-24 text-[#a68d60]" /></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a68d60] mb-3"><MapPin className="w-4 h-4" /> Taste at the Source</div>
                                    <div className="flex items-start gap-4">
                                        <ImageWithLoader src={parentWinery.image} className="w-16 h-16 rounded-xl object-cover border border-gray-100" alt={parentWinery.name} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-[#1a1a1a] leading-tight mb-1">{parentWinery.name}</h4>
                                            <p className="text-sm text-gray-500 mb-3">{parentWinery.subregion}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleBooking(parentWinery)} className="px-4 py-2 bg-[#6b1e2e] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#852539]"><CalendarCheck className="w-3 h-3" /> Book Tasting</button>
                                                <button onClick={navigateToWinery} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-200">View Estate <ArrowRight className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentItem.gallery && currentItem.gallery.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400"><ImageIcon className="w-3 h-3" /> Photo Gallery</div>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {currentItem.gallery.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setCurrentImage(img)} className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden transition-all ${currentImage === img ? 'ring-2 ring-[#6b1e2e] scale-105' : 'opacity-70 hover:opacity-100'}`}>
                                    <ImageWithLoader src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {(currentType === 'winery' || currentType === 'experience') && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button 
                        onClick={() => handleBooking(currentItem)} 
                        className={`${bookingConfig.className} text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors col-span-2 md:col-span-1 shadow-md`}
                    >
                        {bookingConfig.icon}
                        {bookingConfig.label}
                    </button>
                    {currentItem.website && <a href={currentItem.website} target="_blank" rel="noreferrer" className="bg-white border border-[#e5e1da] text-[#1a1a1a] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-[#6b1e2e] transition-colors"><Globe className="w-4 h-4" /> Website</a>}
                    {currentItem.phone && <a href={`tel:${currentItem.phone}`} className="bg-white border border-[#e5e1da] text-[#1a1a1a] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-[#6b1e2e] transition-colors"><Phone className="w-4 h-4" /> Call</a>}
                </div>
            )}

            <div className="bg-[#1a1a1a] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#6b1e2e] rounded-full blur-[80px] opacity-30 -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageCircleQuestion className="w-8 h-8 text-[#a68d60]" />
                        <div><h3 className="text-2xl font-bold font-serif">Ask the Local</h3><p className="text-white/60 text-xs uppercase tracking-widest">Clever questions to impress</p></div>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4"><Loader2 className="w-8 h-8 text-[#a68d60] animate-spin" /><span className="text-sm font-medium text-gray-400">Consulting the virtual concierge...</span></div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#a68d60] font-bold text-xs uppercase tracking-widest">1. The Icebreaker</span>
                                    <button onClick={() => copyToClipboard(insiderInfo?.icebreaker, 'icebreaker')} className="text-gray-400 hover:text-white">{copiedField === 'icebreaker' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm"><p className="font-medium text-lg">"{insiderInfo?.icebreaker}"</p></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#a68d60] font-bold text-xs uppercase tracking-widest">2. The "Pro" Move</span>
                                    <button onClick={() => copyToClipboard(insiderInfo?.proMove, 'promove')} className="text-gray-400 hover:text-white">{copiedField === 'promove' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm"><p className="font-medium text-lg">"{insiderInfo?.proMove}"</p></div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex gap-4">
                                    <div className="bg-[#a68d60] rounded-full w-10 h-10 flex items-center justify-center shrink-0 text-white"><Lightbulb className="w-5 h-5" /></div>
                                    <div><h4 className="font-bold text-lg mb-1">Did you know?</h4><p className="text-white/80 text-sm leading-relaxed">{insiderInfo?.hiddenGem}</p></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                {loadingReviews ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4"><Loader2 className="w-8 h-8 text-[#6b1e2e] animate-spin" /><span className="text-sm font-medium text-gray-500">Synthesizing human opinions...</span></div>
                ) : reviewSummary ? (
                    <div className="space-y-8">
                        <div className="text-center bg-[#f8f4f0] rounded-2xl p-6">
                            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-serif">Community Pulse</h3>
                            <p className="text-sm text-gray-500 mb-6">AI Summary based on simulated Google Reviews</p>
                            <div className="flex justify-center gap-8">
                                <div className="text-center"><div className="text-2xl font-bold text-[#6b1e2e] flex items-center gap-1 justify-center">{reviewSummary.serviceScore} <Star className="w-4 h-4 fill-[#6b1e2e]"/></div><div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Service</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-[#6b1e2e] flex items-center gap-1 justify-center">{reviewSummary.atmosphereScore} <Star className="w-4 h-4 fill-[#6b1e2e]"/></div><div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Vibe</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-[#6b1e2e] flex items-center gap-1 justify-center">{reviewSummary.valueScore} <Star className="w-4 h-4 fill-[#6b1e2e]"/></div><div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Value</div></div>
                            </div>
                        </div>
                        <div><h4 className="font-bold text-[#1a1a1a] flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-[#a68d60]" /> What Most People Say</h4><div className="p-4 bg-white border border-[#e5e1da] rounded-xl shadow-sm italic text-gray-600">"{reviewSummary.summary}"</div></div>
                        <div><h4 className="font-bold text-[#1a1a1a] flex items-center gap-2 mb-3"><MessageCircleQuestion className="w-5 h-5 text-[#a68d60]" /> Frequent Mentions</h4><div className="flex flex-wrap gap-2">{reviewSummary.frequentMentions.map((tag: string, i: number) => <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{tag}</span>)}</div></div>
                    </div>
                ) : <div className="text-center py-12 text-gray-400">Unable to load reviews.</div>}
            </div>
          )}
        </div>
      </div>
      {showBooking && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-105 duration-200">
                  <div className="bg-[#6b1e2e] p-4 flex justify-between items-center text-white"><h3 className="font-bold">Request Booking</h3><button onClick={() => { setShowBooking(false); setBookingStep(1); setSelectedTime(null); }}><X className="w-5 h-5"/></button></div>
                  <div className="p-6">
                      {bookingStep === 1 ? (
                          <>
                            <div className="mb-6"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requesting at</div><div className="font-serif font-bold text-xl text-[#1a1a1a]">{currentItem.name}</div></div>
                            <div className="mb-6"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Date</label><div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-center">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div>
                            <div className="mb-6"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Preferred Time</label><div className="grid grid-cols-2 gap-2">{['10:30 AM', '11:45 AM', '1:30 PM', '3:00 PM', '6:30 PM'].map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 rounded-xl text-sm font-bold border transition-all ${selectedTime === time ? 'bg-[#6b1e2e] text-white border-[#6b1e2e]' : 'bg-white border-[#e5e1da] text-gray-600 hover:border-[#6b1e2e]'}`}>{time}</button>)}</div></div>
                            <button disabled={!selectedTime} onClick={() => setBookingStep(2)} className="w-full bg-[#a68d60] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 hover:bg-[#8e7850]">Send Request</button>
                          </>
                      ) : (
                          <div className="text-center py-8"><div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in"><CheckCircle className="w-8 h-8" /></div><h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">Request Sent</h3><p className="text-gray-500 mb-6">We've sent your request for {selectedTime} to {currentItem.name}. They will confirm shortly.</p><button onClick={() => { setShowBooking(false); setBookingStep(1); setSelectedTime(null); }} className="text-[#6b1e2e] font-bold text-sm">Close</button></div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GuideModal;
