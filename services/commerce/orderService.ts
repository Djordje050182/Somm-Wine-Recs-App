import { Order } from '../../types';

const ORDERS_KEY = 'sommOrders';

export const getOrders = (): Order[] => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const createOrder = (
  items: Order['items'],
  total: number,
  address: string,
  reference: string
): Order => {
  const order: Order = {
    id: reference,
    date: new Date().toISOString(),
    items,
    total,
    status: 'Confirmed',
    address,
  };
  saveOrder(order);
  return order;
};
