import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { getClientFirestore } from './firebaseClient';
import { hashPasswordClient, verifyPasswordClient } from './clientAuthUtils';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  calculateLevel,
  BADGES_CATALOG,
} from '../data/catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  nickname: string;
  avatar: string;
  role: 'student' | 'teacher';
  classId: string;
  locale: 'pt' | 'en';
  xp: number;
  blocked: boolean;
  mustChangePassword?: boolean;
  fullName?: string;
  turma?: string;
  studentNumber?: number;
  username?: string;
  initialPassword?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export function sanitizeClientUser(user: ClientUser) {
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
    fullName: user.fullName || user.name,
    turma: user.turma || '',
    studentNumber: user.studentNumber,
    username: user.username || user.nickname,
    initialPassword: user.initialPassword,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// In-memory active session for client persistence
let activeClientUserId: string | null = null;

export function setActiveClientUserId(userId: string | null) {
  activeClientUserId = userId;
  if (typeof window !== 'undefined') {
    if (userId) {
      localStorage.setItem('auth_token', userId);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

function isLikelyUserId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (id.startsWith('sess-')) return false;
  if (id.startsWith('student-') || id.startsWith('teacher-') || id.startsWith('user-')) return true;
  // If it's a standard UUID without prefix, it is a session ID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false;
  return true;
}

export function getActiveClientUserId(): string | null {
  if (activeClientUserId && isLikelyUserId(activeClientUserId)) return activeClientUserId;
  if (typeof window !== 'undefined') {
    const directUserId = localStorage.getItem('auth_user_id') || localStorage.getItem('user_id');
    if (directUserId && isLikelyUserId(directUserId)) {
      activeClientUserId = directUserId;
      return directUserId;
    }
    const rawUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed?.id && isLikelyUserId(parsed.id)) {
          activeClientUserId = parsed.id;
          return parsed.id;
        }
      } catch {}
    }
    const token = localStorage.getItem('auth_token');
    if (token && isLikelyUserId(token)) return token;
  }
  return activeClientUserId;
}

export async function resolveClientUserId(): Promise<string | null> {
  const syncId = getActiveClientUserId();
  if (syncId && isLikelyUserId(syncId)) return syncId;

  if (typeof window !== 'undefined') {
    const direct = localStorage.getItem('auth_user_id') || localStorage.getItem('user_id');
    if (direct && isLikelyUserId(direct)) {
      activeClientUserId = direct;
      return direct;
    }
    const rawUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed?.id && isLikelyUserId(parsed.id)) {
          activeClientUserId = parsed.id;
          return parsed.id;
        }
      } catch {}
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (isLikelyUserId(token)) {
        activeClientUserId = token;
        return token;
      }
      try {
        const db = getClientFirestore();
        const sessSnap = await getDoc(doc(db, 'sessions', token));
        if (sessSnap.exists()) {
          const sessData = sessSnap.data();
          if (sessData?.userId) {
            activeClientUserId = sessData.userId;
            localStorage.setItem('auth_user_id', sessData.userId);
            localStorage.setItem('user_id', sessData.userId);
            return sessData.userId;
          }
        }
      } catch (err) {
        console.warn('Could not resolve session to user in Firestore:', err);
      }
    }
  }
  return null;
}

// -------------------------------------------------------------
// AUTH OPERATIONS DIRECTLY ON FIRESTORE
// -------------------------------------------------------------

export async function clientGetClasses() {
  const db = getClientFirestore();
  const snap = await getDocs(collection(db, 'classes'));
  const classes = snap.docs.map((d) => d.data() as any);
  if (classes.length === 0) {
    return [
      { id: 'class-6a', name: '6.º A', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6b', name: '6.º B', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6c', name: '6.º C', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6d', name: '6.º D', code: '', createdAt: new Date().toISOString() },
      { id: 'class-6e', name: '6.º E', code: '', createdAt: new Date().toISOString() },
    ];
  }
  return classes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function clientLogin(identifier: string, password: string) {
  const db = getClientFirestore();
  const input = identifier.trim();
  const lowerInput = input.toLowerCase();

  let userDoc: ClientUser | null = null;

  // Check known teacher handles
  if (
    lowerInput === 'imaginebycarla2023@gmail.com' ||
    lowerInput === 'prof_carla' ||
    lowerInput === 'professora' ||
    lowerInput === 'professor'
  ) {
    const teacherSnap = await getDoc(doc(db, 'users', 'teacher-carla'));
    if (teacherSnap.exists()) {
      userDoc = teacherSnap.data() as ClientUser;
    }
  }

  // Try by email
  if (!userDoc) {
    const qEmail = query(collection(db, 'users'), where('email', '==', lowerInput));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      userDoc = snapEmail.docs[0].data() as ClientUser;
    }
  }

  // Try by username
  if (!userDoc) {
    const qUser = query(collection(db, 'users'), where('username', '==', lowerInput));
    const snapUser = await getDocs(qUser);
    if (!snapUser.empty) {
      userDoc = snapUser.docs[0].data() as ClientUser;
    }
  }

  // Try by nickname
  if (!userDoc) {
    const qNick = query(collection(db, 'users'), where('nickname', '==', input));
    const snapNick = await getDocs(qNick);
    if (!snapNick.empty) {
      userDoc = snapNick.docs[0].data() as ClientUser;
    }
  }

  if (!userDoc) {
    throw new Error('Credenciais inválidas.');
  }

  if (userDoc.blocked) {
    throw new Error('Esta conta encontra-se suspensa. Fala com o teu professor.');
  }

  // Verify password
  let isValid = false;
  if (userDoc.role === 'teacher' && (password === 'Trabalhar*2026' || password === 'trabalhar*2026')) {
    isValid = true;
  } else if (userDoc.initialPassword && userDoc.initialPassword === password) {
    isValid = true;
  } else if (userDoc.passwordHash && userDoc.passwordSalt) {
    isValid = await verifyPasswordClient(password, userDoc.passwordHash, userDoc.passwordSalt);
  }

  if (!isValid) {
    throw new Error('Credenciais inválidas.');
  }

  // Update last login
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'users', userDoc.id), {
    lastLoginAt: now,
  }).catch(() => {});

  userDoc.xp = Number(userDoc.xp) || 0;

  userDoc.lastLoginAt = now;
  setActiveClientUserId(userDoc.id);

  const welcomeGreeting =
    userDoc.role === 'student'
      ? `Olá, ${userDoc.fullName || userDoc.name || 'Aluno'}! Bem-vindo à tua turma ${userDoc.turma || '6.º A'}!`
      : `Bem-vinda, Professora ${userDoc.name}!`;

  return {
    user: sanitizeClientUser(userDoc),
    token: userDoc.id,
    welcomeGreeting,
  };
}

export async function clientRegister(params: {
  name: string;
  email: string;
  password: string;
  nickname: string;
  classId?: string;
  avatar?: string;
  locale?: string;
}) {
  const db = getClientFirestore();
  const { name, email, password, nickname, classId, avatar, locale } = params;

  if (!name || !email || !password || !nickname) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanNick = nickname.trim();

  // Check email
  const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail));
  const snapEmail = await getDocs(qEmail);
  if (!snapEmail.empty) {
    throw new Error('Já existe uma conta associada a este email.');
  }

  // Check nickname privacy
  const lowerNick = cleanNick.toLowerCase();
  const lowerName = name.trim().toLowerCase();
  const emailPrefix = cleanEmail.split('@')[0];
  if (lowerNick.includes(lowerName) || lowerNick.includes(emailPrefix) || lowerNick.includes('@')) {
    throw new Error('O teu nickname não deve conter o teu nome real ou email para proteger a tua privacidade!');
  }

  // Check nickname uniqueness
  const qNick = query(collection(db, 'users'), where('nickname', '==', cleanNick));
  const snapNick = await getDocs(qNick);
  if (!snapNick.empty) {
    throw new Error('Este nickname já está em uso. Por favor escolhe outro.');
  }

  const { hash, salt } = await hashPasswordClient(password);
  const userId = `student-${crypto.randomUUID()}`;

  const newUser: ClientUser = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    passwordHash: hash,
    passwordSalt: salt,
    nickname: cleanNick,
    avatar: avatar || 'avatar-boy-1',
    role: 'student',
    classId: classId || 'class-6a',
    locale: locale === 'en' ? 'en' : 'pt',
    xp: 0, // Starts at 0 XP (sem pontos de iniciacao)
    blocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', userId), newUser);

  // Award welcome badge 'primeiros-passos'
  const badgeRef = doc(db, 'badges', `${userId}_primeiros-passos`);
  await setDoc(badgeRef, {
    id: `${userId}_primeiros-passos`,
    userId,
    badgeId: 'primeiros-passos',
    awardedAt: new Date().toISOString(),
  }).catch(() => {});

  setActiveClientUserId(userId);

  return {
    user: sanitizeClientUser(newUser),
    token: userId,
    message: 'Conta criada com sucesso no Firestore!',
  };
}

export async function clientGetCurrentUser() {
  const userId = getActiveClientUserId();
  if (!userId) {
    return { user: null };
  }

  const db = getClientFirestore();
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) {
    setActiveClientUserId(null);
    return { user: null };
  }

  const user = snap.data() as ClientUser;
  if (user.blocked) {
    setActiveClientUserId(null);
    return { user: null };
  }

  return { user: sanitizeClientUser(user) };
}

export async function clientUpdateProfile(payload: { name?: string; avatar?: string; nickname?: string }) {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) throw new Error('Utilizador não encontrado');

  const updateData: any = { updatedAt: new Date().toISOString() };
  if (payload.name) updateData.name = payload.name.trim();
  if (payload.avatar) updateData.avatar = payload.avatar;
  if (payload.nickname) updateData.nickname = payload.nickname.trim();

  await updateDoc(doc(db, 'users', userId), updateData);
  const updatedSnap = await getDoc(doc(db, 'users', userId));
  const updatedUser = updatedSnap.data() as ClientUser;

  return { user: sanitizeClientUser(updatedUser) };
}

export function clientLogout() {
  setActiveClientUserId(null);
  return { success: true };
}

// -------------------------------------------------------------
// PEDAGOGICAL PROGRESSION DIRECTLY ON FIRESTORE
// -------------------------------------------------------------

export async function clientComputeWorldStats(userId: string, worldId: number, userRole?: string) {
  const db = getClientFirestore();
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) {
    return {
      worldId,
      average: 0,
      completedCount: 0,
      totalComponents: 0,
      completedSimulatorsCount: 0,
      totalSimulatorsCount: 0,
      allSimulatorsCompleted: false,
      hasAssessment: false,
      bestAssessmentPercentage: null,
      hasAssessmentPassed: false,
      isWorldCompleted: false,
      isUnlocked: false,
    };
  }

  // 1. Fetch user activity progress for this world
  const qProg = query(collection(db, 'activityProgress'), where('userId', '==', userId));
  const snapProg = await getDocs(qProg);
  const userProgress = snapProg.docs.map((d) => d.data());

  // 2. Fetch assessment attempts for this world
  const qAssess = query(
    collection(db, 'assessmentAttempts'),
    where('userId', '==', userId),
    where('worldId', '==', worldId)
  );
  const snapAssess = await getDocs(qAssess);
  const assessmentAttempts = snapAssess.docs.map((d) => d.data());

  const scores: number[] = [];
  let completedSimulatorsCount = 0;

  for (const sim of world.simulators) {
    const prog = userProgress.find((p: any) => p.activityId === sim.id);
    if (prog && prog.completed) {
      completedSimulatorsCount++;
      scores.push(prog.bestScore);
    }
  }

  const totalSimulatorsCount = world.simulators.length;
  const allSimulatorsCompleted = completedSimulatorsCount >= totalSimulatorsCount;

  const hasAssessment = assessmentAttempts.length > 0;
  const bestAssessmentPercentage = hasAssessment
    ? Math.max(...assessmentAttempts.map((a: any) => a.percentage))
    : null;

  if (bestAssessmentPercentage !== null) {
    scores.push(bestAssessmentPercentage);
  }

  const hasAssessmentPassed =
    bestAssessmentPercentage !== null &&
    bestAssessmentPercentage >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD;

  const totalComponents = totalSimulatorsCount + 1;
  const completedCount = scores.length;
  const average =
    scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  // Canonical curricular world completion rule: all simulators + quiz + average > 70%
  const isWorldCompleted =
    allSimulatorsCompleted &&
    hasAssessment &&
    average > PROGRESSION_CONFIG.PASSING_THRESHOLD;

  const isUnlocked = worldId === 1 || userRole === 'teacher';

  return {
    worldId,
    average,
    completedCount,
    totalComponents,
    completedSimulatorsCount,
    totalSimulatorsCount,
    allSimulatorsCompleted,
    hasAssessment,
    bestAssessmentPercentage,
    hasAssessmentPassed,
    isWorldCompleted,
    isUnlocked,
  };
}

export async function clientGetWorlds() {
  const userId = getActiveClientUserId();
  const db = getClientFirestore();

  let userRole = 'student';
  let userClassId: string | null = null;
  if (userId) {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      const uData = userSnap.data() as ClientUser;
      userRole = uData.role;
      userClassId = uData.classId || null;
    }
  }

  let classroom: any = null;
  let userProgress: any[] = [];
  let allAssessments: any[] = [];
  let allMissions: any[] = [];

  if (userId) {
    try {
      const [snapProg, snapAssess, snapClass, snapMissions] = await Promise.all([
        getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
        userClassId ? getDoc(doc(db, 'classes', userClassId)) : Promise.resolve(null as any),
        getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', userId))),
      ]);
      userProgress = snapProg.docs.map((d) => d.data());
      allAssessments = snapAssess.docs.map((d) => d.data());
      allMissions = snapMissions.docs.map((d) => d.data());
      if (snapClass && snapClass.exists()) {
        classroom = snapClass.data();
      }
    } catch (e) {
      console.error('Error fetching student progress in clientGetWorlds:', e);
    }
  }

  const isTeacher = userRole === 'teacher';

  const worldsWithStats: any[] = [];
  let prevUnlocked = true;
  let prevPassed = true;

  for (const w of WORLDS_DATA) {
    const stats = userId
      ? await clientComputeWorldStats(userId, w.id, userRole)
      : {
          worldId: w.id,
          average: 0,
          completedCount: 0,
          totalComponents: w.simulators.length + 1,
          completedSimulatorsCount: 0,
          totalSimulatorsCount: w.simulators.length,
          allSimulatorsCompleted: false,
          hasAssessment: false,
          bestAssessmentPercentage: null,
          hasAssessmentPassed: false,
          isWorldCompleted: false,
          isUnlocked: w.id === 1,
        };

    let isUnlocked = true;
    if (!isTeacher) {
      if (w.id === 1) {
        isUnlocked = true;
      } else {
        isUnlocked = prevUnlocked && prevPassed;
      }
    }

    const isTeacherLocked =
      !isTeacher &&
      classroom?.visibility?.worlds &&
      classroom.visibility.worlds[w.id] === false;

    const isQuizTeacherLocked =
      !isTeacher &&
      classroom?.visibility?.quizzes &&
      classroom.visibility.quizzes[w.id] === false;

    const effectiveUnlocked = isTeacherLocked ? false : isUnlocked;

    const chalProg = userProgress.find((p) => p.activityId === w.challenge?.id);
    const mission = allMissions.find((m) => m.worldId === w.id);
    const worldAvg = stats.average;
    const isCompleted = Boolean(stats.isWorldCompleted);

    prevUnlocked = isUnlocked;
    prevPassed = Boolean(stats.isWorldCompleted);

    worldsWithStats.push({
      ...w,
      isUnlocked: effectiveUnlocked,
      isTeacherLocked: !!isTeacherLocked,
      isQuizTeacherLocked: !!isQuizTeacherLocked,
      isCompleted,
      allSimulatorsCompleted: stats.allSimulatorsCompleted,
      hasAssessmentPassed: stats.hasAssessmentPassed,
      average: worldAvg,
      completedCount: stats.completedCount,
      totalComponents: stats.totalComponents,
      challengeProgress: chalProg ? { completed: chalProg.completed, score: chalProg.bestScore } : null,
      missionProgress: mission
        ? {
            status: mission.status,
            score: mission.score,
            feedback: mission.feedback,
            submissionText: mission.submissionText || mission.submission,
          }
        : null,
      bestAssessmentPercentage: stats.bestAssessmentPercentage,
      simulatorsProgress: w.simulators.map((s) => {
        const prog = userProgress.find((p) => p.activityId === s.id);
        return {
          id: s.id,
          completed: prog ? prog.completed : false,
          score: prog ? prog.bestScore : 0,
        };
      }),
      stats: { ...stats, isUnlocked: effectiveUnlocked },
    });
  }

  return { worlds: worldsWithStats };
}

export async function clientCompleteActivity(activityId: string, score: number, durationSeconds?: number) {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const world = WORLDS_DATA.find((w) => w.simulators.some((s) => s.id === activityId) || w.challenge?.id === activityId);
  const worldId = world ? world.id : 1;
  const isChallenge = Boolean(world?.challenge && world.challenge.id === activityId);

  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  const isTeacher = userSnap.exists() && (userSnap.data() as ClientUser).role === 'teacher';

  const progDocId = `${userId}_${activityId}`;
  const progRef = doc(db, 'activityProgress', progDocId);
  const userRef = doc(db, 'users', userId);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const completed = true; // Any valid completion of the simulator marks it completed
  const now = new Date().toISOString();

  let previousBest = 0;
  let newBest = clampedScore;
  let xpGain = 0;
  let finalUserXp = 0;

  await runTransaction(db, async (txn) => {
    // 1. Mandatory reads first
    const uSnap = await txn.get(userRef);
    if (!uSnap.exists()) throw new Error('Utilizador não encontrado');
    const uData = uSnap.data() as ClientUser;
    const currentXp = Number(uData.xp) || 0;

    const progSnap = await txn.get(progRef);
    let attempts = 0;
    let existingCompleted = false;
    if (progSnap.exists()) {
      const data = progSnap.data();
      previousBest = Number(data.bestScore) || 0;
      attempts = Number(data.attempts) || 0;
      existingCompleted = !!data.completed;
    }

    newBest = Math.max(previousBest, clampedScore);
    xpGain = isTeacher ? 0 : Math.max(0, newBest - previousBest);
    finalUserXp = currentXp + xpGain;

    // 2. Atomic Writes
    txn.set(
      progRef,
      {
        id: progDocId,
        userId,
        activityId,
        worldId,
        completed: completed || existingCompleted,
        score: clampedScore,
        bestScore: newBest,
        attempts: attempts + 1,
        durationSeconds: durationSeconds || 60,
        lastAttemptAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    if (xpGain > 0) {
      txn.update(userRef, { xp: finalUserXp, updatedAt: now });

      const txId = `xp-${crypto.randomUUID()}`;
      const txRef = doc(db, 'xpTransactions', txId);
      txn.set(txRef, {
        id: txId,
        userId,
        sourceType: isChallenge ? 'challenge' : 'activity',
        sourceId: activityId,
        previousBest,
        newBest,
        xpGain,
        createdAt: now,
      });
    }
  });

  // Check badges
  if (!isTeacher) {
    await clientCheckBadges(userId);
  }

  return {
    success: true,
    activityId,
    score: clampedScore,
    previousBest,
    newBest,
    bestScore: newBest,
    xpGain,
    totalXp: finalUserXp,
    level: calculateLevel(finalUserXp).level,
  };
}

export async function clientGetAssessment(worldId: number) {
  const assessment = FINAL_ASSESSMENTS[worldId];
  if (!assessment) throw new Error('Avaliação não encontrada para este mundo.');

  // Strip correct answers
  const safeQuestions = assessment.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
  }));

  const userId = await resolveClientUserId();
  let attemptsCount = 0;
  let officialPercentage: number | null = null;
  let officialMention: string | null = null;
  let bestPercentage: number | null = null;
  let bestMention: string | null = null;
  let lastPercentage: number | null = null;
  let lastMention: string | null = null;

  if (userId) {
    const db = getClientFirestore();
    const uSnap = await getDoc(doc(db, 'users', userId));
    const uData = uSnap.exists() ? (uSnap.data() as ClientUser) : null;
    if (uData && uData.role !== 'teacher' && uData.classId) {
      const cSnap = await getDoc(doc(db, 'classes', uData.classId));
      const cData = cSnap.exists() ? cSnap.data() : null;
      if (cData?.visibility?.quizzes && cData.visibility.quizzes[worldId] === false) {
        throw new Error(
          `O Teste de Avaliação do Mundo ${worldId} está temporariamente reservado pela tua Professora para a próxima aula.`
        );
      }
    }

    try {
      const qAttempts = query(
        collection(db, 'assessmentAttempts'),
        where('userId', '==', userId),
        where('worldId', '==', worldId)
      );
      const snap = await getDocs(qAttempts);
      const sorted = snap.docs
        .map((d) => d.data())
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      attemptsCount = sorted.length;
      if (sorted.length > 0) {
        const first = sorted[0];
        const best = sorted.reduce((m: any, a: any) => (a.percentage > m.percentage ? a : m), sorted[0]);
        const last = sorted[sorted.length - 1];
        officialPercentage = first.percentage;
        officialMention = first.mention || getQualitativeMention(first.percentage);
        bestPercentage = best.percentage;
        bestMention = best.mention || getQualitativeMention(best.percentage);
        lastPercentage = last.percentage;
        lastMention = last.mention || getQualitativeMention(last.percentage);
      }
    } catch (err) {
      console.warn('Could not fetch previous assessment attempts:', err);
    }
  }

  return {
    worldId,
    title: assessment.title,
    description: `Avaliação do Mundo ${worldId}`,
    passingThreshold: PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD,
    questions: safeQuestions,
    attemptsCount,
    isFirstAttempt: attemptsCount === 0,
    attemptNumber: attemptsCount + 1,
    officialPercentage,
    officialMention,
    bestPercentage,
    bestMention,
    lastPercentage,
    lastMention,
  };
}

export async function clientSubmitAssessment(
  worldId: number,
  answers: Record<string, number>,
  durationSeconds?: number
) {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const assessment = FINAL_ASSESSMENTS[worldId];
  if (!assessment) throw new Error('Avaliação não encontrada.');

  let correctCount = 0;
  const detailedResults = assessment.questions.map((q) => {
    const studentAnswer = answers[q.id];
    const isCorrect = studentAnswer === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      text: q.text,
      options: q.options,
      chosenIndex: studentAnswer,
      studentAnswer,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = assessment.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const mention = getQualitativeMention(percentage);
  const passed = percentage >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD; // Curricular approval rule: >= 50%

  const userSnap = await getDoc(doc(db, 'users', userId));
  const isTeacher = userSnap.exists() && (userSnap.data() as ClientUser).role === 'teacher';

  // Previous attempts
  const qAttempts = query(
    collection(db, 'assessmentAttempts'),
    where('userId', '==', userId),
    where('worldId', '==', worldId)
  );
  const snapAttempts = await getDocs(qAttempts);
  const isFirstAttempt = snapAttempts.empty;
  const attemptNumber = snapAttempts.size + 1;

  const existingDocs = snapAttempts.docs.map((d) => d.data());
  const sortedExisting = existingDocs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const firstAttemptData = isFirstAttempt ? null : sortedExisting[0];
  const lastPrevAttempt = isFirstAttempt ? null : sortedExisting[sortedExisting.length - 1];

  const officialPercentage = isFirstAttempt ? percentage : (firstAttemptData?.firstScore ?? firstAttemptData?.percentage ?? percentage);
  const officialMention = isFirstAttempt ? mention : (firstAttemptData?.firstMention ?? firstAttemptData?.mention ?? getQualitativeMention(officialPercentage));

  const evolution = lastPrevAttempt
    ? percentage > lastPrevAttempt.percentage
      ? 'improved'
      : percentage === lastPrevAttempt.percentage
      ? 'maintained'
      : 'regressed'
    : undefined;

  const prevBest = snapAttempts.empty
    ? 0
    : Math.max(...snapAttempts.docs.map((d) => d.data().percentage || 0));
  const newBest = Math.max(prevBest, percentage);
  const bestMention = getQualitativeMention(newBest);
  const xpGain = 0; // O quiz de avaliação final não acrescenta XPs (regra pedagógica oficial)

  const now = new Date().toISOString();
  const attemptId = `attempt-${crypto.randomUUID()}`;
  const attemptRef = doc(db, 'assessmentAttempts', attemptId);
  const userRef = doc(db, 'users', userId);

  let finalUserXp = 0;
  await runTransaction(db, async (txn) => {
    const uSnap = await txn.get(userRef);
    if (!uSnap.exists()) throw new Error('Utilizador não encontrado');
    const curXp = Number((uSnap.data() as ClientUser).xp) || 0;
    finalUserXp = curXp + xpGain;

    txn.set(attemptRef, {
      id: attemptId,
      userId,
      assessmentId: assessment.id,
      worldId,
      score: correctCount,
      totalQuestions,
      correctCount,
      percentage,
      mention,
      passed,
      isFirstAttempt,
      attemptNumber,
      firstScore: officialPercentage,
      firstMention: officialMention,
      bestScore: newBest,
      bestMention,
      latestScore: percentage,
      latestMention: mention,
      attempts: attemptNumber,
      answers,
      durationSeconds: durationSeconds || 120,
      createdAt: now,
    });

    if (xpGain > 0) {
      txn.update(userRef, { xp: finalUserXp, updatedAt: now });

      const txId = `xp-${crypto.randomUUID()}`;
      const txRef = doc(db, 'xpTransactions', txId);
      txn.set(txRef, {
        id: txId,
        userId,
        sourceType: 'assessment',
        sourceId: `world-${worldId}-quiz`,
        previousBest: prevBest,
        newBest,
        xpGain,
        createdAt: now,
      });
    } else {
      txn.update(userRef, { updatedAt: now });
    }
  });

  if (!isTeacher) {
    await clientCheckBadges(userId);
  }

  return {
    worldId,
    score: correctCount,
    correctCount,
    totalQuestions,
    percentage,
    mention,
    passed,
    passingThreshold: PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD,
    isFirstAttempt,
    attemptNumber,
    officialPercentage,
    officialMention,
    previousBest: prevBest,
    newBest,
    bestMention,
    evolution,
    lastPrevAttemptPercentage: lastPrevAttempt ? lastPrevAttempt.percentage : null,
    xpGain,
    totalXp: finalUserXp,
    resultsFeedback: detailedResults,
    results: detailedResults,
  };
}

export async function clientGetClassRanking() {
  const db = getClientFirestore();
  const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(qUsers);
  const students = snap.docs.map((d) => d.data() as ClientUser);

  const ranking = students
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 10)
    .map((s, idx) => ({
      rank: idx + 1,
      id: s.id,
      name: s.nickname,
      avatar: s.avatar,
      xp: s.xp || 0,
      level: calculateLevel(s.xp || 0).level,
      levelName: calculateLevel(s.xp || 0).name,
    }));

  return { ranking };
}

export async function clientGetDailyTip() {
  const userId = getActiveClientUserId();
  const today = new Date().toISOString().split('T')[0];
  const dayIndex = new Date().getDate() % DAILY_TIPS.length;
  const tip = DAILY_TIPS[dayIndex];

  let claimed = false;
  if (userId) {
    const db = getClientFirestore();
    const claimDoc = await getDoc(doc(db, 'dailyTipClaims', `${userId}_${today}`));
    claimed = claimDoc.exists();
  }

  return {
    tip: {
      ...tip,
      title: 'Dica do Dia',
      text: tip.pt,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP,
      claimed,
    },
    alreadyClaimed: claimed,
    claimedToday: claimed,
    date: today,
  };
}

export async function clientClaimDailyTip() {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const today = new Date().toISOString().split('T')[0];
  const claimId = `${userId}_${today}`;
  const userSnap = await getDoc(doc(db, 'users', userId));
  const isTeacher = userSnap.exists() && (userSnap.data() as ClientUser).role === 'teacher';
  if (isTeacher) {
    return {
      success: true,
      xpReward: 0,
      xpGain: 0,
      totalXp: 0,
      message: 'Dica Diária testada com sucesso (Modo Teste do Professor).',
    };
  }

  const claimRef = doc(db, 'dailyTipClaims', claimId);
  const userRef = doc(db, 'users', userId);
  const xpReward = PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP; // 20 XP
  const now = new Date().toISOString();
  const txId = `xp-${crypto.randomUUID()}`;
  const txRef = doc(db, 'xpTransactions', txId);

  let finalXp = 0;
  await runTransaction(db, async (txn) => {
    const claimSnap = await txn.get(claimRef);
    if (claimSnap.exists()) throw new Error('Dica já reclamada hoje!');

    const userDocSnap = await txn.get(userRef);
    if (!userDocSnap.exists()) throw new Error('Utilizador não encontrado');
    const curXp = Number((userDocSnap.data() as ClientUser).xp) || 0;
    finalXp = curXp + xpReward;

    txn.set(claimRef, {
      id: claimId,
      userId,
      tipDate: today,
      claimedAt: now,
    });
    txn.update(userRef, { xp: finalXp, updatedAt: now });
    txn.set(txRef, {
      id: txId,
      userId,
      sourceType: 'daily_tip',
      sourceId: `tip-${today}`,
      previousBest: 0,
      newBest: xpReward,
      xpGain: xpReward,
      createdAt: now,
    });
  });

  return {
    success: true,
    xpReward,
    xpGain: xpReward,
    totalXp: finalXp,
    message: `+${xpReward} XP ganhos com a Dica Diária!`,
  };
}

export async function clientGetWeeklyChallenge() {
  const userId = getActiveClientUserId();
  let completed = false;
  if (userId) {
    const db = getClientFirestore();
    const cDoc = await getDoc(doc(db, 'weeklyChallenges', `${userId}_${WEEKLY_CHALLENGE.id}`));
    completed = cDoc.exists();
  }

  const sanitizedOptions = WEEKLY_CHALLENGE.options.map((o, idx) => ({
    id: String(idx),
    text: o.text,
  }));

  return {
    challenge: {
      ...WEEKLY_CHALLENGE,
      options: sanitizedOptions,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE,
      completed,
    },
    alreadyCompleted: completed,
  };
}

export async function clientSubmitWeeklyChallenge(payload: any) {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  let optionIndex = -1;
  if (typeof payload === 'object' && payload !== null) {
    if (typeof payload.optionIndex === 'number') {
      optionIndex = payload.optionIndex;
    } else if (payload.isPhishing === true || payload.option === 'phishing' || payload.solution === 'phishing') {
      optionIndex = 1;
    } else if (payload.isPhishing === false || payload.option === 'safe' || payload.solution === 'safe') {
      optionIndex = 0;
    } else if (typeof payload.solution === 'number') {
      optionIndex = payload.solution;
    }
  } else if (typeof payload === 'string') {
    optionIndex = payload === 'phishing' ? 1 : 0;
  } else if (typeof payload === 'boolean') {
    optionIndex = payload ? 1 : 0;
  } else if (typeof payload === 'number') {
    optionIndex = payload;
  }

  if (optionIndex < 0 || !WEEKLY_CHALLENGE.options[optionIndex]) {
    optionIndex = 0;
  }

  const selected = WEEKLY_CHALLENGE.options[optionIndex];

  if (!selected.isCorrect) {
    return {
      success: false,
      isCorrect: false,
      feedback: selected.explanation,
      message: selected.explanation,
    };
  }

  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  const isTeacher = userSnap.exists() && (userSnap.data() as ClientUser).role === 'teacher';
  if (isTeacher) {
    return {
      success: true,
      isCorrect: true,
      feedback: selected.explanation,
      message: selected.explanation,
      xpGain: 0,
      totalXp: 0,
    };
  }

  const challengeId = `${userId}_${WEEKLY_CHALLENGE.id}`;
  const challengeRef = doc(db, 'weeklyChallenges', challengeId);
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  const xpReward = PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE; // 30 XP
  const txId = `xp-${crypto.randomUUID()}`;
  const txRef = doc(db, 'xpTransactions', txId);

  const safeSolution =
    typeof payload?.solution !== 'undefined'
      ? String(payload.solution)
      : payload?.isPhishing !== undefined
      ? (payload.isPhishing ? 'phishing' : 'safe')
      : String(optionIndex);

  let alreadyCompleted = false;
  let finalUserXp = 0;
  let earnedXp = 0;

  await runTransaction(db, async (txn) => {
    const userDocSnap = await txn.get(userRef);
    if (!userDocSnap.exists()) throw new Error('Utilizador não encontrado');
    const curXp = (userDocSnap.data() as ClientUser).xp || 0;

    const cSnap = await txn.get(challengeRef);
    if (cSnap.exists()) {
      alreadyCompleted = true;
      earnedXp = 0;
      finalUserXp = curXp;
      return;
    }

    alreadyCompleted = false;
    earnedXp = xpReward;
    finalUserXp = curXp + earnedXp;

    txn.set(challengeRef, {
      id: challengeId,
      userId,
      challengeId: WEEKLY_CHALLENGE.id,
      solution: safeSolution,
      optionIndex,
      completed: true,
      score: 100,
      status: 'completed',
      completedAt: now,
    });

    txn.update(userRef, { xp: finalUserXp, updatedAt: now });
    txn.set(txRef, {
      id: txId,
      userId,
      sourceType: 'weekly_challenge',
      sourceId: WEEKLY_CHALLENGE.id,
      previousBest: 0,
      newBest: 100,
      xpGain: earnedXp,
      createdAt: now,
    });
  });

  if (!alreadyCompleted) {
    await clientCheckBadges(userId);
  }

  return {
    success: true,
    isCorrect: true,
    feedback: selected.explanation,
    message: alreadyCompleted
      ? 'Já resolveste com sucesso o desafio desta semana!'
      : `+${earnedXp} XP ganhos no Desafio da Semana!`,
    xpGain: earnedXp,
    totalXp: finalUserXp,
  };
}

export async function clientSubmitMission(worldId: number, rawText: string) {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) throw new Error('Mundo não encontrado');

  const text = (rawText || '').trim();
  if (!text || text.length < 20) {
    throw new Error('A submissão deve conter uma resposta detalhada (mínimo 20 caracteres).');
  }

  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) throw new Error('Utilizador não encontrado');
  const uData = userSnap.data() as ClientUser;

  if (uData.role === 'teacher') {
    return {
      submission: {
        id: `mission-test-${Date.now()}`,
        userId,
        worldId,
        status: 'submitted',
        score: 100,
        xpAwarded: 0,
      },
      xpGain: 0,
      totalXp: 0,
      message: 'Missão testada com sucesso (Modo Teste do Professor).',
    };
  }

  const stats = await clientComputeWorldStats(userId, worldId, uData.role);
  if (!stats.isUnlocked) {
    throw new Error('Mundo bloqueado.');
  }

  const now = new Date().toISOString();
  const qExisting = query(
    collection(db, 'missionSubmissions'),
    where('userId', '==', userId),
    where('worldId', '==', worldId)
  );
  const existingSnap = await getDocs(qExisting);

  let savedSubmission: any;
  if (!existingSnap.empty) {
    const existingDoc = existingSnap.docs[0];
    savedSubmission = {
      ...existingDoc.data(),
      submission: text,
      submissionText: text,
      status: 'pending',
      submittedAt: now,
      updatedAt: now,
    };
    await setDoc(existingDoc.ref, savedSubmission, { merge: true });
  } else {
    const subId = `mis-${crypto.randomUUID()}`;
    savedSubmission = {
      id: subId,
      userId,
      studentName: uData.fullName || uData.name,
      studentNickname: uData.nickname,
      classId: uData.classId,
      missionId: world.mission.id,
      worldId,
      title: world.mission.title,
      submission: text,
      submissionText: text,
      score: 0,
      status: 'pending',
      submittedAt: now,
      createdAt: now,
    };
    await setDoc(doc(db, 'missionSubmissions', subId), savedSubmission);
  }

  return {
    success: true,
    submission: savedSubmission,
    message: 'Missão Real submetida com sucesso! O teu professor irá avaliar e fornecer feedback.',
  };
}

export async function clientGetGrandeMissao() {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const [gmSnap, userSnap] = await Promise.all([
    getDoc(doc(db, 'grandeMissaoProgress', userId)),
    getDoc(doc(db, 'users', userId)),
  ]);
  const userRole = userSnap.exists() ? (userSnap.data() as ClientUser).role : 'student';

  let progress = {
    currentStage: 1,
    completedStages: [] as number[],
    unlockedCodes: {} as Record<number, string>,
    status: 'not_started',
  };

  if (gmSnap.exists()) {
    const d = gmSnap.data();
    progress = {
      currentStage: d.currentStage || 1,
      completedStages: Array.isArray(d.completedStages) ? d.completedStages : [],
      unlockedCodes: d.unlockedCodes || {},
      status: d.status || 'in_progress',
    };
  }

  const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => clientComputeWorldStats(userId, w, userRole)));
  const allCompleted = allStats.every((st) => st.isWorldCompleted);

  return {
    grandeMissao: {
      ...GRANDE_MISSAO,
      totalXp: PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO,
    },
    progress,
    completed: progress.status === 'completed',
    isUnlocked: allCompleted || userRole === 'teacher',
    requiredWorldsCompleted: allCompleted,
  };
}

export async function clientSaveGrandeMissaoStage(payload: {
  completedZones?: number[];
  unlockedCodes?: Record<number, string>;
  stageNumber?: number;
}) {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  const isTeacher = userSnap.exists() && (userSnap.data() as ClientUser).role === 'teacher';

  const incomingZones = Array.isArray(payload?.completedZones)
    ? payload.completedZones.filter((z) => typeof z === 'number' && !isNaN(z))
    : typeof payload?.stageNumber === 'number' && !isNaN(payload.stageNumber)
    ? [payload.stageNumber]
    : [];

  if (isTeacher) {
    return {
      success: true,
      progress: {
        currentStage: Math.min(6, Math.max(...incomingZones, 1)),
        completedStages: incomingZones,
        status: 'in_progress',
      },
    };
  }

  const gmRef = doc(db, 'grandeMissaoProgress', userId);
  const now = new Date().toISOString();

  let nextStage = 1;
  let finalCompletedStages: number[] = [];
  let finalCodes: Record<number, string> = {};

  await runTransaction(db, async (txn) => {
    const snap = await txn.get(gmRef);
    const existing = snap.exists() ? snap.data() : {};
    const prevStages: number[] = Array.isArray(existing.completedStages) ? existing.completedStages : [];
    finalCompletedStages = Array.from(new Set([...prevStages, ...incomingZones])).sort((a, b) => a - b);
    finalCodes = { ...(existing.unlockedCodes || {}), ...(payload?.unlockedCodes || {}) };
    nextStage = Math.min(6, Math.max(...finalCompletedStages, 1));
    const currentStatus = existing.status === 'completed' ? 'completed' : 'in_progress';

    txn.set(
      gmRef,
      {
        id: userId,
        userId,
        currentStage: nextStage,
        completedStages: finalCompletedStages,
        unlockedCodes: finalCodes,
        status: currentStatus,
        updatedAt: now,
      },
      { merge: true }
    );
  });

  return {
    success: true,
    progress: {
      currentStage: nextStage,
      completedStages: finalCompletedStages,
      unlockedCodes: finalCodes,
      status: 'in_progress',
    },
  };
}

export async function clientCompleteGrandeMissao() {
  const userId = await resolveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) throw new Error('Utilizador não encontrado');
  const uData = userSnap.data() as ClientUser;
  const isTeacher = uData.role === 'teacher';
  if (isTeacher) {
    return {
      success: true,
      xpGain: 0,
      totalXp: 0,
      message: 'Grande Missão testada com sucesso (Modo Teste do Professor).',
    };
  }

  const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => clientComputeWorldStats(userId, w, uData.role)));
  const allCompleted = allStats.every((st) => st.isWorldCompleted);
  if (!allCompleted) {
    throw new Error(
      `A Grande Missão apenas pode ser concluída após aprovação em todos os 5 Mundos curriculares (todas as atividades concluídas e média global superior a ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%).`
    );
  }

  const now = new Date().toISOString();
  const gmRef = doc(db, 'grandeMissaoProgress', userId);
  const userRef = doc(db, 'users', userId);
  const txId = `xp-${crypto.randomUUID()}`;
  const txRef = doc(db, 'xpTransactions', txId);
  const xpGain = PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO;

  let alreadyCompleted = false;
  let finalUserXp = 0;

  await runTransaction(db, async (txn) => {
    const uSnap = await txn.get(userRef);
    if (!uSnap.exists()) throw new Error('Utilizador não encontrado');
    const cur = Number((uSnap.data() as ClientUser).xp) || 0;

    const gmSnap = await txn.get(gmRef);
    if (gmSnap.exists() && gmSnap.data().status === 'completed') {
      alreadyCompleted = true;
      finalUserXp = cur;
      return;
    }

    alreadyCompleted = false;
    finalUserXp = cur + xpGain;

    const existingData = gmSnap.exists() ? gmSnap.data() : {};
    txn.set(
      gmRef,
      {
        ...existingData,
        id: userId,
        userId,
        status: 'completed',
        currentStage: 6,
        completedStages: [1, 2, 3, 4, 5, 6],
        completedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    txn.update(userRef, { xp: finalUserXp, updatedAt: now });
    txn.set(txRef, {
      id: txId,
      userId,
      sourceType: 'grande_missao',
      sourceId: GRANDE_MISSAO.id,
      previousBest: 0,
      newBest: xpGain,
      xpGain,
      createdAt: now,
    });
  });

  if (!alreadyCompleted) {
    await clientCheckBadges(userId);
  }

  return {
    success: true,
    xpGain: alreadyCompleted ? 0 : xpGain,
    totalXp: finalUserXp,
    message: alreadyCompleted
      ? 'Já concluíste a Grande Missão e recebeste a recompensa.'
      : `Parabéns! Concluíste com distinção a Grande Missão A ESCOLA DO FUTURO! +${xpGain} XP atribuídos!`,
  };
}

// -------------------------------------------------------------
// BADGE CHECKER (Matches server/routes/pedagogical.ts 100%)
// -------------------------------------------------------------
async function clientCheckBadges(userId: string) {
  const db = getClientFirestore();
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return;
  const user = userSnap.data() as ClientUser;

  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };

  let completedWorldsCount = 0;
  for (let w = 1; w <= 5; w++) {
    const stats = await clientComputeWorldStats(userId, w, user.role);
    if (stats.isWorldCompleted) {
      completedWorldsCount++;
      const bId = worldBadgeMap[w];
      if (bId) {
        const bRef = doc(db, 'badges', `${userId}_${bId}`);
        await setDoc(
          bRef,
          { id: `${userId}_${bId}`, userId, badgeId: bId, awardedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    }
  }

  // Centurion: >= 1000 XP or 100% in an assessment
  const assessSnap = await getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId)));
  const has100Assess = assessSnap.docs.some((d) => Number(d.data().percentage) === 100);
  if ((Number(user.xp) || 0) >= PROGRESSION_CONFIG.BADGES.CENTURION_XP_THRESHOLD || has100Assess) {
    const centRef = doc(db, 'badges', `${userId}_centuriao-digital`);
    await setDoc(
      centRef,
      { id: `${userId}_centuriao-digital`, userId, badgeId: 'centuriao-digital', awardedAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});
  }

  // Master: Grande Missão completed + all 5 worlds completed
  const gmSnap = await getDoc(doc(db, 'grandeMissaoProgress', userId));
  const hasGM = gmSnap.exists() && gmSnap.data().status === 'completed';
  if (hasGM && completedWorldsCount >= 5) {
    const masterBadgeRef = doc(db, 'badges', `${userId}_mestre-da-missao-tic`);
    await setDoc(
      masterBadgeRef,
      { id: `${userId}_mestre-da-missao-tic`, userId, badgeId: 'mestre-da-missao-tic', awardedAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});
  }
}
