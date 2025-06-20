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
import { getPlayerELO, getMatchApplications } from '../../firebase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [eloHistory, setEloHistory] = useState([]);
  const [winProbability, setWinProbability] = useState(null);

  useEffect(() => {
    const fetchEloHistory = async () => {
      if (!playerName) return;

      const matches = await getMatchApplications(playerName);
      let currentElo = await getPlayerELO(playerName);
      let eloChanges = [];
      let dates = [];

      matches.forEach((match) => {
        const matchDate = match.date
          ? match.date instanceof Date
            ? match.date
            : match.date.toDate()
          : null;
        if (!matchDate) return;

        const winner = match.winner;
        let score = winner === playerName ? 1 : 0;
        const opponentElo = match.opponentELO;
        const kFactor = 32;
        const expectedScore =
          1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
        currentElo += kFactor * (score - expectedScore);

        eloChanges.push(Number(currentElo.toFixed(2)));
        dates.push(matchDate.toLocaleDateString());
      });

      setEloHistory({ labels: dates, data: eloChanges });
    };

    fetchEloHistory();
  }, [playerName]);

  const calculateWinProbability = async () => {
    if (!playerName || !opponentName) return;

    const playerElo = await getPlayerELO(playerName);
    const opponentElo = await getPlayerELO(opponentName);
    const expectedScore =
      1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

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

      {eloHistory.labels && eloHistory.data && (
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
                legend: {
                  position: 'top',
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: '날짜',
                  },
                },
                y: {
                  min: 1000,
                  max: 2000,
                  title: {
                    display: true,
                    text: 'ELO 레이팅',
                  },
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
        <div style={styles.winRateBox}>
          예상 승률: {winProbability}%
        </div>
      )}
    </div>
  );
};

export default LeagueAnalysis;
