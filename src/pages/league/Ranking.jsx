import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSeason } from '../../contexts/SeasonContext';

/* === Arena CSS (콜로세움 + 불꽃 + 재 + 모달 + 동적 오라 + 접근성 보강) === */
const arenaCss = `
:root{
  --arena-bg:#13090b;
  --arena-grad1:#2a0f13; --arena-grad2:#3c0f10; --arena-grad3:#520f0c;
  --ring:#d72626; --gold:#ffdf8a; --ink:#111827; --ink-muted:#334155;
  --line:#e2e8f0; --focus:#155eef;
}
@media (prefers-color-scheme: dark){ :root{ --ink:#e5e7eb; --ink-muted:#9aa4b2; } }
@media (prefers-reduced-motion: reduce){ .rk-anim, .rk-smoke, .rk-ember { animation: none !important; transition: none !important; } }

/* 시각적으로 숨기되 스크린리더엔 노출 */
.sr-only{ position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

/* ==== 배경: 콜로세움 & 불꽃 & 재 ==== */
.arena-page{
  position: relative; min-height: 100%; padding: 24px;
  background:
    radial-gradient(1200px 700px at 50% 120%, rgba(255,120,20,.18), transparent 60%),
    radial-gradient(1000px 600px at 50% 110%, rgba(240,40,20,.12), transparent 60%),
    linear-gradient(180deg, var(--arena-grad1), var(--arena-grad2), var(--arena-grad3));
  overflow: hidden;
}
.arena-page::before{
  content:""; position:absolute; left:-10%; right:-10%; bottom:-8%; height: 45%;
  background:
    radial-gradient(1200px 240px at 50% 100%, rgba(255,160,40,.38), transparent 70%),
    radial-gradient(900px 200px at 30% 100%, rgba(255,90,40,.28), transparent 70%),
    radial-gradient(900px 200px at 70% 100%, rgba(255,90,40,.28), transparent 70%);
  filter: blur(22px);
  animation: flameFlicker 2.6s ease-in-out infinite alternate;
}
@keyframes flameFlicker{ 0%{ transform: translateY(0) scaleY(1); opacity:.85 } 100%{ transform: translateY(-4px) scaleY(1.03); opacity:1 } }

.arena-page::after{
  content:""; position: absolute; inset: 0; pointer-events: none; opacity:.8;
  background-image:
    radial-gradient(circle 2px at 10% 110%, rgba(255,179,71,.55) 40%, transparent 45%),
    radial-gradient(circle 2px at 30% 120%, rgba(255,210,122,.5) 40%, transparent 45%),
    radial-gradient(circle 2px at 60% 130%, rgba(255,179,71,.55) 40%, transparent 45%),
    radial-gradient(circle 2px at 80% 115%, rgba(255,210,122,.5) 40%, transparent 45%),
    radial-gradient(circle 1.5px at 50% 120%, rgba(255,179,71,.6) 40%, transparent 45%);
  background-repeat: no-repeat;
  animation: emberRise 7s linear infinite;
}
@keyframes emberRise{ 0%{ transform: translateY(0) } 100%{ transform: translateY(-120%) } }

/* ==== 카드 컨테이너 ==== */
.arena-card{
  max-width: 1100px; margin: 32px auto 64px; background:#ffffff; color: var(--ink);
  border-radius: 16px;
  box-shadow: 0 0 0 8px rgba(255,255,255,.03) inset, 0 20px 40px rgba(0,0,0,.35);
  padding: 28px 24px; position: relative;
}

/* ==== 타이틀(선명도↑) ==== */
.arena-title {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  margin: 0 0 18px;
  letter-spacing: 0.4px;
  color: #ffffff;
  text-shadow:
    0 0 2px rgba(0,0,0,0.45),
    0 1px 2px rgba(0,0,0,0.6),
    0 0 12px rgba(255,110,60,0.28);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));
}
.arena-title::after {
  content: "";
  display: block;
  height: 2px;
  width: min(520px, 86%);
  margin: 12px auto 0;
  background: linear-gradient(
    90deg,
    transparent 0 8%,
    rgba(255,190,120,0.95) 8% 92%,
    transparent 92% 100%
  );
  animation: titleGlow 1.2s ease-in-out infinite alternate;
}
@keyframes titleGlow {
  0% { opacity: 0.75; filter: blur(0.4px); }
  100% { opacity: 1;    filter: blur(1px); }
}

/* ==== 표 공통 ==== */
.rk-table{ width:100%; border-collapse: collapse; margin-bottom: 36px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.12); }
.rk-th{
  background:#fff5f5; color:#5f0d0d;
  padding:14px 16px; font-weight:900; font-size:14px; text-align:center;
  border-bottom:2px solid #ef4444; position: sticky; top:0;
}
.rk-td{ padding:12px 16px; border-bottom:1px solid var(--line); text-align:center; font-size:14px; color: var(--ink); background:#fff; transition: background-color .15s ease, transform .12s ease, box-shadow .12s ease; }
.rk-row:nth-child(even) .rk-td{ background:#fcfcfe; }
.rk-row:hover .rk-td{ background: #ffe5e5; box-shadow: inset 0 0 0 9999px rgba(255,70,60,.02); transform: translateY(-1px); cursor:pointer; }

/* ==== 상위권 오라(ΔELO 변수로 제어) ==== */
.rk-rankCell{ position:relative; z-index:1; }
.rk-top1 .rk-rankCell::after{
  content:""; position:absolute; inset:-8px; border-radius: 9999px; z-index:0; pointer-events:none;
  background: radial-gradient(24px 24px at 50% 50%, var(--auraColor, rgba(215,38,38,.45)), transparent 65%);
  filter: blur(2px);
  animation: ringPulse 1.8s ease-in-out infinite;
  box-shadow: 0 0 0 var(--auraSpread, 14px) color-mix(in srgb, var(--auraColor, rgba(215,38,38,.45)) 30%, transparent);
  opacity: var(--auraAlpha, .75);
}
.rk-top2 .rk-rankCell{ color:#b91c1c; }
.rk-top3 .rk-rankCell{ color:#dc2626; }
@keyframes ringPulse{
  0%,100%{ transform:scale(1); }
  50%{ transform:scale(1.05); }
}

/* ==== 매트릭스 ==== */
.rk-matrix .rk-td{ font-weight:600; }
.rk-matrix .rk-td[data-val="O"]{ color:#b91c1c; }
.rk-matrix .rk-td[data-val="X"]{ color:#9ca3af; }
.rk-matrix .rk-td[data-val="-"]{ color:#cbd5e1; }

/* ==== 모달(전투 리플레이) ==== */
.rk-backdrop{
  position: fixed; inset:0; background: rgba(10,6,6,.75);
  display:flex; align-items:center; justify-content:center; z-index: 9990;
  backdrop-filter: blur(2px);
}
.rk-modal{
  width: min(900px, 92vw); max-height: min(80vh, 900px); overflow:auto;
  background: #1b1514; color: #fef2f2; border-radius: 16px; position: relative; padding: 24px 20px 28px;
  box-shadow: 0 0 0 2px rgba(255,255,255,.06) inset, 0 24px 48px rgba(0,0,0,.6);
}
.rk-modal .rk-title{
  font-size: 22px; font-weight: 900; text-align:center; margin: 0 0 10px; letter-spacing:.4px;
}
.rk-close{
  position:absolute; right:12px; top:10px; background:transparent; color:#fee2e2; border:none; font-size:20px; cursor:pointer;
}
.rk-close:focus-visible{ outline:3px solid var(--focus); outline-offset:3px; border-radius:8px; }

/* VS 배너 */
.rk-banner{
  position: relative; margin: 4px auto 18px; width: fit-content; padding: 10px 16px;
  background: linear-gradient(180deg, rgba(255,200,150,.14), rgba(255,140,100,.08));
  border:1px solid rgba(255,190,150,.2); border-radius: 9999px; box-shadow: 0 8px 24px rgba(0,0,0,.35);
  display:flex; align-items:center; gap: 10px;
}
.rk-vs{
  font-weight: 900; letter-spacing:.2px; color:#fecaca; text-shadow: 0 1px 2px rgba(0,0,0,.6);
}

/* 향로 + 연기 */
.rk-incense{
  position:absolute; bottom: 8px; width: 26px; height: 26px; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #5b4946, #2b2221 70%); box-shadow: 0 0 10px rgba(255,140,100,.25);
}
.rk-incense.left{ left: 18px; }
.rk-incense.right{ right: 18px; }
.rk-smoke{
  position:absolute; bottom: 28px; width: 10px; height: 10px; left: 8px;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.35), transparent 60%);
  border-radius: 50%; filter: blur(2px);
  animation: smokeRise 5s ease-in-out infinite;
}
.rk-incense.right .rk-smoke{ left: auto; right: 8px; animation-delay: 2.2s; }
.rk-smoke::before, .rk-smoke::after{
  content:""; position:absolute; inset:0; background: inherit; border-radius: inherit;
  animation: inherit; animation-duration: 4.2s; animation-delay: 1.3s;
}
@keyframes smokeRise{
  0%{ transform: translateY(0) scale(1); opacity:.8 }
  50%{ transform: translateY(-30px) scale(1.3); opacity:.5 }
  100%{ transform: translateY(-60px) scale(1.1); opacity:.1 }
}

/* 로그 카드 */
.rk-log{
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  padding: 12px 14px; margin: 8px 0;
  display:flex; align-items:center; gap: 10px; justify-content: space-between;
}
.rk-badge{
  display:inline-flex; align-items:center; gap:6px; padding: 6px 10px; border-radius:9999px;
  font-weight:900; font-size: 12px;
}
.rk-badge.win{ background: rgba(34,197,94,.15); color:#bbf7d0; border:1px solid rgba(34,197,94,.4); }
.rk-badge.lose{ background: rgba(239,68,68,.15); color:#fecaca; border:1px solid rgba(239,68,68,.4); }
.rk-elo{ font-family: monospace; color:#fee2e2; }

/* 포커스 링(키보드 접근성) */
.rk-row:focus-visible .rk-td{ outline: 3px solid var(--focus); outline-offset:-3px; }
`;

const getRankImage = (rank) => {
  const size = 40;
  const style = { width: size, height: size, borderRadius: '50%', objectFit: 'cover' };
  const key = rank?.replace(/\s+/g, '');
  const F = (n) => <img loading="lazy" src={`/images/${n}.jpg`} alt={n} style={style} onError={(e)=>{e.currentTarget.style.display='none'}}/>;
  if (key === '브론즈') return F('브론즈');
  if (key === '실버') return F('실버');
  if (key === '골드') return F('골드');
  if (key === '플래티넘') return F('플래티넘');
  if (key === '다이아') return F('다이아');
  if (key === '마스터') return F('마스터');
  if (key === '그랜드마스터') return F('그랜드마스터');
  if (key === '챌린저') return F('챌린저');
  return null;
};

const getRank = (rating, rankIndex) => {
  if (rating >= 1576) {
    if (rankIndex === 1) return { rank: '챌린저', color: '#0284c7' };
    if (rankIndex >= 2 && rankIndex <= 4) return { rank: '그랜드마스터', color: '#dc2626' };
    if (rankIndex >= 5 && rankIndex <= 10) return { rank: '마스터', color: '#7c3aed' };
    return { rank: '다이아', color: '#2563eb' };
  }
  if (rating >= 1551) return { rank: '플래티넘', color: '#0d9488' };
  if (rating >= 1526) return { rank: '골드', color: '#ca8a04' };
  if (rating >= 1501) return { rank: '실버', color: '#6b7280' };
  return { rank: '브론즈', color: '#c2410c' };
};

const containerStyle = { maxWidth: '1100px', margin: '0 auto', backgroundColor: 'transparent', padding: 0 };
const winRateStyle = { fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' };
const rankTextStyle = (color) => ({ color, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '16px' });
const getRowBackground = (index) => (index % 2 === 0 ? 'white' : '#f9fafb');
const rankImageLargeStyle = { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto', boxShadow: '0 0 0 3px rgba(239,68,68,.18)' };
const BASE_ELO = 1500;

/* ΔELO → 오라 변수 계산 */
function auraVars(delta) {
  const d = Math.max(-50, Math.min(200, delta || 0));
  const t = (d + 50) / 250; // 0..1
  const r = Math.round(0xd7 + (0xff - 0xd7) * t);
  const g = Math.round(0x26 + (0xae - 0x26) * t);
  const b = Math.round(0x26 + (0x00 - 0x26) * t);
  const spread = 8 + Math.round(18 * t); // 8px → 26px
  const alpha = 0.45 + 0.35 * t;         // 0.45 → 0.80
  return {
    '--auraColor': `rgba(${r},${g},${b},0.65)`,
    '--auraSpread': `${spread}px`,
    '--auraAlpha': `${alpha}`,
  };
}

const Ranking = () => {
  const { activeSeasonId: seasonId = 'S1' } = useSeason() || {};

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [matchMatrix, setMatchMatrix] = useState({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  const [seasonMatches, setSeasonMatches] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [focusPlayer, setFocusPlayer] = useState(null);

  const fetchPlayersList = async () => {
    try {
      const applicationsRef = collection(db, 'matchApplications');
      const qApps = query(applicationsRef, orderBy('rating', 'desc'));
      const snap = await getDocs(qApps);
      return snap.docs.map((d) => ({
        id: d.id,
        playerName: d.data().playerName,
        baseRating: d.data().rating ?? BASE_ELO,
        stamina: d.data().stamina ?? null,
      }));
    } catch (e) {
      console.error('fetchPlayersList error:', e);
      return [];
    }
  };

  const fetchSeasonMatches = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const qM = query(matchesRef, where('status', '==', 'approve'), where('seasonId', '==', seasonId));
      const snap = await getDocs(qM);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('fetchSeasonMatches error:', e);
      return [];
    }
  };

 // ⬇️ Ranking 컴포넌트 안의 fetchRankings 함수만 교체
const fetchRankings = async () => {
  try {
    setLoading(true);

    // 1) 지원서(시즌에 경기 없을 때 현재값 fallback)
    const applicationsRef = collection(db, 'matchApplications');
    const qApps = query(applicationsRef, orderBy('rating', 'desc'));
    const appsSnap = await getDocs(qApps);
    const appList = appsSnap.docs.map((d) => ({
      id: d.id,
      playerName: d.data().playerName,
      seedRating: d.data().rating ?? BASE_ELO, // 경기 없을 때 현재값으로 사용
      stamina: d.data().stamina ?? null,
    }));

    // 2) 시즌 경기
    const matchesRef = collection(db, 'matches');
    const qM = query(matchesRef, where('status', '==', 'approve'), where('seasonId', '==', seasonId));
    const mSnap = await getDocs(qM);
    const matches = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSeasonMatches(matches);

    // 3) 선수 집합
    const nameSet = new Set(appList.map((p) => p.playerName));
    matches.forEach((m) => {
      if (m.winner) nameSet.add(m.winner);
      if (m.loser) nameSet.add(m.loser);
    });
    if (nameSet.size === 0) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    // 4) 선수별 '현재 ELO'(시즌 내 가장 최근 경기 기준) 계산
    const stats = {};
    for (const name of nameSet) {
      const app = appList.find((p) => p.playerName === name);
      stats[name] = {
        seed: app?.seedRating ?? BASE_ELO,
        stamina: app?.stamina ?? null,
        latestAt: null,
        latestElo: null,
        win: 0,
        loss: 0,
      };
    }

    matches.forEach((m) => {
      const atRaw = m.date || m.createdAt;
      const at = atRaw?.toDate ? atRaw.toDate() : (atRaw ? new Date(atRaw) : null);

      if (m.winner && stats[m.winner]) {
        const me = stats[m.winner];
        me.win += 1;
        const elo = Number.isFinite(Number(m.winnerELO)) ? Number(m.winnerELO) : null;
        if (elo != null && (!me.latestAt || (at && at > me.latestAt))) {
          me.latestAt = at;
          me.latestElo = elo;
        }
      }
      if (m.loser && stats[m.loser]) {
        const me = stats[m.loser];
        me.loss += 1;
        const elo = Number.isFinite(Number(m.loserELO)) ? Number(m.loserELO) : null;
        if (elo != null && (!me.latestAt || (at && at > me.latestAt))) {
          me.latestAt = at;
          me.latestElo = elo;
        }
      }
    });

    // 5) rows 조립: ★ baseRating을 무조건 1500으로, ΔELO = current - 1500
    const rows = Array.from(nameSet).map((playerName) => {
      const s = stats[playerName];
      const currentRating = s.latestElo ?? s.seed ?? BASE_ELO;  // 최근 경기 ELO > seed > 1500
      const baseRating = BASE_ELO;                               // ← 고정 기준
      const delta = Math.floor(currentRating - baseRating);

      return {
        id: playerName,
        playerName,
        rating: currentRating,
        baseRating,
        delta,
        stamina: s.stamina,
        win: s.win,
        loss: s.loss,
        _source: s.latestElo != null ? 'matches' : 'applications',
      };
    });

    rows.sort((a, b) => b.rating - a.rating);
    setPlayers(rows);
    setLoading(false);
  } catch (e) {
    console.error('Error building rankings:', e);
    setPlayers([]);
    setLoading(false);
  }
};


  const buildMatchMatrix = useCallback(async (playerList) => {
    try {
      setLoadingMatrix(true);
      const matches = seasonMatches.length ? seasonMatches : await fetchSeasonMatches();
      if (!seasonMatches.length) setSeasonMatches(matches);

      const names = playerList.map((p) => p.playerName);
      const matrix = {};
      names.forEach((r) => {
        matrix[r] = {};
        names.forEach((c) => (matrix[r][c] = r === c ? '-' : 'X'));
      });

      matches.forEach((m) => {
        const pA = m.playerA || m.winner;
        const pB = m.playerB || m.loser;
        if (pA && pB && matrix[pA] && matrix[pB]) {
          matrix[pA][pB] = 'O';
          matrix[pB][pA] = 'O';
        }
      });

      setMatchMatrix(matrix);
      setLoadingMatrix(false);
    } catch (e) {
      console.error('Error fetching matrix:', e);
      setMatchMatrix({});
      setLoadingMatrix(false);
    }
  }, [seasonMatches]);

  useEffect(() => { fetchRankings(); /* eslint-disable-next-line */ }, [seasonId]);
  useEffect(() => { players.length ? buildMatchMatrix(players) : setLoadingMatrix(false); /* eslint-disable-next-line */ }, [players, seasonId]);

  /* ===== 모달: 특정 선수 전투 로그 ===== */
  const recentLogs = useMemo(() => {
    if (!modalOpen || !focusPlayer) return [];
    const name = focusPlayer.playerName;
    const logs = seasonMatches
      .filter(m => m.winner === name || m.loser === name)
      .map(m => {
        const atRaw = m.date || m.createdAt;
        const at = atRaw?.toDate ? atRaw.toDate() : (atRaw ? new Date(atRaw) : null);
        const dateTxt = at ? at.toLocaleDateString() : '날짜 미상';
        const isWin = m.winner === name;
        const opponent = isWin ? (m.loser || m.playerB || '상대') : (m.winner || m.playerA || '상대');
        const myElo  = isWin ? (m.winnerELO ?? null) : (m.loserELO ?? null);
        const oppElo = isWin ? (m.loserELO ?? null)  : (m.winnerELO ?? null);
        return { id: m.id, dateTxt, isWin, opponent, myElo, oppElo };
      })
      .sort((a,b)=> (a.dateTxt < b.dateTxt ? 1 : -1))
      .slice(0, 10);
    return logs;
  }, [modalOpen, focusPlayer, seasonMatches]);

  const openModal = (player) => { setFocusPlayer(player); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setFocusPlayer(null); };

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') closeModal(); };
    if (modalOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [modalOpen]);

  if (loading) {
    return <div aria-live="polite" style={{ textAlign: 'center', padding: '20px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,.5)', fontWeight: 700 }}>로딩 중...</div>;
  }
  if (!players.length) {
    return <div aria-live="polite" style={{ textAlign: 'center', padding: '20px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,.5)', fontWeight: 700 }}>선수 데이터가 없습니다.</div>;
  }

  return (
    <div className="arena-page rk-anim">
      <style>{arenaCss}</style>

      <div className="arena-card rk-anim" style={containerStyle}>
        <h2 className="arena-title" id="rank-table-title">리그 순위표</h2>

        {/* ===== 랭킹 테이블 ===== */}
        <table className="rk-table" role="table" aria-labelledby="rank-table-title">
          <caption className="sr-only">현재 시즌 리그 순위표</caption>
          <thead>
            <tr>
              {['순위','선수명','ELO','랭크','급수/단수','승','패','승률','ΔELO'].map((h)=>(
                <th key={h} className="rk-th" scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => {
              const { rank, color } = getRank(player.rating, idx + 1);
              const total = (player.win || 0) + (player.loss || 0);
              const winRate = total === 0 ? 0 : ((player.win / total) * 100).toFixed(2);
              const stamina = player.stamina;
              const danOrKyu =
                stamina == null ? '-' :
                stamina >= 1000 ? `${Math.floor((stamina - 1000) / 100) + 1}단` :
                `${18 - Math.floor(stamina / 50)}급`;
              const auraStrength = Math.max(0, Math.min(1, player.delta / 150));
              const rowClass =
                idx === 0 ? 'rk-row rk-top1' :
                idx === 1 ? 'rk-row rk-top2' :
                idx === 2 ? 'rk-row rk-top3' : 'rk-row';

              // 1위 ΔELO 기반 오라 변수
              const auraStyle = idx === 0 ? auraVars(player.delta) : undefined;

              const onKey = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(player);
                }
              };

              return (
                <tr
                  key={player.id}
                  className={rowClass}
                  tabIndex={0}
                  aria-label={`${idx+1}위 ${player.playerName}, ELO ${Math.floor(player.rating)}, 랭크 ${rank}`}
                  style={{ background: getRowBackground(idx)}}
                  onClick={() => openModal(player)}
                  onKeyDown={onKey}
                >
                  <td className="rk-td">{idx + 1}</td>
                  <td className="rk-td" style={{ fontWeight: 800, color: '#0f172a' }}>{player.playerName}</td>
                  <td className="rk-td" style={{ fontFamily: 'monospace' }}>{Math.floor(player.rating)}</td>
                  <td className="rk-td rk-rankCell">
                    <span className={`elo-aura ${idx === 0 ? 'fire' : ''}`} style={{ '--aura': auraStrength }}>
                    <span style={rankTextStyle(color)}>
                      {getRankImage(rank)} <span>{rank}</span>
                    </span>
                  </span>
                  {idx === 0 && auraStrength > 0.3 && <span className="elo-sparks" />}
                  </td>
                  <td className="rk-td">{danOrKyu}</td>
                  <td className="rk-td">{player.win}</td>
                  <td className="rk-td">{player.loss}</td>
                  <td className="rk-td" style={winRateStyle}>{winRate}%</td>
                  <td className="rk-td" title={`기본 ${player.baseRating} → 현재 ${Math.floor(player.rating)}`}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: player.delta >= 0 ? '#b91c1c' : '#1d4ed8' }}>
                      {player.delta >= 0 ? '+' : ''}{Math.floor(player.delta)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ===== 랭크 기준표 ===== */}
        <h2 className="arena-title" id="rank-criteria-title">랭크 기준표</h2>
        <table className="rk-table" role="table" aria-labelledby="rank-criteria-title">
          <caption className="sr-only">랭크별 조건</caption>
          <thead>
            <tr>
              <th className="rk-th" scope="col">사진</th>
              <th className="rk-th" scope="col">랭크</th>
              <th className="rk-th" scope="col">조건</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['챌린저','다이아 랭크 중 1위'],
              ['그랜드마스터','다이아 랭크 중 2위 ~ 4위'],
              ['마스터','다이아 랭크 중 5위 ~ 10위'],
              ['다이아','레이팅 1576 이상'],
              ['플래티넘','레이팅 1551 ~ 1575'],
              ['골드','레이팅 1526 ~ 1550'],
              ['실버','레이팅 1501 ~ 1525'],
              ['브론즈','레이팅 1500 이하'],
            ].map(([name, cond])=>(
              <tr key={name} className="rk-row">
                <td className="rk-td">
                  <img
                    loading="lazy"
                    src={`/images/${name}.jpg`}
                    alt={name}
                    style={rankImageLargeStyle}
                    onError={(e)=>{e.currentTarget.style.display='none'}}
                  />
                </td>
                <td className="rk-td"><strong>{name}</strong></td>
                <td className="rk-td">{cond}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== 풀리그 매트릭스 ===== */}
        <h2 className="arena-title" id="league-matrix-title">풀리그 대국 현황</h2>
        {loadingMatrix ? (
          <div aria-live="polite" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>대국 현황 로딩 중...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="rk-table rk-matrix" style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%' }} role="table" aria-labelledby="league-matrix-title">
              <caption className="sr-only">선수 간 대국 완료 여부</caption>
              <thead>
                <tr>
                  <th className="rk-th" scope="col" style={{ position:'sticky', left:0, zIndex:2, background:'#fff5f5', color:'#5f0d0d' }}>선수명</th>
                  {players.map((p) => (
                    <th key={p.id} className="rk-th" scope="col" title={p.playerName} style={{ minWidth: 70 }}>
                      {p.playerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((rowPlayer, rowIdx) => (
                  <tr key={rowPlayer.id} className="rk-row">
                    <td
                      className="rk-td"
                      style={{
                        fontWeight: 800,
                        position: 'sticky',
                        left: 0,
                        background: getRowBackground(rowIdx),
                        zIndex: 1,
                      }}
                    >
                      {rowPlayer.playerName}
                    </td>
                    {players.map((colPlayer) => {
                      const val = matchMatrix[rowPlayer.playerName]?.[colPlayer.playerName] || 'X';
                      return (
                        <td
                          key={colPlayer.id}
                          className="rk-td"
                          data-val={val}
                          title={ val === 'O' ? '대국 완료' : rowPlayer.playerName === colPlayer.playerName ? '-' : '대국 미완료' }
                          style={{ fontWeight: val === 'O' ? 800 : 'normal' }}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==== 전투 리플레이 모달 ==== */}
      {modalOpen && focusPlayer && (
        <div className="rk-backdrop" role="dialog" aria-modal="true" aria-label="전투 리플레이">
          <div className="rk-modal">
            <button className="rk-close" onClick={closeModal} aria-label="닫기" autoFocus>✕</button>
            <h3 className="rk-title">⚔️ 전투 리플레이 — {focusPlayer.playerName}</h3>

            {/* VS 배너 */}
            <div className="rk-banner">
              <span className="rk-vs">최근 대국 로그</span>
            </div>

            {/* 향로 + 연기 */}
            <div className="rk-incense left">
              <div className="rk-smoke rk-smoke-1 rk-anim"></div>
            </div>
            <div className="rk-incense right">
              <div className="rk-smoke rk-smoke-2 rk-anim"></div>
            </div>

            {/* 로그 목록 */}
            {recentLogs.length === 0 ? (
              <div style={{ textAlign:'center', color:'#fecaca', padding:'10px 0' }}>해당 시즌에 전투 로그가 없습니다.</div>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="rk-log">
                  <div className={`rk-badge ${log.isWin ? 'win' : 'lose'}`}>
                    {log.isWin ? 'WIN' : 'LOSE'}
                  </div>
                  <div style={{ fontWeight:900 }}>{focusPlayer.playerName}</div>
                  <div className="rk-vs">vs</div>
                  <div style={{ fontWeight:900 }}>{log.opponent}</div>
                  <div className="rk-elo">
                    {log.myElo ? `ELO ${Math.floor(log.myElo)}` : 'ELO -'}
                    {log.oppElo ? ` / OP ${Math.floor(log.oppElo)}` : ''}
                  </div>
                  <div style={{ opacity:.85 }}>{log.dateTxt}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ranking;
