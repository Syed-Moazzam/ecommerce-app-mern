import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../../lib/api';
import { Product } from '../../types';
import { formatPrice } from '../../lib/format';
import { ProductImage } from '../../components/ProductImage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';
import { useCategories } from '../../hooks/useCategories';

const PAGE_SIZE = 10;

export const AdminProductsPage = () => {
  const { categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/products', { params: { search, category, page, limit: PAGE_SIZE, sort: 'newest' } })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        load();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-ink-muted">Manage your catalog and product images.</p>
        </div>
        <Link to="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Add product</Button>
        </Link>
      </div>

      <Tabs
        className="mb-5"
        value={category}
        onChange={setCategory}
        tabs={[{ value: '', label: 'All' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm focus:border-brand-500"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <div className="card-surface py-16 text-center text-ink-muted">No products found.</div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-subtle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                          <ProductImage src={p.images[0]} alt={p.name} className="h-full w-full" />
                        </div>
                        <span className="line-clamp-1 font-medium text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {typeof p.category === 'object' ? p.category.name : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 0 ? 'text-rose-600' : p.stock < 10 ? 'text-amber-600' : 'text-ink-soft'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.stock <= 0 ? <Badge tone="danger">Sold out</Badge> : <Badge tone="success">Active</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-muted"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleting === p._id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} className="border-t border-line py-4" />
        </div>
      )}
    </div>
  );
};
