import { Link } from 'react-router-dom';
import { useState } from 'react';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
    padding: '24px',
    fontFamily: 'sans-serif',
  },
  container: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '32px',
    textAlign: 'center',
  },
  list: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    listStyle: 'none',
    padding: 0,
  },
  link: {
    display: 'block',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    backgroundColor: '#ffffff',
    padding: '24px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
  },
  linkHover: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
  itemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    color: '#10b981',
    fontSize: '1.25rem',
  },
  label: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
  },
};

const LectureIntro = () => {
  const lectures = [
    { path: '/lecture/입문', label: '입문자 강의' },
    { path: '/lecture/용어', label: '용어 강의' },
    { path: '/lecture/행마', label: '행마와 맥 강의' },
    { path: '/lecture/정석', label: '정석 강의' },
    { path: '/lecture/사활', label: '사활 강의' },
    { path: '/lecture/끝내기', label: '끝내기 강의' }
  ];

  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>📚 강의 목록</h1>
        <ul style={styles.list}>
          {lectures.map((lecture, index) => (
            <li key={lecture.path}>
              <Link
                to={lecture.path}
                style={{
                  ...styles.link,
                  ...(hovered === index ? styles.linkHover : {}),
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={styles.itemContent}>
                  <span style={styles.icon}>✅</span>
                  <span style={styles.label}>{lecture.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LectureIntro;
