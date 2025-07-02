import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const TournamentCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '리그',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    rules: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('로그인이 필요합니다.');

      await addDoc(collection(db, 'tournaments'), {
        ...form,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      navigate('/tournaments');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">대회 생성</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="대회명"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="리그">리그</option>
          <option value="토너먼트">토너먼트</option>
          <option value="스위스">스위스</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="date"
          name="registrationDeadline"
          value={form.registrationDeadline}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <textarea
          name="rules"
          placeholder="규칙 설명"
          value={form.rules}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? '생성중...' : '대회 생성'}
        </button>
      </form>
    </div>
  );
};

export default TournamentCreate;
