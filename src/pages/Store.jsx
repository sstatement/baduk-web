import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore';

const titles = [
  "초고수", "명인 (名人)", "대가 (大家)", "국수 (國手)", "신의 한 수",
  "입신", "바둑 마스터", "대마 불사", "반상을 지배하는자", "불멸의 전략가"
];

// 단색 + 그라데이션 색상 예시
const colors = [
  "#FF5F6D",
  "#FFC371",
  "#24C6DC",
  "#514A9D",
  "#FF512F",
  "#DD2476",
  "#8A2387",
  "#00F260",
  "#0575E6",
  "#7F00FF",
  "#E100FF",
  "linear-gradient(to right, #FF5F6D, #FFC371)",
  "linear-gradient(to right, #24C6DC, #514A9D)"
];

const Store = () => {
  const [items, setItems] = useState([]);
  const [mileage, setMileage] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isChoosingTitle, setIsChoosingTitle] = useState(false);
  const [isChoosingColor, setIsChoosingColor] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchStoreAndUserData = async () => {
      if (!user) return;

      try {
        // 하드코딩된 상점 아이템 (필요시 DB 연동 가능)
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
      return;
    }

    if (item.type === "colorChange") {
      setIsChoosingColor(true);
      setIsChoosingTitle(false);
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

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (!user) return <p className="text-center text-red-500">로그인이 필요합니다.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎁 마일리지 상점</h1>
      <p className="text-right mb-2 text-sm text-gray-600">
        환영합니다, <span className="font-semibold">{userName}</span>
      </p>
      <p className="text-right mb-6">현재 마일리지: <span className="font-semibold">{mileage}점</span></p>

      {isChoosingTitle && (
  <div
    style={{
      marginBottom: 24,
      padding: 16,
      border: "1px solid #ddd",
      borderRadius: 8,
      boxShadow: "0 0 5px rgba(0,0,0,0.1)",
      backgroundColor: "#fff8dc", // 옅은 노란 배경
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


      {/* 기본 상품 목록 */}
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <button
              onClick={() => handlePurchase(item)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              구매 ({item.cost}점)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;

