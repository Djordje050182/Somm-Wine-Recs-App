
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import Discover from './components/Discover';
import WineScanner from './components/WineScanner';
import SommelierChat from './components/SommelierChat';
import RegionExplorer from './components/RegionExplorer';
import LiveSommelier from './components/LiveSommelier';
import ItineraryBuilder from './components/ItineraryBuilder';
import WineLibrary from './components/WineLibrary';
import Favorites from './components/Favorites';
import Concierge from './components/Concierge';
import Experiences from './components/Experiences';
import GlobalSearch from './components/GlobalSearch';
import GuideModal from './components/GuideModal';
import PartnerPortal from './components/PartnerPortal';
import CartDrawer from './components/CartDrawer';
import WhatsOn from './components/WhatsOn';
import CreativeCellar from './components/CreativeCellar';
import CellarTracker from './components/CellarTracker';
import { getCart } from './services/commerceService';
import { Wine, MessageSquare, Camera, Map as MapIcon, Mic, Sparkles, Heart, Menu, X, BookOpen, Globe, Search, User, Compass, WifiOff, ShoppingBag, Calendar, Palette, Package } from 'lucide-react';
import { WINERIES } from './data/wineries';
import { calculateDistance } from './services/geoUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DISCOVER);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, tier?: string} | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);

  // Cart State
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartToast, setCartToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [cartAnimating, setCartAnimating] = useState(false);

  // Location Awareness State
  const [nearbyWinery, setNearbyWinery] = useState<any>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [viewingNearbyGuide, setViewingNearbyGuide] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }

    const updateCartCount = () => {
        const items = getCart();
        const newCount = items.reduce((acc, item) => acc + item.quantity, 0);
        if (newCount > cartCount) {
            setCartToast({ show: true, message: 'Added to Cellar' });
            setCartAnimating(true);
            setTimeout(() => setCartAnimating(false), 500);
            setTimeout(() => setCartToast({ show: false, message: '' }), 3000);
        }
        setCartCount(newCount);
    };
    const items = getCart();
    setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));

    window.addEventListener('somm-cart-update', updateCartCount);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkUserLocation();

    return () => {
      window.removeEventListener('somm-cart-update', updateCartCount);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [cartCount]);

  const checkUserLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
                  const { latitude, longitude } = position.coords;
                  let nearest = null;
                  let minDistance = 1.5; 
                  WINERIES.forEach(w => {
                      const dist = calculateDistance(latitude, longitude, w.lat, w.lng);
                      if (dist < minDistance) {
                          minDistance = dist;
                          nearest = w;
                      }
                  });
                  if (nearest) {
                      setNearbyWinery(nearest);
                      setShowLocationToast(true);
                  }
              }
          );
      }
  };

  const login = () => {
      const mockUser = { name: "Alex Sommelier", email: "alex@somm.ai", tier: "Premium" };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setShowAuthModal(false);
  };

  const logout = () => {
      setUser(null);
      localStorage.removeItem('user');
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DISCOVER: return <Discover onNavigate={handleNav} />;
      case AppTab.PLANNER: return <ItineraryBuilder />;
      case AppTab.CONCIERGE: return <Concierge />;
      case AppTab.SCANNER: return <WineScanner user={user} />;
      case AppTab.SOMMELIER: return <SommelierChat />;
      case AppTab.REGIONS: return <RegionExplorer />;
      case AppTab.EXPERIENCES: return <Experiences />;
      case AppTab.LIVE: return <LiveSommelier />;
      case AppTab.WINES: return <WineLibrary />;
      case AppTab.FAVORITES: return <Favorites user={user} />;
      case AppTab.CELLAR: return <CellarTracker />;
      case AppTab.PARTNERS: return <PartnerPortal />;
      case AppTab.EVENTS: return <WhatsOn />;
      case AppTab.STUDIO: return <CreativeCellar />;
      default: return <Discover onNavigate={handleNav} />;
    }
  };

  const handleNav = (tab: AppTab) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab, icon: any, label: string }) => (
    <button 
      onClick={() => handleNav(tab)} 
      className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors ${activeTab === tab ? 'text-[#6b1e2e]' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Icon className={`w-6 h-6 ${activeTab === tab ? 'fill-current/10' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcfb] text-[#1a1a1a]">
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e1da] px-4 md:px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => handleNav(AppTab.DISCOVER)}>
          <div className="bg-[#1a1a1a] p-2 md:p-2.5 rounded-xl text-white group-hover:scale-105 transition-transform shadow-lg">
            <Wine className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1a1a1a] font-serif">Somm<span className="text-[#a68d60] text-3xl md:text-4xl">.</span></h1>
        </div>
        
        <div className="hidden xl:flex items-center gap-8 text-sm font-bold tracking-wide">
          <button onClick={() => handleNav(AppTab.DISCOVER)} className={`${activeTab === AppTab.DISCOVER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Discover</button>
          <button onClick={() => handleNav(AppTab.WINES)} className={`${activeTab === AppTab.WINES ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Library</button>
          <button onClick={() => handleNav(AppTab.PLANNER)} className={`${activeTab === AppTab.PLANNER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Map & Plan</button>
          <button onClick={() => handleNav(AppTab.CONCIERGE)} className={`${activeTab === AppTab.CONCIERGE ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Concierge</button>
          <button onClick={() => handleNav(AppTab.SOMMELIER)} className={`${activeTab === AppTab.SOMMELIER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>AI Sommelier</button>
          <button onClick={() => handleNav(AppTab.CELLAR)} className={`flex items-center gap-1 ${activeTab === AppTab.CELLAR ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>
            <Package className="w-4 h-4" /> My Cellar
          </button>
        </div>

        <div className="flex gap-2 md:gap-3 items-center shrink-0">
           <button onClick={() => setShowSearch(true)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"><Search className="w-5 h-5" /></button>
           <button onClick={() => setShowCart(true)} className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#6b1e2e] transition-all ${cartAnimating ? 'scale-125 bg-green-50' : ''}`}><ShoppingBag className="w-5 h-5" />{cartCount > 0 && <div className="absolute -top-1 -right-1 bg-[#a68d60] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</div>}</button>
           <button onClick={() => handleNav(AppTab.LIVE)} disabled={isOffline} className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${isOffline ? 'bg-gray-300 text-gray-500' : 'bg-[#1a1a1a] text-white hover:bg-black active:scale-95'}`}>{isOffline ? <WifiOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#a68d60]" />}<span className="hidden sm:inline">Live Mode</span></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto w-full">
        {renderContent()}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e5e1da] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex justify-between items-end h-20 px-4 max-w-lg mx-auto pb-1">
          <NavItem tab={AppTab.DISCOVER} icon={Search} label="Discover" />
          <NavItem tab={AppTab.CELLAR} icon={Package} label="Cellar" />
          <div className="relative -top-6 mx-2">
            <button onClick={() => handleNav(AppTab.SCANNER)} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/30 active:scale-95 bg-[#1a1a1a] border-4 border-[#fdfcfb]"><Camera className="w-7 h-7" /></button>
          </div>
          <NavItem tab={AppTab.SOMMELIER} icon={MessageSquare} label="Chat" />
          <button onClick={() => setShowMobileMenu(true)} className="flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors text-gray-400"><Menu className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-wider">Menu</span></button>
        </div>
      </nav>
    </div>
  );
};

export default App;
