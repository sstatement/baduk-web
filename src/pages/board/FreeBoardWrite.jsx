// src/pages/board/FreeBoardWrite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./board.css";

export default function FreeBoardWrite() {
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("로그인이 필요한 기능입니다.");
        navigate("/login");
      } else {
        setMe(user);
      }
    });
    return () => unsub();
  }, [navigate]);

  const checkClubMember = async (uid) => {
    const memberRef = doc(db, "users", uid); // 실제 컬렉션 이름에 맞게 사용
    const snap = await getDoc(memberRef);
    return snap.exists();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    if (!me) return;

    setSaving(true);
    try {
      const isMember = await checkClubMember(me.uid);
      if (!isMember) {
        alert("동아리원만 게시글을 작성할 수 있습니다.");
        setSaving(false);
        return;
      }

      const realName =
        me.displayName || me.email?.split("@")[0] || "익명";
      const authorName = isAnonymous ? "익명" : realName;

      const docRef = await addDoc(collection(db, "freePosts"), {
        title: title.trim(),
        content: content.trim(),
        authorUid: me.uid,
        authorName,
        isAnonymous,
        imageUrl: null,
        viewCount: 0,
        likesCount: 0,
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (imageFile) {
        const storageRef = ref(
          storage,
          `freePosts/${docRef.id}/${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        const url = await getDownloadURL(storageRef);
        await updateDoc(docRef, { imageUrl: url });
      }

      navigate(`/board/${docRef.id}`);
    } catch (e) {
      console.error("글 작성 실패:", e);
      alert("글 작성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (!window.confirm("작성 중인 내용이 사라집니다. 이동할까요?")) return;
    }
    navigate("/board");
  };

  return (
    <div className="board-page">
      <div className="board-header">
        <h1 className="board-title">글 작성</h1>
      </div>

      <form className="board-form" onSubmit={handleSubmit}>
        <div className="board-form-group">
          <label className="board-label">제목</label>
          <input
            className="board-input"
            type="text"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="board-form-group">
          <label className="board-label">내용</label>
          <textarea
            className="board-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="board-form-group board-form-options">
          <label className="board-checkbox-label">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>익명으로 작성하기</span>
          </label>

          <div>
            <label className="board-label">이미지 첨부 (선택)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
            />
            {imageFile && (
              <div className="board-file-info">
                선택된 파일: {imageFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="board-form-actions">
          <button
            type="button"
            className="board-button-secondary"
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            type="submit"
            className="board-button-primary"
            disabled={saving}
          >
            {saving ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
