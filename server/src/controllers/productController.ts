import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slugify';

// GET /api/products  (supports ?search=&category=&sort=&page=&limit=&featured=)
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    sort = 'newest',
    page = '1',
    limit = '12',
    featured,
    minPrice,
    maxPrice,
  } = req.query as Record<string, string>;

  const filter: FilterQuery<IProduct> = {};

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (featured === 'true') filter.featured = true;

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) filter.category = categoryDoc._id;
    else return res.json({ success: true, products: [], page: 1, pages: 0, total: 0 });
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // _id is appended as a tiebreaker on every option: ties on the primary key
  // (e.g. many seeded products sharing one createdAt) otherwise have no
  // guaranteed stable order across separate skip/limit page requests.
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1, _id: -1 },
    'price-asc': { price: 1, _id: 1 },
    'price-desc': { price: -1, _id: 1 },
    'name-asc': { name: 1, _id: 1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(50, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// GET /api/products/id/:id (admin)
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, compareAtPrice, category, images, stock, brand, featured } =
    req.body;
  if (!name || !description || price === undefined || !category) {
    throw new ApiError(400, 'Name, description, price and category are required');
  }
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(400, 'Invalid category');

  const product = await Product.create({
    name,
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    description,
    price,
    compareAtPrice,
    category,
    images: Array.isArray(images) ? images : [],
    stock: stock ?? 0,
    brand,
    featured: Boolean(featured),
  });
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = ['name', 'description', 'price', 'compareAtPrice', 'category', 'images', 'stock', 'brand', 'featured'] as const;
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      // @ts-expect-error dynamic assignment across known fields
      product[field] = req.body[field];
    }
  }
  if (req.body.name) product.slug = `${slugify(req.body.name)}-${String(product._id).slice(-6)}`;

  await product.save();
  res.json({ success: true, product });
});

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});
