import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import { formatPrice, formatDate } from '../../lib/format';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';

const statuses: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusTone: Record<string, 'success' | 'warning' | 'brand' | 'neutral' | 'danger'> = {
  paid: 'success',
  delivered: 'success',
  pending: 'warning',
  processing: 'brand',
  shipped: 'brand',
  cancelled: 'danger',
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-ink-muted">Track payments and update fulfillment status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card-surface py-16 text-center text-ink-muted">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const customer = typeof order.user === 'object' ? order.user : null;
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="card-surface overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-surface-subtle"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-ink-muted">#{order._id.slice(-8)}</span>
                    <span className="text-sm font-medium text-ink">{customer?.name ?? 'Customer'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-ink-muted">{formatDate(order.createdAt)}</span>
                    <Badge tone={order.isPaid ? 'success' : 'warning'}>{order.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                    <Badge tone={statusTone[order.status] ?? 'neutral'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="font-bold">{formatPrice(order.totalPrice)}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line bg-surface-subtle p-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.product} className="flex justify-between text-sm">
                              <span className="text-ink-soft">{item.name} × {item.quantity}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Shipping</h4>
                        <div className="text-sm text-ink-soft">
                          <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="mt-1">{order.shippingAddress.phone}</p>
                          {customer && <p className="mt-1 text-ink-muted">{customer.email}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                      <label className="text-sm font-medium text-ink-soft">Update status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                        className="h-10 rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
