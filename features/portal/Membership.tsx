import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { partnerStore, payments, MEMBERSHIP_TIERS, getTier, MembershipTierId } from '../../services/commerce';
import { Button, Card, Tag, Kicker, Rule } from '../../components/ui';

// Membership and billing — the revenue surface. Three tiers, one active
// subscription per estate. The demo provider simulates the payment rails;
// swapping in Stripe changes one line in services/commerce/index.ts.

interface Props {
  wineryId: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const Membership: React.FC<Props> = ({ wineryId }) => {
  const { user } = useAuth();
  const [sub, setSub] = useState(() => partnerStore.getActiveSubscription(wineryId));
  const [processing, setProcessing] = useState<MembershipTierId | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const currentTier = sub ? getTier(sub.tierId) : null;

  const choose = async (tierId: MembershipTierId) => {
    if (!user || processing) return;
    setProcessing(tierId);
    try {
      const next = await payments.subscribe({ tierId, wineryId, customerEmail: user.email });
      setSub(next);
    } finally {
      setProcessing(null);
    }
  };

  const cancel = async () => {
    if (!sub || cancelling) return;
    setCancelling(true);
    try {
      await payments.cancelSubscription(sub.id);
      setSub(partnerStore.getActiveSubscription(wineryId));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-medium text-ink">Membership</h2>
        <p className="font-body text-ink/50 mt-1">
          Your place on Somm — the listing, the library, and how prominently the Somm speaks of you.
        </p>
      </div>

      {/* Current standing */}
      <Card className="p-6">
        {sub && currentTier ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Kicker className="mb-1.5">Your membership</Kicker>
              <p className="font-display text-xl text-ink">
                {currentTier.name} · ${currentTier.pricePerMonth} <span className="font-ui text-xs text-ink/40">per month</span>
              </p>
              <p className="font-ui text-xs text-ink/40 mt-1.5">
                Began {formatDate(sub.startedOn)} · renews {formatDate(sub.renewsOn)}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={cancel} disabled={cancelling}>
              {cancelling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling
                </>
              ) : (
                'Cancel membership'
              )}
            </Button>
          </div>
        ) : (
          <div>
            <Kicker className="mb-1.5">Your membership</Kicker>
            <p className="font-body text-ink/70">
              Your estate is on a courtesy trial with Listed-tier limits. Choose a membership below to make it official.
            </p>
          </div>
        )}
      </Card>

      {/* The tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MEMBERSHIP_TIERS.map(tier => {
          const isCurrent = sub?.tierId === tier.id;
          const isProcessing = processing === tier.id;
          return (
            <Card
              key={tier.id}
              className={`p-6 flex flex-col ${isCurrent ? 'border-claret' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display text-xl text-ink">{tier.name}</h3>
                {isCurrent && <Tag tone="success">Current</Tag>}
              </div>
              <p className="font-display text-3xl text-ink mt-2">
                ${tier.pricePerMonth}
                <span className="font-ui text-xs text-ink/40 ml-1.5">per month</span>
              </p>
              <p className="font-body text-sm text-ink/60 mt-3 leading-relaxed">{tier.blurb}</p>
              <Rule className="my-5" />
              <ul className="space-y-2.5 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 font-ui text-xs text-ink/70">
                    <Check className="w-3.5 h-3.5 text-vine shrink-0 mt-px" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent || processing !== null}
                onClick={() => choose(tier.id)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing
                  </>
                ) : isCurrent ? (
                  'Your plan'
                ) : sub ? (
                  `Move to ${tier.name}`
                ) : (
                  `Choose ${tier.name}`
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="font-ui text-xs text-ink/40">
        Billed monthly, cancel any time. Demonstration billing — no payment is taken.
      </p>
    </div>
  );
};

export default Membership;
