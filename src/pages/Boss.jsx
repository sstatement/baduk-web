import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc } from "firebase/firestore";

const Boss = ({ user }) => {
  const [bosses, setBosses] = useState([]);
  const [bossesCompleted, setBossesCompleted] = useState([]);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role);
        setBosses(userData.Boss || new Array(allBosses.length).fill(false));
        setBossesCompleted(userData.BossCompleted || new Array(allBosses.length).fill(false));
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (role === "admin" || role === "staff") {
      const fetchUsersList = async () => {
        setLoading(true);
        try {
          const usersCollection = collection(db, "users");
          const usersSnapshot = await getDocs(usersCollection);
          const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleBossToggle = async (index) => {
    if (!user?.uid) return;
    const newBosses = [...bosses];
    newBosses[index] = !newBosses[index];
    setBosses(newBosses);
    try {
      await updateDoc(doc(db, "users", user.uid), { Boss: newBosses });
    } catch (err) {
      setError("보스 상태 업데이트 실패");
    }
  };

  const handleBossAdminToggle = async (index, targetUserId) => {
    if (!(role === "admin" || role === "staff")) return;
    const newBosses = [...(selectedUser.Boss || new Array(allBosses.length).fill(false))];
    newBosses[index] = !newBosses[index];
    setSelectedUser(prev => ({ ...prev, Boss: newBosses }));
    await updateDoc(doc(db, "users", targetUserId), { Boss: newBosses });
  };

  const handleSuccess = async (index, points) => {
    if (!(role === "admin" || role === "staff")) return;
    const newCompleted = [...bossesCompleted];
    newCompleted[index] = true;
    setBossesCompleted(newCompleted);
    await updateDoc(doc(db, "users", user.uid), { BossCompleted: newCompleted });
    await updateMileage(user.uid, points);
  };

  const updateMileage = async (userId, points) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const currentMileage = snap.exists() ? snap.data().mileage || 0 : 0;
    await updateDoc(userRef, { mileage: currentMileage + points });
  };

  const styles = {
    container: { maxWidth: "900px", margin: "40px auto", padding: "20px", backgroundColor: "#1a1a1a", color: "#fefefe", fontFamily: "'Pretendard', sans-serif", borderRadius: "12px" },
    title: { fontSize: "32px", fontWeight: "bold", marginBottom: "24px", color: "#ffd700", borderBottom: "3px solid #ff5555", paddingBottom: "10px" },
    bossItem: { backgroundColor: "#2a2a2a", padding: "16px", marginBottom: "20px", borderRadius: "8px", border: "2px solid #ff4444" },
    bossTitle: { fontSize: "20px", fontWeight: "bold", color: "#ff7777", marginBottom: "8px" },
    description: { fontSize: "14px", color: "#cccccc", marginBottom: "4px" },
    reward: { fontSize: "14px", color: "#ffddaa", marginBottom: "10px" },
    checkbox: { marginRight: "8px", transform: "scale(1.2)" },
    label: { fontSize: "14px", color: "#dddddd" },
    successBadge: { marginLeft: "12px", fontWeight: "bold", color: "#ffcc00" },
    successButton: { marginTop: "10px", backgroundColor: "#ff3333", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
    userItem: { backgroundColor: "#333", padding: "8px", marginBottom: "6px", borderRadius: "6px", cursor: "pointer" },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 주간 보스전 🔥</h1>
      {error && <div style={{ color: "#ff5555" }}>{error}</div>}
      {(role === "admin" || role === "staff") && (
        <div>
          <h2 style={styles.bossTitle}>👥 회원 목록</h2>
          {loading ? <p>로딩 중...</p> : users.map((user, i) => (
            <div key={i} style={styles.userItem} onClick={() => setSelectedUser(user)}>{user.name}</div>
          ))}
        </div>
      )}
      {selectedUser && (
        <div>
          <h3 style={{ color: "#ffcc00", fontSize: "20px", margin: "20px 0" }}>{selectedUser.name}의 보스 상태</h3>
          {allBosses.map((boss, index) => (
            <div key={index} style={styles.bossItem}>
              <div style={styles.bossTitle}>{boss.name}</div>
              <div style={styles.description}>{boss.grade}, {boss.condition}</div>
              <div style={styles.reward}>보상: {boss.points}점</div>
              <label style={styles.label}>
                <input type="checkbox" style={styles.checkbox} checked={selectedUser.Boss?.[index] || false} onChange={() => handleBossAdminToggle(index, selectedUser.id)} /> 클리어 했습니다!
              </label>
              {selectedUser.BossCompleted?.[index] && <span style={styles.successBadge}>🎉 완료됨!</span>}
              {(!selectedUser.BossCompleted?.[index]) && <button style={styles.successButton} onClick={() => handleSuccess(index, boss.points)}>✅ 성공 표시</button>}
            </div>
          ))}
        </div>
      )}
      {(role !== "admin" && role !== "staff") && allBosses.map((boss, index) => (
        <div key={index} style={styles.bossItem}>
          <div style={styles.bossTitle}>{boss.name}</div>
          <div style={styles.description}>{boss.grade}, {boss.condition}</div>
          <div style={styles.reward}>보상: {boss.points}점</div>
          <label style={styles.label}>
            <input type="checkbox" style={styles.checkbox} checked={bosses[index] || false} onChange={() => handleBossToggle(index)} disabled={bossesCompleted[index]} /> 클리어 했습니다!
          </label>
          {bossesCompleted[index] && <span style={styles.successBadge}>🔥 완료됨!</span>}
        </div>
      ))}
    </div>
  );
};

export default Boss;
