import { Link, Navigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';
import { ProductImage } from '../components/ProductImage';
import { Button } from '../components/ui/Button';

export const CartPage = () => {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center justify-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Add some products to get started.</p>
        <Link to="/shop" className="mt-6">
          <Button size="lg">Browse products</Button>
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container-content py-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card-surface flex gap-4 p-4">
              <Link to={`/product/${item.slug}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                <ProductImage src={item.image} alt={item.name} className="h-full w-full" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-ink hover:text-brand-700">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-400 hover:text-rose-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex h-9 items-center rounded-lg border border-line">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card-surface h-fit p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <div className="border-t border-line pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-xl font-bold text-ink">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/shop" className="mt-3 block text-center text-sm font-medium text-brand-700 hover:text-brand-800">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};
