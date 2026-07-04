import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../../contexts/RegionContext';
import Experiences from '../../components/Experiences';
import WhatsOn from '../../components/WhatsOn';
import WineryDirectory from './WineryDirectory';

// RegionExplorer carries the charting library — loaded only when the tab opens
const RegionExplorer = lazy(() => import('../../components/RegionExplorer'));

// The Guide — everything about the region in one place:
// wineries directory, experiences, what's on, and the land itself.

const TABS = [
  { id: 'wineries', label: 'Wineries' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'whats-on', label: "What's on" },
  { id: 'the-land', label: 'The land' },
] as const;

const GuidePage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const { regionId } = useRegion();
  const navigate = useNavigate();
  const active = TABS.find(t => t.id === tab)?.id ?? 'wineries';

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6 border-b border-hairline overflow-x-auto no-scrollbar pt-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => navigate(`/${regionId}/guide/${t.id}`)}
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

      {active === 'wineries' && <WineryDirectory />}
      {active === 'experiences' && <Experiences />}
      {active === 'whats-on' && <WhatsOn />}
      {active === 'the-land' && (
        <Suspense fallback={<div className="py-20 text-center font-body text-ink/40">Pouring…</div>}>
          <RegionExplorer />
        </Suspense>
      )}
    </div>
  );
};

export default GuidePage;
