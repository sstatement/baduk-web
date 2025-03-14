import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase 설정에서 db import

const GameResultForm = ({ user, userData }) => {
  const [opponentUid, setOpponentUid] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opponentUid || !result) {
      alert('모든 항목을 채워주세요.');
      return;
    }

    setLoading(true);
    try {
      // 결과 입력 후, Firestore에 업데이트
      const userRef = doc(db, 'users', user.uid);
      const opponentRef = doc(db, 'users', opponentUid);

      await updateDoc(userRef, {
        rating: userData.rating + (result === 'win' ? 10 : result === 'loss' ? -10 : 0),
      });

      await updateDoc(opponentRef, {
        rating: userData.rating + (result === 'win' ? -10 : result === 'loss' ? 10 : 0),
      });

      console.log('대국 결과가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('대국 결과 업데이트 실패:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">대국 결과 입력</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="opponentUid" className="block text-sm font-medium text-gray-700">상대의 UID</label>
          <input
            id="opponentUid"
            type="text"
            value={opponentUid}
            onChange={(e) => setOpponentUid(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="result" className="block text-sm font-medium text-gray-700">대국 결과</label>
          <select
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            required
          >
            <option value="">결과 선택</option>
            <option value="win">승리</option>
            <option value="loss">패배</option>
            <option value="draw">무승부</option>
          </select>
        </div>
        <button
          type="submit"
          className={`w-full py-2 mt-4 bg-blue-500 text-white font-semibold rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? '처리 중...' : '결과 제출'}
        </button>
      </form>
    </div>
  );
};

export default GameResultForm;
