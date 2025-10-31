import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Img2 from "../images/바통 원츄.jpg";
import Img3 from "../images/바통이.jpg";
import Img4 from "../images/훈수 안돼요.jpg";

/**
 * 바둑 테마 슬라이더
 * - 고급 잉크 & 금박(골드) 포인트, 네온 제이드 발광
 * - Ken Burns(천천히 확대/이동) + 비네트 + 반투명 워시 카드
 * - 돌(흑/백) 모양 인디케이터
 * - 접근성: 키보드 좌우 이동, aria-live, prefers-reduced-motion 대응
 * - 호버/포커스 시 자동재생 일시정지, 수동 토글 버튼 제공
 */

const AdSlider = () => {
  const SLIDE_MS = 5000;

  const slides = useMemo(
    () => [
      {
        image: Img2,
        title: "회원 관리",
        description: "회원 관리 시스템에 대해 알아보세요.",
        link: "/club/members",
      },
      {
        image: Img3,
        title: "바둑 리그전",
        description: "리그전 시스템을 통해 대국 결과를 확인하세요.",
        link: "/league/ranking",
      },
      {
        image: Img4,
        title: "바둑 강의",
        description: "강의를 보고 기력 쑥쑥!",
        link: "/Lecture",
      },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef(null);

  const reducedMotion = useMemo(
    () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // 자동 슬라이드
  useEffect(() => {
    if (paused || hovering) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length, paused, hovering]);

  // 키보드 네비게이션
  useEffect(() => {
    const onKey = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.matches(":focus-within")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "960px",
        height: "420px",
        margin: "40px auto",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 16px 50px rgba(0,0,0,.35)",
        border: "1px solid rgba(212,175,55,.3)", // 금박 느낌
        outline: "none",
      }}
      aria-roledescription="carousel"
      aria-label="동아리 광고 슬라이더"
    >
      {/* 테마 CSS (컴포넌트 내부 적용) */}
      <style>{css}</style>

      {/* 배경 네온/비네트 */}
      <div className="ads-bg" aria-hidden="true" />

      {/* 슬라이드 이미지 */}
      <Link
        to={slides[currentIndex].link}
        className="slide-link"
        tabIndex={0}
        aria-live="polite"
        aria-label={`${currentIndex + 1} / ${slides.length} — ${slides[currentIndex].title}`}
      >
        <img
          src={slides[currentIndex].image}
          alt={slides[currentIndex].title}
          className={["slide-img", reducedMotion ? "no-anim" : "kenburns"].join(" ")}
        />
        {/* 어퍼 비네트 + 워시 카드 */}
        <div className="slide-vignette" aria-hidden="true" />
        <div className="slide-card" role="group" aria-label="슬라이드 설명">
          <h2 className="slide-title">{slides[currentIndex].title}</h2>
          <p className="slide-desc">{slides[currentIndex].description}</p>

          {/* 진행 바 */}
          <div className="progress-rail" aria-hidden="true">
            <div
              className="progress-bar"
              style={{
                animationPlayState: paused || hovering || reducedMotion ? "paused" : "running",
                animationDuration: `${SLIDE_MS}ms`,
                width: paused || hovering || reducedMotion ? "0%" : undefined,
              }}
            />
          </div>
        </div>
      </Link>

      {/* 이전/다음 버튼 */}
      <button
        className="nav-btn prev"
        onClick={prevSlide}
        aria-label="이전 슬라이드"
        title="이전"
      >
        ‹
      </button>
      <button
        className="nav-btn next"
        onClick={nextSlide}
        aria-label="다음 슬라이드"
        title="다음"
      >
        ›
      </button>

      {/* 재생/일시정지 토글 */}
      <button
        className="pause-btn"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "자동재생 재개" : "자동재생 일시정지"}
        title={paused ? "재생" : "일시정지"}
      >
        {paused ? (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* 인디케이터(바둑돌) */}
      <div className="indicators" role="tablist" aria-label="슬라이드 선택">
        {slides.map((_, index) => {
          const active = currentIndex === index;
          return (
            <button
              key={index}
              role="tab"
              aria-selected={active}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
              className={["dot", active ? "active" : ""].join(" ")}
              onClick={() => setCurrentIndex(index)}
              title={`${index + 1}/${slides.length}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdSlider;

/* ============== CSS ============== */
const css = `
:root{
  --ink:#0b0e14;
  --panel:#0e1119;
  --jade:#34d399;
  --jade-deep:#10b981;
  --gold:#d4af37;
  --gold-soft:rgba(212,175,55,.65);
  --wash:rgba(255,255,255,.06);
  --glass:rgba(14,17,25,.65);
  --border:rgba(255,255,255,.12);
  --muted:#cbd5e1;
}

/* 배경 네온 + 흐림 */
.ads-bg{
  position:absolute; inset:0;
  background:
    radial-gradient(800px 320px at 10% -10%, rgba(52,211,153,.25), transparent 60%),
    radial-gradient(800px 320px at 90% 110%, rgba(16,185,129,.18), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.35));
  filter: saturate(110%);
  z-index:0;
}

/* 링크 래퍼 */
.slide-link{
  position:absolute; inset:0;
  display:block;
  z-index:1;
  outline:none;
}

/* 이미지 */
.slide-img{
  position:absolute; inset:0;
  width:100%; height:100%;
  object-fit:contain;
  transform-origin: 50% 55%;
  will-change: transform, filter;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,.35));
}
.kenburns{
  animation: ken 12s ease-in-out infinite;
}
.no-anim{ animation: none !important; }
@keyframes ken{
  0%{ transform: scale(1) translate3d(0,0,0); }
  55%{ transform: scale(1.06) translate3d(1.2%, -0.6%, 0); }
  100%{ transform: scale(1) translate3d(0,0,0); }
}

/* 비네트 + 그라스 카드 */
.slide-vignette{
  position:absolute; inset:0;
  background:
    linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0) 38%),
    radial-gradient(80% 100% at 50% 100%, rgba(0,0,0,.65), transparent 60%);
  pointer-events:none;
}
.slide-card{
  position:absolute; left:18px; right:18px; bottom:16px;
  padding:14px 16px 12px;
  border-radius:14px;
  background: linear-gradient(180deg, rgba(14,17,25,.8), rgba(14,17,25,.55));
  border: 1px solid var(--border);
  box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04) inset;
  color:#f8fafc;
  backdrop-filter: blur(6px);
}
.slide-title{
  margin:0 0 6px 0;
  font-size:22px; font-weight:900; letter-spacing:.2px;
  text-shadow: 0 1px 0 rgba(0,0,0,.35);
  background: linear-gradient(90deg, var(--gold-soft), #fff);
  -webkit-background-clip: text; background-clip:text; color: transparent;
  filter: drop-shadow(0 0 6px rgba(212,175,55,.25));
}
.slide-desc{
  margin:0;
  font-size:15px; color: var(--muted);
}

/* 진행바 */
.progress-rail{
  position:relative; height:6px; margin-top:10px; border-radius:9999px;
  background: rgba(255,255,255,.08);
  overflow:hidden;
  border:1px solid rgba(255,255,255,.08);
}
.progress-bar{
  height:100%; width:0%;
  background: linear-gradient(90deg, var(--jade), var(--jade-deep));
  box-shadow: 0 0 14px rgba(16,185,129,.45);
  animation-name: grow;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes grow{
  0%{ width:0% }
  100%{ width:100% }
}

/* 네비 버튼 */
.nav-btn{
  position:absolute; top:50%; transform: translateY(-50%);
  z-index:2;
  width:44px; height:44px; border-radius:9999px;
  background: rgba(14,17,25,.7);
  color: #f1f5f9; border:1px solid rgba(255,255,255,.12);
  display:flex; align-items:center; justify-content:center;
  font-size:28px; line-height:1; cursor:pointer;
  box-shadow: 0 10px 28px rgba(0,0,0,.35);
  transition: transform .12s ease, background .2s ease, box-shadow .2s ease;
}
.nav-btn:hover, .nav-btn:focus{
  transform: translateY(-50%) scale(1.04);
  background: rgba(14,17,25,.9);
  outline:none;
  box-shadow: 0 16px 40px rgba(0,0,0,.45);
}
.prev{ left:14px; }
.next{ right:14px; }

/* 재생/일시정지 */
.pause-btn{
  position:absolute; top:12px; right:12px; z-index:2;
  display:inline-flex; align-items:center; justify-content:center;
  width:36px; height:36px; border-radius:10px;
  background: linear-gradient(180deg, rgba(14,17,25,.9), rgba(14,17,25,.7));
  color:#e5e7eb; border:1px solid rgba(255,255,255,.12);
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
  cursor:pointer;
}
.pause-btn:hover, .pause-btn:focus{
  outline:none;
  box-shadow: 0 14px 34px rgba(0,0,0,.45);
}

/* 인디케이터: 바둑돌 */
.indicators{
  position:absolute; bottom:14px; left:50%; transform: translateX(-50%);
  display:flex; gap:10px; z-index:2;
}
.dot{
  width:14px; height:14px; border-radius:9999px;
  border: 1px solid rgba(255,255,255,.25);
  background:
    radial-gradient(circle at 35% 35%, rgba(255,255,255,.85), rgba(255,255,255,.15) 40%, rgba(0,0,0,.15) 60%),
    #111;
  box-shadow: inset -3px -3px 6px rgba(0,0,0,.55), inset 3px 3px 6px rgba(255,255,255,.08),
              0 2px 6px rgba(0,0,0,.35);
  cursor:pointer; transition: transform .12s ease, box-shadow .2s ease;
}
.dot:hover, .dot:focus{
  transform: translateY(-1px) scale(1.06);
  box-shadow: inset -3px -3px 6px rgba(0,0,0,.55), inset 3px 3px 6px rgba(255,255,255,.12),
              0 6px 16px rgba(0,0,0,.45);
  outline:none;
}
.dot.active{
  border-color: var(--gold);
  box-shadow: 0 0 0 1px rgba(212,175,55,.35), 0 0 18px rgba(212,175,55,.35);
  background:
    radial-gradient(circle at 35% 35%, rgba(255,255,255,.92), rgba(255,255,255,.18) 45%, rgba(0,0,0,.12) 68%),
    #222;
}
`;
