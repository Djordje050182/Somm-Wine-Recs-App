import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, PhoneOff, CalendarCheck, ExternalLink, Route, Share2, Check, MapPin,
} from 'lucide-react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Kicker } from '../../components/ui';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import {
  asRoutable, matchByName, threadRoute, encodeShareableRun, shareUrlForRun,
  googleMapsUrl, resolveStartPoint, StartPoint,
} from '../../services/itinerary';
import { Itinerary } from '../../types';

// The Somm, out loud — a live voice conversation with an ElevenLabs
// conversational agent, built into the page (no floating widget). The agent id
// is public by design; the API key never leaves the server side.
//
// Two client tools let the conversation reach into the app:
//   open_booking_page — surfaces an estate's real booking page as a card
//   draw_up_plan      — threads named stops into a routed day, saves it to
//                       the planner and offers the shareable memento link

const AGENT_ID = 'agent_7301kwh2rqsjeapresnmn56tcrwd';

type BookingCard = { name: string; url: string };
type PlanCard = { itinerary: Itinerary; shareUrl: string; mapsUrl: string };

const VoiceSommInner: React.FC = () => {
  const { region, regionId } = useRegion();
  const { wineries, experiences } = useCatalog();
  const [booking, setBooking] = useState<BookingCard | null>(null);
  const [plan, setPlan] = useState<PlanCard | null>(null);
  const [planCopied, setPlanCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onError: () => setError('The line to the cellar door dropped. Give it another try.'),
  });
  const { status, isSpeaking } = conversation;

  const openBookingPage = useCallback(
    ({ winery_name }: { winery_name: string }) => {
      const items = [...wineries, ...experiences];
      const match = matchByName(items, winery_name ?? '');
      const url = (match as any)?.bookingUrl ?? (match as any)?.website;
      if (!match || !url) return `Could not find a booking page for ${winery_name}.`;
      setBooking({ name: match.name, url });
      return `Booking page for ${match.name} is now showing in the app, just below our conversation.`;
    },
    [wineries, experiences]
  );

  const drawUpPlan = useCallback(
    async ({ stop_names, start_from }: { stop_names: string; start_from?: string }) => {
      const names = String(stop_names ?? '')
        .split(/[,;]|\band\b/i)
        .map(s => s.trim())
        .filter(Boolean);
      if (names.length === 0) return 'No stops given — name the estates first.';

      const catalogue = asRoutable(wineries, experiences);
      const found = names
        .map(n => matchByName(catalogue, n))
        .filter((x): x is NonNullable<typeof x> => !!x);
      const missed = names.filter(n => !matchByName(catalogue, n));
      if (found.length === 0)
        return `None of those stops are in the ${region.shortName} guide: ${names.join(', ')}.`;

      // Deduplicate while keeping the spoken order
      const unique = [...new Map(found.map(f => [f.id, f])).values()].slice(0, 6);

      const wantsOwnLocation = /current|my location|here|where i am/i.test(start_from ?? '');
      const start: StartPoint = wantsOwnLocation
        ? await resolveStartPoint(region)
        : region.defaultStart;

      const itinerary = threadRoute(unique, start);
      if (!itinerary) return 'The route would not thread — try different stops.';

      // Land it in the planner so "Build your run" shows the same day
      localStorage.setItem(`sommPlannerIds-${region.id}`, JSON.stringify(unique.map(u => u.id)));
      localStorage.setItem(`sommItinerary-${region.id}`, JSON.stringify(itinerary));

      const shareUrl = shareUrlForRun(region.id, encodeShareableRun(itinerary, start));
      setPlan({ itinerary, shareUrl, mapsUrl: googleMapsUrl(start, itinerary.wineries) });
      setBooking(null);

      const order = itinerary.wineries.map(w => `${w.name} at ${w.arrival}`).join(', then ');
      const missedNote = missed.length ? ` I could not find: ${missed.join(', ')}.` : '';
      return `The plan is drawn and showing in the app with a shareable link. Starting from ${start.name}: ${order}, glasses down by ${itinerary.estimatedEnd}.${missedNote}`;
    },
    [wineries, experiences, region]
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
      clientTools: {
        open_booking_page: openBookingPage,
        draw_up_plan: drawUpPlan,
      },
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

  const copyPlanLink = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan.shareUrl);
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2400);
  };

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

      {plan && (
        <div className="w-full max-w-md bg-paper border border-hairline rounded-sm p-5 text-left animate-slide-up">
          <div className="flex items-start gap-3">
            <Route className="w-5 h-5 text-claret shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-ui text-xs font-semibold uppercase tracking-kicker text-ink/40 mb-1">
                The Somm has drawn your day
              </p>
              <p className="font-display text-lg text-ink leading-snug">
                {plan.itinerary.wineries.length} stops · glasses down by {plan.itinerary.estimatedEnd}
              </p>
              <p className="font-body text-sm text-ink/60 mt-1.5 leading-relaxed">
                {plan.itinerary.wineries.map(w => w.name).join(' → ')}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              to={`/${regionId}/plan`}
              className="flex items-center justify-center gap-2 w-full bg-claret text-parchment font-ui text-sm font-semibold py-3 rounded-sm hover:bg-claret-deep transition-colors"
            >
              <MapPin className="w-4 h-4" /> See it on the map
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyPlanLink}
                className="flex items-center justify-center gap-2 border border-hairline bg-paper font-ui text-xs font-semibold text-ink py-2.5 rounded-sm hover:border-ink/40 transition-colors"
              >
                {planCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {planCopied ? 'Copied' : 'Share with the group'}
              </button>
              <a
                href={plan.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-hairline bg-paper font-ui text-xs font-semibold text-ink py-2.5 rounded-sm hover:border-ink/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Google Maps
              </a>
            </div>
          </div>
        </div>
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
          to taste, where to eat, what goes with the duck — or tell him the shape of your day, two
          kids and a love of reds included, and he'll draw up the whole run.
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
