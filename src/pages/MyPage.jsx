import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const MyPage = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);

  const rankImages = {
    챌린저: "/images/챌린저.jpg",
    그랜드마스터: "/images/그랜드마스터.jpg",
    마스터: "/images/마스터.jpg",
    다이아: "/images/다이아.jpg",
    플래티넘: "/images/플래티넘.jpg",
    골드: "/images/골드.jpg",
    실버: "/images/실버.jpg",
    브론즈: "/images/브론즈.jpg",
  };

  const getRank = (playerName, allMatches) => {
    // rating 기준 내림차순 정렬
    const sorted = [...allMatches].sort((a, b) => b.rating - a.rating);

    // 현재 선수 index (순위)
    const playerIndex = sorted.findIndex(match => match.playerName === playerName);
    if (playerIndex === -1) return "랭크 없음";

    const rating = sorted[playerIndex].rating;

    // 다이아 랭크 기준
    if (rating >= 1576) {
      if (playerIndex === 0) return "챌린저"; // 1위
      if (playerIndex >= 1 && playerIndex <= 3) return "그랜드마스터"; // 2~4위
      if (playerIndex >= 4 && playerIndex <= 9) return "마스터"; // 5~10위
      return "다이아"; // 11위 이하 다이아
    }

    if (rating >= 1551 && rating <= 1575) return "플래티넘";
    if (rating >= 1526 && rating <= 1550) return "골드";
    if (rating >= 1501 && rating <= 1525) return "실버";
    if (rating <= 1500) return "브론즈";

    return "랭크 없음";
  };

  // userData, matchData가 모두 준비된 경우에만 rank 계산
  const rank = userData && matchData ? getRank(userData.name, matchData) : null;
  const rankImgSrc = rank ? rankImages[rank] : null;

  const fetchUserData = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setError("사용자 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      setError("사용자 데이터를 가져오는 데 실패했습니다.");
      console.error(err);
    }
  };

  const fetchAllMatchData = async () => {
    try {
      const matchQueryRef = collection(db, "matchApplications");
      const querySnapshot = await getDocs(matchQueryRef);
      if (!querySnapshot.empty) {
        const matches = querySnapshot.docs.map(doc => doc.data());
        setMatchData(matches);
      } else {
        setError("매치 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      setError("매치 데이터를 가져오는 데 실패했습니다.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUserData(userId);
    fetchAllMatchData();
  }, [userId]);

  if (error) return <div>{error}</div>;
  if (!userData || !matchData) return <div>로딩 중...</div>;

  const getStaminaRank = (stamina) => {
    return stamina >= 1000
      ? `${Math.floor((stamina - 1000) / 100) + 1}단`
      : `${18 - Math.floor(stamina / 50)}급`;
  };

  // 현재 사용자 매치 데이터 찾기
  const myMatch = matchData.find(match => match.playerName === userData.name);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">마이페이지</h1>

      <div className="mb-6">
        <h2 className="text-xl">사용자 정보</h2>
        <p><strong>이름:</strong> {userData.name}</p>
        <p><strong>역할:</strong> {userData.admin ? "admin" : userData.role}</p>
        <div>
          <label htmlFor="notificationsEnabled" className="mr-2">알림:</label>
          <input
            type="checkbox"
            id="notificationsEnabled"
            checked={userData.notificationsEnabled}
            onChange={async () => {
              try {
                const updatedNotifications = !userData.notificationsEnabled;
                const userDocRef = doc(db, "users", userId);
                await updateDoc(userDocRef, { notificationsEnabled: updatedNotifications });
                setUserData(prev => ({ ...prev, notificationsEnabled: updatedNotifications }));
              } catch (err) {
                console.error("알림 설정 업데이트 실패:", err);
              }
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">완료한 보스 및 퀘스트</h2>
        <div>
          <p><strong>보스 완료:</strong> {Array.isArray(userData.BossCompleted) ? userData.BossCompleted.filter(Boolean).length : 0} / {Array.isArray(userData.BossCompleted) ? userData.BossCompleted.length : 0}</p>
          {Array.isArray(userData.BossCompleted) && userData.BossCompleted.map((completed, index) => completed && <p key={index}>- 보스 {index + 1}</p>)}
        </div>
        <div>
          <p><strong>퀘스트 완료:</strong> {Array.isArray(userData.questsCompleted) ? userData.questsCompleted.filter(Boolean).length : 0} / {Array.isArray(userData.questsCompleted) ? userData.questsCompleted.length : 0}</p>
          {Array.isArray(userData.questsCompleted) && userData.questsCompleted.map((completed, index) => completed && <p key={index}>- 퀘스트 {index + 1}</p>)}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">매치 데이터</h2>
        {myMatch ? (
          <>
            <p>
              <strong>레이팅:</strong> {myMatch.rating} ({rank}){" "}
              {rankImgSrc && (
                <img
                  src={rankImgSrc}
                  alt={`${rank} 랭크 이미지`}
                  style={{ width: 40, height: 40, verticalAlign: "middle", marginLeft: 8 }}
                />
              )}
            </p>
            <p><strong>승:</strong> {myMatch.wins}</p>
            <p><strong>패:</strong> {myMatch.losses}</p>
            <p><strong>승률:</strong> {(myMatch.winRate ? (myMatch.winRate * 100).toFixed(2) : "0.00")}%</p>
            <p><strong>기력:</strong> {getStaminaRank(myMatch.stamina)}</p>
          </>
        ) : (
          <p>매치 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default MyPage;
