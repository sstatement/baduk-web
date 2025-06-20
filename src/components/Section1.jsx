import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const Section1 = () => {
  const [user, setUser] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    const announcementsRef = collection(db, 'announcements');
    const unsubscribeAnnouncements = onSnapshot(announcementsRef, snapshot => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      await addDoc(collection(db, 'announcements'), {
        title: `공지사항 ${announcements.length + 1}`,
        content: announcement,
        postedBy: user.email,
        timestamp: new Date(),
      });
      setAnnouncement('');
    }
  };

  const handleClickAnnouncement = (id) => {
    navigate(`/announcements/${id}`);
  };

  const handleClickInfo = (id) => {
    navigate(`/announcements/${id}`);
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#fffaf4',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📢 공지사항</h2>

      {user && user.email.includes('@admin.com') && (
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="공지사항을 입력하세요"
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginBottom: '12px',
              resize: 'vertical',
            }}
          />
          <button
            onClick={handlePostAnnouncement}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            공지사항 올리기
          </button>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>📌 최근 공지사항</h3>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h4
                onClick={() => handleClickAnnouncement(announcement.id)}
                style={{
                  margin: '0 0 8px',
                  color: '#1d4ed8',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                {announcement.title}
              </h4>
              <div style={{ fontSize: '13px', color: '#555' }}>
                <span
                  onClick={() => handleClickInfo(announcement.id)}
                  style={{ marginRight: '10px', cursor: 'pointer', color: '#888' }}
                >
                  ✍ 작성자: {announcement.postedBy}
                </span>
                <span
                  onClick={() => handleClickInfo(announcement.id)}
                  style={{ cursor: 'pointer', color: '#888' }}
                >
                  📅{" "}
                  {announcement.timestamp && announcement.timestamp.seconds
                    ? new Date(announcement.timestamp.seconds * 1000).toLocaleString()
                    : "날짜 정보 없음"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#666' }}>공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Section1;
