// Commerce contracts. The app only talks to these interfaces; the demo
// provider simulates payments locally. When Stripe arrives, implement
// PaymentProvider against the Cloudflare Worker /checkout route and swap
// one line in services/commerce/index.ts.

export interface CheckoutLine {
  description: string;
  unitAmount: number; // in dollars for demo; cents when Stripe lands
  quantity: number;
  ref: string; // wineId / experienceId
}

export interface CheckoutInput {
  lines: CheckoutLine[];
  currency: string;
  customerEmail?: string;
  shippingAddress?: string;
}

export type CheckoutResult =
  | { status: 'succeeded'; reference: string } // demo provider resolves immediately
  | { status: 'redirect'; url: string };       // Stripe Checkout will redirect

export type MembershipTierId = 'listed' | 'featured' | 'premier';

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  pricePerMonth: number;
  blurb: string;
  features: string[];
  wineLimit: number | null;   // null = unlimited
  canCreateOffers: boolean;
  homePlacement: boolean;
}

export interface Subscription {
  id: string;
  wineryId: string;
  tierId: MembershipTierId;
  status: 'active' | 'cancelled';
  startedOn: string;
  renewsOn: string;
}

export interface SubscriptionInput {
  tierId: MembershipTierId;
  wineryId: string;
  customerEmail: string;
}

export interface PaymentProvider {
  readonly name: 'demo' | 'stripe';
  checkout(input: CheckoutInput): Promise<CheckoutResult>;
  subscribe(input: SubscriptionInput): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export interface ProductOffer {
  salePrice?: number;
  isOnSale: boolean;
}

export interface WinePricing {
  price: number;
  display: string;
  original: string | null;
  isSale: boolean;
  discount: number;
}
