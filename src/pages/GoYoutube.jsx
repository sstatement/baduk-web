// src/pages/GoYoutube.jsx
import React, { useMemo, useState } from "react";

// ─────────────────────────────────────────
//  스타일
// ─────────────────────────────────────────
const goYtCss = `
.go-yt-page{
  min-height:100vh;
  background:radial-gradient(circle at top,#020617 0,#020617 40%,#000 100%);
  padding:24px 12px;
  box-sizing:border-box;
  color:#e5e7eb;
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.go-yt-shell{
  max-width:1040px;
  margin:0 auto;
  background:rgba(15,23,42,.92);
  border-radius:24px;
  border:1px solid rgba(148,163,184,.5);
  box-shadow:0 24px 80px rgba(15,23,42,.9);
  padding:20px 20px 26px;
}
.go-yt-header{
  display:flex;
  justify-content:space-between;
  gap:16px;
  align-items:flex-start;
  margin-bottom:16px;
}
.go-yt-title{
  font-size:1.35rem;
  font-weight:700;
}
.go-yt-subtitle{
  font-size:.85rem;
  color:#9ca3af;
  margin-top:4px;
}
.go-yt-note{
  font-size:.75rem;
  color:#9ca3af;
}

/* 필터 */
.go-yt-filters{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin:12px 0;
}
.go-yt-chip{
  border-radius:999px;
  border:1px solid rgba(148,163,184,.7);
  background:rgba(15,23,42,.9);
  font-size:.75rem;
  padding:3px 9px;
  cursor:pointer;
  color:#e5e7eb;
}
.go-yt-chip--active{
  border-color:#22c55e;
  background:rgba(22,163,74,.18);
  color:#bbf7d0;
}
.go-yt-chip--ghost{
  border-style:dashed;
  opacity:.7;
}
.go-yt-search{
  margin-left:auto;
}
.go-yt-search input{
  border-radius:999px;
  border:1px solid rgba(148,163,184,.7);
  background:rgba(15,23,42,.95);
  padding:5px 10px;
  font-size:.8rem;
  color:#e5e7eb;
}

/* 카드 그리드 */
.go-yt-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
}
@media (max-width:960px){
  .go-yt-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:640px){
  .go-yt-header{ flex-direction:column; }
  .go-yt-shell{ padding:16px 14px 20px; }
  .go-yt-grid{ grid-template-columns:minmax(0,1fr); }
}
.go-yt-card{
  border-radius:16px;
  border:1px solid rgba(148,163,184,.6);
  background:radial-gradient(circle at top left,rgba(34,197,94,.13),transparent 55%),
             radial-gradient(circle at bottom right,rgba(59,130,246,.18),transparent 55%),
             rgba(15,23,42,.96);
  padding:10px 10px 9px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.go-yt-card-header{
  display:flex;
  gap:8px;
  align-items:center;
}
.go-yt-thumb{
  width:40px;
  height:40px;
  border-radius:999px;
  overflow:hidden;
  flex-shrink:0;
  border:1px solid rgba(148,163,184,.7);
}
.go-yt-thumb img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.go-yt-name{
  font-size:.9rem;
  font-weight:600;
}
.go-yt-meta{
  font-size:.7rem;
  color:#9ca3af;
}
.go-yt-desc{
  font-size:.75rem;
  color:#9ca3af;
}
.go-yt-link{
  margin-top:2px;
  font-size:.75rem;
}
.go-yt-link a{
  color:#a5b4fc;
  text-decoration:none;
}
.go-yt-link a:hover{ text-decoration:underline; }
`;

// ─────────────────────────────────────────
//  유튜버 목록 (가나다순)
// ─────────────────────────────────────────
const YOUTUBERS = [
  {
    id: "brainup",
    name: "브레인업바둑",
    language: "KR",
    url: "https://www.youtube.com/@BrainUpBaduk",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "proyeonwoo",
    name: "프로연우",
    language: "KR",
    url: "https://www.youtube.com/@proyeonwoo",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "baduk_tv",
    name: "바둑TV",
    language: "KR",
    url: "https://www.youtube.com/@baduk_tv",
    thumbnail: "",
    levels: ["입문", "초급", "중급", "고급"],
    topics: [],
    desc: "",
  },
  {
    id: "badukqueen",
    name: "바둑퀸",
    language: "KR",
    url: "https://www.youtube.com/@%EB%B0%94%EB%91%91%ED%80%B8",
    thumbnail: "",
    levels: ["입문", "초급"],
    topics: [],
    desc: "",
  },
  {
    id: "badukqueen-mid",
    name: "바둑퀸(초중급)",
    language: "KR",
    url: "https://www.youtube.com/@TV-pm1id",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "badukschool",
    name: "바둑사관학교",
    language: "KR",
    url: "https://www.youtube.com/@%EB%B0%94%EB%91%91%EC%82%AC%EA%B4%80%ED%95%99%EA%B5%90",
    thumbnail: "",
    levels: ["입문", "초급"],
    topics: [],
    desc: "",
  },
  {
    id: "TheMylove1244",
    name: "쉬운바둑",
    language: "KR",
    url: "https://www.youtube.com/@TheMylove1244",
    thumbnail: "",
    levels: ["입문", "초급"],
    topics: [],
    desc: "",
  },
  {
    id: "dongkyu",
    name: "동규의 바둑",
    language: "KR",
    url: "https://www.youtube.com/@%EB%8F%99%EA%B7%9C%EC%9D%98%EB%B0%94%EB%91%91",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "leehyunwook",
    name: "이현욱바둑TV",
    language: "KR",
    url: "https://www.youtube.com/@leehyunwooktv",
    thumbnail: "",
    levels: ["초급", "중급", "고급"],
    topics: [],
    desc: "",
  },
  {
    id: "ai-baduk",
    name: "인공지능바둑강좌",
    language: "KR",
    url: "https://www.youtube.com/@%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5%EB%B0%94%EB%91%91%EA%B0%95%EC%A2%8C",
    thumbnail: "",
    levels: ["초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "kimseongryong",
    name: "김성룡 바둑랩",
    language: "KR",
    url: "https://www.youtube.com/@%EA%B9%80%EC%84%B1%EB%A3%A1%EB%B0%94%EB%91%91%EB%9E%A9",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "93baduk",
    name: "93바둑",
    language: "KR",
    url: "https://www.youtube.com/@93baduk",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "kbaduk",
    name: "K바둑",
    language: "KR",
    url: "https://www.youtube.com/@kbaduktv",
    thumbnail: "",
    levels: ["입문", "초급", "중급", "고급"],
    topics: [],
    desc: "",
  },
  {
    id: "pension",
    name: "연금바둑 [with 바둑왕햄식이]",
    language: "KR",
    url: "https://www.youtube.com/@Baduk-pension",
    thumbnail: "",
    levels: ["입문", "초급"],
    topics: [],
    desc: "",
  },
  {
    id: "senabaduk",
    name: "세나랑바둑",
    language: "KR",
    url: "https://www.youtube.com/@senabaduk",
    thumbnail: "",
    levels: ["입문", "초급"],
    topics: [],
    desc: "",
  },
  {
    id: "wooju",
    name: "우주바둑",
    language: "KR",
    url: "https://www.youtube.com/@%EC%9A%B0%EC%A3%BC%EB%B0%94%EB%91%91",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
  {
    id: "baddalnam",
    name: "바알남[바둑알려주는남자]",
    language: "KR",
    url: "https://www.youtube.com/@%EB%B0%94%EB%91%91%EC%95%8C%EB%A0%A4%EC%A3%BC%EB%8A%94%EB%82%A8%EC%9E%90",
    thumbnail: "",
    levels: ["입문", "초급", "중급"],
    topics: [],
    desc: "",
  },
];

// ─────────────────────────────────────────
//  메인 컴포넌트
// ─────────────────────────────────────────
export default function GoYoutubePage() {
  const [langFilter, setLangFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredYoutubers = useMemo(() => {
    return YOUTUBERS.filter((yt) => {
      if (langFilter !== "ALL" && yt.language !== langFilter) return false;
      if (
        levelFilter !== "ALL" &&
        !yt.levels.some((lv) => lv === levelFilter)
      )
        return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const text = (yt.name + " " + yt.desc).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [langFilter, levelFilter, search]);

  return (
    <div className="go-yt-page">
      <style>{goYtCss}</style>

      <div className="go-yt-shell">
        <header className="go-yt-header">
          <div>
            <h1 className="go-yt-title">바둑 유튜버 정리</h1>
            <p className="go-yt-subtitle">
              한국 바둑 유튜버들을 한눈에 정리한 라이브러리 페이지입니다.
            </p>
          </div>
        </header>

        {/* 필터 UI */}
        <div className="go-yt-filters">
          {/* 언어 */}
          <button
            className={
              langFilter === "ALL"
                ? "go-yt-chip go-yt-chip--active"
                : "go-yt-chip"
            }
            onClick={() => setLangFilter("ALL")}
          >
            전체 언어
          </button>
          <button
            className={
              langFilter === "KR"
                ? "go-yt-chip go-yt-chip--active"
                : "go-yt-chip"
            }
            onClick={() => setLangFilter("KR")}
          >
            한국어
          </button>

          {/* 레벨 */}
          <button
            className={
              levelFilter === "ALL"
                ? "go-yt-chip go-yt-chip--active"
                : "go-yt-chip go-yt-chip--ghost"
            }
            onClick={() => setLevelFilter("ALL")}
          >
            전체 레벨
          </button>

          {["입문", "초급", "중급", "고급"].map((lv) => (
            <button
              key={lv}
              className={
                levelFilter === lv
                  ? "go-yt-chip go-yt-chip--active"
                  : "go-yt-chip"
              }
              onClick={() => setLevelFilter(lv)}
            >
              {lv}
            </button>
          ))}

          {/* 검색 */}
          <div className="go-yt-search">
            <input
              placeholder="채널 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 유튜버 리스트 */}
        <div className="go-yt-grid">
          {filteredYoutubers.map((yt) => {
            // 썸네일: 직접 지정한 thumbnail이 있으면 그걸 쓰고,
            // 없으면 public/yt-thumbs/{id}.jpg 시도
            const thumbnailSrc =
              yt.thumbnail && yt.thumbnail.length > 0
                ? yt.thumbnail
                : `/yt-thumbs/${yt.id}.jpg`;

            return (
              <article key={yt.id} className="go-yt-card">
                <div className="go-yt-card-header">
                  <div className="go-yt-thumb">
                    <img
                      src={thumbnailSrc}
                      alt={yt.name}
                      onError={(e) => {
                        // 이미지 로드 실패하면 'IMG' 텍스트로 대체
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#9ca3af;">IMG</div>';
                        }
                      }}
                    />
                  </div>
                  <div>
                    <div className="go-yt-name">{yt.name}</div>
                    <div className="go-yt-meta">
                      {yt.language === "KR" ? "한국어" : "기타"} ·{" "}
                      {yt.levels.join(", ")}
                    </div>
                  </div>
                </div>

                <p className="go-yt-desc">
                  {yt.desc && yt.desc.length > 0
                    ? yt.desc
                    : "설명이 아직 등록되지 않은 채널입니다."}
                </p>

                <p className="go-yt-link">
                  <a href={yt.url} target="_blank" rel="noreferrer">
                    채널 바로가기 ↗
                  </a>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
