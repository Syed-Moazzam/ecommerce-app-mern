import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`✓ Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
