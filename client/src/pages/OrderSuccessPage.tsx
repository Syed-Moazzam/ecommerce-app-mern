import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';

export const OrderSuccessPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let attempts = 0;
    const poll = () => {
      api
        .get(`/payment/verify/${orderId}`)
        .then(({ data }) => {
          setOrder(data.order);
          setPaid(data.isPaid);
          // Webhook may lag a moment — retry a few times.
          if (!data.isPaid && attempts < 4) {
            attempts += 1;
            setTimeout(poll, 1500);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    };
    poll();
  }, [orderId]);

  if (loading) return <PageLoader />;

  return (
    <div className="container-content flex flex-col items-center py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-11 w-11" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Thank you for your order!</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        {paid
          ? 'Your payment was confirmed and your order is being prepared.'
          : 'Your order was placed. Payment confirmation may take a moment to appear.'}
      </p>

      {order && (
        <div className="card-surface mt-8 w-full max-w-lg p-6 text-left">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-xs text-ink-muted">Order ID</p>
              <p className="font-mono text-sm font-semibold">{order._id}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {paid ? <Package className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {paid ? 'Paid' : 'Pending'}
            </span>
          </div>
          <div className="space-y-3 py-4">
            {order.items.map((item) => (
              <div key={item.product} className="flex justify-between text-sm">
                <span className="text-ink-soft">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link to="/orders"><Button variant="outline">View my orders</Button></Link>
        <Link to="/shop"><Button>Continue shopping</Button></Link>
      </div>
    </div>
  );
};
