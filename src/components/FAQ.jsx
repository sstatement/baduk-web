import React, { useState, useMemo, useRef, useEffect } from "react";

const faqData = [
  {
    question: "동아리 가입은 어떻게 하나요?",
    answer:
      "에브리타임에서 '복현기우회'를 검색해 연락하시거나, 가두모집 기간 동아리 부스로 방문하세요.",
    tag: "입문",
  },
  {
    question: "바둑 대회는 자주 열리나요?",
    answer:
      "연 2회 정기 대회를 열며, 시즌 이벤트/기념품/상금 등이 준비됩니다.",
    tag: "이벤트",
  },
  {
    question: "레이팅 리그전에 참여하려면 어떻게 해야 하나요?",
    answer:
      "구글 로그인 시 자동 등록됩니다. 대국 결과 입력 후 관리진이 승인하면 레이팅에 반영돼요.",
    tag: "리그",
  },
  {
    question: "회원비는 얼마인가요?",
    answer:
      "한 학기 20,000원이며, 강의/리그/대회/소모임 등 다양한 혜택을 이용할 수 있어요.",
    tag: "비용",
  },
  {
    question: "초보자도 참여할 수 있나요?",
    answer:
      "물론이죠! 멘토-멘티 프로그램으로 기초부터 차근차근 배울 수 있도록 도와드립니다.",
    tag: "초보환영",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // 각 항목의 콘텐츠 높이를 자동 측정해 자연스런 아코디언 애니메이션
  const contentRefs = useRef([]);
  const [heights, setHeights] = useState([]);

  useEffect(() => {
    setHeights(
      contentRefs.current.map((el) => (el ? el.scrollHeight : 0))
    );
  }, []);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
    // 열릴 때마다 새로 측정(동적 내용 변동 대응)
    requestAnimationFrame(() => {
      setHeights(
        contentRefs.current.map((el) => (el ? el.scrollHeight : 0))
      );
    });
  };

  return (
    <section style={styles.wrap} aria-label="자주 묻는 질문">
      {/* 컴포넌트 전용 CSS */}
      <style>{css}</style>

      {/* 배경 장식: 물음표 오브젝트 */}
      <div className="faq-bg" aria-hidden="true" />

      <h2 style={styles.title}>
        <span className="title-accent" aria-hidden="true">
          ?
        </span>
        자주 묻는 질문 (FAQ)
      </h2>

      <p style={styles.subtitle}>
        클릭하여 열어보세요. 힌트·키워드로 궁금증을 자극해 드립니다.
      </p>

      <ul style={styles.list}>
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <li key={index} style={styles.item}>
              {/* 상단 트리거 버튼 */}
              <button
                onClick={() => toggle(index)}
                className={`faq-trigger ${isOpen ? "open" : ""}`}
                aria-expanded={isOpen}
                aria-controls={`panel-${index}`}
              >
                <span className="chip" aria-label={`태그 ${item.tag}`}>
                  {item.tag}
                </span>

                <span className="qline">
                  <span className="qmark" aria-hidden="true">
                    ?
                  </span>
                  <span className="question">{item.question}</span>
                </span>

                <span
                  className="caret"
                  aria-hidden="true"
                  title={isOpen ? "접기" : "펼치기"}
                >
                  ▸
                </span>
              </button>

              {/* 호기심 유도 바(열릴 때 채워짐) */}
              <div
                className="curiosity-bar"
                style={{
                  transform: isOpen ? "scaleX(1)" : "scaleX(0)",
                  transitionDuration: reducedMotion ? "0ms" : "500ms",
                }}
                aria-hidden="true"
              />

              {/* 본문 패널 */}
              <div
                id={`panel-${index}`}
                className="faq-panel"
                style={{
                  maxHeight: isOpen ? heights[index] : 0,
                  transitionDuration: reducedMotion ? "0ms" : "400ms",
                }}
              >
                <div
                  ref={(el) => (contentRefs.current[index] = el)}
                  className="faq-content"
                >
                  <p className="answer">{item.answer}</p>

                  {/* 더 궁금해? 유도 푸터 */}
                  <div className="more">
                    <span className="hint-dot" aria-hidden="true">
                      ●
                    </span>
                    <span className="hint-text">
                      더 자세한 안내가 필요하신가요?{" "}
                      <a href="/intro" className="hint-link">
                        동아리 소개
                      </a>{" "}
                      또는{" "}
                      <a href="/contact" className="hint-link">
                        문의 페이지
                      </a>
                      로 이동하세요.
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ===== inline styles ===== */
const styles = {
  wrap: {
    position: "relative",
    maxWidth: 860,
    margin: "64px auto",
    padding: "28px 22px 32px",
    borderRadius: 16,
    background:
      "linear-gradient(180deg, rgba(250,250,255,.75), rgba(255,255,255,.92))",
    boxShadow:
      "0 30px 80px rgba(0,0,0,.10), 0 2px 0 rgba(255,255,255,.4) inset",
    border: "1px solid rgba(13, 17, 23, .08)",
    overflow: "hidden",
  },
  title: {
    fontSize: "28px",
    fontWeight: 900,
    letterSpacing: ".02em",
    margin: "0 0 6px",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  subtitle: {
    margin: "0 0 22px",
    color: "#475569",
    fontSize: 14,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 14,
  },
  item: {
    position: "relative",
  },
};

/* ===== component-scoped CSS ===== */
const css = `
:root{
  --ink:#0b0e14;
  --card:#ffffff;
  --edge:rgba(15, 23, 42, .08);
  --shadow:rgba(2, 8, 23, .08);
  --muted:#475569;
  --accent:#2563eb;       /* 파랑 포인트 */
  --jade:#10b981;         /* 호기심 바 색 */
  --gold:#d4af37;         /* 강조 금색 */
}

/* 배경 장식: 천천히 흐르는 물음표 */
.faq-bg{
  position:absolute; inset:-10% -2%;
  background:
    radial-gradient(600px 200px at 10% -20%, rgba(37,99,235,.12), transparent 60%),
    radial-gradient(600px 200px at 90% 120%, rgba(16,185,129,.12), transparent 60%);
  pointer-events:none;
  z-index:0;
}

/* 타이틀의 장식 물음표 */
.title-accent{
  display:inline-grid; place-items:center;
  width:28px; height:28px; border-radius:50%;
  background: linear-gradient(180deg, #0ea5e9, #2563eb);
  color:#fff; font-weight:800;
  box-shadow: 0 8px 20px rgba(37,99,235,.25);
}

/* 트리거 버튼 */
.faq-trigger{
  position:relative;
  width:100%;
  display:flex; align-items:center; gap:.75rem;
  border-radius:14px;
  padding:16px 14px 14px 14px;
  border:1px solid var(--edge);
  background: linear-gradient(180deg, #fff, #f8fafc);
  box-shadow: 0 10px 28px var(--shadow);
  transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease;
  cursor:pointer;
}
.faq-trigger:hover, .faq-trigger:focus{
  outline:none;
  transform: translateY(-1px);
  border-color: rgba(37,99,235,.25);
  box-shadow: 0 16px 40px rgba(2,8,23,.12);
}
.faq-trigger.open{
  border-color: rgba(16,185,129,.25);
}

/* 작은 태그 칩 */
.chip{
  display:inline-flex; align-items:center; justify-content:center;
  height:24px; padding:0 8px;
  font-size:12px; font-weight:700; letter-spacing:.02em;
  color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:999px;
  user-select:none;
}

/* 질문 라인 */
.qline{ display:flex; align-items:center; gap:.5rem; }
.qmark{
  display:inline-grid; place-items:center;
  width:24px; height:24px; border-radius:50%;
  background: #e0e7ff; color:#1e3a8a; font-weight:800;
}
.question{
  font-size:16px; font-weight:700; color:#0f172a;
}

/* 오픈/클로즈 캐럿 */
.caret{
  margin-left:auto; font-size:18px; line-height:1; color:#334155;
  transition: transform .25s ease;
}
.faq-trigger.open .caret{ transform: rotate(90deg); }

/* 호기심 바 */
.curiosity-bar{
  position:absolute; left:14px; right:14px; top:56px;
  height:3px; border-radius:9999px; transform-origin: left center;
  background: linear-gradient(90deg, var(--jade), #34d399);
  box-shadow: 0 0 12px rgba(16,185,129,.45);
  transition: transform .5s ease;
  pointer-events:none;
}

/* 패널 */
.faq-panel{
  overflow:hidden;
  will-change: max-height;
  transition: max-height .4s ease;
  border-radius: 0 0 14px 14px;
  border-left: 1px solid var(--edge);
  border-right: 1px solid var(--edge);
  border-bottom: 1px solid var(--edge);
  background: #ffffff;
  box-shadow: 0 12px 36px var(--shadow);
}
.faq-content{
  padding: 12px 16px 16px;
}
.answer{
  margin: 2px 0 8px;
  color: var(--muted);
  line-height: 1.7;
}

/* 푸터 힌트 */
.more{
  display:flex; align-items:center; gap:.5rem; margin-top:8px;
  border-top: 1px dashed rgba(15,23,42,.15);
  padding-top:10px;
}
.hint-dot{
  color:#d97706;
  filter: drop-shadow(0 0 6px rgba(245,158,11,.35));
}
.hint-text{ color:#374151; font-size:13px; }
.hint-link{
  color:#1d4ed8; text-decoration: underline dotted; text-underline-offset: 2px;
}
.hint-link:hover{ color:#0f172a; text-decoration-color: #0f172a; }

/* 모션 감소 케어 */
@media (prefers-reduced-motion: reduce){
  .faq-trigger{ transition: none; }
  .faq-panel{ transition: none; }
  .curiosity-bar{ transition: none; }
}
`;
