import React, { useEffect, useState } from 'react';
import { Building2, Wine, BadgePercent, CreditCard, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { partnerStore, getTier } from '../../services/commerce';
import { Kicker, Tag, Rule } from '../../components/ui';
import ListingEditor from './ListingEditor';
import WineManager from './WineManager';
import OfferManager from './OfferManager';
import Membership from './Membership';
import Analytics from './Analytics';

// The winery portal shell — the back office where estates manage their
// listing, their wines, their offers and their Somm membership.

type Section = 'listing' | 'wines' | 'offers' | 'membership' | 'analytics';

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'listing', label: 'Listing', icon: Building2 },
  { id: 'wines', label: 'Wines', icon: Wine },
  { id: 'offers', label: 'Offers', icon: BadgePercent },
  { id: 'membership', label: 'Membership', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const Gate: React.FC<{ title: string; body: string; footnote?: string }> = ({ title, body, footnote }) => (
  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
    <div className="max-w-xl mx-auto text-center">
      <Kicker className="mb-3">For estates</Kicker>
      <h1 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight mb-5">{title}</h1>
      <p className="font-body text-lg text-ink/60 leading-relaxed">{body}</p>
      {footnote && (
        <>
          <Rule className="my-8 max-w-[80px] mx-auto" />
          <p className="font-ui text-xs text-ink/40 uppercase tracking-kicker">{footnote}</p>
        </>
      )}
    </div>
  </div>
);

const PortalPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { getWinery } = useCatalog();
  const [section, setSection] = useState<Section>('listing');

  // Re-render when the partner store changes so the tier tag stays current
  // after a subscription is taken out or cancelled on the Membership tab.
  const [, setVersion] = useState(0);
  useEffect(() => partnerStore.onPartnerDataChange(() => setVersion(v => v + 1)), []);

  if (loading) return null;

  if (!user) {
    return (
      <Gate
        title="The winery portal"
        body="Estates sign in here to manage their listing, present their wines, run offers, and look after their Somm membership. Everything you change appears to travellers straight away."
        footnote="Sign in from the top of the page with your estate account"
      />
    );
  }

  if (user.role !== 'winery') {
    return (
      <Gate
        title="This area is for estate accounts"
        body="The portal is where wineries manage their presence on Somm. Your cellar, saved estates and orders live under your account instead."
      />
    );
  }

  const winery = user.wineryId ? getWinery(user.wineryId) : undefined;

  if (!winery) {
    return (
      <Gate
        title="We can't find your estate here"
        body="Your account is registered to an estate outside this region's catalogue. Switch region from the header, or write to us if something looks amiss."
      />
    );
  }

  const sub = partnerStore.getActiveSubscription(winery.id);
  const tier = sub ? getTier(sub.tierId) : null;

  const goToMembership = () => setSection('membership');

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Portal header */}
      <div className="pt-8 pb-6 border-b border-hairline">
        <Kicker className="mb-2">The winery portal</Kicker>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-ink leading-tight">{winery.name}</h1>
          {tier ? (
            <Tag tone="success">{tier.name} member</Tag>
          ) : (
            <Tag>Trial listing</Tag>
          )}
        </div>
      </div>

      {/* Mobile horizontal tabs */}
      <div className="lg:hidden flex gap-6 border-b border-hairline overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`font-ui text-sm font-semibold whitespace-nowrap pt-4 pb-3 -mb-px border-b-2 transition-colors ${
              section === s.id
                ? 'border-claret text-claret'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="lg:flex lg:gap-10 py-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <nav className="space-y-1 sticky top-24">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 border-l-2 font-ui text-sm font-semibold text-left transition-colors ${
                    active
                      ? 'border-claret text-claret bg-paper'
                      : 'border-transparent text-ink/50 hover:text-ink hover:border-hairline'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Section body */}
        <div className="flex-1 min-w-0 pt-6 lg:pt-0">
          {section === 'listing' && <ListingEditor wineryId={winery.id} />}
          {section === 'wines' && <WineManager wineryId={winery.id} onGoToMembership={goToMembership} />}
          {section === 'offers' && <OfferManager wineryId={winery.id} onGoToMembership={goToMembership} />}
          {section === 'membership' && <Membership wineryId={winery.id} />}
          {section === 'analytics' && <Analytics wineryId={winery.id} />}
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
