import scrypt from 'scrypt-js';

export async function hashPasswordClient(password: string): Promise<{ hash: string; salt: string }> {
  const randomBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const salt = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

  const pwdBytes = new TextEncoder().encode(password);
  const saltBytes = new TextEncoder().encode(salt);
  const derivedKey = await scrypt.scrypt(pwdBytes, saltBytes, 16384, 8, 1, 64);
  const hash = Array.from(derivedKey).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt };
}

export async function verifyPasswordClient(
  password: string,
  expectedHash: string,
  salt: string
): Promise<boolean> {
  try {
    const pwdBytes = new TextEncoder().encode(password);
    const saltBytes = new TextEncoder().encode(salt);
    const derivedKey = await scrypt.scrypt(pwdBytes, saltBytes, 16384, 8, 1, 64);
    const calculatedHash = Array.from(derivedKey).map((b) => b.toString(16).padStart(2, '0')).join('');
    return calculatedHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
