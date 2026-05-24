
import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, ArrowRight, CreditCard, CheckCircle, MapPin, User, Mail, ChevronLeft, Lock, Truck } from 'lucide-react';
import { getCart, updateCartQuantity, clearCart, getWinePricing } from '../services/commerceService';
import { WINES, WINERIES } from '../data/wineries';
import { CartItem, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const saveOrder = (items: CartItem[], total: number, address: string) => {
  const existingOrders: Order[] = JSON.parse(localStorage.getItem('sommOrders') || '[]');
  const statuses: Order['status'][] = ['Confirmed', 'Packing', 'Shipped', 'Delivered'];
  const newOrder: Order = {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    items: items.map(item => {
      const wine = WINES.find(w => w.id === item.wineId);
      const pricing = getWinePricing(item.wineId);
      return { wineId: item.wineId, name: wine?.name || item.wineId, quantity: item.quantity, price: pricing.price };
    }),
    total,
    status: statuses[Math.floor(Math.random() * 2)],
    address,
  };
  existingOrders.push(newOrder);
  localStorage.setItem('sommOrders', JSON.stringify(existingOrders));
  return newOrder;
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'checkout' | 'processing' | 'success'>('cart');
  const [orderId, setOrderId] = useState('');

  // Checkout form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) { setItems(getCart()); setStep('cart'); }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => setItems(getCart());
    window.addEventListener('somm-cart-update', handleUpdate);
    return () => window.removeEventListener('somm-cart-update', handleUpdate);
  }, []);

  const total = items.reduce((sum, item) => {
    return sum + (getWinePricing(item.wineId).price * item.quantity);
  }, 0);

  const shipping = total > 150 ? 0 : 12;

  const handleProceedToCheckout = () => {
    // Pre-fill from account if available
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
    }
    setStep('checkout');
  };

  const handlePlaceOrder = () => {
    setFormError('');
    if (!firstName || !lastName || !email || !address || !suburb || !postcode) {
      setFormError('Please fill in all fields.'); return;
    }
    setStep('processing');
    const fullAddress = `${address}, ${suburb} ${postcode}`;
    setTimeout(() => {
      const order = saveOrder(items, total + shipping, fullAddress);
      setOrderId(order.id);
      clearCart();
      setStep('success');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={step === 'cart' ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfb] shrink-0">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-1">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <div className="bg-[#1a1a1a] p-2 rounded-lg text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1a1a1a] leading-tight">
                {step === 'cart' && 'Your Cellar'}
                {step === 'checkout' && 'Checkout'}
                {step === 'processing' && 'Processing...'}
                {step === 'success' && 'Order Confirmed'}
              </h2>
              {step === 'cart' && items.length > 0 && (
                <p className="text-xs text-gray-400">{items.reduce((a, i) => a + i.quantity, 0)} item{items.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Step: Cart */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium text-lg">Your cart is empty.</p>
                  <p className="text-sm mt-1">Start exploring the library to fill your cellar.</p>
                  <button onClick={onClose} className="mt-6 text-[#6b1e2e] font-bold underline">Browse Wines</button>
                </div>
              ) : (
                items.map(item => {
                  const wine = WINES.find(w => w.id === item.wineId);
                  if (!wine) return null;
                  const pricing = getWinePricing(item.wineId);
                  const winery = WINERIES.find(w => w.id === wine.wineryId);
                  return (
                    <div key={item.wineId} className="flex gap-4">
                      <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img src={wine.image} className="w-full h-full object-cover" alt={wine.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1a1a1a] leading-tight text-sm mb-0.5 truncate">{wine.name}</h4>
                        <p className="text-xs text-gray-400 mb-0.5">{wine.vintage} · {wine.variety}</p>
                        {winery && <p className="text-[10px] text-[#a68d60] font-bold truncate">{winery.name}</p>}
                        <div className="flex items-center justify-between mt-2">
                          {pricing.isSale ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 line-through">{pricing.original}</span>
                              <span className="font-bold text-[#b91c1c] text-sm">{pricing.display}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-[#1a1a1a]">{pricing.display}</span>
                          )}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                            <button onClick={() => updateCartQuantity(item.wineId, item.quantity - 1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><Minus className="w-3 h-3 text-gray-500" /></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.wineId, item.quantity + 1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><Plus className="w-3 h-3 text-gray-500" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-[#f8f4f0] shrink-0 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span className="font-medium">${total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : 'font-medium'}>
                    {shipping === 0 ? 'Free' : `$${shipping}`}
                  </span>
                </div>
                {total <= 150 && (
                  <p className="text-[11px] text-[#a68d60] font-medium">
                    Add ${150 - total} more for free shipping
                  </p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-[#1a1a1a]">Total</span>
                  <span className="text-2xl font-black text-[#1a1a1a] font-serif">${total + shipping}</span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#6b1e2e] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:bg-[#852539] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secure checkout · No card charged yet
                </p>
              </div>
            )}
          </>
        )}

        {/* Step: Checkout */}
        {step === 'checkout' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Delivery address */}
              <div className="bg-white border border-[#e5e1da] rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-[#1a1a1a] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#a68d60]" /> Delivery Address
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Alex" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Sommelier" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Street Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="123 Vine Street" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Suburb</label>
                    <input value={suburb} onChange={e => setSuburb(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="Sydney" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Postcode</label>
                    <input value={postcode} onChange={e => setPostcode(e.target.value)} className="w-full bg-[#f8f4f0] p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6b1e2e]/20" placeholder="2000" />
                  </div>
                </div>
              </div>

              {/* Payment — stubbed */}
              <div className="bg-white border border-[#e5e1da] rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-[#1a1a1a] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#a68d60]" /> Payment
                </h3>
                <div className="bg-[#f8f4f0] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-6 bg-[#1a1a1a] rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-400">Stripe — Demo mode</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Demo</span>
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Payments powered by Stripe. No card is charged in demo mode.
                </p>
              </div>

              {/* Order summary */}
              <div className="bg-white border border-[#e5e1da] rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-[#1a1a1a]">Order Summary</h3>
                {items.map(item => {
                  const wine = WINES.find(w => w.id === item.wineId);
                  const pricing = getWinePricing(item.wineId);
                  return (
                    <div key={item.wineId} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[70%]">{wine?.name} ×{item.quantity}</span>
                      <span className="font-medium">${pricing.price * item.quantity}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-gray-100">
                  <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between font-black text-[#1a1a1a]">
                  <span>Total</span><span>${total + shipping}</span>
                </div>
              </div>

              {formError && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl font-medium">{formError}</p>}
            </div>

            <div className="p-5 border-t border-gray-100 bg-[#f8f4f0] shrink-0">
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-[#6b1e2e] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:bg-[#852539] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Place Order · ${total + shipping} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <div className="w-16 h-16 border-4 border-[#6b1e2e] border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-bold text-[#1a1a1a]">Processing Order...</h3>
            <p className="text-gray-500 mt-2 text-sm">Confirming with the winery cellar door.</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] font-serif">Order Confirmed!</h3>
            <p className="text-sm text-gray-400 mt-2 font-mono tracking-wider">#{orderId}</p>
            <p className="text-gray-500 mt-4 mb-3 max-w-xs text-sm">Your wines are being carefully packed by the cellar door team.</p>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold mb-8">
              <Truck className="w-4 h-4" /> Estimated delivery: 3–5 business days
            </div>
            <button onClick={onClose} className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all">
              Continue Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
