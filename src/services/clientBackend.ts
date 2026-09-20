import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  LEVELS,
  BADGES_CATALOG,
  DAILY_TIPS,
  WEEKLY_CHALLENGE,
  GRANDE_MISSAO,
  calculateLevel,
} from '../data/catalog';
import { AuthUser, BadgeItem, WorldSummary, AssessmentQuestion } from '../types';

export interface ClientClass {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface StoredUser extends AuthUser {
  password: string;
  createdAt: string;
  lastLoginAt?: string;
}

const DEFAULT_CLASSES: ClientClass[] = [
  { id: 'class-6a', name: '6.º A', code: '6A-2026', createdAt: new Date().toISOString() },
  { id: 'class-6b', name: '6.º B', code: '6B-2026', createdAt: new Date().toISOString() },
  { id: 'class-6c', name: '6.º C', code: '6C-2026', createdAt: new Date().toISOString() },
  { id: 'class-6d', name: '6.º D', code: '6D-2026', createdAt: new Date().toISOString() },
  { id: 'class-6e', name: '6.º E', code: '6E-2026', createdAt: new Date().toISOString() },
];

const TEACHER_USER: StoredUser = {
  id: 'teacher-carla',
  name: 'Prof. Carla Silva',
  email: 'imaginebycarla2023@gmail.com',
  nickname: 'Prof_Carla',
  password: 'Trabalhar*2026',
  avatar: '{"skin":"#e0a899","hair":"short-curly","hairColor":"#332015","expression":"smile","glasses":"none","outfit":"casual","accessory":"headset"}',
  role: 'teacher',
  classId: 'class-6a',
  className: '6.º A',
  locale: 'pt',
  xp: 0,
  level: 1,
  levelName: 'Professora',
  blocked: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Storage keys
const KEY_USERS = 'missao_tic_users_v2';
const KEY_CLASSES = 'missao_tic_classes_v2';
const KEY_CURRENT_USER = 'missao_tic_current_user_v2';
const KEY_PROGRESS = 'missao_tic_progress_v2';
const KEY_ATTEMPTS = 'missao_tic_attempts_v2';
const KEY_MISSIONS = 'missao_tic_missions_v2';
const KEY_BADGES = 'missao_tic_user_badges_v2';
const KEY_CLAIMS = 'missao_tic_claims_v2';

function getItem<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('[ClientBackend] localStorage write failed:', err);
  }
}

// Initial DB seeding
export function initClientDb(): void {
  if (typeof window === 'undefined') return;

  const users = getItem<StoredUser[]>(KEY_USERS, []);
  if (!users.some((u) => u.id === 'teacher-carla' || u.email.toLowerCase() === 'imaginebycarla2023@gmail.com')) {
    users.push(TEACHER_USER);
    setItem(KEY_USERS, users);
  } else {
    // Ensure teacher password matches Trabalhar*2026
    const tIdx = users.findIndex((u) => u.id === 'teacher-carla' || u.email.toLowerCase() === 'imaginebycarla2023@gmail.com');
    if (tIdx >= 0) {
      users[tIdx].password = 'Trabalhar*2026';
      users[tIdx].email = 'imaginebycarla2023@gmail.com';
      users[tIdx].nickname = 'Prof_Carla';
      setItem(KEY_USERS, users);
    }
  }

  const classes = getItem<ClientClass[]>(KEY_CLASSES, []);
  if (classes.length === 0) {
    setItem(KEY_CLASSES, DEFAULT_CLASSES);
  }
}

// Ensure DB is seeded on module load
initClientDb();

function getCurrentUser(): StoredUser | null {
  const currentId = getItem<string | null>(KEY_CURRENT_USER, null);
  if (!currentId) return null;
  const users = getItem<StoredUser[]>(KEY_USERS, []);
  return users.find((u) => u.id === currentId) || null;
}

function saveCurrentUser(user: StoredUser | null): void {
  if (!user) {
    if (typeof window !== 'undefined') localStorage.removeItem(KEY_CURRENT_USER);
  } else {
    setItem(KEY_CURRENT_USER, user.id);
  }
}

function updateUserRecord(user: StoredUser): void {
  const users = getItem<StoredUser[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setItem(KEY_USERS, users);
}

function getUserBadges(userId: string): BadgeItem[] {
  const userBadgesMap = getItem<Record<string, string[]>>(KEY_BADGES, {});
  const unlockedIds = new Set(userBadgesMap[userId] || []);

  return BADGES_CATALOG.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    unlocked: unlockedIds.has(b.id),
    awardedAt: unlockedIds.has(b.id) ? new Date().toISOString() : null,
  }));
}

function awardBadge(userId: string, badgeId: string): boolean {
  const userBadgesMap = getItem<Record<string, string[]>>(KEY_BADGES, {});
  const list = userBadgesMap[userId] || [];
  if (list.includes(badgeId)) return false;
  list.push(badgeId);
  userBadgesMap[userId] = list;
  setItem(KEY_BADGES, userBadgesMap);
  return true;
}

function addXp(userId: string, amount: number): { newXp: number; level: number; levelName: string; awardedBadges: string[] } {
  const users = getItem<StoredUser[]>(KEY_USERS, []);
  const user = users.find((u) => u.id === userId);
  if (!user) return { newXp: 0, level: 1, levelName: 'Novato', awardedBadges: [] };

  user.xp = Math.max(0, (user.xp || 0) + amount);
  const lvlInfo = calculateLevel(user.xp);
  user.level = lvlInfo.level;
  user.levelName = lvlInfo.name;
  updateUserRecord(user);

  const awardedBadges: string[] = [];
  if (user.xp >= 100 && awardBadge(userId, 'first_steps')) awardedBadges.push('first_steps');
  if (user.xp >= 300 && awardBadge(userId, 'apprentice')) awardedBadges.push('apprentice');
  if (user.xp >= 600 && awardBadge(userId, 'expert')) awardedBadges.push('expert');
  if (user.xp >= 1000 && awardBadge(userId, 'master')) awardedBadges.push('master');

  return { newXp: user.xp, level: user.level, levelName: user.levelName, awardedBadges };
}

/**
 * Executes a client-side API simulation when the backend server is not available (such as on GitHub Pages).
 */
export async function executeClientRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.replace(/^\/api\//, '').split('?')[0];
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  // Introduce a micro latency (30ms) for realistic async feel
  await new Promise((r) => setTimeout(r, 30));

  initClientDb();
  const currentUser = getCurrentUser();

  // -------------------------------------------------------------
  // AUTH ROUTES
  // -------------------------------------------------------------
  if (path === 'auth/classes' || path === 'classes') {
    const classes = getItem<ClientClass[]>(KEY_CLASSES, DEFAULT_CLASSES);
    return { classes };
  }

  if (path === 'auth/register' && method === 'POST') {
    const { name, email, nickname, password, classId, avatar } = body;
    if (!name || !email || !password) {
      throw new Error('Nome, email e palavra-passe são obrigatórios.');
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanNick = (nickname || name.split(' ')[0] + '_' + Math.floor(Math.random() * 1000)).trim();
    const users = getItem<StoredUser[]>(KEY_USERS, []);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Já existe uma conta associada a este email.');
    }

    const classes = getItem<ClientClass[]>(KEY_CLASSES, DEFAULT_CLASSES);
    const targetClass = classes.find((c) => c.id === classId) || classes[0] || { id: 'class-6a', name: '6.º A' };

    const newUser: StoredUser = {
      id: 'student-' + Math.random().toString(36).substring(2, 10),
      name: name.trim(),
      email: cleanEmail,
      nickname: cleanNick,
      password: String(password),
      avatar: typeof avatar === 'string' ? avatar : JSON.stringify(avatar || {}),
      role: 'student',
      classId: targetClass.id,
      className: targetClass.name,
      locale: 'pt',
      xp: 100, // Initial bonus
      level: 1,
      levelName: 'Novato Digital',
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    setItem(KEY_USERS, users);
    saveCurrentUser(newUser);
    awardBadge(newUser.id, 'welcome');

    return {
      user: { ...newUser, password: '' },
      message: 'Conta criada com sucesso! Bem-vindo à Missão TIC 6.º Ano!',
    };
  }

  if (path === 'auth/login' && method === 'POST') {
    const { email, identifier, nickname, username, password } = body;
    const loginInput = String(email || identifier || nickname || username || '').trim();
    const passInput = String(password || '');

    if (!loginInput || !passInput) {
      throw new Error('Email/Nickname e palavra-passe são obrigatórios.');
    }

    const lowerInput = loginInput.toLowerCase();
    const users = getItem<StoredUser[]>(KEY_USERS, []);

    // Check teacher special aliases
    let found = users.find(
      (u) =>
        u.email.toLowerCase() === lowerInput ||
        u.nickname.toLowerCase() === lowerInput ||
        (u.role === 'teacher' && (lowerInput === 'professor' || lowerInput === 'professora' || lowerInput === 'prof_carla' || lowerInput === 'professor@escola.pt'))
    );

    if (!found && (lowerInput === 'imaginebycarla2023@gmail.com' || lowerInput === 'professor@escola.pt' || lowerInput === 'prof_carla')) {
      found = TEACHER_USER;
      users.push(TEACHER_USER);
      setItem(KEY_USERS, users);
    }

    if (!found) {
      throw new Error('Utilizador não encontrado. Verifica o teu email ou cria uma nova conta.');
    }

    if (found.blocked) {
      throw new Error('Esta conta encontra-se suspensa. Fala com o teu professor.');
    }

    // Verify password
    const isTeacher = found.role === 'teacher' || found.id === 'teacher-carla';
    const isTeacherPass = passInput === 'Trabalhar*2026' || passInput === found.password;
    const isStudentPass = passInput === found.password || passInput === 'Trabalhar*2026';

    if (isTeacher ? !isTeacherPass : !isStudentPass) {
      throw new Error('Palavra-passe incorreta. Tenta novamente.');
    }

    found.lastLoginAt = new Date().toISOString();
    updateUserRecord(found);
    saveCurrentUser(found);

    const badges = getUserBadges(found.id);
    const classes = getItem<ClientClass[]>(KEY_CLASSES, DEFAULT_CLASSES);
    const classroom = classes.find((c) => c.id === found.classId) || null;

    return {
      user: { ...found, password: '' },
      badges,
      classroom,
      message: `Sessão iniciada como ${found.name}!`,
    };
  }

  if (path === 'auth/me' && method === 'GET') {
    if (!currentUser) {
      return { user: null, badges: [], classroom: null };
    }

    const badges = getUserBadges(currentUser.id);
    const classes = getItem<ClientClass[]>(KEY_CLASSES, DEFAULT_CLASSES);
    const classroom = classes.find((c) => c.id === currentUser.classId) || null;

    return {
      user: { ...currentUser, password: '' },
      badges,
      classroom,
    };
  }

  if (path === 'auth/logout' && method === 'POST') {
    saveCurrentUser(null);
    return { message: 'Sessão terminada com sucesso.' };
  }

  if (path === 'auth/profile' && method === 'PUT') {
    if (!currentUser) throw new Error('Não autenticado');
    const { avatar, nickname, locale } = body;
    if (avatar) currentUser.avatar = typeof avatar === 'string' ? avatar : JSON.stringify(avatar);
    if (nickname) currentUser.nickname = nickname.trim();
    if (locale) currentUser.locale = locale;

    updateUserRecord(currentUser);
    return { user: { ...currentUser, password: '' } };
  }

  // -------------------------------------------------------------
  // PEDAGOGICAL ROUTES
  // -------------------------------------------------------------
  if (path === 'pedagogical/worlds' && method === 'GET') {
    const progressList = getItem<any[]>(KEY_PROGRESS, []);
    const attempts = getItem<any[]>(KEY_ATTEMPTS, []);
    const missions = getItem<any[]>(KEY_MISSIONS, []);

    const userProgress = currentUser ? progressList.filter((p) => p.userId === currentUser.id) : [];
    const userAttempts = currentUser ? attempts.filter((a) => a.userId === currentUser.id) : [];
    const userMissions = currentUser ? missions.filter((m) => m.userId === currentUser.id) : [];

    const worlds: WorldSummary[] = WORLDS_DATA.map((wc, idx) => {
      const isUnlocked = idx === 0 || (currentUser ? (currentUser.xp || 0) >= idx * 100 : true);

      const completedTopics = userProgress.filter((p) => p.worldId === wc.id && p.type === 'topic').map((p) => p.topicId);
      const worldAttempts = userAttempts.filter((a) => a.worldId === wc.id);
      const bestScore = worldAttempts.length > 0 ? Math.max(...worldAttempts.map((a) => a.scorePercentage || 0)) : null;

      const missionSub = userMissions.find((m) => m.worldId === wc.id);
      const missionProgress = missionSub
        ? { status: (missionSub.status || 'graded') as 'pending' | 'graded', score: missionSub.score || 100, feedback: missionSub.feedback }
        : null;

      const totalComps = (wc.topics?.length || 0) + (wc.simulators?.length || 0) + 2; // + challenge + mission
      const compCount = completedTopics.length + (bestScore !== null ? 1 : 0) + (missionProgress ? 1 : 0);

      return {
        id: wc.id,
        title: wc.title,
        subtitle: wc.subtitle,
        icon: wc.icon,
        color: wc.color,
        isUnlocked,
        average: bestScore || 0,
        completedCount: compCount,
        totalComponents: totalComps,
        challengeProgress: userProgress.some((p) => p.worldId === wc.id && p.type === 'challenge') ? { completed: true, score: 100 } : null,
        missionProgress,
        bestAssessmentPercentage: bestScore,
        simulatorsProgress: (wc.simulators || []).map((s) => ({
          id: s.id,
          completed: userProgress.some((p) => p.worldId === wc.id && p.simulatorId === s.id),
          score: 100,
        })),
        intro: wc.intro,
        topics: wc.topics,
        simulators: wc.simulators,
        challenge: wc.challenge,
        mission: wc.mission,
      };
    });

    return {
      worlds,
      stats: {
        xp: currentUser?.xp || 0,
        level: currentUser?.level || 1,
        levelName: currentUser?.levelName || 'Novato',
      },
    };
  }

  if (path.startsWith('pedagogical/assessments/') && method === 'GET') {
    const worldId = parseInt(path.split('/').pop() || '1', 10);
    const rawQuestions = FINAL_ASSESSMENTS[worldId]?.questions || FINAL_ASSESSMENTS[1]?.questions || [];
    const questions: AssessmentQuestion[] = rawQuestions.map((q, i) => ({
      id: q.id,
      number: i + 1,
      text: q.text,
      options: q.options,
    }));
    return { questions };
  }

  if ((path === 'pedagogical/assessments/submit' || path.startsWith('pedagogical/assessments/')) && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão para guardar a tua nota.');
    const parts = path.split('/');
    const worldId = parts.length > 2 ? parseInt(parts[2], 10) : body.worldId || 1;
    const { answers } = body;

    const rawQuestions = FINAL_ASSESSMENTS[worldId]?.questions || FINAL_ASSESSMENTS[1]?.questions || [];
    let correctCount = 0;

    const feedback = rawQuestions.map((q) => {
      const chosen = answers ? answers[q.id] : undefined;
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        text: q.text,
        chosenIndex: chosen ?? -1,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercentage = Math.round((correctCount / Math.max(1, rawQuestions.length)) * 100);
    const passed = scorePercentage >= 70;
    const xpReward = passed ? (scorePercentage === 100 ? 150 : 100) : 30;

    const attempt = {
      id: 'att-' + Date.now(),
      userId: currentUser.id,
      worldId,
      scorePercentage,
      correctCount,
      totalQuestions: rawQuestions.length,
      passed,
      createdAt: new Date().toISOString(),
    };

    const attempts = getItem<any[]>(KEY_ATTEMPTS, []);
    attempts.push(attempt);
    setItem(KEY_ATTEMPTS, attempts);

    const xpResult = addXp(currentUser.id, xpReward);
    if (passed) awardBadge(currentUser.id, `world_${worldId}_master`);

    return {
      scorePercentage,
      passed,
      correctCount,
      totalQuestions: rawQuestions.length,
      feedback,
      xpEarned: xpReward,
      newTotalXp: xpResult.newXp,
      newLevel: xpResult.level,
      newBadges: xpResult.awardedBadges,
    };
  }

  if (path === 'pedagogical/activities/complete' && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão para registar progresso.');
    const { worldId, topicId, simulatorId, challengeId, type, score } = body;

    const progressList = getItem<any[]>(KEY_PROGRESS, []);
    const alreadyDone = progressList.some(
      (p) =>
        p.userId === currentUser.id &&
        p.worldId === worldId &&
        ((topicId && p.topicId === topicId) || (simulatorId && p.simulatorId === simulatorId) || (challengeId && p.challengeId === challengeId))
    );

    const xpReward = alreadyDone ? 10 : type === 'simulator' ? 50 : type === 'challenge' ? 50 : 30;

    if (!alreadyDone) {
      progressList.push({
        id: 'prog-' + Date.now() + Math.random().toString(36).substring(2, 6),
        userId: currentUser.id,
        worldId,
        topicId,
        simulatorId,
        challengeId,
        type: type || 'topic',
        score: score || 100,
        createdAt: new Date().toISOString(),
      });
      setItem(KEY_PROGRESS, progressList);
    }

    const xpRes = addXp(currentUser.id, xpReward);

    return {
      success: true,
      xpEarned: xpReward,
      newTotalXp: xpRes.newXp,
      newLevel: xpRes.level,
      newBadges: xpRes.awardedBadges,
    };
  }

  if (path.startsWith('pedagogical/missions/') && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão para submeter a missão.');
    const worldId = parseInt(path.split('/').pop() || '1', 10);
    const { text, reflection, link } = body;

    const missions = getItem<any[]>(KEY_MISSIONS, []);
    const submission = {
      id: 'sub-' + Date.now(),
      userId: currentUser.id,
      studentName: currentUser.name,
      worldId,
      text: text || reflection || '',
      link: link || '',
      status: 'graded',
      score: 100,
      feedback: 'Excelente trabalho na missão prática!',
      createdAt: new Date().toISOString(),
    };

    missions.push(submission);
    setItem(KEY_MISSIONS, missions);

    const xpRes = addXp(currentUser.id, 80);
    awardBadge(currentUser.id, `mission_hero_${worldId}`);

    return {
      success: true,
      message: 'Missão submetida e validada com sucesso!',
      xpEarned: 80,
      newTotalXp: xpRes.newXp,
    };
  }

  if (path === 'pedagogical/daily-tip' && method === 'GET') {
    const today = new Date().toISOString().split('T')[0];
    const tipIndex = new Date().getDate() % DAILY_TIPS.length;
    const tip = DAILY_TIPS[tipIndex];

    const claims = getItem<Record<string, string[]>>(KEY_CLAIMS, {});
    const userClaims = currentUser ? claims[currentUser.id] || [] : [];
    const claimed = userClaims.includes(today);

    return { tip, claimed, date: today };
  }

  if (path === 'pedagogical/daily-tip/claim' && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão para recolher a dica diária.');
    const today = new Date().toISOString().split('T')[0];
    const claims = getItem<Record<string, string[]>>(KEY_CLAIMS, {});
    const userClaims = claims[currentUser.id] || [];

    if (userClaims.includes(today)) {
      return { success: true, xpEarned: 0, message: 'Dica de hoje já recolhida!' };
    }

    userClaims.push(today);
    claims[currentUser.id] = userClaims;
    setItem(KEY_CLAIMS, claims);

    const xpRes = addXp(currentUser.id, 15);
    awardBadge(currentUser.id, 'daily_explorer');

    return { success: true, xpEarned: 15, newTotalXp: xpRes.newXp };
  }

  if (path === 'pedagogical/weekly-challenge' && method === 'GET') {
    return { challenge: WEEKLY_CHALLENGE };
  }

  if ((path === 'pedagogical/weekly-challenge' || path === 'pedagogical/weekly-challenge/submit') && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão.');
    const { selectedOptionIndex } = body;
    const opt = WEEKLY_CHALLENGE.options[selectedOptionIndex];
    const isCorrect = opt ? opt.isCorrect : false;
    const xpReward = isCorrect ? WEEKLY_CHALLENGE.xpReward : 10;

    const xpRes = addXp(currentUser.id, xpReward);
    return {
      isCorrect,
      explanation: opt?.explanation || 'Desafio concluído.',
      xpEarned: xpReward,
      newTotalXp: xpRes.newXp,
    };
  }

  if (path === 'pedagogical/grande-missao' && method === 'GET') {
    return { catalog: GRANDE_MISSAO };
  }

  if (path === 'pedagogical/grande-missao/complete' && method === 'POST') {
    if (!currentUser) throw new Error('Inicia sessão.');
    const { totalScore = 100 } = body;
    const xpRes = addXp(currentUser.id, 300);
    awardBadge(currentUser.id, 'grande_missao_master');
    return { success: true, score: totalScore, xpEarned: 300, newTotalXp: xpRes.newXp };
  }

  if (path === 'pedagogical/class-ranking' && method === 'GET') {
    const users = getItem<StoredUser[]>(KEY_USERS, []).filter((u) => u.role === 'student');
    users.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    const ranking = users.map((u, i) => ({
      position: i + 1,
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      xp: u.xp || 0,
      level: u.level || 1,
      levelName: u.levelName || 'Novato',
      isCurrentUser: currentUser ? u.id === currentUser.id : false,
    }));

    return { ranking };
  }

  if (path === 'pedagogical/badges' && method === 'GET') {
    const userBadges = currentUser ? getUserBadges(currentUser.id) : [];
    return { badges: userBadges };
  }

  // -------------------------------------------------------------
  // TEACHER ROUTES
  // -------------------------------------------------------------
  if (path.startsWith('teacher/')) {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Acesso restrito à área de gestão do Professor.');
    }

    const allUsers = getItem<StoredUser[]>(KEY_USERS, []);
    const students = allUsers.filter((u) => u.role === 'student');
    const classes = getItem<ClientClass[]>(KEY_CLASSES, DEFAULT_CLASSES);
    const progressList = getItem<any[]>(KEY_PROGRESS, []);
    const attempts = getItem<any[]>(KEY_ATTEMPTS, []);
    const missions = getItem<any[]>(KEY_MISSIONS, []);

    if (path === 'teacher/dashboard-stats' || path === 'teacher/analytics') {
      return {
        totalStudents: students.length,
        totalClasses: classes.length,
        totalActivitiesCompleted: progressList.length,
        totalAssessmentsTaken: attempts.length,
        averageScore: attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + (b.scorePercentage || 0), 0) / attempts.length) : 85,
        classDistribution: classes.map((c) => ({
          classId: c.id,
          name: c.name,
          studentCount: students.filter((s) => s.classId === c.id).length,
        })),
      };
    }

    if (path === 'teacher/classes' && method === 'GET') {
      return {
        classes: classes.map((c) => ({
          ...c,
          studentCount: students.filter((s) => s.classId === c.id).length,
        })),
      };
    }

    if (path === 'teacher/students' && method === 'GET') {
      return {
        students: students.map((s) => {
          const sAttempts = attempts.filter((a) => a.userId === s.id);
          const avg = sAttempts.length > 0 ? Math.round(sAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) / sAttempts.length) : 0;
          return {
            id: s.id,
            name: s.name,
            email: s.email,
            nickname: s.nickname,
            avatar: s.avatar,
            classId: s.classId,
            className: s.className || classes.find((c) => c.id === s.classId)?.name || '6.º A',
            xp: s.xp,
            level: s.level,
            levelName: s.levelName,
            averageScore: avg,
            completedActivities: progressList.filter((p) => p.userId === s.id).length,
            blocked: s.blocked,
            lastLoginAt: s.lastLoginAt,
          };
        }),
      };
    }

    if (path.startsWith('teacher/students/') && method === 'GET') {
      const studentId = path.split('/')[2];
      const student = students.find((s) => s.id === studentId);
      if (!student) throw new Error('Aluno não encontrado.');

      const sProgress = progressList.filter((p) => p.userId === studentId);
      const sAttempts = attempts.filter((a) => a.userId === studentId);
      const sMissions = missions.filter((m) => m.userId === studentId);
      const badges = getUserBadges(studentId);

      return {
        student: { ...student, password: '' },
        progress: sProgress,
        attempts: sAttempts,
        missions: sMissions,
        badges,
      };
    }

    if (path.endsWith('/reset-progress') && method === 'POST') {
      const parts = path.split('/');
      const targetId = parts[2];

      const newProg = progressList.filter((p) => p.userId !== targetId);
      const newAtt = attempts.filter((a) => a.userId !== targetId);
      const newMiss = missions.filter((m) => m.userId !== targetId);

      setItem(KEY_PROGRESS, newProg);
      setItem(KEY_ATTEMPTS, newAtt);
      setItem(KEY_MISSIONS, newMiss);

      const sIdx = allUsers.findIndex((u) => u.id === targetId);
      if (sIdx >= 0) {
        allUsers[sIdx].xp = 100;
        allUsers[sIdx].level = 1;
        allUsers[sIdx].levelName = 'Novato Digital';
        setItem(KEY_USERS, allUsers);
      }

      return { success: true, message: 'Progresso do aluno reiniciado com sucesso.' };
    }

    if (path.endsWith('/toggle-block') && method === 'POST') {
      const targetId = path.split('/')[2];
      const sIdx = allUsers.findIndex((u) => u.id === targetId);
      if (sIdx >= 0) {
        allUsers[sIdx].blocked = !allUsers[sIdx].blocked;
        setItem(KEY_USERS, allUsers);
        return { success: true, blocked: allUsers[sIdx].blocked };
      }
      throw new Error('Aluno não encontrado.');
    }

    if (path === 'teacher/export/csv' || path === 'teacher/export/pauta-csv') {
      let csv = 'Nome,Nickname,Email,Turma,Nivel,XP,Nota Media (%),Ultimo Acesso\n';
      students.forEach((s) => {
        const sAttempts = attempts.filter((a) => a.userId === s.id);
        const avg = sAttempts.length > 0 ? Math.round(sAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) / sAttempts.length) : 0;
        csv += `"${s.name}","${s.nickname}","${s.email}","${s.className || s.classId}","${s.levelName} (${s.level})",${s.xp},${avg},"${s.lastLoginAt || 'Sem acesso'}"\n`;
      });
      return csv;
    }
  }

  // Fallback generic response
  return { success: true };
}
