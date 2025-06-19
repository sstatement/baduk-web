import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firebase 연결
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore 관련 함수


const getRankImage = (rank) => {
  if(rank=="브론즈")
  {
    return <img src="/images/브론즈.jpg" alt="브론즈" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="실버")
  {
    return <img src="/images/실버.jpg" alt="실버" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="골드")
  {
    return <img src="/images/골드.jpg" alt="골드" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="플래티넘")
  {
    return <img src="/images/플래티넘.jpg" alt="플래티넘" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="다이아")
  {
    return <img src="/images/다이아.jpg" alt="다이아" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="마스터")
  {
    return <img src="/images/마스터.jpg" alt="마스터" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="그랜드마스터")
  {
    return <img src="/images/그랜드마스터.jpg" alt="그랜드마스터" style={{ width: "40px", height: "40px" }} />
  }
  if(rank=="챌린저")
  {
    return <img src="/images/챌린저.jpg" alt="챌린저" style={{ width: "40px", height: "40px" }} />
  }
};
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
        win: doc.data().win || 0, 
        loss: doc.data().loss || 0, 
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
        win: winnerData.win + 1,
      });

      // 패자 문서 업데이트
      const loserRef = doc(db, 'matchApplications', loserId);
      const loserDoc = await getDoc(loserRef);
      const loserData = loserDoc.data();
      await updateDoc(loserRef, {
        loss: loserData.loss + 1,
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
            const winRate = player.win + player.loss === 0 ? 0 : (player.win / (player.win + player.loss) * 100).toFixed(2); 
            return (
              <tr key={player.id}>
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{player.playerName}</td>
                <td className="px-4 py-2 border-b">{player.rating}</td>
                
                <td className={`px-4 py-2 border-b ${color}`}>
                  {getRankImage(rank)}{rank}</td>
                <td className="border-b p-2">
                  {player.stamina >= 1000 ? `${Math.floor((player.stamina - 1000) / 100) + 1}단` : `${18 - Math.floor(player.stamina / 50)}급`}
                </td>
                <td className="px-4 py-2 border-b">{player.win}</td>
                <td className="px-4 py-2 border-b">{player.loss}</td>
                <td className="px-4 py-2 border-b">{winRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
<h2 className="text-xl font-semibold mb-4">랭크 기준표</h2>
<table className="table-auto border border-gray-300 w-full text-center text-sm">
  <thead className="bg-gray-100">
    <tr><th className="border px-4 py-2">사진</th>
      <th className="border px-4 py-2">랭크</th>
      <th className="border px-4 py-2">조건</th>
    </tr>
  </thead>
  <tbody>
    <tr className="bg-yellow-100 font-bold">
      <img src="/images/챌린저.jpg" alt="챌린저" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">챌린저</td>
      <td className="border px-4 py-2">다이아 랭크 중 1위</td>
    </tr>
    <tr className="bg-yellow-100">
      <img src="/images/그랜드마스터.jpg" alt="그랜드마스터" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">그랜드마스터</td>
      <td className="border px-4 py-2">다이아 랭크 중 2위 ~ 4위</td>
    </tr>
    <tr className="bg-yellow-100">
      <img src="/images/마스터.jpg" alt="마스터" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">마스터</td>
      <td className="border px-4 py-2">다이아 랭크 중 5위 ~ 10위</td>
    </tr>
    <tr className="bg-blue-100">
      <img src="/images/다이아.jpg" alt="다이아" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">다이아</td>
      <td className="border px-4 py-2">레이팅 1576 이상</td>
    </tr>
    <tr className="bg-teal-100">
      <img src="/images/플래티넘.jpg" alt="플래티넘" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">플래티넘</td>
      <td className="border px-4 py-2">레이팅 1551 ~ 1575</td>
    </tr>
    <tr className="bg-green-100">
      <img src="/images/골드.jpg" alt="골드" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">골드</td>
      <td className="border px-4 py-2">레이팅 1526 ~ 1550</td>
    </tr>
    <tr className="bg-gray-200">
      <img src="/images/실버.jpg" alt="실버" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">실버</td>
      <td className="border px-4 py-2">레이팅 1501 ~ 1525</td>
    </tr>
    <tr className="bg-orange-100">
      <img src="/images/브론즈.jpg" alt="브론즈" style={{ width: "80px", height: "80px" }} />
      <td className="border px-4 py-2">브론즈</td>
      <td className="border px-4 py-2">레이팅 1500 이하</td>
    </tr>
  </tbody>
</table>


    </div>

    
  );
};

export default Ranking;
