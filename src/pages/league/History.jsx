import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';

const History = () => {
  const [matchResults, setMatchResults] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [winner, setWinner] = useState('');
  const [loser, setLoser] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      const playersRef = collection(db, 'matchApplications');
      const querySnapshot = await getDocs(playersRef);
      const playersList = [];
      querySnapshot.forEach((doc) => {
        const player = doc.data();
        if (player.playerName) playersList.push(player.playerName);
      });
      setPlayers(playersList);
    } catch (error) {
      console.error('선수 목록 불러오기 실패:', error);
    }
  };

  // 선수 기록 업데이트 함수
  const updatePlayerStats = async (winnerName, loserName) => {
    try {
      const playersRef = collection(db, 'matchApplications');

      // 승자 선수 문서 찾기
      const qWinner = query(playersRef, where('playerName', '==', winnerName));
      const winnerSnapshot = await getDocs(qWinner);
      if (winnerSnapshot.empty) {
        console.warn(`승자 ${winnerName} 문서가 없습니다.`);
        return;
      }
      const winnerDoc = winnerSnapshot.docs[0];
      const winnerData = winnerDoc.data();

      // 패자 선수 문서 찾기
      const qLoser = query(playersRef, where('playerName', '==', loserName));
      const loserSnapshot = await getDocs(qLoser);
      if (loserSnapshot.empty) {
        console.warn(`패자 ${loserName} 문서가 없습니다.`);
        return;
      }
      const loserDoc = loserSnapshot.docs[0];
      const loserData = loserDoc.data();

      // 기존 데이터 읽기 (기본값 지정)
      const winnerWin = winnerData.win || 0;
      const winnerLoss = winnerData.loss || 0;
      const winnerRating = winnerData.rating || 1000; // 기본 1000

      const loserWin = loserData.win || 0;
      const loserLoss = loserData.loss || 0;
      const loserRating = loserData.rating || 1000;

      // 승리/패배 횟수 증가
      const newWinnerWin = winnerWin + 1;
      const newWinnerLoss = winnerLoss;
      const newLoserWin = loserWin;
      const newLoserLoss = loserLoss + 1;

      // 승률 계산
      const winnerWinRate = newWinnerWin / (newWinnerWin + newWinnerLoss);
      const loserWinRate = newLoserWin / (newLoserWin + newLoserLoss);

      // 간단한 ELO 계산 (예: 기본 공식)
      // K-factor는 32로 설정, 예상 승률 계산
      const K = 32;
      const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
      const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

      const updatedWinnerRating = winnerRating + K * (1 - expectedWinner);
      const updatedLoserRating = loserRating + K * (0 - expectedLoser);

      // Firestore에 업데이트
      await updateDoc(doc(db, 'matchApplications', winnerDoc.id), {
        win: newWinnerWin,
        loss: newWinnerLoss,
        winRate: winnerWinRate,
        rating: updatedWinnerRating,
      });

      await updateDoc(doc(db, 'matchApplications', loserDoc.id), {
        win: newLoserWin,
        loss: newLoserLoss,
        winRate: loserWinRate,
        rating: updatedLoserRating,
      });

    } catch (error) {
      console.error('선수 기록 업데이트 실패:', error);
    }
  };

  const fetchMatchResults = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const qApproved = query(matchesRef, where('status', '==', 'approve'));
      const qPending = query(matchesRef, where('status', '==', 'pending'));

      // 승인된 기록
      const approvedSnapshot = await getDocs(qApproved);
      const approvedResults = [];
      for (const docSnap of approvedSnapshot.docs) {
        const data = docSnap.data();
        approvedResults.push({ id: docSnap.id, ...data });

        // 각 승인된 기록에 대해 선수 기록 업데이트
        await updatePlayerStats(data.winner, data.loser);
      }
      approvedResults.sort((a, b) => b.date.toDate() - a.date.toDate());
      setMatchResults(approvedResults);

      // 승인 대기중 기록
      const pendingSnapshot = await getDocs(qPending);
      const pendingResultsArr = [];
      pendingSnapshot.forEach((doc) => {
        pendingResultsArr.push({ id: doc.id, ...doc.data() });
      });
      pendingResultsArr.sort((a, b) => b.date.toDate() - a.date.toDate());
      setPendingResults(pendingResultsArr);

    } catch (error) {
      console.error('대전 기록 불러오기 실패:', error);
    }
  };

  const saveMatchResult = async () => {
    setMessage('');
    if (!winner || !loser || !date) {
      setMessage('날짜, 승자, 패자를 모두 입력해주세요.');
      return;
    }
    if (winner === loser) {
      setMessage('승자와 패자는 같을 수 없습니다.');
      return;
    }
    if (!players.includes(winner) || !players.includes(loser)) {
      setMessage('승자 또는 패자가 등록된 참가자가 아닙니다.');
      return;
    }
    try {
      const matchesRef = collection(db, 'matches');
      await addDoc(matchesRef, {
        date: new Date(date),
        winner,
        loser,
        status: 'pending',
        createdAt: new Date(),
      });
      setMessage('대국 결과가 저장되었습니다. 관리자의 승인을 기다려주세요.');
      setWinner('');
      setLoser('');
      setDate('');
      fetchMatchResults();
    } catch (error) {
      console.error('대국 결과 저장 실패:', error);
      setMessage('대국 결과 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchMatchResults();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">대전 기록 입력</h2>

      <div className="mb-8 border rounded p-4 shadow">
        <input
          type="text"
          placeholder="승자 이름"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          list="players-list"
          className="border rounded p-2 w-full mb-3"
        />
        <input
          type="text"
          placeholder="패자 이름"
          value={loser}
          onChange={(e) => setLoser(e.target.value)}
          list="players-list"
          className="border rounded p-2 w-full mb-3"
        />
        <datalist id="players-list">
          {players.map((player) => (
            <option key={player} value={player} />
          ))}
        </datalist>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />

        <button
          onClick={saveMatchResult}
          className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700"
        >
          대국 결과 저장 (승인 대기)
        </button>
        {message && <p className="mt-3 text-red-600">{message}</p>}
      </div>

      <h3 className="text-xl font-semibold mb-4">승인 대기 중인 대전 기록</h3>
      {pendingResults.length > 0 ? (
        <ul>
          {pendingResults.map(({ id, date, winner, loser }) => (
            <li
              key={id}
              className="border rounded p-4 mb-4 shadow hover:shadow-lg transition-shadow bg-yellow-50"
            >
              <p><strong>날짜:</strong> {new Date(date.toDate()).toLocaleDateString()}</p>
              <p><strong>승자:</strong> {winner}</p>
              <p><strong>패자:</strong> {loser}</p>
              <p className="text-sm text-gray-600">관리자 승인 대기 중</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>승인 대기 중인 대전 기록이 없습니다.</p>
      )}

      <h3 className="text-xl font-semibold mb-4 mt-8">승인된 대전 기록 목록</h3>
      {matchResults.length > 0 ? (
        <ul>
          {matchResults.map(({ id, date, winner, loser, winnerELO, loserELO, winnerWinRate, loserWinRate }) => (
            <li
              key={id}
              className="border rounded p-4 mb-4 shadow hover:shadow-lg transition-shadow"
            >
              <p><strong>날짜:</strong> {new Date(date.toDate()).toLocaleDateString()}</p>
              <p>
                <strong>승자:</strong> {winner} (ELO: {winnerELO ? Math.round(winnerELO) : 'N/A'}, 승률: {winnerWinRate ? (winnerWinRate * 100).toFixed(1) : 'N/A'}%)
              </p>
              <p>
                <strong>패자:</strong> {loser} (ELO: {loserELO ? Math.round(loserELO) : 'N/A'}, 승률: {loserWinRate ? (loserWinRate * 100).toFixed(1) : 'N/A'}%)
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>승인된 대전 기록이 없습니다.</p>
      )}
    </div>
  );
};

export default History;
