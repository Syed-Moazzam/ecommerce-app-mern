import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../../lib/api';
import { Category } from '../../types';
import { ProductImage } from '../../components/ProductImage';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface FormState {
  name: string;
  description: string;
  image: string;
}

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/categories').then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', image: '' });
    setUploadingImage(false);
    setModalOpen(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? '', image: cat.image ?? '' });
    setUploadingImage(false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImage) return toast.error('Please wait for the image to finish uploading');
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${confirmDelete._id}`);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== confirmDelete._id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-ink-muted">Organize your catalog and upload category images.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add category</Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => openEdit(cat)}
              className="card-surface flex cursor-pointer items-center gap-4 p-4 hover:bg-surface-subtle"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                <ProductImage src={cat.image} alt={cat.name} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{cat.name}</p>
                <p className="line-clamp-1 text-sm text-ink-muted">{cat.description || 'No description'}</p>
              </div>
              <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-muted" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setConfirmDelete(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit category' : 'New category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Mobile" required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">Category image</label>
                <ImageUploader
                  images={form.image ? [form.image] : []}
                  onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] ?? '' }))}
                  onUploadingChange={setUploadingImage}
                  folder="ecommerce/categories"
                  max={1}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saving} disabled={uploadingImage}>
                  {uploadingImage ? 'Uploading image…' : editing ? 'Save' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete category"
        description={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
