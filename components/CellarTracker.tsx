import React, { useState, useEffect } from 'react';
import { getCellarAdvice, isAIEnabled } from '../services/claudeService';
import { Plus, Trash2, Sparkles, Loader2, Wine, Clock, PackageOpen } from 'lucide-react';

interface CellarEntry {
  id: string;
  name: string;
  variety: string;
  vintage: string;
  quantity: number;
  addedDate: string;
}

const VARIETIES = ['Semillon', 'Chardonnay', 'Shiraz', 'Cabernet Sauvignon', 'Pinot Noir', 'Verdelho', 'Merlot', 'Sparkling', 'Other'];

const CellarTracker: React.FC = () => {
  const [cellar, setCellar] = useState<CellarEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('sommCellar') || '[]'); } catch { return []; }
  });
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', variety: 'Semillon', vintage: '', quantity: 1 });
  const aiEnabled = isAIEnabled();

  useEffect(() => {
    localStorage.setItem('sommCellar', JSON.stringify(cellar));
  }, [cellar]);

  const addWine = () => {
    if (!form.name || !form.vintage) return;
    const entry: CellarEntry = { ...form, id: Date.now().toString(), addedDate: new Date().toISOString() };
    setCellar(prev => [...prev, entry]);
    setForm({ name: '', variety: 'Semillon', vintage: '', quantity: 1 });
    setShowAdd(false);
  };

  const removeWine = (id: string) => setCellar(prev => prev.filter(e => e.id !== id));

  const getAdvice = async () => {
    if (!cellar.length || !aiEnabled) return;
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const result = await getCellarAdvice(cellar);
      setAdvice(result);
    } catch {
      setAdvice('Unable to get advice right now. Please try again.');
    }
    setLoadingAdvice(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-wine font-serif">My Cellar</h2>
          <p className="text-gray-500 text-sm mt-1">{cellar.length} {cellar.length === 1 ? 'wine' : 'wines'} tracked · {cellar.reduce((s, e) => s + e.quantity, 0)} bottles</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm shadow hover:bg-black transition">
          <Plus className="w-4 h-4" /> Add Wine
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm animate-slide-up">
          <h3 className="font-bold text-gray-900 mb-4">Add to Cellar</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Wine name *" className="col-span-2 input-field" />
            <select value={form.variety} onChange={e => setForm(p => ({ ...p, variety: e.target.value }))} className="input-field">
              {VARIETIES.map(v => <option key={v}>{v}</option>)}
            </select>
            <input value={form.vintage} onChange={e => setForm(p => ({ ...p, vintage: e.target.value }))} placeholder="Vintage year *" className="input-field" type="number" min="1990" max="2030" />
            <input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} placeholder="Bottles" className="input-field" type="number" min="1" />
            <div className="flex gap-2 col-span-2">
              <button onClick={addWine} disabled={!form.name || !form.vintage} className="flex-1 py-2.5 bg-wine text-white rounded-xl font-bold text-sm disabled:opacity-40">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {cellar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-bold text-gray-500">Your cellar is empty</p>
          <p className="text-sm text-gray-400 mt-1">Track your collection and get AI drinking-window advice</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cellar.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-wine/10 rounded-xl flex items-center justify-center">
                    <Wine className="w-5 h-5 text-wine" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{entry.name}</p>
                    <p className="text-xs text-gray-400">{entry.vintage} · {entry.variety} · {entry.quantity} {entry.quantity === 1 ? 'bottle' : 'bottles'}</p>
                  </div>
                </div>
                <button onClick={() => removeWine(entry.id)} className="p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {aiEnabled && (
            <button onClick={getAdvice} disabled={loadingAdvice} className="w-full py-3.5 flex items-center justify-center gap-2 bg-wine text-white rounded-2xl font-bold shadow-lg hover:bg-wine-dark transition disabled:opacity-50 mb-4">
              {loadingAdvice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Get AI Drinking Window Advice
            </button>
          )}

          {advice && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Cellar Advice</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{advice}</p>
            </div>
          )}
        </>
      )}

      <style>{`.input-field { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.625rem 1rem; font-size: 0.875rem; outline: none; background: #f9fafb; transition: border-color 0.15s; }
.input-field:focus { border-color: #6b1e2e; box-shadow: 0 0 0 3px rgba(107, 30, 46, 0.08); }`}</style>
    </div>
  );
};

export default CellarTracker;
