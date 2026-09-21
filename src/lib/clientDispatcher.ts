import {
  clientGetClasses,
  clientLogin,
  clientRegister,
  clientGetCurrentUser,
  clientUpdateProfile,
  clientLogout,
  clientGetWorlds,
  clientCompleteActivity,
  clientGetAssessment,
  clientSubmitAssessment,
  clientGetClassRanking,
  clientGetDailyTip,
  clientClaimDailyTip,
  clientGetWeeklyChallenge,
  clientSubmitWeeklyChallenge,
  clientGetGrandeMissao,
  clientSaveGrandeMissaoStage,
  clientCompleteGrandeMissao,
  getActiveClientUserId,
  sanitizeClientUser,
  ClientUser,
} from './clientFirestoreService';
import { getClientFirestore } from './firebaseClient';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { WORLDS_DATA } from '../data/catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';

export async function clientDispatch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(endpoint, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {}
  }

  // 1. AUTH ROUTES
  if (pathname === '/api/auth/classes') {
    const classes = await clientGetClasses();
    return { classes } as any;
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const identifier = body.email || body.identifier || body.nickname || body.username || '';
    const res = await clientLogin(identifier, body.password);
    return res as any;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const res = await clientRegister({
      name: body.name,
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      classId: body.classId || body.classCode || body.classroomCode,
      avatar: body.avatar,
      locale: body.locale,
    });
    return res as any;
  }

  if (pathname === '/api/auth/me') {
    const res = await clientGetCurrentUser();
    return res as any;
  }

  if (pathname === '/api/auth/profile' && method === 'POST') {
    const res = await clientUpdateProfile(body);
    return res as any;
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return clientLogout() as any;
  }

  // 2. PEDAGOGICAL ROUTES
  if (pathname === '/api/pedagogical/worlds') {
    const res = await clientGetWorlds();
    return res as any;
  }

  if (pathname === '/api/pedagogical/activities/complete' && method === 'POST') {
    const res = await clientCompleteActivity(body.activityId, body.score, body.durationSeconds);
    return res as any;
  }

  const assessSubmitMatch = pathname.match(/^\/api\/pedagogical\/assessments\/(\d+)\/submit$/);
  if (assessSubmitMatch && method === 'POST') {
    const worldId = parseInt(assessSubmitMatch[1], 10);
    const res = await clientSubmitAssessment(worldId, body.answers || {}, body.durationSeconds);
    return res as any;
  }

  const assessGetMatch = pathname.match(/^\/api\/pedagogical\/assessments\/(\d+)$/);
  if (assessGetMatch && method === 'GET') {
    const worldId = parseInt(assessGetMatch[1], 10);
    const res = await clientGetAssessment(worldId);
    return res as any;
  }

  if (pathname === '/api/pedagogical/class-ranking') {
    const res = await clientGetClassRanking();
    return res as any;
  }

  if (pathname === '/api/pedagogical/daily-tip/claim' && method === 'POST') {
    const res = await clientClaimDailyTip();
    return res as any;
  }

  if (pathname === '/api/pedagogical/daily-tip') {
    const res = await clientGetDailyTip();
    return res as any;
  }

  if (pathname === '/api/pedagogical/weekly-challenge' || pathname === '/api/pedagogical/weekly-challenge/submit') {
    if (method === 'POST') {
      const res = await clientSubmitWeeklyChallenge(body);
      return res as any;
    } else {
      const res = await clientGetWeeklyChallenge();
      return res as any;
    }
  }

  if (pathname === '/api/pedagogical/grande-missao/stage' && method === 'POST') {
    const res = await clientSaveGrandeMissaoStage(body.stageNumber, body.answers);
    return res as any;
  }

  if (pathname === '/api/pedagogical/grande-missao/complete' && method === 'POST') {
    const res = await clientCompleteGrandeMissao();
    return res as any;
  }

  if (pathname === '/api/pedagogical/grande-missao') {
    const res = await clientGetGrandeMissao();
    return res as any;
  }

  const missionSubmitMatch = pathname.match(/^\/api\/pedagogical\/missions\/(\d+)$/);
  if (missionSubmitMatch && method === 'POST') {
    const worldId = parseInt(missionSubmitMatch[1], 10);
    const userId = getActiveClientUserId();
    if (!userId) throw new Error('Não autenticado');

    const db = getClientFirestore();
    const subId = `sub-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'missionSubmissions', subId), {
      id: subId,
      userId,
      worldId,
      textResponse: body.textResponse || '',
      fileUrl: body.fileUrl || '',
      fileName: body.fileName || '',
      status: 'pending',
      createdAt: now,
    });
    return { success: true, submissionId: subId } as any;
  }

  // 3. TEACHER ROUTES DIRECTLY ON FIRESTORE
  const db = getClientFirestore();

  if (pathname === '/api/teacher/dashboard-stats') {
    const qUsers = query(collection(db, 'users'));
    const userSnap = await getDocs(qUsers);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const students = allUsers.filter((u) => u.role === 'student');
    const classes = await clientGetClasses();

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => !s.blocked).length;
    const totalXP = students.reduce((acc, s) => acc + (s.xp || 0), 0);
    const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

    const worldStats = WORLDS_DATA.map((w) => ({
      worldId: w.id,
      title: w.title,
      classAverage: 0,
      studentsActive: 0,
      studentsUnlockedNext: 0,
    }));

    return {
      totalStudents,
      activeStudents,
      pendingMissions: 0,
      avgXP,
      studentsNeedingHelp: 0,
      classes,
      worldStats,
    } as any;
  }

  if (pathname === '/api/teacher/students') {
    const classId = searchParams.get('classId');
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    let students = userSnap.docs.map((d) => d.data() as ClientUser);

    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const studentsFormatted = students.map((s) => {
      const sanitized = sanitizeClientUser(s);
      return {
        ...sanitized,
        overallAverage: 0,
        completedWorldsCount: 0,
        unlockedWorldsCount: 1,
        simulatorsAverage: 0,
        assessmentsAverage: 0,
        progressPercentage: 0,
        status: s.blocked ? 'suspended' : 'active',
        needsIntervention: false,
        worldAverages: {},
      };
    });

    return { students: studentsFormatted } as any;
  }

  if (pathname === '/api/teacher/classes') {
    const classes = await clientGetClasses();
    return { classes } as any;
  }

  if (pathname === '/api/teacher/pauta') {
    const classId = searchParams.get('classId');
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    let students = userSnap.docs.map((d) => d.data() as ClientUser);

    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const pauta = students.map((s) => {
      const mention = getQualitativeMention(0);
      return {
        studentId: s.id,
        name: s.name,
        nickname: s.nickname,
        classId: s.classId,
        avatar: s.avatar,
        overallAverage: 0,
        qualitativeMention: mention,
        qualitativeDescription: mention,
        qualitativeLevel: 1,
        qualitativeColor: '#ef4444',
        worldsCompleted: 0,
        xp: s.xp || 0,
        rank: 0,
        worldDetails: {},
      };
    });

    return { pauta } as any;
  }

  if (pathname === '/api/teacher/missions') {
    const q = query(collection(db, 'missionSubmissions'));
    const snap = await getDocs(q);
    const submissions = snap.docs.map((d) => d.data());
    return { submissions } as any;
  }

  if (pathname === '/api/teacher/assessments-summary') {
    return { summaries: [] } as any;
  }

  if (pathname === '/api/teacher/activities-summary') {
    return { activities: [] } as any;
  }

  if (pathname === '/api/teacher/challenges-summary') {
    return { challenges: [] } as any;
  }

  if (pathname === '/api/teacher/xp-breakdown') {
    return { breakdown: [] } as any;
  }

  if (pathname === '/api/teacher/grande-missao-summary') {
    return { summary: { totalStarted: 0, totalCompleted: 0, stagesCount: {} } } as any;
  }

  if (pathname === '/api/teacher/badges-summary') {
    return { badges: [] } as any;
  }

  if (pathname === '/api/teacher/audit-logs') {
    return { logs: [] } as any;
  }

  // Teacher actions: toggle block, delete student, etc.
  const toggleBlockMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/toggle-block$/);
  if (toggleBlockMatch && method === 'POST') {
    const sId = toggleBlockMatch[1];
    const sRef = doc(db, 'users', sId);
    const sSnap = await getDoc(sRef);
    if (!sSnap.exists()) throw new Error('Aluno não encontrado');
    const curBlocked = sSnap.data().blocked || false;
    await updateDoc(sRef, { blocked: !curBlocked, updatedAt: new Date().toISOString() });
    return { success: true, blocked: !curBlocked } as any;
  }

  const deleteStudentMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)$/);
  if (deleteStudentMatch && method === 'DELETE') {
    const sId = deleteStudentMatch[1];
    await deleteDoc(doc(db, 'users', sId));
    return { success: true } as any;
  }

  throw new Error(`Rota não encontrada no serviço local: ${pathname}`);
}
