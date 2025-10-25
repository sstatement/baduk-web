import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../members.css';

const ClubMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const membersData = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : '불명';
          return {
            name: data.name || '이름 없음',
            createdAt,
            role: data.role || 'member', // 기본값 member
          };
        });
        setMembers(membersData);
      } catch (error) {
        console.error('회원 목록 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <p>회원 목록을 불러오는 중...</p>;

  // 역할에 따라 스타일 클래스를 지정하는 함수
  const getRoleClass = (role) => {
    if (role === 'admin') return 'gold';
    if (role === 'staff') return 'silver';
    return ''; // 일반 회원
  };

  // 역할에 따른 표시 텍스트
  const getRoleText = (role) => {
    if (role === 'admin') return '관리자';
    if (role === 'staff') return '스태프';
    return '일반';
  };

  return (
    <div className="members-container">
      <h1>회원 목록</h1>
      <table className="members-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>등급</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member, index) => (
              <tr key={index} className={member.role === 'admin' ? 'is-vip' : ''}>
                <td>{member.name}</td>
                <td>
                  <span className={`members-chip ${getRoleClass(member.role)}`}>
                    {getRoleText(member.role)}
                  </span>
                </td>
                <td>{member.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">가입된 회원이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClubMembers;
