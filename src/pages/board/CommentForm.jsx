// src/pages/board/CommentForm.jsx
import React, { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./board.css";

export default function CommentForm({ postId }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const me = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!me) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    if (!content.trim()) return;

    try {
      setSaving(true);
      const authorName =
        me.displayName || me.email?.split("@")[0] || "익명";

      await addDoc(collection(db, "freePosts", postId, "comments"), {
        content: content.trim(),
        authorUid: me.uid,
        authorName,
        createdAt: serverTimestamp(),
      });

      setContent("");
    } catch (e) {
      console.error("댓글 작성 실패:", e);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="board-comment-form" onSubmit={handleSubmit}>
      <textarea
        className="board-comment-textarea"
        placeholder={
          me ? "댓글을 입력해 주세요." : "로그인 후 댓글을 작성할 수 있습니다."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!me || saving}
      />
      <div className="board-comment-actions">
        <button
          type="submit"
          className="board-button-primary"
          style={{ fontSize: "0.75rem", padding: "6px 12px" }}
          disabled={!me || saving || !content.trim()}
        >
          {saving ? "작성 중..." : "댓글 작성"}
        </button>
      </div>
    </form>
  );
}
