import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  auth,
  db,
} from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

const rankImages = {
  챌린저: "/images/챌린저.jpg",
  그랜드마스터: "/images/그랜드마스터.jpg",
  마스터: "/images/마스터.jpg",
  다이아: "/images/다이아.jpg",
  플레티넘: "/images/플레티넘.jpg",
  골드: "/images/골드.jpg",
  실버: "/images/실버.jpg",
  브론즈: "/images/브론즈.jpg",
};

const provider = new GoogleAuthProvider();

const borderStylesMap = {
  default_border: {
    border: "2px solid black",
  },
  gold_border: {
    border: "3px solid gold",
  },
  shining_border: {
    boxShadow: "0 0 10px 4px rgba(0, 255, 255, 0.6)",
  },
  rainbow_border: {
    background: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
    borderRadius: "8px",
  },
  dotted_border: {
    border: "2px dashed #555",
  },
  ice_border: {
    border: "2px solid #4fd1c5",
    boxShadow: "0 0 8px #81e6d9",
  },
  fire_border: {
    background: "linear-gradient(45deg, red, orange)",
    borderRadius: "8px",
  },
  shadow_border: {
    border: "2px solid #333",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
};

const Article = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    photoURL: "",
    name: "",
    mileage: 0,
    stamina: 0,
    rating: 0,
    rank: "브론즈",
    chosenTitle: "",
    nameColor: "",
    borderStyle: "default_border", // 기본 테두리
  });

  async function getRankByRatingAndPosition(userName, rating) {
    if (rating < 1576) {
      if (rating >= 1551) return "플레티넘";
      if (rating >= 1526) return "골드";
      if (rating >= 1501) return "실버";
      return "브론즈";
    }
    const q = query(
      collection(db, "matchApplications"),
      where("rating", ">=", 1576),
      orderBy("rating", "desc")
    );
    const querySnapshot = await getDocs(q);
    const diamondPlayers = querySnapshot.docs.map((doc) => ({
      playerName: doc.data().playerName,
      rating: doc.data().rating,
    }));
    const userIndex = diamondPlayers.findIndex((p) => p.playerName === userName);
    if (userIndex === -1) return "다이아";
    if (userIndex === 0) return "챌린저";
    if (userIndex >= 1 && userIndex <= 3) return "그랜드마스터";
    if (userIndex >= 4 && userIndex <= 9) return "마스터";
    return "다이아";
  }

  const getStaminaText = (stamina) => {
    if (!stamina) return "-";
    if (stamina >= 1000) {
      return `${Math.floor((stamina - 1000) / 100) + 1}단`;
    }
    return `${18 - Math.floor(stamina / 50)}급`;
  };

  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeMyMatchApp = () => {};
    let unsubscribeDiamondRanking = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const userName = userData.name;

            const myMatchAppQuery = query(
              collection(db, "matchApplications"),
              where("playerName", "==", userName)
            );
            unsubscribeMyMatchApp = onSnapshot(myMatchAppQuery, (matchAppSnap) => {
              let stamina = 0;
              let rating = 0;
              if (!matchAppSnap.empty) {
                const data = matchAppSnap.docs[0].data();
                stamina = data.stamina || 0;
                rating = data.rating || 0;
              }

              const diamondQuery = query(
                collection(db, "matchApplications"),
                where("rating", ">=", 1576),
                orderBy("rating", "desc")
              );
              unsubscribeDiamondRanking();
              unsubscribeDiamondRanking = onSnapshot(diamondQuery, (diamondSnap) => {
                const diamondPlayers = diamondSnap.docs.map(doc => ({
                  playerName: doc.data().playerName,
                  rating: doc.data().rating,
                }));

                const userIndex = diamondPlayers.findIndex(p => p.playerName === userName);

                let rank = "브론즈";
                if (rating < 1576) {
                  if (rating >= 1551) rank = "플레티넘";
                  else if (rating >= 1526) rank = "골드";
                  else if (rating >= 1501) rank = "실버";
                  else rank = "브론즈";
                } else {
                  if (userIndex === 0) rank = "챌린저";
                  else if (userIndex >= 1 && userIndex <= 3) rank = "그랜드마스터";
                  else if (userIndex >= 4 && userIndex <= 9) rank = "마스터";
                  else rank = "다이아";
                }

                setProfileData({
                  photoURL: userData.photoURL || user.photoURL || "/images/바통이.jpg",
                  name: userData.name || user.displayName || user.email,
                  mileage: userData.mileage || 0,
                  stamina,
                  rating,
                  rank,
                  chosenTitle: userData.chosenTitle || "",
                  nameColor: userData.nameColor || "",
                  borderStyle: userData.borderStyle || "default_border",
                });
              });
            });
          } else {
            setProfileData({
              photoURL: user.photoURL || "/images/바통이.jpg",
              name: user.displayName || user.email,
              mileage: 0,
              stamina: 0,
              rating: 0,
              rank: "브론즈",
              chosenTitle: "",
              nameColor: "",
              borderStyle: "default_border",
            });
          }
        });
      } else {
        setProfileData({
          photoURL: "",
          name: "",
          mileage: 0,
          stamina: 0,
          rating: 0,
          rank: "브론즈",
          chosenTitle: "",
          nameColor: "",
          borderStyle: "default_border",
        });

        unsubscribeUser();
        unsubscribeMyMatchApp();
        unsubscribeDiamondRanking();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
      unsubscribeMyMatchApp();
      unsubscribeDiamondRanking();
    };
  }, []);

  const rankImgSrc = rankImages[profileData.rank] || null;

  const nameStyle = profileData.nameColor
    ? (profileData.nameColor.includes("gradient")
        ? {
            background: profileData.nameColor,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }
        : { color: profileData.nameColor })
    : {};

  const appliedBorderStyle = borderStylesMap[profileData.borderStyle] || borderStylesMap["default_border"];

  return (
    <article
      className="article p-4 rounded-md shadow-sm"
      style={{
        ...appliedBorderStyle,
      }}
    >
      <h2 className="text-xl font-semibold mb-4">로그인</h2>

      {!user ? (
        <div className="login-container">
          <button
            onClick={() => signInWithPopup(auth, provider)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            구글 계정으로 로그인
          </button>
        </div>
      ) : (
        <div className="profile-container flex flex-col items-center gap-3">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="프로필 사진"
              style={{ width: "80px", height: "80px" }}
            />
          ) : (
            <div>
              <img
                src="/images/바통이.jpg"
                alt="기본 프로필"
                style={{ width: "80px", height: "80px" }}
              />
            </div>
          )}

          <p className="text-lg font-medium" style={nameStyle}>
            <strong>이름 : </strong>
            {profileData.chosenTitle ? `${profileData.chosenTitle} ` : ""}
            {profileData.name}
          </p>

          <div className="flex items-center gap-2">
            {rankImgSrc && (
              <img
                src={rankImgSrc}
                alt={`${profileData.rank} 랭크 이미지`}
                style={{ width: "80px", height: "80px" }}
              />
            )}
          </div>

          <p>
            <strong>기력:</strong> {getStaminaText(profileData.stamina)}
          </p>

          <p>
            <strong>마일리지:</strong> {profileData.mileage ?? 0} 점
          </p>

          <Link
            to="/mypage"
            className="mt-2 px-3 py-1 border rounded text-blue-600 hover:bg-blue-100"
          >
            마이페이지 보기
          </Link>

          <button
            onClick={() => signOut(auth)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      )}
    </article>
  );
};

export default Article;
