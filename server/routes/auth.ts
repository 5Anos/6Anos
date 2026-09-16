import { Router, Response } from 'express';
import crypto from 'crypto';
import { getDb, saveDb, User, XPTransaction, UserBadge } from '../db';
import {
  AuthRequest,
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from '../auth';
import { calculateLevel, BADGES_CATALOG } from '../catalog';

const router = Router();

// Sanitized user object to return safely
export function sanitizeUser(user: User) {
  const levelInfo = calculateLevel(user.xp);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role,
    classId: user.classId,
    locale: user.locale,
    xp: user.xp,
    level: levelInfo.level,
    levelName: levelInfo.name,
    blocked: user.blocked,
    mustChangePassword: user.mustChangePassword || false,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// Register
router.post('/register', (req, res) => {
  const { name, email, password, classCode, nickname, avatar, locale } = req.body;

  if (!name || !email || !password || !classCode || !nickname) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const db = getDb();

  // Check email collision
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Já existe uma conta associada a este email.' });
  }

  // Validate class code
  const classroom = db.classes.find(
    (c) => c.code.toLowerCase() === classCode.trim().toLowerCase() || c.id === classCode.trim()
  );
  if (!classroom) {
    return res.status(400).json({ error: 'Código de turma inválido. Pede o código correto ao teu professor.' });
  }

  // Prevent nicknames that expose email or full name
  const lowerNick = nickname.trim().toLowerCase();
  const lowerName = name.trim().toLowerCase();
  const emailPrefix = email.split('@')[0].toLowerCase();
  if (lowerNick.includes(lowerName) || lowerNick.includes(emailPrefix) || lowerNick.includes('@')) {
    return res.status(400).json({
      error: 'O teu nickname não deve conter o teu nome real ou email para proteger a tua privacidade!',
    });
  }

  // Check nickname collision
  if (db.users.some((u) => u.nickname.toLowerCase() === lowerNick)) {
    return res.status(400).json({ error: 'Este nickname já está em uso. Por favor escolhe outro.' });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `student-${crypto.randomUUID()}`;

  // Initial user with 100 XP registration reward (awarded once)
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    nickname: nickname.trim(),
    avatar: avatar || 'avatar-boy-1',
    role: 'student',
    classId: classroom.id,
    locale: locale === 'en' ? 'en' : 'pt',
    xp: 100, // +100 XP registration reward
    blocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Record atomic XP transaction for registration reward
  const xpTx: XPTransaction = {
    id: `xp-reg-${crypto.randomUUID()}`,
    userId: newUser.id,
    sourceType: 'registration',
    sourceId: 'account-creation',
    previousBest: 0,
    newBest: 100,
    xpGain: 100,
    createdAt: new Date().toISOString(),
  };
  db.xpTransactions.push(xpTx);

  // Automatically award 'primeiros-passos' badge
  const badge: UserBadge = {
    id: `b-${crypto.randomUUID()}`,
    userId: newUser.id,
    badgeId: 'primeiros-passos',
    awardedAt: new Date().toISOString(),
  };
  db.badges.push(badge);

  const session = createSession(newUser.id);
  saveDb(db);
  setSessionCookie(res, session.id);

  return res.status(201).json({
    user: sanitizeUser(newUser),
    token: session.id,
    message: 'Conta criada com sucesso! Ganhaste +100 XP e a badge Primeiros Passos!',
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e palavra-passe são obrigatórios.' });
  }

  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  if (user.blocked) {
    return res.status(403).json({ error: 'Esta conta encontra-se suspensa. Fala com o teu professor.' });
  }

  const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  user.lastLoginAt = new Date().toISOString();
  const session = createSession(user.id);
  saveDb(db);
  setSessionCookie(res, session.id);

  return res.json({
    user: sanitizeUser(user),
    token: session.id,
  });
});

// Quick Switch (useful for demo/testing between student and teacher)
router.post('/quick-switch', (req, res) => {
  const { role } = req.body;
  const db = getDb();

  let targetUser: User | undefined;
  if (role === 'teacher') {
    targetUser = db.users.find((u) => u.role === 'teacher' && u.email === 'imaginebycarla2023@gmail.com');
  } else {
    // Switch to Alex
    targetUser = db.users.find((u) => u.nickname === 'Panda_Feliz_701') || db.users.find((u) => u.role === 'student');
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Utilizador de demonstração não encontrado.' });
  }

  const session = createSession(targetUser.id);
  saveDb(db);
  setSessionCookie(res, session.id);

  return res.json({
    user: sanitizeUser(targetUser),
    token: session.id,
  });
});

// Logout
router.post('/logout', (req: AuthRequest, res) => {
  if (req.sessionId) {
    const db = getDb();
    db.sessions = db.sessions.filter((s) => s.id !== req.sessionId);
    saveDb(db);
  }
  clearSessionCookie(res);
  return res.json({ success: true });
});

// Get Current User
router.get('/me', (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const db = getDb();
  const userBadges = db.badges.filter((b) => b.userId === req.user!.id);
  const classroom = db.classes.find((c) => c.id === req.user!.classId);

  return res.json({
    user: sanitizeUser(req.user),
    badges: userBadges,
    classroom: classroom ? { id: classroom.id, name: classroom.name, code: classroom.code } : null,
  });
});

// Update Profile
router.put('/profile', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { nickname, avatar, locale } = req.body;
  const db = getDb();

  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) return res.status(404).json({ error: 'Utilizador não encontrado' });

  if (nickname && nickname.trim() !== dbUser.nickname) {
    const lowerNick = nickname.trim().toLowerCase();
    const lowerName = dbUser.name.toLowerCase();
    const emailPrefix = dbUser.email.split('@')[0].toLowerCase();
    if (lowerNick.includes(lowerName) || lowerNick.includes(emailPrefix) || lowerNick.includes('@')) {
      return res.status(400).json({
        error: 'O teu nickname não deve conter o teu nome real ou email para proteger a tua privacidade!',
      });
    }

    if (db.users.some((u) => u.id !== user.id && u.nickname.toLowerCase() === lowerNick)) {
      return res.status(400).json({ error: 'Este nickname já está em uso.' });
    }
    dbUser.nickname = nickname.trim();
  }

  if (avatar) dbUser.avatar = avatar;
  if (locale === 'pt' || locale === 'en') dbUser.locale = locale;

  dbUser.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({ user: sanitizeUser(dbUser) });
});

// Change Password
router.post('/change-password', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
  }

  const db = getDb();
  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) return res.status(404).json({ error: 'Utilizador não encontrado' });

  if (!verifyPassword(currentPassword, dbUser.passwordHash, dbUser.passwordSalt)) {
    return res.status(400).json({ error: 'A palavra-passe atual está incorreta.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  dbUser.passwordHash = hash;
  dbUser.passwordSalt = salt;
  dbUser.mustChangePassword = false;
  dbUser.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({ success: true, message: 'Palavra-passe alterada com sucesso.' });
});

export default router;
