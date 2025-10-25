import { Link } from 'react-router-dom';
import { useState } from 'react';

const elegantCss = `
/* ===== Intro (Intellectual & Classic) ===== */
:root{
  --ink:#0f172a; --muted:#475569; --paper:#fbf8f1; --edge:#efe7d6;
  --line:#c9c1a7; --accent:#7c6a46; --focus:#155eef; --gold:#b8892a; --gold-2:#8b6a1a;
}
@media (prefers-color-scheme: dark){
  :root{ --ink:#e5e7eb; --muted:#9aa4b2; --paper:#0f1115; --edge:#0b0d10; --line:#4b4b4b; --accent:#b9a679; }
}
@media (prefers-reduced-motion: reduce){
  .intro-*{ animation:none !important; transition:none !important; }
}

/* 배경 패널 */
.intro-page{
  min-height:100vh;
  padding:24px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.35)),
    radial-gradient(1200px 600px at 10% -10%, rgba(0,0,0,.04), transparent 60%),
    radial-gradient(800px 400px at 90% 110%, rgba(0,0,0,.05), transparent 60%),
    var(--paper);
  color:var(--ink);
  font-family: 'Noto Sans KR', system-ui, -apple-system, Segoe UI, Roboto, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}
.intro-container{
  max-width: 900px; margin: 0 auto;
  background: transparent;
  position: relative;
  padding: 12px 0 24px;
}
.intro-frame{
  border: 1.5px solid rgba(0,0,0,.14);
  box-shadow: 0 0 0 8px var(--edge) inset, 0 16px 36px rgba(0,0,0,.09);
  border-radius: 16px;
  padding: 28px 20px 32px;
}

/* 상하 장식선 */
.intro-frame::before, .intro-frame::after{
  content:""; position:absolute; left:6%; right:6%; height:2px; border-radius:2px; opacity:.9;
  background: linear-gradient(90deg, transparent 0 4%, var(--line) 4% 96%, transparent 96% 100%);
}
.intro-frame::before{ top: 18px; }
.intro-frame::after { bottom: 18px; }

.intro-title{
  font-weight:900; text-align:center; margin: 8px 0 28px;
  color:var(--ink); letter-spacing:.4px;
  display:flex; flex-direction:column; align-items:center;
  font-size: clamp(28px, 3.4vw, 38px);
}
.intro-title::after{
  content:""; display:block; margin-top:12px; height:2px; width: min(520px, 86%);
  background: linear-gradient(90deg, transparent 0%, var(--line) 12%, var(--line) 88%, transparent 100%);
  border-radius:2px; transform-origin:center left;
  animation: introLine .6s ease-out .1s both;
}
@keyframes introLine{ from{transform:scaleX(0); opacity:.2} to{transform:scaleX(1); opacity:.9} }

/* 목록 그리드 */
.intro-list{
  list-style:none; padding:0; margin:0;
  display:grid; gap:24px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* 카드(고서 장정 느낌) */
.intro-card{
  position:relative; display:block; text-decoration:none; color:inherit;
  background:#fff; border-radius:14px;
  border:1px solid #e6decc;
  box-shadow: 0 3px 8px rgba(0,0,0,.06);
  padding:22px 22px 22px 26px;
  transition: transform .15s ease, box-shadow .15s ease, background-color .2s ease, border-color .2s ease;
  background-image:
    linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,.3));
}
.intro-card::before{
  /* 금빛 가장자리 */
  content:""; position:absolute; inset:-1px; border-radius:14px;
  background: linear-gradient(180deg, rgba(184,137,42,.22), rgba(184,137,42,.06));
  pointer-events:none; opacity:.0; transition: opacity .15s ease;
}
.intro-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,.12);
  background-color:#fffef7; border-color:#e9e0c9;
}
.intro-card:hover::before{ opacity:1; }

/* 챕터 넘버 */
.intro-no{
  flex:0 0 auto;
  display:inline-flex; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:10px;
  font-weight:900; font-size:14px; letter-spacing:.4px;
  border:1px solid #d7cfb6; color:#7a5a12;
  background: linear-gradient(180deg, #fff6cf, #ffe8a0);
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 2px 8px rgba(184,137,42,.15);
  margin-right: 12px;
}

/* 본문(라벨) */
.intro-label{
  font-size: 1.15rem; font-weight: 800; color: var(--ink);
  display:flex; align-items:center; gap:10px;
}
.intro-sub{
  font-size:.9rem; color:var(--muted); margin-top:4px;
}

/* 아이콘(깃펜/책 느낌 대체) */
.intro-ico{
  font-size:1.1rem; color: var(--accent);
}

/* 카드 내부 정렬 */
.intro-item{
  display:flex; align-items:center; gap:12px;
}

/* 포커스 접근성 */
.intro-card:focus-visible{
  outline: 3px solid var(--focus);
  outline-offset: 3px; border-radius: 16px;
}
`;

const styles = {
  page: { }, // 클래스에서 처리
  container: { }, // 클래스에서 처리
  title: { }, // 클래스에서 처리
};

const LectureIntro = () => {
  const lectures = [
    { path: '/lecture/입문', label: '입문자 강의', sub: '바둑의 알파부터 대국 예절까지' },
    { path: '/lecture/용어', label: '용어 강의', sub: '수읽기, 맥점, 포석… 핵심 어휘' },
    { path: '/lecture/행마', label: '행마와 맥 강의', sub: '돌의 올바른 걸음과 맥의 미학' },
    { path: '/lecture/정석', label: '정석 강의', sub: '고전과 현대 정석의 해설' },
    { path: '/lecture/사활', label: '사활 강의', sub: '집과 생사의 경계 읽기' },
    { path: '/lecture/끝내기', label: '끝내기 강의', sub: '마지막 한 집까지 계산' },
    { path: '/lecture/격언', label: '격언 강의', sub: '격언으로 읽는 최선의 수' },
  ];

  const [hovered, setHovered] = useState(null);

  return (
    <div className="intro-page" style={styles.page}>
      <style>{elegantCss}</style>
      <div className="intro-container">
        <div className="intro-frame">
          <h1 className="intro-title">📚 강의 목록</h1>
          <ul className="intro-list">
            {lectures.map((lecture, index) => (
              <li key={lecture.path} className="intro-*">
                <Link
                  to={lecture.path}
                  className="intro-card"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={`${lecture.label}로 이동`}
                >
                  <div className="intro-item">
                    <span className="intro-no">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="intro-label">
                        <span className="intro-ico">✒️</span>
                        {lecture.label}
                      </div>
                      <div className="intro-sub">{lecture.sub}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LectureIntro;
