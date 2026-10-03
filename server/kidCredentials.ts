import crypto from 'crypto';

export const KID_FRIENDLY_WORDS: string[] = [
  'sol', 'lua', 'mar', 'rio', 'estrela', 'leao', 'tigre', 'panda',
  'azul', 'verde', 'cristal', 'robot', 'cometa', 'terra', 'vento', 'nuvem',
  'flor', 'lince', 'falcao', 'golfinho', 'aguia', 'urso', 'coruja', 'planeta',
  'cosmos', 'raio', 'fogo', 'lago', 'praia', 'selva', 'arvore', 'folha',
  'cacau', 'prata', 'ouro', 'rubi', 'perola', 'nave', 'satelite', 'meteoro',
  'astro', 'brisa', 'onda', 'oceano', 'relampago', 'aurora', 'prisma', 'galaxia',
  'pulsar', 'atomo', 'codigo', 'byte', 'pixel', 'chip', 'radar', 'motor',
  'foguete', 'diamante', 'safira', 'topazio', 'ambar', 'esmeralda', 'raposa', 'lobo',
  'castor', 'colibri', 'bambu', 'cedro', 'eclipse', 'nebula', 'quasar', 'orbita'
];

export function cleanString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function extractShortName(fullName: string): { first: string; last: string; displayName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first: 'aluno', last: '', displayName: 'Aluno' };
  }
  if (parts.length === 1) {
    return { first: parts[0], last: '', displayName: parts[0] };
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return {
    first,
    last,
    displayName: `${first} ${last}`,
  };
}

export function normalizeTurmaTag(turma: string): string {
  const cleaned = cleanString(turma);
  return cleaned || '6a';
}

export function generateKidUsername(
  fullName: string,
  turma: string = '6.º A',
  existingUsernames: Set<string> | string[] = new Set()
): string {
  const existingSet = existingUsernames instanceof Set ? existingUsernames : new Set(existingUsernames);
  const { first, last } = extractShortName(fullName);

  const cleanFirst = cleanString(first) || 'aluno';
  const cleanLast = cleanString(last);

  const baseUsername = cleanLast ? `${cleanFirst}.${cleanLast}` : cleanFirst;

  if (!existingSet.has(baseUsername)) {
    return baseUsername;
  }

  // 1st collision attempt: add turma tag (e.g. joao.goncalves.6a)
  const turmaTag = normalizeTurmaTag(turma);
  const turmaUsername = `${baseUsername}.${turmaTag}`;
  if (!existingSet.has(turmaUsername)) {
    return turmaUsername;
  }

  // 2nd collision attempt: sequential number (e.g. joao.goncalves2, joao.goncalves3)
  let counter = 2;
  while (existingSet.has(`${baseUsername}${counter}`)) {
    counter++;
  }
  return `${baseUsername}${counter}`;
}

export function generateKidPassword(): string {
  const wordIndex = crypto.randomInt(0, KID_FRIENDLY_WORDS.length);
  const word = KID_FRIENDLY_WORDS[wordIndex];
  const num = crypto.randomInt(100, 1000);
  return `${word}${num}`;
}

export function normalizeTurmaName(input: string): string {
  if (!input) return '6.º A';
  const trimmed = input.trim();
  const match = trimmed.match(/^([5-9])[\.\sº°\-_]*([a-zA-Z])$/i);
  if (match) {
    return `${match[1]}.º ${match[2].toUpperCase()}`;
  }
  return trimmed;
}
