import { Winery } from '../../../types';
import { POKOLBIN_WINERIES } from './wineries-pokolbin';
import { WIDER_HUNTER_WINERIES } from './wineries-wider';
import { BOUTIQUE_WINERIES } from './wineries-boutique';

// The full Hunter roster: Pokolbin heartland plus Broke Fordwich, Mount View,
// Lovedale, Belford and the Upper Hunter. 55 real estates.

export const HUNTER_WINERIES: Winery[] = [...POKOLBIN_WINERIES, ...WIDER_HUNTER_WINERIES, ...BOUTIQUE_WINERIES];
