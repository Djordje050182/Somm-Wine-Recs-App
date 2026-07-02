import { Winery } from '../../../types';
import { POKOLBIN_WINERIES } from './wineries-pokolbin';
import { WIDER_HUNTER_WINERIES } from './wineries-wider';

// The full Hunter roster: Pokolbin heartland plus Broke Fordwich, Mount View,
// Lovedale and the Upper Hunter. 51 real estates.

export const HUNTER_WINERIES: Winery[] = [...POKOLBIN_WINERIES, ...WIDER_HUNTER_WINERIES];
