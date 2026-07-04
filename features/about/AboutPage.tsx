import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { Kicker } from '../../components/ui';

// The provenance page: who is behind this, where the facts come from, and
// which parts are still rehearsing. Short on purpose — trust reads faster
// than marketing.

const AboutPage: React.FC = () => {
  const { regionId } = useRegion();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 animate-fade-in">
      <Kicker className="mb-3">About</Kicker>
      <h1 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight mb-8">
        The world's great wine regions, walked <span className="italic">properly</span>
      </h1>

      <div className="space-y-6 font-body text-[17px] text-ink/75 leading-relaxed">
        <p>
          Somm is an independent guide to wine country, built by people who would rather
          spend a day between cellar doors than almost anywhere else. It began with the
          Hunter Valley — Australia's oldest wine region and, we would argue, its most
          quietly charming — and it is written the way a good sommelier talks: warmly,
          specifically, and with a story attached to every bottle.
        </p>
        <p>
          At its centre is the Somm himself: a voice you can actually talk to, who
          recommends estates, plans your day, draws the route, and gets the cellar door
          on the phone. He is knowledgeable, a little cheeky, and he never takes a
          commission from anyone he sends you to.
        </p>
      </div>

      <div className="mt-10 border border-hairline rounded-sm bg-paper p-6 md:p-8">
        <Kicker className="mb-4">Where the facts come from</Kicker>
        <ul className="space-y-3 font-body text-[15px] text-ink/70 leading-relaxed">
          <li>
            <span className="font-semibold text-ink">Estates and experiences</span> — every entry is
            researched from the venue's own website: hours, fees, bookings, photography.
            Photographs come from the estates themselves, never from stock libraries.
          </li>
          <li>
            <span className="font-semibold text-ink">Crowd ratings</span> — wine scores are gathered
            from Vivino, venue ratings from Google. We harvest them; we never invent them.
            Where a number could not be verified, none is shown.
          </li>
          <li>
            <span className="font-semibold text-ink">Weather</span> — live from Open-Meteo for the
            region itself, refreshed through the day.
          </li>
          <li>
            <span className="font-semibold text-ink">The diary</span> — events are checked against
            their organisers. If a festival has been discontinued, it does not appear.
          </li>
        </ul>
      </div>

      <div className="mt-6 border border-hairline rounded-sm bg-paper p-6 md:p-8">
        <Kicker className="mb-4">A note on what's still rehearsing</Kicker>
        <p className="font-body text-[15px] text-ink/70 leading-relaxed">
          Somm is young. Accounts and the wine case currently run in demonstration mode —
          nothing is charged and no bottles ship yet. Bookings are always completed
          directly with the estate, on their own website or phone line, and payment stays
          between you and the cellar door.
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          to={`/${regionId}/sommelier?talk=1`}
          className="inline-flex items-center justify-center gap-2 bg-claret text-parchment font-ui text-sm font-semibold px-6 py-3.5 rounded-sm hover:bg-claret-deep transition-colors"
        >
          <Mic className="w-4 h-4" /> Meet the Somm
        </Link>
        <Link
          to={`/${regionId}/guide`}
          className="inline-flex items-center justify-center gap-2 border border-hairline bg-paper text-ink font-ui text-sm font-semibold px-6 py-3.5 rounded-sm hover:border-ink/40 transition-colors"
        >
          Browse the guide <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
