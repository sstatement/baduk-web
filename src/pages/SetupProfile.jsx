import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth"; // ✅ 로그아웃용 import 추가

const SetupProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rank, setRank] = useState("18급");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const defaultPhotoURL = "/images/바통이.jpg";

  const ranks = [
    ...Array.from({ length: 18 }, (_, i) => `${18 - i}급`),
    ...Array.from({ length: 9 }, (_, i) => `${i + 1}단`),
  ];

  const staminaMap = {
    "18급": 0, "17급": 50, "16급": 100, "15급": 150, "14급": 200,
    "13급": 250, "12급": 300, "11급": 350, "10급": 400, "9급": 450,
    "8급": 500, "7급": 550, "6급": 600, "5급": 650, "4급": 700,
    "3급": 750, "2급": 800, "1급": 850,
    "1단": 1000, "2단": 1100, "3단": 1200, "4단": 1300, "5단": 1400,
    "6단": 1500, "7단": 1600, "8단": 1700, "9단": 1800,
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    try {
      const photoToSave = photoPreview || defaultPhotoURL || user.photoURL || "";

      await setDoc(
        userRef,
        {
          name,
          rank,
          photoURL: photoToSave,
          leagueParticipate: true,
          Boss: [],
          BossCompleted: [],
          admin: false,
          chosenTitle: "",
          createdAt: new Date(),
          email: user.email || "",
          lastLogin: user.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime)
            : new Date(),
          mileage: 10000,
          missionCompleted_고급: [],
          missionCompleted_입문: [],
          missionCompleted_중급: [],
          missionCompleted_초급: [],
          nameColor: "black",
          nicknameColor: "black",
          notificationsEnabled: true,
          points: 0,
          quests: [],
          questsCompleted: [],
          role: "member",
          title: "",
        },
        { merge: true }
      );

      const staminaValue = staminaMap[rank] ?? staminaMap["1단"];
      const matchAppRef = doc(db, "matchApplications", name);
      await setDoc(matchAppRef, {
        playerName: name,
        stamina: staminaValue,
        rating: 1500,
        win: 0,
        loss: 0,
        winRate: 0,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (error) {
      console.error("프로필 저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // ✅ 로그아웃 핸들러 추가
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "30px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative", // 로그아웃 버튼 위치용
      }}
    >
      {/* 🔴 로그아웃 버튼 (오른쪽 상단) */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          padding: "6px 12px",
          backgroundColor: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
      >
        로그아웃
      </button>

      <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#2563eb", marginBottom: "24px" }}>
        프로필 설정
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 이름 입력 */}
        <div>
          <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>

        {/* 기력 선택 */}
        <div>
          <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>기력</label>
          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >
            {ranks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 프로필 사진 */}
        <div>
          <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>프로필 사진</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: "100%", fontSize: "14px" }}
          />
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <img
              src={photoPreview || defaultPhotoURL}
              alt="프로필 미리보기"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px solid #2563eb",
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          style={{
            padding: "12px",
            background: "linear-gradient(to right, #3b82f6, #6366f1)",
            color: "white",
            fontWeight: "600",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "linear-gradient(to right, #2563eb, #4f46e5)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "linear-gradient(to right, #3b82f6, #6366f1)")
          }
        >
          저장하고 시작하기
        </button>
      </form>
    </div>
  );
};

export default SetupProfile;
