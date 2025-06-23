import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '24px',
    backgroundColor: '#fffaf0', // 아이보리
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Noto Sans KR', sans-serif",
    color: '#4b3621',
    lineHeight: 1.6,
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    borderBottom: '3px solid #d4a373',
    paddingBottom: '12px',
    marginBottom: '24px',
  },
  section: {
    marginBottom: '32px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    border: '1px solid #f3e9dd',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#6b4226',
  },
  label: {
    fontWeight: '600',
    marginRight: '8px',
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  img: {
    width: 40,
    height: 40,
    verticalAlign: 'middle',
    marginLeft: 8,
    borderRadius: '50%',
    border: '2px solid #d4a373',
  },
  questBox: {
    marginTop: 8,
    padding: '8px 12px',
    backgroundColor: '#fefae0',
    borderRadius: '6px',
    border: '1px solid #f3e9dd',
  },
};

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
    const sorted = [...allMatches].sort((a, b) => b.rating - a.rating);
    const playerIndex = sorted.findIndex(match => match.playerName === playerName);
    if (playerIndex === -1) return "랭크 없음";
    const rating = sorted[playerIndex].rating;

    if (rating >= 1576) {
      if (playerIndex === 0) return "챌린저";
      if (playerIndex >= 1 && playerIndex <= 3) return "그랜드마스터";
      if (playerIndex >= 4 && playerIndex <= 9) return "마스터";
      return "다이아";
    }
    if (rating >= 1551) return "플래티넘";
    if (rating >= 1526) return "골드";
    if (rating >= 1501) return "실버";
    if (rating <= 1500) return "브론즈";
    return "랭크 없음";
  };

  const rank = userData && matchData ? getRank(userData.name, matchData) : null;
  const rankImgSrc = rank ? rankImages[rank] : null;

  const fetchUserData = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setError("사용자 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("사용자 데이터를 가져오는 데 실패했습니다.");
    }
  };

  const fetchAllMatchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "matchApplications"));
      const matches = querySnapshot.docs.map(doc => doc.data());
      setMatchData(matches);
    } catch (err) {
      console.error(err);
      setError("매치 데이터를 가져오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
      fetchAllMatchData();
    }
  }, [userId]);

  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!userData || !matchData) return <div style={{ padding: '20px' }}>로딩 중...</div>;

  const getStaminaRank = (stamina) => {
    return stamina >= 1000
      ? `${Math.floor((stamina - 1000) / 100) + 1}단`
      : `${18 - Math.floor(stamina / 50)}급`;
  };

  const myMatch = matchData.find(match => match.playerName === userData.name);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>마이페이지</h1>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👤 사용자 정보</h2>
        <p><span style={styles.label}>이름:</span> {userData.name}</p>
        <p><span style={styles.label}>역할:</span> {userData.admin ? "admin" : userData.role}</p>
        <div style={styles.checkboxLabel}>
          <label htmlFor="notificationsEnabled">알림:</label>
          <input
            type="checkbox"
            id="notificationsEnabled"
            checked={userData.notificationsEnabled}
            onChange={async () => {
              try {
                const updated = !userData.notificationsEnabled;
                await updateDoc(doc(db, "users", userId), { notificationsEnabled: updated });
                setUserData(prev => ({ ...prev, notificationsEnabled: updated }));
              } catch (err) {
                console.error("알림 설정 업데이트 실패:", err);
              }
            }}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📜 완료한 보스 및 퀘스트</h2>
        <div>
          <p><span style={styles.label}>보스 완료:</span> {userData.BossCompleted?.filter(Boolean).length || 0} / {userData.BossCompleted?.length || 0}</p>
          {userData.BossCompleted?.map((completed, i) =>
            completed && <div key={i} style={styles.questBox}>보스 {i + 1}</div>
          )}
        </div>
        <div style={{ marginTop: '12px' }}>
          <p><span style={styles.label}>퀘스트 완료:</span> {userData.questsCompleted?.filter(Boolean).length || 0} / {userData.questsCompleted?.length || 0}</p>
          {userData.questsCompleted?.map((completed, i) =>
            completed && <div key={i} style={styles.questBox}>퀘스트 {i + 1}</div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 매치 데이터</h2>
        {myMatch ? (
          <>
            <p><span style={styles.label}>레이팅:</span> {myMatch.rating} ({rank})
              {rankImgSrc && <img src={rankImgSrc} alt={`${rank} 랭크`} style={styles.img} />}
            </p>
            <p><span style={styles.label}>승:</span> {myMatch.win}</p>
            <p><span style={styles.label}>패:</span> {myMatch.loss}</p>
            <p><span style={styles.label}>승률:</span> {(myMatch.winRate * 100).toFixed(2)}%</p>
            <p><span style={styles.label}>기력:</span> {getStaminaRank(myMatch.stamina)}</p>
          </>
        ) : (
          <p>매치 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default MyPage;
