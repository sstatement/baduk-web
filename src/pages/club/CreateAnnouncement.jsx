import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CreateAnnouncement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "announcements"), {
        title,
        content,
        createdAt: Timestamp.fromDate(new Date()),
      });
      alert("공지사항이 등록되었습니다.");
      navigate("/announcements"); // 공지사항 목록 페이지로 리다이렉트
    } catch (error) {
      console.error("공지사항 작성 오류:", error);
      alert("공지사항 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">공지사항 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-semibold">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="공지사항 제목을 입력하세요"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-lg font-semibold">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="공지사항 내용을 입력하세요"
            rows="6"
            required
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "공지사항 등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;
