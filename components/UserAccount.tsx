import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, Building2, ChevronRight, Pencil, Check, X, Loader2 } from 'lucide-react';
import { AuthUser } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useRegion } from '../contexts/RegionContext';
import { getOrders } from '../services/commerce';
import { SectionHeading, Button, Card, Kicker, Tag, Rule } from './ui';

// The account page: who you are, what you've ordered, and the door to the
// winery portal for those who own one.

interface UserAccountProps {
  user: AuthUser | null;
  onLogout: () => void;
  onNavigateToPortal?: () => void;
}

const UserAccount: React.FC<UserAccountProps> = ({ user, onLogout, onNavigateToPortal }) => {
  const { updateProfile } = useAuth();
  const { regionId } = useRegion();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const orders = useMemo(() => getOrders(), []);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[50vh] flex items-center justify-center text-center">
          <div>
            <h2 className="font-display text-2xl text-ink mb-2">You are not signed in</h2>
            <p className="font-body text-ink/50">Sign in from the header and your account will live here.</p>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  const startEditName = () => {
    setNameDraft(user.name);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === user.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    await updateProfile({ name: trimmed });
    setSavingName(false);
    setEditingName(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto py-12 space-y-8 animate-fade-in">
        <SectionHeading kicker="Your account" title="The details" />

        {/* Profile */}
        <Card className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            <span className="w-14 h-14 bg-claret text-parchment rounded-full flex items-center justify-center font-ui text-base font-bold shrink-0">
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveName();
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                    autoFocus
                    className="flex-1 min-w-0 bg-parchment border border-hairline rounded-sm py-2 px-3 font-display text-xl text-ink focus:outline-none focus:border-claret transition-colors"
                  />
                  <button
                    onClick={saveName}
                    disabled={savingName || !nameDraft.trim()}
                    className="p-2 text-vine hover:text-ink transition-colors disabled:opacity-40"
                    aria-label="Save name"
                  >
                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="p-2 text-ink/40 hover:text-ink transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-2xl text-ink leading-tight truncate">{user.name}</h3>
                  <button
                    onClick={startEditName}
                    className="font-ui text-xs font-semibold text-claret hover:text-claret-deep flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit name
                  </button>
                </div>
              )}
              <p className="font-ui text-sm text-ink/50 mt-1 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Tag>{user.role === 'winery' ? 'Winery' : 'Member'}</Tag>
                {user.tier && <Tag tone="success">{user.tier}</Tag>}
                <span className="font-ui text-[10px] uppercase tracking-kicker text-ink/40">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Winery portal — prominent for winery accounts */}
        {user.role === 'winery' && onNavigateToPortal && (
          <button
            onClick={onNavigateToPortal}
            className="w-full bg-ink text-parchment rounded-sm p-6 md:p-8 flex items-center gap-5 text-left group hover:bg-black transition-colors"
          >
            <span className="w-12 h-12 border border-parchment/20 rounded-sm flex items-center justify-center text-brass-soft shrink-0">
              <Building2 className="w-6 h-6" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl">Winery portal</span>
              <span className="block font-body text-sm text-parchment/60 mt-1">
                Manage your listing, wines and offers.
              </span>
            </span>
            <ChevronRight className="w-5 h-5 text-parchment/40 group-hover:text-parchment transition-colors shrink-0" />
          </button>
        )}

        {/* Orders */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Package className="w-4 h-4 text-brass" />
            <Kicker>Your cases</Kicker>
          </div>
          {orders.length === 0 ? (
            <p className="font-body text-ink/50">
              No orders yet. The library is open — your first case awaits.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-8">
                <div>
                  <p className="font-display text-3xl text-ink">{orders.length}</p>
                  <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                    {orders.length === 1 ? 'Order' : 'Orders'}
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl text-ink">${totalSpent.toFixed(2)}</p>
                  <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">In the cellar</p>
                </div>
              </div>
              <Rule className="my-5" />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-ui text-sm font-semibold text-ink truncate">
                    Latest: order {orders[0].id}
                  </p>
                  <p className="font-ui text-xs text-ink/40 mt-0.5">
                    {new Date(orders[0].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} · {orders[0].status}
                  </p>
                </div>
                <span className="font-display text-lg text-ink shrink-0">${orders[0].total.toFixed(2)}</span>
              </div>
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="mt-6"
            onClick={() => navigate(`/${regionId}/cellar/orders`)}
          >
            View order history <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Card>

        {/* Sign out */}
        <div className="pt-2">
          <Button variant="secondary" className="w-full" onClick={onLogout}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
