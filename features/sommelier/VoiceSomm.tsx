import React, { useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Kicker } from '../../components/ui';
import { useRegion } from '../../contexts/RegionContext';

// The Somm, out loud — a live voice conversation powered by an ElevenLabs
// conversational agent. The agent id is public by design; the API key never
// leaves the server side.

const AGENT_ID = 'agent_7301kwh2rqsjeapresnmn56tcrwd';
const EMBED_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
const SCRIPT_ID = 'elevenlabs-convai-embed';

const VoiceSomm: React.FC = () => {
  const { region } = useRegion();

  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = EMBED_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="py-14 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center">
        <Kicker className="mb-3">Live from the cellar door</Kicker>
        <h2 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight mb-5">
          Talk to the Somm.
        </h2>
        <p className="font-body text-lg text-ink/60 leading-relaxed mb-3">
          The world's greatest sommelier, in your ear as you wander {region.shortName}. Ask him what
          to taste, where to eat, what goes with the duck — or let him tell you why old Semillon
          tastes of toast when no oak has ever touched it.
        </p>
        <p className="font-body text-sm text-ink/40 italic mb-10">
          He's knowledgeable, he's charming, and he's just a little bit cheeky. You'll need your
          microphone — and he does like the last word.
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 border border-hairline rounded-full flex items-center justify-center text-claret bg-paper">
            <Mic className="w-6 h-6" />
          </div>
          {React.createElement('elevenlabs-convai', { 'agent-id': AGENT_ID })}
          <p className="font-ui text-[10px] text-ink/30 uppercase tracking-kicker">
            Voice conversations use your microphone · nothing is recorded by Somm
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceSomm;
