import {
  collection, doc, setDoc, updateDoc, getDocs, getDoc, query, where,
  serverTimestamp, orderBy
} from "firebase/firestore";
import { db } from "../firebase/client";

// 목록
export async function listTournaments({ status } = {}) {
  const col = collection(db, "tournaments");
  const q = status ? query(col, where("status", "==", status), orderBy("createdAt","desc"))
                   : query(col, orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 단건
export async function getTournament(id) {
  const ref = doc(db, "tournaments", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// 생성 (운영자만 호출하도록 UI/권한 처리)
export async function createTournament(payload, me) {
  const id = crypto.randomUUID();
  const ref = doc(db, "tournaments", id);
  await setDoc(ref, {
    ...payload,
    status: payload.status || "reg",
    createdBy: me.uid,                 // ← 개최자 UID
    createdByName: me.name || me.uid,  // (선택) 개최자 이름
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

// 참가
export async function joinTournament(tournamentId, user) {
  const pid = `${tournamentId}_${user.uid}`;
  const ref = doc(db, "participants", pid);
  await setDoc(ref, {
    tournamentId,
    userId: user.uid,
    name: user.nickname || user.displayName || "Player",
    rankText: user.rankText || "NR",
    checkedIn: false,
    withdrawn: false,
    colorBalance: { black: 0, white: 0 },
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return pid;
}

// 탈퇴 (접수중: 완전 취소, 진행중: withdrawn=true)
export async function leaveTournament(tournamentId, user, status) {
  const pid = `${tournamentId}_${user.uid}`;
  const ref = doc(db, "participants", pid);
  if (status === "reg") {
    // 접수중엔 문서 삭제 대신 withdrawn=false로 두어도 되지만, 깔끔히 삭제해도 OK
    await setDoc(ref, { withdrawn: true, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    // 진행중이면 withdrawn 처리
    await updateDoc(ref, { withdrawn: true, updatedAt: serverTimestamp() });
  }
}
