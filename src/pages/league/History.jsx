import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firebase 연결
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'; // Firestore 관련 함수

const History = () => {
  const [matchResults, setMatchResults] = useState([]); // 대전 기록
  const [winner, setWinner] = useState(''); // 승자
  const [loser, setLoser] = useState(''); // 패자
  const [date, setDate] = useState(''); // 대국 날짜
  const [message, setMessage] = useState(''); // 메시지 출력
  const [players, setPlayers] = useState([]); // 참가자 목록
  const [eloData, setEloData] = useState({}); // ELO 점수 데이터
  const [winLossData, setWinLossData] = useState({}); // 승수/패수 데이터

  // ELO 점수 업데이트 함수
  const calculateELO = (winnerELO, loserELO) => {
    const k = 32; // 가중치 (K-factor)
    const expectedWinner = 1 / (1 + Math.pow(10, (loserELO - winnerELO) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerELO - loserELO) / 400));

    const newWinnerELO = winnerELO + k * (1 - expectedWinner);
    const newLoserELO = loserELO + k * (0 - expectedLoser);

    return { newWinnerELO, newLoserELO };
  };

  // 대전 기록을 가져오는 함수
  const fetchMatchResults = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const querySnapshot = await getDocs(matchesRef);
      const results = [];
      querySnapshot.forEach(doc => {
        results.push(doc.data());
      });
      setMatchResults(results);
    } catch (error) {
      console.error('Error fetching match results:', error);
    }
  };

  // 참가자 목록을 가져오는 함수
  const fetchPlayers = async () => {
    try {
      const playersRef = collection(db, 'matchApplications');
      const querySnapshot = await getDocs(playersRef);
      const playersList = [];
      querySnapshot.forEach(doc => {
        const player = doc.data();
        playersList.push(player);
        setEloData(prev => ({ ...prev, [player.playerName]: player.rating }));
        setWinLossData(prev => ({
          ...prev,
          [player.playerName]: { wins: player.wins || 0, losses: player.losses || 0 }
        }));
      });
      setPlayers(playersList);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // 대국 결과 저장하는 함수
  const saveMatchResult = async () => {
    // 승자와 패자가 동일하면 오류 메시지 출력
    if (winner === loser) {
      setMessage('승자와 패자는 같을 수 없습니다.');
      return;
    }

    // 승자와 패자가 등록된 참가자가 아니라면 오류 메시지 출력
    if (!players.some(player => player.playerName === winner) || !players.some(player => player.playerName === loser)) {
      setMessage('승자나 패자가 등록된 참가자가 아닙니다.');
      return;
    }

    // 기존 ELO 값 가져오기
    const winnerELO = eloData[winner];
    const loserELO = eloData[loser];

    // ELO 점수 계산
    const { newWinnerELO, newLoserELO } = calculateELO(winnerELO, loserELO);

    // 승수, 패수 갱신
    const newWinLossData = { ...winLossData };
    newWinLossData[winner].wins += 1;
    newWinLossData[loser].losses += 1;

    // 승률 계산
    const calculateWinRate = (wins, losses) => {
      return wins / (wins + losses);
    };

    const newWinnerWinRate = calculateWinRate(newWinLossData[winner].wins, newWinLossData[winner].losses);
    const newLoserWinRate = calculateWinRate(newWinLossData[loser].wins, newWinLossData[loser].losses);

    try {
      // Firestore에 대국 결과 저장
      const matchesRef = collection(db, 'matches');
      await addDoc(matchesRef, {
        date: new Date(date),
        winner,
        loser,
        winnerELO: newWinnerELO,
        loserELO: newLoserELO,
        winnerWinRate: newWinnerWinRate,
        loserWinRate: newLoserWinRate
      });

      // 참가자의 ELO 점수 및 승수/패수, 승률 업데이트
      const winnerRef = doc(db, 'matchApplications', winner);
      const loserRef = doc(db, 'matchApplications', loser);

      await updateDoc(winnerRef, {
        rating: newWinnerELO,
        wins: newWinLossData[winner].wins,
        losses: newWinLossData[winner].losses,
        winRate: newWinnerWinRate
      });
      await updateDoc(loserRef, {
        rating: newLoserELO,
        wins: newWinLossData[loser].wins,
        losses: newWinLossData[loser].losses,
        winRate: newLoserWinRate
      });

      setMessage('대국 결과가 저장되었습니다!');
      fetchMatchResults(); // 결과 저장 후 대전 기록을 갱신
      setEloData({ ...eloData, [winner]: newWinnerELO, [loser]: newLoserELO }); // ELO 데이터 업데이트
      setWinLossData(newWinLossData); // 승수/패수 데이터 업데이트
    } catch (error) {
      console.error('Error saving match result:', error);
      setMessage('대국 결과 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    fetchMatchResults(); // 페이지 로딩 시 대전 기록을 가져옴
    fetchPlayers(); // 참가자 목록 가져오기
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">대전 기록</h2>

      {/* 대국 결과 입력 폼 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="승자 이름"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="패자 이름"
          value={loser}
          onChange={(e) => setLoser(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <button
          onClick={saveMatchResult}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          대국 결과 저장
        </button>
      </div>

      {/* 메시지 출력 */}
      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* 대전 기록 목록 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">대전 기록 목록</h3>
        {matchResults.length > 0 ? (
          <ul>
            {matchResults.map((match, index) => (
              <li key={index} className="mb-2">
                <p><strong>날짜:</strong> {new Date(match.date.toDate()).toLocaleDateString()}</p>
                <p><strong>승자:</strong> {match.winner}</p>
                <p><strong>패자:</strong> {match.loser}</p>
                <p><strong>승자 ELO:</strong> {match.winnerELO}</p>
                <p><strong>패자 ELO:</strong> {match.loserELO}</p>
                <hr className="my-2" />
              </li>
            ))}
          </ul>
        ) : (
          <p>현재 대전 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default History;
