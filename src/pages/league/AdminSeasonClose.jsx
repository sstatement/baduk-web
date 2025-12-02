// src/pages/league/AdminSeasonClose.jsx
import React, { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSeason } from "../../contexts/SeasonContext";

const box = {
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 12,
  padding: 16,
};

const BASE_RATING = 1500; // 레이팅 초기값

export default function AdminSeasonClose() {
  const { activeSeasonId, setActiveSeasonId } = useSeason() || {};
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [topN, setTopN] = useState(3);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);

  // ✅ 네 리그 컬렉션 이름
  const LEAGUE_COLLECTION = "matchApplications";

  const run = async () => {
    if (!activeSeasonId) {
      alert("활성 시즌이 없습니다.");
      return;
    }

    const seasonId = activeSeasonId;
    setLoading(true);
    setOut(null);

    try {
      // 1) 시즌 문서 가져오기
      const seasonRef = doc(db, "seasons", seasonId);
      const seasonSnap = await getDoc(seasonRef);
      if (!seasonSnap.exists()) {
        alert(`시즌 ${seasonId} 문서를 찾을 수 없습니다.`);
        return;
      }
      const seasonData = seasonSnap.data() || {};

      // 2) 현재 리그 플레이어들 모두 가져오기 (matchApplications 전체 스냅샷)
      const leagueRef = collection(db, LEAGUE_COLLECTION);
      const playersSnap = await getDocs(leagueRef);

      const players = playersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (!players.length) {
        // 그래도 시즌은 닫아주기
        await seasonRef.update({
          status: "closed",
          closedAt: serverTimestamp(),
        });
        setOut({
          ok: true,
          message: "플레이어 데이터가 없어 시즌만 종료했습니다.",
          seasonId,
        });
        alert("플레이어 데이터가 없어 시즌만 종료했습니다.");
        return;
      }

      // 3) rating 기준 정렬 → 챔피언 / 상위 N명 계산
      const sorted = players.slice().sort((a, b) => {
        const ae = a.rating || 0;
        const be = b.rating || 0;
        return be - ae;
      });

      const champion = sorted[0];

      const topPlayers = sorted.slice(0, Number(topN)).map((p, idx) => {
        const wins = p.win || 0;
        const losses = p.loss || 0;
        const totalGames = wins + losses;
        const winRate =
          totalGames > 0 ? wins / totalGames : p.winRate || 0;

        return {
          rank: idx + 1,
          playerId: p.id,
          playerName: p.playerName || "이름없음",
          elo: p.rating || 0,
          wins,
          losses,
          winRate,
        };
      });

      // 4) playerStats & seasons 업데이트 (배치)
      const batch = writeBatch(db);

      players.forEach((p) => {
        const wins = p.win || 0;
        const losses = p.loss || 0;
        const totalGames = wins + losses;
        const winRate =
          totalGames > 0 ? wins / totalGames : p.winRate || 0;

        const statId = `${seasonId}_${p.id}`;
        const statRef = doc(db, "playerStats", statId);

        batch.set(statRef, {
          seasonId,
          seasonName: seasonData.name || seasonId,
          playerId: p.id,
          playerName: p.playerName || "이름없음",
          elo: p.rating || 0,
          wins,
          losses,
          games: totalGames,
          winRate,
          snapshotAt: serverTimestamp(),
        });
      });

      // 시즌 문서 상태 + 챔피언 + TopN 기록
      batch.update(seasonRef, {
        status: "closed",
        closedAt: serverTimestamp(),
        champion: {
          playerId: champion.id,
          playerName: champion.playerName || "이름없음",
          elo: champion.rating || 0,
        },
        topN: topPlayers,
      });

      // 5) 새 시즌 생성 (옵션)
      let newSeasonDoc = null;
      if (newId) {
        const newSeasonRef = doc(db, "seasons", newId);
        const newSeasonName = newName || newId;

        batch.set(newSeasonRef, {
          id: newId,
          name: newSeasonName,
          createdAt: serverTimestamp(),
          startAt: serverTimestamp(),
          status: "active",
        });

        newSeasonDoc = { id: newId, name: newSeasonName };

        // ✅ 레이팅만 초기화: rating만 BASE_RATING으로, 승/패는 그대로 유지
        players.forEach((p) => {
          const pref = doc(db, LEAGUE_COLLECTION, p.id);
          batch.update(pref, {
            rating: BASE_RATING,
            // win: p.win || 0,    // 그대로 유지 (아예 건드리지 않으려면 이 줄도 빼는 게 더 깨끗함)
            // loss: p.loss || 0,
            // winRate는 다음 시즌부터 다시 계산되게 놔두거나 0으로 초기화해도 됨
          });
        });
      }

      await batch.commit();

if (newId && setActiveSeasonId) {
  setActiveSeasonId(newId);
}

      const result = {
        ok: true,
        seasonId,
        closed: true,
        champion: topPlayers[0],
        topPlayers,
        newSeason: newId ? newSeasonDoc : null,
        playerCount: players.length,
      };

      setOut(result);
      alert("시즌 정산이 완료되었습니다!");
    } catch (e) {
      console.error("finalizeSeason (client) error:", e);
      alert(`정산 실패: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "20px auto", color: "#e5e7eb" }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
        🧮 시즌 정산 (관리자)
      </div>
      <div style={box}>
        <div style={{ marginBottom: 10 }}>
          현재 시즌: <b>{activeSeasonId || "-"}</b>
        </div>
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 1fr 100px",
          }}
        >
          <input
            placeholder="새 시즌 ID (예: S4)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
          />
          <input
            placeholder="새 시즌 이름 (예: 2025 겨울)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            min={1}
            max={10}
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            disabled={loading}
            onClick={() => {
              setNewId("");
              setNewName("");
            }}
            style={{ padding: "10px 14px", borderRadius: 10 }}
          >
            새 시즌 없이 종료
          </button>
          <button
            disabled={loading}
            onClick={run}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 900,
              background: "#0ea5e9",
              border: "none",
              color: "#0b1020",
            }}
          >
            {loading ? "정산 중…" : "정산 실행"}
          </button>
        </div>
        {out && (
          <pre
            style={{
              marginTop: 12,
              background: "rgba(0,0,0,.35)",
              padding: 12,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(out, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
