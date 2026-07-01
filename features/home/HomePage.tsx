import React from 'react';
import { useNavigate } from 'react-router-dom';
import Discover from '../../components/Discover';
import { useRegion } from '../../contexts/RegionContext';
import { AppTab } from '../../types';

// Editorial front page for the active region.
// NOTE: temporary adapter around the legacy Discover component while the
// home page is rebuilt — maps old tab navigation onto routes.

const TAB_ROUTES: Partial<Record<AppTab, string>> = {
  [AppTab.WINES]: 'wines',
  [AppTab.PLANNER]: 'plan',
  [AppTab.CONCIERGE]: 'plan/concierge',
  [AppTab.SOMMELIER]: 'sommelier',
  [AppTab.SCANNER]: 'sommelier?scan=1',
  [AppTab.REGIONS]: 'guide/the-land',
  [AppTab.EXPERIENCES]: 'guide/experiences',
  [AppTab.EVENTS]: 'guide/whats-on',
  [AppTab.FAVORITES]: 'cellar',
  [AppTab.CELLAR]: 'cellar/my-cellar',
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { regionId } = useRegion();

  const handleNavigate = (tab: AppTab) => {
    navigate(`/${regionId}/${TAB_ROUTES[tab] ?? ''}`);
  };

  return <Discover onNavigate={handleNavigate} />;
};

export default HomePage;
