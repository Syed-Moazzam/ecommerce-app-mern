import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { ProductImage } from './ProductImage';
import { Badge } from './ui/Badge';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group card-surface overflow-hidden transition-shadow hover:shadow-lift">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {onSale && <Badge tone="danger">Sale</Badge>}
            {product.featured && !onSale && <Badge tone="brand">Featured</Badge>}
            {outOfStock && <Badge tone="neutral">Sold out</Badge>}
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-2 p-4">
        {product.brand && (
          <span className="text-xs font-medium text-ink-muted">{product.brand}</span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-700"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-ink">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              addItem(product);
              toast.success('Added to cart');
            }}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
