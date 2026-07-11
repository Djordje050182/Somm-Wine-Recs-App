import React, { useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useCatalog } from '../../contexts/CatalogContext';
import { partnerStore } from '../../services/commerce';
import { ImageAsset, Winery } from '../../types';
import { Button, Card, EmptyState } from '../../components/ui';

// Read a chosen file, downscale it on a canvas and return a compact JPEG data
// URL — the demo store lives in localStorage, so uploads must stay small.
// Logos keep transparency as PNG at a smaller edge.
const fileToDataUrl = (file: File, maxEdge: number, asLogo = false): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(asLogo ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
    img.src = url;
  });

const MAX_PHOTOS = 6;

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
  const [logo, setLogo] = useState<string | undefined>(winery?.logo);
  const [photos, setPhotos] = useState<ImageAsset[]>(winery?.gallery ?? []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  if (!winery) {
    return <EmptyState title="Nothing to edit yet" body="We couldn't load your listing in this region." />;
  }

  const handleLogoFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setLogo(await fileToDataUrl(file, 320, true));
      setSaved(false);
      setUploadError(null);
    } catch {
      setUploadError('That file could not be read as an image.');
    }
  };

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const room = MAX_PHOTOS - photos.length;
      const added: ImageAsset[] = [];
      for (const file of Array.from(files).slice(0, room)) {
        added.push({
          url: await fileToDataUrl(file, 1280),
          source: 'winery',
          alt: `${winery.name} — uploaded by the estate`,
        });
      }
      setPhotos(p => [...p, ...added]);
      setSaved(false);
      setUploadError(null);
    } catch {
      setUploadError('One of those files could not be read as an image.');
    }
  };

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
      logo,
      gallery: photos.length ? photos : undefined,
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

      {/* The pictures */}
      <Card className="p-6 space-y-5">
        <div>
          <h3 className="font-display text-lg text-ink">The pictures</h3>
          <p className="font-body text-xs text-ink/40 mt-1">
            Your logo appears on your listing page; photos join the "In pictures" strip travellers browse.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border border-hairline rounded-sm bg-parchment flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt="Estate logo" className="w-full h-full object-contain p-1" />
            ) : (
              <ImagePlus className="w-5 h-5 text-ink/30" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => logoInput.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> {logo ? 'Replace logo' : 'Upload logo'}
            </Button>
            {logo && (
              <button
                type="button"
                onClick={() => { setLogo(undefined); setSaved(false); }}
                className="font-ui text-xs font-semibold text-ink/50 hover:text-terracotta flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
          <input
            ref={logoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { void handleLogoFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </div>

        <div>
          <Label>Photos — up to {MAX_PHOTOS}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative group aspect-square border border-hairline rounded-sm overflow-hidden bg-parchment">
                <img src={p.url} alt={p.alt} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotos(ph => ph.filter((_, idx) => idx !== i)); setSaved(false); }}
                  className="absolute top-1 right-1 bg-ink/60 hover:bg-terracotta text-parchment rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="aspect-square border border-dashed border-ink/30 hover:border-claret rounded-sm flex flex-col items-center justify-center gap-1 text-ink/40 hover:text-claret transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker">Add</span>
              </button>
            )}
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { void handlePhotoFiles(e.target.files); e.target.value = ''; }}
          />
          {uploadError && <p className="font-body text-xs text-terracotta mt-2">{uploadError}</p>}
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
