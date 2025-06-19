// components/RankingPreview.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import "../App.css"; // ✅ css 파일 임포트

const RankingPreview = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const q = query(
          collection(db, "matchApplications"),
          orderBy("rating", "desc")
        );
        const snapshot = await getDocs(q);

        const top5 = snapshot.docs.slice(0, 5).map((doc) => doc.data());
        setPlayers(top5);
      } catch (error) {
        console.error("랭킹 데이터 가져오기 실패:", error);
      }
    };

    fetchTopPlayers();
  }, []);

  return (
    <div className="ranking-preview-container">
      <h3 className="ranking-preview-title">🏆 리그 TOP 5</h3>
      <div className="flex flex-col gap-3">
        {players.map((player, index) => (
          <div key={index} className="ranking-preview-card">
            <div className="ranking-preview-player">
              {index + 1}위 - {player.playerName}
            </div>
            <div className="ranking-preview-rating">레이팅: {player.rating}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPreview;
