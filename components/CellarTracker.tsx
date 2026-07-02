import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Loader2, Wine, Clock } from 'lucide-react';
import { getCellarAdvice, isAIEnabled } from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { SectionHeading, Button, Card, Kicker, EmptyState, Tag } from './ui';

// My cellar — the bottles the user actually owns, laid down on this device.
// The Somm will tell you when to pull the corks.

const CELLAR_KEY = 'sommMyCellar';

interface CellarEntry {
  id: string;
  name: string;
  variety: string;
  vintage: string;
  quantity: number;
  addedDate: string;
}

const CellarTracker: React.FC = () => {
  const { region } = useRegion();
  const { wines } = useCatalog();

  const varieties = useMemo(() => {
    const fromRegion = region.varietyMix.map(v => v.name);
    return [...fromRegion, 'Other'];
  }, [region]);

  const [cellar, setCellar] = useState<CellarEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CELLAR_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', variety: varieties[0], vintage: '', quantity: 1 });
  const aiEnabled = isAIEnabled();

  useEffect(() => {
    localStorage.setItem(CELLAR_KEY, JSON.stringify(cellar));
  }, [cellar]);

  // Match an entry back to the catalogue so we can surface drinking windows.
  const catalogueMatch = (entry: CellarEntry) => {
    const name = entry.name.toLowerCase();
    return wines.find(w => {
      const wName = w.name.toLowerCase();
      return wName.includes(name) || name.includes(wName);
    });
  };

  const addWine = () => {
    if (!form.name || !form.vintage) return;
    const entry: CellarEntry = { ...form, id: Date.now().toString(), addedDate: new Date().toISOString() };
    setCellar(prev => [...prev, entry]);
    setForm({ name: '', variety: varieties[0], vintage: '', quantity: 1 });
    setShowAdd(false);
  };

  const removeWine = (id: string) => setCellar(prev => prev.filter(e => e.id !== id));

  const getAdvice = async () => {
    if (!cellar.length || !aiEnabled) return;
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const result = await getCellarAdvice(region, cellar);
      setAdvice(result);
    } catch {
      setAdvice('The Somm could not get to your cellar just now. Try again in a moment.');
    }
    setLoadingAdvice(false);
  };

  const bottleCount = cellar.reduce((s, e) => s + e.quantity, 0);
  const inputClass =
    'w-full bg-parchment border border-hairline rounded-sm py-2.5 px-3.5 font-ui text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-claret transition-colors';

  return (
    <div className="py-10 max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeading
          kicker="My cellar"
          title="What you've laid down"
          standfirst={
            cellar.length
              ? `${cellar.length} ${cellar.length === 1 ? 'wine' : 'wines'} · ${bottleCount} ${bottleCount === 1 ? 'bottle' : 'bottles'} resting.`
              : undefined
          }
        />
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add a bottle
        </Button>
      </div>

      {showAdd && (
        <Card className="p-6 mt-8 animate-slide-up">
          <Kicker className="mb-4">Lay one down</Kicker>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Wine name"
              className={`col-span-2 ${inputClass}`}
            />
            <select
              value={form.variety}
              onChange={e => setForm(p => ({ ...p, variety: e.target.value }))}
              className={inputClass}
            >
              {varieties.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <input
              value={form.vintage}
              onChange={e => setForm(p => ({ ...p, vintage: e.target.value }))}
              placeholder="Vintage year"
              className={inputClass}
              type="number"
              min="1990"
              max="2030"
            />
            <input
              value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
              placeholder="Bottles"
              className={inputClass}
              type="number"
              min="1"
            />
            <div className="flex gap-2 col-span-2 pt-1">
              <Button className="flex-1" onClick={addWine} disabled={!form.name || !form.vintage}>
                Add to the cellar
              </Button>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {cellar.length === 0 ? (
        <EmptyState
          title="Nothing laid down yet"
          body="Add the bottles you own and the Somm will tell you when each one is singing."
        />
      ) : (
        <>
          <div className="mt-8 border border-hairline divide-y divide-hairline bg-paper">
            {cellar.map(entry => {
              const match = catalogueMatch(entry);
              const window = match?.drinkFrom || match?.drinkTo
                ? `Drink ${match?.drinkFrom ?? 'now'}–${match?.drinkTo ?? 'onwards'}`
                : null;
              return (
                <div key={entry.id} className="p-4 flex items-center gap-4 group">
                  <div className="w-10 h-10 border border-hairline rounded-sm flex items-center justify-center text-claret shrink-0">
                    <Wine className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm font-semibold text-ink truncate">{entry.name}</p>
                    <p className="font-ui text-xs text-ink/40 mt-0.5">
                      {entry.vintage} · {entry.variety} · {entry.quantity} {entry.quantity === 1 ? 'bottle' : 'bottles'}
                    </p>
                  </div>
                  {window && <Tag tone="success" className="shrink-0 hidden sm:inline-block">{window}</Tag>}
                  <button
                    onClick={() => removeWine(entry.id)}
                    className="p-2 text-ink/20 hover:text-terracotta transition-colors shrink-0"
                    aria-label={`Remove ${entry.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {aiEnabled && (
            <Button className="w-full mt-6" onClick={getAdvice} disabled={loadingAdvice}>
              {loadingAdvice && <Loader2 className="w-4 h-4 animate-spin" />}
              {loadingAdvice ? 'The Somm is down in the cellar…' : 'Ask the Somm when to pull the corks'}
            </Button>
          )}

          {advice && (
            <Card className="p-6 mt-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-brass" />
                <Kicker>The Somm's note</Kicker>
              </div>
              <p className="font-body text-ink/80 leading-relaxed whitespace-pre-wrap">{advice}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CellarTracker;
