import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getDoc, doc, updateDoc, collection, getDocs, increment } from 'firebase/firestore';
import { auth } from '../firebase';

const Store = () => {
  const [items, setItems] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchItems = async () => {
      const itemsRef = collection(db, 'store');
      const querySnapshot = await getDocs(itemsRef);
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // 문서 ID 포함
    };

    fetchItems();
  }, []);

  const handlePurchase = async (itemId) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const itemRef = doc(db, 'store', itemId);
      const itemSnap = await getDoc(itemRef);
      if (itemSnap.exists()) {
        const item = itemSnap.data();
        if (user.mileage >= item.cost) {
          await updateDoc(userRef, { mileage: increment(-item.cost) });
          alert('아이템을 성공적으로 구매했습니다!');
        } else {
          alert('마일리지가 부족합니다.');
        }
      }
    }
  };

  return (
    <div>
      <h1>상점</h1>
      {items.map((item) => (
        <div key={item.id}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <button onClick={() => handlePurchase(item.id)}>구매 ({item.cost} 마일리지)</button>
        </div>
      ))}
    </div>
  );
};

export default Store;
