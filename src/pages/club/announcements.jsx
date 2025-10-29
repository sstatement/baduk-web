import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase"; // Firebase 설정 파일
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore"; // Firestore의 모듈화된 함수들
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Firebase 인증 상태 변경 리스너
import '../../App.css'; // App.css 파일 import

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);  // 어드민 여부 상태 추가
  const navigate = useNavigate();

  // 어드민 여부를 확인하는 함수
  const checkAdminStatus = async (userId) => {
    const userRef = doc(db, "users", userId);  // Firestore에서 'users' 컬렉션의 특정 사용자 문서 가져오기
    const docSnap = await getDoc(userRef); // 문서 스냅샷 가져오기

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.admin) { // Firestore에서 admin 필드로 어드민 여부 판단
        setIsAdmin(true);
      }
    }
  };

  // Firebase 인증 상태가 변경되면 호출
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await checkAdminStatus(user.uid);  // 사용자 ID로 어드민 여부 확인
      } else {
        setIsAdmin(false);  // 로그아웃 상태라면 어드민 권한을 false로 설정
      }
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const snapshot = await getDocs(collection(db, "announcements"));
        const announcementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("공지사항 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // 공지사항 삭제 함수
  const deleteAnnouncement = async (id) => {
    try {
      const announcementRef = doc(db, "announcements", id);
      await deleteDoc(announcementRef); // Firestore에서 해당 공지사항 삭제
      setAnnouncements(announcements.filter(announcement => announcement.id !== id)); // 로컬 상태에서 삭제
    } catch (error) {
      console.error("공지사항 삭제 오류:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-500">공지사항을 불러오는 중...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📢 공지사항</h1>
      
      {/* 어드민만 공지사항 작성 버튼을 볼 수 있도록 조건부 렌더링 */}
      {isAdmin && (
        <div className="text-center mb-6">
          <button
  onClick={() => navigate("/announcements/create")}
  className="create-announcement-btn"
>
  ✏️ 공지사항 작성하기
</button>

        </div>
      )}

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`announcement-card ${
                index % 2 === 0 ? "announcement-card-blue" : "announcement-card-green"
              }`}
              onClick={() => navigate(`/announcements/${announcement.id}`)}
            >
              <h2 className="text-xl font-semibold text-gray-800">{announcement.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                📅{" "}
                {announcement.createdAt
                  ? new Date(announcement.createdAt.seconds * 1000).toLocaleDateString()
                  : "날짜 정보 없음"}
              </p>
              
              {/* 어드민만 삭제 버튼을 볼 수 있도록 조건부 렌더링 */}
              {isAdmin && (
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="create-announcement-btn"
                >
                  삭제
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">등록된 공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
