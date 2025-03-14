import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getPlayerELO, getMatchApplications } from '../../firebase';  // Firestore에서 경기 및 ELO 데이터를 가져오는 함수

// Chart.js에 필요한 스케일 및 요소 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LeagueAnalysis = () => {
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');  // 상대방 이름 입력 상태
  const [eloHistory, setEloHistory] = useState([]);
  const [winProbability, setWinProbability] = useState(null);  // 예상 승률 상태

  // 선수 이름이 변경될 때마다 ELO 변동 데이터를 가져옵니다.
  useEffect(() => {
    const fetchEloHistory = async () => {
      if (playerName) {  // 플레이어 이름이 있을 때만 실행
        // matchApplications에서 내 경기 데이터를 가져옵니다.
        const matches = await getMatchApplications(playerName);
        let currentElo = await getPlayerELO(playerName);  // 시작 ELO 값
        let eloChanges = [];
        let dates = [];

        // 경기 결과를 바탕으로 ELO 변동을 계산
        matches.forEach(match => {
          // match.date가 존재할 경우에만 toDate()를 호출
          const matchDate = match.date ? (match.date instanceof Date ? match.date : match.date.toDate()) : null;
          if (matchDate) {
            const winner = match.winner;
            let score = 0;  // score 변수 정의

            // 승패에 따라 score 값을 설정
            if (winner === playerName) {
              score = 1;  // 승리
            } else if (winner !== playerName && winner !== null) {
              score = 0;  // 패배
            }

            // 상대방의 ELO 값을 가져오기
            const opponentElo = match.opponentELO;
            const kFactor = 32;  // K-factor (ELO의 변화량)
            const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400)); // 예상 승률 계산
            currentElo += kFactor * (score - expectedScore);  // ELO 업데이트
            eloChanges.push(currentElo.toFixed(2));  // ELO 변동 기록
            dates.push(matchDate.toLocaleDateString());  // 경기 날짜 기록
          }
        });

        // ELO 변동 데이터 세팅
        setEloHistory({ labels: dates, data: eloChanges });
      }
    };

    fetchEloHistory();
  }, [playerName]);  // 플레이어 이름이 변경될 때마다 실행

  const calculateWinProbability = async () => {
    if (playerName && opponentName) {
      // Firestore에서 상대방의 ELO를 가져옵니다.
      const playerElo = await getPlayerELO(playerName);
      const opponentElo = await getPlayerELO(opponentName);

      // 상대 ELO와 나의 ELO를 비교하여 예상 승률을 계산
      const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
      setWinProbability((expectedScore * 100).toFixed(2));  // 예상 승률을 퍼센트로 계산하여 상태에 저장
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">ELO 변동 분석</h2>

      {/* 선수 이름 입력 */}
      <input 
        type="text" 
        placeholder="선수 이름 입력" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)} 
      />

      {/* ELO 변동 그래프 */}
      {eloHistory.labels && eloHistory.data && (
        <Line
          data={{
            labels: eloHistory.labels,
            datasets: [
              {
                label: `${playerName} ELO 변동`,
                data: eloHistory.data,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              x: {
                type: 'category', // 날짜를 x축에 표시
                title: {
                  display: true,
                  text: '날짜',
                },
              },
              y: {
                type: 'linear',
                min: 1400, // ELO 최소값
                max: 1800, // ELO 최대값
                title: {
                  display: true,
                  text: 'ELO 레이팅',
                },
              },
            },
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
          }}
        />
      )}

      {/* 상대방 이름 입력 */}
      <input 
        type="text" 
        placeholder="상대방 이름 입력" 
        value={opponentName} 
        onChange={(e) => setOpponentName(e.target.value)} 
      />

      {/* 예상 승률 계산 버튼 */}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
        onClick={calculateWinProbability}
      >
        예상 승률 계산
      </button>

      {/* 예상 승률 결과 */}
      {winProbability !== null && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">예상 승률: {winProbability}%</h3>
        </div>
      )}
    </div>
  );
};

export default LeagueAnalysis;
