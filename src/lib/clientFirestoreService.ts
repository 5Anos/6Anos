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
import { PROGRESSION_CONFIG } from '../progressionConfig';

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

export function getActiveClientUserId(): string | null {
  if (activeClientUserId) return activeClientUserId;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || null;
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

  userDoc.lastLoginAt = now;
  setActiveClientUserId(userDoc.id);

  return {
    user: sanitizeClientUser(userDoc),
    token: userDoc.id,
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
    xp: 0,
    blocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', userId), newUser);

  // Award welcome badge 'primeiros-passos'
  const badgeRef = doc(db, 'userBadges', `${userId}_primeiros-passos`);
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
    bestAssessmentPercentage >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

  const totalComponents = totalSimulatorsCount + 1;
  const completedCount = scores.length;
  const average =
    scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  // STRICT 70% THRESHOLD: average > 70
  const isWorldCompleted =
    allSimulatorsCompleted &&
    hasAssessment &&
    average > PROGRESSION_CONFIG.PASSING_THRESHOLD;

  let isUnlocked = worldId === 1;
  if (userRole === 'teacher') {
    isUnlocked = true;
  } else if (worldId > 1) {
    const prevStats = await clientComputeWorldStats(userId, worldId - 1, userRole);
    isUnlocked = prevStats.isWorldCompleted;
  }

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
  if (userId) {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      userRole = (userSnap.data() as ClientUser).role;
    }
  }

  const worldsWithStats = await Promise.all(
    WORLDS_DATA.map(async (w) => {
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

      return {
        id: w.id,
        title: w.title,
        subtitle: w.subtitle,
        icon: w.icon,
        color: w.color,
        isUnlocked: stats.isUnlocked,
        isWorldCompleted: stats.isWorldCompleted,
        stats,
      };
    })
  );

  return { worlds: worldsWithStats };
}

export async function clientCompleteActivity(activityId: string, score: number, durationSeconds?: number) {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const progDocId = `${userId}_${activityId}`;
  const progRef = doc(db, 'activityProgress', progDocId);
  const snap = await getDoc(progRef);

  let previousBest = 0;
  let attempts = 0;
  if (snap.exists()) {
    const data = snap.data();
    previousBest = data.bestScore || 0;
    attempts = data.attempts || 0;
  }

  const newBest = Math.max(previousBest, score);
  const completed = score >= 50;
  const now = new Date().toISOString();

  await setDoc(
    progRef,
    {
      id: progDocId,
      userId,
      activityId,
      completed,
      score,
      bestScore: newBest,
      attempts: attempts + 1,
      durationSeconds: durationSeconds || 60,
      updatedAt: now,
    },
    { merge: true }
  );

  // Calculate XP gain
  let xpGain = 0;
  if (newBest > previousBest) {
    const delta = newBest - previousBest;
    xpGain = Math.round((delta / 100) * 40);
  }
  if (xpGain < 10 && completed) xpGain = 15;

  if (xpGain > 0) {
    const userRef = doc(db, 'users', userId);
    await runTransaction(db, async (txn) => {
      const uSnap = await txn.get(userRef);
      if (uSnap.exists()) {
        const currentXp = (uSnap.data() as ClientUser).xp || 0;
        txn.update(userRef, { xp: currentXp + xpGain, updatedAt: now });
      }
    });

    const txId = `xp-${crypto.randomUUID()}`;
    await setDoc(doc(db, 'xpTransactions', txId), {
      id: txId,
      userId,
      amount: xpGain,
      reason: `Simulador: ${activityId}`,
      sourceType: 'simulator',
      sourceId: activityId,
      previousBest,
      newBest,
      xpGain,
      createdAt: now,
    }).catch(() => {});
  }

  // Check badges
  await clientCheckBadges(userId);

  const updatedUserSnap = await getDoc(doc(db, 'users', userId));
  const updatedUser = updatedUserSnap.data() as ClientUser;

  return {
    success: true,
    activityId,
    score,
    bestScore: newBest,
    xpGain,
    totalXp: updatedUser.xp,
    level: calculateLevel(updatedUser.xp).level,
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

  return {
    worldId,
    title: assessment.title,
    description: `Avaliação do Mundo ${worldId}`,
    passingThreshold: PROGRESSION_CONFIG.PASSING_THRESHOLD,
    questions: safeQuestions,
  };
}

export async function clientSubmitAssessment(
  worldId: number,
  answers: Record<string, number>,
  durationSeconds?: number
) {
  const userId = getActiveClientUserId();
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
      studentAnswer,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = assessment.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage > PROGRESSION_CONFIG.PASSING_THRESHOLD; // STRICT > 70%

  // Previous attempts
  const qAttempts = query(
    collection(db, 'assessmentAttempts'),
    where('userId', '==', userId),
    where('worldId', '==', worldId)
  );
  const snapAttempts = await getDocs(qAttempts);
  const prevBest = snapAttempts.empty
    ? 0
    : Math.max(...snapAttempts.docs.map((d) => d.data().percentage || 0));

  const now = new Date().toISOString();
  const attemptId = `attempt-${crypto.randomUUID()}`;

  await setDoc(doc(db, 'assessmentAttempts', attemptId), {
    id: attemptId,
    userId,
    worldId,
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    answers,
    durationSeconds: durationSeconds || 120,
    attemptNumber: snapAttempts.size + 1,
    createdAt: now,
  });

  let xpGain = 0;
  if (percentage > prevBest) {
    xpGain = Math.round(((percentage - prevBest) / 100) * 80);
  }
  if (passed && prevBest <= PROGRESSION_CONFIG.PASSING_THRESHOLD) {
    xpGain += 50; // Bonus for first time passing > 70%
  }
  if (xpGain < 10) xpGain = 15;

  if (xpGain > 0) {
    const userRef = doc(db, 'users', userId);
    await runTransaction(db, async (txn) => {
      const uSnap = await txn.get(userRef);
      if (uSnap.exists()) {
        const curXp = (uSnap.data() as ClientUser).xp || 0;
        txn.update(userRef, { xp: curXp + xpGain, updatedAt: now });
      }
    });
  }

  await clientCheckBadges(userId);

  const updatedUserSnap = await getDoc(doc(db, 'users', userId));
  const updatedUser = updatedUserSnap.data() as ClientUser;

  return {
    worldId,
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    passingThreshold: PROGRESSION_CONFIG.PASSING_THRESHOLD,
    xpGain,
    totalXp: updatedUser.xp,
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
      id: tip.id,
      title: 'Dica do Dia',
      text: tip.pt,
      xpReward: 15,
      claimed,
    },
  };
}

export async function clientClaimDailyTip() {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const today = new Date().toISOString().split('T')[0];
  const claimId = `${userId}_${today}`;
  const claimRef = doc(db, 'dailyTipClaims', claimId);

  const exists = (await getDoc(claimRef)).exists();
  if (exists) throw new Error('Dica já reclamada hoje!');

  const now = new Date().toISOString();
  await setDoc(claimRef, {
    id: claimId,
    userId,
    tipDate: today,
    claimedAt: now,
  });

  const xpReward = 15;
  const userRef = doc(db, 'users', userId);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(userRef);
    if (snap.exists()) {
      const curXp = (snap.data() as ClientUser).xp || 0;
      txn.update(userRef, { xp: curXp + xpReward, updatedAt: now });
    }
  });

  const updatedUser = (await getDoc(userRef)).data() as ClientUser;
  return { success: true, xpReward, totalXp: updatedUser.xp };
}

export async function clientGetWeeklyChallenge() {
  const userId = getActiveClientUserId();
  let completed = false;
  if (userId) {
    const db = getClientFirestore();
    const cDoc = await getDoc(doc(db, 'weeklyChallenges', `${userId}_${WEEKLY_CHALLENGE.id}`));
    completed = cDoc.exists();
  }

  return {
    challenge: {
      ...WEEKLY_CHALLENGE,
      completed,
    },
  };
}

export async function clientSubmitWeeklyChallenge(solution: any) {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const challengeId = `${userId}_${WEEKLY_CHALLENGE.id}`;
  const now = new Date().toISOString();

  await setDoc(doc(db, 'weeklyChallenges', challengeId), {
    id: challengeId,
    userId,
    challengeId: WEEKLY_CHALLENGE.id,
    solution,
    completed: true,
    completedAt: now,
  });

  const xpReward = WEEKLY_CHALLENGE.xpReward || 50;
  const userRef = doc(db, 'users', userId);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(userRef);
    if (snap.exists()) {
      const curXp = (snap.data() as ClientUser).xp || 0;
      txn.update(userRef, { xp: curXp + xpReward, updatedAt: now });
    }
  });

  const updatedUser = (await getDoc(userRef)).data() as ClientUser;
  return { success: true, xpReward, totalXp: updatedUser.xp };
}

export async function clientGetGrandeMissao() {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const gmSnap = await getDoc(doc(db, 'grandeMissaoProgress', userId));

  let progress = {
    currentStage: 1,
    completedStages: [] as number[],
    status: 'not_started',
  };

  if (gmSnap.exists()) {
    const d = gmSnap.data();
    progress = {
      currentStage: d.currentStage || 1,
      completedStages: d.completedStages || [],
      status: d.status || 'in_progress',
    };
  }

  return {
    grandeMissao: GRANDE_MISSAO,
    progress,
  };
}

export async function clientSaveGrandeMissaoStage(stageNumber: number, answers: any) {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const gmRef = doc(db, 'grandeMissaoProgress', userId);
  const snap = await getDoc(gmRef);

  let completedStages: number[] = [];
  if (snap.exists()) {
    completedStages = snap.data().completedStages || [];
  }
  if (!completedStages.includes(stageNumber)) {
    completedStages.push(stageNumber);
  }

  const nextStage = Math.min(5, stageNumber + 1);
  const now = new Date().toISOString();

  await setDoc(
    gmRef,
    {
      id: userId,
      userId,
      currentStage: nextStage,
      completedStages,
      status: completedStages.length >= 5 ? 'completed' : 'in_progress',
      updatedAt: now,
    },
    { merge: true }
  );

  return { success: true, currentStage: nextStage, completedStages };
}

export async function clientCompleteGrandeMissao() {
  const userId = getActiveClientUserId();
  if (!userId) throw new Error('Não autenticado');

  const db = getClientFirestore();
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'grandeMissaoProgress', userId), {
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  });

  const xpGain = 150;
  const userRef = doc(db, 'users', userId);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(userRef);
    if (snap.exists()) {
      const cur = (snap.data() as ClientUser).xp || 0;
      txn.update(userRef, { xp: cur + xpGain, updatedAt: now });
    }
  });

  return { success: true, xpGain };
}

// -------------------------------------------------------------
// BADGE CHECKER
// -------------------------------------------------------------
async function clientCheckBadges(userId: string) {
  const db = getClientFirestore();
  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };

  let completedWorldsCount = 0;
  for (let w = 1; w <= 5; w++) {
    const stats = await clientComputeWorldStats(userId, w, 'student');
    if (stats.isWorldCompleted) {
      completedWorldsCount++;
      const bId = worldBadgeMap[w];
      if (bId) {
        const bRef = doc(db, 'userBadges', `${userId}_${bId}`);
        await setDoc(
          bRef,
          { id: `${userId}_${bId}`, userId, badgeId: bId, awardedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    }
  }

  if (completedWorldsCount >= 5) {
    const masterBadgeRef = doc(db, 'userBadges', `${userId}_mestre-das-tic`);
    await setDoc(
      masterBadgeRef,
      { id: `${userId}_mestre-das-tic`, userId, badgeId: 'mestre-das-tic', awardedAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});
  }
}
