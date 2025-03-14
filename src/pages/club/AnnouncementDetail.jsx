import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const docRef = doc(db, "announcements", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAnnouncement(docSnap.data());
        } else {
          console.error("해당 공지사항을 찾을 수 없습니다.");
          navigate("/announcements");
        }
      } catch (error) {
        console.error("공지사항 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id, navigate]);

  if (loading) return <p className="text-center text-gray-500">공지사항을 불러오는 중...</p>;
  if (!announcement) return <p className="text-center text-gray-500">공지사항이 존재하지 않습니다.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold">{announcement.title}</h1>
      <p className="text-gray-500 text-sm">
        작성일:{" "}
        {announcement.createdAt
          ? new Date(announcement.createdAt.seconds * 1000).toLocaleString()
          : "날짜 정보 없음"}
      </p>
      <hr className="my-4" />
      <p className="text-gray-800">{announcement.content}</p>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
