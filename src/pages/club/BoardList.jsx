import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import buttonImage from "../../images/button.jpg";

const BoardList = () => {
  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('createdAt');
  const [category, setCategory] = useState('all'); // 카테고리 상태 추가

  const fetchPosts = async () => {
    let q;
    
    // 기본 정렬 기준 적용
    if (category === 'all') {
      q = query(collection(db, 'board'), orderBy('pinned', 'desc'), orderBy(sortOrder, 'desc'));
    } else {
      q = query(collection(db, 'board'), where('category', '==', category), orderBy('pinned', 'desc'), orderBy(sortOrder, 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, [sortOrder, category]); // 정렬 순서와 카테고리 변경 시 업데이트

  return (
    <div>
      <h2>자유게시판</h2>

      {/* 카테고리 선택 */}
      <select onChange={(e) => setCategory(e.target.value)} value={category}>
        <option value="all">전체</option>
        <option value="공지">공지</option>
        <option value="일반">일반</option>
        <option value="질문">질문</option>
        <option value="토론">토론</option>
      </select>

      {/* 정렬 기준 선택 */}
      <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
        <option value="createdAt">최신순</option>
        <option value="likes">인기순</option>
        <option value="views">조회순</option>
      </select>

      {/* 게시글 작성 버튼 */}
      <Link to="/club/board/create" className="custom-link">
        <button className="custom-button" style={{ backgroundImage: `url(${buttonImage})` }}>
          게시글 작성
        </button>
      </Link>

      <ul>
        {posts.map(post => {
          const postDate = post.createdAt && post.createdAt.seconds 
            ? new Date(post.createdAt.seconds * 1000) 
            : post.createdAt;

          return (
            <li key={post.id} style={post.pinned ? { backgroundColor: "#ffeb3b" } : {}}>
              <Link to={`/club/board/${post.id}`} className="custom-link">
                <h3>{post.pinned ? "📌 " : ""}{post.title}</h3>
              </Link>
              
              <p>{postDate ? postDate.toLocaleDateString() : '날짜 정보 없음'}</p>
              <p>작성자: {post.author}</p>
              <p>Likes: {post.likes}</p>
              <p>조회수: {post.views}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BoardList;
