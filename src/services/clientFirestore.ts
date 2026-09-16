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
    xp: 100, // +100 XP registration reward
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

  // 3. Save initial XP transaction
  const xpTxId = `xp_${userId}_${Date.now()}`;
  await setDoc(doc(db, 'xpTransactions', xpTxId), {
    id: xpTxId,
    userId: userId,
    sourceType: 'registration',
    sourceId: 'account-creation',
    previousBest: 0,
    newBest: 100,
    xpGain: 100,
    createdAt: new Date().toISOString(),
  });

  // 4. Create session
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

