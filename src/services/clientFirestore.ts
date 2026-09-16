import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore as getClientFirestoreInstance,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { AuthUser } from '../types';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  DAILY_TIPS,
  WEEKLY_CHALLENGE,
  GRANDE_MISSAO,
  BADGES_CATALOG,
} from '../../server/catalog';

export const firebaseConfig = {
  projectId: 'gen-lang-client-0684360526',
  appId: '1:988379722800:web:6f13b2ebe35dc54208a9f5',
  apiKey: 'AIzaSyDYqStfqxZ7kc17mp0eLlVGT5mhuzoAU7o',
  authDomain: 'gen-lang-client-0684360526.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-missotic6ano-a3c97613-00e9-4b26-9901-461ec92853e8',
  storageBucket: 'gen-lang-client-0684360526.firebasestorage.app',
  messagingSenderId: '988379722800',
};

let clientApp: FirebaseApp | null = null;
let clientDb: Firestore | null = null;

export function getClientDb(): Firestore {
  if (clientDb) return clientDb;

  if (getApps().length === 0) {
    clientApp = initializeApp({
      apiKey: firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      authDomain: firebaseConfig.authDomain,
    });
  } else {
    clientApp = getApp();
  }

  clientDb = initializeFirestore(clientApp, {}, firebaseConfig.firestoreDatabaseId);
  return clientDb;
}

// Level computation helper
export function calculateLevel(xp: number): { level: number; name: string } {
  if (xp >= 2300) return { level: 8, name: 'Mestre da Missão TIC' };
  if (xp >= 1700) return { level: 7, name: 'Explorador da IA' };
  if (xp >= 1200) return { level: 6, name: 'Engenheiro Digital' };
  if (xp >= 800) return { level: 5, name: 'Criador Digital' };
  if (xp >= 500) return { level: 4, name: 'Detetive Digital' };
  if (xp >= 250) return { level: 3, name: 'Guardião Digital' };
  if (xp >= 100) return { level: 2, name: 'Explorador Digital' };
  return { level: 1, name: 'Novato Digital' };
}

// SHA-256 password hashing for browser
export async function hashPasswordClient(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const actualSalt =
    salt ||
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  const enc = new TextEncoder();
  const data = enc.encode(password + ':' + actualSalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hash: hashHex, salt: actualSalt };
}

// Convert Firestore User document to AuthUser
export function toAuthUser(data: any): AuthUser {
  const levelInfo = calculateLevel(data.xp || 0);
  const classNames: Record<string, string> = {
    'class-6a': '6.º A',
    'class-6b': '6.º B',
    'class-6c': '6.º C',
    'class-6d': '6.º D',
    'class-6e': '6.º E',
  };
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    nickname: data.nickname || data.name,
    avatar: data.avatar || 'avatar-boy-1',
    role: data.role || 'student',
    classId: data.classId || 'class-6a',
    className: classNames[data.classId] || data.classId || '6.º Ano',
    locale: data.locale || 'pt',
    xp: data.xp || 0,
    level: levelInfo.level,
    levelName: levelInfo.name,
    blocked: data.blocked || false,
    mustChangePassword: data.mustChangePassword || false,
  };
}

// Seed Teacher and default classes if missing
export async function seedTeacherIfMissing(): Promise<void> {
  try {
    const db = getClientDb();
    const teacherDocRef = doc(db, 'users', 'teacher-carla');
    const teacherSnap = await getDoc(teacherDocRef);

    const teacherEmail = 'imaginebycarla2023@gmail.com';
    const { hash, salt } = await hashPasswordClient('carlamo', 'static_teacher_salt_carla');

    if (!teacherSnap.exists()) {
      await setDoc(teacherDocRef, {
        id: 'teacher-carla',
        name: 'Prof. Carla Silva',
        email: teacherEmail,
        passwordHash: hash,
        passwordSalt: salt,
        nickname: 'Prof_Carla',
        avatar: 'teacher-1',
        role: 'teacher',
        classId: 'class-6a',
        locale: 'pt',
        xp: 0,
        blocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed default classes
    const classes = [
      { id: 'class-6a', name: '6.º A', code: 'TIC6A' },
      { id: 'class-6b', name: '6.º B', code: 'TIC6B' },
      { id: 'class-6c', name: '6.º C', code: 'TIC6C' },
      { id: 'class-6d', name: '6.º D', code: 'TIC6D' },
      { id: 'class-6e', name: '6.º E', code: 'TIC6E' },
    ];

    for (const c of classes) {
      const classRef = doc(db, 'classes', c.id);
      const snap = await getDoc(classRef);
      if (!snap.exists()) {
        await setDoc(classRef, {
          id: c.id,
          name: c.name,
          code: c.code,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Seed teacher check warning (non-fatal):', err);
  }
}

// -------------------------------------------------------------
// CLIENT REGISTER
// -------------------------------------------------------------
export async function clientRegisterStudent(data: {
  name: string;
  email: string;
  password: string;
  nickname: string;
  classId?: string;
  avatar?: string;
  locale?: string;
}): Promise<{ user: AuthUser; token: string; message: string }> {
  const db = getClientDb();
  await seedTeacherIfMissing();

  const cleanName = data.name.trim();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanNick = data.nickname.trim();

  if (!cleanName || !cleanEmail || !data.password || !cleanNick) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  // Teacher special check
  if (cleanEmail === 'imaginebycarla2023@gmail.com') {
    throw new Error('Este email pertence à Professora. Utiliza a opção "Iniciar Sessão".');
  }

  // Check email collision
  const usersColl = collection(db, 'users');
  const qEmail = query(usersColl, where('email', '==', cleanEmail), limit(1));
  const emailSnap = await getDocs(qEmail);
  if (!emailSnap.empty) {
    throw new Error('Já existe uma conta associada a este email. Clica em "Iniciar Sessão".');
  }

  // Check nickname collision
  const qNick = query(usersColl, where('nickname', '==', cleanNick), limit(1));
  const nickSnap = await getDocs(qNick);
  if (!nickSnap.empty) {
    throw new Error('Este nickname já está em uso por outro colega. Escolhe outro nome de utilizador.');
  }

  // Privacy rule: nickname should not contain real name or full email
  const lowerNick = cleanNick.toLowerCase();
  const lowerName = cleanName.toLowerCase();
  const emailPrefix = cleanEmail.split('@')[0].toLowerCase();
  if (lowerNick.includes(lowerName) || lowerNick.includes(emailPrefix) || lowerNick.includes('@')) {
    throw new Error('O teu nickname não deve conter o teu nome real ou email para proteger a tua privacidade!');
  }

  const { hash, salt } = await hashPasswordClient(data.password);
  const userId = `student-${crypto.randomUUID()}`;
  const classId = data.classId || 'class-6a';

  const newUser = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hash,
    passwordSalt: salt,
    nickname: cleanNick,
    avatar: data.avatar || 'avatar-boy-1',
    role: 'student',
    classId: classId,
    locale: data.locale === 'en' ? 'en' : 'pt',
    xp: 0, // Starts at 0 XP (Level 1: Novato Digital)
    blocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // 1. Save user
  await setDoc(doc(db, 'users', userId), newUser);

  // 2. Award initial badge
  const badgeDocId = `badge_${userId}_primeiros-passos`;
  await setDoc(doc(db, 'badges', badgeDocId), {
    id: badgeDocId,
    userId: userId,
    badgeId: 'primeiros-passos',
    awardedAt: new Date().toISOString(),
  });

  // 3. Create session
  const sessionId = `session-${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await setDoc(doc(db, 'sessions', sessionId), {
    id: sessionId,
    userId: userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  const authUser = toAuthUser(newUser);
  return {
    user: authUser,
    token: sessionId,
    message: 'Conta criada com sucesso! Ganhaste +100 XP e o crachá Primeiros Passos!',
  };
}

// -------------------------------------------------------------
// CLIENT LOGIN
// -------------------------------------------------------------
export async function clientLogin(
  email: string,
  pass: string
): Promise<{ user: AuthUser; token: string }> {
  const db = getClientDb();
  await seedTeacherIfMissing();

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. Check teacher Carla
  if (cleanEmail === 'imaginebycarla2023@gmail.com') {
    if (cleanPass === 'carlamo') {
      const teacherDoc = await getDoc(doc(db, 'users', 'teacher-carla'));
      const teacherData = teacherDoc.exists()
        ? teacherDoc.data()
        : {
            id: 'teacher-carla',
            name: 'Prof. Carla Silva',
            email: 'imaginebycarla2023@gmail.com',
            role: 'teacher',
            classId: 'class-6a',
            locale: 'pt',
            xp: 0,
            blocked: false,
          };
      const sessionId = `session-${crypto.randomUUID()}`;
      await setDoc(doc(db, 'sessions', sessionId), {
        id: sessionId,
        userId: 'teacher-carla',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return { user: toAuthUser(teacherData), token: sessionId };
    } else {
      throw new Error('Palavra-passe de professora incorreta.');
    }
  }

  // 2. Look up student in Firestore
  const usersColl = collection(db, 'users');
  const qEmail = query(usersColl, where('email', '==', cleanEmail), limit(1));
  let userSnap = await getDocs(qEmail);

  let userData: any = null;
  if (!userSnap.empty) {
    userData = userSnap.docs[0].data();
  } else {
    // Check if entered nickname instead of email
    const qNick = query(usersColl, where('nickname', '==', email.trim()), limit(1));
    const nickSnap = await getDocs(qNick);
    if (!nickSnap.empty) {
      userData = nickSnap.docs[0].data();
    }
  }

  if (!userData) {
    throw new Error('Utilizador não encontrado. Verifica o teu email ou cria uma nova conta de aluno.');
  }

  if (userData.blocked) {
    throw new Error('A tua conta foi bloqueada temporariamente. Fala com a tua professora.');
  }

  // Verify password
  let isMatch = false;
  if (userData.passwordSalt) {
    const { hash } = await hashPasswordClient(pass, userData.passwordSalt);
    if (hash === userData.passwordHash) isMatch = true;
  }
  // Fallback for scrypt or plain
  if (!isMatch && userData.passwordHash === pass) {
    isMatch = true;
  }

  if (!isMatch) {
    // If not matching, verify if student is using simple test pass
    if (userData.passwordHash && userData.passwordHash.length > 30) {
      // Scrypt hash from server - accept if standard match
      const { hash } = await hashPasswordClient(pass, userData.passwordSalt);
      if (hash === userData.passwordHash) isMatch = true;
    }
  }

  // If still not match, throw
  if (!isMatch) {
    // Allow login if matching salt computation
    throw new Error('Palavra-passe incorreta. Tenta novamente.');
  }

  // Create Session
  const sessionId = `session-${crypto.randomUUID()}`;
  await setDoc(doc(db, 'sessions', sessionId), {
    id: sessionId,
    userId: userData.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return { user: toAuthUser(userData), token: sessionId };
}

// -------------------------------------------------------------
// CLIENT GET ME
// -------------------------------------------------------------
export async function clientGetMe(token: string | null): Promise<{ user: AuthUser; badges: any[]; classroom: any } | null> {
  if (!token) return null;
  const db = getClientDb();

  try {
    const sessionDoc = await getDoc(doc(db, 'sessions', token));
    if (!sessionDoc.exists()) return null;

    const sessionData = sessionDoc.data();
    if (new Date(sessionData.expiresAt) < new Date()) {
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', sessionData.userId));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    if (userData.blocked) return null;

    // Fetch user badges
    const badgesSnap = await getDocs(
      query(collection(db, 'badges'), where('userId', '==', userData.id))
    );
    const badges = badgesSnap.docs.map((d) => d.data());

    return {
      user: toAuthUser(userData),
      badges,
      classroom: { id: userData.classId || 'class-6a', name: '6.º Ano', code: '' },
    };
  } catch (err) {
    console.error('Error fetching me from client Firestore:', err);
    return null;
  }
}

// -------------------------------------------------------------
// TEACHER DASHBOARD DATA DIRECT FROM FIRESTORE
// -------------------------------------------------------------
export async function clientGetTeacherDashboardData(selectedClass: string = 'all') {
  const db = getClientDb();
  await seedTeacherIfMissing();

  // 1. Fetch all users
  const usersSnap = await getDocs(collection(db, 'users'));
  const allUsers = usersSnap.docs.map((d) => d.data());
  const studentUsers = allUsers.filter((u) => u.role === 'student');

  const filteredStudents =
    selectedClass && selectedClass !== 'all'
      ? studentUsers.filter((s) => s.classId === selectedClass)
      : studentUsers;

  const totalStudents = studentUsers.length;
  const activeStudents = studentUsers.filter((s) => !s.blocked).length;
  const totalXP = studentUsers.reduce((sum, s) => sum + (s.xp || 0), 0);
  const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

  // 2. Fetch classes
  const classesSnap = await getDocs(collection(db, 'classes'));
  let classes = classesSnap.docs.map((d) => d.data());
  if (classes.length === 0) {
    classes = [
      { id: 'class-6a', name: '6.º A', code: 'TIC6A' },
      { id: 'class-6b', name: '6.º B', code: 'TIC6B' },
      { id: 'class-6c', name: '6.º C', code: 'TIC6C' },
      { id: 'class-6d', name: '6.º D', code: 'TIC6D' },
      { id: 'class-6e', name: '6.º E', code: 'TIC6E' },
    ];
  }

  // 3. Fetch submissions, assessments, activities
  const subsSnap = await getDocs(collection(db, 'missionSubmissions'));
  const missions = subsSnap.docs.map((d) => d.data());

  const assessSnap = await getDocs(collection(db, 'assessmentAttempts'));
  const assessments = assessSnap.docs.map((d) => d.data());

  const actSnap = await getDocs(collection(db, 'activityProgress'));
  const activities = actSnap.docs.map((d) => d.data());

  const auditSnap = await getDocs(collection(db, 'auditLogs'));
  const auditLogs = auditSnap.docs.map((d) => d.data());

  return {
    dashboardStats: {
      totalStudents,
      activeStudents,
      totalXP,
      avgXP,
      totalSubmissions: missions.length,
      pendingMissions: missions.filter((m) => m.status === 'pending').length,
    },
    students: filteredStudents.map((s) => ({
      ...toAuthUser(s),
      lastActive: s.lastLoginAt || s.updatedAt || s.createdAt,
    })),
    classes,
    missions,
    assessments,
    activities,
    auditLogs,
  };
}

export async function clientTeacherToggleBlock(studentId: string, currentBlocked: boolean) {
  const db = getClientDb();
  await updateDoc(doc(db, 'users', studentId), {
    blocked: !currentBlocked,
    updatedAt: new Date().toISOString(),
  });
}

export async function clientTeacherResetPassword(studentId: string, newPass: string) {
  const db = getClientDb();
  const { hash, salt } = await hashPasswordClient(newPass);
  await updateDoc(doc(db, 'users', studentId), {
    passwordHash: hash,
    passwordSalt: salt,
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  });
}

// Client Award XP
export async function clientAwardXP(
  userId: string,
  deltaXP: number,
  meta: {
    sourceType: string;
    sourceId: string;
    previousBest?: number;
    newBest?: number;
  }
) {
  if (deltaXP <= 0) return;
  const db = getClientDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const currentXP = userSnap.data().xp || 0;
  const newTotalXP = currentXP + deltaXP;
  await updateDoc(userRef, {
    xp: newTotalXP,
    updatedAt: new Date().toISOString(),
  });
  const txId = `tx-${crypto.randomUUID()}`;
  await setDoc(doc(db, 'xpTransactions', txId), {
    id: txId,
    userId,
    amount: deltaXP,
    sourceType: meta.sourceType,
    sourceId: meta.sourceId,
    previousBest: meta.previousBest ?? 0,
    newBest: meta.newBest ?? 0,
    createdAt: new Date().toISOString(),
  });
  await clientEvaluateBadges(userId);
}

// Client Award Badge
export async function clientAwardBadge(userId: string, badgeId: string) {
  const db = getClientDb();
  const badgeDef = BADGES_CATALOG.find((b) => b.id === badgeId);
  if (!badgeDef) return;
  const userBadgeRef = doc(db, 'userBadges', `${userId}_${badgeId}`);
  const snap = await getDoc(userBadgeRef);
  if (snap.exists()) return;
  await setDoc(userBadgeRef, {
    id: `${userId}_${badgeId}`,
    userId,
    badgeId,
    name: badgeDef.title,
    title: badgeDef.title,
    description: badgeDef.description,
    icon: badgeDef.icon,
    earnedAt: new Date().toISOString(),
  });
}

// Client Evaluate Badges
export async function clientEvaluateBadges(userId: string) {
  const db = getClientDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const user = userSnap.data();

  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };

  const [actSnap, missSnap, assessSnap] = await Promise.all([
    getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'missions'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
  ]);

  const actDocs = actSnap.docs.map((d) => d.data());
  const missDocs = missSnap.docs.map((d) => d.data());
  const assessDocs = assessSnap.docs.map((d) => d.data());

  for (let w = 1; w <= 5; w++) {
    const stats = computeWorldStatsSync(w, actDocs, missDocs, assessDocs);
    if (stats.average > 80 && stats.completedCount >= 3) {
      await clientAwardBadge(userId, worldBadgeMap[w]);
    }
  }

  const has100Assess = assessDocs.some((a) => a.percentage === 100);
  if ((user.xp || 0) >= 1000 || has100Assess) {
    await clientAwardBadge(userId, 'centuriao-digital');
  }

  const txSnap = await getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', userId)));
  const txDocs = txSnap.docs.map((d) => d.data());
  const hasGM = txDocs.some((t) => t.sourceType === 'grande_missao');
  const allStats = [1, 2, 3, 4, 5].map((w) => computeWorldStatsSync(w, actDocs, missDocs, assessDocs));
  const allUnlocked = allStats.every((st) => st.average > 80);
  if (hasGM && allUnlocked) {
    await clientAwardBadge(userId, 'mestre-da-missao-tic');
  }
}

// Compute world stats synchronously from cached documents
export function computeWorldStatsSync(
  worldId: number,
  userProgress: any[],
  missions: any[],
  assessmentAttempts: any[]
) {
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) {
    return { worldId, average: 0, completedCount: 0, totalComponents: 0, isUnlocked: false, hasAssessmentPassed: false };
  }

  const scores: number[] = [];

  // Simulators
  for (const sim of world.simulators) {
    const prog = userProgress.find((p) => p.activityId === sim.id);
    if (prog && prog.completed) {
      scores.push(prog.bestScore);
    }
  }

  // Challenge
  const chalProg = userProgress.find((p) => p.activityId === world.challenge.id);
  if (chalProg && chalProg.completed) {
    scores.push(chalProg.bestScore);
  }

  // Real Mission
  const worldMissions = missions.filter((m) => m.worldId === worldId && (m.status === 'graded' || m.score > 0));
  if (worldMissions.length > 0) {
    scores.push(worldMissions[0].score);
  }

  // Final Assessment (best percentage)
  const worldAssessments = assessmentAttempts.filter((a) => a.worldId === worldId);
  if (worldAssessments.length > 0) {
    const bestAssess = Math.max(...worldAssessments.map((a: any) => a.percentage));
    scores.push(bestAssess);
  }

  const average = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;
  const totalComponents = world.simulators.length + 3;
  const completedCount = scores.length;

  let isUnlocked = worldId === 1;
  if (worldId > 1) {
    const prevStats = computeWorldStatsSync(worldId - 1, userProgress, missions, assessmentAttempts);
    isUnlocked = prevStats.average > 80;
  }

  return {
    worldId,
    average,
    completedCount,
    totalComponents,
    isUnlocked,
    hasAssessmentPassed: worldAssessments.some((a: any) => a.percentage >= 80),
  };
}

// Client Get Worlds
export async function clientGetWorlds(userId?: string) {
  if (!userId) {
    const defaultWorlds = WORLDS_DATA.map((w) => ({
      ...w,
      isUnlocked: w.id === 1,
      average: 0,
      completedCount: 0,
      totalComponents: w.simulators.length + 3,
      challengeProgress: null,
      missionProgress: null,
      bestAssessmentPercentage: null,
      simulatorsProgress: w.simulators.map((s) => ({
        id: s.id,
        completed: false,
        score: 0,
      })),
    }));
    return { worlds: defaultWorlds };
  }

  const db = getClientDb();
  let actDocs: any[] = [];
  let missDocs: any[] = [];
  let assessDocs: any[] = [];

  try {
    const [actSnap, missSnap, assessSnap] = await Promise.all([
      getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'missions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
    ]);
    actDocs = actSnap.docs.map((d) => d.data());
    missDocs = missSnap.docs.map((d) => d.data());
    assessDocs = assessSnap.docs.map((d) => d.data());
  } catch (err) {
    console.warn('Could not read user progress from Firestore directly:', err);
  }

  const worlds = WORLDS_DATA.map((w) => {
    const stats = computeWorldStatsSync(w.id, actDocs, missDocs, assessDocs);
    const mission = missDocs.find((m) => m.worldId === w.id);
    const chalProg = actDocs.find((p) => p.activityId === w.challenge.id);
    const worldAssessments = assessDocs.filter((a) => a.worldId === w.id);

    return {
      ...w,
      isUnlocked: stats.isUnlocked,
      average: stats.average,
      completedCount: stats.completedCount,
      totalComponents: stats.totalComponents,
      challengeProgress: chalProg ? { completed: chalProg.completed, score: chalProg.bestScore } : null,
      missionProgress: mission
        ? { status: mission.status, score: mission.score, feedback: mission.feedback }
        : null,
      bestAssessmentPercentage:
        worldAssessments.length > 0 ? Math.max(...worldAssessments.map((a: any) => a.percentage)) : null,
      simulatorsProgress: w.simulators.map((s) => {
        const prog = actDocs.find((p) => p.activityId === s.id);
        return {
          id: s.id,
          completed: prog ? prog.completed : false,
          score: prog ? prog.bestScore : 0,
        };
      }),
    };
  });

  return { worlds };
}

// Client Submit Mission
export async function clientSubmitMission(userId: string, worldId: number, submission: string) {
  const db = getClientDb();
  const missionId = `mission-${userId}-${worldId}`;
  await setDoc(doc(db, 'missions', missionId), {
    id: missionId,
    userId,
    worldId,
    submissionText: submission,
    status: 'pending',
    score: 0,
    feedback: null,
    submittedAt: new Date().toISOString(),
  });
  return { success: true, message: 'Missão Real submetida com sucesso ao professor!' };
}

// Client Save Activity / Simulator Progress
export async function clientSaveActivityProgress(userId: string, activityId: string, score: number) {
  const db = getClientDb();
  const progId = `prog-${userId}-${activityId}`;
  const progRef = doc(db, 'activityProgress', progId);
  const snap = await getDoc(progRef);
  const prevBest = snap.exists() ? snap.data().bestScore || 0 : 0;
  const newBest = Math.max(prevBest, score);
  const xpGain = Math.max(0, newBest - prevBest);

  await setDoc(
    progRef,
    {
      id: progId,
      userId,
      activityId,
      completed: true,
      bestScore: newBest,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (xpGain > 0) {
    await clientAwardXP(userId, xpGain, {
      sourceType: 'activity',
      sourceId: activityId,
      previousBest: prevBest,
      newBest,
    });
  }

  return { success: true, xpGain, newBest };
}

// Client Get Assessment
export async function clientGetAssessment(worldId: number) {
  const assess = FINAL_ASSESSMENTS[worldId];
  if (!assess) throw new Error('Avaliação não encontrada.');
  return {
    id: assess.id,
    worldId: assess.worldId,
    title: assess.title,
    questionCount: assess.questions.length,
    questions: assess.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    })),
  };
}

// Client Submit Assessment
export async function clientSubmitAssessment(
  userId: string,
  worldId: number,
  answers: Record<string, number>
) {
  const assess = FINAL_ASSESSMENTS[worldId];
  if (!assess) throw new Error('Avaliação não encontrada.');

  let correctCount = 0;
  const resultsFeedback = assess.questions.map((q) => {
    const chosenIndex = answers[q.id];
    const isCorrect = chosenIndex === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      text: q.text,
      chosenIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percentage = Math.round((correctCount / assess.questions.length) * 100);

  const db = getClientDb();
  const prevAssessSnap = await getDocs(
    query(
      collection(db, 'assessmentAttempts'),
      where('userId', '==', userId),
      where('worldId', '==', worldId)
    )
  );
  const prevAttempts = prevAssessSnap.docs.map((d) => d.data());
  const previousBest = prevAttempts.length > 0 ? Math.max(...prevAttempts.map((a: any) => a.percentage)) : 0;
  const newBest = Math.max(previousBest, percentage);
  const xpGain = Math.max(0, newBest - previousBest);

  const passed = percentage > 80;

  const attemptId = `attempt-${crypto.randomUUID()}`;
  await setDoc(doc(db, 'assessmentAttempts', attemptId), {
    id: attemptId,
    userId,
    assessmentId: assess.id,
    worldId,
    percentage,
    correctCount,
    totalQuestions: assess.questions.length,
    passed,
    answers,
    completedAt: new Date().toISOString(),
  });

  if (xpGain > 0) {
    await clientAwardXP(userId, xpGain, {
      sourceType: 'assessment',
      sourceId: assess.id,
      previousBest,
      newBest,
    });
  }

  await clientEvaluateBadges(userId);

  const userSnap = await getDoc(doc(db, 'users', userId));
  const totalXp = userSnap.exists() ? userSnap.data().xp || 0 : 0;

  return {
    worldId,
    percentage,
    correctCount,
    totalQuestions: assess.questions.length,
    passed,
    previousBest,
    newBest,
    xpGain,
    totalXp,
    results: resultsFeedback,
    resultsFeedback,
  };
}

// Client Weekly Challenge
export async function clientGetWeeklyChallenge(userId?: string) {
  const db = getClientDb();
  let completed = false;
  if (userId) {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'weeklyChallengeProgress'),
          where('userId', '==', userId),
          where('challengeId', '==', WEEKLY_CHALLENGE.id)
        )
      );
      completed = !snap.empty;
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    challenge: {
      ...WEEKLY_CHALLENGE,
      options: WEEKLY_CHALLENGE.options.map((o, idx) => ({
        id: idx,
        text: o.text,
      })),
      completed,
    },
  };
}

export async function clientSubmitWeeklyChallenge(userId: string, optionIndex: number) {
  const selected = WEEKLY_CHALLENGE.options[optionIndex];
  if (!selected) throw new Error('Opção inválida.');

  if (!selected.isCorrect) {
    return {
      isCorrect: false,
      feedback: selected.explanation,
      xpGain: 0,
    };
  }

  const db = getClientDb();
  const snap = await getDocs(
    query(
      collection(db, 'weeklyChallengeProgress'),
      where('userId', '==', userId),
      where('challengeId', '==', WEEKLY_CHALLENGE.id)
    )
  );

  let xpGain = 0;
  if (snap.empty) {
    const id = `wc-${crypto.randomUUID()}`;
    await setDoc(doc(db, 'weeklyChallengeProgress', id), {
      id,
      userId,
      challengeId: WEEKLY_CHALLENGE.id,
      status: 'completed',
      score: 100,
      completedAt: new Date().toISOString(),
    });
    xpGain = WEEKLY_CHALLENGE.xpReward;
    await clientAwardXP(userId, xpGain, {
      sourceType: 'challenge',
      sourceId: WEEKLY_CHALLENGE.id,
      previousBest: 0,
      newBest: 100,
    });
  }

  const userSnap = await getDoc(doc(db, 'users', userId));
  const totalXp = userSnap.exists() ? userSnap.data().xp || 0 : 0;

  return {
    isCorrect: true,
    feedback: selected.explanation,
    xpGain,
    totalXp,
  };
}

// Client Daily Tip
export async function clientGetDailyTip(userId?: string) {
  const today = new Date().toISOString().split('T')[0];
  const tipIndex = Math.abs(today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)) % DAILY_TIPS.length;
  const tip = DAILY_TIPS[tipIndex];

  let alreadyClaimed = false;
  if (userId) {
    try {
      const db = getClientDb();
      const snap = await getDocs(
        query(
          collection(db, 'dailyTipClaims'),
          where('userId', '==', userId),
          where('date', '==', today)
        )
      );
      alreadyClaimed = !snap.empty;
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    tip,
    alreadyClaimed,
    xpReward: 10,
  };
}

export async function clientClaimDailyTip(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const db = getClientDb();
  const claimId = `${userId}_${today}`;
  const claimRef = doc(db, 'dailyTipClaims', claimId);
  const snap = await getDoc(claimRef);
  if (snap.exists()) {
    throw new Error('Já recolheste a recompensa da Dica Rápida de hoje!');
  }

  await setDoc(claimRef, {
    id: claimId,
    userId,
    date: today,
    claimedAt: new Date().toISOString(),
  });

  await clientAwardXP(userId, 10, {
    sourceType: 'daily_tip',
    sourceId: today,
    previousBest: 0,
    newBest: 10,
  });

  const userSnap = await getDoc(doc(db, 'users', userId));
  const totalXp = userSnap.exists() ? userSnap.data().xp || 0 : 0;

  return {
    success: true,
    message: 'Parabéns! Ganhaste +10 XP pela Dica Rápida!',
    totalXp,
  };
}

// Client Grande Missão
export async function clientGetGrandeMissao(userId?: string) {
  let progress = {
    userId: userId || 'anonymous',
    status: 'not_started',
    currentStage: 1,
    completedStages: [] as number[],
    stageResponses: {},
  };

  if (userId) {
    try {
      const db = getClientDb();
      const snap = await getDoc(doc(db, 'grandeMissaoProgress', userId));
      if (snap.exists()) {
        progress = snap.data() as any;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    grandeMissao: GRANDE_MISSAO,
    progress,
    completed: progress.status === 'completed',
  };
}

export async function clientCompleteGrandeMissao(userId: string) {
  const db = getClientDb();
  const docRef = doc(db, 'grandeMissaoProgress', userId);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().status === 'completed') {
    throw new Error('Já concluíste a Grande Missão!');
  }

  await setDoc(
    docRef,
    {
      userId,
      status: 'completed',
      currentStage: 5,
      completedStages: [1, 2, 3, 4, 5],
      completedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await clientAwardXP(userId, GRANDE_MISSAO.totalXp, {
    sourceType: 'grande_missao',
    sourceId: GRANDE_MISSAO.id,
    previousBest: 0,
    newBest: 150,
  });

  await clientEvaluateBadges(userId);

  const userSnap = await getDoc(doc(db, 'users', userId));
  const totalXp = userSnap.exists() ? userSnap.data().xp || 0 : 0;

  return {
    success: true,
    message: 'Parabéns! Concluíste a Grande Missão A ESCOLA DO FUTURO! +150 XP!',
    totalXp,
  };
}

// Client Class Ranking
export async function clientGetClassRanking(classId: string = 'class-6a', currentUserId?: string) {
  const db = getClientDb();
  let students: any[] = [];
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('classId', '==', classId)
    );
    const snap = await getDocs(q);
    students = snap.docs.map((d) => d.data()).filter((u) => !u.blocked);
  } catch (err) {
    console.warn('Could not read class ranking from Firestore:', err);
  }

  const sorted = students
    .map((s) => {
      const levelInfo = calculateLevel(s.xp || 0);
      return {
        id: s.id,
        nickname: s.nickname || s.name,
        avatar: s.avatar || 'avatar-boy-1',
        xp: s.xp || 0,
        level: levelInfo.level,
        levelName: levelInfo.name,
        isCurrentUser: s.id === currentUserId,
      };
    })
    .sort((a, b) => b.xp - a.xp)
    .map((s, idx) => ({
      position: idx + 1,
      ...s,
    }));

  return { ranking: sorted };
}


