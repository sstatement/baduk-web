import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');

  const navigate = useNavigate();

  // ✅ 1. 로그인 유저 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role || 'user');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ 2. 대회 리스트 가져오기
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTournaments(data);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      }
      setLoading(false);
    };

    fetchTournaments();
  }, []);

  // ✅ 3. 삭제 핸들러
  const handleDelete = async (id) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'tournaments', id));
      setTournaments(prev => prev.filter(t => t.id !== id));
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ✅ 4. 권한 확인
  const canDelete = (tournamentOwnerId) => {
    if (!user) return false;
    return (
      user.uid === tournamentOwnerId ||
      userRole === 'admin' ||
      userRole === 'staff'
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">대회 목록</h1>

      {/* ✅ 대회 생성 버튼 (로그인 필요) */}
      {user ? (
        <button
          onClick={() => navigate('/tournaments/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          + 대회 생성
        </button>
      ) : (
        <p className="text-sm text-red-500 mb-4">로그인 후 대회를 생성할 수 있습니다.</p>
      )}

      {loading ? (
        <p>불러오는 중...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-gray-500">등록된 대회가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {tournaments.map(t => (
            <div
              key={t.id}
              className="border p-4 rounded hover:bg-gray-50 transition relative"
            >
              <Link to={`/tournaments/${t.id}`}>
                <h2 className="text-xl font-semibold">{t.name}</h2>
                <p className="text-gray-600">{t.description}</p>
                <p className="text-sm text-gray-500">
                  유형: {t.type} | 일정: {t.startDate} ~ {t.endDate}
                </p>
              </Link>

              {canDelete(t.ownerId) && (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
