// src/firebaseCore.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ 콘솔의 General 탭에서 복사한 값 사용
const firebaseConfig = {
  apiKey: "AIzaSyDxahwb6rmpFDGUlIOPscF-5v7LaFCyp7Y",
  authDomain: "baduk-app.firebaseapp.com",
  projectId: "baduk-app",
  storageBucket: "baduk-app.appspot.com", // ← 반드시 .appspot.com
  messagingSenderId: "895478052671",
  appId: "1:895478052671:web:e43af7646c47d36fe6c58a",
  measurementId: "G-KQZK8LQ4CS",
};

const app = initializeApp(firebaseConfig);

// ✅ 코어 리소스만 즉시 export
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
