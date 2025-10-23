import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// import { getMatchApplications } from '../../firebase'; // 과거 유틸: 불필요
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useSeason } from '../../contexts/SeasonContext'; // ★ 시즌 컨텍스트

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const db = getFirestore();

const styles = {
  container: {
    maxWidth: 720,
    margin: '40px auto',
    padding: '24px',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    borderRadius: 8,
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
  header: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
    borderBottom: '3px solid #374151',
    paddingBottom: 8,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 16,
    fontSize: 16,
    borderRadius: 4,
    border: '2px solid #374151',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    width: '100%',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    fontWeight: 600,
    padding: '12px 0',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: 8,
  },
  chartWrapper: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 8,
    color: '#111827',
  },
  winRateBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e0f2fe',
    borderLeft: '6px solid #2563eb',
    borderRadius: 4,
    fontSize: 16,
    fontWeight: 600,
    color: '#1e3a8a',
  },
};

const BASE_ELO = 1500;

const LeagueAnalysis = () => {
  // ★ 시즌 정보(없을 때도 안전하게)
  const seasonCtx = useSeason() || {};
  const seasonId = seasonCtx.activeSeasonId || 'S1';
  const seasons = Array.isArray(seasonCtx.seasons) ? seasonCtx.seasons : [];

  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // 1) 현재 시즌 내 ELO 변동
  const [eloHistorySeason, setEloHistorySeason] = useState({ labels: [], data: [] });
  // 2) 시즌별 최종 ELO(= playerStats.elo)
  const [eloBySeason, setEloBySeason] = useState({ labels: [], data: [] });

  const [winProbability, setWinProbability] = useState(null);

  const currSeasonName =
    seasons.find((s) => s.id === seasonId)?.name || seasonId;

  // 현재 시즌 + 승인된 경기에서 플레이어 매치 가져오기
  const getMatchesByPlayerInSeason = async (player) => {
    if (!player) return [];
    try {
      const matchesRef = collection(db, 'matches');

      const qWinner = query(
        matchesRef,
        where('seasonId', '==', seasonId),
        where('status', '==', 'approve'),
        where('winner', '==', player)
      );
      const qLoser = query(
        matchesRef,
        where('seasonId', '==', seasonId),
        where('status', '==', 'approve'),
        where('loser', '==', player)
      );

      const [winnerSnap, loserSnap] = await Promise.all([getDocs(qWinner), getDocs(qLoser)]);
      const winnerMatches = winnerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const loserMatches = loserSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return [...winnerMatches, ...loserMatches];
    } catch (error) {
      console.error('getMatchesByPlayerInSeason error:', error);
      return [];
    }
  };

  // 1) 현재 시즌 내 ELO 변동 시리즈 구성
  useEffect(() => {
    const buildSeasonEloSeries = async () => {
      if (!playerName) {
        setEloHistorySeason({ labels: [], data: [] });
        return;
      }
      try {
        const matches = await getMatchesByPlayerInSeason(playerName);

        const points = matches
          .map((m) => {
            const raw = m.date || m.createdAt;
            const at = raw?.toDate ? raw.toDate() : raw;
            if (!at) return null;
            const elo =
              m.winner === playerName
                ? m.winnerELO
                : m.loser === playerName
                ? m.loserELO
                : null;
            if (elo == null) return null;
            return { at, elo };
          })
          .filter(Boolean)
          .sort((a, b) => a.at - b.at);

        setEloHistorySeason({
          labels: points.map((p) => p.at.toLocaleDateString()),
          data: points.map((p) => p.elo),
        });
      } catch (e) {
        console.error('buildSeasonEloSeries error:', e);
        setEloHistorySeason({ labels: [], data: [] });
      }
    };

    buildSeasonEloSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, seasonId]);

  // 2) 시즌별 최종 ELO(= playerStats.elo) 시계열
  const buildEloAcrossSeasons = async (player) => {
    if (!player) {
      setEloBySeason({ labels: [], data: [] });
      return;
    }
    try {
      const statsRef = collection(db, 'playerStats');
      const snap = await getDocs(query(statsRef, where('playerName', '==', player)));

      const rows = snap.docs.map((d) => {
        const s = d.data();
        return { seasonId: s.seasonId, elo: s.elo ?? BASE_ELO };
      });

      // seasons 컨텍스트 기준으로 라벨/정렬
      const seasonOrder = [...seasons].sort((a, b) => {
        const aKey = a.startAt?.toMillis?.() ?? 0;
        const bKey = b.startAt?.toMillis?.() ?? 0;
        if (aKey === bKey) return (a.name || a.id).localeCompare(b.name || b.id);
        return aKey - bKey;
      });

      const bySeasonId = {};
      rows.forEach((r) => {
        bySeasonId[r.seasonId] = r.elo;
      });

      if (seasonOrder.length > 0) {
        const labels = seasonOrder.map((s) => s.name || s.id);
        const data = seasonOrder.map((s) => (bySeasonId[s.id] ?? null));
        setEloBySeason({ labels, data });
      } else {
        // 컨텍스트가 비어있으면 stats로 유추
        const uniqueIds = Array.from(new Set(rows.map((r) => r.seasonId))).sort();
        setEloBySeason({
          labels: uniqueIds,
          data: uniqueIds.map((sid) => rows.find((r) => r.seasonId === sid)?.elo ?? null),
        });
      }
    } catch (e) {
      console.error('buildEloAcrossSeasons error:', e);
      setEloBySeason({ labels: [], data: [] });
    }
  };

  // 플레이어 변경/시즌 목록 변경 시 시즌별 시계열 갱신
  useEffect(() => {
    buildEloAcrossSeasons(playerName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, seasons]);

  // 현재 시즌의 최신 레이팅(= playerStats[seasonId].elo)으로 승률 계산
  const getLatestRatingInActiveSeason = async (player) => {
    if (!player) return null;
    try {
      const statsRef = collection(db, 'playerStats');
      const snap = await getDocs(
        query(statsRef, where('seasonId', '==', seasonId), where('playerName', '==', player))
      );
      if (snap.empty) return null;
      const s = snap.docs[0].data();
      return s.elo ?? null;
    } catch (error) {
      console.error('getLatestRatingInActiveSeason error:', error);
      return null;
    }
  };

  const calculateWinProbability = async () => {
    if (!playerName || !opponentName) {
      alert('선수 이름과 상대방 이름을 모두 입력해주세요.');
      return;
    }

    const playerRating = await getLatestRatingInActiveSeason(playerName);
    const opponentRating = await getLatestRatingInActiveSeason(opponentName);

    if (playerRating === null || opponentRating === null) {
      alert('선수 또는 상대방의 최신 레이팅을 찾을 수 없습니다.');
      setWinProbability(null);
      return;
    }

    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    setWinProbability((expectedScore * 100).toFixed(2));
  };

  // 공통 차트 옵션
  const makeLineOptions = (yLabel = 'ELO', yData = []) => {
    const numeric = yData.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const hasData = numeric.length > 0;
    return {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
      },
      scales: {
        x: { title: { display: true, text: '날짜/시즌' } },
        y: {
          title: { display: true, text: yLabel },
          min: hasData ? Math.min(...numeric) - 50 : undefined,
          max: hasData ? Math.max(...numeric) + 50 : undefined,
        },
      },
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>ELO 변동 분석</h2>

      <input
        type="text"
        placeholder="선수 이름 입력"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        style={styles.input}
      />

      {/* 1) 현재 시즌 내 ELO 변동 */}
      {eloHistorySeason.labels.length > 0 && eloHistorySeason.data.length > 0 && (
        <>
          <div style={styles.sectionTitle}>현재 시즌({currSeasonName}) ELO 변동</div>
          <div style={styles.chartWrapper}>
            <Line
              data={{
                labels: eloHistorySeason.labels,
                datasets: [
                  {
                    label: `${playerName} - ${currSeasonName}`,
                    data: eloHistorySeason.data,
                    borderColor: '#2563eb',
                    backgroundColor: '#bfdbfe',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false,
                  },
                ],
              }}
              options={makeLineOptions('ELO', eloHistorySeason.data)}
            />
          </div>
        </>
      )}

      {/* 2) 시즌별 최종 ELO 추이 */}
      {eloBySeason.labels.length > 0 && eloBySeason.data.length > 0 && (
        <>
          <div style={styles.sectionTitle}>시즌별 최종 ELO 추이</div>
          <div style={styles.chartWrapper}>
            <Line
              data={{
                labels: eloBySeason.labels,
                datasets: [
                  {
                    label: `${playerName} - 시즌별 최종 ELO`,
                    data: eloBySeason.data,
                    borderColor: '#0ea5e9',
                    backgroundColor: '#bae6fd',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false,
                  },
                ],
              }}
              options={makeLineOptions('ELO', eloBySeason.data)}
            />
          </div>
        </>
      )}

      <input
        type="text"
        placeholder="상대방 이름 입력"
        value={opponentName}
        onChange={(e) => setOpponentName(e.target.value)}
        style={styles.input}
      />

      <button style={styles.button} onClick={calculateWinProbability}>
        예상 승률 계산 (현재 시즌 기준)
      </button>

      {winProbability !== null && (
        <div style={styles.winRateBox}>예상 승률: {winProbability}%</div>
      )}
    </div>
  );
};

export default LeagueAnalysis;
