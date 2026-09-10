import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { useCategories } from '../hooks/useCategories';
import { Spinner } from '../components/ui/Spinner';

export const HomePage = () => {
  const { categories } = useCategories();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products', { params: { featured: true, limit: 12 } })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="container-content relative grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center animate-fade-up">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
              New arrivals every week
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Gear that keeps up with you.
            </h1>
            <p className="mt-5 max-w-md text-base text-slate-300">
              From flagship phones to studio-grade audio, Voltix brings you tested electronics at
              prices that make sense. Fast shipping, secure checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-500"
              >
                Shop all products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop?category=mobile"
                className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-white/5 px-6 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse phones
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((p, i) => (
              <Link
                key={p._id}
                to={`/product/${p.slug}`}
                className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${i % 2 === 1 ? 'mt-8' : ''}`}
              >
                <ProductImage src={p.images[0]} alt={p.name} className="aspect-square w-full" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-line bg-white">
        <div className="container-content grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Free shipping', text: 'On all orders over $50' },
            { icon: ShieldCheck, title: 'Secure payments', text: 'Encrypted Stripe checkout' },
            { icon: RefreshCcw, title: '30-day returns', text: 'No-questions refunds' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-content py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
            <p className="mt-1 text-ink-muted">Find exactly what you're looking for.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group card-surface flex flex-col items-center gap-3 p-5 text-center transition-shadow hover:shadow-lift"
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-surface-muted">
                <ProductImage src={cat.image} alt={cat.name} className="h-full w-full" />
              </div>
              <span className="text-sm font-semibold text-ink group-hover:text-brand-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-content pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured products</h2>
            <p className="mt-1 text-ink-muted">Hand-picked by our team.</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : featured.length === 0 ? (
          <p className="py-12 text-center text-ink-muted">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
