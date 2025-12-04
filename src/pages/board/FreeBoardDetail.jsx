// src/pages/board/FreeBoardDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import "./board.css";

const ADMIN_UIDS = [
  // 공지 설정 가능한 관리자 UID
  // "YOUR_ADMIN_UID_HERE",
];

export default function FreeBoardDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [likeLoading, setLikeLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  const navigate = useNavigate();
  const me = auth.currentUser;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const ref = doc(db, "freePosts", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert("존재하지 않는 게시글입니다.");
          navigate("/board");
          return;
        }
        const data = snap.data();
        setPost({ id: snap.id, ...data });
        setEditTitle(data.title);
        setEditContent(data.content);
        setLocalLikes(data.likesCount ?? 0);

        // 조회수 +1
        await updateDoc(ref, {
          viewCount: increment(1),
        });

        // 좋아요 여부
        const currentUser = auth.currentUser;
        if (currentUser) {
          const likeRef = doc(db, "freePosts", id, "likes", currentUser.uid);
          const likeSnap = await getDoc(likeRef);
          setHasLiked(likeSnap.exists());
        }
      } catch (e) {
        console.error("게시글 로드 실패:", e);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
        navigate("/board");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="board-page">
        <div className="board-status">불러오는 중...</div>
      </div>
    );
  }

  if (!post) return null;

  const date = post.createdAt?.toDate ? post.createdAt.toDate() : null;
  const dateStr = date
    ? date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const isAuthor = me && me.uid === post.authorUid;
  const isAdmin = me && ADMIN_UIDS.includes(me.uid);

  const handleDelete = async () => {
    if (!isAuthor && !isAdmin) {
      alert("삭제 권한이 없습니다.");
      return;
    }
    if (!window.confirm("정말로 이 글을 삭제하시겠습니까?")) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "freePosts", id));
      alert("삭제되었습니다.");
      navigate("/board");
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!isAuthor && !isAdmin) {
      alert("수정 권한이 없습니다.");
      return;
    }
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    try {
      const ref = doc(db, "freePosts", id);
      await updateDoc(ref, {
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: serverTimestamp(),
      });
      setPost((prev) => ({
        ...prev,
        title: editTitle.trim(),
        content: editContent.trim(),
      }));
      setEditMode(false);
    } catch (e) {
      console.error("수정 실패:", e);
      alert("글 수정 중 오류가 발생했습니다.");
    }
  };

  const handleTogglePinned = async () => {
    if (!isAdmin) {
      alert("공지 설정 권한이 없습니다.");
      return;
    }
    try {
      const ref = doc(db, "freePosts", id);
      await updateDoc(ref, {
        isPinned: !post.isPinned,
      });
      setPost((prev) => ({
        ...prev,
        isPinned: !prev.isPinned,
      }));
    } catch (e) {
      console.error("공지 설정 실패:", e);
      alert("공지 설정 중 오류가 발생했습니다.");
    }
  };

  const handleToggleLike = async () => {
    if (!me) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }
    setLikeLoading(true);
    try {
      const likeRef = doc(db, "freePosts", id, "likes", me.uid);
      const postRef = doc(db, "freePosts", id);

      if (hasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likesCount: increment(-1),
        });
        setHasLiked(false);
        setLocalLikes((prev) => Math.max(0, prev - 1));
      } else {
        await setDoc(likeRef, {
          uid: me.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(postRef, {
          likesCount: increment(1),
        });
        setHasLiked(true);
        setLocalLikes((prev) => prev + 1);
      }
    } catch (e) {
      console.error("좋아요 처리 실패:", e);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="board-page">
      <div className="board-top-nav">
        <button
          className="board-top-link"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← 뒤로
        </button>
        <Link to="/board" className="board-top-link">
          목록으로
        </Link>
      </div>

      <div className="board-card" style={{ padding: "12px 16px" }}>
        <div className="board-detail-header-row">
          <div className="board-detail-title-wrap">
            {post.isPinned && (
              <span className="board-badge-pinned">공지</span>
            )}
            {editMode ? (
              <input
                className="board-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            ) : (
              <div className="board-detail-title">{post.title}</div>
            )}
          </div>

          <div className="board-detail-meta-right">
            <span>작성자: {post.authorName || "익명"}</span>
            <span>
              조회 {post.viewCount ?? 0} · 좋아요 {localLikes}
            </span>
          </div>
        </div>

        <div className="board-detail-subrow">
          <span>{dateStr}</span>
          <div className="board-detail-subbuttons">
            {isAdmin && (
              <button
                type="button"
                className="board-chip-button"
                onClick={handleTogglePinned}
              >
                {post.isPinned ? "공지 해제" : "공지로"}
              </button>
            )}
            {(isAuthor || isAdmin) && (
              <>
                {!editMode ? (
                  <button
                    type="button"
                    className="board-chip-button"
                    onClick={() => setEditMode(true)}
                  >
                    글 수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="board-chip-button board-chip-button--primary"
                      onClick={handleUpdatePost}
                    >
                      수정 완료
                    </button>
                    <button
                      type="button"
                      className="board-chip-button"
                      onClick={() => {
                        setEditTitle(post.title);
                        setEditContent(post.content);
                        setEditMode(false);
                      }}
                    >
                      취소
                    </button>
                  </>
                )}
              </>
            )}
            {(isAuthor || isAdmin) && !editMode && (
              <button
                type="button"
                className="board-chip-button board-chip-button--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            )}
          </div>
        </div>

        {post.imageUrl && (
          <div className="board-image-wrapper">
            <img
              src={post.imageUrl}
              alt="첨부 이미지"
              className="board-image"
            />
          </div>
        )}

        <div className="board-detail-body">
          {editMode ? (
            <textarea
              className="board-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            post.content
          )}
        </div>

        <div className="board-like-wrap">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={
              "board-like-button" +
              (hasLiked ? " board-like-button--active" : "")
            }
          >
            <span>{hasLiked ? "♥" : "♡"}</span>
            <span>{localLikes}</span>
          </button>
        </div>
      </div>

      <div className="board-comment-section-title">댓글</div>
      <CommentForm postId={id} />
      <CommentList postId={id} />
    </div>
  );
}
