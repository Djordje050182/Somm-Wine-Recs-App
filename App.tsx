
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
import { getCart } from './services/commerceService';
import { Wine, MessageSquare, Camera, Map as MapIcon, Mic, Sparkles, Heart, Menu, X, BookOpen, Globe, Search, User, LogIn, LogOut, Compass, WifiOff, Check, Cloud, Smartphone, Zap, MapPin, Navigation, Building2, ShoppingBag, Calendar } from 'lucide-react';
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
        
        // Show toast if count increased
        if (newCount > cartCount) {
            setCartToast({ show: true, message: 'Added to Cellar' });
            setCartAnimating(true);
            setTimeout(() => setCartAnimating(false), 500); // Remove animation class
            setTimeout(() => setCartToast({ show: false, message: '' }), 3000);
        }
        setCartCount(newCount);
    };
    // Initial load
    const items = getCart();
    setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));

    // Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setShowSearch(true);
        }
    };
    
    // Cart Listener
    window.addEventListener('somm-cart-update', updateCartCount);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleKeyDown);

    // Initial Location Check
    checkUserLocation();

    return () => {
      window.removeEventListener('somm-cart-update', updateCartCount);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartCount]);

  const checkUserLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  // Find nearest winery within 1.5km
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
              },
              (error) => {
                  console.log("Location access denied or unavailable");
              }
          );
      }
  };

  const login = () => {
      // Mock Login with a Premium User Persona
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
      case AppTab.SOMMELIER: return <SommelierChat user={user} />;
      case AppTab.REGIONS: return <RegionExplorer />;
      case AppTab.EXPERIENCES: return <Experiences />;
      case AppTab.LIVE: return <LiveSommelier />;
      case AppTab.WINES: return <WineLibrary />;
      case AppTab.FAVORITES: return <Favorites user={user} />;
      case AppTab.PARTNERS: return <PartnerPortal />;
      case AppTab.EVENTS: return <WhatsOn />;
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
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-[#1a1a1a] text-[#a68d60] px-4 py-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="w-4 h-4" />
          Vintage Mode (Offline) • Maps & Library Available
        </div>
      )}

      {/* Global Components */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
      
      {/* Cart Toast */}
      {cartToast.show && (
          <div className="fixed top-24 right-4 z-[80] bg-[#1a1a1a] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
              <div className="bg-green-500 rounded-full p-1"><Check className="w-3 h-3" /></div>
              <span className="font-bold text-sm">{cartToast.message}</span>
          </div>
      )}

      {/* Nearby Winery Guide Modal */}
      {viewingNearbyGuide && nearbyWinery && (
          <GuideModal 
            item={nearbyWinery} 
            type="winery" 
            onClose={() => setViewingNearbyGuide(false)} 
          />
      )}

      {/* Location Toast Notification */}
      {showLocationToast && nearbyWinery && (
          <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[70] max-w-sm w-full animate-in slide-in-from-bottom duration-500">
              <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e1da] overflow-hidden p-1">
                  <div className="relative">
                       <div className="absolute top-2 right-2 z-10">
                           <button onClick={() => setShowLocationToast(false)} className="bg-black/20 hover:bg-black/40 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                       </div>
                       <img src={nearbyWinery.image} className="w-full h-32 object-cover rounded-xl" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex items-end p-4">
                           <div className="text-white">
                               <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-[#6b1e2e] w-fit px-2 py-0.5 rounded mb-1 animate-pulse">
                                   <MapPin className="w-3 h-3" /> You are here
                               </div>
                               <h3 className="font-bold text-lg">{nearbyWinery.name}</h3>
                           </div>
                       </div>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                       <button 
                        onClick={() => { setViewingNearbyGuide(true); }}
                        className="bg-[#1a1a1a] text-white py-2 rounded-lg text-xs font-bold"
                       >
                           View Guide
                       </button>
                       <button 
                        onClick={() => { setShowLocationToast(false); handleNav(AppTab.SCANNER); }}
                        className="bg-[#f8f4f0] text-[#6b1e2e] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                       >
                           <Camera className="w-3 h-3" /> Open Scanner
                       </button>
                  </div>
              </div>
          </div>
      )}

      {/* Desktop Header (Visible only on Large Screens > 1024px) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e1da] px-4 md:px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => handleNav(AppTab.DISCOVER)}>
          <div className="bg-[#1a1a1a] p-2 md:p-2.5 rounded-xl text-white group-hover:scale-105 transition-transform shadow-lg">
            <Wine className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1a1a1a] font-serif">Somm<span className="text-[#a68d60] text-3xl md:text-4xl">.</span></h1>
        </div>
        
        <div className="hidden xl:flex items-center gap-8 text-sm font-bold tracking-wide">
          <button onClick={() => handleNav(AppTab.DISCOVER)} className={`${activeTab === AppTab.DISCOVER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Discover</button>
          <button onClick={() => handleNav(AppTab.EVENTS)} className={`flex items-center gap-1 ${activeTab === AppTab.EVENTS ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>
            <Calendar className="w-4 h-4" /> What's On
          </button>
          <button onClick={() => handleNav(AppTab.WINES)} className={`${activeTab === AppTab.WINES ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Library</button>
          <button onClick={() => handleNav(AppTab.PLANNER)} className={`${activeTab === AppTab.PLANNER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>Map & Plan</button>
          <button onClick={() => handleNav(AppTab.SCANNER)} className={`flex items-center gap-1 ${activeTab === AppTab.SCANNER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>
            <Camera className="w-4 h-4" /> Scanner
          </button>
          <button onClick={() => handleNav(AppTab.SOMMELIER)} className={`${activeTab === AppTab.SOMMELIER ? 'text-[#6b1e2e]' : 'text-gray-500'} hover:text-[#6b1e2e] transition-colors`}>AI Chat</button>
        </div>

        <div className="flex gap-2 md:gap-3 items-center shrink-0">
           {/* Global Search Button */}
           <button 
             onClick={() => setShowSearch(true)}
             className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
             title="Search (Cmd+K)"
           >
             <Search className="w-5 h-5" />
           </button>

           {/* CART BUTTON */}
           <button 
             onClick={() => setShowCart(true)}
             className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#6b1e2e] transition-all mr-1 md:mr-2 ${cartAnimating ? 'scale-125 bg-green-50' : ''}`}
           >
             <ShoppingBag className={`w-5 h-5 ${cartAnimating ? 'text-green-600' : ''}`} />
             {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-[#a68d60] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                </div>
             )}
           </button>

           {user ? (
               <div className="flex items-center gap-3 mr-1 md:mr-2">
                   <div className="text-right hidden sm:block">
                       <div className="text-xs font-bold text-[#1a1a1a]">{user.name}</div>
                       <div className="text-[10px] text-[#a68d60] font-black uppercase tracking-wider">{user.tier || 'Member'}</div>
                   </div>
                   <button onClick={logout} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><LogOut className="w-4 h-4"/></button>
               </div>
           ) : (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:bg-[#f8f4f0] px-3 py-2 md:px-4 md:py-2 rounded-full transition-colors"
                    >
                        <LogIn className="w-4 h-4" /> <span className="hidden sm:inline">Log In</span>
                    </button>
                </div>
           )}

           <button 
            onClick={() => handleNav(AppTab.FAVORITES)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-[#e5e1da] text-[#1a1a1a] hover:bg-[#f8f4f0] transition-all"
          >
            <Heart className={`w-5 h-5 ${activeTab === AppTab.FAVORITES ? 'fill-[#6b1e2e]' : ''}`} />
          </button>
          <button 
            onClick={() => handleNav(AppTab.LIVE)}
            disabled={isOffline}
            className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold transition-all shadow-lg border border-white/10 ${isOffline ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-black active:scale-95 shadow-black/10'}`}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#a68d60]" />}
            <span className="hidden sm:inline">Live Mode</span>
            <span className="sm:hidden">Live</span>
          </button>
        </div>
      </header>

      {/* Main Content with Padding for Bottom Nav */}
      <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
        {renderContent()}
      </main>

      {/* Auth Modal & Mobile Menu code remains consistent with existing */}
      {/* ... [Rest of Auth and Mobile Menu code is preserved from previous context, just ensuring it compiles] ... */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-4xl rounded-3xl p-8 md:p-12 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 z-10"><X className="w-6 h-6"/></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                          <div>
                              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3">
                                  <Wine className="w-8 h-8"/>
                              </div>
                              <h3 className="text-4xl font-black font-serif text-[#1a1a1a] mb-2">Somm.</h3>
                              <p className="text-gray-500 font-medium">Your personal AI sommelier and cellar companion.</p>
                          </div>
                          <div className="p-6 bg-[#f8f4f0] rounded-2xl border border-[#e5e1da]">
                             <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-gray-400" />
                                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-sm">Continue as Guest</h4>
                             </div>
                             <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> Instant Access</li>
                                <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> Local Device Storage</li>
                             </ul>
                             <button onClick={login} className="w-full bg-white border border-[#e5e1da] text-[#1a1a1a] py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">Try as Guest</button>
                          </div>
                      </div>
                      <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#6b1e2e]/5 to-[#a68d60]/5 rounded-2xl -m-4"></div>
                          <div className="relative space-y-8">
                             <div>
                                <h3 className="text-2xl font-bold text-[#6b1e2e] mb-2 font-serif italic">Unlock the Cellar</h3>
                                <p className="text-gray-600 text-sm">Create a free account to sync your palate profile.</p>
                             </div>
                             <button onClick={login} className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-xl">
                                <Sparkles className="w-4 h-4 text-[#a68d60]" /> Sign In / Sign Up
                             </button>
                             <div className="pt-4 border-t border-[#e5e1da] text-center">
                                <button onClick={() => { setShowAuthModal(false); handleNav(AppTab.PARTNERS); }} className="text-xs text-gray-400 hover:text-[#6b1e2e] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                    <Building2 className="w-3 h-3" /> Partner Access
                                </button>
                             </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] flex justify-end lg:hidden">
           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowMobileMenu(false)} />
           <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-y-auto">
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                 <div className="flex items-center gap-2"><div className="bg-[#1a1a1a] p-1.5 rounded-lg text-white"><Wine className="w-5 h-5" /></div><span className="font-serif font-black text-xl">Somm.</span></div>
                 <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-gray-5 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 p-6 space-y-8">
                 <div className="space-y-3">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">AI Planning</h4>
                     <button disabled={isOffline} onClick={() => handleNav(AppTab.CONCIERGE)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === AppTab.CONCIERGE ? 'bg-[#f8f4f0] text-[#6b1e2e]' : 'hover:bg-gray-50 text-gray-700'}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === AppTab.CONCIERGE ? 'bg-[#a68d60]/20 text-[#a68d60]' : 'bg-gray-100 text-gray-500'}`}><Sparkles className="w-4 h-4" /></div><span className="font-bold">AI Concierge</span>
                     </button>
                     <button onClick={() => handleNav(AppTab.PLANNER)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === AppTab.PLANNER ? 'bg-[#f8f4f0] text-[#6b1e2e]' : 'hover:bg-gray-50 text-gray-700'}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === AppTab.PLANNER ? 'bg-[#a68d60]/20 text-[#a68d60]' : 'bg-gray-100 text-gray-500'}`}><MapIcon className="w-4 h-4" /></div><span className="font-bold">Map & Plan</span>
                     </button>
                 </div>
                 <div className="space-y-3">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Explore</h4>
                     <button onClick={() => handleNav(AppTab.EVENTS)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Calendar className="w-5 h-5 opacity-70" /><span className="font-medium">What's On</span></button>
                     <button onClick={() => handleNav(AppTab.WINES)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><BookOpen className="w-5 h-5 opacity-70" /><span className="font-medium">Wine Library</span></button>
                     <button onClick={() => handleNav(AppTab.REGIONS)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Globe className="w-5 h-5 opacity-70" /><span className="font-medium">Region Guide</span></button>
                 </div>
                 <div className="space-y-3">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Personal</h4>
                     <button onClick={() => {setShowCart(true); setShowMobileMenu(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><ShoppingBag className="w-5 h-5 opacity-70" /><span className="font-medium">My Cart</span></button>
                     <button onClick={() => handleNav(AppTab.FAVORITES)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Heart className="w-5 h-5 opacity-70" /><span className="font-medium">My Cellar</span></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REFACTORED MOBILE/TABLET BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e5e1da] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex justify-between items-end h-20 px-4 max-w-lg mx-auto pb-1">
          <NavItem tab={AppTab.DISCOVER} icon={Search} label="Discover" />
          <NavItem tab={AppTab.EVENTS} icon={Calendar} label="Events" />
          
          {/* Main Action Button (Scanner) - Centered & Floating */}
          <div className="relative -top-6 mx-2">
            <button 
              onClick={() => handleNav(AppTab.SCANNER)}
              disabled={isOffline}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/30 active:scale-95 transition-transform border-4 border-[#fdfcfb] ${isOffline ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1a1a1a]'}`}
            >
              <Camera className="w-7 h-7" />
            </button>
          </div>

          <NavItem tab={AppTab.SOMMELIER} icon={MessageSquare} label="AI Chat" />
          
          <button 
            onClick={() => setShowMobileMenu(true)} 
            className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors ${showMobileMenu ? 'text-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
