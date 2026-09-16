import { Router } from 'express';
import crypto from 'crypto';
import { getDb, saveDb, ActivityProgress, AssessmentAttempt, MissionSubmission, XPTransaction, UserBadge } from '../db';
import { AuthRequest, requireAuth } from '../auth';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  calculateLevel,
  BADGES_CATALOG,
} from '../catalog';

const router = Router();

// Helper to compute world average strictly for user
export function computeWorldStats(userId: string, worldId: number) {
  const db = getDb();
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) return { average: 0, completedCount: 0, totalComponents: 0, isUnlocked: false };

  // Evaluated components in this world:
  // 1. Simulators
  // 2. Challenge
  // 3. Mission (if graded)
  // 4. Final Assessment (best percentage)
  const scores: number[] = [];

  // Simulators
  for (const sim of world.simulators) {
    const prog = db.activityProgress.find((p) => p.userId === userId && p.activityId === sim.id);
    if (prog && prog.completed) {
      scores.push(prog.bestScore);
    }
  }

  // Challenge
  const chalProg = db.activityProgress.find((p) => p.userId === userId && p.activityId === world.challenge.id);
  if (chalProg && chalProg.completed) {
    scores.push(chalProg.bestScore);
  }

  // Real Mission
  const mission = db.missionSubmissions.find(
    (m) => m.userId === userId && m.worldId === worldId && m.status === 'graded'
  );
  if (mission) {
    scores.push(mission.score);
  }

  // Final Assessment
  const assessmentAttempts = db.assessmentAttempts.filter((a) => a.userId === userId && a.worldId === worldId);
  if (assessmentAttempts.length > 0) {
    const bestAssess = Math.max(...assessmentAttempts.map((a) => a.percentage));
    scores.push(bestAssess);
  }

  const average = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;
  const totalComponents = world.simulators.length + 3; // sims + challenge + mission + assessment
  const completedCount = scores.length;

  // Progression rule:
  // Mundo 1 is unlocked initially
  // Mundo N (N > 1) is unlocked ONLY IF previous world average > 65
  let isUnlocked = worldId === 1;
  if (worldId > 1) {
    const prevStats = computeWorldStats(userId, worldId - 1);
    isUnlocked = prevStats.average > 65; // Strict inequality: 65 does NOT unlock, 65.1 unlocks!
  }

  return {
    worldId,
    average,
    completedCount,
    totalComponents,
    isUnlocked,
    hasAssessmentPassed: assessmentAttempts.some((a) => a.percentage >= 65),
  };
}

// Award badge if not already owned
export function checkAndAwardBadge(userId: string, badgeId: string) {
  const db = getDb();
  if (db.badges.some((b) => b.userId === userId && b.badgeId === badgeId)) {
    return false;
  }
  db.badges.push({
    id: `b-${crypto.randomUUID()}`,
    userId,
    badgeId,
    awardedAt: new Date().toISOString(),
  });
  return true;
}

// Check and award world badges or centurion badge
export function evaluateBadges(userId: string) {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;

  // World badges
  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };

  for (let w = 1; w <= 5; w++) {
    const stats = computeWorldStats(userId, w);
    if (stats.average > 65 && stats.completedCount >= 3) {
      checkAndAwardBadge(userId, worldBadgeMap[w]);
    }
  }

  // Centurion: >= 1000 XP or 100% in an assessment
  const has100Assess = db.assessmentAttempts.some((a) => a.userId === userId && a.percentage === 100);
  if (user.xp >= 1000 || has100Assess) {
    checkAndAwardBadge(userId, 'centuriao-digital');
  }

  // Master: Grande Missão completed + all 5 worlds average > 65
  const hasGM = db.xpTransactions.some((t) => t.userId === userId && t.sourceType === 'grande_missao');
  const allUnlocked = [1, 2, 3, 4, 5].every((w) => computeWorldStats(userId, w).average > 65);
  if (hasGM && allUnlocked) {
    checkAndAwardBadge(userId, 'mestre-da-missao-tic');
  }

  saveDb(db);
}

// GET all Worlds with student progression status
router.get('/worlds', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const db = getDb();

  const worlds = WORLDS_DATA.map((w) => {
    const stats = computeWorldStats(userId, w.id);
    const mission = db.missionSubmissions.find((m) => m.userId === userId && m.worldId === w.id);
    const chalProg = db.activityProgress.find((p) => p.userId === userId && p.activityId === w.challenge.id);
    const assessmentAttempts = db.assessmentAttempts.filter((a) => a.userId === userId && a.worldId === w.id);

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
        assessmentAttempts.length > 0 ? Math.max(...assessmentAttempts.map((a) => a.percentage)) : null,
      simulatorsProgress: w.simulators.map((s) => {
        const prog = db.activityProgress.find((p) => p.userId === userId && p.activityId === s.id);
        return {
          id: s.id,
          completed: prog ? prog.completed : false,
          score: prog ? prog.bestScore : 0,
        };
      }),
    };
  });

  return res.json({ worlds });
});

// GET specific World details
router.get('/worlds/:worldId', requireAuth, (req: AuthRequest, res) => {
  const worldId = parseInt(req.params.worldId, 10);
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

  const userId = req.user!.id;
  const stats = computeWorldStats(userId, worldId);
  const db = getDb();

  const mission = db.missionSubmissions.find((m) => m.userId === userId && m.worldId === worldId);
  const chalProg = db.activityProgress.find((p) => p.userId === userId && p.activityId === world.challenge.id);
  const assessmentAttempts = db.assessmentAttempts.filter((a) => a.userId === userId && a.worldId === worldId);

  return res.json({
    world,
    stats,
    mission,
    challengeProgress: chalProg,
    assessmentAttempts: assessmentAttempts.map((a) => ({
      id: a.id,
      score: a.score,
      percentage: a.percentage,
      createdAt: a.createdAt,
    })),
  });
});

// GET assessment questions for a World (WITHOUT CORRECT ANSWERS!)
router.get('/assessments/:worldId', requireAuth, (req: AuthRequest, res) => {
  const worldId = parseInt(req.params.worldId, 10);
  const assess = FINAL_ASSESSMENTS[worldId];
  if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada' });

  const stats = computeWorldStats(req.user!.id, worldId);
  if (!stats.isUnlocked) {
    return res.status(403).json({ error: 'Este Mundo ainda está bloqueado. Completa o Mundo anterior com média > 65%.' });
  }

  // Strip correctIndex and explanation from payload!
  const sanitizedQuestions = assess.questions.map((q, idx) => ({
    id: q.id,
    number: idx + 1,
    text: q.text,
    options: q.options,
  }));

  return res.json({
    id: assess.id,
    worldId: assess.worldId,
    title: assess.title,
    questionCount: sanitizedQuestions.length,
    questions: sanitizedQuestions,
  });
});

// POST submit assessment
router.post('/assessments/:worldId', requireAuth, (req: AuthRequest, res) => {
  const worldId = parseInt(req.params.worldId, 10);
  const assess = FINAL_ASSESSMENTS[worldId];
  if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada' });

  const userId = req.user!.id;
  const stats = computeWorldStats(userId, worldId);
  if (!stats.isUnlocked) {
    return res.status(403).json({ error: 'Mundo bloqueado. Não é permitido submeter avaliações de Mundos bloqueados.' });
  }

  const { answers } = req.body; // map of questionId -> selectedIndex
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Respostas inválidas.' });
  }

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

  const db = getDb();
  const dbUser = db.users.find((u) => u.id === userId)!;

  // Record attempt
  const attempt: AssessmentAttempt = {
    id: `attempt-${crypto.randomUUID()}`,
    userId,
    assessmentId: assess.id,
    worldId,
    score: correctCount,
    percentage,
    answers,
    createdAt: new Date().toISOString(),
  };
  db.assessmentAttempts.push(attempt);

  // Official XP Rule:
  // newBest = max(previousBest, currentScore)
  // xpGain = newBest - previousBest
  const prevAttempts = db.assessmentAttempts.filter(
    (a) => a.userId === userId && a.worldId === worldId && a.id !== attempt.id
  );
  const previousBest = prevAttempts.length > 0 ? Math.max(...prevAttempts.map((a) => a.percentage)) : 0;
  const newBest = Math.max(previousBest, percentage);
  const xpGain = newBest - previousBest;

  if (xpGain > 0) {
    dbUser.xp += xpGain;
    db.xpTransactions.push({
      id: `xp-assess-${crypto.randomUUID()}`,
      userId,
      sourceType: 'assessment',
      sourceId: assess.id,
      previousBest,
      newBest,
      xpGain,
      createdAt: new Date().toISOString(),
    });
  }

  saveDb(db);
  evaluateBadges(userId);

  return res.json({
    percentage,
    correctCount,
    totalQuestions: assess.questions.length,
    passed: percentage > 65,
    previousBest,
    newBest,
    xpGain,
    totalXp: dbUser.xp,
    resultsFeedback,
  });
});

// POST submit activity / simulator completion
router.post('/activities/complete', requireAuth, (req: AuthRequest, res) => {
  const { activityId, worldId, score } = req.body;
  if (!activityId || !worldId || typeof score !== 'number') {
    return res.status(400).json({ error: 'Dados da atividade inválidos.' });
  }

  const userId = req.user!.id;
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) return res.status(404).json({ error: 'Mundo inexistente' });

  // Verify activity is in canonical catalog!
  const isSimulator = world.simulators.some((s) => s.id === activityId);
  const isChallenge = world.challenge.id === activityId;
  if (!isSimulator && !isChallenge) {
    return res.status(400).json({ error: 'Atividade não reconhecida no catálogo canónico.' });
  }

  const stats = computeWorldStats(userId, worldId);
  if (!stats.isUnlocked) {
    return res.status(403).json({ error: 'Mundo bloqueado.' });
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const db = getDb();
  const dbUser = db.users.find((u) => u.id === userId)!;

  let prog = db.activityProgress.find((p) => p.userId === userId && p.activityId === activityId);
  const previousBest = prog ? prog.bestScore : 0;
  const newBest = Math.max(previousBest, normalizedScore);
  const xpGain = newBest - previousBest;

  if (!prog) {
    prog = {
      id: `prog-${crypto.randomUUID()}`,
      userId,
      activityId,
      worldId,
      bestScore: newBest,
      attempts: 1,
      completed: true,
      firstCompletedAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
    };
    db.activityProgress.push(prog);
  } else {
    prog.attempts += 1;
    prog.completed = true;
    prog.bestScore = newBest;
    prog.lastAttemptAt = new Date().toISOString();
  }

  if (xpGain > 0) {
    dbUser.xp += xpGain;
    db.xpTransactions.push({
      id: `xp-act-${crypto.randomUUID()}`,
      userId,
      sourceType: isChallenge ? 'challenge' : 'activity',
      sourceId: activityId,
      previousBest,
      newBest,
      xpGain,
      createdAt: new Date().toISOString(),
    });
  }

  saveDb(db);
  evaluateBadges(userId);

  return res.json({
    activityId,
    previousBest,
    newBest,
    xpGain,
    totalXp: dbUser.xp,
    score: normalizedScore,
  });
});

// POST submit Real Mission
router.post('/missions/:worldId', requireAuth, (req: AuthRequest, res) => {
  const worldId = parseInt(req.params.worldId, 10);
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

  const userId = req.user!.id;
  const stats = computeWorldStats(userId, worldId);
  if (!stats.isUnlocked) {
    return res.status(403).json({ error: 'Mundo bloqueado.' });
  }

  const { submission } = req.body;
  if (!submission || submission.trim().length < 20) {
    return res.status(400).json({ error: 'A submissão deve conter uma resposta detalhada (mínimo 20 caracteres).' });
  }

  const db = getDb();
  const existing = db.missionSubmissions.find((m) => m.userId === userId && m.worldId === worldId);

  if (existing) {
    existing.submission = submission.trim();
    existing.status = 'pending';
    existing.submittedAt = new Date().toISOString();
  } else {
    const newSubmission: MissionSubmission = {
      id: `mis-${crypto.randomUUID()}`,
      userId,
      studentName: req.user!.name,
      studentNickname: req.user!.nickname,
      classId: req.user!.classId,
      missionId: world.mission.id,
      worldId,
      title: world.mission.title,
      submission: submission.trim(),
      score: 0,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    db.missionSubmissions.push(newSubmission);
  }

  saveDb(db);

  return res.json({
    success: true,
    message: 'Missão Real submetida com sucesso! O teu professor irá avaliar e fornecer feedback.',
  });
});

// GET / Claim Daily Tip (+10 XP once per day)
router.get('/daily-tip', requireAuth, (req: AuthRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tipIndex = Math.abs(today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)) % DAILY_TIPS.length;
  const tip = DAILY_TIPS[tipIndex];

  const db = getDb();
  const alreadyClaimed = db.dailyTipClaims.some((c) => c.userId === req.user!.id && c.tipDate === today);

  return res.json({
    tip,
    alreadyClaimed,
    xpReward: 10,
  });
});

router.post('/daily-tip/claim', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];
  const db = getDb();

  const alreadyClaimed = db.dailyTipClaims.some((c) => c.userId === userId && c.tipDate === today);
  if (alreadyClaimed) {
    return res.status(400).json({ error: 'Já recolheste a recompensa da Dica Rápida de hoje! Volta amanhã.' });
  }

  const dbUser = db.users.find((u) => u.id === userId)!;
  db.dailyTipClaims.push({
    id: `tip-${crypto.randomUUID()}`,
    userId,
    tipDate: today,
    claimedAt: new Date().toISOString(),
  });

  dbUser.xp += 10;
  db.xpTransactions.push({
    id: `xp-tip-${crypto.randomUUID()}`,
    userId,
    sourceType: 'daily_tip',
    sourceId: `tip-${today}`,
    previousBest: 0,
    newBest: 10,
    xpGain: 10,
    createdAt: new Date().toISOString(),
  });

  saveDb(db);

  return res.json({
    success: true,
    message: 'Parabéns! Ganhaste +10 XP pela Dica Rápida!',
    totalXp: dbUser.xp,
  });
});

// GET Weekly Challenge status
router.get('/weekly-challenge', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const db = getDb();
  const completed = db.weeklyChallenges.some((w) => w.userId === userId && w.challengeId === WEEKLY_CHALLENGE.id);

  // Return options without isCorrect boolean
  const sanitized = {
    ...WEEKLY_CHALLENGE,
    options: WEEKLY_CHALLENGE.options.map((o, idx) => ({
      id: idx,
      text: o.text,
    })),
    completed,
  };

  return res.json({ challenge: sanitized });
});

// POST submit Weekly Challenge
router.post('/weekly-challenge', requireAuth, (req: AuthRequest, res) => {
  const { optionIndex } = req.body;
  if (typeof optionIndex !== 'number' || !WEEKLY_CHALLENGE.options[optionIndex]) {
    return res.status(400).json({ error: 'Opção inválida.' });
  }

  const userId = req.user!.id;
  const db = getDb();
  const already = db.weeklyChallenges.find((w) => w.userId === userId && w.challengeId === WEEKLY_CHALLENGE.id);

  const selected = WEEKLY_CHALLENGE.options[optionIndex];
  if (!selected.isCorrect) {
    return res.json({
      isCorrect: false,
      feedback: selected.explanation,
    });
  }

  const dbUser = db.users.find((u) => u.id === userId)!;
  let xpGain = 0;

  if (!already) {
    db.weeklyChallenges.push({
      id: `wc-${crypto.randomUUID()}`,
      userId,
      challengeId: WEEKLY_CHALLENGE.id,
      status: 'completed',
      score: 100,
      completedAt: new Date().toISOString(),
    });

    xpGain = WEEKLY_CHALLENGE.xpReward;
    dbUser.xp += xpGain;

    db.xpTransactions.push({
      id: `xp-wc-${crypto.randomUUID()}`,
      userId,
      sourceType: 'challenge',
      sourceId: WEEKLY_CHALLENGE.id,
      previousBest: 0,
      newBest: 100,
      xpGain,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
  }

  return res.json({
    isCorrect: true,
    feedback: selected.explanation,
    xpGain,
    totalXp: dbUser.xp,
  });
});

// GET Grande Missão details
router.get('/grande-missao', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const db = getDb();
  const completed = db.xpTransactions.some((t) => t.userId === userId && t.sourceType === 'grande_missao');

  return res.json({
    grandeMissao: GRANDE_MISSAO,
    completed,
  });
});

// POST complete Grande Missão
router.post('/grande-missao/complete', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const db = getDb();
  const dbUser = db.users.find((u) => u.id === userId)!;

  const already = db.xpTransactions.some((t) => t.userId === userId && t.sourceType === 'grande_missao');
  if (already) {
    return res.status(400).json({ error: 'Já concluíste a Grande Missão e recebeste a recompensa.' });
  }

  const xpGain = GRANDE_MISSAO.totalXp;
  dbUser.xp += xpGain;

  db.xpTransactions.push({
    id: `xp-gm-${crypto.randomUUID()}`,
    userId,
    sourceType: 'grande_missao',
    sourceId: GRANDE_MISSAO.id,
    previousBest: 0,
    newBest: 150,
    xpGain,
    createdAt: new Date().toISOString(),
  });

  saveDb(db);
  evaluateBadges(userId);

  return res.json({
    success: true,
    message: 'Parabéns! Concluíste com distinção a Grande Missão A ESCOLA DO FUTURO! +150 XP atribuídos!',
    totalXp: dbUser.xp,
  });
});

// GET Class-Private Ranking
// ONLY students in user's class, never exposes email, real name, or notes!
router.get('/class-ranking', requireAuth, (req: AuthRequest, res) => {
  const userClassId = req.user!.classId;
  const db = getDb();

  const classStudents = db.users
    .filter((u) => u.role === 'student' && u.classId === userClassId && !u.blocked)
    .map((s) => {
      const levelInfo = calculateLevel(s.xp);
      return {
        id: s.id,
        nickname: s.nickname,
        avatar: s.avatar,
        xp: s.xp,
        level: levelInfo.level,
        levelName: levelInfo.name,
        isCurrentUser: s.id === req.user!.id,
      };
    })
    .sort((a, b) => b.xp - a.xp)
    .map((s, index) => ({
      position: index + 1,
      ...s,
    }));

  const classroom = db.classes.find((c) => c.id === userClassId);

  return res.json({
    className: classroom ? classroom.name : 'A tua Turma',
    ranking: classStudents,
  });
});

// GET Badges list (all badges + user ownership)
router.get('/badges', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const db = getDb();
  const userBadges = db.badges.filter((b) => b.userId === userId);

  const badges = BADGES_CATALOG.map((badge) => {
    const owned = userBadges.find((b) => b.badgeId === badge.id);
    return {
      ...badge,
      unlocked: !!owned,
      awardedAt: owned ? owned.awardedAt : null,
    };
  });

  return res.json({ badges });
});

export default router;
