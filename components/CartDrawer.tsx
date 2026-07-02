import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useRegion } from '../contexts/RegionContext';
import { useAuth } from '../contexts/AuthContext';
import { payments, createOrder } from '../services/commerce';
import type { CheckoutLine } from '../services/commerce';
import ImageWithLoader from './ImageWithLoader';
import { Button, Kicker, EmptyState } from './ui';

// The case drawer — review, details, payment, confirmation.
// Payments go through the commerce service's provider; today that is the
// demonstration provider, tomorrow it is Stripe, and this file won't notice.

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'case' | 'details' | 'processing' | 'done';

const FREE_SHIPPING_OVER = 150;
const SHIPPING = 12;

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <label className="block">
    <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/50 block mb-1.5">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-paper border border-hairline rounded-sm px-3 py-2.5 font-ui text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/40"
    />
  </label>
);

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, clearCart } = useCart();
  const { getWine, getWinery, getPricing } = useCatalog();
  const { region } = useRegion();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('case');
  const [orderRef, setOrderRef] = useState('');
  const [error, setError] = useState('');

  // Delivery details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('case');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'processing') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, step, onClose]);

  const bottleCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + getPricing(i.wineId).price * i.quantity, 0);
  const shipping = subtotal > FREE_SHIPPING_OVER ? 0 : SHIPPING;
  const total = subtotal + shipping;
  const sym = region.currencySymbol;

  const handleToDetails = () => {
    if (user) {
      setName(prev => prev || user.name);
      setEmail(prev => prev || user.email);
    }
    setError('');
    setStep('details');
  };

  const handlePay = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !address.trim() || !suburb.trim() || !postcode.trim()) {
      setError('Please complete every field — the courier is a stickler.');
      return;
    }
    setStep('processing');

    const fullAddress = `${address}, ${suburb} ${postcode}`;
    const lines: CheckoutLine[] = items.map(i => ({
      description: getWine(i.wineId)?.name ?? i.wineId,
      unitAmount: getPricing(i.wineId).price,
      quantity: i.quantity,
      ref: i.wineId,
    }));
    if (shipping > 0) {
      lines.push({ description: 'Shipping', unitAmount: shipping, quantity: 1, ref: 'shipping' });
    }

    try {
      const result = await payments.checkout({
        lines,
        currency: region.currency,
        customerEmail: user?.email || email,
        shippingAddress: fullAddress,
      });

      if (result.status === 'redirect') {
        // Future Stripe Checkout — hand the browser over.
        window.location.href = result.url;
        return;
      }

      const orderItems = items.map(i => ({
        wineId: i.wineId,
        name: getWine(i.wineId)?.name ?? i.wineId,
        quantity: i.quantity,
        price: getPricing(i.wineId).price,
      }));
      const order = createOrder(orderItems, total, fullAddress, result.reference);
      setOrderRef(order.id);
      clearCart();
      setStep('done');
    } catch {
      setError('The payment could not be completed. Nothing was taken.');
      setStep('details');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-ink/50 animate-fade-in"
        onClick={step === 'processing' ? undefined : onClose}
      />

      <div className="relative w-full max-w-md h-full bg-parchment border-l border-hairline flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline bg-paper shrink-0">
          <div className="flex items-center gap-3">
            {step === 'details' && (
              <button
                onClick={() => setStep('case')}
                aria-label="Back to your case"
                className="text-ink/50 hover:text-ink transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-display text-2xl text-ink leading-none">Your case</h2>
              {step === 'case' && bottleCount > 0 && (
                <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1.5">
                  {bottleCount} bottle{bottleCount !== 1 ? 's' : ''}
                </p>
              )}
              {step === 'details' && (
                <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1.5">
                  Delivery details
                </p>
              )}
            </div>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-ink transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step: the case */}
        {step === 'case' && (
          <>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyState
                  title="Your case is empty"
                  body="The list is long and the valley is generous. Go and choose something worth carrying home."
                  action={
                    <Button variant="secondary" size="sm" onClick={onClose}>
                      Browse the list
                    </Button>
                  }
                />
              ) : (
                <div className="px-5">
                  {items.map((item, i) => {
                    const wine = getWine(item.wineId);
                    if (!wine) return null;
                    const pricing = getPricing(item.wineId);
                    const winery = getWinery(wine.wineryId);
                    return (
                      <div
                        key={item.wineId}
                        className={`flex gap-4 py-5 ${i > 0 ? 'border-t border-hairline' : ''}`}
                      >
                        <div className="w-16 shrink-0">
                          <ImageWithLoader asset={wine.image} className="w-full aspect-[3/4] rounded-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-base text-ink leading-snug truncate">{wine.name}</h4>
                          <p className="font-ui text-xs text-ink/50 mt-0.5">
                            {wine.vintage} · {wine.variety}
                          </p>
                          {winery && (
                            <p className="font-ui text-[10px] uppercase tracking-kicker text-brass mt-1 truncate">
                              {winery.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div className="leading-none">
                              {pricing.isSale && (
                                <span className="block font-ui text-[11px] text-ink/40 line-through mb-1">
                                  {pricing.original}
                                </span>
                              )}
                              <span className="font-display text-base font-medium text-brass">
                                {pricing.display}
                              </span>
                            </div>
                            <div className="flex items-center border border-hairline rounded-sm bg-paper">
                              <button
                                onClick={() => updateQuantity(item.wineId, item.quantity - 1)}
                                aria-label="One fewer"
                                className="px-2.5 py-1.5 text-ink/50 hover:text-ink transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-ui text-xs font-semibold w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.wineId, item.quantity + 1)}
                                aria-label="One more"
                                className="px-2.5 py-1.5 text-ink/50 hover:text-ink transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-hairline bg-paper px-5 py-5 shrink-0 space-y-2.5">
                <div className="flex justify-between font-ui text-sm text-ink/60">
                  <span>Subtotal</span>
                  <span>{sym}{subtotal}</span>
                </div>
                <div className="flex justify-between font-ui text-sm text-ink/60">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-vine font-semibold' : ''}>
                    {shipping === 0 ? 'On the house' : `${sym}${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-xs italic text-ink/50">
                    Another {sym}{FREE_SHIPPING_OVER - subtotal + 1} and the shipping is on us.
                  </p>
                )}
                <div className="flex justify-between items-baseline pt-2.5 border-t border-hairline">
                  <span className="font-ui text-sm font-semibold text-ink">Total</span>
                  <span className="font-display text-2xl font-medium text-ink">{sym}{total}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleToDetails}>
                  Continue to details
                </Button>
                <p className="text-center font-ui text-[10px] uppercase tracking-kicker text-ink/35">
                  Demonstration checkout — no payment is taken
                </p>
              </div>
            )}
          </>
        )}

        {/* Step: details */}
        {step === 'details' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              <div className="space-y-4">
                <Kicker>Where the case is going</Kicker>
                <Field label="Full name" value={name} onChange={setName} placeholder="Alex Vintner" />
                <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
                <Field label="Street address" value={address} onChange={setAddress} placeholder="12 Vine Street" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Suburb" value={suburb} onChange={setSuburb} placeholder="Sydney" />
                  <Field label="Postcode" value={postcode} onChange={setPostcode} placeholder="2000" />
                </div>
              </div>

              <div>
                <Kicker className="mb-3">The order</Kicker>
                <div className="border border-hairline bg-paper rounded-sm px-4 py-1">
                  {items.map(item => {
                    const wine = getWine(item.wineId);
                    const pricing = getPricing(item.wineId);
                    return (
                      <div
                        key={item.wineId}
                        className="flex justify-between gap-4 py-2.5 border-b border-hairline last:border-b-0 font-ui text-sm"
                      >
                        <span className="text-ink/70 truncate">
                          {wine?.name ?? item.wineId} <span className="text-ink/40">× {item.quantity}</span>
                        </span>
                        <span className="text-ink shrink-0">{sym}{pricing.price * item.quantity}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-2.5 border-b border-hairline font-ui text-sm text-ink/50">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'On the house' : `${sym}${shipping}`}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-3">
                    <span className="font-ui text-sm font-semibold text-ink">Total</span>
                    <span className="font-display text-xl font-medium text-ink">{sym}{total}</span>
                  </div>
                </div>
              </div>

              {error && (
                <p className="font-body text-sm text-terracotta border border-terracotta/40 rounded-sm px-4 py-3">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-hairline bg-paper px-5 py-5 shrink-0 space-y-2.5">
              <Button className="w-full" size="lg" onClick={handlePay}>
                Confirm the case · {sym}{total}
              </Button>
              <p className="text-center font-ui text-[10px] uppercase tracking-kicker text-ink/35">
                Demonstration checkout — no payment is taken
              </p>
            </div>
          </>
        )}

        {/* Step: processing */}
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
            <div className="w-9 h-9 border-2 border-hairline border-t-claret rounded-full animate-spin mb-6" />
            <h3 className="font-display text-2xl text-ink">Speaking with the cellar door</h3>
            <p className="font-body text-sm text-ink/50 mt-2">
              A moment while the order is confirmed. No payment is taken in this demonstration.
            </p>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
            <Kicker>Order {orderRef}</Kicker>
            <h3 className="font-display text-3xl text-ink mt-3 leading-tight">
              Your case is confirmed.
            </h3>
            <p className="font-body text-lg text-ink/60 mt-3 max-w-xs">
              The cellar door is packing it now. Expect it on the doorstep within three to five working days.
            </p>
            <Button className="mt-8" onClick={onClose}>
              Back to the valley
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
