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
import "../App.css";
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

  neon_border: {
    border: "2px solid #0ff",
    boxShadow: "0 0 8px #0ff, 0 0 20px #0ff, 0 0 40px #0ff",
    borderRadius: "10px",
  },
  double_stripe_border: {
    border: "4px double #ff6f61",
    borderRadius: "6px",
  },
  glitch_border: {
    border: "2px solid #ff005a",
    boxShadow: "2px 0 #00fff7, -2px 0 #ff005a",
    borderRadius: "6px",
    animation: "glitch 1s infinite",
  },
  dotted_glow_border: {
    border: "2px dotted #a78bfa",
    boxShadow: "0 0 12px 2px #a78bfa88",
    borderRadius: "8px",
  },
  engraved_border: {
    border: "3px solid #888",
    boxShadow: "inset 0 0 5px #444",
    borderRadius: "12px",
  },
  gold_fleck_border: {
    border: "2px solid #b8860b",
    backgroundImage: "radial-gradient(circle at 20% 20%, #ffd700 10%, transparent 11%), radial-gradient(circle at 80% 80%, #ffec8b 10%, transparent 11%)",
    backgroundRepeat: "no-repeat",
    borderRadius: "10px",
    boxShadow: "0 0 8px #b8860b88",
  },
  pixelated_border: {
    border: "4px solid transparent",
    boxShadow: "0 0 0 2px #00f, 4px 4px 0 2px #00f, 8px 8px 0 2px #00f",
    borderRadius: "4px",
  },
  galaxy_border: {
  borderRadius: "12px",
  border: "1.5px solid transparent",
  backgroundImage: `
    radial-gradient(circle at center, rgba(127,0,255,0.3), transparent 70%),
    radial-gradient(circle at top right, #7f00ff, #e100ff, #00ffff),
    linear-gradient(45deg, #7f00ff, #e100ff, #00ffff)
  `,
  backgroundOrigin: "border-box",
  backgroundClip: "content-box, border-box, border-box",
  boxShadow: `
    0 0 5px 1px #7f00ff,
    0 0 10px 2px #e100ff,
    0 0 15px 3px #00ffff
  `,
  position: "relative",
  animation: "galaxyGlow 4s linear infinite",
  color: "white",
},
hologram_border: {
  border: "2px solid transparent",
  borderRadius: "12px",
  backgroundImage: "linear-gradient(135deg, #ff9a9e, #fad0c4, #a18cd1, #fbc2eb)",
  backgroundClip: "padding-box",
  boxShadow: "0 0 12px rgba(255, 255, 255, 0.5)",
  animation: "hologramShift 6s infinite linear",
},
cyberpunk_border: {
  border: "2px solid #ff005a",
  boxShadow: "0 0 10px #0ff, inset 0 0 5px #ff005a",
  borderRadius: "10px",
  backgroundColor: "#111",
  color: "#0ff",
  animation: "neonPulse 2s infinite ease-in-out",
},
kuromi_border: {
  border: "2px dashed #6b21a8",
  boxShadow: "0 0 10px #9333ea",
  borderRadius: "14px",
  backgroundColor: "#1f1b24",
  color: "#f3e8ff",
},
cozy_border: {
  border: "3px solid #d2b48c",
  backgroundColor: "#fdf6ec",
  borderRadius: "10px",
  boxShadow: "0 0 8px #cbbeb5",
},
ai_border: {
  border: "2px solid #10a37f",
  borderRadius: "10px",
  boxShadow: "0 0 6px #10a37f88, 0 0 12px #7de2d1",
  background: "linear-gradient(135deg, #0f766e, #14b8a6, #67e8f9)",
  color: "#fff",
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
            style={{
    textDecoration: "none",   // 밑줄 제거
    cursor: "pointer",        // 클릭 가능 커서 유지
  }}
          >
            마이페이지 보기
          </Link>

          <button onClick={() => signOut(auth)} class="logout-btn">
  로그아웃
  </button>

        </div>
      )}
    </article>
  );
};

export default Article;
