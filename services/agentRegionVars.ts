import { Region } from '../types';

// Dynamic variables substituted into the ElevenLabs agent prompt so one
// agent serves every region. The agent carries Hunter Valley defaults for
// these placeholders, so older clients that send nothing still work.
export const agentRegionVars = (region: Region): Record<string, string> => ({
  region_name: region.name,
  region_short: region.shortName,
  region_context: region.ai.promptContext,
  region_signatures: region.ai.signatureProducers.join(', '),
});
