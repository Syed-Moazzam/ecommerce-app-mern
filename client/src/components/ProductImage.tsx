import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../lib/cn';

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

export const ProductImage = ({ src, alt, className }: Props) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-surface-muted text-slate-300', className)}>
        <ImageOff className="h-8 w-8" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
};
