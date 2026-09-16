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

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, classCode, nickname, avatar, locale } = req.body;

    if (!name || !email || !password || !classCode || !nickname) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Check email collision in Cloud Firestore
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Já existe uma conta associada a este email.' });
    }

    // Validate class code in Cloud Firestore
    let classroom = await getClassByCode(classCode);
    if (!classroom) {
      classroom = await getClassById(classCode.trim());
    }
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

    // Check nickname collision in Cloud Firestore
    const existingNick = await getUserByNickname(nickname);
    if (existingNick) {
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

    await saveUser(newUser);

    // Record atomic XP transaction in Cloud Firestore
    await atomicAwardXP(newUser.id, 0, {
      sourceType: 'registration',
      sourceId: 'account-creation',
      previousBest: 0,
      newBest: 100,
    });

    // Automatically award 'primeiros-passos' badge in Cloud Firestore
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

// Quick Switch (for demo/testing between student and teacher)
router.post('/quick-switch', async (req, res) => {
  try {
    const { role } = req.body;
    let targetUser: User | null = null;

    if (role === 'teacher') {
      targetUser = await getUserByEmail('imaginebycarla2023@gmail.com');
    } else {
      targetUser = await getUserByNickname('Panda_Feliz_701');
      if (!targetUser) {
        targetUser = await getUserById('student-alex');
      }
      if (!targetUser) {
        const all = await getAllUsers();
        targetUser = all.find((u) => u.role === 'student') || null;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Utilizador de demonstração não encontrado.' });
    }

    const session = await createSession(targetUser.id);
    setSessionCookie(res, session.id);

    return res.json({
      user: sanitizeUser(targetUser),
      token: session.id,
    });
  } catch (err) {
    console.error('Error in /quick-switch:', err);
    return res.status(500).json({ error: 'Erro ao alternar utilizador.' });
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
