import React, { useMemo, useState } from "react";

const boardCss = `
.joseki-page{
  min-height:100vh;
  background:radial-gradient(circle at top,#020617 0,#020617 40%,#000 100%);
  padding:24px 12px;
  box-sizing:border-box;
  color:#e5e7eb;
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.joseki-shell{
  max-width:1040px;
  margin:0 auto;
  background:rgba(15,23,42,.95);
  border-radius:24px;
  border:1px solid rgba(148,163,184,.5);
  box-shadow:0 24px 80px rgba(15,23,42,.9);
  padding:18px 18px 22px;
}
.joseki-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:16px;
  margin-bottom:14px;
}
.joseki-title{
  font-size:1.3rem;
  font-weight:700;
}
.joseki-subtitle{
  font-size:.85rem;
  color:#9ca3af;
  margin-top:4px;
}
.joseki-note{
  font-size:.75rem;
  color:#9ca3af;
}

/* 메인 레이아웃: 좌측 바둑판 / 우측 추천 */
.joseki-main{
  display:grid;
  grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);
  gap:18px;
}
@media (max-width:900px){
  .joseki-main{
    grid-template-columns:minmax(0,1fr);
  }
}

/* 바둑판 */
.board-wrapper{
  background:radial-gradient(circle at top,rgba(251,191,36,.18),rgba(15,23,42,1));
  border-radius:18px;
  padding:12px;
  border:1px solid rgba(148,163,184,.6);
}
.board-toolbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:8px;
  font-size:.8rem;
  color:#9ca3af;
}
.board-toolbar button{
  border-radius:999px;
  border:1px solid rgba(148,163,184,.7);
  background:rgba(15,23,42,.9);
  font-size:.75rem;
  padding:3px 10px;
  cursor:pointer;
  color:#e5e7eb;
}
.board-toolbar button:hover{
  border-color:#38bdf8;
}

.board{
  position:relative;
  width:100%;
  aspect-ratio:1 / 1;
  background:#d8a860;
  border-radius:12px;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.35);
  padding:10px;
  box-sizing:border-box;
}

/* 격자선: background-gradient로 깔끔하게 */
.board-lines{
  position:absolute;
  inset:10px;
  background:
    repeating-linear-gradient(
      to right,
      rgba(0,0,0,.7) 0 1px,
      transparent 1px calc((100% - 1px) / 18)
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,.7) 0 1px,
      transparent 1px calc((100% - 1px) / 18)
    );
}

/* 클릭 가능한 교차점 레이어 */
.board-grid{
  position:absolute;
  inset:10px;
  display:grid;
  grid-template-columns:repeat(19,1fr);
  grid-template-rows:repeat(19,1fr);
}
.board-cell{
  position:relative;
  cursor:pointer;
}

/* 화점(별점) */
.board-star{
  position:absolute;
  inset:50%;
  width:6px;
  height:6px;
  border-radius:999px;
  background:rgba(15,23,42,.9);
  transform:translate(-50%,-50%);
}

/* 돌 */
.stone{
  position:absolute;
  inset:50%;
  width:80%;
  height:80%;
  transform:translate(-50%,-50%);
  border-radius:999px;
  box-shadow:0 2px 4px rgba(0,0,0,.6);
}
.stone--black{
  background:radial-gradient(circle at 30% 30%,#4b5563,#020617);
}
.stone--white{
  background:radial-gradient(circle at 30% 30%,#f9fafb,#d1d5db);
}
.stone--last{
  box-shadow:0 0 0 2px #22c55e,0 0 10px rgba(34,197,94,.9);
}

/* 추천 패널 */
.reco-panel{
  border-radius:18px;
  border:1px solid rgba(148,163,184,.6);
  background:radial-gradient(circle at top left,rgba(56,189,248,.16),transparent 60%),
             radial-gradient(circle at bottom right,rgba(34,197,94,.18),transparent 60%),
             rgba(15,23,42,.98);
  padding:10px 12px 11px;
}
.reco-title{
  font-size:.95rem;
  font-weight:600;
  margin-bottom:4px;
}
.reco-topic{
  font-size:.8rem;
  color:#a5b4fc;
  margin-bottom:6px;
}
.reco-empty{
  font-size:.8rem;
  color:#9ca3af;
}
.reco-badge-row{
  display:flex;
  gap:6px;
  margin-bottom:6px;
  flex-wrap:wrap;
}
.reco-badge{
  font-size:.7rem;
  padding:2px 7px;
  border-radius:999px;
  border:1px solid rgba(148,163,184,.7);
}
.reco-badge--key{
  border-color:#22c55e;
}
.reco-badge--pos{
  border-color:#f97316;
}
.reco-list{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.reco-item{
  font-size:.8rem;
}
.reco-link{
  color:#bfdbfe;
  text-decoration:none;
}
.reco-link:hover{
  text-decoration:underline;
}
.reco-meta{
  font-size:.72rem;
  color:#9ca3af;
  margin-left:4px;
}
.reco-hint{
  font-size:.74rem;
  color:#9ca3af;
  margin-top:6px;
}
`;

const BOARD_SIZE = 19;

// 추천 주제 데이터
const JOSEKI_TOPICS = {
  "3-3": {
    key: "3-3 침입 정석",
    posLabel: "코너 3-3 위치",
    description:
      "화점/소목이 놓인 코너에 3-3 침입이 들어왔을 때 나오는 기본 정석 패턴들.",
    videos: [
      {
        title: "예시) 3-3 침입 기본형 정리",
        channel: "인공지능바둑강좌",
        level: "초급~중급",
        url: "https://www.youtube.com/",
      },
    ],
  },
  hoshi: {
    key: "화점(4-4) 정석",
    posLabel: "코너 화점 주변",
    description:
      "4-4 화점에서 나오는 걸침, 협공, 삼삼 침입까지 이어지는 대표적인 정석들.",
    videos: [
      {
        title: "예시) 화점 정석 필수 패턴",
        channel: "김성룡 바둑랩",
        level: "초급~중급",
        url: "https://www.youtube.com/",
      },
    ],
  },
  komoku: {
    key: "소목(3-4) 정석",
    posLabel: "코너 소목 주변",
    description:
      "3-4 소목에서 붙임, 날일자 굳힘, 협공 등 소목 특유의 진행을 다루는 정석.",
    videos: [
      {
        title: "예시) 소목 정석 쉽게 이해하기",
        channel: "쉬운바둑",
        level: "입문~초급",
        url: "https://www.youtube.com/",
      },
    ],
  },
  corner: {
    key: "코너 기본 운영",
    posLabel: "코너 근처",
    description:
      "정석 이후의 벌림, 굳힘, 갈라침 등 코너에서 자주 나오는 모양 위주의 강의.",
    videos: [
      {
        title: "예시) 코너 정석 이후 실전 감각",
        channel: "바알남[바둑알려주는남자]",
        level: "초급",
        url: "https://www.youtube.com/",
      },
    ],
  },
  fuseki: {
    key: "포석 / 중앙 운영",
    posLabel: "변·중앙 부근",
    description:
      "코너를 정리한 뒤 세력과 실리의 균형, 변과 중앙에서의 포석 방향성을 다룸.",
    videos: [
      {
        title: "예시) 포석 감각 키우기",
        channel: "이현욱바둑TV",
        level: "중급",
        url: "https://www.youtube.com/",
      },
    ],
  },
};

// (x,y) -> 코너 기준으로 대칭 좌표(0쪽으로 모으기)
function toCornerCoord(x, y) {
  const max = BOARD_SIZE - 1;
  const cx = x <= max / 2 ? x : max - x;
  const cy = y <= max / 2 ? y : max - y;
  return { cx, cy };
}

// (0-based) 좌표로 정석 주제 판별
function detectJosekiTopic(lastMove) {
  if (!lastMove) return null;
  const { x, y } = lastMove;
  const { cx, cy } = toCornerCoord(x, y);

  // 3-3: (3,3) in 1-based -> (2,2) in 0-based
  if (cx === 2 && cy === 2) return "3-3";

  // 화점(4-4): (4,4) -> (3,3)
  if (cx === 3 && cy === 3) return "hoshi";

  // 소목: (3,4) / (4,3) -> (2,3) or (3,2)
  if ((cx === 2 && cy === 3) || (cx === 3 && cy === 2)) return "komoku";

  // 코너 근처 (모서리에서 3선까지)
  const edgeDist = Math.min(cx, cy);
  if (edgeDist <= 3) return "corner";

  // 나머지는 포석/중앙
  return "fuseki";
}

// 호시(별점) 좌표 (0-based)
const STAR_POINTS = [
  [3, 3],   // 4,4
  [3, 9],   // 4,10
  [3, 15],  // 4,16
  [9, 3],   // 10,4
  [9, 9],   // 10,10
  [9, 15],  // 10,16
  [15, 3],  // 16,4
  [15, 9],  // 16,10
  [15, 15], // 16,16
];

export default function JosekiRecommender() {
  // board[y][x]: 0=empty, 1=black, 2=white
  const [board, setBoard] = useState(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
  );
  const [currentColor, setCurrentColor] = useState(1); // 1=흑, 2=백
  const [lastMove, setLastMove] = useState(null);

  const topicKey = useMemo(
    () => (lastMove ? detectJosekiTopic(lastMove) : null),
    [lastMove]
  );
  const topic = topicKey ? JOSEKI_TOPICS[topicKey] : null;

  function handleReset() {
    setBoard(
      Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
    );
    setLastMove(null);
    setCurrentColor(1);
  }

  function handleCellClick(x, y) {
    // 이미 돌 있으면 무시
    if (board[y][x] !== 0) return;

    const next = board.map((row) => row.slice());
    next[y][x] = currentColor;
    setBoard(next);

    setLastMove({ x, y, color: currentColor });
    setCurrentColor(currentColor === 1 ? 2 : 1);
  }

  function formatLastMove(move) {
    if (!move) return "없음";
    // (1~19) 좌표, 행은 아래쪽이 1이 되도록
    const col = move.x + 1;
    const row = BOARD_SIZE - move.y;
    return `${col}, ${row}`;
  }

  return (
    <div className="joseki-page">
      <style>{boardCss}</style>
      <div className="joseki-shell">
        <header className="joseki-header">
          <div>
            <h1 className="joseki-title">정석 추천 바둑판 (베타)</h1>
            <p className="joseki-subtitle">
              바둑판 위에 수를 두면, 그 위치(3-3 / 화점 / 소목 / 코너 / 중앙)에 맞는
              정석·포석 강의 주제를 추천해주는 실험용 도구입니다.
            </p>
            <p className="joseki-note">
              · 1단계: 좌표 기반 판정 (모양 인식은 나중에 패턴 매칭으로 확장 가능)
            </p>
          </div>
        </header>

        <div className="joseki-main">
          {/* 바둑판 */}
          <section className="board-wrapper">
            <div className="board-toolbar">
              <span>
                현재 차례: <strong>{currentColor === 1 ? "흑" : "백"}</strong>{" "}
                · 마지막 착점: {formatLastMove(lastMove)}
              </span>
              <button type="button" onClick={handleReset}>
                초기화
              </button>
            </div>

            <div className="board">
              <div className="board-lines" />
              <div className="board-grid">
                {board.map((row, y) =>
                  row.map((value, x) => {
                    const isStar = STAR_POINTS.some(
                      ([sx, sy]) => sx === x && sy === y
                    );
                    const isLast =
                      lastMove && lastMove.x === x && lastMove.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="board-cell"
                        onClick={() => handleCellClick(x, y)}
                      >
                        {isStar && <div className="board-star" />}
                        {value !== 0 && (
                          <div
                            className={
                              "stone " +
                              (value === 1 ? "stone--black" : "stone--white") +
                              (isLast ? " stone--last" : "")
                            }
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* 추천 패널 */}
          <section className="reco-panel">
            <div className="reco-title">추천 정석 / 포석 강의</div>
            {topic ? (
              <>
                <div className="reco-topic">{topic.key}</div>
                <div className="reco-badge-row">
                  <span className="reco-badge reco-badge--key">
                    위치: {topic.posLabel}
                  </span>
                </div>
                <p className="reco-empty">{topic.description}</p>

                {topic.videos && topic.videos.length > 0 && (
                  <ul className="reco-list">
                    {topic.videos.map((v, idx) => (
                      <li key={idx} className="reco-item">
                        •{" "}
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="reco-link"
                        >
                          {v.title}
                        </a>
                        <span className="reco-meta">
                          ({v.channel}, {v.level})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="reco-hint">
                  👉 위 영상 목록은 컴포넌트 상단의 <code>JOSEKI_TOPICS</code> 객체에서
                  자유롭게 교체/추가할 수 있어. (3-3에 영상 5개 넣는 것도 가능)
                </p>
              </>
            ) : (
              <p className="reco-empty">
                아직 착수된 수가 없습니다. 코너 3-3 / 4-4 / 3-4(소목) 근처에 한 수
                두어 보세요. 위치에 따라 다른 정석/포석 주제가 표시됩니다.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
