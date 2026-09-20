import { getAllUsers, getUserById, saveUser } from './firestoreDb';
import { verifyPassword, hashPassword } from './auth';

async function check() {
  const users = await getAllUsers();
  console.log('Total users:', users.length);
  for (const u of users) {
    const isTrabalharMatch = verifyPassword('Trabalhar*2026', u.passwordHash, u.passwordSalt);
    console.log(`User: ID=${u.id}, Email=${u.email}, Role=${u.role}, Nickname=${u.nickname}, Matches Trabalhar*2026: ${isTrabalharMatch}`);
  }
}

check().catch(console.error);
