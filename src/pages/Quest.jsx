import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

const Quest = ({ user }) => {
  const [quests, setQuests] = useState(new Array(12).fill(false)); // 기본값을 12개로 설정
  const [questsCompleted, setQuestsCompleted] = useState(new Array(12).fill(false)); // 기본값을 12개로 설정
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]); // 모든 사용자 목록
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자의 데이터

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setRole(userData.role);

        // `quests`와 `questsCompleted` 배열이 없으면 초기화, 있으면 길이를 맞춰서 가져옴
        setQuests(userData.quests || new Array(12).fill(false));
        setQuestsCompleted(userData.questsCompleted || new Array(12).fill(false));
      }
    };

    fetchUserData();
  }, [user]);

  // 모든 사용자 목록 가져오기 (관리자와 스태프만)
  useEffect(() => {
    const fetchUsersList = async () => {
      if (role === "admin" || role === "staff") {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => doc.data());
        setUsers(usersList);
      }
    };

    if (role) {
      fetchUsersList();
    }
  }, [role]);

  // 사용자 선택 시 퀘스트 상태 업데이트
  const handleUserClick = async (targetUserId) => {
    const targetUserRef = doc(db, "users", targetUserId);
    const targetUserSnap = await getDoc(targetUserRef);

    if (targetUserSnap.exists()) {
      const targetUserData = targetUserSnap.data();
      setSelectedUser(targetUserData);
      setQuests(targetUserData.quests || new Array(12).fill(false));
      setQuestsCompleted(targetUserData.questsCompleted || new Array(12).fill(false));
    }
  };

  // ✅ 퀘스트 체크 핸들러 (일반 회원용)
  const handleQuestToggle = async (index) => {
    if (!user?.uid) return;

    const newQuests = [...quests];
    newQuests[index] = !newQuests[index];

    setQuests(newQuests);

    const userRef = doc(db, "users", user.uid);

    if (Array.isArray(newQuests)) {
      await updateDoc(userRef, { quests: newQuests });
    }
  };

  // ✅ 퀘스트 상태를 다른 사용자의 퀘스트 상태로 수정 (어드민/스태프용)
  const handleQuestAdminToggle = async (index, targetUserId) => {
    if (!(role === "admin" || role === "staff")) return;

    const newQuests = [...quests];
    newQuests[index] = !newQuests[index];

    setQuests(newQuests);

    const targetUserRef = doc(db, "users", targetUserId);

    if (Array.isArray(newQuests)) {
      await updateDoc(targetUserRef, { quests: newQuests });
    }
  };

  // ✅ 퀘스트 완료 버튼 핸들러 (성공 표시)
  const handleSuccess = async (index, points) => {
    if (!(role === "admin" || role === "staff")) return;

    const newCompleted = [...questsCompleted];
    newCompleted[index] = true;
    setQuestsCompleted(newCompleted);

    const userRef = doc(db, "users", user.uid);

    if (Array.isArray(newCompleted)) {
      await updateDoc(userRef, { questsCompleted: newCompleted });
    }

    // 마일리지 추가
    await updateMileage(user.uid, points);
  };

  // ✅ 마일리지 업데이트
  const updateMileage = async (userId, points) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentMileage = userSnap.data().mileage || 0;
      await updateDoc(userRef, { mileage: currentMileage + points });
    }
  };

  // 퀘스트 항목과 각 항목의 마일리지
  const questData = [
    { name: "타이젬 대국 1판 하기", points: 10 },
    { name: "타이젬 대국 3판 하기", points: 30 },
    { name: "정석 영상 1개 시청", points: 10 },
    { name: "정석 영상 3개 시청", points: 30 },
    { name: "101weiqi 사활 10급 통과", points: 10 },
    { name: "101weiqi 사활 8급 통과", points: 20 },
    { name: "101weiqi 사활 6급 통과", points: 30 },
    { name: "상수 기보 30수 따라두기", points: 10 },
    { name: "상수 기보 50수 따라두기", points: 20 },
    { name: "상수 기보 70수 따라두기", points: 30 },
    { name: "AI 프로그램으로 자기 바둑 30수 복기", points: 10 },
    { name: "AI 프로그램으로 자기 바둑 50수 복기", points: 20 },
    { name: "AI 프로그램으로 자기 바둑 70수 복기", points: 30 },
  ];

  return (
    <div className="quest-container">
      <h1>주간 퀘스트</h1>

      {/* 관리자가 아닌 경우 자신만의 퀘스트 */}
      {role !== "admin" && role !== "staff" && (
        questData.map((quest, index) => (
          <div key={index} className="quest-item">
            <label>
              <input
                type="checkbox"
                checked={quests[index]}
                onChange={() => handleQuestToggle(index)}
                disabled={questsCompleted[index]} // 완료된 경우 체크 변경 불가
              />
              {quest.name} ({quest.points}점)
            </label>
            {questsCompleted[index] && <span>🎉 완료됨!</span>}
          </div>
        ))
      )}

      {/* 관리자/스태프의 회원 목록 표시 */}
      {role === "admin" || role === "staff" ? (
        <div className="users-list">
          <h2>회원 목록</h2>
          {users.map((userData, index) => (
            <div
              key={index}
              className="user-item"
              onClick={() => handleUserClick(userData.uid)} // 회원 클릭 시 해당 회원의 퀘스트로 이동
            >
              <p>{userData.name}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* 관리자가 선택한 회원의 퀘스트 상태 */}
      {role === "admin" || role === "staff" ? (
        selectedUser ? (
          <div className="quests-for-user">
            <h2>{selectedUser.name}의 퀘스트</h2>
            {questData.map((quest, index) => (
              <div key={index} className="quest-item">
                <label>
                  <input
                    type="checkbox"
                    checked={quests[index]}
                    onChange={() => handleQuestAdminToggle(index, selectedUser.uid)}
                    disabled={questsCompleted[index]} // 완료된 경우 체크 변경 불가
                  />
                  {quest.name} ({quest.points}점)
                </label>
                {questsCompleted[index] ? (
                  <span>🎉 완료됨!</span>
                ) : (
                  <button onClick={() => handleSuccess(index, quest.points)}>성공</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>회원 목록에서 사용자를 선택해주세요.</p>
        )
      ) : null}
    </div>
  );
};

export default Quest;
