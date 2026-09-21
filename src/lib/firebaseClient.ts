import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, Firestore, setLogLevel } from 'firebase/firestore';

export const FIREBASE_APPLET_CONFIG = {
  projectId: 'gen-lang-client-0684360526',
  appId: '1:988379722800:web:6f13b2ebe35dc54208a9f5',
  apiKey: 'AIzaSyDYqStfqxZ7kc17mp0eLlVGT5mhuzoAU7o',
  authDomain: 'gen-lang-client-0684360526.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-missotic6ano-a3c97613-00e9-4b26-9901-461ec92853e8',
  storageBucket: 'gen-lang-client-0684360526.firebasestorage.app',
  messagingSenderId: '988379722800',
};

let cachedApp: FirebaseApp | null = null;
let cachedFirestore: Firestore | null = null;

export function getClientFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0];
    return cachedApp;
  }
  cachedApp = initializeApp({
    projectId: FIREBASE_APPLET_CONFIG.projectId,
    appId: FIREBASE_APPLET_CONFIG.appId,
    apiKey: FIREBASE_APPLET_CONFIG.apiKey,
    authDomain: FIREBASE_APPLET_CONFIG.authDomain,
    storageBucket: FIREBASE_APPLET_CONFIG.storageBucket,
    messagingSenderId: FIREBASE_APPLET_CONFIG.messagingSenderId,
  });
  return cachedApp;
}

export function getClientFirestore(): Firestore {
  if (cachedFirestore) return cachedFirestore;
  try {
    setLogLevel('silent');
  } catch {}

  const app = getClientFirebaseApp();
  cachedFirestore = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    FIREBASE_APPLET_CONFIG.firestoreDatabaseId
  );
  return cachedFirestore;
}
