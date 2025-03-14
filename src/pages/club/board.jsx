import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Board = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 게시글 목록을 Firestore에서 불러오는 함수
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'board'));
        const postsData = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt ? data.createdAt.seconds : null;
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            createdAt: createdAt ? new Date(createdAt * 1000) : null,  // createdAt 값이 있으면 Date로 변환
            userId: data.userId,
            username: data.username,
          };
        });
        setPosts(postsData); // 게시글 목록을 상태에 설정
      } catch (error) {
        console.error("게시글 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // 처음 한번만 실행

  // 게시글 등록 함수
  const handleAddPost = async () => {
    if (!currentUser) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    try {
      // Firestore에 새 게시글 추가
      await addDoc(collection(db, 'board'), {
        title: newTitle,
        content: newContent,
        createdAt: new Date(),
        userId: currentUser.id, // 현재 사용자 ID 추가
        username: currentUser.name, // 사용자 이름 추가
      });

      setNewTitle('');
      setNewContent('');

      // 새로 추가된 게시글을 포함한 전체 게시글 목록을 다시 불러오기
      const snapshot = await getDocs(collection(db, 'board'));
      const postsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.seconds : null;
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: createdAt ? new Date(createdAt * 1000) : null,  // createdAt 값이 있으면 Date로 변환
          userId: data.userId,
          username: data.username,
        };
      });
      setPosts(postsData); // 목록 업데이트
    } catch (error) {
      console.error("게시글 등록 오류:", error);
    }
  };

  // 게시글 제목 클릭 시 해당 게시글 열람
  const handleViewPost = (id) => {
    navigate(`/board/${id}`);
  };

  if (loading) {
    return <p>게시글을 불러오는 중...</p>;
  }

  return (
    <div className="board-container">
      <h1>게시판</h1>

      {/* 게시글 등록 폼 */}
      <div className="post-form">
        <h2>새 게시글 등록</h2>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="게시글 제목"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="게시글 내용"
        />
        <button onClick={handleAddPost} disabled={!newTitle || !newContent}>
          게시글 등록
        </button>
      </div>

      {/* 게시글 목록 */}
      <h2>게시글 목록</h2>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <button onClick={() => handleViewPost(post.id)}>
                {post.title}
              </button>
              {post.createdAt && (
                <span> - {post.createdAt.toLocaleString()}</span> // 날짜 형식으로 표시
              )}
            </li>
          ))
        ) : (
          <p>등록된 게시글이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default Board;
