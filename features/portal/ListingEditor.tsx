import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCatalog } from '../../contexts/CatalogContext';
import { partnerStore } from '../../services/commerce';
import { Winery } from '../../types';
import { Button, Card, EmptyState } from '../../components/ui';

// The listing editor — what travellers read about the estate. Saves write a
// partial override to the partner store; the catalogue merges it over the
// static data, so changes are live on the consumer side the moment they save.

interface Props {
  wineryId: string;
}

const FACILITIES: { key: keyof Pick<Winery, 'hasRestaurant' | 'kidFriendly' | 'dogFriendly' | 'bookingRequired'>; label: string; note: string }[] = [
  { key: 'hasRestaurant', label: 'Restaurant', note: 'You serve food on the estate' },
  { key: 'bookingRequired', label: 'Booking required', note: 'Tastings must be booked ahead' },
  { key: 'kidFriendly', label: 'Children welcome', note: 'Families can visit comfortably' },
  { key: 'dogFriendly', label: 'Dogs welcome', note: 'Well-behaved dogs may join' },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/50 mb-1.5">{children}</span>
);

const inputClass =
  'w-full font-ui text-sm text-ink bg-paper border border-hairline rounded-sm px-3 py-2.5 placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors';

const ListingEditor: React.FC<Props> = ({ wineryId }) => {
  const { getWinery } = useCatalog();
  const winery = getWinery(wineryId);

  const [form, setForm] = useState(() => ({
    description: winery?.description ?? '',
    story: winery?.story ?? '',
    opens: winery?.opens ?? '',
    closes: winery?.closes ?? '',
    tastingFee: String(winery?.tastingFee ?? 0),
    phone: winery?.phone ?? '',
    website: winery?.website ?? '',
    bookingUrl: winery?.bookingUrl ?? '',
    hasRestaurant: winery?.hasRestaurant ?? false,
    kidFriendly: winery?.kidFriendly ?? false,
    dogFriendly: winery?.dogFriendly ?? false,
    bookingRequired: winery?.bookingRequired ?? false,
  }));
  const [saved, setSaved] = useState(false);

  if (!winery) {
    return <EmptyState title="Nothing to edit yet" body="We couldn't load your listing in this region." />;
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const patch: Partial<Winery> = {
      description: form.description.trim(),
      story: form.story.trim() || undefined,
      opens: form.opens.trim(),
      closes: form.closes.trim(),
      tastingFee: Number(form.tastingFee) || 0,
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      bookingUrl: form.bookingUrl.trim() || undefined,
      hasRestaurant: form.hasRestaurant,
      kidFriendly: form.kidFriendly,
      dogFriendly: form.dogFriendly,
      bookingRequired: form.bookingRequired,
    };
    partnerStore.saveListingOverride(wineryId, patch);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-medium text-ink">Your listing</h2>
        <p className="font-body text-ink/50 mt-1">What travellers read about {winery.name}. Saved changes appear on Somm immediately.</p>
      </div>

      {/* The words */}
      <Card className="p-6 space-y-5">
        <h3 className="font-display text-lg text-ink">The words</h3>
        <div>
          <Label>Short description — cards and search</Label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className={`${inputClass} font-body resize-none`}
          />
        </div>
        <div>
          <Label>The longer story — your listing page</Label>
          <textarea
            value={form.story}
            onChange={e => set('story', e.target.value)}
            rows={5}
            placeholder="How the estate came to be, and what a visit feels like."
            className={`${inputClass} font-body resize-none`}
          />
        </div>
      </Card>

      {/* The cellar door */}
      <Card className="p-6 space-y-5">
        <h3 className="font-display text-lg text-ink">The cellar door</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Opens</Label>
            <input value={form.opens} onChange={e => set('opens', e.target.value)} placeholder="10:00" className={inputClass} />
          </div>
          <div>
            <Label>Closes</Label>
            <input value={form.closes} onChange={e => set('closes', e.target.value)} placeholder="17:00" className={inputClass} />
          </div>
          <div>
            <Label>Tasting fee (AUD)</Label>
            <input
              type="number"
              min="0"
              value={form.tastingFee}
              onChange={e => set('tastingFee', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FACILITIES.map(({ key, label, note }) => (
            <button
              key={key}
              type="button"
              onClick={() => set(key, !form[key])}
              className={`flex items-start gap-3 p-3.5 border rounded-sm text-left transition-colors ${
                form[key] ? 'border-claret bg-claret/5' : 'border-hairline hover:border-ink/30'
              }`}
            >
              <span
                className={`mt-0.5 w-4 h-4 shrink-0 border rounded-sm flex items-center justify-center ${
                  form[key] ? 'border-claret bg-claret' : 'border-ink/30 bg-paper'
                }`}
              >
                {form[key] && <CheckCircle2 className="w-3 h-3 text-parchment" />}
              </span>
              <span>
                <span className={`block font-ui text-sm font-semibold ${form[key] ? 'text-claret' : 'text-ink'}`}>{label}</span>
                <span className="block font-body text-xs text-ink/40 mt-0.5">{note}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Contact & booking */}
      <Card className="p-6 space-y-5">
        <h3 className="font-display text-lg text-ink">Contact and booking</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+61 2 4993 7000" className={inputClass} />
          </div>
          <div>
            <Label>Website</Label>
            <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <Label>Booking link</Label>
            <input value={form.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://" className={inputClass} />
          </div>
        </div>
      </Card>

      {/* Save row */}
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleSave}>Save changes</Button>
        {saved && (
          <span className="inline-flex items-center gap-2 border border-vine/40 bg-vine/5 text-vine font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 rounded-sm animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live on Somm — travellers see this now
          </span>
        )}
      </div>
    </div>
  );
};

export default ListingEditor;
