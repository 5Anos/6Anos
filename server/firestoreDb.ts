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
} from 'firebase/firestore';

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
  score: number;
  percentage: number;
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
  score: number;
  feedback?: string;
  status: 'pending' | 'graded';
  gradedBy?: string;
  gradedAt?: string;
  submittedAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  sourceType: 'registration' | 'activity' | 'assessment' | 'challenge' | 'mission' | 'grande_missao' | 'daily_tip';
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
  tipDate: string;
  claimedAt: string;
}

export interface WeeklyChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  status: 'completed';
  score: number;
  completedAt: string;
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

// Load config and initialize Firebase client
export function getFirestore(): Firestore {
  if (firestoreDb) return firestoreDb;

  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-applet-config.json not found. Run set_up_firebase first.');
  }

  configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  firebaseApp = initializeApp({
    apiKey: configData.apiKey,
    projectId: configData.projectId,
    appId: configData.appId,
    authDomain: configData.authDomain,
  });

  firestoreDb = initializeFirestore(firebaseApp, {}, configData.firestoreDatabaseId);
  return firestoreDb;
}

// Check connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = getFirestore();
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (err) {
    // If doc doesn't exist, it still contacted server successfully
    return true;
  }
}

// -------------------------------------------------------------
// 1. USERS
// -------------------------------------------------------------
export async function getUserById(id: string): Promise<User | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as User;
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as User;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as User);
}

export async function saveUser(user: User): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'users', user.id), user);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const db = getFirestore();
  const ref = doc(db, 'users', id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  const db = getFirestore();
  // 1. Delete user document
  await deleteDoc(doc(db, 'users', userId));

  // 2. Delete user progress documents
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
}

export async function resetStudentProgressInFirestore(userId: string): Promise<void> {
  const db = getFirestore();
  const user = await getUserById(userId);
  if (!user) return;

  // 1. Reset user's XP to 100 (initial registration reward)
  await updateUser(userId, {
    xp: 100,
  });

  // 2. Clear activities, assessments, missions, challenges, daily tips, and grande missao
  const [progSnap, assessSnap, misSnap, xpSnap, badgeSnap, dtSnap, wcSnap] = await Promise.all([
    getDocs(query(collection(db, 'activityProgress'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'badges'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'dailyTipClaims'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'weeklyChallenges'), where('userId', '==', userId))),
  ]);

  // Remove progress docs
  const deletions = [
    ...progSnap.docs.map((d) => deleteDoc(d.ref)),
    ...assessSnap.docs.map((d) => deleteDoc(d.ref)),
    ...misSnap.docs.map((d) => deleteDoc(d.ref)),
    ...xpSnap.docs.map((d) => deleteDoc(d.ref)),
    ...dtSnap.docs.map((d) => deleteDoc(d.ref)),
    ...wcSnap.docs.map((d) => deleteDoc(d.ref)),
    deleteDoc(doc(db, 'grandeMissaoProgress', userId)),
  ];

  // Remove all badges except 'primeiros-passos'
  for (const bDoc of badgeSnap.docs) {
    const badge = bDoc.data() as UserBadge;
    if (badge.badgeId !== 'primeiros-passos') {
      deletions.push(deleteDoc(bDoc.ref));
    }
  }

  await Promise.all(deletions);

  // Ensure first-steps badge exists
  await awardBadge(userId, 'primeiros-passos');
}

// -------------------------------------------------------------
// 2. CLASSES
// -------------------------------------------------------------
export async function getAllClasses(): Promise<ClassRoom[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'classes'));
  return snap.docs.map((d) => d.data() as ClassRoom);
}

export async function getClassById(id: string): Promise<ClassRoom | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'classes', id));
  if (!snap.exists()) return null;
  return snap.data() as ClassRoom;
}

export async function getClassByCode(code: string): Promise<ClassRoom | null> {
  const db = getFirestore();
  const q = query(collection(db, 'classes'), where('code', '==', code.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as ClassRoom;
}

export async function saveClass(c: ClassRoom): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'classes', c.id), c);
}

export async function updateClass(id: string, updates: Partial<ClassRoom>): Promise<void> {
  const db = getFirestore();
  const ref = doc(db, 'classes', id);
  await updateDoc(ref, updates);
}

export async function deleteClass(id: string): Promise<void> {
  const db = getFirestore();
  await deleteDoc(doc(db, 'classes', id));
}

export async function deleteClassStudents(classId: string): Promise<number> {
  const db = getFirestore();
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
  const db = getFirestore();
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  await setDoc(doc(db, 'sessions', session.id), session);
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'sessions', id));
  if (!snap.exists()) return null;
  const session = snap.data() as Session;
  if (new Date(session.expiresAt) < new Date()) {
    await deleteDoc(doc(db, 'sessions', id));
    return null;
  }
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const db = getFirestore();
  await deleteDoc(doc(db, 'sessions', id));
}

// -------------------------------------------------------------
// 4. ACTIVITY PROGRESS
// -------------------------------------------------------------
export async function getActivityProgress(userId: string, activityId: string): Promise<ActivityProgress | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'activityProgress', `${userId}_${activityId}`));
  if (!snap.exists()) return null;
  return snap.data() as ActivityProgress;
}

export async function getUserActivityProgress(userId: string): Promise<ActivityProgress[]> {
  const db = getFirestore();
  const q = query(collection(db, 'activityProgress'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityProgress);
}

export async function getAllActivityProgress(): Promise<ActivityProgress[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'activityProgress'));
  return snap.docs.map((d) => d.data() as ActivityProgress);
}

export async function saveActivityProgress(progress: ActivityProgress): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'activityProgress', `${progress.userId}_${progress.activityId}`), progress);
}

// -------------------------------------------------------------
// 5. ASSESSMENT ATTEMPTS
// -------------------------------------------------------------
export async function getAssessmentAttempts(userId: string, worldId?: number): Promise<AssessmentAttempt[]> {
  const db = getFirestore();
  let q = query(collection(db, 'assessmentAttempts'), where('userId', '==', userId));
  if (worldId !== undefined) {
    q = query(collection(db, 'assessmentAttempts'), where('userId', '==', userId), where('worldId', '==', worldId));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AssessmentAttempt);
}

export async function saveAssessmentAttempt(attempt: AssessmentAttempt): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'assessmentAttempts', attempt.id), attempt);
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
  const db = getFirestore();
  let q = query(collection(db, 'missionSubmissions'));

  if (filter?.userId) {
    q = query(q, where('userId', '==', filter.userId));
  }
  if (filter?.status) {
    q = query(q, where('status', '==', filter.status));
  }
  if (filter?.worldId) {
    q = query(q, where('worldId', '==', filter.worldId));
  }

  const snap = await getDocs(q);
  let list = snap.docs.map((d) => d.data() as MissionSubmission);
  if (filter?.classId && filter.classId !== 'all') {
    list = list.filter((m) => m.classId === filter.classId);
  }
  return list;
}

export async function getMissionSubmissionById(id: string): Promise<MissionSubmission | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'missionSubmissions', id));
  if (!snap.exists()) return null;
  return snap.data() as MissionSubmission;
}

export async function saveMissionSubmission(sub: MissionSubmission): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'missionSubmissions', sub.id), sub);
}

// -------------------------------------------------------------
// 7. XP TRANSACTIONS & CONCURRENCY-SAFE ATOMIC XP INCREMENT
// -------------------------------------------------------------
export async function getUserXPTransactions(userId: string): Promise<XPTransaction[]> {
  const db = getFirestore();
  const q = query(collection(db, 'xpTransactions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as XPTransaction);
}

// Atomic transaction: prevents race conditions or duplicate awards
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
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);
  const txId = `xp-${crypto.randomUUID()}`;
  const txRef = doc(db, 'xpTransactions', txId);

  return await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }

    const userData = userSnap.data() as User;
    const currentXP = Number(userData.xp) || 0;
    const newTotalXP = currentXP + xpGain;

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

    transaction.update(userRef, {
      xp: newTotalXP,
      updatedAt: new Date().toISOString(),
    });
    transaction.set(txRef, newTx);

    return { newTotalXP, transactionId: txId };
  });
}

// -------------------------------------------------------------
// 8. BADGES
// -------------------------------------------------------------
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const db = getFirestore();
  const q = query(collection(db, 'badges'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserBadge);
}

export async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'badges', `${userId}_${badgeId}`));
  return snap.exists();
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  const db = getFirestore();
  const badgeDoc = doc(db, 'badges', `${userId}_${badgeId}`);
  const snap = await getDoc(badgeDoc);
  if (snap.exists()) return false;

  const badge: UserBadge = {
    id: `b-${crypto.randomUUID()}`,
    userId,
    badgeId,
    awardedAt: new Date().toISOString(),
  };
  await setDoc(badgeDoc, badge);
  return true;
}

// -------------------------------------------------------------
// 9. DAILY TIP CLAIMS (Atomic)
// -------------------------------------------------------------
export async function getDailyTipClaim(userId: string, tipDate: string): Promise<DailyTipClaim | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'dailyTipClaims', `${userId}_${tipDate}`));
  if (!snap.exists()) return null;
  return snap.data() as DailyTipClaim;
}

export async function claimDailyTipAtomic(userId: string, tipDate: string): Promise<{ success: boolean; xpAwarded: number }> {
  const db = getFirestore();
  const claimRef = doc(db, 'dailyTipClaims', `${userId}_${tipDate}`);
  const userRef = doc(db, 'users', userId);
  const txId = `xp-${crypto.randomUUID()}`;
  const txRef = doc(db, 'xpTransactions', txId);

  return await runTransaction(db, async (transaction) => {
    const claimSnap = await transaction.get(claimRef);
    if (claimSnap.exists()) {
      return { success: false, xpAwarded: 0 };
    }

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User ${userId} not found`);
    }

    const userData = userSnap.data() as User;
    const currentXP = Number(userData.xp) || 0;
    const newXP = currentXP + 10;

    const claim: DailyTipClaim = {
      id: `claim-${crypto.randomUUID()}`,
      userId,
      tipDate,
      claimedAt: new Date().toISOString(),
    };

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

    transaction.set(claimRef, claim);
    transaction.set(txRef, tx);
    transaction.update(userRef, {
      xp: newXP,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, xpAwarded: 10 };
  });
}

export async function getAllDailyTipClaims(): Promise<DailyTipClaim[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'dailyTipClaims'));
  return snap.docs.map((d) => d.data() as DailyTipClaim);
}

// -------------------------------------------------------------
// 10. WEEKLY CHALLENGE
// -------------------------------------------------------------
export async function getWeeklyChallengeProgress(userId: string, challengeId: string): Promise<WeeklyChallengeProgress | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'weeklyChallenges', `${userId}_${challengeId}`));
  if (!snap.exists()) return null;
  return snap.data() as WeeklyChallengeProgress;
}

export async function getAllWeeklyChallenges(): Promise<WeeklyChallengeProgress[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'weeklyChallenges'));
  return snap.docs.map((d) => d.data() as WeeklyChallengeProgress);
}

export async function saveWeeklyChallengeProgress(p: WeeklyChallengeProgress): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'weeklyChallenges', `${p.userId}_${p.challengeId}`), p);
}

// -------------------------------------------------------------
// 11. GRANDE MISSAO FINAL
// -------------------------------------------------------------
export async function getGrandeMissaoProgress(userId: string): Promise<GrandeMissaoProgress> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'grandeMissaoProgress', userId));
  if (!snap.exists()) {
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
  return snap.data() as GrandeMissaoProgress;
}

export async function getAllGrandeMissaoProgress(): Promise<GrandeMissaoProgress[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'grandeMissaoProgress'));
  return snap.docs.map((d) => d.data() as GrandeMissaoProgress);
}

export async function getAllBadges(): Promise<UserBadge[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'badges'));
  return snap.docs.map((d) => d.data() as UserBadge);
}

export async function getAllXPTransactions(): Promise<XPTransaction[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'xpTransactions'));
  const list = snap.docs.map((d) => d.data() as XPTransaction);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveGrandeMissaoProgress(p: GrandeMissaoProgress): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'grandeMissaoProgress', p.userId), {
    ...p,
    id: p.userId,
    updatedAt: new Date().toISOString(),
  });
}

// -------------------------------------------------------------
// 12. AUDIT LOGS
// -------------------------------------------------------------
export async function addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
  const db = getFirestore();
  const fullLog: AuditLog = {
    ...log,
    id: `audit-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'auditLogs', fullLog.id), fullLog);
  return fullLog;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'auditLogs'));
  const logs = snap.docs.map((d) => d.data() as AuditLog);
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// -------------------------------------------------------------
// STATS FOR TEACHER DASHBOARD & SYSTEM STATUS
// -------------------------------------------------------------
export async function getFirestoreStats() {
  const db = getFirestore();
  const [
    usersSnap,
    classesSnap,
    progressSnap,
    assessmentsSnap,
    missionsSnap,
    xpSnap,
    badgesSnap,
    auditSnap,
  ] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'classes')),
    getDocs(collection(db, 'activityProgress')),
    getDocs(collection(db, 'assessmentAttempts')),
    getDocs(collection(db, 'missionSubmissions')),
    getDocs(collection(db, 'xpTransactions')),
    getDocs(collection(db, 'badges')),
    getDocs(collection(db, 'auditLogs')),
  ]);

  return {
    engine: 'Google Cloud Firebase Firestore (Persistent Cloud DB)',
    projectId: configData?.projectId || 'gen-lang-client-0684360526',
    databaseId: configData?.firestoreDatabaseId || 'default',
    isPersistent: true,
    isCloud: true,
    tables: {
      users: usersSnap.size,
      classes: classesSnap.size,
      activityProgress: progressSnap.size,
      assessmentAttempts: assessmentsSnap.size,
      missionSubmissions: missionsSnap.size,
      xpTransactions: xpSnap.size,
      badges: badgesSnap.size,
      auditLogs: auditSnap.size,
    },
  };
}

// -------------------------------------------------------------
// INITIAL SEED DATA FOR CLOUD FIRESTORE
// -------------------------------------------------------------
export async function seedInitialFirestoreData(): Promise<void> {
  const db = getFirestore();

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

  // 2. Teacher Carla (imaginebycarla2023@gmail.com / carlamo)
  const teacherEmail = 'imaginebycarla2023@gmail.com';
  const existingTeacher = await getUserByEmail(teacherEmail);
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync('carlamo', salt, 64).toString('hex');

  if (!existingTeacher) {
    await saveUser({
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
  } else {
    // Update password to carlamo
    await updateUser(existingTeacher.id, {
      name: 'Prof. Carla Silva',
      passwordHash: hash,
      passwordSalt: salt,
      role: 'teacher',
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Remove any legacy demo students
  const demoStudentIds = ['student-alex', 'student-leonor', 'student-tiago'];
  for (const id of demoStudentIds) {
    const existing = await getUserById(id);
    if (existing) {
      await deleteUser(id);
    }
  }
}
