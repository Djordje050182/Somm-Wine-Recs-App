import { WineDetail } from '../../../types';
import { POKOLBIN_WINES } from './wines-pokolbin';
import { WIDER_HUNTER_WINES } from './wines-wider';
import { BOUTIQUE_WINES } from './wines-boutique';

// The library: 122 real wines across 55 estates, every entry hand-written.

export const HUNTER_WINES: WineDetail[] = [...POKOLBIN_WINES, ...WIDER_HUNTER_WINES, ...BOUTIQUE_WINES];
