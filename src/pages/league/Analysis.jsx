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
import { getMatchApplications } from '../../firebase';
import { 
  getFirestore, collection, query, where, getDocs 
} from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const db = getFirestore();  // Firebase Firestore 인스턴스

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

const LeagueAnalysis = () => {
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [eloHistory, setEloHistory] = useState({ labels: [], data: [] });
  const [winProbability, setWinProbability] = useState(null);

  // Firestore 'matches' 컬렉션에서 선수 이름 포함된 approve 상태 경기 가져오기
  const getMatchesByPlayer = async (player) => {
    if (!player) return [];

    try {
      const matchesRef = collection(db, 'matches');
      // status == 'approve' AND (winner == player OR loser == player)
      // Firestore 쿼리는 OR 조건 직접 지원하지 않아 2개 쿼리 병합 필요
      const qWinner = query(matchesRef, where('status', '==', 'approve'), where('winner', '==', player));
      const qLoser = query(matchesRef, where('status', '==', 'approve'), where('loser', '==', player));

      const [winnerSnap, loserSnap] = await Promise.all([getDocs(qWinner), getDocs(qLoser)]);
      
      const winnerMatches = winnerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const loserMatches = loserSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return [...winnerMatches, ...loserMatches];
    } catch (error) {
      console.error('getMatchesByPlayer error:', error);
      return [];
    }
  };

  // 선수 이름 입력 변경 시, matchApplications와 matches 합쳐서 ELO 변동 그래프 데이터 만들기
  useEffect(() => {
    const fetchEloHistory = async () => {
      if (!playerName) {
        setEloHistory({ labels: [], data: [] });
        return;
      }

      try {
        // 1) 기존 matchApplications 데이터 가져오기
        const applications = await getMatchApplications(playerName);
        const filteredApps = applications.filter(
          (m) => m.status === 'approve' && (m.winner === playerName || m.loser === playerName)
        );

        // 2) Firestore matches 컬렉션에서 데이터 가져오기
        const firestoreMatches = await getMatchesByPlayer(playerName);

        // 3) 둘 다 합치기
        const combined = [...filteredApps, ...firestoreMatches];

        // 4) createdAt 혹은 date 필드 가져오기 (둘 중에 있는 걸로)
        // firestoreMatches는 createdAt, applications는 date 일 수도 있음
        const processed = combined
          .map((match) => {
            // createdAt 또는 date 둘 중 있는 걸로 변환
            const createdAtRaw = match.createdAt || match.date;
            const createdAt = createdAtRaw instanceof Date ? createdAtRaw : createdAtRaw?.toDate?.();
            if (!createdAt) return null;

            // 선수 위치에 따른 ELO 값
            let elo = null;
            if (match.winner === playerName) elo = match.winnerELO || match.rating || null;
            else if (match.loser === playerName) elo = match.loserELO || match.rating || null;

            return {
              createdAt,
              elo,
            };
          })
          .filter((item) => item !== null && item.elo !== null);

        // 5) 날짜 오름차순 정렬
        processed.sort((a, b) => a.createdAt - b.createdAt);

        // 6) 날짜, ELO 분리
        const labels = processed.map((p) => p.createdAt.toLocaleDateString());
        const data = processed.map((p) => p.elo);

        setEloHistory({ labels, data });
      } catch (error) {
        console.error('fetchEloHistory error:', error);
        setEloHistory({ labels: [], data: [] });
      }
    };

    fetchEloHistory();
  }, [playerName]);

  // 예상 승률 계산 (기존 함수 재활용)
  const getLatestRating = async (player) => {
    if (!player) return null;

    try {
      // 기존 matchApplications 기반
      const matches = await getMatchApplications(player);
      const filtered = matches.filter((m) => m.playerName === player);
      if (filtered.length === 0) return null;

      filtered.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : a.date.toDate();
        const dateB = b.date instanceof Date ? b.date : b.date.toDate();
        return dateB - dateA;
      });

      return filtered[0].rating || null;
    } catch (error) {
      console.error('getLatestRating error:', error);
      return null;
    }
  };

  const calculateWinProbability = async () => {
    if (!playerName || !opponentName) {
      alert('선수 이름과 상대방 이름을 모두 입력해주세요.');
      return;
    }

    const playerRating = await getLatestRating(playerName);
    const opponentRating = await getLatestRating(opponentName);

    if (playerRating === null || opponentRating === null) {
      alert('선수 또는 상대방의 최신 레이팅을 찾을 수 없습니다.');
      setWinProbability(null);
      return;
    }

    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    setWinProbability((expectedScore * 100).toFixed(2));
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

      {eloHistory.labels.length > 0 && eloHistory.data.length > 0 && (
        <div style={styles.chartWrapper}>
          <Line
            data={{
              labels: eloHistory.labels,
              datasets: [
                {
                  label: `${playerName} ELO 변동`,
                  data: eloHistory.data,
                  borderColor: '#2563eb',
                  backgroundColor: '#bfdbfe',
                  borderWidth: 2,
                  tension: 0.3,
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: false },
              },
              scales: {
                x: { title: { display: true, text: '날짜' } },
                y: { 
                  title: { display: true, text: 'ELO' },
                  min: Math.min(...eloHistory.data) - 50,
                  max: Math.max(...eloHistory.data) + 50,
                },
              },
            }}
          />
        </div>
      )}

      <input
        type="text"
        placeholder="상대방 이름 입력"
        value={opponentName}
        onChange={(e) => setOpponentName(e.target.value)}
        style={styles.input}
      />

      <button style={styles.button} onClick={calculateWinProbability}>
        예상 승률 계산
      </button>

      {winProbability !== null && (
        <div style={styles.winRateBox}>예상 승률: {winProbability}%</div>
      )}
    </div>
  );
};

export default LeagueAnalysis;
