// src/api/standings.js
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

/** 종료된 대회의 standings 문서 읽기 */
export async function getStandings(tournamentId) {
  const ref = doc(db, "standings", tournamentId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { rows: [] };
}

/** 시즌 랭킹 읽기 (필요에 맞게 경로/필드명 조정) */
export async function getSeasonRanking(seasonId = "current") {
  // 예시: seasonRankings/{seasonId}/users 컬렉션에 { points } 필드가 있다고 가정
  const q = query(
    collection(db, "seasonRankings", seasonId, "users"),
    orderBy("points", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
