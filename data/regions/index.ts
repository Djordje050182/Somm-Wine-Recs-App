import { RegionData } from '../../types';
import { HUNTER_VALLEY_DATA } from './hunter-valley';

export { COMING_SOON_REGIONS } from './coming-soon';

// Register new regions here — one line per region, nothing else changes.
export const REGION_REGISTRY: Record<string, RegionData> = {
  'hunter-valley': HUNTER_VALLEY_DATA,
};

export const DEFAULT_REGION_ID = 'hunter-valley';

export const getRegionData = (id: string): RegionData =>
  REGION_REGISTRY[id] ?? REGION_REGISTRY[DEFAULT_REGION_ID];
