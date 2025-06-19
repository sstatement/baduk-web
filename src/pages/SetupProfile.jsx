import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

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
    "18급": 0,
    "17급": 50,
    "16급": 100,
    "15급": 150,
    "14급": 200,
    "13급": 250,
    "12급": 300,
    "11급": 350,
    "10급": 400,
    "9급": 450,
    "8급": 500,
    "7급": 550,
    "6급": 600,
    "5급": 650,
    "4급": 700,
    "3급": 750,
    "2급": 800,
    "1급": 850,
    "1단": 1000,
    "2단": 1100,
    "3단": 1200,
    "4단": 1300,
    "5단": 1400,
    "6단": 1500,
    "7단": 1600,
    "8단": 1700,
    "9단": 1800,
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

      // matchApplications에 등록
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
      console.error("프로필 저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-6 text-center">프로필 설정</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="예: 홍길동"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">기력</label>
          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {ranks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">프로필 사진</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          <img
            src={photoPreview || defaultPhotoURL}
            alt="프로필 미리보기"
            className="w-24 h-24 mt-2 rounded-full object-cover border"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          저장하고 시작하기
        </button>
      </form>
    </div>
  );
};

export default SetupProfile;
