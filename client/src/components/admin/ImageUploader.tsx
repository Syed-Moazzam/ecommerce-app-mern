import { useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../../lib/api';
import { ProductImage } from '../ProductImage';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  max?: number;
}

// Uploads selected files to the server, which streams them to Cloudinary and
// returns the secure URLs. Those URLs are what get stored on the product.
export const ImageUploader = ({ images, onChange, folder = 'ecommerce/products', max = 6 }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = max - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${max} images`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    const formData = new FormData();
    selected.forEach((file) => formData.append('images', file));
    formData.append('folder', folder);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...images, ...data.urls]);
      toast.success(`${data.urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (url: string) => onChange(images.filter((i) => i !== url));

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
            <ProductImage src={url} alt="Product" className="h-full w-full" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-6 w-6" />
                <span className="text-xs font-medium">Upload</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-ink-muted">
        JPG, PNG, WEBP or AVIF · up to {max} images · stored on Cloudinary
      </p>
    </div>
  );
};
