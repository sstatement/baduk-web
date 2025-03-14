import React, { useState } from 'react';
import { db } from '../../firebase'; // Firebase 연결
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'; // Firestore 관련 함수

const Apply = () => {
  const [playerName, setPlayerName] = useState('');
  const [stamina, setStamina] = useState(''); // 타이젬 기력 (stamina) 입력
  const [message, setMessage] = useState('');

  // 기력 값 매핑 함수
  const mapStaminaToLevel = (staminaInput) => {
    const levels = {
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

    return levels[staminaInput] || levels["1단"]; // 기력 값이 없으면 기본 1단으로 설정
  };

  // 참가 신청 처리 함수
  const handleApply = async () => {
    if (!playerName) {
      setMessage('이름을 입력해주세요.');
      return;
    }

    // 기력이 비어있는 경우 기본 값으로 1단을 설정
    const mappedStamina = stamina ? mapStaminaToLevel(stamina) : mapStaminaToLevel("1단");

    try {
      // 'matchApplications' 컬렉션에서 기존 이름으로 검색
      const applicationsRef = collection(db, 'matchApplications');
      const q = query(applicationsRef, where('playerName', '==', playerName)); // playerName이 일치하는 데이터 검색
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 이미 있는 사용자라면
        setMessage('이미 있는 사용자입니다.');
        return; // 함수 종료
      }

      // 레이팅을 기본값인 1500으로 설정
      let newRating = 1500;
      // 기본 승수, 패수, 승률 설정
      const win = 0;
      const loss = 0;
      const winRate = 0; // 승률은 초기 값으로 0

      // Firestore에 참가 신청 정보를 저장
      const userDocRef = doc(db, 'matchApplications', playerName); // playerName을 문서 ID로 사용
      await setDoc(userDocRef, {
        playerName,
        stamina: mappedStamina, // 매핑된 기력 값 저장
        rating: newRating, // 레이팅 값 저장
        win, // 승수 초기화
        loss, // 패수 초기화
        winRate, // 승률 초기화
        createdAt: new Date(), // 생성 날짜 저장
      });

      setMessage('리그전 참가 신청이 완료되었습니다!');
      setPlayerName('');
      setStamina('');
    } catch (error) {
      console.error("Error saving application:", error);
      setMessage('신청 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">리그전 참가 신청</h2>
      
      {/* 이름 입력 */}
      <input
        type="text"
        placeholder="이름을 입력하세요"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      
      {/* 타이젬 기력 입력 (stamina) */}
      <input
        type="text"
        placeholder="타이젬 기력 (예: 18급, 1단) 입력하세요"
        value={stamina}
        onChange={(e) => setStamina(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      
      {/* 참가 신청 버튼 */}
      <button
        onClick={handleApply}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        리그전 참가 신청
      </button>

      {/* 메시지 출력 */}
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Apply;
