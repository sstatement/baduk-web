import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // firebase 초기화 파일 경로

const MyPage = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);

  // 사용자 데이터 가져오기
  const fetchUserData = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        console.log("✅ 사용자 데이터 가져오기 성공:", docSnap.data());
        setUserData(docSnap.data());
      } else {
        setError("사용자 데이터를 찾을 수 없습니다.");
        console.log("⚠️ 사용자 데이터 없음");
      }
    } catch (err) {
      setError("사용자 데이터를 가져오는 데 실패했습니다.");
      console.error("사용자 데이터 가져오기 실패:", err);
    }
  };

  // name을 사용하여 매치 데이터 가져오기
  const fetchMatchData = async (name) => {
    const matchQueryRef = query(collection(db, "matchApplications"), where("playerName", "==", name));
    try {
      const querySnapshot = await getDocs(matchQueryRef);
      if (!querySnapshot.empty) {
        const matches = querySnapshot.docs.map(doc => doc.data());
        console.log("✅ 매치 데이터 가져오기 성공:", matches);
        setMatchData(matches);
      } else {
        setError("매치 데이터를 찾을 수 없습니다.");
        console.log("⚠️ 매치 데이터 없음");
      }
    } catch (err) {
      setError("매치 데이터를 가져오는 데 실패했습니다.");
      console.error("매치 데이터 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    if (!userId) {
      return; // userId가 없으면 실행하지 않음
    }

    // 사용자 데이터 가져오기
    fetchUserData(userId);

  }, [userId]); // userId가 변경될 때마다 실행

  useEffect(() => {
    if (userData && userData.name) {
      fetchMatchData(userData.name); // userData의 name을 사용하여 매치 데이터 가져오기
    }
  }, [userData]); // userData가 변경될 때마다 실행

  // 로딩 중인 경우 확인
  if (error) return <div>{error}</div>;
  if (!userData || !matchData) return <div>로딩 중...</div>;

  // 랭크 계산 함수
  const getRank = (rating) => {
    if (rating >= 1576) return "챌린저";
    if (rating >= 1551) return "그랜드 마스터";
    if (rating >= 1526) return "마스터";
    if (rating >= 1501) return "플래티넘";
    if (rating >= 1476) return "골드";
    if (rating >= 1451) return "실버";
    return "브론즈";
  };

  // 스태미나 급수 계산 함수
  const getStaminaRank = (stamina) => {
    return stamina >= 1000
      ? `${Math.floor((stamina - 1000) / 100) + 1}단`
      : `${18 - Math.floor(stamina / 50)}급`;
  };

  // 매치 데이터에서 첫 번째 매치 정보를 가져와서 표시하도록 수정
  const firstMatch = matchData[0]; // 첫 번째 매치 데이터

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">마이페이지</h1>

      {/* 사용자 정보 */}
      <div className="mb-6">
        <h2 className="text-xl">사용자 정보</h2>
        <p><strong>이름:</strong> {userData.name}</p>
        <p><strong>역할:</strong> {userData.admin ? "admin" : userData.role}</p>

        {/* 알림 설정 */}
        <div>
          <label htmlFor="notificationsEnabled" className="mr-2">알림:</label>
          <input
            type="checkbox"
            id="notificationsEnabled"
            checked={userData.notificationsEnabled}
            onChange={async () => {
              const updatedNotifications = !userData.notificationsEnabled;
              const userDocRef = doc(db, "users", userId);
              await updateDoc(userDocRef, { notificationsEnabled: updatedNotifications });
              setUserData(prev => ({ ...prev, notificationsEnabled: updatedNotifications }));
              console.log("알림 상태 업데이트:", updatedNotifications); // 알림 상태 업데이트 콘솔 출력
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

      {/* 매치 데이터 */}
      <div className="mb-6">
        <h2 className="text-xl">매치 데이터</h2>
        <p><strong>레이팅:</strong> {firstMatch?.rating} ({getRank(firstMatch?.rating)})</p>
        <p><strong>승:</strong> {firstMatch?.wins}</p>
        <p><strong>패:</strong> {firstMatch?.losses}</p>
        <p><strong>승률:</strong> {(firstMatch?.winRate)*100}%</p>
        <p><strong>기력:</strong> {getStaminaRank(firstMatch?.stamina)}</p>
      </div>
    </div>
  );
};

export default MyPage;
