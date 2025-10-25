import React, { useMemo } from "react";
import "../App.css"; // 기존 카드 스타일과 함께 동작 (충돌 방지를 위해 ob- 접두사 사용)

/**
 * 바둑의 이점을 '체감'하게 만드는 카드형 섹션
 * - 고급 잉크톤 + 금빛 포인트 + 은은한 그린(집중/안정) 그라데이션
 * - 카드 호버 시 살짝 상승 + 테두리 글로우
 * - 접근성: 대비 강화, aria-label/role, 키보드 포커스 링
 * - 모션 최소화: prefers-reduced-motion 대응
 */

const benefits = [
  { title: "집중력 향상", desc: "복잡한 국면을 읽는 과정에서 집중 유지 습관이 길러집니다." },
  { title: "전략적 사고", desc: "형세 판단·우선순위 설정·리스크 관리 등 전략적 결정을 연습합니다." },
  { title: "사회적 교류", desc: "대국/복기 과정에서 자연스러운 소통·피드백 경험이 생깁니다." },
  { title: "창의력 증진", desc: "정석 너머의 새로운 수읽기와 발상이 필요합니다." },
  { title: "자기개발", desc: "기록·복기·리뷰를 통해 개선 루프를 만드는 습관이 생깁니다." },
  { title: "지속 가능한 취미", desc: "연령·실력에 상관없이 오랜 기간 즐길 수 있는 두뇌 스포츠입니다." },
];

export default function OurBenefit() {
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <section
      aria-label="바둑의 이점"
      style={{
        position: "relative",
        maxWidth: 1100,
        margin: "70px auto",
        padding: "48px 22px 56px",
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(2,6,23,.85), rgba(2,6,23,.92))",
        boxShadow: "0 30px 80px rgba(0,0,0,.25)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.08)",
      }}
      role="region"
    >
      {/* 내부 전용 스타일 */}
      <style>{css}</style>

      {/* 배경 장식: 은은한 네온/먼지 효과 */}
      <div className="ob-bg" aria-hidden="true" />

      {/* 헤더 */}
      <header style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 className="ob-title">
          바둑을 통해 얻는 이점
        </h2>
        <p className="ob-sub">Our Benefits</p>
      </header>

      {/* 그리드 */}
      <div
        className="ob-grid"
        role="list"
        aria-label="이점 목록"
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          marginTop: 28,
        }}
      >
        {benefits.map((b, i) => (
          <article
            key={b.title}
            role="listitem"
            tabIndex={0}
            aria-label={`${i + 1}번 혜택, ${b.title}`}
            className={`ob-card ${reducedMotion ? "ob-card-nomotion" : ""}`}
          >
            {/* 넘버 뱃지 */}
            <div className="ob-badge" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </div>

            {/* 본문 */}
            <h3 className="ob-card-title">{b.title}</h3>
            <p className="ob-card-desc">{b.desc}</p>

            {/* 마이크로 카피: 왜 중요한가 */}
            <div className="ob-micro">
              <span className="ob-dot" aria-hidden="true">●</span>
              <span className="ob-micro-text">
                꾸준한 한 판 한 판이 일상 속 깊은 몰입 시간을 만들어 줍니다.
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* 하단 CTA(선택) */}
      <div
        style={{
          marginTop: 26,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a
          href="/intro"
          className="ob-cta"
          aria-label="동아리 소개로 이동"
          title="동아리 소개 보기"
        >
          더 알아보기
        </a>
      </div>
    </section>
  );
}

/* ===== Component-scoped CSS ===== */
const css = `
:root{
  --ink:#020617;         /* 잉크톤 배경 */
  --edge:rgba(255,255,255,.10);
  --muted:#cbd5e1;       /* 차분한 회색 텍스트 */
  --title:#e2e8f0;       /* 제목 톤 */
  --gold:#d4af37;        /* 금색 포인트 */
  --jade:#34d399;        /* 그린 포인트 */
  --cyan:#22d3ee;        /* 시원한 하이라이트 */
}

.ob-bg{
  position:absolute; inset:-10% -10%;
  background:
    radial-gradient(900px 360px at 15% -10%, rgba(34,211,238,.18), transparent 60%),
    radial-gradient(900px 360px at 90% 110%, rgba(52,211,153,.16), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
  filter:saturate(110%);
  pointer-events:none;
  z-index:0;
}

/* 헤더 */
.ob-title{
  margin:0;
  font-weight:900;
  letter-spacing:.02em;
  font-size: clamp(24px, 2.2vw, 34px);
  background: linear-gradient(90deg, #fff, var(--gold));
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  text-shadow: 0 0 18px rgba(212,175,55,.25);
}
.ob-sub{
  margin:6px 0 0;
  font-size: 14px;
  color: var(--muted);
  letter-spacing:.2em;
  text-transform: uppercase;
}

/* 카드 */
.ob-card{
  position:relative;
  padding:18px 16px 16px;
  border-radius:14px;
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  border:1px solid var(--edge);
  box-shadow:
    0 20px 60px rgba(0,0,0,.25),
    inset 0 0 0 1px rgba(255,255,255,.04);
  outline:none;
  transition: transform .14s ease, box-shadow .2s ease, border-color .2s ease;
}
.ob-card:hover, .ob-card:focus{
  transform: translateY(-3px);
  border-color: rgba(212,175,55,.35);
  box-shadow:
    0 26px 80px rgba(0,0,0,.3),
    0 0 0 1px rgba(212,175,55,.25) inset;
}
.ob-card-nomotion{ transition: none; }

/* 넘버 뱃지 */
.ob-badge{
  position:absolute; top:12px; right:12px;
  font-weight:800; font-variant-numeric: tabular-nums;
  font-size: 12px; letter-spacing:.08em;
  color:#0b0e14;
  background: linear-gradient(180deg, #fde68a, #f59e0b);
  border:1px solid rgba(0,0,0,.15);
  padding:4px 8px; border-radius:999px;
  box-shadow: 0 8px 18px rgba(245,158,11,.25);
}

/* 타이틀/설명 */
.ob-card-title{
  margin:2px 0 6px;
  font-size: 18px; font-weight:800; letter-spacing:.01em;
  color: #f1f5f9;
  text-shadow: 0 1px 0 rgba(0,0,0,.25);
}
.ob-card-desc{
  margin:0;
  font-size: 14px; line-height:1.65;
  color: var(--muted);
}

/* 마이크로카피 */
.ob-micro{
  display:flex; align-items:center; gap:.5rem;
  margin-top:12px;
  padding-top:10px;
  border-top:1px dashed rgba(255,255,255,.12);
}
.ob-dot{
  color: var(--cyan);
  filter: drop-shadow(0 0 8px rgba(34,211,238,.35));
  font-size: 10px;
  line-height: 1;
}
.ob-micro-text{
  color:#e2e8f0; font-size: 12.5px;
}

/* CTA */
.ob-cta{
  display:inline-flex; align-items:center; justify-content:center;
  padding:10px 18px; border-radius:10px;
  border:1px solid rgba(255,255,255,.14);
  background: linear-gradient(90deg, rgba(52,211,153,.18), rgba(34,211,238,.18));
  color:#f8fafc; font-weight:800; letter-spacing:.02em; text-decoration:none;
  box-shadow: 0 14px 36px rgba(16,185,129,.2);
  transition: transform .12s ease, box-shadow .2s ease, filter .2s ease;
}
.ob-cta:hover, .ob-cta:focus{
  outline:none;
  transform: translateY(-1px);
  box-shadow: 0 18px 46px rgba(34,211,238,.28);
  filter: saturate(115%);
}

/* 반응형 */
@media (max-width: 980px){
  .ob-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
}
@media (max-width: 640px){
  .ob-grid{ grid-template-columns: 1fr !important; }
}
`;
