import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot } from "firebase/firestore"; // Firestore 관련 함수 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

const Section1 = () => {
  const [user, setUser] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate(); // navigate 훅 사용

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    // 공지사항 데이터 불러오기
    const announcementsRef = collection(db, 'announcements');
    const unsubscribeAnnouncements = onSnapshot(announcementsRef, snapshot => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // id 추가
    });

    return () => {
      unsubscribe();
      unsubscribeAnnouncements();
    };
  }, []);

  const handlePostAnnouncement = async () => {
    if (!user || !user.email.includes('@admin.com')) {
      alert("권한이 없습니다.");
      return;
    }

    if (announcement.trim()) {
      // Firestore에 공지사항 추가
      await addDoc(collection(db, 'announcements'), {
        title: `공지사항 ${announcements.length + 1}`, // 제목 추가
        content: announcement,
        postedBy: user.email,
        timestamp: new Date(),
      });
      setAnnouncement('');
    }
  };

  const handleClickAnnouncement = (id) => {
    navigate(`/announcements/${id}`); // 클릭 시 상세 페이지로 이동
  };

  const handleClickInfo = (id) => {
    navigate(`/announcements/${id}`); // 작성자나 날짜 클릭 시도 상세 페이지로 이동
  };

  return (
    <div>
      <h2>공지사항</h2>

      {user && user.email.includes('@admin.com') && (
        <div>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="공지사항을 입력하세요"
            rows="4"
            cols="50"
          />
          <button onClick={handlePostAnnouncement}>공지사항 올리기</button>
        </div>
      )}

      <div>
        <h3>최근 공지사항</h3>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              style={{ cursor: 'pointer', marginBottom: '10px' }}
            >
              <h4 onClick={() => handleClickAnnouncement(announcement.id)} style={{ display: 'inline-block', marginRight: '10px', color: 'blue' }}>
                {announcement.title}
              </h4>
              <small
                onClick={() => handleClickInfo(announcement.id)}
                style={{ cursor: 'pointer', marginRight: '10px', color: 'gray' }}
              >
                작성자: {announcement.postedBy}
              </small>
              <small
                onClick={() => handleClickInfo(announcement.id)}
                style={{ cursor: 'pointer', color: 'gray' }}
              >
                {announcement.timestamp && announcement.timestamp.seconds
                  ? new Date(announcement.timestamp.seconds * 1000).toLocaleString()
                  : "날짜 정보 없음"}
              </small>
            </div>
          ))
        ) : (
          <p>공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Section1;
