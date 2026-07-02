import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Winery, WineDetail, Experience } from '../types';
import { useRegion } from './RegionContext';
import { mergeWineries, mergeWines, getWinePricing } from '../services/commerce';
import { onPartnerDataChange } from '../services/commerce/partnerStore';
import { WinePricing } from '../services/commerce/types';

// The consumer-facing catalogue: region data merged with live partner edits
// (listing overrides, partner-added wines, offers). Re-renders when the
// portal writes to the partner store.

interface CatalogContextValue {
  wineries: Winery[];
  wines: WineDetail[];
  experiences: Experience[];
  getWinery: (id: string) => Winery | undefined;
  getWine: (id: string) => WineDetail | undefined;
  getPricing: (wineId: string) => WinePricing;
  winesForWinery: (wineryId: string) => WineDetail[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wineries: baseWineries, wines: baseWines, experiences } = useRegion();
  const [version, setVersion] = useState(0);

  useEffect(() => onPartnerDataChange(() => setVersion(v => v + 1)), []);

  const value = useMemo<CatalogContextValue>(() => {
    const wineries = mergeWineries(baseWineries);
    const wines = mergeWines(baseWines);
    return {
      wineries,
      wines,
      experiences,
      getWinery: (id: string) => wineries.find(w => w.id === id),
      getWine: (id: string) => wines.find(w => w.id === id),
      getPricing: (wineId: string) => getWinePricing(wines.find(w => w.id === wineId)),
      winesForWinery: (wineryId: string) => wines.filter(w => w.wineryId === wineryId),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseWineries, baseWines, experiences, version]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = (): CatalogContextValue => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
};
