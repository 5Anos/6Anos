import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

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

export interface ActivityProgress {
  id: string;
  userId: string;
  activityId: string;
  worldId: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  firstCompletedAt: string;
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

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  users: User[];
  classes: ClassRoom[];
  sessions: Session[];
  activityProgress: ActivityProgress[];
  assessmentAttempts: AssessmentAttempt[];
  missionSubmissions: MissionSubmission[];
  xpTransactions: XPTransaction[];
  badges: UserBadge[];
  dailyTipClaims: DailyTipClaim[];
  weeklyChallenges: WeeklyChallengeProgress[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SQLITE_FILE = path.join(DATA_DIR, 'missao_tic.sqlite');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let dbCache: DatabaseSchema | null = null;
let sqlJsInstance: SqlJsStatic | null = null;
let sqliteDb: Database | null = null;

// Initialize SQLite schema and tables
export async function initSqliteEngine() {
  ensureDataDir();
  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs();
  }

  if (fs.existsSync(SQLITE_FILE)) {
    try {
      const buffer = fs.readFileSync(SQLITE_FILE);
      sqliteDb = new sqlJsInstance.Database(buffer);
    } catch {
      sqliteDb = new sqlJsInstance.Database();
    }
  } else {
    sqliteDb = new sqlJsInstance.Database();
  }

  // Create tables in SQLite
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT NOT NULL,
      role TEXT NOT NULL,
      class_id TEXT NOT NULL,
      locale TEXT NOT NULL,
      xp INTEGER NOT NULL,
      blocked INTEGER NOT NULL,
      must_change_password INTEGER,
      needs_help INTEGER,
      help_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      world_id INTEGER NOT NULL,
      best_score INTEGER NOT NULL,
      attempts INTEGER NOT NULL,
      completed INTEGER NOT NULL,
      first_completed_at TEXT,
      last_attempt_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      world_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      percentage REAL NOT NULL,
      answers_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mission_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      student_name TEXT,
      student_nickname TEXT,
      class_id TEXT,
      mission_id TEXT NOT NULL,
      world_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      submission TEXT NOT NULL,
      score INTEGER NOT NULL,
      feedback TEXT,
      status TEXT NOT NULL,
      graded_by TEXT,
      graded_at TEXT,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS xp_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      previous_best INTEGER NOT NULL,
      new_best INTEGER NOT NULL,
      xp_gain INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      awarded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_tip_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tip_date TEXT NOT NULL,
      claimed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weekly_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      status TEXT NOT NULL,
      score INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_user_id TEXT,
      target_user_name TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Sync current data to SQLite
  if (dbCache) {
    syncToSqlite(dbCache);
  }
}

function syncToSqlite(db: DatabaseSchema) {
  if (!sqliteDb) return;
  try {
    // Clear and rewrite into SQLite
    sqliteDb.run('BEGIN TRANSACTION;');

    sqliteDb.run('DELETE FROM users;');
    for (const u of db.users) {
      sqliteDb.run(
        `INSERT OR REPLACE INTO users (id, name, email, password_hash, password_salt, nickname, avatar, role, class_id, locale, xp, blocked, must_change_password, needs_help, help_reason, created_at, updated_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          u.id,
          u.name,
          u.email,
          u.passwordHash,
          u.passwordSalt,
          u.nickname,
          u.avatar,
          u.role,
          u.classId,
          u.locale,
          u.xp,
          u.blocked ? 1 : 0,
          u.mustChangePassword ? 1 : 0,
          u.needsHelp ? 1 : 0,
          u.helpReason || null,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt || null,
        ]
      );
    }

    sqliteDb.run('DELETE FROM classes;');
    for (const c of db.classes) {
      sqliteDb.run(`INSERT OR REPLACE INTO classes (id, name, code, created_at) VALUES (?, ?, ?, ?);`, [
        c.id,
        c.name,
        c.code,
        c.createdAt,
      ]);
    }

    sqliteDb.run('DELETE FROM activity_progress;');
    for (const a of db.activityProgress) {
      sqliteDb.run(
        `INSERT OR REPLACE INTO activity_progress (id, user_id, activity_id, world_id, best_score, attempts, completed, first_completed_at, last_attempt_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          a.id,
          a.userId,
          a.activityId,
          a.worldId,
          a.bestScore,
          a.attempts,
          a.completed ? 1 : 0,
          a.firstCompletedAt || null,
          a.lastAttemptAt,
        ]
      );
    }

    sqliteDb.run('DELETE FROM badges;');
    for (const b of db.badges) {
      sqliteDb.run(`INSERT OR REPLACE INTO badges (id, user_id, badge_id, awarded_at) VALUES (?, ?, ?, ?);`, [
        b.id,
        b.userId,
        b.badgeId,
        b.awardedAt,
      ]);
    }

    sqliteDb.run('DELETE FROM mission_submissions;');
    for (const m of db.missionSubmissions) {
      sqliteDb.run(
        `INSERT OR REPLACE INTO mission_submissions (id, user_id, student_name, student_nickname, class_id, mission_id, world_id, title, submission, score, feedback, status, graded_by, graded_at, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          m.id,
          m.userId,
          m.studentName || null,
          m.studentNickname || null,
          m.classId || null,
          m.missionId,
          m.worldId,
          m.title,
          m.submission,
          m.score,
          m.feedback || null,
          m.status,
          m.gradedBy || null,
          m.gradedAt || null,
          m.submittedAt,
        ]
      );
    }

    sqliteDb.run('COMMIT;');

    // Persist to disk
    const binary = sqliteDb.export();
    fs.writeFileSync(SQLITE_FILE, Buffer.from(binary));
  } catch (err) {
    console.error('Error syncing to SQLite:', err);
    try {
      sqliteDb.run('ROLLBACK;');
    } catch {}
  }
}

export function getDb(): DatabaseSchema {
  if (dbCache) return dbCache;
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    } catch (err) {
      console.error('Error reading db.json, re-initializing', err);
    }
  }

  dbCache = getInitialDb();
  saveDb(dbCache);
  return dbCache;
}

export function saveDb(db: DatabaseSchema) {
  ensureDataDir();
  dbCache = db;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  if (sqliteDb) {
    syncToSqlite(db);
  }
}

export function getInitialDb(): DatabaseSchema {
  return {
    users: [],
    classes: [
      { id: 'class-6a', name: '6.º A', code: '6A-2024', createdAt: new Date().toISOString() },
      { id: 'class-6b', name: '6.º B', code: '6B-2024', createdAt: new Date().toISOString() },
    ],
    sessions: [],
    activityProgress: [],
    assessmentAttempts: [],
    missionSubmissions: [],
    xpTransactions: [],
    badges: [],
    dailyTipClaims: [],
    weeklyChallenges: [],
    auditLogs: [],
  };
}

export function getDbStats() {
  const db = getDb();
  let sqliteBytes = 0;
  if (fs.existsSync(SQLITE_FILE)) {
    sqliteBytes = fs.statSync(SQLITE_FILE).size;
  }
  return {
    engine: 'SQLite 3 (via sql.js WebAssembly Engine)',
    file: SQLITE_FILE,
    sizeBytes: sqliteBytes,
    isPersistent: true,
    tables: {
      users: db.users.length,
      classes: db.classes.length,
      activityProgress: db.activityProgress.length,
      assessmentAttempts: db.assessmentAttempts.length,
      missionSubmissions: db.missionSubmissions.length,
      xpTransactions: db.xpTransactions.length,
      badges: db.badges.length,
      auditLogs: db.auditLogs.length,
    },
  };
}
