import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];

export const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="font-display text-xl font-extrabold text-ink">Voltix</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-brand-700' : 'text-ink-muted hover:text-ink'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-surface-muted"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div ref={menuRef} className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-soft hover:bg-surface-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <UserIcon className="h-4 w-4" />
                </span>
                <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-card">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-muted"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-muted"
                    >
                      <ShoppingCart className="h-4 w-4" /> My orders
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-surface-muted md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="container-content flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-surface-muted'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-line" />
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-muted">
                    Admin dashboard
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-muted">
                    My orders
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
