import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firebase에서 Firestore를 가져옵니다
import { collection, getDocs } from 'firebase/firestore'; // Firestore에서 collection과 getDocs 가져오기

const ClubMembers = () => {
  const [members, setMembers] = useState([]); // 회원 목록 상태 관리
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태 관리

  // 회원 데이터를 Firestore에서 불러오는 함수
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Firestore에서 users 컬렉션을 가져옵니다
        const snapshot = await getDocs(collection(db, 'users'));

        // 데이터 매핑
        const membersData = snapshot.docs.map(doc => {
          const data = doc.data();
          // createdAt이 Timestamp 객체일 경우 Date 객체로 변환
          const createdAt = data.createdAt 
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() 
            : '불명'; // createdAt 필드가 있을 때만 처리
          return { name: data.name, createdAt };
        });

        setMembers(membersData);
      } catch (error) {
        console.error("회원 목록 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []); // 빈 배열을 두어 컴포넌트가 처음 마운트될 때만 실행

  if (loading) {
    return <p>회원 목록을 불러오는 중...</p>;
  }

  return (
    <div className="members-container">
      <h1>회원 목록</h1>
      <table className="members-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member, index) => (
              <tr key={index}>
                <td>{member.name}</td>
                <td>{member.createdAt}</td> {/* 날짜 형식으로 변환된 createdAt */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">가입된 회원이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClubMembers;
