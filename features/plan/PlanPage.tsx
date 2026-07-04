import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../../contexts/RegionContext';
import ItineraryBuilder from '../../components/ItineraryBuilder';
import Concierge from '../../components/Concierge';
import SharedRun from './SharedRun';

// Plan a trip: build your own run through the valley, or let the Somm
// sketch the whole day for you. /plan/shared renders a run someone sent
// you — a read-only memento, no tabs.

const TABS = [
  { id: 'route', label: 'Build your run' },
  { id: 'concierge', label: 'Ask the concierge' },
] as const;

const PlanPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const { regionId } = useRegion();
  const navigate = useNavigate();

  if (tab === 'shared') {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <SharedRun />
      </div>
    );
  }

  const active = TABS.find(t => t.id === tab)?.id ?? 'route';

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6 border-b border-hairline pt-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => navigate(`/${regionId}/plan/${t.id}`)}
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

      {active === 'route' && <ItineraryBuilder />}
      {active === 'concierge' && <Concierge />}
    </div>
  );
};

export default PlanPage;
