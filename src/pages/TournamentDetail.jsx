import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  // 1️⃣ 로그인 사용자 정보 가져오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2️⃣ 대회 정보 가져오기
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const docRef = doc(db, 'tournaments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTournament({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('대회를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
      setLoading(false);
    };

    fetchTournament();
  }, [id]);

  // 3️⃣ 참가 여부 확인
  useEffect(() => {
    const checkIfRegistered = async () => {
      if (!user || !id) {
        setCheckingRegistration(false);
        return;
      }
      try {
        const q = query(
          collection(db, `tournaments/${id}/participants`),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        setIsRegistered(!snapshot.empty);
      } catch (err) {
        console.error('Error checking registration:', err);
      }
      setCheckingRegistration(false);
    };

    if (user) {
      checkIfRegistered();
    } else {
      setCheckingRegistration(false);
    }
  }, [user, id]);

  // 4️⃣ 참가 신청
  const handleRegister = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await addDoc(collection(db, `tournaments/${id}/participants`), {
        userId: user.uid,
        displayName: user.displayName || '',
        joinedAt: serverTimestamp(),
      });
      setIsRegistered(true);
      alert('참가 신청이 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('참가 신청 중 오류가 발생했습니다.');
    }
  };

  // 로딩/에러 처리
  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{tournament.name}</h1>
      <p className="text-gray-600 mb-2">{tournament.description}</p>

      <div className="mb-4 space-y-1">
        <p><span className="font-semibold">유형:</span> {tournament.type}</p>
        <p><span className="font-semibold">대회 일정:</span> {tournament.startDate} ~ {tournament.endDate}</p>
        <p><span className="font-semibold">참가 신청 마감:</span> {tournament.registrationDeadline}</p>
        <p><span className="font-semibold">규칙:</span> {tournament.rules || '없음'}</p>
      </div>

      <div className="mt-6">
        {user ? (
          checkingRegistration ? (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              확인중...
            </button>
          ) : isRegistered ? (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              참가 신청 완료
            </button>
          ) : (
            <button
              onClick={handleRegister}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              참가 신청
            </button>
          )
        ) : (
          <p className="text-red-500">로그인 후 참가 신청이 가능합니다.</p>
        )}
      </div>
    </div>
  );
};

export default TournamentDetail;
