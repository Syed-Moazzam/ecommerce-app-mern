import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { user, isAdmin } = useAuth();

  return (
  <footer className="mt-20 border-t border-line bg-white">
    <div className="container-content grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Zap className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="font-display text-lg font-extrabold text-ink">Voltix</span>
        </Link>
        <p className="mt-3 max-w-xs text-sm text-ink-muted">
          Premium consumer electronics, tested and shipped fast. Real gear, honest prices.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink">Shop</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li><Link to="/shop" className="hover:text-ink">All products</Link></li>
          <li><Link to="/shop?category=mobile" className="hover:text-ink">Mobile</Link></li>
          <li><Link to="/shop?category=tv" className="hover:text-ink">TV</Link></li>
          <li><Link to="/shop?category=watches" className="hover:text-ink">Watches</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink">Account</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          {!user && (
            <>
              <li><Link to="/login" className="hover:text-ink">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-ink">Create account</Link></li>
            </>
          )}
          {user && isAdmin && (
            <li><Link to="/admin" className="hover:text-ink">Admin dashboard</Link></li>
          )}
          {user && !isAdmin && (
            <>
              <li><Link to="/orders" className="hover:text-ink">My orders</Link></li>
              <li><Link to="/cart" className="hover:text-ink">Cart</Link></li>
            </>
          )}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink">Support</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li>Free shipping over $50</li>
          <li>30-day returns</li>
          <li>Secure Stripe checkout</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-line">
      <div className="container-content flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Voltix. All rights reserved.</p>
        <p>Payments secured by Stripe · Test mode</p>
      </div>
    </div>
  </footer>
  );
};
