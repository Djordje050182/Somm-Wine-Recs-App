import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Region, RegionData, Winery, WineDetail, Experience, RegionEvent } from '../types';
import { REGION_REGISTRY, DEFAULT_REGION_ID, getRegionData } from '../data/regions';

interface RegionContextValue {
  region: Region;
  wineries: Winery[];
  wines: WineDetail[];
  experiences: Experience[];
  events: RegionEvent[];
  regionId: string;
  liveRegions: RegionData[];
}

const RegionContext = createContext<RegionContextValue | null>(null);

export const resolveRegionId = (fromRoute?: string): string => {
  if (fromRoute && REGION_REGISTRY[fromRoute]) return fromRoute;
  const stored = localStorage.getItem('sommRegion');
  if (stored && REGION_REGISTRY[stored]) return stored;
  return DEFAULT_REGION_ID;
};

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = useParams<{ regionId?: string }>();
  const regionId = resolveRegionId(params.regionId);

  const value = useMemo<RegionContextValue>(() => {
    const data = getRegionData(regionId);
    localStorage.setItem('sommRegion', regionId);
    return {
      region: data.region,
      wineries: data.wineries,
      wines: data.wines,
      experiences: data.experiences,
      events: data.events ?? [],
      regionId,
      liveRegions: Object.values(REGION_REGISTRY),
    };
  }, [regionId]);

  useEffect(() => {
    document.title = `Somm — ${value.region.name}, properly`;
  }, [value.region.name]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export const useRegion = (): RegionContextValue => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used inside RegionProvider');
  return ctx;
};
