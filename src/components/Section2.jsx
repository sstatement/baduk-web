// src/components/Section2.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from "firebase/firestore";

const Section2 = () => {
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const unsubscribe = onSnapshot(postsRef, snapshot => {
      setPosts(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async () => {
    if (post.trim()) {
      // Firestore에 게시글 추가
      await addDoc(collection(db, 'posts'), {
        content: post,
        timestamp: new Date(),
      });
      setPost('');
    }
  };

  return (
    <div>
      <h2>게시글</h2>

      <div>
        <textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          placeholder="게시글을 입력하세요"
          rows="4"
          cols="50"
        />
        <button onClick={handlePostSubmit}>게시글 올리기</button>
      </div>

      <div>
        <h3>최근 게시글</h3>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index}>
              <p>{post.content}</p>
              <p><small>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</small></p>
            </div>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Section2;
