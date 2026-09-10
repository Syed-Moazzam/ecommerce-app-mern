import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCategories } from '../hooks/useCategories';
import { Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import { cn } from '../lib/cn';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

export const ShopPage = () => {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '');

  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const search = params.get('search') ?? '';
  const page = Number(params.get('page') ?? '1');

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { category, sort, search, page, limit: 12 } })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, search, page]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update('search', searchInput.trim());
  };

  return (
    <div className="container-content py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {category ? categories.find((c) => c.slug === category)?.name ?? 'Shop' : 'All products'}
        </h1>
        <p className="mt-1 text-ink-muted">Browse our full electronics catalog.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-6">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm focus:border-brand-500"
            />
          </form>

          <div className="card-surface p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal className="h-4 w-4" /> Categories
            </p>
            <div className="space-y-1">
              <button
                onClick={() => update('category', '')}
                className={cn(
                  'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  !category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-soft hover:bg-surface-muted'
                )}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => update('category', cat.slug)}
                  className={cn(
                    'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    category === cat.slug ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-soft hover:bg-surface-muted'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-ink-muted">
              {loading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'}`}
            </span>
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-500"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
          ) : products.length === 0 ? (
            <div className="card-surface flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-lg font-semibold text-ink">No products found</p>
              <p className="text-sm text-ink-muted">Try a different category or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onPageChange={(p) => update('page', String(p))} className="mt-10" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
