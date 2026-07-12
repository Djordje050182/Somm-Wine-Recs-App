import { Region, WineDetail, Winery } from '../types';
import { profileForAgent } from './tasteProfile';

// Dynamic variables substituted into the ElevenLabs agent prompt so one
// agent serves every region — and, when the catalogue is to hand, so the
// Somm greets a returning guest by their palate rather than as a stranger.
// The agent carries neutral defaults for every placeholder, so older
// clients that send nothing still work.
export const agentRegionVars = (
  region: Region,
  wines?: WineDetail[],
  wineries?: Winery[]
): Record<string, string> => ({
  region_name: region.name,
  region_short: region.shortName,
  region_context: region.ai.promptContext,
  region_signatures: region.ai.signatureProducers.join(', '),
  guest_profile:
    wines && wineries ? profileForAgent(wines, wineries) : 'A first-time guest — no tasting history with us yet.',
});
