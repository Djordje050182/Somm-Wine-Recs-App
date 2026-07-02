import React from 'react';
import { Package } from 'lucide-react';
import { getOrders } from '../../services/commerce';
import { EmptyState, Tag, SectionHeading } from '../../components/ui';

const STATUS_TONE: Record<string, 'default' | 'success'> = {
  Confirmed: 'default',
  Packing: 'default',
  Shipped: 'success',
  Delivered: 'success',
};

const OrderHistory: React.FC = () => {
  const orders = getOrders();

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        body="When you buy from the library, your cases will appear here — packed by the cellar door and sent on their way."
      />
    );
  }

  return (
    <div className="py-10 animate-fade-in">
      <SectionHeading kicker="Order history" title="Your cases" />
      <div className="mt-8 border border-hairline divide-y divide-hairline bg-paper">
        {orders.map(order => (
          <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 border border-hairline rounded-sm flex items-center justify-center text-brass shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3">
                <p className="font-ui text-sm font-semibold text-ink">Order {order.id}</p>
                <p className="font-ui text-xs text-ink/40">
                  {new Date(order.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <p className="font-body text-sm text-ink/60 mt-1 truncate">
                {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Tag tone={STATUS_TONE[order.status] ?? 'default'}>{order.status}</Tag>
              <span className="font-display text-lg text-ink">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
