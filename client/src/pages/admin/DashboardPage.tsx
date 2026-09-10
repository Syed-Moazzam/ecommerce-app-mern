import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Tags, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { PageLoader } from '../../components/ui/Spinner';

interface Stats {
  orderCount: number;
  paidOrders: number;
  revenue: number;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [counts, setCounts] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/admin/stats'),
      api.get('/products', { params: { limit: 1 } }),
      api.get('/categories'),
    ])
      .then(([statsRes, productsRes, catsRes]) => {
        setStats(statsRes.data.stats);
        setCounts({
          products: productsRes.data.total,
          categories: catsRes.data.categories.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { label: 'Revenue', value: formatPrice(stats?.revenue ?? 0), icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Paid orders', value: String(stats?.paidOrders ?? 0), icon: ShoppingBag, tone: 'bg-brand-50 text-brand-600' },
    { label: 'Products', value: String(counts.products), icon: Package, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Categories', value: String(counts.categories), icon: Tags, tone: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-ink-muted">Overview of your store's performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card-surface p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-bold text-ink">{value}</p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { to: '/admin/products', label: 'Manage products', desc: 'Add, edit and upload images' },
          { to: '/admin/categories', label: 'Manage categories', desc: 'Organize your catalog' },
          { to: '/admin/orders', label: 'View orders', desc: 'Track and update fulfillment' },
        ].map((action) => (
          <Link key={action.to} to={action.to} className="card-surface group flex items-center justify-between p-5 transition-shadow hover:shadow-lift">
            <div>
              <p className="font-semibold text-ink">{action.label}</p>
              <p className="text-sm text-ink-muted">{action.desc}</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-brand-600" />
          </Link>
        ))}
      </div>
    </div>
  );
};
