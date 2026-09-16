import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb, User, Session, XPTransaction } from './db';
import { calculateLevel } from './catalog';

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

export function createSession(userId: string): Session {
  const db = getDb();
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  db.sessions.push(session);
  saveDb(db);
  return session;
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

export function getSessionFromRequest(req: Request): Session | null {
  const db = getDb();
  // Read from cookie or Authorization header fallback
  let sessionId = req.cookies?.session_id;
  if (!sessionId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.substring(7);
    }
  }
  if (!sessionId) return null;

  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    // Session expired
    db.sessions = db.sessions.filter((s) => s.id !== sessionId);
    saveDb(db);
    return null;
  }

  return session;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return next();
  }

  const db = getDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user || user.blocked) {
    return next();
  }

  req.user = user;
  req.sessionId = session.id;
  next();
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

// Ensure pre-seeded accounts exist
export function initSeedAccounts() {
  const db = getDb();
  const teacherEmail = 'imaginebycarla2023@gmail.com';

  const teacherExists = db.users.some((u) => u.email.toLowerCase() === teacherEmail.toLowerCase());
  if (!teacherExists) {
    const { hash, salt } = hashPassword('ProfTIC2024!');
    const teacher: User = {
      id: 'teacher-carla',
      name: 'Carla Silva',
      email: teacherEmail,
      passwordHash: hash,
      passwordSalt: salt,
      nickname: 'Prof_Carla_TIC',
      avatar: 'teacher-1',
      role: 'teacher',
      classId: 'class-6a',
      locale: 'pt',
      xp: 0,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(teacher);
  }

  // Pre-seed Alex (matching screenshot)
  const alexExists = db.users.some((u) => u.nickname === 'Panda_Feliz_701');
  if (!alexExists) {
    const { hash, salt } = hashPassword('Aluno123!');
    const alex: User = {
      id: 'student-alex',
      name: 'Alex Rodrigues',
      email: 'alex@escola.pt',
      passwordHash: hash,
      passwordSalt: salt,
      nickname: 'Panda_Feliz_701',
      avatar: 'avatar-boy-1',
      role: 'student',
      classId: 'class-6a',
      locale: 'pt',
      xp: 320,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(alex);

    // Initial registration XP record for Alex
    db.xpTransactions.push({
      id: 'xp-reg-alex',
      userId: alex.id,
      sourceType: 'registration',
      sourceId: 'account-creation',
      previousBest: 0,
      newBest: 100,
      xpGain: 100,
      createdAt: new Date().toISOString(),
    });

    // Seed some progress for Alex
    db.activityProgress.push(
      {
        id: 'prog-alex-pwd',
        userId: alex.id,
        activityId: 'sim-password',
        worldId: 1,
        bestScore: 90,
        attempts: 2,
        completed: true,
        firstCompletedAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      },
      {
        id: 'prog-alex-phishing',
        userId: alex.id,
        activityId: 'sim-phishing',
        worldId: 1,
        bestScore: 80,
        attempts: 1,
        completed: true,
        firstCompletedAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      },
      {
        id: 'prog-alex-w1-ch',
        userId: alex.id,
        activityId: 'ch-guarda-digital',
        worldId: 1,
        bestScore: 50,
        attempts: 1,
        completed: true,
        firstCompletedAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      }
    );

    // Badges for Alex
    db.badges.push(
      { id: 'b-alex-1', userId: alex.id, badgeId: 'primeiros-passos', awardedAt: new Date().toISOString() },
      { id: 'b-alex-2', userId: alex.id, badgeId: 'guardiao-digital', awardedAt: new Date().toISOString() }
    );
  }

  // Pre-seed classmates Leonor and Tiago (as in the screenshot ranking)
  const leonorExists = db.users.some((u) => u.nickname === 'Raposa_Curiosa_284');
  if (!leonorExists) {
    const { hash, salt } = hashPassword('Aluno123!');
    db.users.push({
      id: 'student-leonor',
      name: 'Leonor Fernandes',
      email: 'leonor@escola.pt',
      passwordHash: hash,
      passwordSalt: salt,
      nickname: 'Raposa_Curiosa_284',
      avatar: 'avatar-girl-1',
      role: 'student',
      classId: 'class-6a',
      locale: 'pt',
      xp: 920,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const tiagoExists = db.users.some((u) => u.nickname === 'Robo_Azul_532');
  if (!tiagoExists) {
    const { hash, salt } = hashPassword('Aluno123!');
    db.users.push({
      id: 'student-tiago',
      name: 'Tiago Santos',
      email: 'tiago@escola.pt',
      passwordHash: hash,
      passwordSalt: salt,
      nickname: 'Robo_Azul_532',
      avatar: 'avatar-boy-2',
      role: 'student',
      classId: 'class-6a',
      locale: 'pt',
      xp: 850,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveDb(db);
}
