import { db } from '../firebase';
import {
  collection, getDocs, doc, deleteDoc, limit, query,
  updateDoc, setDoc
} from 'firebase/firestore';

// matches 전체 삭제 (시즌 1 초기화)
export async function deleteAllMatches(batchSize = 300) {
  while (true) {
    const snap = await getDocs(query(collection(db, 'matches'), limit(batchSize)));
    if (snap.empty) break;
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'matches', d.id))));
  }
}

// matchApplications 스탯 초기화 (명단은 유지)
export async function resetApplicationsStats({ baseElo = 1500, resetStamina = false } = {}) {
  const snap = await getDocs(collection(db, 'matchApplications'));
  const ops = snap.docs.map(d => {
    const m = d.data();
    const payload = {
      rating: m.rating ?? baseElo,
      win: 0,
      loss: 0,
      winRate: 0,
      updatedAt: new Date(),
    };
    if (resetStamina) payload.stamina = 0;
    return updateDoc(doc(db, 'matchApplications', d.id), payload);
  });
  await Promise.all(ops);
}

// (선택) playerStats 시즌1 시드
export async function seedPlayerStatsForSeason(seasonId = 'S1', { fromApplications = true, baseElo = 1500 } = {}) {
  const appsSnap = await getDocs(collection(db, 'matchApplications'));
  const ops = appsSnap.docs.map(d => {
    const m = d.data();
    const id = `${m.playerName}_${seasonId}`;
    return setDoc(doc(db, 'playerStats', id), {
      playerName: m.playerName,
      seasonId,
      elo: fromApplications ? (m.rating ?? baseElo) : baseElo,
      wins: 0,
      losses: 0,
      winRate: 0,
      updatedAt: new Date(),
    }, { merge: true });
  });
  await Promise.all(ops);
}
