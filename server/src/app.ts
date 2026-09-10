import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/error';
import { stripeWebhook } from './controllers/paymentController';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import uploadRoutes from './routes/uploadRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

export const createApp = (): Application => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl === '*' ? true : env.clientUrl.split(','),
      credentials: true,
    })
  );

  // Stripe webhook needs the raw body — mount BEFORE express.json().
  app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, status: 'ok', env: env.nodeEnv });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment', paymentRoutes);

  // Serve the built React client (single-service deploy). Only active when a
  // build exists (i.e. on Render after `npm run build`); in local dev the client
  // runs on Vite, so this block is skipped and the /api routes stay API-only.
  const clientDist = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));
    // SPA fallback: any non-API GET returns index.html so client-side routing works.
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
