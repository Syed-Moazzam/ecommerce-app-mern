import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api } from '../lib/api';
import { Order } from '../types';
import { formatPrice, formatDate } from '../lib/format';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const statusTone: Record<string, 'success' | 'warning' | 'brand' | 'neutral' | 'danger'> = {
  paid: 'success',
  delivered: 'success',
  pending: 'warning',
  processing: 'brand',
  shipped: 'brand',
  cancelled: 'danger',
};

export const OrdersPage = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/my')
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <PageLoader />;

  return (
    <div className="container-content py-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">My orders</h1>
      {orders.length === 0 ? (
        <div className="card-surface flex flex-col items-center py-20 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="mt-4 text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-ink-muted">Your orders will appear here.</p>
          <Link to="/shop" className="mt-6"><Button>Start shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="font-mono text-xs text-ink-muted">#{order._id.slice(-8)}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone[order.status] ?? 'neutral'}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="text-lg font-bold">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 text-sm text-ink-soft">
                {order.items.map((item) => (
                  <span key={item.product} className="rounded-lg bg-surface-muted px-2.5 py-1">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
