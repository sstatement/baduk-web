import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firebase 연결
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore 관련 함수

// ELO에 따른 랭크 계산 함수
const getRank = (rating, rankIndex) => {
  if (rating >= 1576) {
    if (rankIndex >= 1 && rankIndex <= 1) {
      return { rank: "챌린저", color: "bg-sky-500" };  
    } else if (rankIndex >= 2 && rankIndex <= 4) {
      return { rank: "그랜드 마스터", color: "bg-red-500" };  
    } else if (rankIndex >= 5 && rankIndex <= 10) {
      return { rank: "마스터", color: "bg-purple-500" };  
    } else {
      return { rank: "다이아", color: "bg-blue-500" };  
    }
  }
  
  if (rating >= 1551) {
    return { rank: "플래티넘", color: "bg-blue-400" };
  } else if (rating >= 1526) {
    return { rank: "골드", color: "bg-yellow-500" };
  } else if (rating >= 1501) {
    return { rank: "실버", color: "bg-gray-400" };
  } else {
    return { rank: "브론즈", color: "bg-brown-500" };
  }
};

const Ranking = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore에서 리그 순위 데이터를 가져오는 함수
  const fetchRankings = async () => {
    try {
      const applicationsRef = collection(db, 'matchApplications');
      const q = query(applicationsRef, orderBy('rating', 'desc')); 
      const querySnapshot = await getDocs(q);

      const rankingData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        playerName: doc.data().playerName,
        rating: doc.data().rating,
        stamina: doc.data().stamina,
        createdAt: doc.data().createdAt.toDate(),
        wins: doc.data().wins || 0, 
        losses: doc.data().losses || 0, 
        createdAt: doc.data().createdAt.toDate(),
      }));

      setPlayers(rankingData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      setLoading(false);
    }
  };

  // 대국 결과 업데이트 함수 (승자/패자 입력 후 승수, 패수 업데이트)
  const updateMatchResults = async (winnerId, loserId) => {
    try {
      // 승자 문서 업데이트
      const winnerRef = doc(db, 'matchApplications', winnerId);
      const winnerDoc = await getDoc(winnerRef);
      const winnerData = winnerDoc.data();
      await updateDoc(winnerRef, {
        wins: winnerData.wins + 1,
      });

      // 패자 문서 업데이트
      const loserRef = doc(db, 'matchApplications', loserId);
      const loserDoc = await getDoc(loserRef);
      const loserData = loserDoc.data();
      await updateDoc(loserRef, {
        losses: loserData.losses + 1,
      });

      // 승수/패수 반영 후, 순위 업데이트
      fetchRankings();  // 순위 업데이트 호출
    } catch (error) {
      console.error("Error updating match results:", error);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!players || players.length === 0) {
    return <div>선수 데이터가 없습니다.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">리그 순위표</h2>
      <table className="min-w-full table-auto border-collapse border">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">순위</th>
            <th className="px-4 py-2 border-b">선수명</th>
            <th className="px-4 py-2 border-b">ELO</th>
            <th className="px-4 py-2 border-b">랭크</th>
            <th className="px-4 py-2 border-b">급수/단수</th>
            <th className="px-4 py-2 border-b">승</th>
            <th className="px-4 py-2 border-b">패</th>
            <th className="px-4 py-2 border-b">승률</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => {
            // getRank 함수에서 반환하는 값을 안전하게 처리
            const { rank, color } = getRank(player.rating, index + 1);
            const winRate = player.wins + player.losses === 0 ? 0 : (player.wins / (player.wins + player.losses) * 100).toFixed(2); 
            return (
              <tr key={player.id}>
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{player.playerName}</td>
                <td className="px-4 py-2 border-b">{player.rating}</td>
                <td className={`px-4 py-2 border-b ${color}`}>{rank}</td>
                <td className="border-b p-2">
                  {player.stamina >= 1000 ? `${Math.floor((player.stamina - 1000) / 100) + 1}단` : `${18 - Math.floor(player.stamina / 50)}급`}
                </td>
                <td className="px-4 py-2 border-b">{player.wins}</td>
                <td className="px-4 py-2 border-b">{player.losses}</td>
                <td className="px-4 py-2 border-b">{winRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Ranking;
