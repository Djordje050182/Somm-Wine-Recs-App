
import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, CreditCard, CheckCircle } from 'lucide-react';
import { getCart, updateCartQuantity, clearCart, getWinePricing } from '../services/commerceService';
import { WINES } from '../data/wineries';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  useEffect(() => {
    if (isOpen) {
      setItems(getCart());
      setStep('cart');
    }
  }, [isOpen]);

  // Listen for updates while open
  useEffect(() => {
    const handleUpdate = () => setItems(getCart());
    window.addEventListener('somm-cart-update', handleUpdate);
    return () => window.removeEventListener('somm-cart-update', handleUpdate);
  }, []);

  const total = items.reduce((sum, item) => {
    const pricing = getWinePricing(item.wineId);
    return sum + (pricing.price * item.quantity);
  }, 0);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setStep('checkout');
    // Simulate API call
    setTimeout(() => {
      setStep('success');
      clearCart();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfb]">
          <div className="flex items-center gap-3">
            <div className="bg-[#1a1a1a] p-2 rounded-lg text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#1a1a1a]">Your Cellar</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium text-lg">Your cart is empty.</p>
                  <p className="text-sm">Start exploring the library to fill your cellar.</p>
                  <button onClick={onClose} className="mt-6 text-[#6b1e2e] font-bold underline">
                    Browse Wines
                  </button>
                </div>
              ) : (
                items.map(item => {
                  const wine = WINES.find(w => w.id === item.wineId);
                  if (!wine) return null;
                  const pricing = getWinePricing(item.wineId);

                  return (
                    <div key={item.wineId} className="flex gap-4">
                      <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img src={wine.image} className="w-full h-full object-cover" alt={wine.name} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#1a1a1a] leading-tight mb-1">{wine.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{wine.vintage} • {wine.variety}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             {pricing.isSale ? (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 line-through decoration-red-400">{pricing.original}</span>
                                    <span className="font-bold text-[#b91c1c]">{pricing.display}</span>
                                </div>
                             ) : (
                                <span className="font-bold text-[#1a1a1a]">{pricing.display}</span>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
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
              <div className="p-6 border-t border-gray-100 bg-[#f8f4f0]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-[#1a1a1a] font-serif">${total}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#6b1e2e] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#852539] transition-all flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
                  <CreditCard className="w-3 h-3" /> Secure Payment via Stripe
                </p>
              </div>
            )}
          </>
        )}

        {step === 'checkout' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
             <div className="w-16 h-16 border-4 border-[#6b1e2e] border-t-transparent rounded-full animate-spin mb-6"></div>
             <h3 className="text-xl font-bold text-[#1a1a1a]">Processing Payment...</h3>
             <p className="text-gray-500 mt-2">Connecting to winery gateway.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-[#1a1a1a] font-serif">Order Confirmed!</h3>
             <p className="text-gray-500 mt-2 mb-8 max-w-xs">Your wines are being carefully packed by the cellar door team. You will receive an email shortly.</p>
             <button onClick={onClose} className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-bold">Continue Exploring</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
