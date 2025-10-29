// AnnouncementDetail.jsx
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
    <div className="announcement-detail">
      <div className="announcement-detail__card">
        <div className="announcement-detail__head">
          <span className="announcement-detail__badge">📢</span>
          <div>
            <h1 className="announcement-detail__title">{announcement.title}</h1>
            <div className="announcement-detail__meta">
              작성일&nbsp;·&nbsp;
              <time>
                {announcement.createdAt
                  ? new Date(announcement.createdAt.seconds * 1000).toLocaleString()
                  : "날짜 정보 없음"}
              </time>
            </div>
          </div>
        </div>

        <div className="announcement-detail__divider" />

        <div className="announcement-detail__content">
          {announcement.content}
        </div>

        <div className="announcement-detail__actions">
          <button
            onClick={() => navigate(-1)}
            className="btn btn--ghost"
            type="button"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
