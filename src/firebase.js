// src/firebase.js
import { 
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, addDoc, setDoc, getDoc, updateDoc, increment,
  collection, query, getDocs, orderBy, where 
} from "firebase/firestore";

// ✅ 코어는 분리된 파일에서만 import
import { auth, db, storage } from "./firebaseCore";

// ───────────────── Google 로그인
const provider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, provider);

// ───────────────── 사용자 추가
const addUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    name: user.displayName || "",
    email: user.email || "",
    mileage: 0,
    admin: false,
    lastLogin: new Date(),
    notificationsEnabled: true,
    profilePicture: user.photoURL || "",
    role: "member",
  });
};

// ───────────────── admin 여부
const checkAdminStatus = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? !!docSnap.data().admin : false;
};

// ───────────────── 리그 참가자
export const getLeaguePlayers = async () => {
  const querySnapshot = await getDocs(collection(db, "matchApplications"));
  return querySnapshot.docs.map((d) => d.data());
};

// ───────────────── admin 설정
const setAdminRole = async (userId, isAdmin) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { admin: isAdmin });
};

// ───────────────── 마일리지
const updateMileage = async (userId, amount) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { mileage: increment(amount) });
};

// ───────────────── Auth 상태 감지
const listenAuthStateChange = (setUser, setUserData) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        await updateDoc(userRef, { lastLogin: new Date() });
      } else {
        await addUser(user);
        setUserData({
          name: user.displayName || "",
          email: user.email || "",
          mileage: 0,
          admin: false,
          lastLogin: new Date(),
          notificationsEnabled: true,
          profilePicture: user.photoURL || "",
          role: "member",
        });
      }
    } else {
      setUserData(null);
    }
    setUser(user);
  });
};

// ───────────────── ELO 관련
const getEloHistory = async (userId) => {
  const matchesRef = collection(db, "matches");
  const q = query(matchesRef, orderBy("date"));
  const matchSnapshot = await getDocs(q);
  return matchSnapshot.docs
    .map((d) => d.data())
    .filter((m) => m.winner === userId || m.loser === userId)
    .map((m) => ({
      date: m.date.toDate(),
      eloAfter: m.winner === userId ? m.winnerElo : m.loserElo,
    }));
};

const getPlayerELO = async (userId) => {
  const matchRef = collection(db, "matchApplications");
  const q = query(matchRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  let elo = 0;
  snap.forEach((d) => {
    const data = d.data();
    if (data.result === "win") elo += 10;
    else if (data.result === "loss") elo -= 10;
  });
  return elo;
};

const updatePlayerELO = async (userId, newElo) => {
  const matchRef = collection(db, "matchApplications");
  const q = query(matchRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  snap.forEach(async (d) => {
    await updateDoc(d.ref, { elo: newElo });
  });
};

// ───────────────── 경기 기록
export const getMatchApplications = async (playerName) => {
  const q = query(collection(db, "matchApplications"), where("playerName", "==", playerName));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

// ───────────────── 전체 사용자
const getUsers = async () => {
  const usersCol = collection(db, "users");
  const q = query(usersCol);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

// ───────────────── 로그아웃
const logout = () => signOut(auth).catch((e) => console.error("Sign out error:", e));

// ───────────────── export (코어 재노출 + 유틸)
export {
  // 코어 재노출 (원하면 SetupProfile 등에서 여기서 가져다 써도 됨)
  auth,
  db,
  storage,

  // 유틸
  signInWithGoogle,
  logout,
  listenAuthStateChange,
  updateMileage,
  checkAdminStatus,
  setAdminRole,
  getUsers,
  getEloHistory,
  getPlayerELO,
  updatePlayerELO,
};
