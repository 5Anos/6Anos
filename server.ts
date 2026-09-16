import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authMiddleware, initSeedAccounts } from './server/auth';
import { getFirestoreStats, testFirestoreConnection } from './server/firestoreDb';
import authRoutes from './server/routes/auth';
import pedagogicalRoutes from './server/routes/pedagogical';
import teacherRoutes from './server/routes/teacher';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json());
  app.use(cookieParser());

  // Attach user to req if valid session exists
  app.use(authMiddleware);

  // Initialize and verify Firebase Firestore Cloud Database
  console.log('[FIREBASE FIRESTORE] Connecting to Google Cloud Firestore...');
  const isConnected = await testFirestoreConnection();
  if (isConnected) {
    console.log('[FIREBASE FIRESTORE] Connected successfully to Cloud Firestore! Seeding initial data if needed...');
    await initSeedAccounts();
    console.log('[FIREBASE FIRESTORE] Seed check completed.');
  } else {
    console.warn('[FIREBASE FIRESTORE] Warning: Cloud Firestore test connection returned false or empty.');
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/system/db-status', async (req, res) => {
    try {
      const stats = await getFirestoreStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Database error' });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/pedagogical', pedagogicalRoutes);
  app.use('/api/teacher', teacherRoutes);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MISSÃO TIC 6.º ANO Server listening on http://0.0.0.0:${PORT} [Firestore Active]`);
  });
}

startServer();
