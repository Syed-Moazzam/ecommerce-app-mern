import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../../lib/api';
import { Category } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface FormState {
  name: string;
  brand: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  category: string;
  featured: boolean;
  images: string[];
}

const empty: FormState = {
  name: '',
  brand: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  category: '',
  featured: false,
  images: [],
};

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.categories);
      if (!isEdit && data.categories[0]) {
        setForm((f) => ({ ...f, category: data.categories[0]._id }));
      }
    });
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    // Editing: fetch by id via the products list (find), then hydrate.
    api
      .get('/products', { params: { limit: 50 } })
      .then(({ data }) => {
        const p = data.products.find((x: { _id: string }) => x._id === id);
        if (!p) {
          toast.error('Product not found');
          navigate('/admin/products');
          return;
        }
        setForm({
          name: p.name,
          brand: p.brand ?? '',
          description: p.description,
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          stock: String(p.stock),
          category: typeof p.category === 'object' ? p.category._id : p.category,
          featured: p.featured,
          images: p.images ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error('Please fill in name, description, price and category');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock),
      category: form.category,
      featured: form.featured,
      images: form.images,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit product' : 'New product'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="card-surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Product images</h2>
          <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
        </div>

        <div className="card-surface space-y-4 p-6">
          <Input label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. AirPods Pro (2nd Gen)" required />
          <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Apple" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe the product..."
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-500"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-surface grid gap-4 p-6 sm:grid-cols-3">
          <Input label="Price (USD)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00" required />
          <Input label="Compare-at price" type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} placeholder="Optional" />
          <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" />
          <label className="flex items-center gap-2.5 sm:col-span-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-ink-soft">Feature this product on the homepage</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/admin/products"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Create product'}</Button>
        </div>
      </form>
    </div>
  );
};
