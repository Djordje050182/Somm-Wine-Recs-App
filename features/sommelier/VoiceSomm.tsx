import React, { useCallback, useState } from 'react';
import { Mic, MicOff, PhoneOff, CalendarCheck, ExternalLink } from 'lucide-react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Kicker } from '../../components/ui';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';

// The Somm, out loud — a live voice conversation with an ElevenLabs
// conversational agent, built into the page (no floating widget). The agent id
// is public by design; the API key never leaves the server side.
//
// The agent has one client tool, open_booking_page: when the guest agrees to
// book, we surface the estate's real booking page as a card below the call
// button. The guest completes the booking with the cellar door — the Somm
// never takes payment.

const AGENT_ID = 'agent_7301kwh2rqsjeapresnmn56tcrwd';

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

type BookingCard = { name: string; url: string };

const VoiceSommInner: React.FC = () => {
  const { wineries, experiences } = useCatalog();
  const [booking, setBooking] = useState<BookingCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onError: () => setError('The line to the cellar door dropped. Give it another try.'),
  });
  const { status, isSpeaking } = conversation;

  const openBookingPage = useCallback(
    ({ winery_name }: { winery_name: string }) => {
      const wanted = normalise(winery_name ?? '');
      if (!wanted) return 'No name given.';
      const match = (name: string) => {
        const n = normalise(name);
        return n === wanted || n.includes(wanted) || wanted.includes(n);
      };
      const winery = wineries.find(w => match(w.name));
      const experience = winery ? undefined : experiences.find(e => match(e.name));
      const name = winery?.name ?? experience?.name;
      const url = winery?.bookingUrl ?? winery?.website ?? experience?.bookingUrl ?? experience?.website;
      if (!name || !url) return `Could not find a booking page for ${winery_name}.`;
      setBooking({ name, url });
      return `Booking page for ${name} is now showing in the app, just below our conversation.`;
    },
    [wineries, experiences]
  );

  const startCall = async () => {
    setError(null);
    try {
      // Surface the permission ask explicitly so a refusal reads clearly
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('The Somm needs your microphone — allow it in your browser and try again.');
      return;
    }
    conversation.startSession({
      agentId: AGENT_ID,
      connectionType: 'webrtc',
      clientTools: { open_booking_page: openBookingPage },
    });
  };

  const connected = status === 'connected';
  const connecting = status === 'connecting';

  const statusLine = connected
    ? isSpeaking
      ? 'The Somm is speaking…'
      : 'Listening — go on, ask him anything'
    : connecting
      ? 'Walking up from the cellar…'
      : 'Tap to pull up a chair';

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={connected || connecting ? () => conversation.endSession() : startCall}
        aria-label={connected ? 'End the conversation' : 'Start talking to the Somm'}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-claret focus-visible:ring-offset-4 focus-visible:ring-offset-parchment ${
          connected
            ? 'bg-claret text-parchment shadow-lg scale-105'
            : connecting
              ? 'bg-claret/70 text-parchment animate-pulse'
              : 'bg-claret text-parchment hover:bg-claret-deep hover:scale-105'
        }`}
      >
        {connected && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full border-2 border-claret/40 ${
              isSpeaking ? 'animate-ping' : ''
            }`}
          />
        )}
        {connected ? <PhoneOff className="w-8 h-8" /> : <Mic className="w-9 h-9" />}
      </button>

      <p className="font-ui text-xs font-semibold uppercase tracking-kicker text-ink/50" aria-live="polite">
        {statusLine}
      </p>

      {error && (
        <p className="flex items-center gap-2 font-body text-sm text-claret max-w-sm">
          <MicOff className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      {booking && (
        <div className="w-full max-w-md bg-paper border border-hairline rounded-sm p-5 text-left animate-slide-up">
          <div className="flex items-start gap-3">
            <CalendarCheck className="w-5 h-5 text-claret shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-ui text-xs font-semibold uppercase tracking-kicker text-ink/40 mb-1">
                The Somm suggests
              </p>
              <p className="font-display text-lg text-ink leading-snug">{booking.name}</p>
            </div>
          </div>
          <a
            href={booking.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full bg-claret text-parchment font-ui text-sm font-semibold py-3 rounded-sm hover:bg-claret-deep transition-colors"
          >
            Book with the cellar door <ExternalLink className="w-4 h-4" />
          </a>
          <p className="font-ui text-[10px] text-ink/30 mt-2 text-center">
            You book directly with the estate — the Somm never takes payment.
          </p>
        </div>
      )}
    </div>
  );
};

const VoiceSomm: React.FC = () => {
  const { region } = useRegion();

  return (
    <div className="py-10 md:py-14 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center px-1">
        <Kicker className="mb-3">Live from the cellar door</Kicker>
        <h2 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight mb-5">
          Talk to the Somm.
        </h2>
        <p className="font-body text-base md:text-lg text-ink/60 leading-relaxed mb-3">
          The world's greatest sommelier, in your ear as you wander {region.shortName}. Ask him what
          to taste, where to eat, what goes with the duck — or let him tell you why old Semillon
          tastes of toast when no oak has ever touched it.
        </p>
        <p className="font-body text-sm text-ink/40 italic mb-8 md:mb-10">
          He's knowledgeable, he's charming, and he's just a little bit cheeky. You'll need your
          microphone — and he does like the last word.
        </p>

        <ConversationProvider>
          <VoiceSommInner />
        </ConversationProvider>

        <p className="font-ui text-[10px] text-ink/30 uppercase tracking-kicker mt-8">
          Voice conversations use your microphone · nothing is recorded by Somm
        </p>
      </div>
    </div>
  );
};

export default VoiceSomm;
