import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCatalog } from '../../contexts/CatalogContext';
import { Card, Kicker, Rule } from '../../components/ui';

// Demonstration analytics. Every number is derived deterministically from the
// winery slug — the same estate always sees the same figures — so the surface
// behaves like a real dashboard without pretending live data exists.

interface Props {
  wineryId: string;
}

// -- Deterministic PRNG seeded from the slug ---------------------------------

const hashSlug = (slug: string): number => {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// -- Chart styling (DESIGN.md: claret/brass/vine/ink only, hairline grid) ----

const INK = '#211A16';
const CLARET = '#5E1A26';
const HAIRLINE = '#E2D9C8';
const TICK_STYLE = { fontFamily: 'Archivo, system-ui, sans-serif', fontSize: 11, fill: 'rgba(33, 26, 22, 0.55)' };

const ChartTooltip: React.FC<{ active?: boolean; payload?: { value: number }[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-paper border border-hairline rounded-sm px-3 py-2">
      <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40">Week of {label}</p>
      <p className="font-display text-base text-ink mt-0.5">{payload[0].value.toLocaleString('en-GB')} views</p>
    </div>
  );
};

// -----------------------------------------------------------------------------

const Analytics: React.FC<Props> = ({ wineryId }) => {
  const { winesForWinery } = useCatalog();
  const wines = winesForWinery(wineryId);

  const data = useMemo(() => {
    const rand = mulberry32(hashSlug(wineryId));
    const base = 320 + Math.round(rand() * 480);

    // Twelve weeks of listing views with a gentle upward drift.
    const trend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (11 - i) * 7);
      const drift = 1 + i * (0.015 + rand() * 0.02);
      const noise = 0.85 + rand() * 0.3;
      return {
        week: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        views: Math.round(base * drift * noise),
      };
    });

    const last30 = trend.slice(-4).reduce((sum, w) => sum + w.views, 0);
    const prior30 = trend.slice(-8, -4).reduce((sum, w) => sum + w.views, 0);
    const viewsDelta = prior30 ? Math.round(((last30 - prior30) / prior30) * 100) : 0;

    const libraryAppearances = Math.round(last30 * (1.6 + rand() * 1.2));
    const offerConversions = Math.round(last30 * (0.015 + rand() * 0.02));

    const topWines = wines
      .map(w => ({
        id: w.id,
        name: w.name,
        variety: w.variety,
        views: Math.round(80 + mulberry32(hashSlug(w.id))() * 640),
        cases: Math.round(2 + mulberry32(hashSlug(`${w.id}-case`))() * 34),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return { trend, last30, viewsDelta, libraryAppearances, offerConversions, topWines };
  }, [wineryId, wines]);

  const tiles = [
    { label: 'Listing views · 30 days', value: data.last30, note: `${data.viewsDelta >= 0 ? 'up' : 'down'} ${Math.abs(data.viewsDelta)}% on the month before` },
    { label: 'Library appearances', value: data.libraryAppearances, note: 'times your wines surfaced in search and lists' },
    { label: 'Offer conversions', value: data.offerConversions, note: 'cases begun from an offer of yours' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Kicker className="mb-2">Sample data — live analytics arrive with launch</Kicker>
        <h2 className="font-display text-2xl font-medium text-ink">How the estate is travelling</h2>
        <p className="font-body text-ink/50 mt-1">A preview of the reporting every member estate will receive.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map(tile => (
          <Card key={tile.label} className="p-5">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/40">{tile.label}</p>
            <p className="font-display text-3xl text-ink mt-2">{tile.value.toLocaleString('en-GB')}</p>
            <p className="font-ui text-xs text-vine mt-1.5">{tile.note}</p>
          </Card>
        ))}
      </div>

      {/* Listing views trend */}
      <Card className="p-5 sm:p-6">
        <h3 className="font-display text-lg text-ink mb-1">Listing views by week</h3>
        <p className="font-ui text-xs text-ink/40 mb-5">The last twelve weeks</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={HAIRLINE} strokeWidth={1} vertical={false} />
              <XAxis dataKey="week" tick={TICK_STYLE} tickLine={false} axisLine={{ stroke: HAIRLINE }} interval="preserveStartEnd" />
              <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => v.toLocaleString('en-GB')} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: INK, strokeOpacity: 0.15, strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="views"
                stroke={CLARET}
                strokeWidth={2}
                fill={CLARET}
                fillOpacity={0.1}
                activeDot={{ r: 4, fill: CLARET, stroke: '#FFFDF8', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top wines */}
      <Card className="p-5 sm:p-6">
        <h3 className="font-display text-lg text-ink">Most viewed wines</h3>
        <Rule className="mt-4" />
        {data.topWines.length === 0 ? (
          <p className="font-body text-ink/50 py-6">Nothing here yet. Add wines to the library and they will appear.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 py-3">Wine</th>
                <th className="text-right font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 py-3">Views</th>
                <th className="text-right font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 py-3">In cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {data.topWines.map(w => (
                <tr key={w.id}>
                  <td className="py-3 pr-4">
                    <p className="font-ui text-sm font-semibold text-ink">{w.name}</p>
                    <p className="font-ui text-xs text-ink/40 mt-0.5">{w.variety}</p>
                  </td>
                  <td className="py-3 text-right font-display text-sm text-ink">{w.views.toLocaleString('en-GB')}</td>
                  <td className="py-3 text-right font-display text-sm text-brass">{w.cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
