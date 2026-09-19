import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import {
  User,
  Session,
  getUserById,
  createSession as createFirestoreSession,
  getSession as getFirestoreSession,
  deleteSession as deleteFirestoreSession,
  seedInitialFirestoreData,
} from './firestoreDb';

export interface AuthRequest extends Request {
  user?: User;
  sessionId?: string;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calculatedHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export async function createSession(userId: string): Promise<Session> {
  return await createFirestoreSession(userId);
}

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie('session_id', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSessionFromRequest(req: Request): Promise<Session | null> {
  let sessionId = req.cookies?.session_id;
  if (!sessionId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.substring(7);
    }
  }
  if (!sessionId && typeof req.query?.token === 'string') {
    sessionId = req.query.token;
  }
  if (!sessionId) return null;

  return await getFirestoreSession(sessionId);
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return next();
    }

    const user = await getUserById(session.userId);
    if (!user || user.blocked) {
      return next();
    }

    req.user = user;
    req.sessionId = session.id;
    next();
  } catch (err) {
    console.error('Error in authMiddleware with Firestore:', err);
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

export function requireTeacher(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Acesso reservado ao professor' });
  }
  next();
}

// Ensure initial accounts and classes exist in Cloud Firestore
export async function initSeedAccounts() {
  await seedInitialFirestoreData();
}
