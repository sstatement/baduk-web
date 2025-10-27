// src/firebase/client.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// CRA(.env.local): REACT_APP_*
// Vite(기존): VITE_*  → 백업으로도 읽어줌
const E = process.env;
const cfg = {
  apiKey: E.REACT_APP_FB_API_KEY || E.VITE_FB_API_KEY,
  authDomain: E.REACT_APP_FB_AUTH_DOMAIN || E.VITE_FB_AUTH_DOMAIN,
  projectId: E.REACT_APP_FB_PROJECT_ID || E.VITE_FB_PROJECT_ID,
  storageBucket: E.REACT_APP_FB_STORAGE_BUCKET || E.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: E.REACT_APP_FB_MESSAGING_SENDER_ID || E.VITE_FB_MESSAGING_SENDER_ID,
  appId: E.REACT_APP_FB_APP_ID || E.VITE_FB_APP_ID,
  measurementId: E.REACT_APP_FB_MEASUREMENT_ID || E.VITE_FB_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(cfg);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export default app;
