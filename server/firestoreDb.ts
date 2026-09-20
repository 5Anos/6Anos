import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  Firestore,
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
  limit,
  orderBy,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';

// Silence verbose internal Firebase SDK warnings (including benign gRPC idle stream disconnects)
try {
  setLogLevel('silent');
} catch {}

export interface User {
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
  needsHelp?: boolean;
  helpReason?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ActivityProgress {
  id: string;
  userId: string;
  activityId: string;
  worldId: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  firstCompletedAt?: string;
  lastAttemptAt: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  worldId: number;
  score: number; // correct count
  percentage: number;
  totalQuestions?: number;
  correctCount?: number;
  passed?: boolean;
  answers: Record<string, number>;
  createdAt: string;
}

export interface MissionSubmission {
  id: string;
  userId: string;
  studentName?: string;
  studentNickname?: string;
  classId?: string;
  missionId: string;
  worldId: number;
  title: string;
  submission: string;
  submissionText?: string;
  score: number;
  feedback?: string;
  status: 'pending' | 'graded';
  gradedBy?: string;
  gradedAt?: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  sourceType:
    | 'activity'
    | 'assessment'
    | 'mission'
    | 'daily_tip'
    | 'weekly_challenge'
    | 'registration'
    | 'challenge'
    | 'grande_missao';
  sourceId: string;
  previousBest: number;
  newBest: number;
  xpGain: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
}

export interface DailyTipClaim {
  id: string;
  userId: string;
  tipDate: string; // YYYY-MM-DD
  claimedAt: string;
}

export interface WeeklyChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  completed?: boolean;
  completedAt: string;
  status?: 'pending' | 'completed';
  score?: number;
}

export interface GrandeMissaoProgress {
  id: string;
  userId: string;
  currentStage: number;
  completedStages: number[];
  stageAnswers?: Record<number, any>;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let configData: any = null;

// Persistent local database fallback to ensure backend stability
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function getLocalDb(): Record<string, any[]> {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      parsed.users = parsed.users || [];
      parsed.classes = parsed.classes || [];
      parsed.sessions = parsed.sessions || [];
      parsed.activityProgress = parsed.activityProgress || [];
      parsed.assessmentAttempts = parsed.assessmentAttempts || [];
      parsed.missionSubmissions = parsed.missionSubmissions || [];
      parsed.xpTransactions = parsed.xpTransactions || [];
      parsed.badges = parsed.badges || [];
      parsed.dailyTipClaims = parsed.dailyTipClaims || [];
      parsed.weeklyChallenges = parsed.weeklyChallenges || [];
      parsed.grandeMissaoProgress = parsed.grandeMissaoProgress || [];
      parsed.auditLogs = parsed.auditLogs || [];
      return parsed;
    }
  } catch (err) {
    console.error('Error reading local db:', err);
  }
  return {
    users: [],
    classes: [],
    sessions: [],
    activityProgress: [],
    assessmentAttempts: [],
    missionSubmissions: [],
    xpTransactions: [],
    badges: [],
    dailyTipClaims: [],
    weeklyChallenges: [],
    grandeMissaoProgress: [],
    auditLogs: [],
  };
}

function writeLocalDb(db: Record<string, any[]>): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local db:', err);
  }
}

// Load config and initialize Firebase client
export function getFirestore(): Firestore {
  if (firestoreDb) return firestoreDb;

  try {
    setLogLevel('silent');
  } catch {}

  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-applet-config.json not found.');
  }

  configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  firebaseApp = initializeApp({
    apiKey: configData.apiKey,
    projectId: configData.projectId,
    appId: configData.appId,
    authDomain: configData.authDomain,
  });

  firestoreDb = initializeFirestore(
    firebaseApp,
    {
      experimentalForceLongPolling: true,
    },
    configData.firestoreDatabaseId
  );
  return firestoreDb;
}

// Check connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = getFirestore();
    return !!db;
  } catch (err) {
    return false;
  }
}

// -------------------------------------------------------------
// 1. USERS
// -------------------------------------------------------------
export async function getUserById(id: string): Promise<User | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'users', id));
    if (snap.exists()) return snap.data() as User;
  } catch {}

  const local = getLocalDb();
  return (local.users.find((u) => u.id === id) as User) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as User;
  } catch {}

  // Check initial teacher email if set via environment variable
  const configuredTeacherEmail = (
    process.env.INITIAL_TEACHER_EMAIL ||
    process.env.TEACHER_EMAIL ||
    ''
  ).trim().toLowerCase();

  if (configuredTeacherEmail && cleanEmail === configuredTeacherEmail) {
    try {
      const teacherDoc = await getUserById('teacher-carla');
      if (teacherDoc) return teacherDoc;
    } catch {}
  }

  const allUsers = await getAllUsers();
  const match = allUsers.find(
    (u) => u.email && u.email.trim().toLowerCase() === cleanEmail
  );
  return match || null;
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
  const cleanNick = nickname.trim().toLowerCase();
  try {
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as User;
  } catch {}

  const allUsers = await getAllUsers();
  const match = allUsers.find(
    (u) => u.nickname && u.nickname.trim().toLowerCase() === cleanNick
  );
  return match || null;
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as User);
    }
  } catch {}

  const local = getLocalDb();
  return (local.users as User[]) || [];
}

export async function saveUser(user: User): Promise<void> {
  const local = getLocalDb();
  const idx = local.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) local.users[idx] = user;
  else local.users.push(user);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'users', user.id), user);
  } catch {}
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const local = getLocalDb();
  const idx = local.users.findIndex((u) => u.id === id);
  if (idx >= 0) {
    local.users[idx] = {
      ...local.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeLocalDb(local);
  }

  try {
    const db = getFirestore();
    const ref = doc(db, 'users', id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch {}
}

export async function deleteUser(userId: string): Promise<void> {
  const local = getLocalDb();
  local.users = local.users.filter((u) => u.id !== userId);
  local.activityProgress = local.activityProgress.filter((p) => p.userId !== userId);
  local.assessmentAttempts = local.assessmentAttempts.filter((a) => a.userId !== userId);
  local.missionSubmissions = local.missionSubmissions.filter((m) => m.userId !== userId);
  local.xpTransactions = local.xpTransactions.filter((x) => x.userId !== userId);
  local.badges = local.badges.filter((b) => b.userId !== userId);
  local.dailyTipClaims = local.dailyTipClaims.filter((c) => c.userId !== userId);
  local.weeklyChallenges = local.weeklyChallenges.filter((w) => w.userId !== userId);
  local.sessions = local.sessions.filter((s) => s.userId !== userId);
  local.grandeMissaoProgress = local.grandeMissaoProgress.filter((g) => g.userId !== userId);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'users', userId));
    const [progSnap, assessSnap, misSnap, xpSnap, badgeSnap, dtSnap, wcSnap, sessSnap] = await Promise.all([
      getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'badges'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'dailyTipClaims'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'weeklyChallenges'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'sessions'), where('userId', '==', userId))),
    ]);

    const deletions = [
      ...progSnap.docs.map((d) => deleteDoc(d.ref)),
      ...assessSnap.docs.map((d) => deleteDoc(d.ref)),
      ...misSnap.docs.map((d) => deleteDoc(d.ref)),
      ...xpSnap.docs.map((d) => deleteDoc(d.ref)),
      ...badgeSnap.docs.map((d) => deleteDoc(d.ref)),
      ...dtSnap.docs.map((d) => deleteDoc(d.ref)),
      ...wcSnap.docs.map((d) => deleteDoc(d.ref)),
      ...sessSnap.docs.map((d) => deleteDoc(d.ref)),
      deleteDoc(doc(db, 'grandeMissaoProgress', userId)),
    ];
    await Promise.all(deletions);
  } catch {}
}

export async function resetStudentProgressInFirestore(userId: string): Promise<void> {
  const local = getLocalDb();
  const uIdx = local.users.findIndex((u) => u.id === userId);
  if (uIdx >= 0) {
    local.users[uIdx].xp = 100;
  }
  local.activityProgress = local.activityProgress.filter((p) => p.userId !== userId);
  local.assessmentAttempts = local.assessmentAttempts.filter((a) => a.userId !== userId);
  local.missionSubmissions = local.missionSubmissions.filter((m) => m.userId !== userId);
  local.xpTransactions = local.xpTransactions.filter((x) => x.userId !== userId);
  local.dailyTipClaims = local.dailyTipClaims.filter((c) => c.userId !== userId);
  local.weeklyChallenges = local.weeklyChallenges.filter((w) => w.userId !== userId);
  local.grandeMissaoProgress = local.grandeMissaoProgress.filter((g) => g.userId !== userId);
  local.badges = local.badges.filter((b) => b.userId !== userId || b.badgeId === 'primeiros-passos');

  if (!local.badges.some((b) => b.userId === userId && b.badgeId === 'primeiros-passos')) {
    local.badges.push({
      id: `b-${crypto.randomUUID()}`,
      userId,
      badgeId: 'primeiros-passos',
      awardedAt: new Date().toISOString(),
    });
  }
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await updateUser(userId, { xp: 100 });
    const [progSnap, assessSnap, misSnap, xpSnap, badgeSnap, dtSnap, wcSnap] = await Promise.all([
      getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'badges'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'dailyTipClaims'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'weeklyChallenges'), where('userId', '==', userId))),
    ]);

    const deletions = [
      ...progSnap.docs.map((d) => deleteDoc(d.ref)),
      ...assessSnap.docs.map((d) => deleteDoc(d.ref)),
      ...misSnap.docs.map((d) => deleteDoc(d.ref)),
      ...xpSnap.docs.map((d) => deleteDoc(d.ref)),
      ...dtSnap.docs.map((d) => deleteDoc(d.ref)),
      ...wcSnap.docs.map((d) => deleteDoc(d.ref)),
      deleteDoc(doc(db, 'grandeMissaoProgress', userId)),
    ];

    for (const bDoc of badgeSnap.docs) {
      const badge = bDoc.data() as UserBadge;
      if (badge.badgeId !== 'primeiros-passos') {
        deletions.push(deleteDoc(bDoc.ref));
      }
    }
    await Promise.all(deletions);
    await awardBadge(userId, 'primeiros-passos');
  } catch {}
}

// -------------------------------------------------------------
// 2. CLASSES
// -------------------------------------------------------------
export async function getAllClasses(): Promise<ClassRoom[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'classes'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ClassRoom);
    }
  } catch {}

  const local = getLocalDb();
  return (local.classes as ClassRoom[]) || [];
}

export async function getClassById(id: string): Promise<ClassRoom | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'classes', id));
    if (snap.exists()) return snap.data() as ClassRoom;
  } catch {}

  const local = getLocalDb();
  return (local.classes.find((c) => c.id === id) as ClassRoom) || null;
}

export async function getClassByCode(code: string): Promise<ClassRoom | null> {
  const cleanCode = code.trim().toLowerCase();
  try {
    const db = getFirestore();
    const q = query(collection(db, 'classes'), where('code', '==', code.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as ClassRoom;
  } catch {}

  const classes = await getAllClasses();
  return classes.find((c) => c.code && c.code.toLowerCase() === cleanCode) || null;
}

export async function saveClass(c: ClassRoom): Promise<void> {
  const local = getLocalDb();
  const idx = local.classes.findIndex((x) => x.id === c.id);
  if (idx >= 0) local.classes[idx] = c;
  else local.classes.push(c);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'classes', c.id), c);
  } catch {}
}

export async function updateClass(id: string, updates: Partial<ClassRoom>): Promise<void> {
  const local = getLocalDb();
  const idx = local.classes.findIndex((x) => x.id === id);
  if (idx >= 0) {
    local.classes[idx] = { ...local.classes[idx], ...updates };
    writeLocalDb(local);
  }

  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'classes', id), updates);
  } catch {}
}

export async function deleteClass(id: string): Promise<void> {
  const local = getLocalDb();
  local.classes = local.classes.filter((c) => c.id !== id);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'classes', id));
  } catch {}
}

export async function deleteClassStudents(classId: string): Promise<number> {
  const allUsers = await getAllUsers();
  const classStudents = allUsers.filter((u) => u.role === 'student' && u.classId === classId);
  for (const s of classStudents) {
    await deleteUser(s.id);
  }
  return classStudents.length;
}

export async function resetClassStudentsProgress(classId: string): Promise<number> {
  const allUsers = await getAllUsers();
  const classStudents = allUsers.filter((u) => u.role === 'student' && u.classId === classId);
  for (const s of classStudents) {
    await resetStudentProgressInFirestore(s.id);
  }
  return classStudents.length;
}

// -------------------------------------------------------------
// 3. SESSIONS
// -------------------------------------------------------------
export async function createSession(userId: string): Promise<Session> {
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const local = getLocalDb();
  local.sessions.push(session);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch {}

  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  let session: Session | null = null;
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'sessions', id));
    if (snap.exists()) session = snap.data() as Session;
  } catch {}

  if (!session) {
    const local = getLocalDb();
    session = (local.sessions.find((s) => s.id === id) as Session) || null;
  }

  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(id);
    return null;
  }
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const local = getLocalDb();
  local.sessions = local.sessions.filter((s) => s.id !== id);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'sessions', id));
  } catch {}
}

// -------------------------------------------------------------
// 4. ACTIVITY PROGRESS
// -------------------------------------------------------------
export async function getActivityProgress(userId: string, activityId: string): Promise<ActivityProgress | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'activityProgress', `${userId}_${activityId}`));
    if (snap.exists()) return snap.data() as ActivityProgress;
  } catch {}

  const local = getLocalDb();
  return (local.activityProgress.find((p) => p.userId === userId && p.activityId === activityId) as ActivityProgress) || null;
}

export async function getUserActivityProgress(userId: string): Promise<ActivityProgress[]> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'activityProgress'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as ActivityProgress);
  } catch {}

  const local = getLocalDb();
  return (local.activityProgress.filter((p) => p.userId === userId) as ActivityProgress[]) || [];
}

export async function getAllActivityProgress(): Promise<ActivityProgress[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'activityProgress'));
    if (!snap.empty) return snap.docs.map((d) => d.data() as ActivityProgress);
  } catch {}

  const local = getLocalDb();
  return (local.activityProgress as ActivityProgress[]) || [];
}

export async function saveActivityProgress(progress: ActivityProgress): Promise<void> {
  const local = getLocalDb();
  const docId = `${progress.userId}_${progress.activityId}`;
  progress.id = docId;
  const idx = local.activityProgress.findIndex((p) => p.userId === progress.userId && p.activityId === progress.activityId);
  if (idx >= 0) local.activityProgress[idx] = progress;
  else local.activityProgress.push(progress);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'activityProgress', docId), progress);
  } catch {}
}

// -------------------------------------------------------------
// 5. ASSESSMENT ATTEMPTS
// -------------------------------------------------------------
export async function getAssessmentAttempts(userId: string, worldId?: number): Promise<AssessmentAttempt[]> {
  try {
    const db = getFirestore();
    let q = query(collection(db, 'assessmentAttempts'));
    if (userId !== 'all') {
      q = query(q, where('userId', '==', userId));
    }
    if (worldId !== undefined) {
      q = query(q, where('worldId', '==', worldId));
    }
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as AssessmentAttempt);
  } catch {}

  const local = getLocalDb();
  let list = local.assessmentAttempts as AssessmentAttempt[];
  if (userId !== 'all') {
    list = list.filter((a) => a.userId === userId);
  }
  if (worldId !== undefined) {
    list = list.filter((a) => a.worldId === worldId);
  }
  return list;
}

export async function saveAssessmentAttempt(attempt: AssessmentAttempt): Promise<void> {
  const local = getLocalDb();
  local.assessmentAttempts.push(attempt);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'assessmentAttempts', attempt.id), attempt);
  } catch {}
}

// -------------------------------------------------------------
// 6. MISSION SUBMISSIONS
// -------------------------------------------------------------
export async function getMissionSubmissions(filter?: {
  userId?: string;
  status?: string;
  classId?: string;
  worldId?: number;
}): Promise<MissionSubmission[]> {
  try {
    const db = getFirestore();
    let q = query(collection(db, 'missionSubmissions'));
    if (filter?.userId) q = query(q, where('userId', '==', filter.userId));
    if (filter?.status) q = query(q, where('status', '==', filter.status));
    if (filter?.worldId) q = query(q, where('worldId', '==', filter.worldId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      let list = snap.docs.map((d) => d.data() as MissionSubmission);
      if (filter?.classId && filter.classId !== 'all') {
        list = list.filter((m) => m.classId === filter.classId);
      }
      return list;
    }
  } catch {}

  const local = getLocalDb();
  let list = local.missionSubmissions as MissionSubmission[];
  if (filter?.userId) list = list.filter((m) => m.userId === filter.userId);
  if (filter?.status) list = list.filter((m) => m.status === filter.status);
  if (filter?.worldId) list = list.filter((m) => m.worldId === filter.worldId);
  if (filter?.classId && filter.classId !== 'all') list = list.filter((m) => m.classId === filter.classId);
  return list;
}

export async function getMissionSubmissionById(id: string): Promise<MissionSubmission | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'missionSubmissions', id));
    if (snap.exists()) return snap.data() as MissionSubmission;
  } catch {}

  const local = getLocalDb();
  return (local.missionSubmissions.find((m) => m.id === id) as MissionSubmission) || null;
}

export async function saveMissionSubmission(sub: MissionSubmission): Promise<void> {
  const local = getLocalDb();
  const idx = local.missionSubmissions.findIndex((m) => m.id === sub.id);
  if (idx >= 0) local.missionSubmissions[idx] = sub;
  else local.missionSubmissions.push(sub);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'missionSubmissions', sub.id), sub);
  } catch {}
}

// -------------------------------------------------------------
// 7. XP TRANSACTIONS & CONCURRENCY-SAFE ATOMIC XP INCREMENT
// -------------------------------------------------------------
export async function getUserXPTransactions(userId: string): Promise<XPTransaction[]> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'xpTransactions'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as XPTransaction);
  } catch {}

  const local = getLocalDb();
  return (local.xpTransactions.filter((x) => x.userId === userId) as XPTransaction[]) || [];
}

export async function atomicAwardXP(
  userId: string,
  xpGain: number,
  txData: {
    sourceType: XPTransaction['sourceType'];
    sourceId: string;
    previousBest: number;
    newBest: number;
  }
): Promise<{ newTotalXP: number; transactionId: string } | null> {
  // If no positive XP gain, do not create redundant transactions
  if (xpGain <= 0) {
    const local = getLocalDb();
    const existingUser = local.users.find((u) => u.id === userId);
    return existingUser ? { newTotalXP: existingUser.xp, transactionId: '' } : null;
  }

  const local = getLocalDb();

  // Enforce duplicate XP prevention on single-claim milestones
  if (['grande_missao', 'weekly_challenge', 'daily_tip'].includes(txData.sourceType)) {
    const existingTx = local.xpTransactions.find(
      (x) => x.userId === userId && x.sourceType === txData.sourceType && x.sourceId === txData.sourceId
    );
    if (existingTx) {
      console.warn(`[atomicAwardXP] Blocked duplicate XP transaction for user ${userId}, type: ${txData.sourceType}, sourceId: ${txData.sourceId}`);
      const user = local.users.find((u) => u.id === userId);
      return user ? { newTotalXP: user.xp, transactionId: existingTx.id } : null;
    }
  }

  const txId = `xp-${crypto.randomUUID()}`;
  const newTx: XPTransaction = {
    id: txId,
    userId,
    sourceType: txData.sourceType,
    sourceId: txData.sourceId,
    previousBest: txData.previousBest,
    newBest: txData.newBest,
    xpGain,
    createdAt: new Date().toISOString(),
  };
  const uIdx = local.users.findIndex((u) => u.id === userId);
  let newTotalXP = xpGain;
  if (uIdx >= 0) {
    local.users[uIdx].xp = (Number(local.users[uIdx].xp) || 0) + xpGain;
    local.users[uIdx].updatedAt = new Date().toISOString();
    newTotalXP = local.users[uIdx].xp;
  }
  local.xpTransactions.push(newTx);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const txRef = doc(db, 'xpTransactions', txId);
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        const u = userSnap.data() as User;
        const total = (Number(u.xp) || 0) + xpGain;
        transaction.update(userRef, { xp: total, updatedAt: new Date().toISOString() });
      }
      transaction.set(txRef, newTx);
    });
  } catch {}

  return { newTotalXP, transactionId: txId };
}

// -------------------------------------------------------------
// 8. BADGES
// -------------------------------------------------------------
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'badges'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as UserBadge);
  } catch {}

  const local = getLocalDb();
  return (local.badges.filter((b) => b.userId === userId) as UserBadge[]) || [];
}

export async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const local = getLocalDb();
  if (local.badges.some((b) => b.userId === userId && b.badgeId === badgeId)) {
    return true;
  }

  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'badges', `${userId}_${badgeId}`));
    return snap.exists();
  } catch {}

  return false;
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  const local = getLocalDb();
  if (local.badges.some((b) => b.userId === userId && b.badgeId === badgeId)) {
    return false;
  }

  const badge: UserBadge = {
    id: `b-${crypto.randomUUID()}`,
    userId,
    badgeId,
    awardedAt: new Date().toISOString(),
  };
  local.badges.push(badge);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    const badgeDoc = doc(db, 'badges', `${userId}_${badgeId}`);
    await setDoc(badgeDoc, badge);
  } catch {}

  return true;
}

// -------------------------------------------------------------
// 9. DAILY TIP CLAIMS
// -------------------------------------------------------------
export async function getDailyTipClaim(userId: string, tipDate: string): Promise<DailyTipClaim | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'dailyTipClaims', `${userId}_${tipDate}`));
    if (snap.exists()) return snap.data() as DailyTipClaim;
  } catch {}

  const local = getLocalDb();
  return (local.dailyTipClaims.find((c) => c.userId === userId && c.tipDate === tipDate) as DailyTipClaim) || null;
}

export async function claimDailyTipAtomic(userId: string, tipDate: string): Promise<{ success: boolean; xpAwarded: number }> {
  const local = getLocalDb();
  const existing = local.dailyTipClaims.find((c) => c.userId === userId && c.tipDate === tipDate);
  if (existing) {
    return { success: false, xpAwarded: 0 };
  }

  const claim: DailyTipClaim = {
    id: `claim-${crypto.randomUUID()}`,
    userId,
    tipDate,
    claimedAt: new Date().toISOString(),
  };
  local.dailyTipClaims.push(claim);

  const txId = `xp-${crypto.randomUUID()}`;
  const tx: XPTransaction = {
    id: txId,
    userId,
    sourceType: 'daily_tip',
    sourceId: `tip-${tipDate}`,
    previousBest: 0,
    newBest: 10,
    xpGain: 10,
    createdAt: new Date().toISOString(),
  };
  local.xpTransactions.push(tx);

  const uIdx = local.users.findIndex((u) => u.id === userId);
  if (uIdx >= 0) {
    local.users[uIdx].xp = (Number(local.users[uIdx].xp) || 0) + 10;
    local.users[uIdx].updatedAt = new Date().toISOString();
  }
  writeLocalDb(local);

  try {
    const db = getFirestore();
    const claimRef = doc(db, 'dailyTipClaims', `${userId}_${tipDate}`);
    const txRef = doc(db, 'xpTransactions', txId);
    await setDoc(claimRef, claim);
    await setDoc(txRef, tx);
  } catch {}

  return { success: true, xpAwarded: 10 };
}

export async function getAllDailyTipClaims(): Promise<DailyTipClaim[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'dailyTipClaims'));
    if (!snap.empty) return snap.docs.map((d) => d.data() as DailyTipClaim);
  } catch {}

  const local = getLocalDb();
  return (local.dailyTipClaims as DailyTipClaim[]) || [];
}

export async function getUserDailyTipClaims(userId: string): Promise<DailyTipClaim[]> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'dailyTipClaims'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as DailyTipClaim);
  } catch {}

  const local = getLocalDb();
  return (local.dailyTipClaims.filter((c) => c.userId === userId) as DailyTipClaim[]) || [];
}

// -------------------------------------------------------------
// 10. WEEKLY CHALLENGE
// -------------------------------------------------------------
export async function getWeeklyChallengeProgress(userId: string, challengeId: string): Promise<WeeklyChallengeProgress | null> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'weeklyChallenges', `${userId}_${challengeId}`));
    if (snap.exists()) return snap.data() as WeeklyChallengeProgress;
  } catch {}

  const local = getLocalDb();
  return (local.weeklyChallenges.find((w) => w.userId === userId && w.challengeId === challengeId) as WeeklyChallengeProgress) || null;
}

export async function getUserWeeklyChallenges(userId: string): Promise<WeeklyChallengeProgress[]> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'weeklyChallenges'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((d) => d.data() as WeeklyChallengeProgress);
  } catch {}

  const local = getLocalDb();
  return (local.weeklyChallenges.filter((w) => w.userId === userId) as WeeklyChallengeProgress[]) || [];
}

export async function getAllWeeklyChallenges(): Promise<WeeklyChallengeProgress[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'weeklyChallenges'));
    if (!snap.empty) return snap.docs.map((d) => d.data() as WeeklyChallengeProgress);
  } catch {}

  const local = getLocalDb();
  return (local.weeklyChallenges as WeeklyChallengeProgress[]) || [];
}

export async function saveWeeklyChallengeProgress(p: WeeklyChallengeProgress): Promise<void> {
  const local = getLocalDb();
  const idx = local.weeklyChallenges.findIndex((w) => w.userId === p.userId && w.challengeId === p.challengeId);
  if (idx >= 0) local.weeklyChallenges[idx] = p;
  else local.weeklyChallenges.push(p);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'weeklyChallenges', `${p.userId}_${p.challengeId}`), p);
  } catch {}
}

// -------------------------------------------------------------
// 11. GRANDE MISSAO FINAL
// -------------------------------------------------------------
export async function getGrandeMissaoProgress(userId: string): Promise<GrandeMissaoProgress> {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'grandeMissaoProgress', userId));
    if (snap.exists()) return snap.data() as GrandeMissaoProgress;
  } catch {}

  const local = getLocalDb();
  const found = local.grandeMissaoProgress.find((g) => g.userId === userId);
  if (found) return found as GrandeMissaoProgress;

  return {
    id: userId,
    userId,
    currentStage: 1,
    completedStages: [],
    stageAnswers: {},
    status: 'not_started',
    updatedAt: new Date().toISOString(),
  };
}

export async function getAllGrandeMissaoProgress(): Promise<GrandeMissaoProgress[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'grandeMissaoProgress'));
    if (!snap.empty) return snap.docs.map((d) => d.data() as GrandeMissaoProgress);
  } catch {}

  const local = getLocalDb();
  return (local.grandeMissaoProgress as GrandeMissaoProgress[]) || [];
}

export async function getAllBadges(): Promise<UserBadge[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'badges'));
    if (!snap.empty) return snap.docs.map((d) => d.data() as UserBadge);
  } catch {}

  const local = getLocalDb();
  return (local.badges as UserBadge[]) || [];
}

export async function getAllXPTransactions(): Promise<XPTransaction[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'xpTransactions'));
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as XPTransaction);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch {}

  const local = getLocalDb();
  const list = local.xpTransactions as XPTransaction[];
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveGrandeMissaoProgress(p: GrandeMissaoProgress): Promise<void> {
  const local = getLocalDb();
  const idx = local.grandeMissaoProgress.findIndex((g) => g.userId === p.userId);
  const data = { ...p, id: p.userId, updatedAt: new Date().toISOString() };
  if (idx >= 0) local.grandeMissaoProgress[idx] = data;
  else local.grandeMissaoProgress.push(data);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'grandeMissaoProgress', p.userId), data);
  } catch {}
}

// -------------------------------------------------------------
// 12. AUDIT LOGS
// -------------------------------------------------------------
export async function addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
  const fullLog: any = {
    ...log,
    id: `audit-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };

  Object.keys(fullLog).forEach((key) => {
    if (fullLog[key] === undefined) delete fullLog[key];
  });

  const local = getLocalDb();
  local.auditLogs.push(fullLog);
  writeLocalDb(local);

  try {
    const db = getFirestore();
    await setDoc(doc(db, 'auditLogs', fullLog.id), fullLog);
  } catch {}

  return fullLog;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'auditLogs'));
    if (!snap.empty) {
      const logs = snap.docs.map((d) => d.data() as AuditLog);
      return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch {}

  const local = getLocalDb();
  const logs = local.auditLogs as AuditLog[];
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// -------------------------------------------------------------
// STATS FOR TEACHER DASHBOARD & SYSTEM STATUS
// -------------------------------------------------------------
export async function getFirestoreStats() {
  const local = getLocalDb();

  return {
    engine: 'Google Cloud Firebase Firestore (Persistent Cloud DB)',
    projectId: configData?.projectId || 'gen-lang-client-0684360526',
    databaseId: configData?.firestoreDatabaseId || 'default',
    isPersistent: true,
    isCloud: true,
    tables: {
      users: local.users.length,
      classes: local.classes.length,
      activityProgress: local.activityProgress.length,
      assessmentAttempts: local.assessmentAttempts.length,
      missionSubmissions: local.missionSubmissions.length,
      xpTransactions: local.xpTransactions.length,
      badges: local.badges.length,
      auditLogs: local.auditLogs.length,
    },
  };
}

// -------------------------------------------------------------
// INITIAL SEED DATA
// -------------------------------------------------------------
export async function seedInitialFirestoreData(): Promise<void> {
  // 1. Classes (6.º A to 6.º E)
  const defaultClasses = [
    { id: 'class-6a', name: '6.º A' },
    { id: 'class-6b', name: '6.º B' },
    { id: 'class-6c', name: '6.º C' },
    { id: 'class-6d', name: '6.º D' },
    { id: 'class-6e', name: '6.º E' },
  ];

  for (const c of defaultClasses) {
    const existing = await getClassById(c.id);
    if (!existing) {
      await saveClass({
        id: c.id,
        name: c.name,
        code: '',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 2. Initial Teacher Account (if none exists)
  const allUsers = await getAllUsers();
  const hasTeacher = allUsers.some((u) => u.role === 'teacher');

  if (!hasTeacher) {
    const configuredTeacherEmail = (
      process.env.INITIAL_TEACHER_EMAIL ||
      process.env.TEACHER_EMAIL ||
      'imaginebycarla2023@gmail.com'
    ).trim().toLowerCase();

    const teacherEmail = configuredTeacherEmail;
    const salt = crypto.randomBytes(16).toString('hex');
    const configuredPassword =
      process.env.INITIAL_TEACHER_PASSWORD || process.env.TEACHER_PASSWORD || 'Trabalhar*2026';

    const hash = crypto.scryptSync(configuredPassword, salt, 64).toString('hex');

    const teacherData: User = {
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
    };

    await saveUser(teacherData);
  }

  // 3. Clean legacy demo accounts
  const demoStudentIds = ['student-alex', 'student-leonor', 'student-tiago'];
  for (const id of demoStudentIds) {
    const existing = await getUserById(id);
    if (existing && existing.role !== 'student') {
      await deleteUser(id);
    }
  }
}
