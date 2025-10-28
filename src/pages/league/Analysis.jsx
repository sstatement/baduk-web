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
import { useSeason } from '../../contexts/SeasonContext'; // ★ 시즌 컨텍스트

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);
const db = getFirestore();

/* =========================
   Lab 스타일 (애니메이션/접근성 대응)
   ========================= */
const labCss = `
:root{
  --lab-bg:#0b0d12;
  --lab-panel:#0f1320;
  --lab-glass:rgba(26,34,56,.55);
  --lab-border:rgba(151,180,255,.15);
  --ink:#e8ecf6;
  --muted:#94a3b8;
  --accent:#7dd3fc;
  --accent-deep:#38bdf8;
  --grid:#1b2338;
  --good:#10b981;
  --warn:#f59e0b;
  --bad:#ef4444;
  --focus:#60a5fa;
}

@media (prefers-color-scheme: light){
  :root{
    --lab-bg:#f3f6fb;
    --lab-panel:#ffffff;
    --lab-glass:rgba(255,255,255,.8);
    --lab-border:rgba(30,41,59,.12);
    --ink:#0f172a;
    --muted:#475569;
    --accent:#0ea5e9;
    --accent-deep:#2563eb;
    --grid:#e2e8f0;
  }
}

@media (prefers-reduced-motion: reduce){
  .lab-anim, .lab-shine, .lab-pulse, .lab-scan, .lab-rise { animation: none !important; transition: none !important; }
}

/* 페이지 배경 */
.lab-page{
  min-height:100vh;
  padding: 28px 18px 40px;
  color: var(--ink);
  background:
    radial-gradient(1000px 500px at 50% -10%, rgba(56,189,248,.18), transparent 60%),
    linear-gradient(180deg, var(--lab-bg), #07090d);
  position: relative;
  overflow-x: hidden;
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

/* 컨테이너 */
.lab-container{
  max-width: 980px; margin: 0 auto;
  background: var(--lab-glass);
  backdrop-filter: blur(8px);
  border: 1px solid var(--lab-border);
  border-radius: 16px;
  box-shadow: 0 30px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04) inset;
  padding: 22px 20px;
  position: relative;
}

/* 헤더 */
.lab-header{
  display:flex; align-items:center; gap:12px; justify-content:center;
  margin: 2px 0 12px;
}
.lab-title{ font-size: 24px; font-weight: 900; letter-spacing: .4px; text-align:center; text-shadow: 0 1px 0 rgba(255,255,255,.15); }
.lab-sub{ font-size: 12px; color: var(--muted); letter-spacing: .2px; }
.lab-divider{
  height: 2px; width: min(560px, 92%); margin: 12px auto 18px;
  background: linear-gradient(90deg, transparent 0 6%, var(--accent) 6% 94%, transparent 94% 100%);
  filter: drop-shadow(0 0 10px rgba(56,189,248,.35));
}

/* 그리드 */
.lab-grid{ display:grid; gap: 14px; grid-template-columns: 1fr; }
@media(min-width: 900px){ .lab-grid{ grid-template-columns: 1.1fr .9fr; } }

/* 패널 */
.lab-panel{
  background: linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03));
  border: 1px solid var(--lab-border);
  border-radius: 14px;
  padding: 16px 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,.18);
  position: relative; overflow: hidden;
}

/* 폼 */
.lab-form{ display:grid; gap: 10px; grid-template-columns: repeat(2, 1fr); }
@media(max-width: 640px){ .lab-form{ grid-template-columns: 1fr; } }
.lab-input{
  width:100%; background: rgba(255,255,255,.06); color: var(--ink);
  border: 1.5px solid var(--lab-border); border-radius: 12px;
  padding: 12px 14px; font-size: 15px; outline:none;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.lab-input:focus{ border-color: var(--focus); box-shadow: 0 0 0 3px rgba(96,165,250,.18); background: rgba(255,255,255,.12); }

/* 버튼 */
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

/* 섹션 제목 */
.lab-section{ font-weight:900; color: var(--ink); display:flex; align-items:center; gap:8px; margin: 4px 0 10px; }

/* 차트 카드 */
.lab-chart{
  background: radial-gradient(800px 300px at 20% -20%, rgba(125,211,252,.12), transparent 60%),
              radial-gradient(800px 300px at 80% 120%, rgba(56,189,248,.08), transparent 60%),
              linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  border: 1px solid var(--lab-border); border-radius: 14px; padding: 12px 10px;
}

/* KPI */
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

/* 알림/캡션 */
.lab-note{ margin-top: 10px; padding: 12px; background: linear-gradient(180deg, rgba(56,189,248,.08), rgba(56,189,248,.03)); border: 1px dashed var(--lab-border); border-radius: 12px; color: var(--muted); }
.lab-caption{ font-size: 12px; color: var(--muted); text-align:right; margin-top: 6px; }
`;

const BASE_ELO = 1500;

/* 게이지 컴포넌트 */
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

/* 안전한 차트 데이터 빌더: 항상 datasets 존재 보장 */
const makeSafeChartData = (labels, data, labelText, lineColor, fillColor) => {
  const safeLabels = Array.isArray(labels) ? labels : [];
  const safeData = Array.isArray(data) ? data : [];
  return {
    labels: safeLabels,
    datasets: [
      {
        label: labelText,
        data: safeData.map((v) => (Number.isFinite(Number(v)) ? Number(v) : null)),
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2.5,
        pointHoverRadius: 5,
      },
    ],
  };
};

const LeagueAnalysis = () => {
  // ★ 시즌 정보(없어도 안전)
  const seasonCtx = useSeason() || {};
  const seasonId = seasonCtx.activeSeasonId || 'S1';
  const seasons = Array.isArray(seasonCtx.seasons) ? seasonCtx.seasons : [];
  const currSeasonName = seasons.find((s) => s.id === seasonId)?.name || seasonId;

  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // 1) 현재 시즌 내 ELO 변동
  const [eloHistorySeason, setEloHistorySeason] = useState({ labels: [], data: [] });
  // 2) 시즌별 최종 ELO
  const [eloBySeason, setEloBySeason] = useState({ labels: [], data: [] });

  const [winProbability, setWinProbability] = useState(null);

  // 현재 시즌 + 승인된 경기에서 플레이어 매치 가져오기
  const getMatchesByPlayerInSeason = async (player) => {
    if (!player) return [];
    try {
      const matchesRef = collection(db, 'matches');

      const qWinner = query(
        matchesRef, where('seasonId', '==', seasonId),
        where('status', '==', 'approve'), where('winner', '==', player)
      );
      const qLoser = query(
        matchesRef, where('seasonId', '==', seasonId),
        where('status', '==', 'approve'), where('loser', '==', player)
      );

      const [winnerSnap, loserSnap] = await Promise.all([getDocs(qWinner), getDocs(qLoser)]);
      const winnerMatches = winnerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const loserMatches = loserSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return [...winnerMatches, ...loserMatches];
    } catch (error) {
      console.error('getMatchesByPlayerInSeason error:', error);
      return [];
    }
  };

  // 1) 현재 시즌 내 ELO 변동 시리즈 구성
  useEffect(() => {
    const buildSeasonEloSeries = async () => {
      if (!playerName) {
        setEloHistorySeason({ labels: [], data: [] });
        return;
      }
      try {
        const matches = await getMatchesByPlayerInSeason(playerName);

        const points = matches
          .map((m) => {
            const raw = m.date || m.createdAt;
            const at = raw?.toDate ? raw.toDate() : raw;
            if (!at) return null;
            const elo =
              m.winner === playerName ? m.winnerELO :
              m.loser === playerName ? m.loserELO : null;
            if (elo == null) return null;
            return { at, elo: Number(elo) };
          })
          .filter(Boolean)
          .sort((a, b) => a.at - b.at);

        setEloHistorySeason({
          labels: points.map((p) => p.at.toLocaleDateString()),
          data: points.map((p) => Number(p.elo)).filter((v) => Number.isFinite(v)),
        });
      } catch (e) {
        console.error('buildSeasonEloSeries error:', e);
        setEloHistorySeason({ labels: [], data: [] });
      }
    };

    buildSeasonEloSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, seasonId]);

  // 2) 시즌별 최종 ELO(= playerStats.elo) 시계열
  const buildEloAcrossSeasons = async (player) => {
    if (!player) {
      setEloBySeason({ labels: [], data: [] });
      return;
    }
    try {
      const statsRef = collection(db, 'playerStats');
      const snap = await getDocs(query(statsRef, where('playerName', '==', player)));

      const rows = snap.docs.map((d) => {
        const s = d.data();
        return { seasonId: s.seasonId, elo: Number(s.elo ?? BASE_ELO) };
      });

      // seasons 컨텍스트 기준 라벨/정렬
      const seasonOrder = [...seasons].sort((a, b) => {
        const aKey = a.startAt?.toMillis?.() ?? 0;
        const bKey = b.startAt?.toMillis?.() ?? 0;
        if (aKey === bKey) return (a.name || a.id).localeCompare(b.name || b.id);
        return aKey - bKey;
      });

      const bySeasonId = {};
      rows.forEach((r) => { bySeasonId[r.seasonId] = r.elo; });

      if (seasonOrder.length > 0) {
        const labels = seasonOrder.map((s) => s.name || s.id);
        const data = seasonOrder.map((s) => {
          const v = bySeasonId[s.id];
          return Number.isFinite(Number(v)) ? Number(v) : null;
        });
        setEloBySeason({ labels, data });
      } else {
        const uniqueIds = Array.from(new Set(rows.map((r) => r.seasonId))).sort();
        setEloBySeason({
          labels: uniqueIds,
          data: uniqueIds.map((sid) => {
            const v = rows.find((r) => r.seasonId === sid)?.elo;
            return Number.isFinite(Number(v)) ? Number(v) : null;
          }),
        });
      }
    } catch (e) {
      console.error('buildEloAcrossSeasons error:', e);
      setEloBySeason({ labels: [], data: [] });
    }
  };

  useEffect(() => {
    buildEloAcrossSeasons(playerName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, seasons]);

  // 현재 시즌 최신 레이팅
  const getLatestRatingInActiveSeason = async (player) => {
    if (!player) return null;
    try {
      const statsRef = collection(db, 'playerStats');
      const snap = await getDocs(
        query(statsRef, where('seasonId', '==', seasonId), where('playerName', '==', player))
      );
      if (snap.empty) return null;
      const s = snap.docs[0].data();
      const val = Number(s.elo);
      return Number.isFinite(val) ? val : null;
    } catch (error) {
      console.error('getLatestRatingInActiveSeason error:', error);
      return null;
    }
  };

  const calculateWinProbability = async () => {
    if (!playerName || !opponentName) {
      alert('선수 이름과 상대방 이름을 모두 입력해주세요.');
      return;
    }

    const playerRating = await getLatestRatingInActiveSeason(playerName);
    const opponentRating = await getLatestRatingInActiveSeason(opponentName);

    if (playerRating === null || opponentRating === null) {
      alert('선수 또는 상대방의 최신 레이팅을 찾을 수 없습니다.');
      setWinProbability(null);
      return;
    }

    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    setWinProbability((expectedScore * 100).toFixed(2));
  };

  // 공통 차트 옵션
  const makeLineOptions = (yLabel = 'ELO', yData = []) => {
    const numeric = (Array.isArray(yData) ? yData : []).filter(
      (v) => typeof v === 'number' && !Number.isNaN(v)
    );
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
        x: {
          title: { display: true, text: '날짜 / 시즌', color: 'var(--muted)' },
          ticks: { color: 'var(--ink)' },
          grid: { color: 'rgba(148,163,184,.15)' },
        },
        y: {
          title: { display: true, text: yLabel, color: 'var(--muted)' },
          ticks: { color: 'var(--ink)' },
          grid: { color: 'rgba(148,163,184,.15)' },
          min: hasData ? Math.min(...numeric) - 50 : undefined,
          max: hasData ? Math.max(...numeric) + 50 : undefined,
        },
      },
    };
  };

  /* ===== 함수형 data 제거: useMemo로 고정 객체 생성 ===== */
  const seasonChartData = useMemo(() => {
    return makeSafeChartData(
      eloHistorySeason.labels,
      eloHistorySeason.data,
      `${playerName} - ${currSeasonName}`,
      '#38bdf8',
      'rgba(56,189,248,0.15)'
    );
  }, [eloHistorySeason.labels, eloHistorySeason.data, playerName, currSeasonName]);

  const seasonsChartData = useMemo(() => {
    return makeSafeChartData(
      eloBySeason.labels,
      eloBySeason.data,
      `${playerName} - 시즌별 최종 ELO`,
      '#60a5fa',
      'rgba(96,165,250,0.15)'
    );
  }, [eloBySeason.labels, eloBySeason.data, playerName]);

  // KPI 값
  const eloSlope = useMemo(() => {
    const d = eloHistorySeason.data;
    if (!d || d.length < 2) return 0;
    return Number((d[d.length - 1] - d[0]).toFixed(1));
  }, [eloHistorySeason.data]);

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
              <input
                className="lab-input"
                type="text"
                placeholder="선수 이름 입력"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                aria-label="선수 이름"
              />
              <input
                className="lab-input"
                type="text"
                placeholder="상대방 이름 입력"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                aria-label="상대 이름"
              />
              <button className="lab-btn lab-shine" onClick={calculateWinProbability}>
                예상 승률 계산 (현재 시즌 기준)
              </button>
            </div>

            {winProbability !== null && (
              <div className="lab-kpis" style={{ marginTop: 14 }}>
                <Gauge label="예상 승률" sub="E(상대 대비)" value={Number(winProbability)} />
                <Gauge label="안정성" sub="표준편차 기반" value={stability} />
                <Gauge label="데이터 커버리지" sub="표본량 추정" value={seasonCoverage} />
              </div>
            )}

            {winProbability !== null && (
              <div className="lab-note" role="note">
                참고: 예상 승률은 ELO 기대값 기반이며, 표본량·최근 폼·상대 전적에 따라 달라질 수 있습니다.
              </div>
            )}
          </section>

          {/* 우: 현재 시즌 차트 */}
          <section className="lab-panel">
            <div className="lab-section">📈 현재 시즌 ELO 변동</div>
            <div className="lab-chart">
              {eloHistorySeason.labels.length > 0 && eloHistorySeason.data.length > 0 ? (
                <Line data={seasonChartData} options={makeLineOptions('ELO', eloHistorySeason.data)} />
              ) : (
                <div className="lab-note">선수 이름을 입력하면 시즌 내 변동 추이가 표시됩니다.</div>
              )}
            </div>
            <div className="lab-caption">상단 라인: 최근 데이터일수록 색이 더 선명하게 보입니다.</div>
          </section>
        </div>

        {/* 하단: 시즌별 시계열 전체 */}
        <section className="lab-panel" style={{ marginTop: 14 }}>
          <div className="lab-section">🧪 시즌별 최종 ELO 추이</div>
          <div className="lab-chart">
            {eloBySeason.labels.length > 0 && eloBySeason.data.length > 0 ? (
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
