import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import GuanPage from './GuanPage';

export default function GuanListPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'problems'));
        const loadedProblems = querySnapshot.docs.map(doc => ({
          id: doc.id,     // 반드시 doc.id 포함
          ...doc.data(),
        }));
        setProblems(loadedProblems);
      } catch (error) {
        console.error('문제 목록 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  if (loading) return <div>문제 목록 로딩중...</div>;

  return <GuanPage problems={problems} />;
}
