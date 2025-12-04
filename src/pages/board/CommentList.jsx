// src/pages/board/CommentList.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./board.css";

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const me = auth.currentUser;

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "freePosts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setComments(list);
    });

    return () => unsub();
  }, [postId]);

  const handleDelete = async (commentId, authorUid) => {
    if (!me || me.uid !== authorUid) {
      alert("본인이 작성한 댓글만 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm("댓글을 삭제할까요?")) return;

    try {
      await deleteDoc(doc(db, "freePosts", postId, "comments", commentId));
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  if (comments.length === 0) {
    return (
      <div className="board-status" style={{ textAlign: "left", marginTop: 4 }}>
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <ul className="board-comment-list">
      {comments.map((c) => {
        const date = c.createdAt?.toDate ? c.createdAt.toDate() : null;
        const dateStr = date
          ? date.toLocaleString("ko-KR", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";

        const isMine = me && me.uid === c.authorUid;

        return (
          <li key={c.id} className="board-comment-item">
            <div className="board-comment-header">
              <span className="board-comment-author">
                {c.authorName || "익명"}
              </span>
              <span className="board-comment-date">{dateStr}</span>
            </div>
            <div className="board-comment-body">{c.content}</div>
            {isMine && (
              <div className="board-comment-footer">
                <button
                  type="button"
                  className="board-comment-delete-button"
                  onClick={() => handleDelete(c.id, c.authorUid)}
                >
                  삭제
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
