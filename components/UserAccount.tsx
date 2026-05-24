
import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Heart, Settings, LogOut, Star, Package, ChevronRight, Wine, MapPin, Award, Clock, CheckCircle, Truck, Archive } from 'lucide-react';
import { Order, AccountType } from '../types';
import { WINERIES, WINES } from '../data/wineries';

interface UserAccountProps {
  user: { name: string; email: string; tier?: string; accountType?: AccountType; wineryId?: number } | null;
  onLogout: () => void;
  onNavigateToPortal?: () => void;
}

const statusIcon = (status: Order['status']) => {
  if (status === 'Confirmed') return <Clock className="w-4 h-4 text-blue-500" />;
  if (status === 'Packing') return <Archive className="w-4 h-4 text-amber-500" />;
  if (status === 'Shipped') return <Truck className="w-4 h-4 text-purple-500" />;
  return <CheckCircle className="w-4 h-4 text-green-500" />;
};

const statusColor = (status: Order['status']) => {
  if (status === 'Confirmed') return 'bg-blue-50 text-blue-700';
  if (status === 'Packing') return 'bg-amber-50 text-amber-700';
  if (status === 'Shipped') return 'bg-purple-50 text-purple-700';
  return 'bg-green-50 text-green-700';
};

const UserAccount: React.FC<UserAccountProps> = ({ user, onLogout, onNavigateToPortal }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteWineries, setFavoriteWineries] = useState<number[]>([]);
  const [favoriteWines, setFavoriteWines] = useState<string[]>([]);

  useEffect(() => {
    const savedOrders: Order[] = JSON.parse(localStorage.getItem('sommOrders') || '[]');
    setOrders(savedOrders);
    setFavoriteWineries(JSON.parse(localStorage.getItem('favWineries') || '[]'));
    setFavoriteWines(JSON.parse(localStorage.getItem('favWines') || '[]'));
  }, []);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center text-gray-400">
        <div>
          <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">You are not signed in.</p>
        </div>
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const winery = user.wineryId ? WINERIES.find(w => w.id === user.wineryId) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1a1f] rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6b1e2e] rounded-full blur-[80px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#a68d60] flex items-center justify-center text-white text-2xl font-black font-serif shadow-lg">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-serif">{user.name}</h1>
            <p className="text-white/60 text-sm mt-1">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-[#a68d60]">
                {user.tier || 'Member'}
              </span>
              {user.accountType === 'estate_owner' && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#a68d60]/20 px-3 py-1 rounded-full text-[#a68d60]">
                  Estate Owner
                </span>
              )}
              {winery && (
                <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full text-white/70">
                  {winery.name}
                </span>
              )}
            </div>
          </div>
          {user.accountType === 'estate_owner' && onNavigateToPortal && (
            <button
              onClick={onNavigateToPortal}
              className="shrink-0 flex items-center gap-2 bg-[#a68d60] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#8e7850] transition-all shadow-lg"
            >
              Partner Portal <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['overview', 'orders', 'favorites', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-[#1a1a1a] text-white shadow-md' : 'bg-white text-gray-500 border border-[#e5e1da] hover:border-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
              { label: 'Total Spent', value: `$${totalSpent}`, icon: Wine, color: 'text-[#6b1e2e] bg-[#6b1e2e]/10' },
              { label: 'Fav Wineries', value: favoriteWineries.length, icon: MapPin, color: 'text-amber-600 bg-amber-50' },
              { label: 'Fav Wines', value: favoriteWines.length, icon: Heart, color: 'text-pink-600 bg-pink-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white border border-[#e5e1da] rounded-2xl p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-[#1a1a1a]">{value}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {orders.length > 0 && (
            <div className="bg-white border border-[#e5e1da] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a1a1a] mb-4">Recent Order</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-sm">Order #{orders[orders.length - 1].id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{orders[orders.length - 1].date} · {orders[orders.length - 1].items.length} item{orders[orders.length - 1].items.length !== 1 ? 's' : ''}</p>
                </div>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusColor(orders[orders.length - 1].status)}`}>
                  {statusIcon(orders[orders.length - 1].status)} {orders[orders.length - 1].status}
                </span>
                <span className="font-bold text-[#1a1a1a]">${orders[orders.length - 1].total}</span>
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="bg-white border border-[#e5e1da] rounded-2xl p-10 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No orders yet.</p>
              <p className="text-sm mt-1">Start exploring the wine library to fill your cellar.</p>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          {orders.length === 0 ? (
            <div className="bg-white border border-[#e5e1da] rounded-2xl p-10 text-center text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No orders yet.</p>
            </div>
          ) : (
            [...orders].reverse().map(order => (
              <div key={order.id} className="bg-white border border-[#e5e1da] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1a1a1a]">Order #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusColor(order.status)}`}>
                    {statusIcon(order.status)} {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span className="font-medium">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">{order.address}</span>
                  <span className="font-black text-[#1a1a1a]">Total: ${order.total}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6 animate-in fade-in">
          {favoriteWineries.length > 0 && (
            <div>
              <h3 className="font-bold text-[#1a1a1a] mb-3">Saved Wineries</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteWineries.map(id => {
                  const w = WINERIES.find(w => w.id === id);
                  if (!w) return null;
                  return (
                    <div key={id} className="bg-white border border-[#e5e1da] rounded-2xl overflow-hidden shadow-sm flex">
                      <img src={w.image} className="w-20 h-20 object-cover shrink-0" alt={w.name} />
                      <div className="p-4">
                        <p className="font-bold text-sm text-[#1a1a1a] leading-tight">{w.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{w.subregion} · {w.specialty}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold text-gray-600">{w.rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {favoriteWines.length > 0 && (
            <div>
              <h3 className="font-bold text-[#1a1a1a] mb-3">Saved Wines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteWines.map(id => {
                  const w = WINES.find(w => w.id === id);
                  if (!w) return null;
                  return (
                    <div key={id} className="bg-white border border-[#e5e1da] rounded-2xl overflow-hidden shadow-sm flex">
                      <img src={w.image} className="w-20 h-20 object-cover shrink-0" alt={w.name} />
                      <div className="p-4">
                        <p className="font-bold text-sm text-[#1a1a1a] leading-tight">{w.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{w.variety} · {w.vintage}</p>
                        <p className="text-sm font-black text-[#6b1e2e] mt-1">{w.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {favoriteWineries.length === 0 && favoriteWines.length === 0 && (
            <div className="bg-white border border-[#e5e1da] rounded-2xl p-10 text-center text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No saved favourites yet.</p>
              <p className="text-sm mt-1">Tap the heart icon on any winery or wine to save it here.</p>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-[#e5e1da] rounded-2xl divide-y divide-gray-50 shadow-sm overflow-hidden">
            {[
              { label: 'Edit Profile', sub: 'Update your name and email', icon: User },
              { label: 'Notifications', sub: 'Manage email preferences', icon: Award },
              { label: 'Privacy', sub: 'Data and account visibility', icon: Settings },
            ].map(({ label, sub, icon: Icon }) => (
              <button key={label} className="w-full flex items-center gap-4 p-5 hover:bg-[#f8f4f0] transition-colors text-left">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1a1a1a]">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAccount;
