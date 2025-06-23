import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import "./store.css"
const titles = [
  "초고수", "명인 (名人)", "대가 (大家)", "국수 (國手)", "신의 한 수",
  "입신", "바둑 마스터", "대마 불사", "반상을 지배하는자", "불멸의 전략가", "바둑 신", "임경호의 제자", "임경호의 호적수"
  ,"천하제일사수", "바둑의 대성인", "무적의 바둑왕", "흑백의 마법사", "수읽기의 달인",
  "전장의 지휘관", "끝판왕", "바둑의 현자", "철벽 방어자", "사활의 달인",
  "계산기천재", "반상계의 영웅", "전략의 귀재", "불패의 신기", "신수(神手)",
  "착점의 달인", "승리의 화신", "바둑의 사도", "명경지수", "대국의 천재"
];

// 단색 + 그라데이션 색상 예시
const colors = [
  "#FF5F6D", // 단색 레드톤
  "#FFC371", // 단색 오렌지톤
  "#24C6DC", // 단색 청록톤
  "#514A9D", // 단색 보라톤
  "#FF512F", // 단색 빨강
  "#DD2476", // 단색 핑크톤
  "#8A2387", // 단색 진한 보라
  "#00F260", // 단색 연두
  "#0575E6", // 단색 파랑
  "#7F00FF", // 단색 퍼플
  "#E100FF", // 단색 핫핑크

  // 선형 그라데이션 (좌->우)
  "linear-gradient(to right, #FF5F6D, #FFC371)",
  "linear-gradient(to right, #24C6DC, #514A9D)",

  // 선형 그라데이션 (대각선)
  "linear-gradient(135deg, #667eea, #764ba2)",

  // 방사형 그라데이션 (중앙부터 바깥으로)
  "radial-gradient(circle, #ff9a9e, #fad0c4)",

  // 투명도 있는 단색 (RGBA)
  "rgba(255, 95, 109, 0.7)",

  // 투명도 있는 그라데이션
  "linear-gradient(to right, rgba(255, 95, 109, 0.8), rgba(255, 195, 113, 0.8))",

  // 다중 스탑 그라데이션
  "linear-gradient(90deg, #ff6a00 0%, #ee0979 50%, #ff6a00 100%)",

  // 반투명 블루
  "rgba(5, 117, 230, 0.6)",

  // 다크 + 라이트 그라데이션
  "linear-gradient(to right, #141E30, #243B55)",

  // 네온 그린 그라데이션
  "linear-gradient(45deg, #00FF00, #00B300)",

  // 은은한 파스텔톤 그라데이션
  "linear-gradient(to right, #a1c4fd, #c2e9fb)",

  // 다크 퍼플 투명도
  "rgba(128, 0, 128, 0.8)",
  // 딥 블루 + 민트 (밤하늘 느낌)
  "linear-gradient(to right, #0f2027, #203a43, #2c5364)",

  // 선셋 오렌지 + 퍼플
  "linear-gradient(to right, #ff9966, #ff5e62)",

  // 네온 핑크 + 블루 (하이틴 감성)
  "linear-gradient(to right, #f953c6, #b91d73)",

  // 차분한 라벤더 + 민트
  "linear-gradient(to right, #d4fc79, #96e6a1)",

  // 블랙 + 딥 레드 그라데이션 (고급스러운 느낌)
  "linear-gradient(to right, #000000, #434343)",

  // 에메랄드 + 딥 블루 (바다 느낌)
  "linear-gradient(120deg, #89f7fe, #66a6ff)",

  // 트로피컬 오렌지 + 민트
  "linear-gradient(to right, #f6d365, #fda085)",

  // 그레이톤 메탈릭 느낌
  "linear-gradient(to right, #bdc3c7, #2c3e50)",

  // 형광 블루 투명
  "rgba(0, 255, 255, 0.7)",

  // 초록-블루 계열의 고급 그라데이션
  "linear-gradient(to right, #1D976C, #93F9B9)",

  // 아이스 블루 + 흰색 계열
  "linear-gradient(to right, #83a4d4, #b6fbff)",

  // 다크 네이비 + 보라빛
  "linear-gradient(135deg, #1f1c2c, #928dab)",
   // 코발트 + 바이올렛 + 인디고 (사이버 감성)
  "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",

  // 유리처럼 맑은 민트 + 아이스 블루 (글래스 느낌)
  "linear-gradient(to right, #74ebd5, #ACB6E5)",

  // 핑크 + 보라 + 블루 (디지털 감성)
  "linear-gradient(to right, #fc466b, #3f5efb)",

  // 우주 느낌: 딥 네이비 + 블루 + 퍼플
  "linear-gradient(120deg, #2c3e50, #4ca1af)",

  // 하늘+라일락+인디고 (몽환적인 색감)
  "linear-gradient(to right, #c2e9fb, #a1c4fd, #d4fc79)",

  // 고급 메탈릭 (티타늄+블루 계열)
  "linear-gradient(to right, #232526, #414345)",

  // 네온 블루 + 네온 퍼플 (완전 강한 대비)
  "linear-gradient(135deg, #00c6ff, #0072ff)",

  // 검정+금색+갈색 (럭셔리 느낌)
  "linear-gradient(to right, #1e130c, #9a8478)",

  // 청록+옅은 옐로우 + 은은한 회색 (세련된 초현대 느낌)
  "linear-gradient(to right, #fdfbfb, #ebedee, #a1ffce)",

  // 무채색 그라데이션 (블랙 → 화이트 → 그레이)
  "linear-gradient(90deg, #000000, #434343, #ffffff)",

  // 오팔빛 느낌의 세련된 파스텔 계열
  "linear-gradient(to right, #fdfcfb, #e2d1c3)",

  // 청록 → 네이비 → 퍼플 (수중+밤하늘 느낌)
  "linear-gradient(to right, #00c9ff, #92fe9d)",

  // 초록 → 노랑 → 분홍 → 보라 (레인보우 분위기)
  "linear-gradient(135deg, #f6ff00, #00ff87, #ff00f7)",

  // 유리조각 느낌의 회색+은빛 블루
  "linear-gradient(135deg, #e0eafc, #cfdef3)",
];


// 테두리 스타일 목록과 가격
const borders = [
  {
    id: "default_border",
    name: "⚫ 기본 테두리",
    description: "검은색 실선 테두리 (무료/기본)",
    style: { border: "2px solid black" },
    cost: 0,
  },
  {
    id: "gold_border",
    name: "🌕 금빛 테두리",
    description: "황금색 고급 테두리",
    style: { border: "3px solid gold" },
    cost: 200,
  },
  {
    id: "shining_border",
    name: "✨ 빛나는 테두리",
    style: { boxShadow: "0 0 10px 4px rgba(0, 255, 255, 0.6)" },
    description: "빛나는 청록색 그림자",
    cost: 300,
  },
  {
    id: "rainbow_border",
    name: "🌈 무지개 테두리",
    style: {
      background: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
      borderRadius: "8px",
    },
    description: "그라데이션 무지개 테두리",
    cost: 500,
  },
  {
    id: "dotted_border",
    name: "🎲 점선 테두리",
    style: { border: "2px dashed #555" },
    description: "스타일리시한 회색 점선",
    cost: 150,
  },
  {
    id: "ice_border",
    name: "🧊 아이스 테두리",
    style: {
      border: "2px solid #4fd1c5",
      boxShadow: "0 0 8px #81e6d9",
    },
    description: "푸른빛 입체 효과",
    cost: 250,
  },
  {
    id: "fire_border",
    name: "🔥 불꽃 테두리",
    style: {
      background: "linear-gradient(45deg, red, orange)",
      borderRadius: "8px",
    },
    description: "빨강+주황 불꽃 테마",
    cost: 500,
  },
  {
    id: "shadow_border",
    name: "🖤 그림자 테두리",
    style: {
      border: "2px solid #333",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    },
    description: "어두운 테두리 + 강한 그림자",
    cost: 200,
  },
  {
    id: "neon_border",
    name: "🌟 네온 테두리",
    style: {
      border: "2px solid #0ff",
      boxShadow: "0 0 8px #0ff, 0 0 20px #0ff, 0 0 40px #0ff",
      borderRadius: "10px",
    },
    description: "형광빛 네온사인 느낌의 반짝이는 테두리",
    cost: 400,
  },
  {
    id: "double_stripe_border",
    name: "〰️ 더블 스트라이프 테두리",
    style: {
      border: "4px double #ff6f61",
      borderRadius: "6px",
    },
    description: "얇은 두 줄 선으로 된 세련된 테두리",
    cost: 250,
  },
  {
    id: "glitch_border",
    name: "🎮 글리치 테두리",
    style: {
      border: "2px solid #ff005a",
      boxShadow: "2px 0 #00fff7, -2px 0 #ff005a",
      borderRadius: "6px",
      animation: "glitch 1s infinite",
    },
    description: "레트로 게임 글리치 효과가 가미된 테두리",
    cost: 600,
  },
  {
    id: "dotted_glow_border",
    name: "✨ 점선 + 빛나는 테두리",
    style: {
      border: "2px dotted #a78bfa",
      boxShadow: "0 0 12px 2px #a78bfa88",
      borderRadius: "8px",
    },
    description: "작은 점선과 은은한 빛 효과가 어우러진 테두리",
    cost: 350,
  },
  {
    id: "engraved_border",
    name: "🪓 조각된 돌 테두리",
    style: {
      border: "3px solid #888",
      boxShadow: "inset 0 0 5px #444",
      borderRadius: "12px",
    },
    description: "돌에 새겨진 듯한 음각 느낌의 테두리",
    cost: 450,
  },
  {
    id: "gold_fleck_border",
    name: "🌟 금가루 테두리",
    style: {
      border: "2px solid #b8860b",
      backgroundImage:
        "radial-gradient(circle at 20% 20%, #ffd700 10%, transparent 11%), radial-gradient(circle at 80% 80%, #ffec8b 10%, transparent 11%)",
      backgroundRepeat: "no-repeat",
      borderRadius: "10px",
      boxShadow: "0 0 8px #b8860b88",
    },
    description: "금가루가 반짝이는 듯한 불규칙 테두리",
    cost: 550,
  },
  {
    id: "pixelated_border",
    name: "🟦 픽셀 아트 테두리",
    style: {
      border: "4px solid transparent",
      boxShadow:
        "0 0 0 2px #00f, 4px 4px 0 2px #00f, 8px 8px 0 2px #00f",
      borderRadius: "4px",
    },
    description: "복고풍 8비트 픽셀 스타일 테두리",
    cost: 500,
  },
  {
  id: "galaxy_border",
  name: "🌌 은하계 테두리",
  description: "멋진 은하계 느낌의 반짝임과 그라데이션",
  style: {
    borderRadius: "12px",
    border: "3px solid transparent",
    backgroundImage: `linear-gradient(white, white), radial-gradient(circle at top left, #7f00ff, #e100ff, #00ffff)`,
    backgroundOrigin: "border-box",
    backgroundClip: "content-box, border-box",
    boxShadow: `
      0 0 10px 2px #7f00ff,
      0 0 20px 4px #e100ff,
      0 0 30px 6px #00ffff
    `,
    position: "relative",
    animation: "galaxyGlow 4s linear infinite",
  },
  cost: 700,
},
{
  id: "hologram_border",
  name: "🪩 홀로그램 테두리",
  description: "빛에 따라 색이 변하는 오로라 느낌의 테두리",
  style: {
    border: "2px solid transparent",
    borderRadius: "12px",
    backgroundImage: "linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4, #a18cd1, #fbc2eb)",
    backgroundClip: "padding-box",
    boxShadow: "0 0 12px rgba(255, 255, 255, 0.5)",
    animation: "hologramShift 6s infinite linear",
  },
  cost: 600,
},
{
  id: "cyberpunk_border",
  name: "🕶️ 사이버펑크 테두리",
  description: "디지털 세계에서 튀어나온 듯한 강렬한 컬러 조합",
  style: {
    border: "2px solid #ff005a",
    boxShadow: "0 0 10px #0ff, inset 0 0 5px #ff005a",
    borderRadius: "10px",
    backgroundColor: "#111",
    color: "#0ff",
    animation: "neonPulse 2s infinite ease-in-out",
  },
  cost: 650,
},
{
  id: "kuromi_border",
  name: "💜 쿠로미 테두리",
  description: "보라색과 검정색의 귀여운 반항 스타일",
  style: {
    border: "2px dashed #6b21a8",
    boxShadow: "0 0 10px #9333ea",
    borderRadius: "14px",
    backgroundColor: "#1f1b24",
    color: "#f3e8ff",
  },
  cost: 400,
},
{
  id: "cozy_border",
  name: "☕ 코지 무드 테두리",
  description: "따뜻한 브라운톤과 크림 배경으로 아늑한 분위기",
  style: {
    border: "3px solid #d2b48c",
    backgroundColor: "#fdf6ec",
    borderRadius: "10px",
    boxShadow: "0 0 8px #cbbeb5",
  },
  cost: 300,
},{
  id: "ai_border",
  name: "🤖 AI 테두리",
  description: "디지털 신세계, ChatGPT 스타일의 프리즘 테두리",
  style: {
    border: "2px solid #10a37f",
    borderRadius: "10px",
    boxShadow: "0 0 6px #10a37f88, 0 0 12px #7de2d1",
    background: "linear-gradient(135deg, #0f766e, #14b8a6, #67e8f9)",
    color: "#fff",
  },
  cost: 550,
},





];



const Store = () => {
  const [items, setItems] = useState([]);
  const [mileage, setMileage] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedBorder, setSelectedBorder] = useState(null);

  const [isChoosingTitle, setIsChoosingTitle] = useState(false);
  const [isChoosingColor, setIsChoosingColor] = useState(false);
  const [isChoosingBorder, setIsChoosingBorder] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchStoreAndUserData = async () => {
      if (!user) return;

      try {
        // 상품 목록에 테두리 변경권 추가
        setItems([
          {
            id: "title_choice", 
            name: "바둑 칭호 선택권",
            description: "희귀 칭호 중에서 원하는 칭호를 골라서 사용할 수 있습니다.",
            cost: 500,
            type: "titleChoice",
          },
          {
            id: "color_change", 
            name: "닉네임 컬러 변경권",
            description: "닉네임 색상을 다양한 그라데이션 및 단색으로 변경할 수 있습니다. (한 달 지속)",
            cost: 300,
            type: "colorChange",
          },
          {
            id: "border_change",
            name: "테두리 변경권",
            description: "다양한 테두리 스타일 중에서 원하는 테두리를 골라서 사용할 수 있습니다.",
            cost: 200,
            type: "borderChange",
          },
        ]);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setMileage(data.mileage || 0);
          setUserName(data.name || "알 수 없음");
        } else {
          console.error('사용자 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndUserData();
  }, [user]);

  const handlePurchase = (item) => {
    if (!user || mileage === null) return;

    if (mileage < item.cost) {
      alert('마일리지가 부족합니다.');
      return;
    }

    if (item.type === "titleChoice") {
      setIsChoosingTitle(true);
      setIsChoosingColor(false);
      setIsChoosingBorder(false);
      return;
    }

    if (item.type === "colorChange") {
      setIsChoosingColor(true);
      setIsChoosingTitle(false);
      setIsChoosingBorder(false);
      return;
    }

    if (item.type === "borderChange") {
      setIsChoosingBorder(true);
      setIsChoosingTitle(false);
      setIsChoosingColor(false);
      return;
    }
  };

  const confirmTitleChoice = async () => {
    if (!selectedTitle) {
      alert('칭호를 선택해주세요.');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        mileage: increment(-500),
        chosenTitle: selectedTitle,
      });
      setMileage(prev => prev - 500);
      alert(`'${selectedTitle}' 칭호를 선택했습니다!`);
      setIsChoosingTitle(false);
      setSelectedTitle(null);
    } catch (error) {
      console.error('칭호 선택 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const confirmColorChoice = async () => {
    if (!selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        mileage: increment(-300),
        nameColor: selectedColor,
      });
      setMileage(prev => prev - 300);
      alert('닉네임 색상이 변경되었습니다!');
      setIsChoosingColor(false);
      setSelectedColor(null);
    } catch (error) {
      console.error('색상 변경 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const confirmBorderChoice = async () => {
    if (!selectedBorder) {
      alert('테두리를 선택해주세요.');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      // 비용은 상품에서 가져오므로 테두리 가격만큼 차감
      const borderCost = borders.find(b => b.id === selectedBorder)?.cost || 0;
      if (borderCost > mileage) {
        alert('마일리지가 부족합니다.');
        return;
      }
      await updateDoc(userRef, {
        mileage: increment(-borderCost),
        borderStyle: selectedBorder,
      });
      setMileage(prev => prev - borderCost);
      alert(`'${borders.find(b => b.id === selectedBorder)?.name}' 테두리를 선택했습니다!`);
      setIsChoosingBorder(false);
      setSelectedBorder(null);
    } catch (error) {
      console.error('테두리 선택 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (!user) return <p className="text-center text-red-500">로그인이 필요합니다.</p>;

  return (
    <div
  style={{
    maxWidth: "720px",
    margin: "40px auto",
    padding: "32px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(12px)",
    background: "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(237,242,255,0.8))",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  }}
>
  {/* 퍼지는 빛 효과 */}
  <div
    style={{
      position: "absolute",
      top: "-40px",
      left: "-40px",
      width: "160px",
      height: "160px",
      backgroundColor: "#818cf8",
      borderRadius: "9999px",
      opacity: 0.3,
      filter: "blur(48px)",
      animation: "pingSlow 3s infinite",
    }}
  />
  <div
    style={{
      position: "absolute",
      bottom: "-40px",
      right: "-40px",
      width: "160px",
      height: "160px",
      backgroundColor: "#f9a8d4",
      borderRadius: "9999px",
      opacity: 0.2,
      filter: "blur(48px)",
      animation: "pingSlow 3s infinite",
    }}
  />

  <h1
    style={{
      fontSize: "32px",
      fontWeight: "800",
      color: "#4338ca",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      userSelect: "none",
      textShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
  >
    🎁 마일리지 상점
    <span
      style={{
        fontSize: "12px",
        background: "linear-gradient(to right, #facc15, #f472b6)",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "999px",
        animation: "pulse 2s infinite",
      }}
    >
      NEW
    </span>
  </h1>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
      fontSize: "16px",
      color: "#374151",
    }}
  >
    <p style={{ margin: 0, fontWeight: 500, userSelect: "none" }}>
      👋 환영합니다, <span style={{ fontWeight: 700, color: "#1e3a8a" }}>{userName}</span> 님
    </p>
    <p style={{ margin: 0, fontWeight: 600, color: "#4f46e5", fontSize: "18px", userSelect: "none" }}>
      💰 현재 마일리지: <span style={{ fontWeight: 800 }}>{mileage}점</span>
    </p>
  </div>



      {/* 칭호 선택 */}
      {isChoosingTitle && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            backgroundColor: "#fff8dc",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>
            원하는 칭호를 선택하세요
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {titles.map((title) => {
              const isSelected = selectedTitle === title;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => setSelectedTitle(title)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: isSelected ? "3px solid #6b21a8" : "2px solid #ccc",
                    backgroundColor: isSelected ? "#7c3aed" : "#fff",
                    color: isSelected ? "#fff" : "#333",
                    fontWeight: isSelected ? "700" : "500",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 0 10px rgba(124, 58, 237, 0.7)"
                      : "none",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                    transition:
                      "background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
                    userSelect: "none",
                    outline: "none",
                    textAlign: "center",
                  }}
                >
                  {title}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={confirmTitleChoice}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
            >
              선택 완료
            </button>
            <button
              onClick={() => {
                setIsChoosingTitle(false);
                setSelectedTitle(null);
              }}
              style={{
                backgroundColor: "#9ca3af",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9ca3af")}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 닉네임 색상 선택 */}
      {isChoosingColor && (
        <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 0 5px rgba(0,0,0,0.1)", backgroundColor: "#ebf5ff" }}>
          <h2 style={{ fontSize: 24, fontWeight: "600", marginBottom: 8 }}>닉네임 색상을 선택하세요</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxHeight: 240, overflowY: "auto" }}>
            {colors.map((color, index) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  title={color.startsWith("linear-gradient") ? "그라데이션 색상" : color}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: isSelected ? "4px solid black" : "4px solid transparent",
                    background: color,
                    boxShadow: isSelected ? "0 0 10px rgba(0,0,0,0.4)" : "none",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    outline: "none",
                  }}
                />
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={confirmColorChoice}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = "#15803d"}
              onMouseOut={e => e.currentTarget.style.backgroundColor = "#16a34a"}
            >
              선택 완료
            </button>
            <button
              onClick={() => {
                setIsChoosingColor(false);
                setSelectedColor(null);
              }}
              style={{
                backgroundColor: "#9ca3af",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = "#6b7280"}
              onMouseOut={e => e.currentTarget.style.backgroundColor = "#9ca3af"}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 테두리 선택 */}
      {isChoosingBorder && (
        <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 0 5px rgba(0,0,0,0.1)", backgroundColor: "#f0f9ff" }}>
          <h2 style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>테두리를 선택하세요</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {borders.map((border) => {
  const isSelected = selectedBorder === border.id;

  return (
    <button
      key={border.id}
      type="button"
      onClick={() => setSelectedBorder(border.id)}
      style={{
        padding: "12px",
        borderRadius: 8,
        border: isSelected ? "3px solid #2563eb" : "2px solid #ccc",
        backgroundColor: "#fff",
        color: "#333",
        fontWeight: isSelected ? "700" : "500",
        cursor: "pointer",
        boxShadow: isSelected ? "0 0 10px rgba(37, 99, 235, 0.7)" : "none",
        transform: isSelected ? "scale(1.05)" : "scale(1)",
        transition: "all 0.3s ease",
        textAlign: "center",
        userSelect: "none",
        outline: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 80,
          height: 50,
          ...border.style,
        }}
      />
      <span>{border.name}</span>
      <small style={{ fontSize: 12, color: "#555" }}>{border.description}</small>
      <small style={{ fontSize: 14, fontWeight: "600", marginTop: 4 }}>
        {border.cost === 0 ? "무료" : `${border.cost}점`}
      </small>
    </button>
  );
})}

          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={confirmBorderChoice}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              선택 완료
            </button>
            <button
              onClick={() => {
                setIsChoosingBorder(false);
                setSelectedBorder(null);
              }}
              style={{
                backgroundColor: "#9ca3af",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9ca3af")}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 기본 상품 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div key={item.id} className="product-card" role="region" aria-label={item.name}>
            {index >= 2 && <div className="new-badge">NEW</div>}
            <h2 className="text-2xl font-bold mb-2 text-indigo-600">{item.name}</h2>
            <p className="text-gray-500 mb-6 min-h-[3rem]">{item.description}</p>

            <button
              onClick={() => handlePurchase(item)}
              className="sparkle-button bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors font-semibold select-none"
              aria-label={`구매하기: ${item.name}`}
            >
              구매 {item.cost > 0 ? `(${item.cost}점)` : "(무료)"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
