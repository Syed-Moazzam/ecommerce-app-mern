import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Store,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/categories', label: 'Categories', icon: Tags, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, end: false },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )
          }
        >
          <Icon className="h-4.5 w-4.5" /> {label}
        </NavLink>
      ))}
      <div className="my-2 border-t border-white/10" />
      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <Store className="h-4.5 w-4.5" /> View store
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
      >
        <LogOut className="h-4.5 w-4.5" /> Sign out
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink lg:flex">
        <Link to="/admin" className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Zap className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="font-display text-lg font-extrabold text-white">Voltix Admin</span>
        </Link>
        {nav}
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <span className="font-display text-lg font-extrabold text-white">Voltix Admin</span>
              <button onClick={() => setOpen(false)} className="text-slate-300"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-ink-soft"><Menu className="h-6 w-6" /></button>
          <span className="font-display text-lg font-extrabold">Voltix Admin</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
