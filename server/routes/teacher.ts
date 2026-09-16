import { Router, Response } from 'express';
import crypto from 'crypto';
import { getDb, saveDb, User, AuditLog, XPTransaction } from '../db';
import { AuthRequest, requireTeacher, hashPassword } from '../auth';
import { calculateLevel, WORLDS_DATA } from '../catalog';
import { computeWorldStats } from './pedagogical';

const router = Router();

// Teacher must be authenticated
router.use(requireTeacher);

// Helper to log teacher actions
function logTeacherAction(
  req: AuthRequest,
  action: string,
  targetUserId?: string,
  targetUserName?: string,
  metadata?: Record<string, any>
) {
  const db = getDb();
  const log: AuditLog = {
    id: `audit-${crypto.randomUUID()}`,
    actorUserId: req.user!.id,
    actorName: req.user!.name,
    action,
    targetUserId,
    targetUserName,
    metadata,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(log);
  saveDb(db);
}

// GET dashboard stats for teacher
router.get('/dashboard-stats', (req: AuthRequest, res) => {
  const db = getDb();
  const students = db.users.filter((u) => u.role === 'student');
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => !s.blocked).length;
  const pendingMissions = db.missionSubmissions.filter((m) => m.status === 'pending').length;
  const totalXP = students.reduce((acc, s) => acc + s.xp, 0);
  const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

  // World stats across all students
  const worldStats = WORLDS_DATA.map((w) => {
    let sumAvg = 0;
    let count = 0;
    students.forEach((s) => {
      const stats = computeWorldStats(s.id, w.id);
      if (stats.completedCount > 0) {
        sumAvg += stats.average;
        count++;
      }
    });
    return {
      worldId: w.id,
      title: w.title,
      classAverage: count > 0 ? Number((sumAvg / count).toFixed(1)) : 0,
      studentsActive: count,
    };
  });

  return res.json({
    totalStudents,
    activeStudents,
    pendingMissions,
    avgXP,
    classes: db.classes,
    worldStats,
  });
});

// GET list of students
router.get('/students', (req: AuthRequest, res) => {
  const { classId, search } = req.query;
  const db = getDb();

  let students = db.users.filter((u) => u.role === 'student');

  if (classId && typeof classId === 'string' && classId !== 'all') {
    students = students.filter((s) => s.classId === classId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    students = students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nickname.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }

  const result = students.map((s) => {
    const levelInfo = calculateLevel(s.xp);
    const classroom = db.classes.find((c) => c.id === s.classId);
    // Calculate world averages
    const worldAverages = [1, 2, 3, 4, 5].map((wId) => {
      const st = computeWorldStats(s.id, wId);
      return { worldId: wId, average: st.average, isUnlocked: st.isUnlocked };
    });

    // Check if needs help (average < 50 on unlocked worlds or 3+ failed attempts)
    const failedAttempts = db.assessmentAttempts.filter((a) => a.userId === s.id && a.percentage < 50).length;
    const needsHelp = failedAttempts >= 2 || (worldAverages[0].average > 0 && worldAverages[0].average < 50);

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      nickname: s.nickname,
      avatar: s.avatar,
      classId: s.classId,
      className: classroom ? classroom.name : 'Sem Turma',
      locale: s.locale,
      xp: s.xp,
      level: levelInfo.level,
      levelName: levelInfo.name,
      blocked: s.blocked,
      mustChangePassword: s.mustChangePassword || false,
      createdAt: s.createdAt,
      lastLoginAt: s.lastLoginAt,
      needsHelp,
      helpReason: needsHelp ? 'Dificuldade registada em avaliações/simuladores' : undefined,
      worldAverages,
    };
  });

  return res.json({ students: result });
});

// GET student pedagogical profile
router.get('/students/:studentId', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const db = getDb();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });

  const classroom = db.classes.find((c) => c.id === student.classId);
  const levelInfo = calculateLevel(student.xp);
  const badges = db.badges.filter((b) => b.userId === student.id);
  const xpHistory = db.xpTransactions.filter((t) => t.userId === student.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const assessments = db.assessmentAttempts.filter((a) => a.userId === student.id);
  const missions = db.missionSubmissions.filter((m) => m.userId === student.id);
  const activities = db.activityProgress.filter((p) => p.userId === student.id);

  const worldDetails = WORLDS_DATA.map((w) => {
    const stats = computeWorldStats(student.id, w.id);
    return {
      worldId: w.id,
      title: w.title,
      ...stats,
    };
  });

  return res.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      nickname: student.nickname,
      avatar: student.avatar,
      classId: student.classId,
      className: classroom ? classroom.name : '',
      locale: student.locale,
      xp: student.xp,
      level: levelInfo.level,
      levelName: levelInfo.name,
      blocked: student.blocked,
      mustChangePassword: student.mustChangePassword || false,
      createdAt: student.createdAt,
      lastLoginAt: student.lastLoginAt,
    },
    worldDetails,
    badges,
    xpHistory,
    assessments,
    missions,
    activities,
  });
});

// PUT update student data
router.put('/students/:studentId', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const { nickname, avatar, classId, locale, mustChangePassword } = req.body;
  const db = getDb();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });

  if (nickname) student.nickname = nickname.trim();
  if (avatar) student.avatar = avatar;
  if (classId) student.classId = classId;
  if (locale) student.locale = locale;
  if (typeof mustChangePassword === 'boolean') student.mustChangePassword = mustChangePassword;

  student.updatedAt = new Date().toISOString();
  saveDb(db);

  logTeacherAction(req, 'alteração de aluno', student.id, student.name, {
    nickname,
    classId,
    locale,
  });

  return res.json({ success: true, student });
});

// POST toggle block / unblock student
router.post('/students/:studentId/toggle-block', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const db = getDb();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });

  student.blocked = !student.blocked;
  student.updatedAt = new Date().toISOString();

  // If blocking, invalidate existing sessions
  if (student.blocked) {
    db.sessions = db.sessions.filter((s) => s.userId !== student.id);
  }

  saveDb(db);

  logTeacherAction(req, student.blocked ? 'bloqueio' : 'desbloqueio', student.id, student.name);

  return res.json({ success: true, blocked: student.blocked });
});

// POST reset student password
router.post('/students/:studentId/reset-password', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const { newPassword, requireChangeOnNextLogin } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova palavra-passe deve conter pelo menos 6 caracteres.' });
  }

  const db = getDb();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });

  const { hash, salt } = hashPassword(newPassword);
  student.passwordHash = hash;
  student.passwordSalt = salt;
  student.mustChangePassword = requireChangeOnNextLogin ?? true;
  student.updatedAt = new Date().toISOString();

  // Invalidate previous sessions
  db.sessions = db.sessions.filter((s) => s.userId !== student.id);
  saveDb(db);

  logTeacherAction(req, 'reset de password', student.id, student.name, {
    mustChangePassword: student.mustChangePassword,
  });

  return res.json({
    success: true,
    message: 'Palavra-passe do aluno redefinida com sucesso. Todas as sessões anteriores foram revogadas.',
  });
});

// POST reset student progress
router.post('/students/:studentId/reset-progress', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const db = getDb();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });

  // Reset student XP to initial 100 registration
  student.xp = 100;
  student.updatedAt = new Date().toISOString();

  // Remove progress, attempts, submissions, and non-initial transactions
  db.activityProgress = db.activityProgress.filter((p) => p.userId !== student.id);
  db.assessmentAttempts = db.assessmentAttempts.filter((a) => a.userId !== student.id);
  db.missionSubmissions = db.missionSubmissions.filter((m) => m.userId !== student.id);
  db.dailyTipClaims = db.dailyTipClaims.filter((c) => c.userId !== student.id);
  db.weeklyChallenges = db.weeklyChallenges.filter((w) => w.userId !== student.id);

  // Keep only registration XP transaction
  db.xpTransactions = db.xpTransactions.filter(
    (t) => t.userId !== student.id || t.sourceType === 'registration'
  );

  // Keep only initial 'primeiros-passos' badge
  db.badges = db.badges.filter(
    (b) => b.userId !== student.id || b.badgeId === 'primeiros-passos'
  );

  saveDb(db);

  logTeacherAction(req, 'reset de progresso', student.id, student.name);

  return res.json({
    success: true,
    message: 'O progresso do aluno foi reiniciado para o estado inicial.',
  });
});

// DELETE student
router.delete('/students/:studentId', (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const db = getDb();
  const studentIndex = db.users.findIndex((u) => u.id === studentId && u.role === 'student');
  if (studentIndex === -1) return res.status(404).json({ error: 'Aluno não encontrado' });

  const studentName = db.users[studentIndex].name;
  db.users.splice(studentIndex, 1);

  // Clean up related data
  db.sessions = db.sessions.filter((s) => s.userId !== studentId);
  db.activityProgress = db.activityProgress.filter((p) => p.userId !== studentId);
  db.assessmentAttempts = db.assessmentAttempts.filter((a) => a.userId !== studentId);
  db.missionSubmissions = db.missionSubmissions.filter((m) => m.userId !== studentId);
  db.xpTransactions = db.xpTransactions.filter((t) => t.userId !== studentId);
  db.badges = db.badges.filter((b) => b.userId !== studentId);

  saveDb(db);
  logTeacherAction(req, 'eliminação', studentId, studentName);

  return res.json({ success: true, message: 'Conta de aluno eliminada com sucesso.' });
});

// GET all mission submissions pending or graded
router.get('/missions', (req: AuthRequest, res) => {
  const { status, worldId } = req.query;
  const db = getDb();

  let missions = [...db.missionSubmissions];
  if (status && (status === 'pending' || status === 'graded')) {
    missions = missions.filter((m) => m.status === status);
  }
  if (worldId) {
    const wId = parseInt(worldId as string, 10);
    missions = missions.filter((m) => m.worldId === wId);
  }

  // Populate student details
  const result = missions.map((m) => {
    const student = db.users.find((u) => u.id === m.userId);
    const classroom = student ? db.classes.find((c) => c.id === student.classId) : null;
    return {
      ...m,
      studentName: student ? student.name : m.studentName || 'Aluno Desconhecido',
      studentNickname: student ? student.nickname : m.studentNickname || '',
      className: classroom ? classroom.name : '',
    };
  });

  return res.json({ missions: result });
});

// POST grade a mission submission
router.post('/missions/:submissionId/grade', (req: AuthRequest, res) => {
  const { submissionId } = req.params;
  const { score, feedback } = req.body;

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ error: 'A classificação deve ser um número entre 0 e 100.' });
  }

  const db = getDb();
  const submission = db.missionSubmissions.find((m) => m.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

  const student = db.users.find((u) => u.id === submission.userId);
  if (!student) return res.status(404).json({ error: 'Aluno associado não encontrado.' });

  const prevScore = submission.score || 0;
  const normalizedScore = Math.round(score);

  submission.score = normalizedScore;
  submission.feedback = feedback ? feedback.trim() : '';
  submission.status = 'graded';
  submission.gradedBy = req.user!.name;
  submission.gradedAt = new Date().toISOString();

  // Official XP Rule:
  // newBest = max(previousBest, currentScore)
  // xpGain = newBest - previousBest
  const newBest = Math.max(prevScore, normalizedScore);
  const xpGain = newBest - prevScore;

  if (xpGain > 0) {
    student.xp += xpGain;
    db.xpTransactions.push({
      id: `xp-mis-${crypto.randomUUID()}`,
      userId: student.id,
      sourceType: 'mission',
      sourceId: submission.missionId,
      previousBest: prevScore,
      newBest,
      xpGain,
      createdAt: new Date().toISOString(),
    });
  }

  saveDb(db);

  logTeacherAction(req, 'correção', student.id, student.name, {
    missionId: submission.missionId,
    score: normalizedScore,
    xpGain,
  });

  return res.json({
    success: true,
    message: 'Missão avaliada com sucesso!',
    submission,
  });
});

// GET Audit Logs
router.get('/audit-logs', (req: AuthRequest, res) => {
  const db = getDb();
  return res.json({ auditLogs: db.auditLogs.slice(0, 100) });
});

// GET Export CSV
router.get('/export/csv', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const students = db.users.filter((u) => u.role === 'student');

  let csv =
    'Nickname,Nome Completo,Email,Turma,Nivel,XP Total,Media M1 (%),Media M2 (%),Media M3 (%),Media M4 (%),Media M5 (%),Apoio Necessario,Data Registo\n';

  students.forEach((s) => {
    const levelInfo = calculateLevel(s.xp);
    const classroom = db.classes.find((c) => c.id === s.classId);
    const m1 = computeWorldStats(s.id, 1).average;
    const m2 = computeWorldStats(s.id, 2).average;
    const m3 = computeWorldStats(s.id, 3).average;
    const m4 = computeWorldStats(s.id, 4).average;
    const m5 = computeWorldStats(s.id, 5).average;
    const failedAttempts = db.assessmentAttempts.filter((a) => a.userId === s.id && a.percentage < 50).length;
    const needsHelp = failedAttempts >= 2 || (m1 > 0 && m1 < 50) ? 'SIM' : 'NAO';

    const row = [
      `"${s.nickname.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${classroom ? classroom.name : ''}"`,
      `"${levelInfo.level} - ${levelInfo.name}"`,
      s.xp,
      m1,
      m2,
      m3,
      m4,
      m5,
      needsHelp,
      `"${new Date(s.createdAt).toLocaleDateString('pt-PT')}"`,
    ];
    csv += row.join(',') + '\n';
  });

  logTeacherAction(req, 'exportação', undefined, undefined, { format: 'CSV', studentCount: students.length });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="missao_tic_alunos.csv"');
  return res.send('\uFEFF' + csv);
});

export default router;
