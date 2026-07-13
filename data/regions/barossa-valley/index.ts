import { RegionData } from '../../../types';
import { BAROSSA_VALLEY } from './region';
import { VALLEY_WINERIES } from './wineries-valley';
import { NORTH_WINERIES } from './wineries-north';
import { EDEN_WINERIES } from './wineries-eden';
import { VALLEY_WINES } from './wines-valley';
import { NORTH_WINES } from './wines-north';
import { EDEN_WINES } from './wines-eden';
import { BAROSSA_EXPERIENCES_FULL } from './experiences-full';
import { BAROSSA_EVENTS } from './events';

export const BAROSSA_VALLEY_DATA: RegionData = {
  region: BAROSSA_VALLEY,
  wineries: [...VALLEY_WINERIES, ...NORTH_WINERIES, ...EDEN_WINERIES],
  wines: [...VALLEY_WINES, ...NORTH_WINES, ...EDEN_WINES],
  experiences: BAROSSA_EXPERIENCES_FULL,
  events: BAROSSA_EVENTS,
};
