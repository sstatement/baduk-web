import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const TITLE_MAX = 80;
const CONTENT_MAX = 2000;

const CreateAnnouncement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const navigate = useNavigate();

  const titleLen = title.length;
  const contentLen = content.length;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (titleLen > TITLE_MAX || contentLen > CONTENT_MAX) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: title.trim(),
        content: content.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      });
      navigate("/announcements");
    } catch (error) {
      console.error("공지사항 작성 오류:", error);
      alert("공지사항 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Ctrl/Cmd + Enter로 제출
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [title, content]); // 최신 값으로 제출

  // 간단한 줄바꿈만 반영하는 프리뷰(마크다운 필요시 후속 확장)
  const previewHtml = useMemo(() => {
    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc(content).replace(/\n/g, "<br/>");
  }, [content]);

  // CreateAnnouncement.jsx (핵심 JSX만 발췌)
return (
  <div className="create-announcement">
    <div className="create-announcement__head">
      <span className="icon-badge">📝</span>
      <div>
        <h1 className="title">공지사항 작성</h1>
        <p className="subtitle">공지사항은 홈과 목록에 노출됩니다. 정확하고 간결하게 작성해주세요.</p>
      </div>
    </div>

    <div className="create-announcement__grid">
      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="title" className="label">제목</label>
        <div className="field-wrap">
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            className="input"
            placeholder="공지사항 제목을 입력하세요"
            required
          />
          <span className="char-counter">{title.length}/{TITLE_MAX}</span>
        </div>

        <label htmlFor="content" className="label mt-24">내용</label>
        <div className="field-wrap">
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            className="textarea"
            placeholder="공지사항 내용을 입력하세요"
            rows={8}
            required
          />
          <span className="char-counter">{content.length}/{CONTENT_MAX}</span>
        </div>

        <div className="actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn--ghost">
            취소
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="btn btn--primary"
            title="Ctrl/⌘ + Enter 로 등록"
          >
            {loading && <span className="spinner" aria-hidden="true"></span>}
            {loading ? "등록 중..." : "공지사항 등록"}
          </button>
        </div>

        <p className="hint">
          단축키: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>
        </p>
      </form>

      {/* 미리보기 */}
      <div className="card preview">
        <div className="preview__head">
          <div className="preview__title">라이브 미리보기</div>
          <button
            type="button"
            className="btn btn--xs"
            onClick={() => setShowPreview(v => !v)}
          >
            {showPreview ? "숨기기" : "보이기"}
          </button>
        </div>

        <div className="preview__body">
          <div className="preview__heading">
            {title || <span className="muted">제목 미리보기</span>}
          </div>
          {showPreview ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{
                __html: (content
                  ? content
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\n/g, "<br/>")
                  : "<span class='muted'>내용 미리보기</span>")
              }}
            />
          ) : (
            <div className="muted small">미리보기가 숨겨져 있습니다.</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

};

export default CreateAnnouncement;
