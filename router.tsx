import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { RegionProvider } from './contexts/RegionContext';
import { CatalogProvider } from './contexts/CatalogContext';
import AppShell from './layouts/AppShell';
import HomePage from './features/home/HomePage';
import GuidePage from './features/guide/GuidePage';
import WinesPage from './features/wines/WinesPage';
import PlanPage from './features/plan/PlanPage';
import SommelierPage from './features/sommelier/SommelierPage';
import CellarPage from './features/cellar/CellarPage';
import AccountPage from './features/account/AccountPage';
import PortalPage from './features/portal/PortalPage';
import { DEFAULT_REGION_ID } from './data/regions';

// Hash routing works on GitHub Pages project sites without any 404 tricks and
// gives shareable deep links: /#/hunter-valley/wines

const RegionLayout: React.FC = () => (
  <RegionProvider>
    <CatalogProvider>
      <AppShell />
    </CatalogProvider>
  </RegionProvider>
);

export const router = createHashRouter([
  { path: '/', element: <Navigate to={`/${DEFAULT_REGION_ID}`} replace /> },
  {
    path: '/:regionId',
    element: <RegionLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'guide/:tab', element: <GuidePage /> },
      { path: 'wines', element: <WinesPage /> },
      { path: 'plan', element: <PlanPage /> },
      { path: 'plan/:tab', element: <PlanPage /> },
      { path: 'sommelier', element: <SommelierPage /> },
      { path: 'cellar', element: <CellarPage /> },
      { path: 'cellar/:tab', element: <CellarPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'portal', element: <PortalPage /> },
      { path: '*', element: <Navigate to="." replace /> },
    ],
  },
]);
