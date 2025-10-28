// functions/src/finalizeSeason.ts
import { onCall } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

type FinalizePayload = {
  seasonId: string;
  newSeason?: { id: string; name?: string; startAt?: string }; // ISO
  topN?: number; // HOF 등록 상위 N
};

export const finalizeSeason = onCall<FinalizePayload>(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new Error("UNAUTHENTICATED");
  const db = getFirestore();

  const user = await db.doc(`users/${uid}`).get();
  if (!user.exists || user.get("role") !== "admin") throw new Error("PERMISSION_DENIED");

  const { seasonId, newSeason, topN = 3 } = req.data || {};
  if (!seasonId) throw new Error("seasonId required");

  const seasonRef = db.doc(`seasons/${seasonId}`);
  const seasonSnap = await seasonRef.get();
  if (!seasonSnap.exists) throw new Error("Season not found");
  if (seasonSnap.get("status") === "closed") {
    return { ok: true, message: "Already finalized." };
  }

  // playerStats 수집
  const statsSnap = await db.collection("playerStats").where("seasonId","==",seasonId).get();
  const standings = statsSnap.docs
    .map(d => {
      const s:any = d.data();
      const wins = Number(s.wins ?? 0), losses = Number(s.losses ?? 0);
      const total = wins + losses;
      return {
        playerName: s.playerName,
        elo: Number(s.elo ?? 1500),
        wins, losses,
        winRate: total > 0 ? wins/total : 0,
      };
    })
    .sort((a,b)=> b.elo - a.elo || b.winRate - a.winRate || b.wins - a.wins || a.playerName.localeCompare(b.playerName))
    .map((r,i)=>({ rank:i+1, ...r }));

  const matchesCount = (await db.collection("matches").where("seasonId","==",seasonId).count().get()).data().count;
  const avgElo = standings.length ? Number((standings.reduce((s,r)=>s+r.elo,0)/standings.length).toFixed(1)) : 0;

  const now = Timestamp.now();
  const batch = db.batch();

  // seasonArchives 스냅샷
  const archiveRef = db.collection("seasonArchives").doc(seasonId);
  batch.set(archiveRef, {
    seasonId,
    name: seasonSnap.get("name") ?? seasonId,
    closedAt: now,
    standings,
    metrics: { players: standings.length, games: matchesCount, avgElo },
    createdAt: now,
  });

  // hallOfFame 상위 N 기록
  standings.slice(0, topN).forEach(row => {
    const hofRef = db.collection("hallOfFame").doc();
    batch.set(hofRef, {
      seasonId,
      title: row.rank === 1 ? "Season Champion" : `Top ${topN}`,
      playerName: row.playerName,
      elo: row.elo,
      extra: { wins: row.wins, losses: row.losses, winRate: row.winRate, rank: row.rank },
      createdAt: now,
    });
  });

  // 시즌 종료
  batch.update(seasonRef, { status: "closed", endAt: now });

  // (옵션) 해당 시즌 matches에 archived 플래그
  const ms = await db.collection("matches").where("seasonId","==",seasonId).get();
  ms.docs.forEach(doc => batch.update(doc.ref, { archived:true }));

  // 새 시즌 생성 (선택)
  if (newSeason?.id) {
    const newRef = db.doc(`seasons/${newSeason.id}`);
    batch.set(newRef, {
      name: newSeason.name ?? newSeason.id,
      startAt: newSeason.startAt ? Timestamp.fromDate(new Date(newSeason.startAt)) : now,
      status: "active",
      createdAt: now,
    });
    batch.set(db.doc("appMeta/singleton"), { activeSeasonId: newSeason.id }, { merge: true });
  }

  await batch.commit();
  return { ok:true, winners: standings.slice(0, topN), metrics: { players: standings.length, games: matchesCount, avgElo }, createdNewSeason: !!newSeason?.id };
});
