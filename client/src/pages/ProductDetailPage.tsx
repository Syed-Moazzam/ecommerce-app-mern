import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, ChevronRight, Check, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Product } from '../types';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        const cat = typeof data.product.category === 'object' ? data.product.category.slug : '';
        if (cat) {
          api
            .get('/products', { params: { category: cat, limit: 4 } })
            .then(({ data: rel }) =>
              setRelated(rel.products.filter((p: Product) => p._id !== data.product._id).slice(0, 4))
            );
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!product)
    return (
      <div className="container-content py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-brand-700">← Back to shop</Link>
      </div>
    );

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const outOfStock = product.stock <= 0;
  const categoryName = typeof product.category === 'object' ? product.category.name : '';
  const categorySlug = typeof product.category === 'object' ? product.category.slug : '';

  return (
    <div className="container-content py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-ink-muted">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        {categoryName && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/shop?category=${categorySlug}`} className="hover:text-ink">{categoryName}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="card-surface aspect-square overflow-hidden">
            <ProductImage
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImg === i ? 'border-brand-600' : 'border-line'
                  }`}
                >
                  <ProductImage src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            {product.brand && <span className="text-sm font-medium text-ink-muted">{product.brand}</span>}
            {onSale && <Badge tone="danger">Sale</Badge>}
            {product.featured && <Badge tone="brand">Featured</Badge>}
          </div>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check className="h-4 w-4" /> In stock · {product.stock} available
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

          {!outOfStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex h-12 items-center rounded-xl border border-line bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-full w-11 items-center justify-center text-ink-soft hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="flex h-full w-11 items-center justify-center text-ink-soft hover:text-ink"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  addItem(product, qty);
                  toast.success(`Added ${qty} to cart`);
                }}
                className="flex-1 min-w-[200px]"
              >
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </Button>
            </div>
          )}

          <div className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Truck className="h-5 w-5 text-brand-600" /> Free shipping over $50
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <ShieldCheck className="h-5 w-5 text-brand-600" /> Secure Stripe checkout
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
