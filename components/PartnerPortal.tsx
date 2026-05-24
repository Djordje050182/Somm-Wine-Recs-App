
import React, { useState, useEffect } from 'react';
import { WINERIES, WINES } from '../data/wineries';
import { Wine, Building2, BarChart3, Settings, LogOut, Save, Star, TrendingUp, Users, MousePointerClick, Lock, CheckCircle, CreditCard, Sparkles, DollarSign, Tag, Menu, X, Loader2, Plus, Trash2, Edit3, Package, Award, Zap, Shield, ChevronRight, Eye, Heart, ShoppingBag, Clock } from 'lucide-react';
import { getProductOffer, setProductOffer } from '../services/commerceService';

type Section = 'dashboard' | 'profile' | 'catalogue' | 'commerce' | 'orders' | 'membership';

const TIER_CONFIG = {
  Free: {
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    features: ['Basic winery listing', 'Up to 5 wines in catalogue', 'Standard search placement', 'Basic analytics'],
    missing: ['AI-powered recommendations', 'Featured placement in Discover', 'Analytics deep-dive', 'Priority support', 'Custom promotional banners'],
    price: 'Free',
  },
  Standard: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    features: ['Everything in Free', 'Up to 20 wines in catalogue', 'Priority search placement', 'Full analytics dashboard', 'Sale & offer tools'],
    missing: ['Featured homepage placement', 'AI-powered recommendations', 'Custom banners'],
    price: '$49/mo',
  },
  Premium: {
    color: 'text-[#a68d60]',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    features: ['Everything in Standard', 'Unlimited wines', 'Featured placement in Discover + AI chat', 'AI-curated recommendations', 'Custom promotional banners', 'Dedicated account manager', 'Priority support'],
    missing: [],
    price: '$149/mo',
  },
};

const PartnerPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedWineryId, setSelectedWineryId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [wineryWines, setWineryWines] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tier, setTier] = useState<'Free' | 'Standard' | 'Premium'>('Free');

  // Catalogue editing
  const [editingWine, setEditingWine] = useState<any>(null);
  const [showAddWine, setShowAddWine] = useState(false);
  const [newWine, setNewWine] = useState({ name: '', variety: '', vintage: '', price: '', description: '' });

  useEffect(() => {
    const savedAuth = localStorage.getItem('partnerAuth');
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      const winery = WINERIES.find(w => w.id === auth.wineryId);
      if (winery) {
        setSelectedWineryId(auth.wineryId);
        setFormData({ ...winery });
        setIsLoggedIn(true);
        setTier(auth.tier || 'Free');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && selectedWineryId) {
      const wines = WINES.filter(w => w.wineryId === selectedWineryId).map(w => {
        const offer = getProductOffer(w.id);
        return { ...w, offerPrice: offer?.salePrice || '', isOnSale: offer?.isOnSale || false };
      });
      // Merge custom wines
      const custom = JSON.parse(localStorage.getItem(`customWines_${selectedWineryId}`) || '[]');
      setWineryWines([...wines, ...custom]);
    }
  }, [isLoggedIn, selectedWineryId]);

  const handleLogin = () => {
    if (email && password && selectedWineryId) {
      const winery = WINERIES.find(w => w.id === selectedWineryId);
      setFormData({ ...winery });
      setIsLoggedIn(true);
      localStorage.setItem('partnerAuth', JSON.stringify({ wineryId: selectedWineryId, email, tier: 'Free' }));
    } else {
      alert('Please select your winery and enter credentials (demo: any email + password).');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('partnerAuth');
    setEmail(''); setPassword('');
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleOfferUpdate = (wineId: string, field: string, value: any) => {
    setWineryWines(prev => prev.map(w => w.id === wineId ? { ...w, [field]: value } : w));
  };

  const saveOffers = () => {
    setIsSaving(true);
    setTimeout(() => {
      wineryWines.forEach(w => {
        setProductOffer(w.id, w.isOnSale && w.offerPrice ? { salePrice: Number(w.offerPrice), isOnSale: true } : { isOnSale: false });
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleAddWine = () => {
    if (!newWine.name || !newWine.variety) { alert('Wine name and variety are required.'); return; }
    const customId = `custom_${selectedWineryId}_${Date.now()}`;
    const wine = { ...newWine, id: customId, wineryId: selectedWineryId, rating: 4.0, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800', pairings: [], aiTake: '', isCustom: true, offerPrice: '', isOnSale: false };
    const updated = [...wineryWines, wine];
    setWineryWines(updated);
    const custom = updated.filter((w: any) => w.isCustom);
    localStorage.setItem(`customWines_${selectedWineryId}`, JSON.stringify(custom));
    setNewWine({ name: '', variety: '', vintage: '', price: '', description: '' });
    setShowAddWine(false);
  };

  const handleDeleteWine = (id: string) => {
    const updated = wineryWines.filter(w => w.id !== id);
    setWineryWines(updated);
    const custom = updated.filter((w: any) => w.isCustom);
    localStorage.setItem(`customWines_${selectedWineryId}`, JSON.stringify(custom));
  };

  const mockOrders = [
    { id: 'A3B2F1', date: '22 May 2026', customer: 'Sarah M.', items: 'Vat 1 Semillon ×2', total: 190, status: 'Confirmed' },
    { id: 'C9D4E8', date: '18 May 2026', customer: 'James K.', items: 'Graveyard Shiraz ×1', total: 350, status: 'Shipped' },
    { id: 'F7G2H5', date: '12 May 2026', customer: 'Emily R.', items: 'Yellow Label Chardonnay ×3', total: 105, status: 'Delivered' },
  ];

  const NavItem = ({ section, icon: Icon, label }: { section: Section; icon: any; label: string }) => (
    <button
      onClick={() => { setActiveSection(section); setShowMobileSidebar(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-bold ${activeSection === section ? 'bg-[#6b1e2e] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon className="w-4 h-4 shrink-0" /> {label}
    </button>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f4f0] flex items-center justify-center p-4">
        <div className="bg-white max-w-4xl w-full rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12 bg-[#1a1a1a] text-white p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6b1e2e] rounded-full blur-[80px] opacity-40 -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur">
                <Building2 className="w-6 h-6 text-[#a68d60]" />
              </div>
              <h2 className="text-4xl font-serif font-bold mb-4">Partner Portal</h2>
              <p className="text-white/60 leading-relaxed text-sm">Manage your digital cellar door, update your wine catalogue, and connect with premium travellers across the Hunter Valley.</p>
            </div>
            <div className="relative z-10 space-y-3">
              {['Manage your wine catalogue', 'Set sale prices & offers', 'Track orders & analytics', 'Featured placement options'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-[#a68d60] shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-7/12 p-10">
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-8 font-serif">Owner Sign In</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Your Winery</label>
                <select className="w-full bg-[#f8f4f0] p-4 rounded-xl font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" onChange={e => setSelectedWineryId(Number(e.target.value))} value={selectedWineryId || ''}>
                  <option value="" disabled>Choose Estate...</option>
                  {WINERIES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-[#e5e1da] p-4 rounded-xl focus:outline-none focus:border-[#6b1e2e]" placeholder="owner@estate.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-[#e5e1da] p-4 rounded-xl focus:outline-none focus:border-[#6b1e2e]" placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button onClick={handleLogin} className="w-full bg-[#6b1e2e] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#852539] transition-all">
                Access Dashboard
              </button>
              <p className="text-center text-xs text-gray-400">Not listed? <a href="#" className="underline text-[#6b1e2e] font-bold">Apply to join Somm.</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tc = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Wine className="w-5 h-5 text-[#a68d60]" />
          <span className="font-serif font-bold text-lg">Somm. Partner</span>
        </div>
        <button onClick={() => setShowMobileSidebar(!showMobileSidebar)}>
          {showMobileSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`bg-[#1a1a1a] text-white flex-col fixed h-full z-20 w-64 transition-transform duration-300 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}>
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="w-5 h-5 text-[#a68d60]" />
            <span className="font-serif font-bold text-lg">Somm. Partner</span>
          </div>
        </div>
        <div className="px-4 pb-4 md:pt-0">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <img src={formData.image} className="w-10 h-10 rounded-full object-cover shrink-0" alt={formData.name} />
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{formData.name}</div>
              <div className={`text-[10px] uppercase tracking-wider font-bold ${tc.color}`}>{tier} Tier</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem section="dashboard" icon={BarChart3} label="Dashboard" />
          <NavItem section="profile" icon={Building2} label="Winery Profile" />
          <NavItem section="catalogue" icon={Wine} label="Wine Catalogue" />
          <NavItem section="commerce" icon={DollarSign} label="Offers & Pricing" />
          <NavItem section="orders" icon={Package} label="Orders" />
          <NavItem section="membership" icon={Award} label="Membership" />
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1a1a]">
              {activeSection === 'dashboard' && 'Performance Overview'}
              {activeSection === 'profile' && 'Winery Profile'}
              {activeSection === 'catalogue' && 'Wine Catalogue'}
              {activeSection === 'commerce' && 'Offers & Pricing'}
              {activeSection === 'orders' && 'Order Inbox'}
              {activeSection === 'membership' && 'Membership & Billing'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeSection === 'dashboard' && 'Last 30 days performance'}
              {activeSection === 'profile' && 'Update your public listing and AI profile'}
              {activeSection === 'catalogue' && `${wineryWines.length} wine${wineryWines.length !== 1 ? 's' : ''} in your catalogue`}
              {activeSection === 'commerce' && 'Set sale prices that appear live in the app'}
              {activeSection === 'orders' && 'Manage incoming orders from guests'}
              {activeSection === 'membership' && `Currently on ${tier} plan`}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold animate-in fade-in">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
            {activeSection === 'profile' && (
              <button onClick={handleSave} disabled={isSaving} className="bg-[#6b1e2e] text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#852539] transition-all disabled:opacity-70">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            {activeSection === 'commerce' && (
              <button onClick={saveOffers} disabled={isSaving} className="bg-[#a68d60] text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#8e7850] transition-all disabled:opacity-70">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                {isSaving ? 'Updating...' : 'Update Live Offers'}
              </button>
            )}
          </div>
        </div>

        {/* === DASHBOARD === */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Profile Views', value: '2,845', change: '+12%', icon: Eye, color: 'bg-blue-50 text-blue-600' },
                { label: 'AI Recommendations', value: '856', change: '+24%', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
                { label: 'Booking Clicks', value: '142', change: '+5%', icon: MousePointerClick, color: 'bg-amber-50 text-amber-600' },
                { label: 'Saved by Guests', value: '67', change: '+18%', icon: Heart, color: 'bg-pink-50 text-pink-600' },
              ].map(({ label, value, change, icon: Icon, color }) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-[#e5e1da] shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">{change}</span>
                  </div>
                  <div className="text-2xl font-black text-[#1a1a1a]">{value}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-3xl border border-[#e5e1da] shadow-sm flex flex-col justify-center items-center h-56 text-gray-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white pointer-events-none" />
              <TrendingUp className="w-10 h-10 mb-3 opacity-20 relative z-10" />
              <p className="font-medium relative z-10">Engagement Analytics</p>
              <p className="text-sm mt-1 relative z-10">30-day trend chart</p>
              {tier === 'Free' && (
                <button onClick={() => setActiveSection('membership')} className="mt-4 flex items-center gap-1.5 text-[#6b1e2e] font-bold text-sm underline relative z-10">
                  <Lock className="w-3.5 h-3.5" /> Upgrade to Standard to unlock
                </button>
              )}
            </div>
            <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6">
              <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#a68d60]" /> Recent Orders</h3>
              <div className="space-y-3">
                {mockOrders.slice(0, 2).map(o => (
                  <div key={o.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f8f4f0] transition-colors">
                    <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#a68d60]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1a1a1a]">{o.customer} — {o.items}</p>
                      <p className="text-xs text-gray-400">{o.date}</p>
                    </div>
                    <span className="font-bold text-sm">${o.total}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Shipped' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveSection('orders')} className="mt-4 text-sm font-bold text-[#6b1e2e] flex items-center gap-1 hover:underline">
                View all orders <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* === PROFILE === */}
        {activeSection === 'profile' && (
          <div className="space-y-6 animate-in fade-in max-w-3xl">
            <div className="bg-white p-7 rounded-3xl border border-[#e5e1da] shadow-sm">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#a68d60]" /> General Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Winery Name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Website</label>
                  <input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Opens</label>
                  <input value={formData.opens} onChange={e => setFormData({ ...formData, opens: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="10:00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Closes</label>
                  <input value={formData.closes} onChange={e => setFormData({ ...formData, closes: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="17:00" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">AI Highlight (shown in Sommelier chat)</label>
                  <textarea value={formData.aiTake || ''} onChange={e => setFormData({ ...formData, aiTake: e.target.value })} className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="A short, enticing 1–2 sentence description that the AI uses when recommending your estate..." />
                </div>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-[#e5e1da] shadow-sm">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Settings className="w-5 h-5 text-[#a68d60]" /> Features & Policies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'hasRestaurant', label: 'Restaurant' },
                  { key: 'bookingRequired', label: 'Booking Required' },
                  { key: 'kidFriendly', label: 'Kid Friendly' },
                  { key: 'dogFriendly', label: 'Dog Friendly' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-bold ${formData[key] ? 'border-[#6b1e2e] bg-[#6b1e2e]/5 text-[#6b1e2e]' : 'border-gray-100 text-gray-400'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData[key] ? 'border-[#6b1e2e] bg-[#6b1e2e]' : 'border-gray-300'}`}>
                      {formData[key] && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === CATALOGUE === */}
        {activeSection === 'catalogue' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{wineryWines.length} wine{wineryWines.length !== 1 ? 's' : ''} listed</p>
              <button
                onClick={() => setShowAddWine(!showAddWine)}
                className="flex items-center gap-2 bg-[#6b1e2e] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#852539] transition-all"
              >
                <Plus className="w-4 h-4" /> Add Wine
              </button>
            </div>

            {/* Add wine form */}
            {showAddWine && (
              <div className="bg-white border-2 border-[#6b1e2e]/20 rounded-2xl p-6 space-y-4 animate-in fade-in">
                <h3 className="font-bold text-[#1a1a1a]">New Wine Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Wine Name *</label>
                    <input value={newWine.name} onChange={e => setNewWine({ ...newWine, name: e.target.value })} className="w-full bg-[#f8f4f0] p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Reserve Shiraz 2022" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Variety *</label>
                    <input value={newWine.variety} onChange={e => setNewWine({ ...newWine, variety: e.target.value })} className="w-full bg-[#f8f4f0] p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Shiraz" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Vintage</label>
                    <input value={newWine.vintage} onChange={e => setNewWine({ ...newWine, vintage: e.target.value })} className="w-full bg-[#f8f4f0] p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="2022" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Price (AUD)</label>
                    <input value={newWine.price} onChange={e => setNewWine({ ...newWine, price: e.target.value })} className="w-full bg-[#f8f4f0] p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="$55" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Description</label>
                    <textarea value={newWine.description} onChange={e => setNewWine({ ...newWine, description: e.target.value })} className="w-full bg-[#f8f4f0] p-3 rounded-xl font-medium h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Describe this wine..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddWine} className="flex-1 bg-[#6b1e2e] text-white py-3 rounded-xl font-bold hover:bg-[#852539] transition-all">Add to Catalogue</button>
                  <button onClick={() => setShowAddWine(false)} className="px-6 py-3 rounded-xl font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </div>
            )}

            {/* Wine list */}
            <div className="space-y-3">
              {wineryWines.length === 0 ? (
                <div className="bg-white border border-[#e5e1da] rounded-2xl p-10 text-center text-gray-400">
                  <Wine className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No wines in your catalogue yet.</p>
                  <p className="text-sm mt-1">Click "Add Wine" to get started.</p>
                </div>
              ) : wineryWines.map(w => (
                <div key={w.id} className="bg-white border border-[#e5e1da] rounded-2xl overflow-hidden shadow-sm flex group">
                  <img src={w.image} className="w-20 h-20 object-cover shrink-0" alt={w.name} />
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-[#1a1a1a] truncate">{w.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{w.variety}{w.vintage ? ` · ${w.vintage}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-[#6b1e2e] text-sm">{w.price || '—'}</span>
                        {(w as any).isCustom && (
                          <button onClick={() => handleDeleteWine(w.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {w.isOnSale && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Sale Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === COMMERCE === */}
        {activeSection === 'commerce' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-[#1a1a1a]">Manage Pricing & Sale Offers</h2>
                <p className="text-sm text-gray-400 mt-1">Toggle a sale and enter an offer price — it goes live in the Wine Library immediately.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px]">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-[#fdfcfb]">
                      <th className="py-3 pl-6">Wine</th>
                      <th className="py-3">RRP</th>
                      <th className="py-3">Sale Price</th>
                      <th className="py-3 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {wineryWines.map(w => (
                      <tr key={w.id} className="hover:bg-[#f8f4f0] transition-colors">
                        <td className="py-4 pl-6">
                          <div className="font-bold text-sm text-[#1a1a1a]">{w.name}</div>
                          <div className="text-xs text-gray-400">{w.variety}{w.vintage ? ` · ${w.vintage}` : ''}</div>
                        </td>
                        <td className="py-4 font-medium text-gray-600 text-sm">{w.price || '—'}</td>
                        <td className="py-4">
                          <div className="relative max-w-[110px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input type="number" value={w.offerPrice} onChange={e => handleOfferUpdate(w.id, 'offerPrice', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-6 pr-2 text-sm font-bold focus:outline-none focus:border-[#6b1e2e]" placeholder="—" />
                          </div>
                        </td>
                        <td className="py-4 pr-6">
                          <button onClick={() => handleOfferUpdate(w.id, 'isOnSale', !w.isOnSale)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${w.isOnSale ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            {w.isOnSale ? '● Active' : 'Off'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === ORDERS === */}
        {activeSection === 'orders' && (
          <div className="space-y-4 animate-in fade-in">
            {mockOrders.map(o => (
              <div key={o.id} className="bg-white border border-[#e5e1da] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-black text-[#1a1a1a] font-mono">#{o.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.date} · {o.customer}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Shipped' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-sm text-gray-600">{o.items}</p>
                  <p className="font-black text-[#1a1a1a]">${o.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === MEMBERSHIP === */}
        {activeSection === 'membership' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Current plan */}
            <div className={`rounded-3xl border-2 ${tc.border} ${tc.bg} p-7`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${tc.badge}`}>{tier}</span>
                  <h2 className="text-2xl font-black text-[#1a1a1a] mt-2">{TIER_CONFIG[tier].price}<span className="text-sm font-medium text-gray-400"> /month</span></h2>
                </div>
                {tier !== 'Free' && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Next billing</p>
                    <p className="font-bold text-sm">24 Jun 2026</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {TIER_CONFIG[tier].features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['Free', 'Standard', 'Premium'] as const).map(t => {
                const config = TIER_CONFIG[t];
                const isCurrent = t === tier;
                return (
                  <div key={t} className={`bg-white rounded-2xl border-2 p-6 relative transition-all ${isCurrent ? `${config.border} shadow-md` : 'border-gray-100 hover:border-gray-200'} ${t === 'Premium' ? 'md:scale-[1.02]' : ''}`}>
                    {t === 'Premium' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a68d60] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3 ${config.badge}`}>{t}</div>
                    <div className="text-3xl font-black text-[#1a1a1a] mb-1">{config.price}</div>
                    <p className="text-xs text-gray-400 mb-5">{t === 'Free' ? 'Forever free' : 'per month, billed monthly'}</p>
                    <div className="space-y-2 mb-6">
                      {config.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" /> {f}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (!isCurrent) { setTier(t); const auth = JSON.parse(localStorage.getItem('partnerAuth') || '{}'); localStorage.setItem('partnerAuth', JSON.stringify({ ...auth, tier: t })); } }}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : t === 'Premium' ? 'bg-[#a68d60] text-white hover:bg-[#8e7850]' : 'bg-[#6b1e2e] text-white hover:bg-[#852539]'}`}
                    >
                      {isCurrent ? 'Current Plan' : t === 'Free' ? 'Downgrade' : `Upgrade to ${t}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-gray-400">
              <Lock className="w-3 h-3 inline mr-1" /> Payments powered by Stripe · Cancel anytime · No contracts
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerPortal;
