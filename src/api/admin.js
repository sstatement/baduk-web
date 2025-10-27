// src/api/admin.js
import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc,
  serverTimestamp, writeBatch
} from "firebase/firestore";
import { db } from "../firebase/client";

/** 배열 셔플 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** N 이상의 가장 작은 2의 거듭제곱 */
function nextPow2(n) {
  return 1 << Math.ceil(Math.log2(Math.max(1, n)));
}

/** 활성 참가자 로드 (withdrawn=false) */
export async function loadActiveParticipants(tournamentId) {
  const snap = await getDocs(query(
    collection(db, "participants"),
    where("tournamentId", "==", tournamentId),
    where("withdrawn", "==", false)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** 라운드 문서 ref */
function roundRef(tid, r) {
  return doc(db, "rounds", `${tid}_${r}`);
}

/** 단일 라운드 로드 */
export async function getRound(tournamentId, roundNo) {
  const snap = await getDoc(roundRef(tournamentId, roundNo));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** 모든 라운드 로드 */
export async function getAllRounds(tournamentId) {
  const q = query(collection(db, "rounds"), where("tournamentId","==",tournamentId));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({ id:d.id, ...d.data() })).sort((a,b)=>a.round-b.round);
}

/** 1라운드 생성 + 상태 live — 싱글 엘리미네이션 */
export async function startTournamentSE(tournamentId) {
  const tRef = doc(db, "tournaments", tournamentId);
  const tSnap = await getDoc(tRef);
  if (!tSnap.exists()) throw new Error("Tournament not found");
  const t = tSnap.data();
  if (t.status !== "reg") throw new Error("이미 시작되었거나 종료됨");

  const players = await loadActiveParticipants(tournamentId);
  if (players.length < 2) throw new Error("참가자가 부족합니다");

  // 셔플된 uid 배열
  const seeds = shuffle(players.map(p => p.userId));

  // 다음 2의 거듭제곱으로 BYE 패딩
  const target = nextPow2(seeds.length);
  const byeCount = target - seeds.length;
  for (let i = 0; i < byeCount; i++) {
    seeds.push(`__BYE__${i}`); // 표식
  }

  // 페어링 생성 (BYE는 자동 부전승 처리)
  const pairings = [];
  let table = 1;
  for (let i = 0; i < seeds.length; i += 2) {
    const a = seeds[i];
    const b = seeds[i + 1];

    // a 또는 b가 BYE면 상대 자동승
    const aIsBye = String(a).startsWith("__BYE__");
    const bIsBye = String(b).startsWith("__BYE__");

    // 색 랜덤 배정(둘 다 실제 플레이어일 때만 의미 있음)
    const black = Math.random() < 0.5 ? a : b;
    const white = black === a ? b : a;

    let result = null, winner = null;
    if (aIsBye && !bIsBye) {
      winner = b;
      result = "BYE";
    } else if (bIsBye && !aIsBye) {
      winner = a;
      result = "BYE";
    } else if (aIsBye && bIsBye) {
      // 이론상 발생 X, 안전장치
      result = "INVALID";
      winner = null;
    }

    // BYE가 포함되면 실좌석 측엔 null로 비워둠(뷰에서 표시 깔끔)
    const rec = {
      table,
      black: String(black).startsWith("__BYE__") ? null : black,
      white: String(white).startsWith("__BYE__") ? null : white,
      handicap: 0,
      result,
      winner,
      date: null,
      sgfUrl: null,
    };
    pairings.push(rec);
    table++;
  }

  const batch = writeBatch(db);
  batch.set(roundRef(tournamentId, 1), {
    tournamentId,
    round: 1,
    pairings,
    locked: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(tRef, {
    status: "live",
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return { round: 1, pairings };
}

/** 한 매치 결과 저장 */
export async function saveMatchResult({ tournamentId, round, table, payload }) {
  const rRef = roundRef(tournamentId, round);
  const rSnap = await getDoc(rRef);
  if (!rSnap.exists()) throw new Error("Round not found");
  const data = rSnap.data();
  const pairings = data.pairings.map(p => (p.table === table ? { ...p, ...payload } : p));
  await updateDoc(rRef, { pairings, updatedAt: serverTimestamp() });
  return true;
}

/** 라운드 완료 여부 */
export function isRoundCompleted(roundDoc) {
  return roundDoc.pairings.every(
    (p) => p.winner || p.white === null /* BYE로 자동승 처리된 슬롯 */
  );
}

/** 다음 라운드 생성(SE) — 이전 라운드 승자 모아서 BYE 패딩 */
export async function advanceNextRoundSE(tournamentId, currentRound) {
  const prev = await getRound(tournamentId, currentRound);
  if (!prev) throw new Error("이전 라운드 없음");
  if (!isRoundCompleted(prev)) throw new Error("이전 라운드 결과가 모두 입력되지 않음");

  // 승자만 수집
  const winners = prev.pairings.map(p => p.winner).filter(Boolean);

  // 우승 확정
  if (winners.length <= 1) {
    const tRef = doc(db, "tournaments", tournamentId);
    await updateDoc(tRef, { status: "done", updatedAt: serverTimestamp() });
    return { done: true, winners };
  }

  // 다음 라운드도 2의 거듭제곱까지 BYE 패딩
  const target = nextPow2(winners.length);
  const byeCount = target - winners.length;
  const seeds = shuffle([...winners]);
  for (let i = 0; i < byeCount; i++) seeds.push(`__BYE__N${i}`);

  const pairings = [];
  let table = 1;
  for (let i = 0; i < seeds.length; i += 2) {
    const a = seeds[i];
    const b = seeds[i + 1];
    const aIsBye = String(a).startsWith("__BYE__");
    const bIsBye = String(b).startsWith("__BYE__");

    const black = Math.random() < 0.5 ? a : b;
    const white = black === a ? b : a;

    let result = null, winner = null;
    if (aIsBye && !bIsBye) {
      winner = b;
      result = "BYE";
    } else if (bIsBye && !aIsBye) {
      winner = a;
      result = "BYE";
    } else if (aIsBye && bIsBye) {
      result = "INVALID";
      winner = null;
    }

    pairings.push({
      table,
      black: String(black).startsWith("__BYE__") ? null : black,
      white: String(white).startsWith("__BYE__") ? null : white,
      handicap: 0,
      result,
      winner,
      date: null,
      sgfUrl: null,
    });
    table++;
  }

  const nextR = currentRound + 1;
  await setDoc(roundRef(tournamentId, nextR), {
    tournamentId,
    round: nextR,
    pairings,
    locked: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { done: false, round: nextR, pairings };
}
