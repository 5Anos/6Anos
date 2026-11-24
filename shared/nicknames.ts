/**
 * Shared Safe Anonymous Nickname Engine (PT-PT, RGPD-compliant for 10-year-old students).
 * Used identically on both client (Firestore direct) and Express server so every student
 * automatically receives a unique, fun game nickname that never exposes their real name.
 */

const CHARACTERS = [
  'Panda',
  'Lince',
  'Falcao',
  'Astronauta',
  'Guardiao',
  'Explorador',
  'Lontra',
  'Aguia',
  'Ninja',
  'Coruja',
  'Golfinho',
  'Robo',
  'Pioneiro',
  'Genio',
  'Raposa',
  'Lobo',
  'Fenix',
  'Dragao',
  'Tigre',
  'Cometa',
  'Estrela',
  'Navegador',
  'Inventor',
  'Detetive',
];

const ADJECTIVES = [
  'Criativo',
  'Veloz',
  'Curioso',
  'Brilhante',
  'Valente',
  'Audaz',
  'Atento',
  'Engenhoso',
  'Focado',
  'Sabio',
  'Esperto',
  'Inovador',
  'Divertido',
  'Agil',
  'Heroico',
  'Radiante',
  'Cosmico',
  'Digital',
  'Estelar',
  'Luminoso',
];

const IGNORED_NAME_PARTICLES = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'para',
  'com',
]);

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates a fun, safe anonymous nickname: [Personagem]_[Adjetivo]_[100-999].
 * When `seed` is provided, output is deterministic for that student ID.
 */
export function generateSafeNickname(seed?: string): string {
  if (seed) {
    const h1 = hashString(`${seed}:char`);
    const h2 = hashString(`${seed}:adj`);
    const h3 = hashString(`${seed}:num`);
    const char = CHARACTERS[h1 % CHARACTERS.length];
    const adj = ADJECTIVES[h2 % ADJECTIVES.length];
    const num = 100 + (h3 % 900);
    return `${char}_${adj}_${num}`;
  }
  const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${char}_${adj}_${num}`;
}

/**
 * Generates a unique safe nickname not present in `existingLowerNicknames`
 * and registers it in the Set.
 */
export function generateUniqueSafeNickname(
  existingLowerNicknames: Set<string>,
  seed?: string
): string {
  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = seed
      ? generateSafeNickname(attempt === 0 ? seed : `${seed}#${attempt}`)
      : generateSafeNickname();
    const key = candidate.toLowerCase();
    if (!existingLowerNicknames.has(key)) {
      existingLowerNicknames.add(key);
      return candidate;
    }
  }
  const fallback = `Explorador_TIC_${Math.floor(1000 + Math.random() * 9000)}`;
  existingLowerNicknames.add(fallback.toLowerCase());
  return fallback;
}

export interface StudentIdentityLike {
  id?: string;
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  nickname?: string;
}

/**
 * Checks whether a student's nickname is missing or leaks their real name / username / email.
 */
export function isNicknameUnsafeOrMissing(
  nickname: string | undefined | null,
  student: StudentIdentityLike
): boolean {
  if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
    return true;
  }

  const trimmed = nickname.trim();
  const normNick = normalizeText(trimmed);

  // Never allow email addresses or dot-separated login usernames (e.g., daniel.costa)
  if (trimmed.includes('@') || trimmed.includes('.')) {
    return true;
  }

  if (student.username) {
    const normUser = normalizeText(student.username);
    if (normUser && (normNick === normUser || normNick === normUser.replace(/\./g, ''))) {
      return true;
    }
  }

  if (student.email) {
    const emailLocal = normalizeText(student.email.split('@')[0] || '');
    if (emailLocal && normNick === emailLocal) {
      return true;
    }
  }

  // Check if any real-name token (>= 3 chars) is exposed inside the nickname
  const rawNames = [student.fullName || '', student.name || ''].join(' ');
  const tokens = normalizeText(rawNames)
    .split(/[^a-z0-9]+/)
    .filter((tok) => tok.length >= 3 && !IGNORED_NAME_PARTICLES.has(tok));

  for (const token of tokens) {
    if (normNick.includes(token)) {
      return true;
    }
  }

  return false;
}

/**
 * Resolves a guaranteed safe anonymous nickname for any student, indicating
 * whether Firestore should be updated to persist it.
 */
export function resolveStudentSafeNickname(
  student: StudentIdentityLike,
  existingLowerNicknames: Set<string>
): { nickname: string; needsPersist: boolean } {
  if (!isNicknameUnsafeOrMissing(student.nickname, student)) {
    const clean = student.nickname!.trim();
    existingLowerNicknames.add(clean.toLowerCase());
    return { nickname: clean, needsPersist: false };
  }

  const generated = generateUniqueSafeNickname(existingLowerNicknames, student.id);
  return { nickname: generated, needsPersist: true };
}
