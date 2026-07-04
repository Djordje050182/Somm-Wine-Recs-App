import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wine, Mic, Search, User, WifiOff, ShoppingBag,
  Compass, BookOpen, Route, Archive, ChevronDown, Building2, LogOut,
} from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCatalog } from '../contexts/CatalogContext';
import { calculateDistance } from '../services/geoUtils';
import RegionSwitcher from '../components/RegionSwitcher';
import GlobalSearch from '../components/GlobalSearch';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import { Winery } from '../types';

const AppShell: React.FC = () => {
  const { region, regionId } = useRegion();
  const { user, signOut } = useAuth();
  const { count, lastAddedAt, openCart, isCartOpen, closeCart } = useCart();
  const { wineries } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [nearbyWinery, setNearbyWinery] = useState<Winery | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);

  // "In your case" toast on cart adds
  useEffect(() => {
    if (!lastAddedAt) return;
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Are we standing in a vineyard right now?
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      let nearest: Winery | null = null;
      let minDistance = 1.5;
      wineries.forEach(w => {
        const dist = calculateDistance(latitude, longitude, w.lat, w.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = w;
        }
      });
      if (nearest) {
        setNearbyWinery(nearest);
        setShowLocationToast(true);
        setTimeout(() => setShowLocationToast(false), 8000);
      }
    }, () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate(`/${regionId}`);
  };

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `font-ui text-sm font-semibold tracking-wide transition-colors ${
      isActive ? 'text-claret' : 'text-ink/60 hover:text-claret'
    }`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
      isActive ? 'text-claret' : 'text-ink/40 hover:text-ink/70'
    }`;

  const userInitials = user
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink">
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] bg-ink text-parchment font-ui text-xs font-semibold uppercase tracking-kicker px-5 py-3 rounded-sm animate-slide-up">
          In your case
        </div>
      )}

      {showLocationToast && nearbyWinery && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] bg-paper border border-hairline px-5 py-3 rounded-sm animate-slide-up flex items-center gap-3">
          <Wine className="w-4 h-4 text-claret" />
          <p className="font-body text-sm text-ink">
            You appear to be at <span className="font-semibold">{nearbyWinery.name}</span>. Ask the Somm what to pour.
          </p>
        </div>
      )}

      {isOffline && (
        <div className="bg-ink text-parchment text-center font-ui text-xs py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" /> You're offline — your guide still works. Voice and fresh photos return with signal.
        </div>
      )}

      <header className="sticky top-0 z-50 bg-parchment border-b border-hairline px-4 md:px-6">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link to={`/${regionId}`} className="flex items-baseline gap-0.5 shrink-0 group">
            <span className="font-display font-semibold text-[26px] text-ink tracking-tight group-hover:text-claret transition-colors">Somm</span>
            <span className="font-display text-[30px] text-claret leading-none">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink to={`/${regionId}`} end className={desktopLink}>Home</NavLink>
            <NavLink to={`/${regionId}/guide`} className={desktopLink}>Guide</NavLink>
            <NavLink to={`/${regionId}/wines`} className={desktopLink}>Wines</NavLink>
            <NavLink to={`/${regionId}/plan`} className={desktopLink}>Plan</NavLink>
            <NavLink to={`/${regionId}/sommelier`} className={desktopLink}>Sommelier</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <RegionSwitcher />
            <button
              onClick={() => setShowSearch(true)}
              className="text-ink/60 hover:text-claret transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openCart}
              className="relative text-ink/60 hover:text-claret transition-colors"
              aria-label="Your case"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-claret text-parchment font-ui text-[9px] font-bold h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 group"
                  aria-label="Account"
                >
                  <span className="w-8 h-8 bg-claret text-parchment rounded-full flex items-center justify-center font-ui text-[11px] font-bold">
                    {userInitials}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink/40 group-hover:text-ink hidden sm:block" />
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-paper border border-hairline rounded-sm shadow-sm z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-hairline">
                        <p className="font-ui text-sm font-semibold text-ink truncate">{user.name}</p>
                        <p className="font-ui text-xs text-ink/40 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setShowUserMenu(false); navigate(`/${regionId}/cellar`); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-parchment transition-colors font-ui text-sm text-ink">
                          <Archive className="w-4 h-4 text-ink/40" /> My cellar
                        </button>
                        <button onClick={() => { setShowUserMenu(false); navigate(`/${regionId}/account`); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-parchment transition-colors font-ui text-sm text-ink">
                          <User className="w-4 h-4 text-ink/40" /> Account
                        </button>
                        {user.role === 'winery' && (
                          <button onClick={() => { setShowUserMenu(false); navigate(`/${regionId}/portal`); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-parchment transition-colors font-ui text-sm text-brass">
                            <Building2 className="w-4 h-4" /> Winery portal
                          </button>
                        )}
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-parchment transition-colors font-ui text-sm text-claret border-t border-hairline mt-1">
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Full button from sm up; a quiet icon on phones */}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:block font-ui text-sm font-semibold bg-claret text-parchment px-4 py-2 rounded-sm hover:bg-claret-deep transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="sm:hidden text-ink/60 hover:text-claret transition-colors"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pb-24 lg:pb-0">
        <Outlet />
      </main>

      <footer className="hidden lg:block border-t border-hairline mt-16">
        <div className="max-w-screen-xl mx-auto px-6 py-10 flex items-baseline justify-between">
          <div>
            <span className="font-display font-semibold text-xl text-ink">Somm</span>
            <span className="font-display text-2xl text-claret">.</span>
            <p className="font-body text-sm text-ink/40 mt-1">The world's great wine regions, walked properly.</p>
          </div>
          <p className="font-ui text-xs text-ink/30 uppercase tracking-kicker">{region.name} · est. edition</p>
        </div>
      </footer>

      {/* Mobile bottom nav — the Somm himself holds the centre seat */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper border-t border-hairline pb-safe">
        <div className="flex justify-between items-stretch h-16 max-w-lg mx-auto">
          <NavLink to={`/${regionId}`} end className={mobileLink}>
            <Compass className="w-5 h-5" />
            <span className="font-ui text-[9px] font-semibold uppercase tracking-kicker">Home</span>
          </NavLink>
          <NavLink to={`/${regionId}/guide`} className={mobileLink}>
            <BookOpen className="w-5 h-5" />
            <span className="font-ui text-[9px] font-semibold uppercase tracking-kicker">Guide</span>
          </NavLink>
          <div className="flex flex-col items-center justify-center px-1 gap-0.5">
            <button
              onClick={() => navigate(`/${regionId}/sommelier?talk=1`)}
              className="w-12 h-12 -mt-6 bg-claret text-parchment rounded-full flex items-center justify-center hover:bg-claret-deep transition-colors border-4 border-parchment shadow-sm"
              aria-label="Talk to the Somm"
            >
              <Mic className="w-5 h-5" />
            </button>
            <span className="font-ui text-[9px] font-semibold uppercase tracking-kicker text-claret -mt-0.5">Somm</span>
          </div>
          <NavLink to={`/${regionId}/plan`} className={mobileLink}>
            <Route className="w-5 h-5" />
            <span className="font-ui text-[9px] font-semibold uppercase tracking-kicker">Plan</span>
          </NavLink>
          <NavLink to={`/${regionId}/wines`} className={mobileLink}>
            <Wine className="w-5 h-5" />
            <span className="font-ui text-[9px] font-semibold uppercase tracking-kicker">Wines</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
