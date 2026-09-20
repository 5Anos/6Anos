import { Router, Response } from 'express';
import crypto from 'crypto';
import {
  User,
  XPTransaction,
  UserBadge,
  getUserByEmail,
  getUserByNickname,
  getUserById,
  saveUser,
  updateUser,
  getAllClasses,
  getClassById,
  getClassByCode,
  deleteSession,
  getUserBadges,
  awardBadge,
  atomicAwardXP,
  getAllUsers,
} from '../firestoreDb';
import {
  AuthRequest,
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from '../auth';
import { calculateLevel } from '../catalog';

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

// GET Available Classes (6.º A to 6.º E)
router.get('/classes', async (_req, res) => {
  try {
    const classes = await getAllClasses();
    const sorted = (classes.length > 0 ? classes : [
      { id: 'class-6a', name: '6.º A', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6b', name: '6.º B', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6c', name: '6.º C', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6d', name: '6.º D', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6e', name: '6.º E', code: '', createdAt: new Date().toISOString() },
    ]).sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ classes: sorted });
  } catch (err) {
    console.error('Error fetching classes:', err);
    return res.status(500).json({ error: 'Erro ao listar turmas.' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, classId, classCode, classroomCode, nickname, avatar, locale } = req.body;

    if (!name || !email || !password || !nickname) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Check email collision in Cloud Firestore
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Já existe uma conta associada a este email.' });
    }

    // Resolve classId (6.º A to 6.º E)
    const targetClassId = classId || classCode || classroomCode || 'class-6a';
    let classroom = await getClassById(targetClassId.trim());
    if (!classroom) {
      // Try to find by name (e.g. "6.º A", "6A", etc.)
      const allClasses = await getAllClasses();
      classroom = allClasses.find(
        (c) => c.id === targetClassId.trim() || c.name.toLowerCase() === targetClassId.trim().toLowerCase()
      ) || null;
    }
    if (!classroom) {
      classroom = {
        id: targetClassId.startsWith('class-') ? targetClassId : 'class-6a',
        name: targetClassId,
        code: '',
        createdAt: new Date().toISOString(),
      };
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

    // Check nickname collision in Cloud Firestore
    const existingNick = await getUserByNickname(nickname);
    if (existingNick) {
      return res.status(400).json({ error: 'Este nickname já está em uso. Por favor escolhe outro.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `student-${crypto.randomUUID()}`;

    // Initial student user starts at Level 1 with 0 XP
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
      xp: 0, // Starts at 0 XP (Level 1: Novato Digital)
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    // Award initial welcome badge 'primeiros-passos' in Cloud Firestore
    await awardBadge(newUser.id, 'primeiros-passos');

    const session = await createSession(newUser.id);
    setSessionCookie(res, session.id);

    return res.status(201).json({
      user: sanitizeUser(newUser),
      token: session.id,
      message: 'Conta criada com sucesso! Ganhaste +100 XP e a badge Primeiros Passos!',
    });
  } catch (err: any) {
    console.error('Error in /register:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta na nuvem.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e palavra-passe são obrigatórios.' });
    }

    const user = await getUserByEmail(email);
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

    await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    user.lastLoginAt = new Date().toISOString();

    const session = await createSession(user.id);
    setSessionCookie(res, session.id);

    return res.json({
      user: sanitizeUser(user),
      token: session.id,
    });
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).json({ error: 'Erro interno ao iniciar sessão na nuvem.' });
  }
});

// Logout
router.post('/logout', async (req: AuthRequest, res) => {
  try {
    if (req.sessionId) {
      await deleteSession(req.sessionId);
    }
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error in /logout:', err);
    clearSessionCookie(res);
    return res.json({ success: true });
  }
});

// Get Current User
router.get('/me', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const userBadges = await getUserBadges(req.user.id);
    const classroom = req.user.classId ? await getClassById(req.user.classId) : null;

    return res.json({
      user: sanitizeUser(req.user),
      badges: userBadges,
      classroom: classroom ? { id: classroom.id, name: classroom.name, code: classroom.code } : null,
    });
  } catch (err) {
    console.error('Error in /me:', err);
    return res.status(500).json({ error: 'Erro ao carregar dados do utilizador.' });
  }
});

// Update Profile
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { nickname, avatar, locale } = req.body;

    const dbUser = await getUserById(user.id);
    if (!dbUser) return res.status(404).json({ error: 'Utilizador não encontrado' });

    const updates: Partial<User> = {};

    if (nickname && nickname.trim() !== dbUser.nickname) {
      const lowerNick = nickname.trim().toLowerCase();
      const lowerName = dbUser.name.toLowerCase();
      const emailPrefix = dbUser.email.split('@')[0].toLowerCase();
      if (lowerNick.includes(lowerName) || lowerNick.includes(emailPrefix) || lowerNick.includes('@')) {
        return res.status(400).json({
          error: 'O teu nickname não deve conter o teu nome real ou email para proteger a tua privacidade!',
        });
      }

      const existingNick = await getUserByNickname(nickname.trim());
      if (existingNick && existingNick.id !== user.id) {
        return res.status(400).json({ error: 'Este nickname já está em uso.' });
      }
      updates.nickname = nickname.trim();
      dbUser.nickname = nickname.trim();
    }

    if (avatar) {
      updates.avatar = avatar;
      dbUser.avatar = avatar;
    }
    if (locale === 'pt' || locale === 'en') {
      updates.locale = locale;
      dbUser.locale = locale;
    }

    await updateUser(user.id, updates);
    return res.json({ user: sanitizeUser(dbUser) });
  } catch (err) {
    console.error('Error in /profile:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// Change Password
router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) return res.status(404).json({ error: 'Utilizador não encontrado' });

    if (!verifyPassword(currentPassword, dbUser.passwordHash, dbUser.passwordSalt)) {
      return res.status(400).json({ error: 'A palavra-passe atual está incorreta.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    await updateUser(user.id, {
      passwordHash: hash,
      passwordSalt: salt,
      mustChangePassword: false,
    });

    return res.json({ success: true, message: 'Palavra-passe alterada com sucesso.' });
  } catch (err) {
    console.error('Error in /change-password:', err);
    return res.status(500).json({ error: 'Erro ao alterar palavra-passe.' });
  }
});

export default router;
