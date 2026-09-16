import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'missao_tic.sqlite');

let SQL: SqlJsStatic | null = null;
let dbInstance: Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getSqliteDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  ensureDataDir();

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (fs.existsSync(SQLITE_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(SQLITE_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      initTables(dbInstance);
      return dbInstance;
    } catch (err) {
      console.error('Error opening existing SQLite file, creating fresh database:', err);
    }
  }

  dbInstance = new SQL.Database();
  initTables(dbInstance);
  persistSqliteDb();
  return dbInstance;
}

export function persistSqliteDb() {
  if (!dbInstance) return;
  ensureDataDir();
  const binaryArray = dbInstance.export();
  const buffer = Buffer.from(binaryArray);
  fs.writeFileSync(SQLITE_FILE, buffer);
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
      class_id TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'pt',
      xp INTEGER NOT NULL DEFAULT 0,
      blocked INTEGER NOT NULL DEFAULT 0,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      needs_help INTEGER NOT NULL DEFAULT 0,
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
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      world_id INTEGER NOT NULL,
      best_score INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      first_completed_at TEXT,
      last_attempt_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, activity_id)
    );

    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      world_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      percentage REAL NOT NULL,
      answers_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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
      score INTEGER NOT NULL DEFAULT 0,
      feedback TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      graded_by TEXT,
      graded_at TEXT,
      submitted_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS xp_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      previous_best INTEGER NOT NULL DEFAULT 0,
      new_best INTEGER NOT NULL DEFAULT 0,
      xp_gain INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      awarded_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS daily_tip_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tip_date TEXT NOT NULL,
      claimed_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, tip_date)
    );

    CREATE TABLE IF NOT EXISTS weekly_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      status TEXT NOT NULL,
      score INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, challenge_id)
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

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_user ON mission_submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id);
  `);
}
