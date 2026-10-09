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
  setLogLevel,
} from 'firebase/firestore';

// Silence verbose internal Firebase SDK debug logs
try {
  setLogLevel('silent');
} catch {}

export interface StudentUser {
  id: string;              // UID único (ex: "aluno_6a_01" ou gerado pelo Firebase Auth/DB)
  fullName: string;        // Nome completo oficial (ex: "Anderson Oliveira dos Santos")
  name: string;            // Nome curto (ex: "Anderson Oliveira")
  turma: string;           // Turma normalizada (ex: "6.º A")
  studentNumber: number;   // Número de chamada na pauta (ex: 1, 2, 3...)
  username: string;        // Nome de utilizador simples (ex: "anderson.santos")
  email: string;           // Email virtual/real (ex: "anderson.santos@escola.local")
  initialPassword: string; // Palavra-passe legível em texto limpo para o cartão (ex: "sol350")
  role: 'student';
  createdAt: string;
}

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

  // Student specific properties (matching StudentUser)
  fullName?: string;
  turma?: string;
  studentNumber?: number;
  username?: string;
  initialPassword?: string;
}

export interface ClassVisibility {
  worlds?: Record<number, boolean>;
  quizzes?: Record<number, boolean>;
  grandeMissao?: boolean;
  weeklyChallenge?: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  archived?: boolean;
  visibility?: ClassVisibility;
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
  firstScore?: number;
  bestScore: number;
  latestScore?: number;
  attempts: number;
  awardedXp?: number;
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
  mention?: string;
  isFirstAttempt?: boolean;
  attemptNumber?: number;
  firstScore?: number;
  firstMention?: string;
  bestScore?: number;
  bestMention?: string;
  latestScore?: number;
  latestMention?: string;
  attempts?: number;
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
    | 'grande_missao'
    | 'bonus';
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

// Pure Firebase Firestore Client initialization
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

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = getFirestore();
    const testDoc = await getDoc(doc(db, '_health_check', 'ping'));
    return true;
  } catch (err) {
    console.error('Firestore connection check failed:', err);
    return false;
  }
}

// -------------------------------------------------------------
// 1. USERS
// -------------------------------------------------------------
export async function getUserById(id: string): Promise<User | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'users', id));
  if (snap.exists()) return snap.data() as User;
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].data() as User;
  return null;
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].data() as User;
  return null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase();
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].data() as User;
  return null;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'users'));
  if (snap.empty) return [];
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
}

export async function resetStudentProgressInFirestore(userId: string): Promise<void> {
  const db = getFirestore();
  await updateUser(userId, { xp: 0 });

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
}

// -------------------------------------------------------------
// 2. CLASSES
// -------------------------------------------------------------
export async function getAllClasses(): Promise<ClassRoom[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'classes'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as ClassRoom);
}

export async function getClassById(id: string): Promise<ClassRoom | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'classes', id));
  if (snap.exists()) return snap.data() as ClassRoom;
  return null;
}

export async function getClassByCode(code: string): Promise<ClassRoom | null> {
  const cleanCode = code.trim().toLowerCase();
  const db = getFirestore();
  const q = query(collection(db, 'classes'), where('code', '==', code.trim()));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].data() as ClassRoom;

  const classes = await getAllClasses();
  return classes.find((c) => c.code && c.code.toLowerCase() === cleanCode) || null;
}

export async function saveClass(c: ClassRoom): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'classes', c.id), c);
}

export async function updateClass(id: string, updates: Partial<ClassRoom>): Promise<void> {
  const db = getFirestore();
  await updateDoc(doc(db, 'classes', id), updates);
}

export async function deleteClass(id: string): Promise<void> {
  const db = getFirestore();
  await deleteDoc(doc(db, 'classes', id));
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

  const db = getFirestore();
  await setDoc(doc(db, 'sessions', session.id), session);
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'sessions', id));
  if (!snap.exists()) return null;

  const session = snap.data() as Session;
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(id);
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
  if (snap.exists()) return snap.data() as ActivityProgress;
  return null;
}

export async function getUserActivityProgress(userId: string): Promise<ActivityProgress[]> {
  const db = getFirestore();
  const q = query(collection(db, 'activityProgress'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as ActivityProgress);
}

export async function getAllActivityProgress(): Promise<ActivityProgress[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'activityProgress'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as ActivityProgress);
}

export async function saveActivityProgress(progress: ActivityProgress): Promise<void> {
  const db = getFirestore();
  const docId = `${progress.userId}_${progress.activityId}`;
  progress.id = docId;
  await setDoc(doc(db, 'activityProgress', docId), progress);
}

/**
 * Concurrency-safe atomic transaction that updates ActivityProgress and,
 * if newBest > previousBest, awards the XP delta to the user and records the XPTransaction.
 */
export async function atomicRecordActivityProgress(params: {
  userId: string;
  activityId: string;
  worldId: number;
  evaluatedScore: number;
  isChallenge: boolean;
}): Promise<{
  previousBest: number;
  newBest: number;
  xpGain: number;
  newTotalXP: number;
  attempts: number;
  firstScore: number;
  isFirst: boolean;
  progress: ActivityProgress;
}> {
  const db = getFirestore();
  const { userId, activityId, worldId, evaluatedScore, isChallenge } = params;
  const userRef = doc(db, 'users', userId);
  const progDocId = `${userId}_${activityId}`;
  const progRef = doc(db, 'activityProgress', progDocId);
  const now = new Date().toISOString();

  let previousBest = 0;
  let newBest = evaluatedScore;
  let xpGain = 0;
  let newTotalXP = 0;
  let attempts = 1;
  let firstScore = evaluatedScore;
  let isFirst = true;
  let resultingProgress: ActivityProgress | null = null;

  await runTransaction(db, async (transaction) => {
    // 1. Mandatory reads first
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Utilizador não encontrado: ${userId}`);
    }
    const user = userSnap.data() as User;
    const currentXp = Number(user.xp) || 0;

    const progSnap = await transaction.get(progRef);
    const existingProg = progSnap.exists() ? (progSnap.data() as ActivityProgress) : null;

    previousBest = existingProg ? (Number(existingProg.bestScore) || 0) : 0;
    newBest = Math.max(previousBest, evaluatedScore);
    isFirst = !existingProg || !existingProg.attempts;
    firstScore = isFirst ? evaluatedScore : (existingProg?.firstScore ?? previousBest);
    attempts = (existingProg ? existingProg.attempts : 0) + 1;
    xpGain = Math.max(0, newBest - previousBest);
    const previousAwardedXp = existingProg ? (Number(existingProg.awardedXp) || 0) : 0;
    const awardedXp = previousAwardedXp + xpGain;
    newTotalXP = currentXp + xpGain;

    resultingProgress = {
      id: progDocId,
      userId,
      activityId,
      worldId,
      firstScore,
      bestScore: newBest,
      latestScore: evaluatedScore,
      attempts,
      awardedXp,
      completed: true,
      firstCompletedAt: existingProg?.firstCompletedAt || now,
      lastAttemptAt: now,
    };

    // 2. Atomic Writes
    transaction.set(progRef, resultingProgress, { merge: true });

    if (xpGain > 0) {
      const txId = `xp-${crypto.randomUUID()}`;
      const txRef = doc(db, 'xpTransactions', txId);
      const newTx: XPTransaction = {
        id: txId,
        userId,
        sourceType: isChallenge ? 'challenge' : 'activity',
        sourceId: activityId,
        previousBest,
        newBest,
        xpGain,
        createdAt: now,
      };

      transaction.update(userRef, {
        xp: newTotalXP,
        updatedAt: now,
      });
      transaction.set(txRef, newTx);
    }
  });

  return {
    previousBest,
    newBest,
    xpGain,
    newTotalXP,
    attempts,
    firstScore,
    isFirst,
    progress: resultingProgress!,
  };
}

// -------------------------------------------------------------
// 5. ASSESSMENT ATTEMPTS
// -------------------------------------------------------------
export async function getAssessmentAttempts(userId: string, worldId?: number): Promise<AssessmentAttempt[]> {
  const db = getFirestore();
  let q = query(collection(db, 'assessmentAttempts'));
  if (userId !== 'all') {
    q = query(q, where('userId', '==', userId));
  }
  if (worldId !== undefined) {
    q = query(q, where('worldId', '==', worldId));
  }
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as AssessmentAttempt);
}

export async function saveAssessmentAttempt(attempt: AssessmentAttempt): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'assessmentAttempts', attempt.id), attempt);
}

/**
 * Concurrency-safe atomic transaction for recording assessment quiz attempts
 */
export async function atomicRecordAssessmentAttempt(
  attempt: AssessmentAttempt
): Promise<{ attempt: AssessmentAttempt }> {
  const db = getFirestore();
  const attemptRef = doc(db, 'assessmentAttempts', attempt.id);
  const userRef = doc(db, 'users', attempt.userId);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Utilizador não encontrado: ${attempt.userId}`);
    }
    transaction.set(attemptRef, attempt);
    transaction.update(userRef, {
      updatedAt: attempt.createdAt,
    });
  });

  return { attempt };
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
  if (filter?.userId) q = query(q, where('userId', '==', filter.userId));
  if (filter?.status) q = query(q, where('status', '==', filter.status));
  if (filter?.worldId) q = query(q, where('worldId', '==', filter.worldId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  let list = snap.docs.map((d) => d.data() as MissionSubmission);
  if (filter?.classId && filter.classId !== 'all') {
    list = list.filter((m) => m.classId === filter.classId);
  }
  return list;
}

export async function getMissionSubmissionById(id: string): Promise<MissionSubmission | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'missionSubmissions', id));
  if (snap.exists()) return snap.data() as MissionSubmission;
  return null;
}

export async function saveMissionSubmission(sub: MissionSubmission): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'missionSubmissions', sub.id), sub);
}

/**
 * Concurrency-safe atomic transaction for grading a mission and awarding XP to the student
 */
export async function atomicAwardTeacherMissionGrade(params: {
  submissionId: string;
  studentId: string;
  missionId: string;
  score: number;
  feedback: string;
  gradedBy: string;
}): Promise<{
  submission: MissionSubmission;
  xpGain: number;
  newTotalXP: number;
}> {
  const db = getFirestore();
  const { submissionId, studentId, missionId, score, feedback, gradedBy } = params;
  const subRef = doc(db, 'missionSubmissions', submissionId);
  const userRef = doc(db, 'users', studentId);
  const now = new Date().toISOString();

  let xpGain = 0;
  let newTotalXP = 0;
  let updatedSubmission: MissionSubmission | null = null;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Aluno não encontrado: ${studentId}`);
    }
    const user = userSnap.data() as User;
    const curXp = Number(user.xp) || 0;

    const subSnap = await transaction.get(subRef);
    if (!subSnap.exists()) {
      throw new Error(`Submissão não encontrada: ${submissionId}`);
    }
    const sub = subSnap.data() as MissionSubmission;

    const prevScore = Number(sub.score) || 0;
    const normalizedScore = Math.round(score);
    const newBest = Math.max(prevScore, normalizedScore);
    xpGain = Math.max(0, newBest - prevScore);
    newTotalXP = curXp + xpGain;

    updatedSubmission = {
      ...sub,
      score: normalizedScore,
      feedback: feedback ? feedback.trim() : '',
      status: 'graded',
      gradedBy,
      gradedAt: now,
      updatedAt: now,
    };

    transaction.set(subRef, updatedSubmission, { merge: true });

    if (xpGain > 0) {
      const txId = `xp-${crypto.randomUUID()}`;
      const txRef = doc(db, 'xpTransactions', txId);
      transaction.update(userRef, { xp: newTotalXP, updatedAt: now });
      transaction.set(txRef, {
        id: txId,
        userId: studentId,
        sourceType: 'mission',
        sourceId: missionId,
        previousBest: prevScore,
        newBest,
        xpGain,
        createdAt: now,
      });
    }
  });

  return { submission: updatedSubmission!, xpGain, newTotalXP };
}

// -------------------------------------------------------------
// 7. XP TRANSACTIONS & CONCURRENCY-SAFE ATOMIC XP INCREMENT
// -------------------------------------------------------------
export async function getUserXPTransactions(userId: string): Promise<XPTransaction[]> {
  const db = getFirestore();
  const q = query(collection(db, 'xpTransactions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as XPTransaction);
}

export async function getAllXPTransactions(): Promise<XPTransaction[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'xpTransactions'));
  if (snap.empty) return [];
  const list = snap.docs.map((d) => d.data() as XPTransaction);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  if (xpGain <= 0) {
    const user = await getUserById(userId);
    return user ? { newTotalXP: user.xp, transactionId: '' } : null;
  }

  const db = getFirestore();

  // Enforce duplicate XP prevention on single-claim milestones in Firestore
  if (['grande_missao', 'weekly_challenge', 'daily_tip'].includes(txData.sourceType)) {
    const existingQ = query(
      collection(db, 'xpTransactions'),
      where('userId', '==', userId),
      where('sourceType', '==', txData.sourceType),
      where('sourceId', '==', txData.sourceId)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      console.warn(`[atomicAwardXP] Blocked duplicate XP transaction for user ${userId}, type: ${txData.sourceType}, sourceId: ${txData.sourceId}`);
      const user = await getUserById(userId);
      return user ? { newTotalXP: user.xp, transactionId: existingSnap.docs[0].id } : null;
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

  const userRef = doc(db, 'users', userId);
  const txRef = doc(db, 'xpTransactions', txId);

  let newTotalXP = xpGain;
  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists()) {
      const u = userSnap.data() as User;
      newTotalXP = (Number(u.xp) || 0) + xpGain;
      transaction.update(userRef, { xp: newTotalXP, updatedAt: new Date().toISOString() });
    }
    transaction.set(txRef, newTx);
  });

  return { newTotalXP, transactionId: txId };
}

// -------------------------------------------------------------
// 8. BADGES
// -------------------------------------------------------------
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const db = getFirestore();
  const q = query(collection(db, 'badges'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as UserBadge);
}

export async function getAllBadges(): Promise<UserBadge[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'badges'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as UserBadge);
}

export async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'badges', `${userId}_${badgeId}`));
  return snap.exists();
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  const db = getFirestore();
  const badgeDocRef = doc(db, 'badges', `${userId}_${badgeId}`);
  const snap = await getDoc(badgeDocRef);
  if (snap.exists()) return false;

  const badge: UserBadge = {
    id: `b-${crypto.randomUUID()}`,
    userId,
    badgeId,
    awardedAt: new Date().toISOString(),
  };
  await setDoc(badgeDocRef, badge);
  return true;
}

// -------------------------------------------------------------
// 9. DAILY TIP CLAIMS
// -------------------------------------------------------------
export async function getDailyTipClaim(userId: string, tipDate: string): Promise<DailyTipClaim | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'dailyTipClaims', `${userId}_${tipDate}`));
  if (snap.exists()) return snap.data() as DailyTipClaim;
  return null;
}

export async function getAllDailyTipClaims(): Promise<DailyTipClaim[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'dailyTipClaims'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as DailyTipClaim);
}

export async function getUserDailyTipClaims(userId: string): Promise<DailyTipClaim[]> {
  const db = getFirestore();
  const q = query(collection(db, 'dailyTipClaims'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as DailyTipClaim);
}

export async function claimDailyTipAtomic(userId: string, tipDate: string): Promise<{ success: boolean; xpAwarded: number }> {
  const db = getFirestore();
  const claimRef = doc(db, 'dailyTipClaims', `${userId}_${tipDate}`);
  const snap = await getDoc(claimRef);
  if (snap.exists()) {
    return { success: false, xpAwarded: 0 };
  }

  const claim: DailyTipClaim = {
    id: `claim-${crypto.randomUUID()}`,
    userId,
    tipDate,
    claimedAt: new Date().toISOString(),
  };

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

  const userRef = doc(db, 'users', userId);
  const txRef = doc(db, 'xpTransactions', txId);

  await runTransaction(db, async (transaction) => {
    const uSnap = await transaction.get(userRef);
    if (uSnap.exists()) {
      const u = uSnap.data() as User;
      const newXp = (Number(u.xp) || 0) + 10;
      transaction.update(userRef, { xp: newXp, updatedAt: new Date().toISOString() });
    }
    transaction.set(claimRef, claim);
    transaction.set(txRef, tx);
  });

  return { success: true, xpAwarded: 10 };
}

// -------------------------------------------------------------
// 10. WEEKLY CHALLENGE
// -------------------------------------------------------------
export async function getWeeklyChallengeProgress(userId: string, challengeId: string): Promise<WeeklyChallengeProgress | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'weeklyChallenges', `${userId}_${challengeId}`));
  if (snap.exists()) return snap.data() as WeeklyChallengeProgress;
  return null;
}

export async function getUserWeeklyChallenges(userId: string): Promise<WeeklyChallengeProgress[]> {
  const db = getFirestore();
  const q = query(collection(db, 'weeklyChallenges'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as WeeklyChallengeProgress);
}

export async function getAllWeeklyChallenges(): Promise<WeeklyChallengeProgress[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'weeklyChallenges'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as WeeklyChallengeProgress);
}

export async function saveWeeklyChallengeProgress(p: WeeklyChallengeProgress): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'weeklyChallenges', `${p.userId}_${p.challengeId}`), p);
}

/**
 * Concurrency-safe atomic transaction for completing the weekly challenge
 */
export async function atomicRecordWeeklyChallenge(params: {
  userId: string;
  challengeId: string;
  solution?: string;
  optionIndex?: number;
  xpReward: number;
}): Promise<{
  alreadyCompleted: boolean;
  xpGain: number;
  totalXp: number;
}> {
  const db = getFirestore();
  const { userId, challengeId, solution, optionIndex, xpReward } = params;
  const docId = `${userId}_${challengeId}`;
  const challengeRef = doc(db, 'weeklyChallenges', docId);
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();

  let alreadyCompleted = false;
  let xpGain = 0;
  let totalXp = 0;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Utilizador não encontrado: ${userId}`);
    }
    const user = userSnap.data() as User;
    const curXp = Number(user.xp) || 0;

    const cSnap = await transaction.get(challengeRef);
    if (cSnap.exists()) {
      alreadyCompleted = true;
      xpGain = 0;
      totalXp = curXp;
      return;
    }

    alreadyCompleted = false;
    xpGain = xpReward;
    totalXp = curXp + xpGain;

    transaction.set(challengeRef, {
      id: docId,
      userId,
      challengeId,
      solution: solution || '',
      optionIndex: optionIndex ?? 0,
      completed: true,
      completedAt: now,
      score: 100,
      status: 'completed',
    });

    const txId = `xp-${crypto.randomUUID()}`;
    const txRef = doc(db, 'xpTransactions', txId);
    transaction.update(userRef, { xp: totalXp, updatedAt: now });
    transaction.set(txRef, {
      id: txId,
      userId,
      sourceType: 'weekly_challenge',
      sourceId: challengeId,
      previousBest: 0,
      newBest: 100,
      xpGain,
      createdAt: now,
    });
  });

  return { alreadyCompleted, xpGain, totalXp };
}

// -------------------------------------------------------------
// 11. GRANDE MISSAO FINAL
// -------------------------------------------------------------
export async function getGrandeMissaoProgress(userId: string): Promise<GrandeMissaoProgress> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'grandeMissaoProgress', userId));
  if (snap.exists()) return snap.data() as GrandeMissaoProgress;

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
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'grandeMissaoProgress'));
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as GrandeMissaoProgress);
}

export async function saveGrandeMissaoProgress(p: GrandeMissaoProgress): Promise<void> {
  const db = getFirestore();
  const data = { ...p, id: p.userId, updatedAt: new Date().toISOString() };
  await setDoc(doc(db, 'grandeMissaoProgress', p.userId), data);
}

/**
 * Concurrency-safe atomic transaction for advancing a stage in Grande Missao
 */
export async function atomicRecordGrandeMissaoStage(params: {
  userId: string;
  completedZones: number[];
  unlockedCodes: Record<string, any>;
}): Promise<{
  progress: GrandeMissaoProgress;
}> {
  const db = getFirestore();
  const { userId, completedZones, unlockedCodes } = params;
  const gmRef = doc(db, 'grandeMissaoProgress', userId);
  const now = new Date().toISOString();
  let resultingProgress: GrandeMissaoProgress | null = null;

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gmRef);
    let currentStages: number[] = [];
    let currentAnswers: Record<string, any> = {};
    let status: GrandeMissaoProgress['status'] = 'not_started';

    if (snap.exists()) {
      const d = snap.data() as GrandeMissaoProgress;
      currentStages = d.completedStages || [];
      currentAnswers = d.stageAnswers || {};
      status = d.status || 'not_started';
    }

    const mergedStages = Array.from(new Set([...currentStages, ...completedZones]));
    const mergedAnswers = { ...currentAnswers, ...unlockedCodes };
    if (status !== 'completed') {
      status = mergedStages.length > 0 ? 'in_progress' : 'not_started';
    }
    const currentStage = Math.min(6, Math.max(...mergedStages, 1));

    resultingProgress = {
      id: userId,
      userId,
      currentStage,
      completedStages: mergedStages,
      stageAnswers: mergedAnswers,
      status,
      updatedAt: now,
    };

    transaction.set(gmRef, resultingProgress, { merge: true });
  });

  return { progress: resultingProgress! };
}

/**
 * Concurrency-safe atomic transaction for completing Grande Missao and awarding 150 XP
 */
export async function atomicCompleteGrandeMissao(params: {
  userId: string;
  missionId: string;
  xpReward: number;
}): Promise<{
  alreadyCompleted: boolean;
  xpGain: number;
  totalXp: number;
}> {
  const db = getFirestore();
  const { userId, missionId, xpReward } = params;
  const gmRef = doc(db, 'grandeMissaoProgress', userId);
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();

  let alreadyCompleted = false;
  let xpGain = 0;
  let totalXp = 0;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error(`Utilizador não encontrado: ${userId}`);
    }
    const user = userSnap.data() as User;
    const curXp = Number(user.xp) || 0;

    const gmSnap = await transaction.get(gmRef);
    const curStatus = gmSnap.exists() ? (gmSnap.data() as GrandeMissaoProgress).status : 'not_started';

    if (curStatus === 'completed') {
      alreadyCompleted = true;
      xpGain = 0;
      totalXp = curXp;
      return;
    }

    alreadyCompleted = false;
    xpGain = xpReward;
    totalXp = curXp + xpGain;

    const existingData = gmSnap.exists() ? gmSnap.data() : {};
    transaction.set(
      gmRef,
      {
        ...existingData,
        id: userId,
        userId,
        status: 'completed',
        currentStage: 5,
        completedStages: [1, 2, 3, 4, 5],
        completedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    const txId = `xp-${crypto.randomUUID()}`;
    const txRef = doc(db, 'xpTransactions', txId);
    transaction.update(userRef, { xp: totalXp, updatedAt: now });
    transaction.set(txRef, {
      id: txId,
      userId,
      sourceType: 'grande_missao',
      sourceId: missionId,
      previousBest: 0,
      newBest: 150,
      xpGain,
      createdAt: now,
    });
  });

  return { alreadyCompleted, xpGain, totalXp };
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

  const db = getFirestore();
  await setDoc(doc(db, 'auditLogs', fullLog.id), fullLog);
  return fullLog;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = getFirestore();
  const snap = await getDocs(collection(db, 'auditLogs'));
  if (snap.empty) return [];
  const logs = snap.docs.map((d) => d.data() as AuditLog);
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// -------------------------------------------------------------
// STATS FOR TEACHER DASHBOARD & SYSTEM STATUS
// -------------------------------------------------------------
export async function getFirestoreStats() {
  const db = getFirestore();
  const [users, classes, activityProgress, assessmentAttempts, missionSubmissions, xpTransactions, badges, auditLogs] = await Promise.all([
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
      users: users.size,
      classes: classes.size,
      activityProgress: activityProgress.size,
      assessmentAttempts: assessmentAttempts.size,
      missionSubmissions: missionSubmissions.size,
      xpTransactions: xpTransactions.size,
      badges: badges.size,
      auditLogs: auditLogs.size,
    },
  };
}

// -------------------------------------------------------------
// INITIAL SEED DATA DIRECTLY IN FIRESTORE
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
