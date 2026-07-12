import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../../contexts/RegionContext';
import { useAuth } from '../../contexts/AuthContext';
import Favorites from '../../components/Favorites';
import CellarTracker from '../../components/CellarTracker';
import OrderHistory from './OrderHistory';
import TastingBook from './TastingBook';

// The user's private space: saved estates and bottles, the cellar they
// actually own, and everything they've ordered.

const TABS = [
  { id: 'saved', label: 'Saved' },
  { id: 'tasting-book', label: 'Tasting book' },
  { id: 'my-cellar', label: 'My cellar' },
  { id: 'orders', label: 'Orders' },
] as const;

const CellarPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const { regionId } = useRegion();
  const { user } = useAuth();
  const navigate = useNavigate();
  const active = TABS.find(t => t.id === tab)?.id ?? 'saved';

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6 border-b border-hairline pt-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => navigate(`/${regionId}/cellar/${t.id}`)}
            className={`font-ui text-sm font-semibold whitespace-nowrap pb-3 -mb-px border-b-2 transition-colors ${
              active === t.id
                ? 'border-claret text-claret'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'saved' && <Favorites user={user as any} />}
      {active === 'tasting-book' && <TastingBook />}
      {active === 'my-cellar' && <CellarTracker />}
      {active === 'orders' && <OrderHistory />}
    </div>
  );
};

export default CellarPage;
