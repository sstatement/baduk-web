// src/pages/board/FreeBoardList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./board.css";

export default function FreeBoardList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "freePosts"),
          orderBy("createdAt", "desc") // 인덱스 신경 안 쓰는 버전
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 공지(isPinned) 우선 정렬 (프론트에서 처리)
        list.sort((a, b) => {
          const ap = a.isPinned ? 1 : 0;
          const bp = b.isPinned ? 1 : 0;
          if (ap !== bp) return bp - ap; // 공지 먼저
          const ad = a.createdAt?.toMillis?.() ?? 0;
          const bd = b.createdAt?.toMillis?.() ?? 0;
          return bd - ad; // 최신순
        });

        setPosts(list);
      } catch (e) {
        console.error("게시글 로드 실패:", e);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleWriteClick = () => {
    const user = auth.currentUser;
    if (!user) {
      if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
        navigate("/login");
      }
      return;
    }
    navigate("/board/write");
  };

  return (
    <div className="board-page">
      <div className="board-header">
        <h1 className="board-title">자유게시판</h1>
        <button className="board-button-primary" onClick={handleWriteClick}>
          글 쓰기
        </button>
      </div>

      {loading ? (
        <div className="board-status">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="board-status">첫 번째 글을 작성해 보세요!</div>
      ) : (
        <div className="board-card">
          <table className="board-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>조회</th>
                <th>좋아요</th>
                <th>작성일</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const date = post.createdAt?.toDate
                  ? post.createdAt.toDate()
                  : null;
                const dateStr = date
                  ? date.toLocaleDateString("ko-KR", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "-";

                return (
                  <tr
                    key={post.id}
                    className="board-table-row"
                    onClick={() => navigate(`/board/${post.id}`)}
                  >
                    <td>
                      {post.isPinned && (
                        <span className="board-badge-pinned">공지</span>
                      )}
                      <span className="board-link">{post.title}</span>
                    </td>
                    <td>{post.authorName || "익명"}</td>
                    <td>{post.viewCount ?? 0}</td>
                    <td>{post.likesCount ?? 0}</td>
                    <td>{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
