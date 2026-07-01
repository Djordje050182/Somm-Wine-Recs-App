import { demoPaymentProvider } from './demoPaymentProvider';
import { PaymentProvider } from './types';

export type * from './types';
export { MEMBERSHIP_TIERS, getTier } from './membership';
export { mergeWineries, mergeWines, getWinePricing, parsePrice } from './catalogService';
export { getOrders, createOrder } from './orderService';
export * as partnerStore from './partnerStore';

// The one line to change when Stripe arrives:
// export const payments: PaymentProvider = stripePaymentProvider;
export const payments: PaymentProvider = demoPaymentProvider;
