import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProductImage } from '../components/ProductImage';
import { ShippingAddress } from '../types';

export const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name ?? '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const handleChange = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = Object.entries(address).filter(([, v]) => !v.trim());
    if (required.length > 0) {
      toast.error('Please fill in all shipping fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/payment/create-checkout-session', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
      });
      // Cart is cleared once the customer returns successfully; keep it until redirect.
      sessionStorage.setItem('pending_order', data.orderId);
      clearCart();
      window.location.href = data.url; // Stripe-hosted checkout
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container-content py-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card-surface p-6">
          <h2 className="text-lg font-bold">Shipping address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Full name" id="fullName" value={address.fullName} onChange={handleChange('fullName')} placeholder="Jane Doe" />
            </div>
            <div className="sm:col-span-2">
              <Input label="Street address" id="address" value={address.address} onChange={handleChange('address')} placeholder="123 Main St, Apt 4B" />
            </div>
            <Input label="City" id="city" value={address.city} onChange={handleChange('city')} placeholder="Karachi" />
            <Input label="Postal code" id="postalCode" value={address.postalCode} onChange={handleChange('postalCode')} placeholder="75500" />
            <Input label="Country" id="country" value={address.country} onChange={handleChange('country')} placeholder="Pakistan" />
            <Input label="Phone" id="phone" value={address.phone} onChange={handleChange('phone')} placeholder="+92 300 0000000" />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-brand-50 p-4">
            <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-700" />
            <div className="text-sm text-brand-900">
              <p className="font-semibold">You'll pay securely on Stripe</p>
              <p className="mt-0.5 text-brand-700">
                Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
              </p>
            </div>
          </div>
        </div>

        <aside className="card-surface h-fit p-6">
          <h2 className="text-lg font-bold">Your order</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <span className="flex-1 truncate text-sm text-ink-soft">{item.name}</span>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span><span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span><span className="font-medium text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="font-semibold text-ink">Total</span>
              <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" loading={submitting} className="mt-6 w-full">
            <Lock className="h-4 w-4" /> Pay {formatPrice(subtotal)}
          </Button>
        </aside>
      </form>
    </div>
  );
};
