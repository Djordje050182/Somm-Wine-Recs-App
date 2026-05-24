
import React, { useState, useEffect } from 'react';
import { AppTab, AccountType } from './types';
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
import PartnerPortal from './components/PartnerPortal';
import CartDrawer from './components/CartDrawer';
import WhatsOn from './components/WhatsOn';
import CreativeCellar from './components/CreativeCellar';
import CellarTracker from './components/CellarTracker';
import AuthModal from './components/AuthModal';
import UserAccount from './components/UserAccount';
import { getCart } from './services/commerceService';
import { Wine, MessageSquare, Camera, Mic, Heart, Menu, X, BookOpen, Search, User, WifiOff, ShoppingBag, Calendar, Package, LogIn, Building2, ChevronDown } from 'lucide-react';
import { WINERIES } from './data/wineries';
import { calculateDistance } from './services/geoUtils';

interface AppUser {
  name: string;
  email: string;
  tier?: string;
  accountType?: AccountType;
  wineryId?: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DISCOVER);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Search & Cart
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [cartToast, setCartToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  // Location
  const [nearbyWinery, setNearbyWinery] = useState<any>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const updateCartCount = () => {
      const items = getCart();
      const newCount = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(prev => {
        if (newCount > prev) {
          setCartToast({ show: true, message: 'Added to Cellar' });
          setCartAnimating(true);
          setTimeout(() => setCartAnimating(false), 500);
          setTimeout(() => setCartToast({ show: false, message: '' }), 3000);
        }
        return newCount;
      });
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
  }, []);

  const checkUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        let nearest = null;
        let minDistance = 1.5;
        WINERIES.forEach(w => {
          const dist = calculateDistance(latitude, longitude, w.lat, w.lng);
          if (dist < minDistance) { minDistance = dist; nearest = w; }
        });
        if (nearest) { setNearbyWinery(nearest); setShowLocationToast(true); }
      });
    }
  };

  const handleLogin = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
    // If estate owner, go to partner portal
    if (userData.accountType === 'estate_owner') {
      handleNav(AppTab.PARTNERS);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowUserMenu(false);
    handleNav(AppTab.DISCOVER);
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
      case AppTab.ACCOUNT: return <UserAccount user={user} onLogout={handleLogout} onNavigateToPortal={() => handleNav(AppTab.PARTNERS)} />;
      default: return <Discover onNavigate={handleNav} />;
    }
  };

  const handleNav = (tab: AppTab) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
    setShowUserMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab; icon: any; label: string }) => (
    <button
      onClick={() => handleNav(tab)}
      className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors ${activeTab === tab ? 'text-[#6b1e2e]' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcfb] text-[#1a1a1a]">
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />

      {/* Cart toast */}
      {cartToast.show && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] bg-[#1a1a1a] text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4">
          {cartToast.message}
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e1da] px-4 md:px-6 py-3 flex items-center justify-between transition-all">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => handleNav(AppTab.DISCOVER)}>
          <div className="bg-[#1a1a1a] p-2 rounded-xl text-white group-hover:scale-105 transition-transform shadow-lg">
            <Wine className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-[#1a1a1a] font-serif">Somm<span className="text-[#a68d60] text-3xl">.</span></h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-7 text-sm font-bold tracking-wide">
          <button onClick={() => handleNav(AppTab.DISCOVER)} className={`${activeTab === AppTab.DISCOVER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Discover</button>
          <button onClick={() => handleNav(AppTab.WINES)} className={`${activeTab === AppTab.WINES ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Library</button>
          <button onClick={() => handleNav(AppTab.PLANNER)} className={`${activeTab === AppTab.PLANNER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Map & Plan</button>
          <button onClick={() => handleNav(AppTab.CONCIERGE)} className={`${activeTab === AppTab.CONCIERGE ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Concierge</button>
          <button onClick={() => handleNav(AppTab.SOMMELIER)} className={`${activeTab === AppTab.SOMMELIER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>AI Sommelier</button>
          <button onClick={() => handleNav(AppTab.CELLAR)} className={`flex items-center gap-1 ${activeTab === AppTab.CELLAR ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>
            <Package className="w-4 h-4" /> My Cellar
          </button>
        </div>

        {/* Right actions */}
        <div className="flex gap-2 items-center shrink-0">
          <button onClick={() => setShowSearch(true)} className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCart(true)}
            className={`relative w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#6b1e2e] transition-all ${cartAnimating ? 'scale-125 bg-green-50' : ''}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#a68d60] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</div>
            )}
          </button>

          {/* User / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-[#1a1a1a] text-white pl-1.5 pr-3 py-1.5 rounded-full font-bold text-sm hover:bg-black transition-all"
              >
                <div className="w-7 h-7 bg-[#a68d60] rounded-full flex items-center justify-center text-white text-xs font-black">
                  {userInitials}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#e5e1da] z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-gray-50">
                      <p className="font-bold text-sm text-[#1a1a1a] truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => handleNav(AppTab.ACCOUNT)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[#f8f4f0] transition-colors text-sm font-bold text-[#1a1a1a]">
                        <User className="w-4 h-4 text-gray-400" /> My Account
                      </button>
                      <button onClick={() => handleNav(AppTab.FAVORITES)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[#f8f4f0] transition-colors text-sm font-bold text-[#1a1a1a]">
                        <Heart className="w-4 h-4 text-gray-400" /> Favourites
                      </button>
                      {user.accountType === 'estate_owner' && (
                        <button onClick={() => handleNav(AppTab.PARTNERS)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[#f8f4f0] transition-colors text-sm font-bold text-[#a68d60]">
                          <Building2 className="w-4 h-4" /> Partner Portal
                        </button>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold text-red-500">
                        <LogIn className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#1a1a1a] text-white hover:bg-black transition-all shadow-lg"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            onClick={() => handleNav(AppTab.LIVE)}
            disabled={isOffline}
            className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full text-sm font-bold transition-all shadow-lg ${isOffline ? 'bg-gray-300 text-gray-500' : 'bg-[#6b1e2e] text-white hover:bg-[#852539] active:scale-95'}`}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#f4c88a]" />}
            <span className="hidden sm:inline">Live</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e5e1da] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex justify-between items-end h-20 px-4 max-w-lg mx-auto pb-1">
          <NavItem tab={AppTab.DISCOVER} icon={Search} label="Discover" />
          <NavItem tab={AppTab.CELLAR} icon={Package} label="Cellar" />
          <div className="relative -top-6 mx-2">
            <button onClick={() => handleNav(AppTab.SCANNER)} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/30 active:scale-95 bg-[#1a1a1a] border-4 border-[#fdfcfb]">
              <Camera className="w-7 h-7" />
            </button>
          </div>
          <NavItem tab={AppTab.SOMMELIER} icon={MessageSquare} label="Chat" />
          <button
            onClick={() => user ? handleNav(AppTab.ACCOUNT) : setShowAuthModal(true)}
            className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors ${activeTab === AppTab.ACCOUNT ? 'text-[#6b1e2e]' : 'text-gray-400'}`}
          >
            {user ? (
              <div className="w-6 h-6 bg-[#a68d60] rounded-full flex items-center justify-center text-white text-[9px] font-black">{userInitials}</div>
            ) : (
              <User className="w-6 h-6" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">{user ? 'Account' : 'Sign In'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
