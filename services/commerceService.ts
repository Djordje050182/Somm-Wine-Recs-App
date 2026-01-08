
import { WINES } from '../data/wineries';
import { CartItem } from '../types';

// --- Events ---
export const dispatchCartEvent = () => {
  window.dispatchEvent(new Event('somm-cart-update'));
};

export const dispatchPriceEvent = () => {
  window.dispatchEvent(new Event('somm-price-update'));
};

// --- Cart Management ---
export const getCart = (): CartItem[] => {
  return JSON.parse(localStorage.getItem('sommCart') || '[]');
};

export const addToCart = (wineId: string, quantity: number = 1) => {
  const cart = getCart();
  const existing = cart.find(item => item.wineId === wineId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ wineId, quantity });
  }
  
  localStorage.setItem('sommCart', JSON.stringify(cart));
  dispatchCartEvent();
};

export const updateCartQuantity = (wineId: string, quantity: number) => {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(item => item.wineId !== wineId);
  } else {
    const item = cart.find(i => i.wineId === wineId);
    if (item) item.quantity = quantity;
  }
  localStorage.setItem('sommCart', JSON.stringify(cart));
  dispatchCartEvent();
};

export const clearCart = () => {
  localStorage.removeItem('sommCart');
  dispatchCartEvent();
};

// --- Pricing & Offers Engine ---
// We simulate a backend database of "Offers" set by partners in the PartnerPortal
interface ProductOffer {
  salePrice?: number; // If present, this is the override price
  isOnSale: boolean;
}

export const getProductOffer = (wineId: string): ProductOffer | null => {
  const offers = JSON.parse(localStorage.getItem('partnerOffers') || '{}');
  return offers[wineId] || null;
};

export const setProductOffer = (wineId: string, offer: ProductOffer) => {
  const offers = JSON.parse(localStorage.getItem('partnerOffers') || '{}');
  offers[wineId] = offer;
  localStorage.setItem('partnerOffers', JSON.stringify(offers));
  dispatchPriceEvent();
};

// Helper to get the final display price details
export const getWinePricing = (wineId: string) => {
  const wine = WINES.find(w => w.id === wineId);
  if (!wine) return { price: 0, display: '$0', original: null, isSale: false, discount: 0 };

  const rawPrice = parseInt(wine.price.replace(/[^0-9]/g, ''));
  const offer = getProductOffer(wineId);

  if (offer && offer.isOnSale && offer.salePrice) {
    const discount = Math.round(((rawPrice - offer.salePrice) / rawPrice) * 100);
    return {
      price: offer.salePrice,
      display: `$${offer.salePrice}`,
      original: wine.price,
      isSale: true,
      discount: discount
    };
  }

  return {
    price: rawPrice,
    display: wine.price,
    original: null,
    isSale: false,
    discount: 0
  };
};
