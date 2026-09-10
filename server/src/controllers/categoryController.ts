import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slugify';

// GET /api/categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

// GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, category });
});

// POST /api/categories (admin)
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image } = req.body as {
    name: string;
    description?: string;
    image?: string;
  };
  if (!name) throw new ApiError(400, 'Category name is required');
  const slug = slugify(name);
  const exists = await Category.findOne({ slug });
  if (exists) throw new ApiError(409, 'Category already exists');
  const category = await Category.create({ name, slug, description, image });
  res.status(201).json({ success: true, category });
});

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image } = req.body as {
    name?: string;
    description?: string;
    image?: string;
  };
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  await category.save();
  res.json({ success: true, category });
});

// DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new ApiError(400, `Cannot delete: ${productCount} product(s) use this category`);
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
