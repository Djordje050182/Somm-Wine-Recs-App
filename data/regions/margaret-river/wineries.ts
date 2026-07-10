import { Winery } from '../../../types';
import { WILYABRUP_WINERIES } from './wineries-wilyabrup';
import { NORTH_WINERIES } from './wineries-north';
import { SOUTH_WINERIES } from './wineries-south';

export const MARGARET_RIVER_WINERIES: Winery[] = [
  ...WILYABRUP_WINERIES,
  ...NORTH_WINERIES,
  ...SOUTH_WINERIES,
];
