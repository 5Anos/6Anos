import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authMiddleware, initSeedAccounts, requireTeacher } from './server/auth';
import { getFirestoreStats, testFirestoreConnection } from './server/firestoreDb';
import authRoutes from './server/routes/auth';
import pedagogicalRoutes from './server/routes/pedagogical';
import teacherRoutes from './server/routes/teacher';

// Filter out benign Firebase/gRPC stream idle timeouts (e.g. Code: 1 CANCELLED: Disconnecting idle stream)
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const text = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (
    text.includes('Disconnecting idle stream') ||
    text.includes('Timed out waiting for new targets') ||
    text.includes("RPC 'Listen' stream")
  ) {
    return;
  }
  origWarn(...args);
};

const origError = console.error;
console.error = (...args: any[]) => {
  const text = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (
    text.includes('Disconnecting idle stream') ||
    text.includes('Timed out waiting for new targets') ||
    text.includes("RPC 'Listen' stream")
  ) {
    return;
  }
  origError(...args);
};

process.on('unhandledRejection', (reason: any) => {
  const text = typeof reason === 'string' ? reason : reason?.message || '';
  if (
    text.includes('Disconnecting idle stream') ||
    text.includes('Timed out waiting for new targets') ||
    text.includes("RPC 'Listen' stream")
  ) {
    return;
  }
  origError('Unhandled rejection:', reason);
});

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json());
  app.use(cookieParser());

  // Attach user to req if valid session exists
  app.use(authMiddleware);

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Protected system route - only authenticated teachers can inspect database stats
  app.get('/api/system/db-status', requireTeacher, async (req, res) => {
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

    // Perform Firestore seed asynchronously in background so server listens immediately
    initSeedAccounts()
      .then(() => {
        console.log('[FIREBASE FIRESTORE] Initial seed data verified.');
      })
      .catch((err) => {
        console.warn('[FIREBASE FIRESTORE] Background seed warning:', err?.message || err);
      });
  });
}

startServer();
