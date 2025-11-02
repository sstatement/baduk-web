import React, { useMemo, useState } from "react";
import { Search, ExternalLink, Bookmark, Layers } from "lucide-react";
import "./tsumego.css";

/** 사활(詰碁) 추천 페이지 — CSS 버전
 * - 클릭형 카드(하이퍼링크 스타일 제거)
 * - 레벨별 세련된 탭 + 레벨 배너(범위/권수)
 * - 카드형 그리드(그라데이션 보더, 호버 리프트)
 * - 색상/그라데이션/배지/포커스링은 CSS 변수로 제어 (data-level)
 */

// 난이도 문자열 → 정렬용 스코어
function difficultyToScore(d) {
  if (!d) return 0;
  const s = String(d).trim().toUpperCase();
  const plus = s.endsWith("+") ? 0.2 : 0;
  if (s.includes("D")) {
    const n = parseInt(s, 10);
    return 20 + (isNaN(n) ? 0 : n) + plus; // 1D≈21
  }
  if (s.includes("K")) {
    const n = parseInt(s, 10);
    return 31 - (isNaN(n) ? 0 : n) + plus; // 15K≈16, 1K≈30
  }
  return 0;
}

// 레벨 라벨/범위(색상은 CSS에서 data-level로 결정)
const LEVELS = [
  { key: "beginner", label: "입문", range: "15K ~ 10K+" },
  { key: "basic", label: "초급", range: "9K ~ 6K+" },
  { key: "intermediate", label: "중급", range: "6K ~ 1K+" },
  { key: "advanced", label: "고급", range: "1D ~ 3D+" },
  { key: "pro", label: "상급(연구생)", range: "4D ~ 7D" },
];

// 데이터
const RAW = {
  beginner: [
    { title: "바둑사활입문", diff: "12K+", url: "https://www.101weiqi.com/book/1054/" },
    { title: "초보자를 위한 가이드: 삶과 죽음", diff: "11K+", url: "https://www.101weiqi.com/book/chujisihuo/" },
  ],
  basic: [
    { title: "育苗工程手筋300题", diff: "9K+", url: "https://www.101weiqi.com/book/117/" },
    { title: "もっとひと目の詰碁", diff: "9K+", url: "https://www.101weiqi.com/book/29591/" },
    { title: "围棋快速练习800题", diff: "8K+", url: "https://www.101weiqi.com/book/800ti/" },
    { title: "ひと目の詰碁 レベルアップ編", diff: "7K+", url: "https://www.101weiqi.com/book/29616/" },
    { title: "基礎が身につくコンパクト詰碁180", diff: "7K", url: "https://www.101weiqi.com/book/28294/" },
    { title: "筋が良くなる基礎詰碁200", diff: "6K", url: "https://www.101weiqi.com/book/31528/" },
    { title: "中级班练习题", diff: "6K", url: "https://www.101weiqi.com/book/zhongjiban/" },
    { title: "基礎力のつく死活", diff: "6K+", url: "https://www.101weiqi.com/book/30412/" },
    { title: "真珠诘棋", diff: "6K+", url: "https://www.101weiqi.com/book/27534/" },
  ],
  intermediate: [
    { title: "이창호 정강위기수근", diff: "5K", url: "https://www.101weiqi.com/book/lichanhaoshoujin/" },
    { title: "이창호 정강위기사활", diff: "4K+", url: "https://www.101weiqi.com/book/446/" },
    { title: "死活训练初级篇", diff: "3K", url: "https://www.101weiqi.com/book/1356/" },
    { title: "濑越宪作妙手筋", diff: "3K+", url: "https://www.101weiqi.com/book/206/" },
    { title: "조치훈 사활사전", diff: "3K+", url: "https://www.101weiqi.com/book/346/" },
    { title: "첸시 - C哥鋒哥 힐기집 (15급~7단)", diff: "3K", url: "https://www.101weiqi.com/book/36030/" },
    { title: "조치훈 - 끝내기의 수근", diff: "2K+", url: "https://www.101weiqi.com/book/314/" },
    { title: "하시모토 우타로 - 끝내기의 기교", diff: "1K+", url: "https://www.101weiqi.com/book/312/" },
    { title: "围棋手筋辞典 (세고에/오청원)", diff: "1K", url: "https://www.101weiqi.com/book/shoujinchidian/" },
    { title: "세고에 겐사쿠 사활사전", diff: "1K+", url: "https://www.101weiqi.com/book/1/" },
    { title: "詰棋之神 前田陈尔", diff: "1K", url: "https://www.101weiqi.com/book/28513/" },
  ],
  advanced: [
    { title: "하시모토 우타로 - 풍각", diff: "1D", url: "https://www.101weiqi.com/book/28486/" },
    { title: "하시모토 우타로 해설 - 현현기경", diff: "1D", url: "https://www.101weiqi.com/book/xuanxuanqijin/" },
    { title: "오청원 해설 - 관자보", diff: "1D+", url: "https://www.101weiqi.com/book/6/" },
    { title: "마에다 노부아키 - 통쾌힐기 걸작선", diff: "1D+", url: "https://www.101weiqi.com/book/28511/" },
    { title: "후지사와 슈코 - 걸작집", diff: "1D+", url: "https://www.101weiqi.com/book/28495/" },
    { title: "사카다 - 끝내기의 수근", diff: "1D", url: "https://www.101weiqi.com/book/894/" },
    { title: "오청원 - 자강불식", diff: "2D", url: "https://www.101weiqi.com/book/1223/" },
    { title: "오청원 - 수석불로", diff: "2D+", url: "https://www.101weiqi.com/book/1222/" },
    { title: "오청원 해설 - 현현기경", diff: "2D", url: "https://www.101weiqi.com/book/25205/" },
    { title: "카다 카츠지 - 중묘힐기", diff: "2D+", url: "https://www.101weiqi.com/book/28480/" },
    { title: "카다 카츠지 - 걸작힐기", diff: "2D+", url: "https://www.101weiqi.com/book/28514/" },
    { title: "혼인보 슈사이 - 사활묘기", diff: "3D", url: "https://www.101weiqi.com/book/166/" },
    { title: "사카다 에이오 - 주옥힐기", diff: "3D+", url: "https://www.101weiqi.com/book/1045/" },
    { title: "아카보시 인테츠 - 현람", diff: "3D+", url: "https://www.101weiqi.com/book/chixin/" },
  ],
  pro: [
    { title: "권갑룡 - 천룡도", diff: "4D", url: "https://www.101weiqi.com/book/tianlongtu/" },
    { title: "권갑룡 - 신천룡도", diff: "4D", url: "https://www.101weiqi.com/book/1364/" },
    { title: "권오민 - 신기묘수", diff: "4D+", url: "https://www.101weiqi.com/book/3797/" },
    { title: "권갑룡 - 견디는 수읽기", diff: "5D", url: "https://www.101weiqi.com/book/rennai/" },
    { title: "권갑룡 - 귀수마수", diff: "5D", url: "https://www.101weiqi.com/book/guishoumoshou/" },
    { title: "이노우에 인세키 - 발양론", diff: "5D", url: "https://www.101weiqi.com/book/fayang/" },
    { title: "김지석 - Secret", diff: "6D", url: "https://www.101weiqi.com/book/4702/" },
    { title: "장치룬 - 도룡결", diff: "6D+", url: "https://www.101weiqi.com/book/4549/" },
    { title: "첸시 - C哥鋒哥 창작사활", diff: "3D+~7D", url: "https://www.101weiqi.com/book/35622/" },
  ],
};

function useBooks(levelKey, query, sortDir) {
  return useMemo(() => {
    const list = (RAW[levelKey] || []).slice();
    const filtered = query
      ? list.filter((b) =>
          [b.title, b.diff].some((t) => String(t).toLowerCase().includes(query.toLowerCase()))
        )
      : list;
    filtered.sort((a, b) => {
      const da = difficultyToScore(a.diff);
      const db = difficultyToScore(b.diff);
      return sortDir === "asc" ? da - db : db - da;
    });
    return filtered;
  }, [levelKey, query, sortDir]);
}

function LevelTabs({ value, onChange }) {
  return (
    <div className="level-tabs">
      <div className="level-tabs__bar">
        {LEVELS.map((lv) => {
          const isActive = value === lv.key;
          return (
            <button
              key={lv.key}
              className={`level-btn ${isActive ? "is-active" : ""}`}
              onClick={() => onChange(lv.key)}
              data-k={lv.key}
              type="button"
            >
              <span className="level-btn__dot" />
              <span className="level-btn__label">{lv.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LevelBanner({ levelKey, count }) {
  const meta = LEVELS.find((l) => l.key === levelKey) || LEVELS[0];
  return (
    <div className="level-banner">
      <div className="level-banner__head">
        <div className="level-banner__left">
          <Layers size={16} />
          <span className="level-banner__title">{meta.label}</span>
          <span className="level-banner__range">· {meta.range}</span>
        </div>
        <span className="level-banner__count">총 {count}권</span>
      </div>
      <div className="level-banner__body">
        난이도 범위에 맞는 추천 사활집을 카드로 정리했습니다. 카드를 클릭하면 새 탭에서 열립니다.
      </div>
    </div>
  );
}

function openExternal(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function BookCard({ title, diff, url }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openExternal(url);
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openExternal(url)}
      onKeyDown={handleKey}
      className="book-frame"
      title={title}
    >
      <div className="book-card">
        <div className="book-card__top">
          <h3 className="book-card__title">{title}</h3>
          <ExternalLink size={16} className="book-card__ext" />
        </div>

        <div className="book-card__desc">101weiqi 링크 · 클릭하여 이동</div>

        <div className="book-card__meta">
          <span className="badge">
            <Bookmark size={12} /> 난이도: {diff}
          </span>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ query, setQuery, sortDir, setSortDir, count }) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <Search size={16} className="toolbar__searchIcon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목/난이도로 검색…"
          className="toolbar__input"
        />
      </div>
      <div className="toolbar__right">
        <label className="toolbar__label">정렬</label>
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          className="toolbar__select"
        >
          <option value="asc">난이도 오름차순</option>
          <option value="desc">난이도 내림차순</option>
        </select>
        <div className="toolbar__count">
          총 <b>{count}</b>권
        </div>
      </div>
    </div>
  );
}

export default function TsumegoPage() {
  const [level, setLevel] = useState("beginner");
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const books = useBooks(level, query, sortDir);

  return (
    <main className="tsumego" data-level={level}>
      <header className="page-head">
        <h1 className="page-title">사활(詰碁) 라이브러리</h1>
        <p className="page-sub">
          복현기우회 레벨 가이드(입문 15K~10K+ / 초급 9K~6K+ / 중급 6K~1K+ / 고급 1D~3D+ / 상급 4D~7D)에 맞춘 추천 목록입니다.
        </p>
      </header>

      <section className="sticky-head">
        <LevelTabs value={level} onChange={setLevel} />
        <Toolbar
          query={query}
          setQuery={setQuery}
          sortDir={sortDir}
          setSortDir={setSortDir}
          count={books.length}
        />
      </section>

      <LevelBanner levelKey={level} count={books.length} />

      <section className="cards-grid">
        {books.map((b) => (
          <BookCard key={`${b.title}-${b.url}`} {...b} />
        ))}
      </section>

      <footer className="page-foot">
        ※ 난이도 표기는 원전 표기(예: 6K+, 1D+)를 따르며, 페이지 내 정렬은 내부 스코어 매핑으로 처리됩니다.
      </footer>
    </main>
  );
}
