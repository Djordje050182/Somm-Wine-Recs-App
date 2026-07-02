import { WineDetail } from '../../../types';
import { POKOLBIN_WINES } from './wines-pokolbin';
import { WIDER_HUNTER_WINES } from './wines-wider';

// The library: 114 real wines across 51 estates, every entry hand-written.

export const HUNTER_WINES: WineDetail[] = [...POKOLBIN_WINES, ...WIDER_HUNTER_WINES];
