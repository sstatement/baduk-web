import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc } from "firebase/firestore";

const Boss = ({ user }) => {
  const [bosses, setBosses] = useState([]); // 보스 리스트 상태
  const [bossesCompleted, setBossesCompleted] = useState([]); // 보스 완료 상태
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]); // 모든 사용자 목록
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 보스 리스트
  const allBosses = [
    { name: "곽지섭", grade: "타이젬 6~7단", condition: "5단 이상", points: 500 },
    { name: "고원준", grade: "타이젬 6~7단", condition: "5단 이상", points: 500 },
    { name: "공정훈", grade: "타이젬 6~7단", condition: "4단 이상", points: 500 },
    { name: "성재명", grade: "타이젬 5~6단", condition: "3단 이상", points: 400 },
    { name: "2점 접바둑 곽지섭", grade: "타이젬 6~7단", condition: "3단 이상", points: 300 },
    { name: "2점 접바둑 고원준", grade: "타이젬 6~7단", condition: "3단 이상", points: 300 },
    { name: "2점 접바둑 공정훈", grade: "타이젬 6~7단", condition: "3단 이상", points: 300 },
    { name: "2점 접바둑 성재명", grade: "타이젬 5~6단", condition: "2단 이상", points: 300 },
    { name: "허규빈", grade: "타이젬 2~3단", condition: "1단 이상", points: 200 },
    { name: "김동화", grade: "타이젬 2~3단", condition: "1단 이상", points: 200 },
    { name: "권순효", grade: "타이젬 1~2단", condition: "1급 이상", points: 150 },
    { name: "4점 접바둑 곽지섭", grade: "타이젬 6~7단", condition: "1급 이상", points: 100 },
    { name: "4점 접바둑 고원준", grade: "타이젬 6~7단", condition: "1급 이상", points: 100 },
    { name: "4점 접바둑 공정훈", grade: "타이젬 6~7단", condition: "1급 이상", points: 100 },
    { name: "4점 접바둑 성재명", grade: "타이젬 5~6단", condition: "1급 이상", points: 100 },
  ];

  // 유저 데이터 가져오기 (실시간 업데이트)
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    // 실시간으로 사용자의 데이터 변경을 추적
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role);
        setBosses(userData.Boss || new Array(allBosses.length).fill(false)); // 기본값은 모두 미완료
        setBossesCompleted(userData.BossCompleted || new Array(12).fill(false)); // 보스 완료 목록
      }
    });

    return () => unsubscribe(); // 컴포넌트가 언마운트될 때 리스너 정리
  }, [user]);

  // 모든 사용자 목록 가져오기 (관리자와 스태프만)
  useEffect(() => {
    if (role === "admin" || role === "staff") {
      const fetchUsersList = async () => {
        try {
          setLoading(true);
          const usersCollection = collection(db, "users");
          const usersSnapshot = await getDocs(usersCollection);
          const usersList = usersSnapshot.docs.map(doc => doc.data());
          setUsers(usersList);
        } catch (err) {
          setError("회원 목록을 불러오는 데 실패했습니다.");
        } finally {
          setLoading(false);
        }
      };

      fetchUsersList();
    }
  }, [role]);

  // ✅ 보스 체크 핸들러 (일반 회원용)
  const handleBossToggle = async (index) => {
    if (!user?.uid) return;

    const newBosses = [...bosses];
    newBosses[index] = !newBosses[index];

    setBosses(newBosses);

    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, { Boss: newBosses });
    } catch (err) {
      setError("보스 상태를 업데이트하는 데 실패했습니다.");
    }
  };

// ✅ "보스 상태" 관리자/스태프 토글 핸들러
const handleBossAdminToggle = async (index, targetUserId) => {
  if (!(role === "admin" || role === "staff")) return;
  if (!selectedUser || !selectedUser.id) return; // selectedUser가 없거나 id가 없으면 실행하지 않음

  const newBosses = [...(selectedUser.Boss || new Array(allBosses.length).fill(false))];
  newBosses[index] = !newBosses[index];

  // 선택된 사용자의 보스 상태 업데이트
  const updatedUser = { ...selectedUser, Boss: newBosses };
  setSelectedUser(updatedUser); // UI에 상태 바로 반영

  const targetUserRef = doc(db, "users", targetUserId);

  try {
    // 데이터베이스 업데이트를 위한 비동기 작업
    await updateDoc(targetUserRef, { Boss: newBosses });
  } catch (err) {
    setError("보스 상태를 관리자에 의해 업데이트하는 데 실패했습니다.");
  }
};

// ✅ "성공" 버튼 핸들러 (관리자/스태프용)
const handleSuccess = async (index, points) => {
  if (!(role === "admin" || role === "staff")) return;

  const newCompleted = [...bossesCompleted];
  newCompleted[index] = true;

  // UI에 상태 바로 반영
  setBossesCompleted(newCompleted);

  const userRef = doc(db, "users", user.uid);

  try {
    // 데이터베이스 업데이트와 마일리지 추가를 동시에 실행
    await Promise.all([
      updateDoc(userRef, { BossCompleted: newCompleted }), // 성공 상태 업데이트
      updateMileage(user.uid, points), // 마일리지 추가
    ]);
  } catch (err) {
    setError("보스 성공 상태나 마일리지 업데이트에 실패했습니다.");
  }
};


  // ✅ 마일리지 업데이트
  const updateMileage = async (userId, points) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentMileage = userSnap.data().mileage || 0;
      try {
        await updateDoc(userRef, { mileage: currentMileage + points });
      } catch (err) {
        setError("마일리지 추가에 실패했습니다.");
      }
    }
  };

  return (
    <div className="boss-container">
      <h1>주간 보스</h1>

      {/* 에러 메시지 표시 */}
      {error && <div className="error-message">{error}</div>}

      {/* 관리자/스태프는 다른 사용자의 보스 상태를 관리할 수 있음 */}
      {(role === "admin" || role === "staff") && (
        <div className="users-list">
          <h2>회원 목록</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            users.map((user, index) => (
              <div key={index} className="user-item">
                <h4
                  onClick={() => setSelectedUser(user)} // 이름 클릭 시 해당 사용자 선택
                >
                  {user.name}
                </h4>
              </div>
            ))
          )}
        </div>
      )}

      {/* 선택된 사용자의 보스 상태 보여주기 */}
      {selectedUser && (
        <div className="user-boss-status">
          <h3>{selectedUser.name}의 보스 상태</h3>
          {allBosses.map((boss, index) => (
            <div key={index} className="boss-item">
              <h4>{boss.name}</h4>
              <p>{boss.grade}, {boss.condition}</p>
              <p>보상: {boss.points}점</p>

              {/* 관리자가 체크할 수 있는 체크박스 */}
              <label>
                <input
                  type="checkbox"
                  checked={selectedUser.Boss ? selectedUser.Boss[index] : false}
                  onChange={() => handleBossAdminToggle(index, selectedUser.id)} // 보스 진행 상태 수정
                />
                보스를 클리어 했습니다!
              </label>

              {/* 완료된 보스 표시 */}
              {selectedUser.BossCompleted && selectedUser.BossCompleted[index] && <span>🎉 완료됨!</span>}

              {/* "성공" 버튼 */}
              {role === "admin" || role === "staff" && !selectedUser.BossCompleted[index] && (
                <button onClick={() => handleSuccess(index, boss.points)} disabled={selectedUser.BossCompleted && selectedUser.BossCompleted[index]}>
                  성공 표시
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 주간 보스를 일반 회원이 볼 때 */}
      <div className="boss-list">
        {role !== "admin" && role !== "staff" && allBosses.map((boss, index) => (
          <div key={index} className="boss-item">
            <h3>{boss.name}</h3>
            <p>{boss.grade}, {boss.condition}</p>
            <p>보상: {boss.points}점</p>

            <label>
              <input
                type="checkbox"
                checked={bosses[index] || false}
                onChange={() => handleBossToggle(index)} // 체크박스 상태 변경
                disabled={!user || bossesCompleted[index]} // 보스 완료된 경우 체크박스 비활성화
              />
              보스를 클리어 했습니다!
            </label>
            {bossesCompleted[index] && <span>🎉 완료됨!</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boss;
