import React, { Suspense, lazy } from 'react';
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
import AboutPage from './features/about/AboutPage';
import { DEFAULT_REGION_ID } from './data/regions';

// The winery portal carries the charting library — loaded only when a partner opens it
const PortalPage = lazy(() => import('./features/portal/PortalPage'));

// Hash routing works on GitHub Pages project sites without any 404 tricks and
// gives shareable deep links: /#/hunter-valley/wines

// After a deploy, an already-open app can request a lazy chunk whose hash no
// longer exists. One automatic reload picks up the fresh shell; anything else
// gets a polite dead end instead of a stack trace.
const ChunkRecovery: React.FC = () => {
  const alreadyTried = sessionStorage.getItem('somm-chunk-reload') === '1';
  React.useEffect(() => {
    if (!alreadyTried) {
      sessionStorage.setItem('somm-chunk-reload', '1');
      window.location.reload();
    }
  }, [alreadyTried]);
  if (!alreadyTried) return null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-parchment text-ink px-6 text-center">
      <p className="font-display text-3xl mb-3">The cellar door stuck.</p>
      <p className="font-body text-ink/60 mb-6">Something didn't load properly — a fresh pour usually fixes it.</p>
      <button
        onClick={() => { sessionStorage.removeItem('somm-chunk-reload'); window.location.reload(); }}
        className="font-ui text-sm font-semibold bg-claret text-parchment px-6 py-3 rounded-sm"
      >
        Reload Somm
      </button>
    </div>
  );
};

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
    errorElement: <ChunkRecovery />,
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
      { path: 'about', element: <AboutPage /> },
      {
        path: 'portal',
        element: (
          <Suspense fallback={<div className="py-20 text-center font-body text-ink/40">Pouring…</div>}>
            <PortalPage />
          </Suspense>
        ),
      },
      { path: '*', element: <Navigate to="." replace /> },
    ],
  },
]);
