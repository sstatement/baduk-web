import React, { useState, useEffect } from 'react';
import { db, updateMileage } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase';

const QuestPage = () => {
  const [quests, setQuests] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, 'weekly_quests'));
      setQuests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchQuests();
  }, []);

  const handleQuestComplete = async (questId, mileageReward) => {
    if (user) {
      const questRef = doc(db, 'weekly_quests', questId);
      await updateDoc(questRef, { completed: true });
      await updateMileage(user.uid, mileageReward);
      alert(`퀘스트 완료! ${mileageReward} 마일리지 획득`);
    }
  };

  return (
    <div>
      <h1>바둑 주간퀘스트</h1>
      {quests.map((quest) => (
        <div key={quest.id}>
          <h2>{quest.title}</h2>
          <p>{quest.description}</p>
          <button onClick={() => handleQuestComplete(quest.id, quest.mileageReward)}>
            완료 ({quest.mileageReward} 마일리지)
          </button>
        </div>
      ))}
    </div>
  );
};

export default QuestPage;
