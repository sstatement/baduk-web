import { useEffect, useState, useRef } from "react";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const injectKeyframes = () => `
/* ======= MyPage Animations & Theme ======= */
/* ======= Accessible Panel Themes (drop-in) ======= */
:root{
  --panel-bg: #faf8f4;
  --panel-edge: #efe9df;
  --ink: #111827;
  --line-strong: #1f2937;
  --focus: #155eef;
}

/* A. mp-frame — 미니멀 ‘규정집 프레임’ (기본 추천) */
.mp-frame{
  position:relative;
  background: var(--panel-bg);
  border-radius: 16px;
  border: 1.5px solid var(--line-strong);
  box-shadow:
    0 0 0 6px var(--panel-edge) inset,
    0 12px 28px rgba(0,0,0,.08);
}
.mp-frame::before,
.mp-frame::after{
  content:"";
  position:absolute; left:6%; right:6%; height:2px;
  background: linear-gradient(90deg, transparent 0 4%, var(--line-strong) 4% 96%, transparent 96% 100%);
  opacity:.9; border-radius:2px;
}
.mp-frame::before{ top:14px; }
.mp-frame::after { bottom:14px; }

/* B. mp-paper — 은은한 종이결(이미지 없이 CSS만) */
.mp-paper{
  position:relative;
  border-radius:16px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.4)),
    radial-gradient(1200px 600px at 10% -10%, rgba(0,0,0,.04), transparent 60%),
    radial-gradient(800px 400px at 90% 110%, rgba(0,0,0,.05), transparent 60%),
    #f6f2e7;
  border:1px solid #dcd6c5;
  box-shadow: 0 10px 24px rgba(0,0,0,.09);
}
.mp-paper::after{
  /* 미세한 결 느낌 */
  content:""; position:absolute; inset:0; pointer-events:none; opacity:.25;
  background:
    repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,.02) 6px 7px),
    repeating-linear-gradient(0deg, transparent 0 14px, rgba(0,0,0,.015) 14px 15px);
  border-radius:16px;
}

/* C. mp-linen — 린넨(직물) 느낌: 고정폭 라인 두겹 */
.mp-linen{
  position:relative;
  border-radius:16px;
  background:
    linear-gradient(90deg, rgba(0,0,0,.02) 1px, transparent 1px) 0 0/8px 8px,
    linear-gradient(0deg,  rgba(0,0,0,.025) 1px, transparent 1px) 0 0/8px 8px,
    #fcfbf9;
  border:1px solid #e7e2d8;
  box-shadow: 0 8px 22px rgba(0,0,0,.08);
}

/* 포커스 접근성(키보드 탐색 시) */
.mp-frame:focus-within,
.mp-paper:focus-within,
.mp-linen:focus-within{
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

/* 다크 모드 보정 */
@media (prefers-color-scheme: dark){
  :root{
    --panel-bg:#0f1115; --panel-edge:#0b0d10; --ink:#e5e7eb; --line-strong:#e5e7eb;
  }
  .mp-frame, .mp-paper, .mp-linen{ color: var(--ink); }
  .mp-paper{ background:
    linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02)),
    radial-gradient(1200px 600px at 10% -10%, rgba(255,255,255,.04), transparent 60%),
    radial-gradient(800px 400px at 90% 110%, rgba(255,255,255,.05), transparent 60%),
    #0f1115;
    border-color:#2b3038;
  }
  .mp-linen{ background:
    linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px) 0 0/8px 8px,
    linear-gradient(0deg,  rgba(255,255,255,.04) 1px, transparent 1px) 0 0/8px 8px,
    #0f1115;
    border-color:#2b3038;
  }
}

/* 모션 민감 사용자: 기존 애니메이션 자동 축소 */
@media (prefers-reduced-motion: reduce){
  .mp-frame::before, .mp-frame::after{ animation: none !important; }
}


/* 등장 */
@keyframes mp-fadeUp { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
@keyframes mp-fadeIn { from{opacity:0} to{opacity:1} }
@keyframes mp-lineGrow { from{transform:scaleX(0); opacity:.0} to{transform:scaleX(1); opacity:.9} }
/* 포커스/강조 */
@keyframes mp-pulse { 0%,100%{ box-shadow:0 0 0 0 rgba(255,255,255,.0)} 50%{ box-shadow:0 0 0 8px rgba(255,255,255,.12)} }
/* 반짝 */
@keyframes mp-shimmer {
  0% { background-position:-200% 0; opacity:.0 }
  20% { opacity:.6 }
  100% { background-position:200% 0; opacity:.0 }
}
/* 랭크 링 회전 */
@keyframes mp-rotate { from{transform:rotate(0)} to{transform:rotate(360deg)} }
/* 돌 놓기 느낌 */
.mp-press:hover{ transform: translateY(1px) scale(1.002); box-shadow: 0 10px 20px rgba(0,0,0,.12); }

/* 고반 배경 유틸 */
.mp-goban{
  position:relative;
  background-color:#d9b382;
  background-image:
    linear-gradient(to right, transparent calc(100% - 2px), #5a3b1a 0),
    linear-gradient(to bottom, transparent calc(100% - 2px), #5a3b1a 0);
  background-size:40px 40px;
  border:2px solid #5a3b1a;
  border-radius:16px;
}
.mp-goban::before{
  content:"";
  position:absolute; inset:0; pointer-events:none; opacity:.55;
  background:
    radial-gradient(circle 3px at 20% 20%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 50% 20%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 80% 20%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 20% 50%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 50% 50%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 80% 50%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 20% 80%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 50% 80%, #2b1e12 98%, transparent 102%),
    radial-gradient(circle 3px at 80% 80%, #2b1e12 98%, transparent 102%);
}

/* 타이틀 라인 */
/* 타이틀 라인 완전 중앙 정렬 버전 */
.mp-titleLine {
  position: relative;
  display: flex;
  justify-content: center; /* 제목 전체 중앙 정렬 */
  align-items: center;
  flex-direction: column; /* 제목 아래에 선을 배치 */
  text-align: center;
}

/* 제목 하단 라인 */
.mp-titleLine::after {
  content: "";
  display: block;
  margin-top: 10px; /* 텍스트와 라인 간격 */
  width: min(480px, 80%); /* 폭 자동 조절 */
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #2a2a2a 10%,
    #2a2a2a 90%,
    transparent 100%
  );
  border-radius: 2px;
  animation: mp-lineGrow 0.6s ease-out 0.2s both;
}


/* 흑/백돌 아이콘 */
.mp-stone{
  display:inline-block; width:16px; height:16px; border-radius:9999px; margin-left:8px;
  vertical-align:middle; box-shadow: inset 0 1px 0 rgba(255,255,255,.25), inset 0 -1px 0 rgba(0,0,0,.15);
  transform-origin: center -6px;
  animation: mp-fadeIn .4s ease .25s both;
}
.mp-stone.black{ background: radial-gradient(circle at 35% 35%, #333, #0a0a0a); }
.mp-stone.white{ background: radial-gradient(circle at 35% 35%, #fff, #e8e8e8); border:1px solid rgba(0,0,0,.15) }
.mp-stone.swing{ animation: mp-fadeIn .3s ease .2s both, swing 1.4s ease-in-out .4s 1; }
@keyframes swing {
  0%{ transform: rotate(0) }
  30%{ transform: rotate(-10deg) }
  60%{ transform: rotate(6deg) }
  100%{ transform: rotate(0) }
}

/* 랭크 배지 링 */
.mp-rankWrap{
  position:relative; display:inline-flex; align-items:center; gap:10px;
}
.mp-rankRing{
  position:absolute; inset:-6px; border-radius:9999px;
  background: conic-gradient(from 0deg, rgba(255,215,130,.9), rgba(255,240,200,.4), rgba(255,215,130,.9));
  filter: blur(6px);
  animation: mp-rotate 6s linear infinite;
  z-index:0; opacity:.6;
}
.mp-rankImg{ position:relative; z-index:1 }

/* 진행바 */
.mp-bar{
  position:relative; height:10px; background:#f1e9d7; border-radius:9999px; overflow:hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,.08);
}
.mp-barFill{
  height:100%; width:0%; background: linear-gradient(90deg, #7c3aed, #f59e0b);
  animation: mp-fadeIn .2s ease both;
  transition: width .6s cubic-bezier(.2,.8,.2,1);
}

/* 카드 공통 */
.mp-card{
  background:#fff; border:1px solid #f3e9dd; border-radius:12px; padding:16px;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
  animation: mp-fadeUp .4s ease both;
  transition: transform .12s ease, box-shadow .12s ease;
}
.mp-card:hover{ transform: translateY(1px); box-shadow: 0 10px 18px rgba(0,0,0,.12); }

/* 알림 토글(돌 스위치) */
.mp-switch{
  appearance:none; width:52px; height:28px; border-radius:9999px; position:relative; outline:none; cursor:pointer;
  background:#e5e7eb; transition: background .2s ease;
}
.mp-switch::after{
  content:""; position:absolute; top:3px; left:3px; width:22px; height:22px; border-radius:9999px;
  background: radial-gradient(circle at 35% 35%, #fff, #e8e8e8);
  border:1px solid rgba(0,0,0,.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(0,0,0,.12), 0 3px 8px rgba(0,0,0,.12);
  transition: transform .2s cubic-bezier(.2,.8,.2,1);
}
.mp-switch:checked{ background:#10b981; }
.mp-switch:checked::after{ transform: translateX(24px); background: radial-gradient(circle at 35% 35%, #333, #0a0a0a); }

/* 스켈레톤(로딩) */
@keyframes mp-skeleton { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.mp-skel{
  background: linear-gradient(90deg, #eee 25%, #f6f6f6 37%, #eee 63%);
  background-size: 400% 100%; animation: mp-skeleton 1.2s ease infinite;
  border-radius: 8px; min-height: 16px;
}
`;

const useKeyframes = () => {
  const ref = useRef(null);
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-mypage-anim', 'true');
    styleTag.innerHTML = injectKeyframes();
    document.head.appendChild(styleTag);
    ref.current = styleTag;
    return () => { if (ref.current) document.head.removeChild(ref.current); };
  }, []);
};

const styles = {
  container: {
    maxWidth: "920px",
    margin: "40px auto 80px",
    padding: "24px",
    fontFamily: "'Noto Sans KR', sans-serif",
    color: "#1f2937",
  },
  panel: {
    padding: "24px",
    position: "relative",
  },
  title: {
    fontSize: "30px",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: "22px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "12px",
    color: "#6b4226",
  },
  row: { display: "flex", gap: 16, flexWrap: "wrap" },
  card: { flex: "1 1 280px", minWidth: 280 },
  label: { fontWeight: 700, marginRight: 8 },
  img: {
    width: 48,
    height: 48,
    verticalAlign: "middle",
    marginLeft: 8,
    borderRadius: "50%",
    border: "2px solid #d4a373",
  },
  small: { fontSize: 13, color: "#6b7280" },
  statRow: { display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "center", margin: "8px 0" },
  quest: { marginTop: 8, padding: "8px 12px", background: "#fefae0", borderRadius: 8, border: "1px solid #f3e9dd" },
};

const MyPage = ({ userId }) => {
  useKeyframes();

  const [userData, setUserData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);
  const [barReady, setBarReady] = useState(false); // 진행바 애니메이션 트리거

  const rankImages = {
    챌린저: "/images/챌린저.jpg",
    그랜드마스터: "/images/그랜드마스터.jpg",
    마스터: "/images/마스터.jpg",
    다이아: "/images/다이아.jpg",
    플래티넘: "/images/플래티넘.jpg",
    골드: "/images/골드.jpg",
    실버: "/images/실버.jpg",
    브론즈: "/images/브론즈.jpg",
  };

  const getRank = (playerName, allMatches) => {
    const sorted = [...allMatches].sort((a, b) => b.rating - a.rating);
    const playerIndex = sorted.findIndex((m) => m.playerName === playerName);
    if (playerIndex === -1) return "랭크 없음";
    const rating = sorted[playerIndex].rating;

    if (rating >= 1576) {
      if (playerIndex === 0) return "챌린저";
      if (playerIndex >= 1 && playerIndex <= 3) return "그랜드마스터";
      if (playerIndex >= 4 && playerIndex <= 9) return "마스터";
      return "다이아";
    }
    if (rating >= 1551) return "플래티넘";
    if (rating >= 1526) return "골드";
    if (rating >= 1501) return "실버";
    if (rating <= 1500) return "브론즈";
    return "랭크 없음";
  };

  const fetchUserData = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUserData(snap.data());
      else setError("사용자 데이터를 찾을 수 없습니다.");
    } catch (e) {
      console.error(e);
      setError("사용자 데이터를 가져오는 데 실패했습니다.");
    }
  };

  const fetchAllMatchData = async () => {
    try {
      const qs = await getDocs(collection(db, "matchApplications"));
      setMatchData(qs.docs.map((d) => d.data()));
    } catch (e) {
      console.error(e);
      setError("매치 데이터를 가져오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
      fetchAllMatchData();
    }
  }, [userId]);

  useEffect(() => {
    // 데이터가 준비되면 진행바 애니메이션 시작
    if (userData && matchData) {
      const t = setTimeout(() => setBarReady(true), 150);
      return () => clearTimeout(t);
    }
  }, [userData, matchData]);

  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!userData || !matchData)
    return (
      <div style={{ padding: 20 }}>
        <div className="mp-skel" style={{ height: 20, marginBottom: 10, maxWidth: 280 }} />
        <div className="mp-skel" style={{ height: 14, marginBottom: 8, maxWidth: 420 }} />
        <div className="mp-skel" style={{ height: 14, marginBottom: 8, maxWidth: 380 }} />
      </div>
    );

  const myMatch = matchData.find((m) => m.playerName === userData.name);
  const rank = myMatch ? getRank(userData.name, matchData) : null;
  const rankImgSrc = rank ? rankImages[rank] : null;

  const getStaminaRank = (stamina) =>
    stamina >= 1000 ? `${Math.floor((stamina - 1000) / 100) + 1}단` : `${18 - Math.floor(stamina / 50)}급`;

  const winRatePct = myMatch ? Math.max(0, Math.min(100, (myMatch.winRate || 0) * 100)) : 0;
  const ratingPct = myMatch
    ? (() => {
        // 레이팅 1450~1600 구간을 0~100%로 시각화 (필요시 조정)
        const min = 1450;
        const max = 1600;
        return Math.max(0, Math.min(100, ((myMatch.rating - min) / (max - min)) * 100));
      })()
    : 0;

  return (
    <div style={styles.container}>
      {/* 고반 배경 패널 */}
      <div className="mp-paper mp-press mp-*" style={styles.panel}>
        <h1 className="mp-* mp-titleLine" style={styles.title}>
          마이페이지
          <span className="mp-stone black swing" />
          <span className="mp-stone white swing" />
        </h1>

        {/* 사용자 정보 */}
        <section className="mp-card mp-* mp-press" style={{ ...styles.card, animationDelay: ".05s" }}>
          <h2 style={styles.sectionTitle}>👤 사용자 정보</h2>
          <p>
            <span style={styles.label}>이름:</span> {userData.name}
          </p>
          <p>
            <span style={styles.label}>역할:</span> {userData.admin ? "admin" : userData.role}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <label htmlFor="notificationsEnabled" style={{ fontWeight: 700 }}>
              알림:
            </label>
            <input
              id="notificationsEnabled"
              type="checkbox"
              className="mp-switch"
              checked={!!userData.notificationsEnabled}
              onChange={async () => {
                try {
                  const updated = !userData.notificationsEnabled;
                  await updateDoc(doc(db, "users", userId), { notificationsEnabled: updated });
                  setUserData((prev) => ({ ...prev, notificationsEnabled: updated }));
                } catch (err) {
                  console.error("알림 설정 업데이트 실패:", err);
                }
              }}
            />
            <span style={styles.small}>{userData.notificationsEnabled ? "ON - 공지/매치 알림" : "OFF"}</span>
          </div>
        </section>

        {/* 퀘스트/보스 */}
        <section className="mp-card mp-* mp-press" style={{ ...styles.card, animationDelay: ".1s" }}>
          <h2 style={styles.sectionTitle}>📜 완료한 보스 및 퀘스트</h2>
          <div>
            <p>
              <span style={styles.label}>보스 완료:</span>{" "}
              {userData.BossCompleted?.filter(Boolean).length || 0} / {userData.BossCompleted?.length || 0}
            </p>
            <div style={styles.row}>
              {userData.BossCompleted?.map(
                (completed, i) =>
                  completed && (
                    <div key={`boss-${i}`} className="mp-press mp-*" style={styles.quest}>
                      보스 {i + 1}
                    </div>
                  )
              )}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <p>
              <span style={styles.label}>퀘스트 완료:</span>{" "}
              {userData.questsCompleted?.filter(Boolean).length || 0} / {userData.questsCompleted?.length || 0}
            </p>
            <div style={styles.row}>
              {userData.questsCompleted?.map(
                (completed, i) =>
                  completed && (
                    <div key={`quest-${i}`} className="mp-press mp-*" style={styles.quest}>
                      퀘스트 {i + 1}
                    </div>
                  )
              )}
            </div>
          </div>
        </section>

        {/* 매치 데이터 */}
        <section className="mp-card mp-* mp-press" style={{ ...styles.card, animationDelay: ".15s" }}>
          <h2 style={styles.sectionTitle}>📊 매치 데이터</h2>
          {myMatch ? (
            <>
              <p style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={styles.label}>랭크:</span>{" "}
                <span className="mp-rankWrap">
                  <span
                    aria-hidden
                    className="mp-rankRing"
                    style={{ width: 56, height: 56, borderRadius: "9999px" }}
                  />
                  {rankImgSrc ? (
                    <img src={rankImgSrc} alt={`${rank} 랭크`} style={styles.img} className="mp-rankImg" />
                  ) : (
                    <span
                      style={{
                        ...styles.img,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        background: "#fff",
                        border: "2px solid #ddd",
                        color: "#6b7280",
                      }}
                    >
                      {rank}
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, marginLeft: 4 }}>{rank || "랭크 없음"}</span>
              </p>

              <div style={{ ...styles.statRow, marginTop: 12 }}>
                <div style={{ fontWeight: 700 }}>레이팅</div>
                <div className="mp-bar" aria-label="레이팅 진행바">
                  <div
                    className="mp-barFill"
                    style={{ width: barReady ? `${ratingPct.toFixed(0)}%` : "0%" }}
                    title={`${myMatch.rating}`}
                  />
                </div>
              </div>
              <p style={{ textAlign: "right", marginTop: 4, color: "#6b7280" }}>
                {myMatch.rating} (상대적 지표 {ratingPct.toFixed(0)}%)
              </p>

              <div style={{ ...styles.statRow, marginTop: 10 }}>
                <div style={{ fontWeight: 700 }}>승률</div>
                <div className="mp-bar" aria-label="승률 진행바">
                  <div
                    className="mp-barFill"
                    style={{
                      width: barReady ? `${winRatePct.toFixed(0)}%` : "0%",
                      background: "linear-gradient(90deg, #22c55e, #0284c7)",
                    }}
                    title={`${winRatePct.toFixed(2)}%`}
                  />
                </div>
              </div>
              <p style={{ textAlign: "right", marginTop: 4, color: "#6b7280" }}>
                승 {myMatch.win} / 패 {myMatch.loss} · {winRatePct.toFixed(2)}%
              </p>

              <p style={{ marginTop: 12 }}>
                <span style={styles.label}>기력:</span> {getStaminaRank(myMatch.stamina)}
              </p>
            </>
          ) : (
            <p>매치 데이터가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyPage;
