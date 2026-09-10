import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

const streamUpload = (buffer: Buffer, folder: string): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });

// POST /api/upload  (admin, multipart form-data, field: "images", up to 6)
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(500, 'Cloudinary is not configured on the server');
  }
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) throw new ApiError(400, 'No image files provided');

  const folder = (req.body.folder as string) || 'ecommerce/products';
  const results = await Promise.all(files.map((f) => streamUpload(f.buffer, folder)));
  const urls = results.map((r) => r.secure_url);
  res.status(201).json({ success: true, urls });
});
