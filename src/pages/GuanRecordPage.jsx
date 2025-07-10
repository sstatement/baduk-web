import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BadukProblemSolver from './BadukProblemSolver';

export default function GuanRecordPage() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProblem() {
      setLoading(true);
      try {
        const docRef = doc(db, 'problems', problemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProblem(docSnap.data());
        } else {
          setError('문제를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('문제 불러오기 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  if (loading) return <div>문제 로딩 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!problem) return <div>문제가 없습니다.</div>;

  return (
    <div>
      <h1>{problem.title || '사활 문제'}</h1>
      <BadukProblemSolver problem={problem} />
    </div>
  );
}
