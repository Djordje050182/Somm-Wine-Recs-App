import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CloudSun, Calendar, MessageSquare, Mic as MicIcon } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { getCurrentWeather, WeatherData } from '../../services/weatherService';
import { Kicker, SectionHeading, Button, Tag } from '../../components/ui';
import ImageWithLoader from '../../components/ImageWithLoader';
import GuideModal from '../../components/GuideModal';
import { Winery, WineDetail } from '../../types';

// The region's editorial front page. Everything on it is derived from the
// live region config and catalogue — collections are selected by rule,
// never by hardcoded id, so every future region composes its own front page.

interface Collection {
  id: string;
  kicker: string;
  title: string;
  standfirst: string;
  estates: Winery[];
}

type Selection = { item: Winery | WineDetail; type: 'winery' | 'wine' } | null;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { region, regionId } = useRegion();
  const { wineries, wines, getWinery, getPricing } = useCatalog();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selected, setSelected] = useState<Selection>(null);

  useEffect(() => {
    getCurrentWeather(region).then(setWeather);
  }, [region]);

  const byRating = (a: Winery, b: Winery) => b.rating - a.rating;

  const collections = useMemo<Collection[]>(() => {
    const candidates: Collection[] = [
      {
        id: 'old-guard',
        kicker: 'Collection no. 1',
        title: 'The old guard',
        standfirst: 'Estates rooted before 1970 — the benchmarks everything else is measured against.',
        estates: wineries.filter(w => w.established < 1970).sort(byRating).slice(0, 3),
      },
      {
        id: 'new-wave',
        kicker: 'Collection no. 2',
        title: 'The new wave',
        standfirst: 'Founded since 1995 and already setting the pace. Watch these closely.',
        estates: wineries.filter(w => w.established >= 1995 && w.rating >= 4.6).sort(byRating).slice(0, 3),
      },
      {
        id: 'long-lunch',
        kicker: 'Collection no. 3',
        title: 'The long lunch',
        standfirst: 'Cellar doors with serious kitchens — book the table, then lose the afternoon.',
        estates: wineries.filter(w => w.hasRestaurant).sort(byRating).slice(0, 3),
      },
    ];
    return candidates.filter(c => c.estates.length > 0);
  }, [wineries]);

  const saleWines = useMemo(
    () => wines.filter(w => getPricing(w.id).isSale),
    [wines, getPricing]
  );

  return (
    <div className="animate-fade-in">
      {selected && <GuideModal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />}

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          <ImageWithLoader asset={region.heroImage} className="w-full h-full" showCredit priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent pointer-events-none" />
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14 pt-32">
          <div className="max-w-2xl">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft mb-4">
              The Somm's guide · {region.state}, {region.country}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-parchment leading-[1.05] mb-5">
              {region.name}
            </h1>
            <p className="font-body text-lg md:text-xl text-parchment/85 leading-relaxed mb-8">
              {region.strapline}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button size="lg" className="w-full sm:w-auto justify-center" onClick={() => navigate(`/${regionId}/guide`)}>
                Browse the estates <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                onClick={() => navigate(`/${regionId}/plan`)}
                className="w-full sm:w-auto font-ui text-sm font-semibold tracking-wide border border-parchment/50 text-parchment hover:border-parchment hover:bg-parchment/10 rounded-sm px-7 py-3.5 transition-colors"
              >
                Plan the perfect run
              </button>
            </div>
            <button
              onClick={() => navigate(`/${regionId}/sommelier?talk=1`)}
              className="mt-5 inline-flex items-center gap-2.5 font-ui text-sm text-parchment/85 hover:text-parchment transition-colors group"
            >
              <span className="w-8 h-8 rounded-full bg-parchment/15 border border-parchment/40 flex items-center justify-center group-hover:bg-claret group-hover:border-claret transition-colors">
                <MicIcon className="w-3.5 h-3.5" />
              </span>
              …or just ask the Somm, out loud
            </button>
          </div>
        </div>
      </section>

      {/* Today in the valley */}
      {weather && (
        <section className="border-b border-hairline bg-paper">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
            <div className="flex items-center gap-3 shrink-0">
              <CloudSun className="w-5 h-5 text-brass" />
              <div>
                <Kicker>Today in the valley</Kicker>
                <p className="font-display text-lg text-ink">
                  {weather.temp}°C · {weather.condition}
                </p>
              </div>
            </div>
            <p className="font-body italic text-ink/60 leading-relaxed md:border-l md:border-hairline md:pl-8">
              {weather.recommendation}
            </p>
          </div>
        </section>
      )}

      {/* Meet the Somm — phones get the introduction up front, where it belongs */}
      <section className="md:hidden border-b border-hairline bg-ink text-parchment">
        <button
          onClick={() => navigate(`/${regionId}/sommelier?talk=1`)}
          className="w-full text-left px-4 py-5 flex items-center gap-4 active:opacity-85 transition-opacity"
        >
          <span className="w-12 h-12 rounded-full bg-claret flex items-center justify-center shrink-0">
            <MicIcon className="w-5 h-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-brass-soft block">
              The Somm is at the table
            </span>
            <span className="font-display text-lg leading-snug block mt-0.5">
              Tell him the day you want — he'll plan it out loud
            </span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0 text-parchment/50" />
        </button>
      </section>

      {/* Editorial collections */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {collections.map(collection => (
          <section key={collection.id} className="py-14 border-b border-hairline last:border-b-0">
            <div className="flex items-end justify-between gap-6 mb-8">
              <SectionHeading kicker={collection.kicker} title={collection.title} standfirst={collection.standfirst} />
              <button
                onClick={() => navigate(`/${regionId}/guide`)}
                className="hidden md:flex shrink-0 items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-kicker text-claret hover:text-claret-deep transition-colors"
              >
                All estates <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
              {collection.estates.map(estate => (
                <button
                  key={estate.id}
                  onClick={() => setSelected({ item: estate, type: 'winery' })}
                  className="bg-paper text-left group flex flex-col hover:bg-parchment transition-colors"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <ImageWithLoader
                      asset={estate.image}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl text-ink leading-snug">{estate.name}</h3>
                      <span className="font-ui text-xs font-semibold text-brass shrink-0">{estate.rating.toFixed(1)}</span>
                    </div>
                    <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                      {estate.subregion} · est. {estate.established}
                    </p>
                    <p className="font-body text-sm text-ink/60 mt-3 leading-relaxed line-clamp-2">
                      {estate.sommNote ?? estate.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Wines on offer */}
        {saleWines.length > 0 && (
          <section className="py-14 border-b border-hairline">
            <div className="flex items-end justify-between gap-6 mb-8">
              <SectionHeading
                kicker="At the cellar door"
                title="Wines on offer"
                standfirst="Estates have sharpened their pencils on these. The Somm suggests not dawdling."
              />
              <button
                onClick={() => navigate(`/${regionId}/wines`)}
                className="hidden md:flex shrink-0 items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-kicker text-claret hover:text-claret-deep transition-colors"
              >
                All wines <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-px overflow-x-auto no-scrollbar bg-hairline border border-hairline">
              {saleWines.map(wine => {
                const pricing = getPricing(wine.id);
                const estate = getWinery(wine.wineryId);
                return (
                  <button
                    key={wine.id}
                    onClick={() => setSelected({ item: wine, type: 'wine' })}
                    className="bg-paper text-left group w-60 shrink-0 flex flex-col hover:bg-parchment transition-colors"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <ImageWithLoader
                        asset={wine.image}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <Tag tone="sale" className="self-start mb-2">Save {pricing.discount}%</Tag>
                      <h3 className="font-display text-lg text-ink leading-snug">{wine.name}</h3>
                      {estate && (
                        <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">{estate.name}</p>
                      )}
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="font-body text-sm line-through text-ink/40">{pricing.original}</span>
                        <span className="font-display text-xl text-terracotta">{pricing.display}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* What's on + meet the Somm */}
        <section className="py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper border border-hairline rounded-sm p-8 md:p-10 flex flex-col items-start">
            <Calendar className="w-5 h-5 text-brass mb-4" />
            <Kicker className="mb-2">The diary</Kicker>
            <h3 className="font-display text-2xl md:text-3xl font-medium text-ink leading-tight mb-3">
              What's on in {region.shortName}
            </h3>
            <p className="font-body text-ink/60 leading-relaxed mb-6 flex-1">
              Harvest festivals, winemaker dinners, music drifting over the vines. The Somm keeps the diary so you
              arrive on the right weekend.
            </p>
            <Button variant="secondary" onClick={() => navigate(`/${regionId}/guide/whats-on`)}>
              See the diary <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-ink rounded-sm p-8 md:p-10 flex flex-col items-start text-parchment">
            <MessageSquare className="w-5 h-5 text-brass-soft mb-4" />
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft mb-2">Meet the Somm</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-3">
              Twenty years walking {region.shortName}
            </h3>
            <p className="font-body text-parchment/70 leading-relaxed mb-6 flex-1">
              Keys to every cellar door, opinions on all of them. Ask what to taste, where to eat, or where to be
              standing at four o'clock.
            </p>
            <Button variant="primary" onClick={() => navigate(`/${regionId}/sommelier`)}>
              Ask the Somm <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
