import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useSeason } from '../../contexts/SeasonContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);
const db = getFirestore();

/* =========================
   Lab 스타일 (애니메이션/접근성 대응)
   ========================= */
const labCss = `
:root{
  --lab-bg:#0b0d12; --lab-panel:#0f1320; --lab-glass:rgba(26,34,56,.55);
  --lab-border:rgba(151,180,255,.15); --ink:#e8ecf6; --muted:#94a3b8;
  --accent:#7dd3fc; --accent-deep:#38bdf8; --grid:#1b2338;
  --good:#10b981; --warn:#f59e0b; --bad:#ef4444; --focus:#60a5fa;
}
@media (prefers-color-scheme: light){
  :root{
    --lab-bg:#f3f6fb; --lab-panel:#ffffff; --lab-glass:rgba(255,255,255,.8);
    --lab-border:rgba(30,41,59,.12); --ink:#0f172a; --muted:#475569;
    --accent:#0ea5e9; --accent-deep:#2563eb; --grid:#e2e8f0;
  }
}
@media (prefers-reduced-motion: reduce){
  .lab-anim, .lab-shine, .lab-pulse, .lab-scan, .lab-rise { animation: none !important; transition: none !important; }
}
.lab-page{
  min-height:100vh; padding: 28px 18px 40px; color: var(--ink);
  background: radial-gradient(1000px 500px at 50% -10%, rgba(56,189,248,.18), transparent 60%),
              linear-gradient(180deg, var(--lab-bg), #07090d);
  position: relative; overflow-x: hidden;
}
.lab-page::before{
  content:""; position: fixed; inset:0; pointer-events:none; opacity:.4;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 48px 48px, 48px 48px;
  mask-image: radial-gradient(1000px 500px at 50% -10%, #000 60%, transparent 100%);
}
.lab-page::after{
  content:""; position: fixed; inset:0; pointer-events:none; opacity:.06;
  background: repeating-linear-gradient(180deg, #0000 0 2px, #000 2.6px 3px);
  animation: scan 12s linear infinite;
}
@keyframes scan{ 0%{ transform: translateY(-10px) } 100%{ transform: translateY(10px) } }
.lab-container{
  max-width: 980px; margin: 0 auto; background: var(--lab-glass);
  backdrop-filter: blur(8px); border: 1px solid var(--lab-border);
  border-radius: 16px; box-shadow: 0 30px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04) inset;
  padding: 22px 20px; position: relative;
}
.lab-header{ display:flex; align-items:center; gap:12px; justify-content:center; margin: 2px 0 12px; }
.lab-title{ font-size: 24px; font-weight: 900; letter-spacing: .4px; text-align:center; text-shadow: 0 1px 0 rgba(255,255,255,.15); }
.lab-sub{ font-size: 12px; color: var(--muted); letter-spacing: .2px; }
.lab-divider{
  height: 2px; width: min(560px, 92%); margin: 12px auto 18px;
  background: linear-gradient(90deg, transparent 0 6%, var(--accent) 6% 94%, transparent 94% 100%);
  filter: drop-shadow(0 0 10px rgba(56,189,248,.35));
}
.lab-grid{ display:grid; gap: 14px; grid-template-columns: 1fr; }
@media(min-width: 900px){ .lab-grid{ grid-template-columns: 1.1fr .9fr; } }
.lab-panel{
  background: linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03));
  border: 1px solid var(--lab-border); border-radius: 14px;
  padding: 16px 14px; box-shadow: 0 10px 30px rgba(0,0,0,.18);
  position: relative; overflow: hidden;
}
.lab-form{ display:grid; gap: 10px; grid-template-columns: repeat(2, 1fr); }
@media(max-width: 640px){ .lab-form{ grid-template-columns: 1fr; } }
.lab-input{
  width:100%; background: rgba(255,255,255,.06); color: var(--ink);
  border: 1.5px solid var(--lab-border); border-radius: 12px;
  padding: 12px 14px; font-size: 15px; outline:none;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.lab-input:focus{ border-color: var(--focus); box-shadow: 0 0 0 3px rgba(96,165,250,.18); background: rgba(255,255,255,.12); }
.lab-btn{
  grid-column: 1 / -1; display:inline-flex; align-items:center; justify-content:center; gap:8px;
  background: linear-gradient(180deg, #111827, #0b1020);
  color:#e6f0ff; border:none; border-radius: 12px; padding: 12px 16px; font-weight: 800; letter-spacing:.2px; cursor:pointer;
  box-shadow: 0 16px 36px rgba(2,6,23,.45); position: relative; overflow:hidden;
  transition: transform .12s ease, box-shadow .2s ease;
}
.lab-btn:hover{ transform: translateY(-1px); box-shadow: 0 22px 48px rgba(2,6,23,.6); }
.lab-shine::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  background: linear-gradient(120deg, transparent 0 30%, rgba(255,255,255,.16) 40% 52%, transparent 60% 100%);
  transform: translateX(-120%); animation: shine 2.8s ease-in-out infinite;
}
@keyframes shine{ 0%{ transform: translateX(-120%) } 55%{ transform: translateX(110%) } 100%{ transform: translateX(110%) } }
.lab-section{ font-weight:900; color: var(--ink); display:flex; align-items:center; gap:8px; margin: 4px 0 10px; }
.lab-chart{
  background: radial-gradient(800px 300px at 20% -20%, rgba(125,211,252,.12), transparent 60%),
              radial-gradient(800px 300px at 80% 120%, rgba(56,189,248,.08), transparent 60%),
              linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  border: 1px solid var(--lab-border); border-radius: 14px; padding: 12px 10px;
}
.lab-kpis{ display:grid; gap: 12px; grid-template-columns: repeat(3, 1fr); }
@media(max-width: 740px){ .lab-kpis{ grid-template-columns: 1fr; } }
.lab-gauge{
  position:relative; display:flex; align-items:center; gap:12px;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  border: 1px solid var(--lab-border); border-radius: 12px; padding: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.16);
}
.gauge-ring{
  --val: 0; width: 64px; height: 64px; border-radius: 9999px;
  background: conic-gradient(var(--gcolor) calc(var(--val)*1%), rgba(255,255,255,.08) 0),
             radial-gradient(circle at 50% 50%, rgba(0,0,0,.25), transparent 60%);
  display:grid; place-items:center; transition: background .35s ease;
  box-shadow: inset 0 0 12px rgba(0,0,0,.4), 0 0 16px rgba(56,189,248,.25);
}
.gauge-val{ font-weight:900; font-size: 12px; color: var(--ink); text-shadow: 0 1px 0 rgba(0,0,0,.3); }
.gauge-meta{ display:flex; flex-direction:column; gap:2px; }
.gauge-title{ font-weight:800; }
.gauge-sub{ font-size:12px; color: var(--muted); }
.lab-note{ margin-top: 10px; padding: 12px; background: linear-gradient(180deg, rgba(56,189,248,.08), rgba(56,189,248,.03)); border: 1px dashed var(--lab-border); border-radius: 12px; color: var(--muted); }
.lab-caption{ font-size: 12px; color: var(--muted); text-align:right; margin-top: 6px; }
`;

const BASE_ELO = 1500;

/* ===== 유틸: 이름 정규화 ===== */
const normalizeName = (s) => (s || '').trim();
const normalizeKey = (s) => normalizeName(s).toLowerCase();

/* 게이지 */
const Gauge = ({ label, sub, value }) => {
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)));
  const gcolor = pct >= 66 ? 'var(--good)' : pct >= 40 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div className="lab-gauge" role="group" aria-label={`${label} 지표`}>
      <div className="gauge-ring" style={{ ['--val']: pct, ['--gcolor']: gcolor }} aria-label={`${label} 게이지`}>
        <span className="gauge-val" aria-live="polite">{pct}%</span>
      </div>
      <div className="gauge-meta">
        <div className="gauge-title">{label}</div>
        <div className="gauge-sub">{sub}</div>
      </div>
    </div>
  );
};

/* 안전한 차트 데이터 */
const makeSafeChartData = (labels, data, labelText, lineColor, fillColor) => ({
  labels: Array.isArray(labels) ? labels : [],
  datasets: [{
    label: labelText,
    data: (Array.isArray(data) ? data : []).map(v => (Number.isFinite(Number(v)) ? Number(v) : null)),
    borderColor: lineColor,
    backgroundColor: fillColor,
    borderWidth: 2,
    tension: 0.3,
    fill: true,
    pointRadius: 2.5,
    pointHoverRadius: 5,
  }],
});

/* 시즌 내 특정 선수의 날짜별 ELO 히스토리 */
async function fetchSeasonEloHistoryByPlayer(player, seasonIdArg) {
  if (!player || !seasonIdArg) return [];
  try {
    const matchesRef = collection(db, 'matches');
    const [winnerSnap, loserSnap] = await Promise.all([
      getDocs(query(matchesRef, where('seasonId','==',seasonIdArg), where('status','==','approve'), where('winner','==',player))),
      getDocs(query(matchesRef, where('seasonId','==',seasonIdArg), where('status','==','approve'), where('loser','==',player))),
    ]);

    const rows = [...winnerSnap.docs, ...loserSnap.docs]
      .map(d => {
        const m = d.data();
        const raw = m.date || m.createdAt;
        const at = raw?.toDate ? raw.toDate() : raw;
        const elo = m.winner === player ? m.winnerELO : (m.loser === player ? m.loserELO : null);
        return at && elo != null ? { at, elo: Number(elo) } : null;
      })
      .filter(Boolean)
      .sort((a,b) => a.at - b.at);

    return rows;
  } catch (e) {
    console.error('fetchSeasonEloHistoryByPlayer error:', e);
    return [];
  }
}

/* 시즌 기준 최신 ELO: playerStats 우선, 없으면 matches 최신 경기로 추론 */
const getLatestRatingInSeason = async (player, season) => {
  const playerRaw = normalizeName(player);
  const playerLower = normalizeKey(player);
  if (!playerLower || !season) return null;

  try {
    // 1) playerStats 조회
    const statsRef = collection(db, 'playerStats');
    // ⚠︎ playerNameLower 필드가 있다면 아래 줄을 사용하세요.
    // const statsSnap = await getDocs(query(statsRef, where('seasonId','==',season), where('playerNameLower','==',playerLower)));
    const statsSnap = await getDocs(query(statsRef, where('seasonId','==',season), where('playerName','==',playerRaw)));
    if (!statsSnap.empty) {
      const s = statsSnap.docs[0].data();
      const val = Number(s.elo);
      if (Number.isFinite(val)) return val;
    }

    // 2) 없으면 matches로부터 가장 최근 경기의 본인 ELO 추론
    const matchesRef = collection(db, 'matches');
    const [winSnap, loseSnap] = await Promise.all([
      getDocs(query(matchesRef, where('seasonId','==',season), where('status','==','approve'), where('winner','==',playerRaw))),
      getDocs(query(matchesRef, where('seasonId','==',season), where('status','==','approve'), where('loser','==',playerRaw))),
    ]);

    const rows = [...winSnap.docs, ...loseSnap.docs]
      .map(d => {
        const m = d.data();
        const raw = m.date || m.createdAt;
        const at = raw?.toDate ? raw.toDate() : raw;
        const elo = m.winner === playerRaw ? m.winnerELO : (m.loser === playerRaw ? m.loserELO : null);
        return at && Number.isFinite(Number(elo)) ? { at, elo: Number(elo) } : null;
      })
      .filter(Boolean)
      .sort((a,b) => a.at - b.at);

    if (rows.length > 0) return rows[rows.length - 1].elo;

    return null;
  } catch (err) {
    console.error('getLatestRatingInSeason error:', err);
    return null;
  }
};

const LeagueAnalysis = () => {
  // 시즌 컨텍스트
  const seasonCtx = useSeason() || {};
  const seasonId = seasonCtx.activeSeasonId || 'S1';
  const seasons = Array.isArray(seasonCtx.seasons) ? seasonCtx.seasons : [];
  const currSeasonName = seasons.find((s) => s.id === seasonId)?.name || seasonId;

  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // 선택 시즌 (예상 승률 계산도 이 값 기준)
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasonId);

  // 현재 시즌 내 ELO 변동
  const [eloHistorySeason, setEloHistorySeason] = useState({ labels: [], data: [] });
  // 시즌별 최종 ELO
  const [eloBySeason, setEloBySeason] = useState({ labels: [], data: [] });
  // 선택 시즌 내 ELO 변동
  const [eloHistorySelectedSeason, setEloHistorySelectedSeason] = useState({ labels: [], data: [] });

  // KPI: 선택 시즌 기준 현재 예상 승률
  const [winProbability, setWinProbability] = useState(null);

  /* 현재 시즌 내 선수의 ELO 시리즈 */
  useEffect(() => {
    const buildSeasonEloSeries = async () => {
      const name = normalizeName(playerName);
      if (!name) return setEloHistorySeason({ labels: [], data: [] });
      try {
        const rows = await fetchSeasonEloHistoryByPlayer(name, seasonId);
        setEloHistorySeason({ labels: rows.map(r => r.at.toLocaleDateString()), data: rows.map(r => r.elo) });
      } catch (e) {
        console.error('buildSeasonEloSeries error:', e);
        setEloHistorySeason({ labels: [], data: [] });
      }
    };
    buildSeasonEloSeries();
  }, [playerName, seasonId]);

  /* 시즌별 최종 ELO 시계열 */
  useEffect(() => {
    const buildEloAcrossSeasons = async () => {
      const name = normalizeName(playerName);
      if (!name) return setEloBySeason({ labels: [], data: [] });

      try {
        const statsRef = collection(db, 'playerStats');
        // ⚠︎ playerNameLower 필드가 있다면 아래 라인을 권장:
        // const snap = await getDocs(query(statsRef, where('playerNameLower','==', normalizeKey(name))));
        const snap = await getDocs(query(statsRef, where('playerName','==', name)));

        const rows = snap.docs.map(d => ({ seasonId: d.data().seasonId, elo: Number(d.data().elo ?? BASE_ELO) }));

        const seasonOrder = [...seasons].sort((a,b) => {
          const ak = a.startAt?.toMillis?.() ?? 0;
          const bk = b.startAt?.toMillis?.() ?? 0;
          if (ak === bk) return (a.name || a.id).localeCompare(b.name || b.id);
          return ak - bk;
        });

        const byId = {}; rows.forEach(r => { byId[r.seasonId] = r.elo; });

        if (seasonOrder.length > 0) {
          setEloBySeason({
            labels: seasonOrder.map(s => s.name || s.id),
            data: seasonOrder.map(s => Number.isFinite(Number(byId[s.id])) ? Number(byId[s.id]) : null),
          });
        } else {
          const unique = Array.from(new Set(rows.map(r => r.seasonId))).sort();
          setEloBySeason({
            labels: unique,
            data: unique.map(id => {
              const v = rows.find(r => r.seasonId === id)?.elo;
              return Number.isFinite(Number(v)) ? Number(v) : null;
            }),
          });
        }
      } catch (e) {
        console.error('buildEloAcrossSeasons error:', e);
        setEloBySeason({ labels: [], data: [] });
      }
    };
    buildEloAcrossSeasons();
  }, [playerName, seasons]);

  /* 선택 시즌 내 선수 ELO 시리즈 */
  useEffect(() => {
    const buildSelectedSeasonEloSeries = async () => {
      const name = normalizeName(playerName);
      if (!name || !selectedSeasonId) return setEloHistorySelectedSeason({ labels: [], data: [] });
      try {
        const rows = await fetchSeasonEloHistoryByPlayer(name, selectedSeasonId);
        setEloHistorySelectedSeason({ labels: rows.map(r => r.at.toLocaleDateString()), data: rows.map(r => r.elo) });
      } catch (e) {
        console.error('buildSelectedSeasonEloSeries error:', e);
        setEloHistorySelectedSeason({ labels: [], data: [] });
      }
    };
    buildSelectedSeasonEloSeries();
  }, [playerName, selectedSeasonId]);

  /* KPI: 선택 시즌 기준 현재 예상 승률(숫자만) */
  const calculateWinProbability = async () => {
    const me = normalizeName(playerName);
    const opp = normalizeName(opponentName);
    if (!me || !opp) {
      alert('선수 이름과 상대방 이름을 모두 입력해주세요.');
      return;
    }

    const season = selectedSeasonId || seasonId;
    const [myElo, oppElo] = await Promise.all([
      getLatestRatingInSeason(me, season),
      getLatestRatingInSeason(opp, season),
    ]);

    if (myElo == null || oppElo == null) {
      console.warn('ELO missing:', { me, opp, season, myElo, oppElo });
      alert('선수 또는 상대방의 최신 레이팅을 찾을 수 없습니다.');
      setWinProbability(null);
      return;
    }

    const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
    setWinProbability((expected * 100).toFixed(2));
  };

  // 공통 차트 옵션
  const makeLineOptions = (yLabel = 'ELO', yData = []) => {
    const numeric = (Array.isArray(yData) ? yData : []).filter(v => typeof v === 'number' && !Number.isNaN(v));
    const hasData = numeric.length > 0;
    return {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { color: 'var(--ink)' } },
        title: { display: false },
        tooltip: { intersect: false, mode: 'index' },
      },
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: { title: { display: true, text: '날짜 / 시즌', color: 'var(--muted)' }, ticks: { color: 'var(--ink)' }, grid: { color: 'rgba(148,163,184,.15)' } },
        y: {
          title: { display: true, text: yLabel, color: 'var(--muted)' },
          ticks: { color: 'var(--ink)' },
          grid: { color: 'rgba(148,163,184,.15)' },
          min: hasData ? Math.min(...numeric) - (yLabel === 'ELO' ? 50 : 0) : undefined,
          max: hasData ? Math.max(...numeric) + (yLabel === 'ELO' ? 50 : 0) : undefined,
        },
      },
    };
  };

  // 메모된 데이터
  const seasonChartData = useMemo(() =>
    makeSafeChartData(eloHistorySeason.labels, eloHistorySeason.data, `${playerName} - ${currSeasonName}`, '#38bdf8', 'rgba(56,189,248,0.15)'),
    [eloHistorySeason.labels, eloHistorySeason.data, playerName, currSeasonName]
  );

  const seasonsChartData = useMemo(() =>
    makeSafeChartData(eloBySeason.labels, eloBySeason.data, `${playerName} - 시즌별 최종 ELO`, '#60a5fa', 'rgba(96,165,250,0.15)'),
    [eloBySeason.labels, eloBySeason.data, playerName]
  );

  const selectedSeasonChartData = useMemo(() => {
    const name = seasons.find(s => s.id === selectedSeasonId)?.name || selectedSeasonId;
    return makeSafeChartData(eloHistorySelectedSeason.labels, eloHistorySelectedSeason.data, `${playerName} - ${name}`, '#22d3ee', 'rgba(34,211,238,0.15)');
  }, [eloHistorySelectedSeason.labels, eloHistorySelectedSeason.data, playerName, selectedSeasonId, seasons]);

  // KPI 보조 값 (현재 시즌 기준)
  const stability = useMemo(() => {
    const d = eloHistorySeason.data;
    if (!d || d.length < 3) return 50;
    const mean = d.reduce((a, b) => a + b, 0) / d.length;
    const variance = d.reduce((s, v) => s + (v - mean) ** 2, 0) / d.length;
    const std = Math.sqrt(variance);
    const score = Math.max(0, Math.min(100, 100 - std));
    return Number(score.toFixed(0));
  }, [eloHistorySeason.data]);

  const seasonCoverage = useMemo(() => {
    const n = eloHistorySeason.data?.length || 0;
    const pct = Math.max(0, Math.min(100, (n / 10) * 100)); // 10회 기준 100%
    return Number(pct.toFixed(0));
  }, [eloHistorySeason.data]);

  return (
    <div className="lab-page">
      <style>{labCss}</style>

      <div className="lab-container lab-rise">
        <div className="lab-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 3h4l1 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l1-4z" stroke="var(--accent)" strokeWidth="1.2"/>
          </svg>
          <div>
            <div className="lab-title">ELO 변동 분석실</div>
            <div className="lab-sub">Season • {currSeasonName}</div>
          </div>
        </div>
        <div className="lab-divider"></div>

        <div className="lab-grid">
          {/* 좌: 입력 & KPI */}
          <section className="lab-panel">
            <div className="lab-section">🎯 분석 대상 입력</div>
            <div className="lab-form" role="form" aria-label="분석 입력 폼">
              <input className="lab-input" type="text" placeholder="선수 이름 입력" value={playerName} onChange={(e) => setPlayerName(e.target.value)} aria-label="선수 이름" />
              <input className="lab-input" type="text" placeholder="상대방 이름 입력" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} aria-label="상대 이름" />
              <button className="lab-btn lab-shine" onClick={calculateWinProbability}>
                예상 승률 계산 (선택 시즌 기준)
              </button>
            </div>

            {winProbability !== null && (
              <div className="lab-kpis" style={{ marginTop: 14 }}>
                <Gauge label="예상 승률" sub="현재 ELO 비교" value={Number(winProbability)} />
                <Gauge label="안정성" sub="표준편차 기반" value={stability} />
                <Gauge label="데이터 커버리지" sub="표본량 추정" value={seasonCoverage} />
              </div>
            )}

            {winProbability !== null && (
              <div className="lab-note" role="note">
                예상 승률은 1 / (1 + 10^((상대 ELO - 내 ELO)/400)) 공식으로 계산된 참고 지표입니다.
              </div>
            )}
          </section>

          {/* 우: 현재 시즌 차트 */}
          <section className="lab-panel">
            <div className="lab-section">📈 현재 시즌 ELO 변동</div>
            <div className="lab-chart">
              {seasonChartData.labels.length > 0 ? (
                <Line data={seasonChartData} options={makeLineOptions('ELO', eloHistorySeason.data)} />
              ) : (
                <div className="lab-note">선수 이름을 입력하면 시즌 내 변동 추이가 표시됩니다.</div>
              )}
            </div>
            <div className="lab-caption">상단 라인: 최근 데이터일수록 색이 더 선명하게 보입니다.</div>
          </section>
        </div>

        {/* 하단: 선택 시즌 날짜별 ELO 변동 */}
        <section className="lab-panel" style={{ marginTop: 14 }}>
          <div className="lab-section">📅 시즌 내 ELO 변동 (날짜별)</div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <label htmlFor="seasonSelect" className="lab-caption" style={{ margin: 0 }}>시즌 선택</label>
            <select
              id="seasonSelect"
              className="lab-input"
              style={{ maxWidth: 260 }}
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              aria-label="시즌 선택"
            >
              {seasons.length > 0
                ? seasons
                    .slice()
                    .sort((a,b) => {
                      const ak = a.startAt?.toMillis?.() ?? 0;
                      const bk = b.startAt?.toMillis?.() ?? 0;
                      if (ak === bk) return (a.name || a.id).localeCompare(b.name || b.id);
                      return ak - bk;
                    })
                    .map((s) => <option key={s.id} value={s.id}>{s.name || s.id}</option>)
                : <option value={selectedSeasonId}>{selectedSeasonId}</option>
              }
            </select>
          </div>

          <div className="lab-chart">
            {selectedSeasonChartData.labels.length > 0 ? (
              <Line data={selectedSeasonChartData} options={makeLineOptions('ELO', eloHistorySelectedSeason.data)} />
            ) : (
              <div className="lab-note">선수를 입력하고 시즌을 선택하면 해당 시즌의 날짜별 변동이 표시됩니다.</div>
            )}
          </div>
          <div className="lab-caption">선택한 시즌의 대국 순서대로 ELO 변화를 시간축으로 표시합니다.</div>
        </section>

        {/* 하단: 시즌별 최종 ELO 추이 */}
        <section className="lab-panel" style={{ marginTop: 14 }}>
          <div className="lab-section">🧪 시즌별 최종 ELO 추이</div>
          <div className="lab-chart">
            {seasonsChartData.labels.length > 0 ? (
              <Line data={seasonsChartData} options={makeLineOptions('ELO', eloBySeason.data)} />
            ) : (
              <div className="lab-note">선수의 시즌별 통계가 있으면 여기서 비교됩니다.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeagueAnalysis;
