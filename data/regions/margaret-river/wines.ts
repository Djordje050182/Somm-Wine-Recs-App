import { WineDetail } from '../../../types';
import { WILYABRUP_WINES } from './wines-wilyabrup';
import { NORTH_WINES } from './wines-north';
import { SOUTH_WINES } from './wines-south';

export const MARGARET_RIVER_WINES: WineDetail[] = [
  ...WILYABRUP_WINES,
  ...NORTH_WINES,
  ...SOUTH_WINES,
];
