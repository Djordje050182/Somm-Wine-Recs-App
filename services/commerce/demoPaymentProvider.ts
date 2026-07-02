// Demonstration payment provider — simulates latency and always succeeds.
// No card is charged; no payment rails are touched.

import { PaymentProvider, CheckoutInput, CheckoutResult, SubscriptionInput, Subscription } from './types';
import { saveSubscription, cancelSubscriptionById } from './partnerStore';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const demoPaymentProvider: PaymentProvider = {
  name: 'demo',

  async checkout(_input: CheckoutInput): Promise<CheckoutResult> {
    await wait(1800);
    return { status: 'succeeded', reference: `demo-${crypto.randomUUID().slice(0, 8)}` };
  },

  async subscribe(input: SubscriptionInput): Promise<Subscription> {
    await wait(1200);
    const now = new Date();
    const renews = new Date(now);
    renews.setMonth(renews.getMonth() + 1);
    const sub: Subscription = {
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      wineryId: input.wineryId,
      tierId: input.tierId,
      status: 'active',
      startedOn: now.toISOString(),
      renewsOn: renews.toISOString(),
    };
    saveSubscription(sub);
    return sub;
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await wait(600);
    cancelSubscriptionById(subscriptionId);
  },
};
