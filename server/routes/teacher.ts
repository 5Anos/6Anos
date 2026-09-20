import { Router, Response } from 'express';
import crypto from 'crypto';
import * as XLSX from 'xlsx';
import {
  User,
  AuditLog,
  ClassRoom,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllClasses,
  getClassById,
  saveClass,
  updateClass,
  deleteClass,
  deleteClassStudents,
  resetClassStudentsProgress,
  getMissionSubmissions,
  getMissionSubmissionById,
  saveMissionSubmission,
  getAssessmentAttempts,
  getUserXPTransactions,
  getAllXPTransactions,
  getUserBadges,
  getAllBadges,
  getUserActivityProgress,
  getAllActivityProgress,
  getUserDailyTipClaims,
  getAllDailyTipClaims,
  getUserWeeklyChallenges,
  getAllWeeklyChallenges,
  getGrandeMissaoProgress,
  getAllGrandeMissaoProgress,
  saveUser,
  deleteSession,
  addAuditLog,
  getAuditLogs,
  atomicAwardXP,
  getFirestoreStats,
  resetStudentProgressInFirestore,
} from '../firestoreDb';
import { AuthRequest, requireTeacher, hashPassword } from '../auth';
import {
  calculateLevel,
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  BADGES_CATALOG,
} from '../catalog';
import { computeWorldStats } from './pedagogical';
import { PROGRESSION_CONFIG } from '../progressionConfig';

const router = Router();

// Teacher must be authenticated
router.use(requireTeacher);

// Helper to log teacher actions in Cloud Firestore
async function logTeacherAction(
  req: AuthRequest,
  action: string,
  targetUserId?: string,
  targetUserName?: string,
  metadata?: Record<string, any>
) {
  const log: any = {
    actorUserId: req.user!.id,
    actorName: req.user!.name,
    action,
  };
  if (targetUserId) log.targetUserId = targetUserId;
  if (targetUserName) log.targetUserName = targetUserName;
  if (metadata) log.metadata = metadata;
  await addAuditLog(log);
}

// -------------------------------------------------------------
// 1. DASHBOARD STATS
// -------------------------------------------------------------
router.get('/dashboard-stats', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, pendingMissions, allAssessments] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getMissionSubmissions({ status: 'pending' }),
      getAssessmentAttempts('all'),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => !s.blocked).length;
    const totalXP = students.reduce((acc, s) => acc + s.xp, 0);
    const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

    // World stats across all students
    const worldStats = await Promise.all(
      WORLDS_DATA.map(async (w) => {
        let sumAvg = 0;
        let count = 0;
        let passedCount = 0;
        for (const s of students) {
          const stats = await computeWorldStats(s.id, w.id);
          if (stats.completedCount > 0) {
            sumAvg += stats.average;
            count++;
          }
          if (stats.isWorldCompleted || stats.average >= PROGRESSION_CONFIG.PASSING_THRESHOLD) {
            passedCount++;
          }
        }
        return {
          worldId: w.id,
          title: w.title,
          classAverage: count > 0 ? Number((sumAvg / count).toFixed(1)) : 0,
          studentsActive: count,
          studentsUnlockedNext: passedCount,
        };
      })
    );

    // Students needing support
    const studentsNeedingHelp = students.filter((s) => s.needsHelp).length;

    return res.json({
      totalStudents,
      activeStudents,
      pendingMissions: pendingMissions.length,
      avgXP,
      studentsNeedingHelp,
      classes,
      worldStats,
    });
  } catch (err) {
    console.error('Error in /dashboard-stats:', err);
    return res.status(500).json({ error: 'Erro ao carregar estatísticas do painel do professor.' });
  }
});

// -------------------------------------------------------------
// 2. STUDENTS LIST & PEDAGOGICAL METRICS
// -------------------------------------------------------------
router.get('/students', async (req: AuthRequest, res) => {
  try {
    const { classId, search } = req.query;
    const [allUsers, classes, allAssessments, allMissions] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAssessmentAttempts('all'),
      getMissionSubmissions(),
    ]);

    let students = allUsers.filter((u) => u.role === 'student');

    if (classId && typeof classId === 'string' && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    const result = await Promise.all(
      students.map(async (s) => {
        const levelInfo = calculateLevel(s.xp);
        const classroom = classes.find((c) => c.id === s.classId);

        // Calculate world averages strictly with centralized progression policy
        const worldAverages = await Promise.all(
          [1, 2, 3, 4, 5].map(async (wId) => {
            const st = await computeWorldStats(s.id, wId);
            return {
              worldId: wId,
              average: st.average,
              completedCount: st.completedCount,
              totalComponents: st.totalComponents,
              isUnlocked: st.isUnlocked,
              isCompleted: st.isWorldCompleted,
              hasAssessmentPassed: st.hasAssessmentPassed,
            };
          })
        );

        // Compute global average across unlocked worlds with data
        const completedWorlds = worldAverages.filter((w) => w.completedCount > 0);
        const globalAverage =
          completedWorlds.length > 0
            ? Number(
                (
                  completedWorlds.reduce((acc, curr) => acc + curr.average, 0) /
                  completedWorlds.length
                ).toFixed(1)
              )
            : 0;

        // Number of unlocked worlds
        const unlockedWorldsCount = worldAverages.filter((w) => w.isUnlocked).length;

        // Pending missions for this student
        const pendingMissionsCount = allMissions.filter(
          (m) => m.userId === s.id && m.status === 'pending'
        ).length;

        // Check if needs help (average < 50 on any unlocked world or 2+ failed assessment attempts)
        const failedAttempts = allAssessments.filter(
          (a) => a.userId === s.id && a.percentage < 50
        ).length;
        const lowWorldAvg = worldAverages.some((w) => w.isUnlocked && w.completedCount > 0 && w.average < 50);
        const needsHelp = failedAttempts >= 2 || lowWorldAvg;

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
          helpReason: needsHelp
            ? failedAttempts >= 2
              ? `${failedAttempts} tentativas em avaliações com nota < 50%`
              : 'Média em Mundo desbloqueado inferior a 50%'
            : undefined,
          worldAverages,
          globalAverage,
          unlockedWorldsCount,
          pendingMissionsCount,
        };
      })
    );

    return res.json({ students: result });
  } catch (err) {
    console.error('Error in /students:', err);
    return res.status(500).json({ error: 'Erro ao carregar lista de alunos.' });
  }
});

// -------------------------------------------------------------
// 3. INDIVIDUAL STUDENT DOSSIER (BOLETIM PEDAGÓGICO COMPLETO)
// -------------------------------------------------------------
router.get('/students/:studentId', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const [
      classroom,
      badges,
      xpHistory,
      assessments,
      missions,
      activityProgress,
      dailyTips,
      weeklyChallenges,
      grandeMissao,
    ] = await Promise.all([
      student.classId ? getClassById(student.classId) : null,
      getUserBadges(student.id),
      getUserXPTransactions(student.id),
      getAssessmentAttempts(student.id),
      getMissionSubmissions({ userId: student.id }),
      getUserActivityProgress(student.id),
      getUserDailyTipClaims(student.id),
      getUserWeeklyChallenges(student.id),
      getGrandeMissaoProgress(student.id),
    ]);

    const levelInfo = calculateLevel(student.xp);

    // Build pedagogical breakdown for each of the 5 Worlds in-memory
    let previousWorldPassed = true;
    const worldDetails = WORLDS_DATA.map((w, idx) => {
      const isUnlocked = idx === 0 ? true : previousWorldPassed;
      const mission = missions.find((m) => m.worldId === w.id);
      const chalProg = activityProgress.find((p) => p.activityId === w.challenge.id);
      const worldAssessments = assessments.filter((a) => a.worldId === w.id);

      const simulatorsDetail = w.simulators.map((sim) => {
        const prog = activityProgress.find((p) => p.activityId === sim.id);
        return {
          id: sim.id,
          title: sim.name,
          description: sim.description,
          completed: prog ? prog.completed : false,
          bestScore: prog ? prog.bestScore : 0,
          attempts: prog ? prog.attempts : 0,
          lastAttemptAt: prog ? prog.lastAttemptAt : null,
        };
      });

      const scores: number[] = [];
      simulatorsDetail.forEach((s) => {
        if (s.completed) scores.push(s.bestScore);
      });
      if (worldAssessments.length > 0) {
        const bestAssess = Math.max(...worldAssessments.map((a) => a.percentage));
        scores.push(bestAssess);
      }
      const average = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;
      const worldStats = await computeWorldStats(student.id, w.id);
      previousWorldPassed = worldStats.isWorldCompleted;

      return {
        worldId: w.id,
        title: w.title,
        subtitle: w.subtitle,
        color: w.color,
        average: worldStats.average,
        isUnlocked: worldStats.isUnlocked,
        isCompleted: worldStats.isWorldCompleted,
        completedCount: worldStats.completedCount,
        totalComponents: worldStats.totalComponents,
        hasAssessmentPassed: worldStats.hasAssessmentPassed,
        simulators: simulatorsDetail,
        challenge: {
          id: w.challenge.id,
          title: w.challenge.title,
          completed: chalProg ? chalProg.completed : false,
          bestScore: chalProg ? chalProg.bestScore : 0,
          attempts: chalProg ? chalProg.attempts : 0,
        },
        mission: mission
          ? {
              id: mission.id,
              title: mission.title,
              status: mission.status,
              score: mission.score,
              submission: mission.submission,
              feedback: mission.feedback,
              gradedBy: mission.gradedBy,
              gradedAt: mission.gradedAt,
              submittedAt: mission.submittedAt,
            }
          : null,
        assessments: worldAssessments.map((a) => ({
          id: a.id,
          score: a.score,
          percentage: a.percentage,
          createdAt: a.createdAt,
          answersCount: Object.keys(a.answers || {}).length,
        })),
      };
    });

    // XP Breakdown by source
    const xpBreakdown = {
      initial: 100,
      activities: xpHistory
        .filter((t) => t.sourceType === 'activity')
        .reduce((sum, t) => sum + t.xpGain, 0),
      challenges: xpHistory
        .filter((t) => t.sourceType === 'challenge')
        .reduce((sum, t) => sum + t.xpGain, 0),
      assessments: xpHistory
        .filter((t) => t.sourceType === 'assessment')
        .reduce((sum, t) => sum + t.xpGain, 0),
      missions: xpHistory
        .filter((t) => t.sourceType === 'mission')
        .reduce((sum, t) => sum + t.xpGain, 0),
      dailyTips: xpHistory
        .filter((t) => t.sourceType === 'daily_tip')
        .reduce((sum, t) => sum + t.xpGain, 0),
      grandeMissao: xpHistory
        .filter((t) => t.sourceType === 'grande_missao')
        .reduce((sum, t) => sum + t.xpGain, 0),
    };

    return res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        nickname: student.nickname,
        avatar: student.avatar,
        classId: student.classId,
        className: classroom ? classroom.name : 'Sem Turma',
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
      xpBreakdown,
      badges: badges.map((b) => {
        const catalogInfo = BADGES_CATALOG.find((cat) => cat.id === b.badgeId);
        return {
          id: b.id,
          badgeId: b.badgeId,
          name: catalogInfo ? catalogInfo.title : b.badgeId,
          description: catalogInfo ? catalogInfo.description : '',
          icon: catalogInfo ? catalogInfo.icon : 'Award',
          awardedAt: b.awardedAt,
        };
      }),
      xpHistory,
      dailyTipsCount: dailyTips.length,
      weeklyChallengesCompleted: weeklyChallenges.length,
      grandeMissao: grandeMissao || {
        currentStage: 1,
        completedStages: [],
        status: 'not_started',
      },
    });
  } catch (err) {
    console.error('Error in /students/:studentId:', err);
    return res.status(500).json({ error: 'Erro ao carregar dossiê pedagógico do aluno.' });
  }
});

// -------------------------------------------------------------
// 4. STUDENT CRUD & MANAGEMENT ACTIONS
// -------------------------------------------------------------
router.put('/students/:studentId', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const { nickname, avatar, classId, locale, mustChangePassword } = req.body;

    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const updates: Partial<User> = {};
    if (nickname) updates.nickname = nickname.trim();
    if (avatar) updates.avatar = avatar;
    if (classId) updates.classId = classId;
    if (locale) updates.locale = locale;
    if (typeof mustChangePassword === 'boolean') updates.mustChangePassword = mustChangePassword;

    await updateUser(studentId, updates);
    const updated = { ...student, ...updates };

    await logTeacherAction(req, 'Alteração de dados de aluno', student.id, student.name, {
      nickname,
      classId,
      locale,
      mustChangePassword,
    });

    return res.json({ success: true, student: updated });
  } catch (err) {
    console.error('Error in PUT /students/:studentId:', err);
    return res.status(500).json({ error: 'Erro ao atualizar dados do aluno.' });
  }
});

router.post('/students/:studentId/toggle-block', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const newBlocked = !student.blocked;
    await updateUser(studentId, { blocked: newBlocked });

    await logTeacherAction(
      req,
      newBlocked ? 'Bloqueio de conta' : 'Desbloqueio de conta',
      student.id,
      student.name
    );

    return res.json({ success: true, blocked: newBlocked });
  } catch (err) {
    console.error('Error in toggle-block:', err);
    return res.status(500).json({ error: 'Erro ao alterar estado de bloqueio.' });
  }
});

router.post('/students/:studentId/reset-password', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const { newPassword, requireChangeOnNextLogin } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova palavra-passe deve conter pelo menos 6 caracteres.' });
    }

    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const { hash, salt } = hashPassword(newPassword);
    await updateUser(studentId, {
      passwordHash: hash,
      passwordSalt: salt,
      mustChangePassword: requireChangeOnNextLogin ?? true,
    });

    await logTeacherAction(req, 'Redefinição de palavra-passe', student.id, student.name, {
      mustChangePassword: requireChangeOnNextLogin ?? true,
    });

    return res.json({
      success: true,
      message: 'Palavra-passe do aluno redefinida com sucesso no Cloud Firestore.',
    });
  } catch (err) {
    console.error('Error in reset-password:', err);
    return res.status(500).json({ error: 'Erro ao redefinir palavra-passe.' });
  }
});

router.post('/students/:studentId/reset-progress', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    await resetStudentProgressInFirestore(studentId);
    await logTeacherAction(req, 'Reinicialização de progresso pedagógico', student.id, student.name);

    return res.json({
      success: true,
      message: 'O progresso do aluno foi reiniciado para o estado inicial na nuvem com 100 XP base.',
    });
  } catch (err) {
    console.error('Error in reset-progress:', err);
    return res.status(500).json({ error: 'Erro ao reiniciar progresso do aluno.' });
  }
});

router.delete('/students/:studentId', async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const student = await getUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    await deleteUser(studentId);
    await logTeacherAction(req, 'Eliminação de conta de aluno', studentId, student.name);

    return res.json({ success: true, message: 'Conta de aluno eliminada com sucesso da nuvem.' });
  } catch (err) {
    console.error('Error in delete student:', err);
    return res.status(500).json({ error: 'Erro ao eliminar aluno.' });
  }
});

// -------------------------------------------------------------
// 5. CLASS MANAGEMENT (CRUD & STATS)
// -------------------------------------------------------------
router.get('/classes', async (req: AuthRequest, res) => {
  try {
    const [classes, allUsers, allMissions] = await Promise.all([
      getAllClasses(),
      getAllUsers(),
      getMissionSubmissions(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const result = await Promise.all(
      classes.map(async (c) => {
        const classStudents = students.filter((s) => s.classId === c.id);
        const totalCount = classStudents.length;
        const activeCount = classStudents.filter((s) => !s.blocked).length;
        const totalXP = classStudents.reduce((acc, s) => acc + s.xp, 0);
        const avgXP = totalCount > 0 ? Math.round(totalXP / totalCount) : 0;

        // Class averages per world
        const worldAverages = await Promise.all(
          [1, 2, 3, 4, 5].map(async (wId) => {
            let sum = 0;
            let count = 0;
            for (const s of classStudents) {
              const st = await computeWorldStats(s.id, wId);
              if (st.completedCount > 0) {
                sum += st.average;
                count++;
              }
            }
            return {
              worldId: wId,
              average: count > 0 ? Number((sum / count).toFixed(1)) : 0,
              studentsActive: count,
            };
          })
        );

        const pendingMissions = allMissions.filter(
          (m) => m.classId === c.id && m.status === 'pending'
        ).length;

        const studentsNeedingHelp = classStudents.filter((s) => s.needsHelp).length;

        return {
          id: c.id,
          name: c.name,
          code: c.code,
          createdAt: c.createdAt,
          totalStudents: totalCount,
          activeStudents: activeCount,
          avgXP,
          worldAverages,
          pendingMissions,
          studentsNeedingHelp,
        };
      })
    );

    return res.json({ classes: result });
  } catch (err) {
    console.error('Error in /classes:', err);
    return res.status(500).json({ error: 'Erro ao carregar turmas.' });
  }
});

router.post('/classes', async (req: AuthRequest, res) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome da turma é obrigatório.' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : '';

    const newClass: ClassRoom = {
      id: `class-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      code: cleanCode,
      createdAt: new Date().toISOString(),
    };

    await saveClass(newClass);
    await logTeacherAction(req, 'Criação de turma', undefined, undefined, {
      classId: newClass.id,
      name: newClass.name,
      code: newClass.code,
    });

    return res.status(201).json({ success: true, class: newClass });
  } catch (err) {
    console.error('Error in POST /classes:', err);
    return res.status(500).json({ error: 'Erro ao criar turma.' });
  }
});

router.put('/classes/:classId', async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;
    const { name, code } = req.body;

    const existing = await getClassById(classId);
    if (!existing) return res.status(404).json({ error: 'Turma não encontrada' });

    const updates: Partial<ClassRoom> = {};
    if (name) updates.name = name.trim();
    if (typeof code === 'string') {
      updates.code = code.trim().toUpperCase();
    }

    await updateClass(classId, updates);
    await logTeacherAction(req, 'Edição de turma', undefined, undefined, { classId, ...updates });

    return res.json({ success: true, class: { ...existing, ...updates } });
  } catch (err) {
    console.error('Error in PUT /classes/:classId:', err);
    return res.status(500).json({ error: 'Erro ao atualizar turma.' });
  }
});

router.delete('/classes/:classId', async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;
    const existing = await getClassById(classId);
    if (!existing) return res.status(404).json({ error: 'Turma não encontrada' });

    // Unassign students from this class
    const allUsers = await getAllUsers();
    const studentsInClass = allUsers.filter((u) => u.classId === classId);
    for (const s of studentsInClass) {
      await updateUser(s.id, { classId: '' });
    }

    await deleteClass(classId);
    await logTeacherAction(req, 'Eliminação de turma', undefined, undefined, {
      classId,
      name: existing.name,
      studentsUnassigned: studentsInClass.length,
    });

    return res.json({ success: true, message: 'Turma eliminada com sucesso.' });
  } catch (err) {
    console.error('Error in DELETE /classes/:classId:', err);
    return res.status(500).json({ error: 'Erro ao eliminar turma.' });
  }
});

// -------------------------------------------------------------
// 6. BULK MANAGEMENT OPERATIONS
// -------------------------------------------------------------
router.post('/bulk/move-class', async (req: AuthRequest, res) => {
  try {
    const { studentIds, targetClassId } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum aluno selecionado.' });
    }

    const targetClass = await getClassById(targetClassId);
    if (!targetClass) return res.status(404).json({ error: 'Turma de destino não encontrada.' });

    for (const sId of studentIds) {
      await updateUser(sId, { classId: targetClassId });
    }

    await logTeacherAction(req, 'Mudança de turma em massa', undefined, undefined, {
      studentCount: studentIds.length,
      targetClass: targetClass.name,
    });

    return res.json({
      success: true,
      message: `${studentIds.length} alunos transferidos para ${targetClass.name}.`,
    });
  } catch (err) {
    console.error('Error in /bulk/move-class:', err);
    return res.status(500).json({ error: 'Erro ao transferir alunos em massa.' });
  }
});

router.post('/bulk/block', async (req: AuthRequest, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum aluno selecionado.' });
    }

    for (const sId of studentIds) {
      await updateUser(sId, { blocked: true });
    }

    await logTeacherAction(req, 'Bloqueio em massa', undefined, undefined, {
      studentCount: studentIds.length,
    });

    return res.json({
      success: true,
      message: `${studentIds.length} alunos bloqueados com sucesso.`,
    });
  } catch (err) {
    console.error('Error in /bulk/block:', err);
    return res.status(500).json({ error: 'Erro ao bloquear alunos em massa.' });
  }
});

router.post('/bulk/unblock', async (req: AuthRequest, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum aluno selecionado.' });
    }

    for (const sId of studentIds) {
      await updateUser(sId, { blocked: false });
    }

    await logTeacherAction(req, 'Desbloqueio em massa', undefined, undefined, {
      studentCount: studentIds.length,
    });

    return res.json({
      success: true,
      message: `${studentIds.length} alunos desbloqueados com sucesso.`,
    });
  } catch (err) {
    console.error('Error in /bulk/unblock:', err);
    return res.status(500).json({ error: 'Erro ao desbloquear alunos em massa.' });
  }
});

router.post('/bulk/delete', async (req: AuthRequest, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum aluno selecionado.' });
    }

    for (const sId of studentIds) {
      await deleteUser(sId);
    }

    await logTeacherAction(req, 'Eliminação em massa', undefined, undefined, {
      studentCount: studentIds.length,
    });

    return res.json({
      success: true,
      message: `${studentIds.length} alunos eliminados permanentemente da plataforma.`,
    });
  } catch (err) {
    console.error('Error in /bulk/delete:', err);
    return res.status(500).json({ error: 'Erro ao eliminar alunos em massa.' });
  }
});

// -------------------------------------------------------------
// 7. CLEANUP & ACADEMIC YEAR RESET
// -------------------------------------------------------------
const handleResetClassProgress = async (req: AuthRequest, res: Response) => {
  try {
    const classId = req.params.classId || req.body.classId;
    if (!classId) return res.status(400).json({ error: 'Turma não especificada.' });

    const classroom = await getClassById(classId);
    if (!classroom) return res.status(404).json({ error: 'Turma não encontrada.' });

    const count = await resetClassStudentsProgress(classId);
    await logTeacherAction(req, 'Limpeza: Reset de progresso da turma', undefined, undefined, {
      classId,
      className: classroom.name,
      studentsReset: count,
    });

    return res.json({
      success: true,
      message: `Progresso pedagógico reiniciado para todos os ${count} alunos da turma ${classroom.name}.`,
    });
  } catch (err) {
    console.error('Error in reset-class-progress:', err);
    return res.status(500).json({ error: 'Erro ao reiniciar progresso da turma.' });
  }
};

router.post('/cleanup/reset-class-progress', handleResetClassProgress);
router.post('/classes/:classId/reset-progress', handleResetClassProgress);

const handleDeleteClassStudents = async (req: AuthRequest, res: Response) => {
  try {
    const classId = req.params.classId || req.body.classId;
    if (!classId) return res.status(400).json({ error: 'Turma não especificada.' });

    const classroom = await getClassById(classId);
    if (!classroom) return res.status(404).json({ error: 'Turma não encontrada.' });

    const count = await deleteClassStudents(classId);
    await logTeacherAction(req, 'Limpeza: Eliminação de alunos da turma', undefined, undefined, {
      classId,
      className: classroom.name,
      studentsDeleted: count,
    });

    return res.json({
      success: true,
      message: `Todos os ${count} alunos da turma ${classroom.name} foram eliminados com sucesso.`,
    });
  } catch (err) {
    console.error('Error in delete-class-students:', err);
    return res.status(500).json({ error: 'Erro ao eliminar alunos da turma.' });
  }
};

router.post('/cleanup/delete-class-students', handleDeleteClassStudents);
router.delete('/classes/:classId/students', handleDeleteClassStudents);
router.post('/classes/:classId/students/delete', handleDeleteClassStudents);

const handleResetAllStudentsProgress = async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await getAllUsers();
    const students = allUsers.filter((u) => u.role === 'student');

    for (const s of students) {
      await resetStudentProgressInFirestore(s.id);
    }

    await logTeacherAction(
      req,
      'Preparação de Novo Ano Letivo: Reset global de progresso',
      undefined,
      undefined,
      { studentCount: students.length }
    );

    return res.json({
      success: true,
      message: `Preparação para Novo Ano Letivo concluída: progresso reiniciado para ${students.length} alunos.`,
    });
  } catch (err) {
    console.error('Error in reset-all-students-progress:', err);
    return res.status(500).json({ error: 'Erro ao reiniciar progresso global.' });
  }
};

router.post('/cleanup/reset-all-students-progress', handleResetAllStudentsProgress);
router.post('/platform/reset-all-students-progress', handleResetAllStudentsProgress);

// -------------------------------------------------------------
// 8. REAL MISSIONS GRADING & MANAGEMENT
// -------------------------------------------------------------
router.get('/missions', async (req: AuthRequest, res) => {
  try {
    const { status, worldId, classId } = req.query;
    const filter: { status?: 'pending' | 'graded'; worldId?: number; classId?: string } = {};
    if (status === 'pending' || status === 'graded') filter.status = status;
    if (worldId && worldId !== 'all') filter.worldId = parseInt(worldId as string, 10);
    if (classId && classId !== 'all') filter.classId = classId as string;

    const [missions, allUsers, classes] = await Promise.all([
      getMissionSubmissions(filter),
      getAllUsers(),
      getAllClasses(),
    ]);

    const result = missions.map((m) => {
      const student = allUsers.find((u) => u.id === m.userId);
      const classroom = student ? classes.find((c) => c.id === student.classId) : null;
      return {
        ...m,
        studentName: student ? student.name : m.studentName || 'Aluno',
        studentNickname: student ? student.nickname : m.studentNickname || '',
        studentAvatar: student ? student.avatar : 'avatar-boy-1',
        className: classroom ? classroom.name : 'Sem Turma',
      };
    });

    return res.json({ missions: result });
  } catch (err) {
    console.error('Error in /missions:', err);
    return res.status(500).json({ error: 'Erro ao carregar submissões de missões.' });
  }
});

router.post('/missions/:submissionId/grade', async (req: AuthRequest, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'A classificação deve ser um número entre 0 e 100.' });
    }

    const submission = await getMissionSubmissionById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

    // Authorization: Teachers assigned to a specific class can only grade their class
    if (req.user!.classId && submission.classId && req.user!.classId !== submission.classId) {
      return res.status(403).json({ error: 'Não tens autorização para avaliar alunos de outra turma.' });
    }

    const student = await getUserById(submission.userId);
    if (!student) return res.status(404).json({ error: 'Aluno associado não encontrado.' });

    const prevScore = submission.score || 0;
    const normalizedScore = Math.round(score);

    const now = new Date().toISOString();
    submission.score = normalizedScore;
    submission.feedback = feedback ? feedback.trim() : '';
    submission.status = 'graded';
    submission.gradedBy = req.user!.name;
    submission.gradedAt = now;
    submission.updatedAt = now;
    submission.submissionText = submission.submissionText || submission.submission;

    await saveMissionSubmission(submission);

    const newBest = Math.max(prevScore, normalizedScore);
    const xpGain = newBest - prevScore;

    if (xpGain > 0) {
      await atomicAwardXP(student.id, xpGain, {
        sourceType: 'mission',
        sourceId: submission.missionId,
        previousBest: prevScore,
        newBest,
      });
    }

    await logTeacherAction(req, 'Correção de Missão Real', student.id, student.name, {
      missionId: submission.missionId,
      score: normalizedScore,
      xpGain,
    });

    return res.json({
      success: true,
      message: 'Missão avaliada com sucesso e XP atribuído ao aluno!',
      submission,
    });
  } catch (err) {
    console.error('Error in /missions/:submissionId/grade:', err);
    return res.status(500).json({ error: 'Erro ao avaliar missão.' });
  }
});

// -------------------------------------------------------------
// 9. ASSESSMENTS SUMMARY
// -------------------------------------------------------------
router.get('/assessments-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allAssessments] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAssessmentAttempts('all'),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const worldsAssessments = WORLDS_DATA.map((w) => {
      const assessConfig = FINAL_ASSESSMENTS[w.id];
      const worldAttempts = allAssessments.filter((a) => a.worldId === w.id);

      const studentResults = students.map((s) => {
        const studentAttempts = worldAttempts.filter((a) => a.userId === s.id);
        const bestAttempt =
          studentAttempts.length > 0
            ? studentAttempts.reduce((max, a) => (a.percentage > max.percentage ? a : max))
            : null;
        const classroom = classes.find((c) => c.id === s.classId);

        return {
          studentId: s.id,
          studentName: s.name,
          studentNickname: s.nickname,
          className: classroom ? classroom.name : 'Sem Turma',
          hasAttempted: studentAttempts.length > 0,
          attemptsCount: studentAttempts.length,
          bestPercentage: bestAttempt ? bestAttempt.percentage : null,
          passed: bestAttempt ? bestAttempt.percentage >= PROGRESSION_CONFIG.PASSING_THRESHOLD : false,
          lastAttemptAt: bestAttempt ? bestAttempt.createdAt : null,
        };
      });

      const attemptedStudents = studentResults.filter((r) => r.hasAttempted);
      const passedStudents = studentResults.filter((r) => r.passed);
      const avgScore =
        attemptedStudents.length > 0
          ? Math.round(
              attemptedStudents.reduce((acc, r) => acc + (r.bestPercentage || 0), 0) /
                attemptedStudents.length
            )
          : 0;

      return {
        worldId: w.id,
        worldTitle: w.title,
        assessmentTitle: assessConfig ? assessConfig.title : `Avaliação Mundo ${w.id}`,
        totalQuestions: assessConfig ? assessConfig.questions.length : 8,
        totalAttempted: attemptedStudents.length,
        totalPassed: passedStudents.length,
        totalPending: students.length - attemptedStudents.length,
        averageScore: avgScore,
        students: studentResults,
      };
    });

    return res.json({ worldsAssessments });
  } catch (err) {
    console.error('Error in /assessments-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar resumo de avaliações.' });
  }
});

// -------------------------------------------------------------
// 10. ACTIVITIES & SIMULATORS SUMMARY
// -------------------------------------------------------------
router.get('/activities-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allProgress] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllActivityProgress(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const worldsActivities = WORLDS_DATA.map((w) => {
      const sims = w.simulators.map((s) => {
        const studentStats = students.map((st) => {
          const prog = allProgress.find((p) => p.userId === st.id && p.activityId === s.id);
          const classroom = classes.find((c) => c.id === st.classId);
          return {
            studentId: st.id,
            studentName: st.name,
            studentNickname: st.nickname,
            className: classroom ? classroom.name : 'Sem Turma',
            completed: prog ? prog.completed : false,
            bestScore: prog ? prog.bestScore : 0,
            attempts: prog ? prog.attempts : 0,
            lastAttemptAt: prog ? prog.lastAttemptAt : null,
          };
        });

        const completedCount = studentStats.filter((r) => r.completed).length;
        const avgScore =
          completedCount > 0
            ? Math.round(
                studentStats.filter((r) => r.completed).reduce((acc, r) => acc + r.bestScore, 0) /
                  completedCount
              )
            : 0;

        return {
          id: s.id,
          title: s.name,
          description: s.description,
          xpReward: s.xpReward,
          completedCount,
          pendingCount: students.length - completedCount,
          averageScore: avgScore,
          students: studentStats,
        };
      });

      return {
        worldId: w.id,
        worldTitle: w.title,
        activities: sims,
      };
    });

    return res.json({ worldsActivities });
  } catch (err) {
    console.error('Error in /activities-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar resumo de atividades.' });
  }
});

// -------------------------------------------------------------
// 11. CHALLENGES & WEEKLY CHALLENGES SUMMARY
// -------------------------------------------------------------
router.get('/challenges-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allProgress, allWeekly] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllActivityProgress(),
      getAllWeeklyChallenges(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    // World challenges
    const worldChallenges = WORLDS_DATA.map((w) => {
      const ch = w.challenge;
      const studentStats = students.map((st) => {
        const prog = allProgress.find((p) => p.userId === st.id && p.activityId === ch.id);
        const classroom = classes.find((c) => c.id === st.classId);
        return {
          studentId: st.id,
          studentName: st.name,
          studentNickname: st.nickname,
          className: classroom ? classroom.name : 'Sem Turma',
          completed: prog ? prog.completed : false,
          bestScore: prog ? prog.bestScore : 0,
          attempts: prog ? prog.attempts : 0,
          lastAttemptAt: prog ? prog.lastAttemptAt : null,
        };
      });

      const completedCount = studentStats.filter((r) => r.completed).length;

      return {
        worldId: w.id,
        worldTitle: w.title,
        id: ch.id,
        title: ch.title,
        xpReward: ch.xpReward,
        completedCount,
        pendingCount: students.length - completedCount,
        students: studentStats,
      };
    });

    // Weekly Challenge
    const weeklyStats = students.map((st) => {
      const prog = allWeekly.find((p) => p.userId === st.id && p.challengeId === WEEKLY_CHALLENGE.id);
      const classroom = classes.find((c) => c.id === st.classId);
      return {
        studentId: st.id,
        studentName: st.name,
        studentNickname: st.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        completed: !!prog,
        score: prog ? prog.score : 0,
        completedAt: prog ? prog.completedAt : null,
      };
    });

    return res.json({
      worldChallenges,
      weeklyChallenge: {
        id: WEEKLY_CHALLENGE.id,
        title: WEEKLY_CHALLENGE.title,
        task: WEEKLY_CHALLENGE.task,
        xpReward: WEEKLY_CHALLENGE.xpReward,
        totalCompleted: weeklyStats.filter((r) => r.completed).length,
        students: weeklyStats,
      },
    });
  } catch (err) {
    console.error('Error in /challenges-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar resumo de desafios.' });
  }
});

// -------------------------------------------------------------
// 12. XP BREAKDOWN & AUDIT
// -------------------------------------------------------------
router.get('/xp-breakdown', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allTransactions] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllXPTransactions(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const studentsBreakdown = students.map((s) => {
      const txs = allTransactions.filter((t) => t.userId === s.id);
      const classroom = classes.find((c) => c.id === s.classId);
      const levelInfo = calculateLevel(s.xp);

      return {
        studentId: s.id,
        studentName: s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        totalXP: s.xp,
        level: levelInfo.level,
        levelName: levelInfo.name,
        sources: {
          initial: 100,
          activities: txs
            .filter((t) => t.sourceType === 'activity')
            .reduce((sum, t) => sum + t.xpGain, 0),
          challenges: txs
            .filter((t) => t.sourceType === 'challenge')
            .reduce((sum, t) => sum + t.xpGain, 0),
          assessments: txs
            .filter((t) => t.sourceType === 'assessment')
            .reduce((sum, t) => sum + t.xpGain, 0),
          missions: txs
            .filter((t) => t.sourceType === 'mission')
            .reduce((sum, t) => sum + t.xpGain, 0),
          dailyTips: txs
            .filter((t) => t.sourceType === 'daily_tip')
            .reduce((sum, t) => sum + t.xpGain, 0),
          grandeMissao: txs
            .filter((t) => t.sourceType === 'grande_missao')
            .reduce((sum, t) => sum + t.xpGain, 0),
        },
      };
    });

    return res.json({
      studentsBreakdown,
      latestTransactions: allTransactions.slice(0, 50).map((t) => {
        const student = allUsers.find((u) => u.id === t.userId);
        return {
          ...t,
          studentName: student ? student.name : 'Aluno',
          studentNickname: student ? student.nickname : '',
        };
      }),
    });
  } catch (err) {
    console.error('Error in /xp-breakdown:', err);
    return res.status(500).json({ error: 'Erro ao carregar extrato de XP.' });
  }
});

// -------------------------------------------------------------
// 13. GRANDE MISSÃO PROGRESS SUMMARY
// -------------------------------------------------------------
router.get('/grande-missao-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allGM] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllGrandeMissaoProgress(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const studentResults = students.map((s) => {
      const gm = allGM.find((g) => g.userId === s.id);
      const classroom = classes.find((c) => c.id === s.classId);

      return {
        studentId: s.id,
        studentName: s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        status: gm ? gm.status : 'not_started',
        currentStage: gm ? gm.currentStage : 1,
        completedStages: gm ? gm.completedStages : [],
        completedAt: gm ? gm.completedAt : null,
      };
    });

    return res.json({
      config: GRANDE_MISSAO,
      totalCompleted: studentResults.filter((s) => s.status === 'completed').length,
      totalInProgress: studentResults.filter((s) => s.status === 'in_progress').length,
      totalNotStarted: studentResults.filter((s) => s.status === 'not_started').length,
      students: studentResults,
    });
  } catch (err) {
    console.error('Error in /grande-missao-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar progresso da Grande Missão.' });
  }
});

// -------------------------------------------------------------
// 14. BADGES / CONQUISTAS SUMMARY
// -------------------------------------------------------------
router.get('/badges-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allBadges] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllBadges(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const badgesSummary = BADGES_CATALOG.map((b) => {
      const owned = allBadges.filter((ub) => ub.badgeId === b.id);
      return {
        ...b,
        unlockedCount: owned.length,
        percentage: students.length > 0 ? Math.round((owned.length / students.length) * 100) : 0,
      };
    });

    const studentsBadges = students.map((s) => {
      const classroom = classes.find((c) => c.id === s.classId);
      const userBadges = allBadges.filter((b) => b.userId === s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        badgeCount: userBadges.length,
        badges: userBadges.map((b) => {
          const cat = BADGES_CATALOG.find((c) => c.id === b.badgeId);
          return {
            id: b.id,
            badgeId: b.badgeId,
            name: cat ? cat.title : b.badgeId,
            awardedAt: b.awardedAt,
          };
        }),
      };
    });

    return res.json({ badgesCatalog: badgesSummary, studentsBadges });
  } catch (err) {
    console.error('Error in /badges-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar resumo de conquistas.' });
  }
});

// -------------------------------------------------------------
// 15. DAILY TIPS PARTICIPATION
// -------------------------------------------------------------
router.get('/daily-tips-summary', async (req: AuthRequest, res) => {
  try {
    const [allUsers, classes, allClaims] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllDailyTipClaims(),
    ]);

    const students = allUsers.filter((u) => u.role === 'student');

    const studentStats = students.map((s) => {
      const claims = allClaims.filter((c) => c.userId === s.id);
      const classroom = classes.find((c) => c.id === s.classId);
      return {
        studentId: s.id,
        studentName: s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        totalClaims: claims.length,
        lastClaimAt: claims.length > 0 ? claims[claims.length - 1].claimedAt : null,
      };
    });

    return res.json({
      totalTipsInCatalog: DAILY_TIPS.length,
      studentStats,
    });
  } catch (err) {
    console.error('Error in /daily-tips-summary:', err);
    return res.status(500).json({ error: 'Erro ao carregar resumo de dicas diárias.' });
  }
});

// -------------------------------------------------------------
// 16. AUDIT LOGS
// -------------------------------------------------------------
router.get('/audit-logs', async (req: AuthRequest, res) => {
  try {
    const logs = await getAuditLogs();
    return res.json({ auditLogs: logs });
  } catch (err) {
    console.error('Error in /audit-logs:', err);
    return res.status(500).json({ error: 'Erro ao carregar registos de auditoria.' });
  }
});

// -------------------------------------------------------------
// 17. EXPORT DATA (CSV & XLSX)
// -------------------------------------------------------------
router.get(['/export/csv', '/export/pauta-csv'], async (req: AuthRequest, res: Response) => {
  try {
    const { type, classId } = req.query;
    const [allUsers, classes, allAssessments, allMissions] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAssessmentAttempts('all'),
      getMissionSubmissions(),
    ]);

    let students = allUsers.filter((u) => u.role === 'student');
    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    let csv =
      'Nickname,Nome Completo,Email,Turma,Nivel,XP Total,Media M1 (%),Media M2 (%),Media M3 (%),Media M4 (%),Media M5 (%),Media Global (%),Desbloqueados,Apoio Necessario,Data Registo\n';

    for (const s of students) {
      const levelInfo = calculateLevel(s.xp);
      const classroom = classes.find((c) => c.id === s.classId);
      const m1 = (await computeWorldStats(s.id, 1)).average;
      const m2 = (await computeWorldStats(s.id, 2)).average;
      const m3 = (await computeWorldStats(s.id, 3)).average;
      const m4 = (await computeWorldStats(s.id, 4)).average;
      const m5 = (await computeWorldStats(s.id, 5)).average;

      const completed = [m1, m2, m3, m4, m5].filter((m) => m > 0);
      const globalAvg =
        completed.length > 0
          ? Number((completed.reduce((a, b) => a + b, 0) / completed.length).toFixed(1))
          : 0;

      let unlockedCount = 1;
      const th = PROGRESSION_CONFIG.PASSING_THRESHOLD;
      if (m1 >= th) unlockedCount = 2;
      if (m1 >= th && m2 >= th) unlockedCount = 3;
      if (m1 >= th && m2 >= th && m3 >= th) unlockedCount = 4;
      if (m1 >= th && m2 >= th && m3 >= th && m4 >= th) unlockedCount = 5;

      const failedAttempts = allAssessments.filter((a) => a.userId === s.id && a.percentage < 50).length;
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
        globalAvg,
        unlockedCount,
        needsHelp,
        `"${new Date(s.createdAt).toLocaleDateString('pt-PT')}"`,
      ];
      csv += row.join(',') + '\n';
    }

    await logTeacherAction(req, 'Exportação de Relatório CSV', undefined, undefined, {
      type: type || 'pauta_geral',
      studentCount: students.length,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="missao_tic_pauta_geral.csv"');
    return res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('Error in /export/csv:', err);
    return res.status(500).json({ error: 'Erro ao exportar CSV.' });
  }
});

router.get('/export/xlsx', async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.query;
    const [
      allUsers,
      classes,
      allAssessments,
      allMissions,
      allProgress,
      allBadges,
      allGM,
      allXPTransactions,
    ] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAssessmentAttempts('all'),
      getMissionSubmissions(),
      getAllActivityProgress(),
      getAllBadges(),
      getAllGrandeMissaoProgress(),
      getAllXPTransactions(),
    ]);

    let students = allUsers.filter((u) => u.role === 'student');
    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Pauta Geral
    const pautaRows = [];
    for (const s of students) {
      const levelInfo = calculateLevel(s.xp);
      const classroom = classes.find((c) => c.id === s.classId);
      const m1 = (await computeWorldStats(s.id, 1)).average;
      const m2 = (await computeWorldStats(s.id, 2)).average;
      const m3 = (await computeWorldStats(s.id, 3)).average;
      const m4 = (await computeWorldStats(s.id, 4)).average;
      const m5 = (await computeWorldStats(s.id, 5)).average;
      const completed = [m1, m2, m3, m4, m5].filter((m) => m > 0);
      const globalAvg =
        completed.length > 0
          ? Number((completed.reduce((a, b) => a + b, 0) / completed.length).toFixed(1))
          : 0;

      let unlockedCount = 1;
      const th = PROGRESSION_CONFIG.PASSING_THRESHOLD;
      if (m1 >= th) unlockedCount = 2;
      if (m1 >= th && m2 >= th) unlockedCount = 3;
      if (m1 >= th && m2 >= th && m3 >= th) unlockedCount = 4;
      if (m1 >= th && m2 >= th && m3 >= th && m4 >= th) unlockedCount = 5;

      pautaRows.push({
        'Nickname': s.nickname,
        'Nome Completo': s.name,
        'Email': s.email,
        'Turma': classroom ? classroom.name : 'Sem Turma',
        'Nível': `${levelInfo.level} - ${levelInfo.name}`,
        'XP Total': s.xp,
        'Média Mundo 1 (%)': m1,
        'Média Mundo 2 (%)': m2,
        'Média Mundo 3 (%)': m3,
        'Média Mundo 4 (%)': m4,
        'Média Mundo 5 (%)': m5,
        'Média Global (%)': globalAvg,
        'Mundos Desbloqueados': unlockedCount,
        'Conta Bloqueada': s.blocked ? 'Sim' : 'Não',
        'Data Registo': new Date(s.createdAt).toLocaleDateString('pt-PT'),
      });
    }
    const wsPauta = XLSX.utils.json_to_sheet(pautaRows);
    XLSX.utils.book_append_sheet(wb, wsPauta, 'Pauta Geral');

    // Sheet 2: Avaliações
    const assessRows = allAssessments.map((a) => {
      const student = allUsers.find((u) => u.id === a.userId);
      const classroom = student ? classes.find((c) => c.id === student.classId) : null;
      return {
        'Aluno': student ? student.name : 'Aluno',
        'Nickname': student ? student.nickname : '',
        'Turma': classroom ? classroom.name : '',
        'Mundo': a.worldId,
        'Pontuação (Questões)': a.score,
        'Percentagem (%)': a.percentage,
        'Aprovado (>=75%)': a.percentage >= PROGRESSION_CONFIG.PASSING_THRESHOLD ? 'Sim' : 'Não',
        'Data': new Date(a.createdAt).toLocaleString('pt-PT'),
      };
    });
    const wsAssess = XLSX.utils.json_to_sheet(assessRows);
    XLSX.utils.book_append_sheet(wb, wsAssess, 'Avaliações Finais');

    // Sheet 3: Missões Reais
    const missionRows = allMissions.map((m) => {
      const student = allUsers.find((u) => u.id === m.userId);
      const classroom = student ? classes.find((c) => c.id === student.classId) : null;
      return {
        'Aluno': student ? student.name : m.studentName || 'Aluno',
        'Turma': classroom ? classroom.name : '',
        'Mundo': m.worldId,
        'Título da Missão': m.title,
        'Estado': m.status === 'graded' ? 'Corrigida' : 'Pendente',
        'Nota (0-100)': m.score,
        'Feedback': m.feedback || '',
        'Data Submissão': new Date(m.submittedAt).toLocaleString('pt-PT'),
        'Avaliador': m.gradedBy || '',
      };
    });
    const wsMissions = XLSX.utils.json_to_sheet(missionRows);
    XLSX.utils.book_append_sheet(wb, wsMissions, 'Missões Reais');

    // Sheet 4: Conquistas & Badges
    const badgeRows = allBadges.map((b) => {
      const student = allUsers.find((u) => u.id === b.userId);
      const classroom = student ? classes.find((c) => c.id === student.classId) : null;
      const cat = BADGES_CATALOG.find((c) => c.id === b.badgeId);
      return {
        'Aluno': student ? student.name : 'Aluno',
        'Turma': classroom ? classroom.name : '',
        'Emblema': cat ? cat.title : b.badgeId,
        'Descrição': cat ? cat.description : '',
        'Data Atribuição': new Date(b.awardedAt).toLocaleString('pt-PT'),
      };
    });
    const wsBadges = XLSX.utils.json_to_sheet(badgeRows);
    XLSX.utils.book_append_sheet(wb, wsBadges, 'Emblemas e Conquistas');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    await logTeacherAction(req, 'Exportação de Relatório Excel (XLSX)', undefined, undefined, {
      studentCount: students.length,
      sheetsCount: 4,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="missao_tic_relatorio_completo.xlsx"');
    return res.send(buf);
  } catch (err) {
    console.error('Error in /export/xlsx:', err);
    return res.status(500).json({ error: 'Erro ao exportar relatório Excel.' });
  }
});

export default router;
