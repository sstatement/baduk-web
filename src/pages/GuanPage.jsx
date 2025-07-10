import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const difficulties = ['초급', '중급', '고급'];

export default function GuanPage() {
  const [selectedDiff, setSelectedDiff] = useState('초급');
  const [problems, setProblems] = useState([]);       // ✅ 초기값 배열
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProblems() {
      try {
        const snapshot = await getDocs(collection(db, 'problems'));
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProblems(items || []);                      // ✅ 방어적 할당
      } catch (error) {
        console.error('문제 불러오기 실패:', error);
        setProblems([]);                               // ✅ 실패해도 배열
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  // ✅ 필터도 안전하게
  const filteredProblems = (problems || []).filter(
    p => p?.difficulty === selectedDiff
  );

  const handleProblemClick = (problemId) => {
    navigate(`/guan/record/${problemId}/1/1`);
  };

  if (loading) return <div>문제 목록을 불러오는 중...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>사활 문제 선택</h1>

      <div style={{ marginBottom: 20 }}>
        <Link to="/guan/add">
          <button>문제 만들기</button>
        </Link>
      </div>

      <label>
        난이도:
        <select
          value={selectedDiff}
          onChange={e => setSelectedDiff(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </label>

      <ul>
        {filteredProblems.map(problem => (
          <li
            key={problem.id}
            style={{
              cursor: 'pointer',
              margin: '10px 0',
              borderBottom: '1px solid #ccc'
            }}
            onClick={() => handleProblemClick(problem.id)}
          >
            {problem.title ?? '제목 없음'} ({problem.difficulty ?? '난이도 없음'})
          </li>
        ))}
      </ul>
    </div>
  );
}
