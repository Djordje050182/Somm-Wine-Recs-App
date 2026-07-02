import React, { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useCatalog } from '../../contexts/CatalogContext';
import { partnerStore, getTier } from '../../services/commerce';
import { WineDetail } from '../../types';
import { Button, Card, Tag, EmptyState, Kicker } from '../../components/ui';
import ImageWithLoader from '../../components/ImageWithLoader';

// The wine library manager. Somm-catalogue wines are maintained editorially;
// wines the estate adds here are theirs to edit and remove, and appear in the
// consumer library immediately. The membership tier caps the library size.

interface Props {
  wineryId: string;
  onGoToMembership: () => void;
}

interface WineForm {
  name: string;
  variety: string;
  vintage: string;
  price: string;
  description: string;
  sommNote: string;
  pairings: string;
  imageUrl: string;
}

const EMPTY_FORM: WineForm = {
  name: '', variety: '', vintage: '', price: '', description: '', sommNote: '', pairings: '', imageUrl: '',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800';

const kebab = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/50 mb-1.5">{children}</span>
);

const inputClass =
  'w-full font-ui text-sm text-ink bg-paper border border-hairline rounded-sm px-3 py-2.5 placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors';

const WineManager: React.FC<Props> = ({ wineryId, onGoToMembership }) => {
  const { winesForWinery } = useCatalog();
  const wines = winesForWinery(wineryId);
  const partnerIds = new Set(partnerStore.getPartnerWines(wineryId).map(w => w.id));

  const sub = partnerStore.getActiveSubscription(wineryId);
  const tier = getTier(sub?.tierId ?? 'listed')!; // no subscription = trial on Listed terms
  const atLimit = tier.wineLimit !== null && wines.length >= tier.wineLimit;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WineForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const set = <K extends keyof WineForm>(key: K, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setError(null);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (wine: WineDetail) => {
    setEditingId(wine.id);
    setForm({
      name: wine.name,
      variety: wine.variety,
      vintage: wine.vintage,
      price: wine.price,
      description: wine.description,
      sommNote: wine.sommNote,
      pairings: wine.pairings.join(', '),
      imageUrl: wine.image.url === FALLBACK_IMAGE ? '' : wine.image.url,
    });
    setError(null);
    setFormOpen(true);
  };

  const handleSave = () => {
    const name = form.name.trim();
    const variety = form.variety.trim();
    if (!name || !variety) {
      setError('A wine needs at least a name and a variety.');
      return;
    }
    const id = editingId ?? `${wineryId}-${kebab(name)}`;
    if (!editingId && wines.some(w => w.id === id)) {
      setError('A wine with this name is already in your library.');
      return;
    }
    const priceDigits = form.price.replace(/[^0-9]/g, '');
    const existing = editingId ? partnerStore.getPartnerWines(wineryId).find(w => w.id === editingId) : undefined;

    const wine: WineDetail = {
      id,
      name,
      wineryId,
      variety,
      vintage: form.vintage.trim(),
      price: priceDigits ? `$${priceDigits}` : '$0',
      description: form.description.trim(),
      sommNote: form.sommNote.trim(),
      image: {
        url: form.imageUrl.trim() || FALLBACK_IMAGE,
        source: 'winery',
        alt: `A bottle of ${name}`,
      },
      rating: existing?.rating ?? 4.5,
      pairings: form.pairings.split(',').map(p => p.trim()).filter(Boolean),
    };

    partnerStore.savePartnerWine(wine);
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSavedName(name);
    window.setTimeout(() => setSavedName(null), 4000);
  };

  const handleDelete = (wine: WineDetail) => {
    partnerStore.deletePartnerWine(wineryId, wine.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink">Your wines</h2>
          <p className="font-body text-ink/50 mt-1">
            {wines.length} {wines.length === 1 ? 'wine' : 'wines'} in the library
            {tier.wineLimit !== null ? ` of ${tier.wineLimit} on the ${tier.name} tier${sub ? '' : ' trial'}` : ' — no limit on your tier'}.
          </p>
        </div>
        <Button onClick={openAdd} disabled={atLimit || formOpen} size="sm">
          <Plus className="w-3.5 h-3.5" /> Add a wine
        </Button>
      </div>

      {savedName && (
        <span className="inline-flex items-center gap-2 border border-vine/40 bg-vine/5 text-vine font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 rounded-sm animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Live on Somm — {savedName} is in the library
        </span>
      )}

      {atLimit && (
        <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Kicker className="mb-1.5">Membership</Kicker>
            <p className="font-body text-ink/70 max-w-xl">
              Your library is at the {tier.wineLimit}-wine mark of the {tier.name} tier. The Featured membership opens the full cellar — every wine you make, no limit.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onGoToMembership}>View memberships</Button>
        </Card>
      )}

      {/* Add / edit form */}
      {formOpen && (
        <Card className="p-6 space-y-5 animate-fade-in">
          <h3 className="font-display text-lg text-ink">{editingId ? 'Edit wine' : 'A new wine'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Reserve Shiraz" className={inputClass} />
            </div>
            <div>
              <Label>Variety</Label>
              <input value={form.variety} onChange={e => set('variety', e.target.value)} placeholder="Shiraz" className={inputClass} />
            </div>
            <div>
              <Label>Vintage</Label>
              <input value={form.vintage} onChange={e => set('vintage', e.target.value)} placeholder="2022" className={inputClass} />
            </div>
            <div>
              <Label>Price (AUD)</Label>
              <input value={form.price} onChange={e => set('price', e.target.value)} placeholder="$55" className={inputClass} />
            </div>
            <div>
              <Label>Bottle image URL</Label>
              <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${inputClass} font-body resize-none`} />
            </div>
            <div className="sm:col-span-2">
              <Label>The Somm's note — one insider line</Label>
              <input value={form.sommNote} onChange={e => set('sommNote', e.target.value)} placeholder="Ask for the museum release if they like you." className={`${inputClass} font-body`} />
            </div>
            <div className="sm:col-span-2">
              <Label>Pairings — separated by commas</Label>
              <input value={form.pairings} onChange={e => set('pairings', e.target.value)} placeholder="Slow-roasted lamb, aged cheddar" className={inputClass} />
            </div>
          </div>
          {error && <p className="font-ui text-xs font-semibold text-terracotta">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editingId ? 'Save wine' : 'Add to the library'}</Button>
            <Button variant="secondary" onClick={() => { setFormOpen(false); setEditingId(null); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* The library */}
      {wines.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing in the library yet"
            body="Add your first wine and it will appear to travellers straight away."
            action={<Button size="sm" onClick={openAdd}>Add a wine</Button>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-hairline">
          {wines.map(wine => {
            const isPartner = partnerIds.has(wine.id);
            return (
              <div key={wine.id} className="flex items-center gap-4 p-4">
                <ImageWithLoader asset={wine.image} className="w-12 h-16 shrink-0 rounded-sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-semibold text-ink truncate">{wine.name}</p>
                  <p className="font-ui text-xs text-ink/40 mt-0.5">
                    {wine.variety}{wine.vintage ? ` · ${wine.vintage}` : ''}
                  </p>
                </div>
                <span className="font-display text-sm text-brass shrink-0">{wine.price}</span>
                <Tag className="hidden sm:inline-block shrink-0" tone={isPartner ? 'success' : 'default'}>
                  {isPartner ? 'Your listing' : 'Somm catalogue'}
                </Tag>
                {isPartner && (
                  <span className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(wine)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="!text-terracotta hover:!text-terracotta" onClick={() => handleDelete(wine)}>
                      Remove
                    </Button>
                  </span>
                )}
              </div>
            );
          })}
        </Card>
      )}

      <p className="font-body text-xs text-ink/40">
        Somm catalogue wines are looked after by our editors. Write to us if one needs amending.
      </p>
    </div>
  );
};

export default WineManager;
