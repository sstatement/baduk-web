// src/pages/league/HallOfFame.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSeason } from '../../contexts/SeasonContext';

const CHALLENGER_ELO = 1576;

/** ──────────────────────────────────────────────────────────────────────────
 *  ULTRA GRAND STYLE HALL OF FAME
 *  - 오로라/스포트라이트/황금 보더 애니메이션/글리터/샤인/포디엄 라이트바
 *  - 외부 라이브러리/이미지 없이 순수 CSS/SVG만 사용
 *  - 기능 로직 동일
 *  ────────────────────────────────────────────────────────────────────────── */

const styles = {
  wrap: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(1400px 700px at 50% -10%, #0b1326 0%, #0a0f1c 55%, #070b14 100%)',
  },
  // 뒤쪽 오로라 웨이브
  aurora: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'conic-gradient(from 210deg at 50% 50%, rgba(66,153,225,0.10), rgba(192,132,252,0.12), rgba(255,214,102,0.10), rgba(59,130,246,0.10))',
    filter: 'blur(60px) saturate(120%)',
    opacity: 0.7,
  },
  // 스포트라이트
  spotLeft: {
    position: 'absolute',
    left: '-20%',
    top: '-10%',
    width: '60%',
    height: '80%',
    background:
      'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 28%, transparent 60%)',
    transform: 'rotate(-12deg)',
    filter: 'blur(8px)',
  },
  spotRight: {
    position: 'absolute',
    right: '-20%',
    top: '-12%',
    width: '60%',
    height: '80%',
    background:
      'radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 28%, transparent 60%)',
    transform: 'rotate(12deg)',
    filter: 'blur(8px)',
  },

  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '48px 24px 64px',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    color: '#E6EAF3',
    position: 'relative',
    zIndex: 1,
  },

  head: {
    textAlign: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 44,
    fontWeight: 900,
    letterSpacing: '0.02em',
    lineHeight: 1.1,
    color: '#F8FAFC',
    textShadow: '0 6px 40px rgba(255,215,128,0.18)',
  },
  titleShine: {
    position: 'relative',
    display: 'inline-block',
  },
  sub: {
    marginTop: 10,
    color: '#9fb2cc',
    fontSize: 16,
  },

  seasonBar: {
    margin: '22px auto 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  select: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    color: '#E6EAF3',
    outline: 'none',
    backdropFilter: 'blur(6px)',
    minWidth: 200,
  },
  badge: {
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 999,
    background: 'linear-gradient(90deg, rgba(252,211,77,.18), rgba(251,191,36,.12))',
    color: '#fde68a',
    fontWeight: 800,
    letterSpacing: '0.05em',
    border: '1px solid rgba(251,191,36,.25)',
  },

  // ── CHAMPION
  ribbon: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '8px 12px',
    borderRadius: 999,
    color: '#1f2937',
    background:
      'linear-gradient(90deg, #fde68a 0%, #fbbf24 35%, #f59e0b 100%)',
    boxShadow: '0 10px 40px rgba(245,158,11,0.45)',
    border: '1px solid rgba(0,0,0,0.08)',
    marginBottom: 12,
  },
  heroOuter: {
    position: 'relative',
    borderRadius: 22,
    padding: 2,
    background:
      'linear-gradient(135deg, rgba(255,215,128,0.65), rgba(255,255,255,0.06), rgba(96,165,250,0.55))',
    boxShadow:
      '0 16px 48px rgba(0,0,0,0.55), inset 0 0 0 0.5px rgba(255,255,255,0.06)',
    marginBottom: 34,
  },
  hero: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, rgba(17,26,44,0.92) 0%, rgba(12,20,36,0.95) 55%, rgba(9,14,23,0.95) 100%)',
    padding: '28px 28px 32px',
  },
  confetti: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  heroRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 18,
  },
  heroLeft: {},
  heroTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 10,
  },
  crown: { fontSize: 30 },
  heroName: {
    fontSize: 38,
    fontWeight: 1000,
    letterSpacing: '0.02em',
    backgroundImage:
      'linear-gradient(180deg, #fff 0%, #fde68a 50%, #fbbf24 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 10px 50px rgba(255,215,128,0.35)',
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  stat: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: '14px 16px',
    minWidth: 140,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  statLabel: { fontSize: 12, color: '#cbd5e1', marginBottom: 4 },
  statVal: { fontSize: 24, fontWeight: 900 },

  // ── CHALLENGERS
  sectionTitle: {
    fontSize: 22,
    fontWeight: 900,
    margin: '8px 0 12px',
    letterSpacing: '0.02em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 18,
    marginBottom: 32,
  },
  cardOuter: {
    borderRadius: 16,
    padding: 1.5,
    background:
      'linear-gradient(135deg, rgba(255,215,128,0.35), rgba(255,255,255,0.06), rgba(96,165,250,0.35))',
  },
  card: {
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))',
    borderRadius: 14,
    padding: 18,
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
    color: '#e5e7eb',
    transition: 'transform .25s ease, box-shadow .25s ease',
  },
  cardHover: { transform: 'translateY(-3px) scale(1.01)', boxShadow: '0 22px 48px rgba(0,0,0,0.55)' },
  cardTitle: {
    fontWeight: 900,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fef9c3',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontVariantNumeric: 'tabular-nums',
    color: '#cbd5e1',
  },
  strong: { color: '#e5e7eb', fontWeight: 800 },

  // ── PODIUM
  podium: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  podiumCard: (rank) => ({
    borderRadius: 16,
    padding: 18,
    textAlign: 'center',
    background:
      rank === 1
        ? 'linear-gradient(160deg, rgba(255,215,128,0.24), rgba(255,255,255,0.06))'
        : rank === 2
        ? 'linear-gradient(160deg, rgba(203,213,225,0.24), rgba(255,255,255,0.06))'
        : 'linear-gradient(160deg, rgba(253,186,116,0.24), rgba(255,255,255,0.06))',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
    position: 'relative',
    overflow: 'hidden',
  }),
  lightBar: {
    position: 'absolute',
    left: '-30%',
    top: '50%',
    width: '160%',
    height: 2,
    transform: 'translateY(-50%) rotate(6deg)',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
    mixBlendMode: 'screen',
  },
  podiumRank: {
    fontSize: 12,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  podiumName: { fontSize: 22, fontWeight: 900, color: '#f8fafc' },
  podiumElo: { marginTop: 8, fontSize: 14, color: '#e5e7eb' },

  empty: { color: '#94a3b8', padding: '12px 0' },
};

// 월계수+왕관 SVG (배경 포인트)
const Emblem = () => (
  <svg width="360" height="360" viewBox="0 0 512 512" fill="none" style={{ position: 'absolute', right: -10, top: -40, opacity: 0.08 }}>
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="512" y2="512">
        <stop offset="0%" stopColor="#fff3bf"/>
        <stop offset="50%" stopColor="#fcd34d"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
    <g fill="url(#gold)">
      <path d="M128 280c-10 26-16 54-16 84 24-16 46-36 64-58 10-12-4-38-21-26-9 6-18 12-27 18z"/>
      <path d="M384 280c10 26 16 54 16 84-24-16-46-36-64-58-10-12 4-38 21-26 9 6 18 12 27 18z"/>
      <path d="M160 200c-18 28-30 61-34 96 24-18 45-38 64-60 11-14-6-40-30-36z"/>
      <path d="M352 200c18 28 30 61 34 96-24-18-45-38-64-60-11-14 6-40 30-36z"/>
      {/* crown */}
      <path d="M170 120l38 48 48-40 48 40 38-48 8 76-46 14H208l-46-14 8-76z" />
    </g>
  </svg>
);

const HallOfFame = () => {
  const { activeSeasonId, seasons = [], setActiveSeasonId } = useSeason() || {};
  const [seasonId, setSeasonId] = useState(activeSeasonId || '');
  const [seasonOpts, setSeasonOpts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [seasonName, setSeasonName] = useState('');

  useEffect(() => {
    if (seasons && seasons.length) {
      const ordered = [...seasons].sort((a, b) => {
        const aKey = a.startAt?.toMillis?.() ?? 0;
        const bKey = b.startAt?.toMillis?.() ?? 0;
        if (aKey === bKey) return (b.name || b.id).localeCompare(a.name || a.id);
        return bKey - aKey;
      });
      setSeasonOpts(ordered.map((s) => ({ id: s.id, name: s.name || s.id })));
      if (!seasonId) setSeasonId(ordered[0]?.id || '');
    }
  }, [seasons]); // eslint-disable-line

  useEffect(() => {
    if (setActiveSeasonId && seasonId && seasonId !== activeSeasonId) {
      setActiveSeasonId(seasonId);
    }
  }, [seasonId]); // eslint-disable-line

  useEffect(() => {
    const s = seasons.find((x) => x.id === seasonId);
    setSeasonName(s?.name || seasonId || '');
  }, [seasonId, seasons]);

  const fetchSeasonStats = async (sid) => {
    if (!sid) {
      setStats([]);
      return;
    }
    try {
      setLoading(true);
      const ref = collection(db, 'playerStats');
      const snap = await getDocs(query(ref, where('seasonId', '==', sid)));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStats(rows);
    } catch (e) {
      console.error('HallOfFame fetchSeasonStats error:', e);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonStats(seasonId);
  }, [seasonId]);

  const {
    champion,
    challengers,
    top10,
    recordMaxElo,
    recordMostWins,
    recordBestWinRate,
  } = useMemo(() => {
    if (!stats || !stats.length) {
      return {
        champion: null,
        challengers: [],
        top10: [],
        recordMaxElo: null,
        recordMostWins: null,
        recordBestWinRate: null,
      };
    }
    const sortedByElo = [...stats].sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0));
    const champion = sortedByElo[0];
    const challengers = sortedByElo.filter((p) => (p.elo ?? 0) >= CHALLENGER_ELO);
    const top10 = sortedByElo.slice(0, 10);
    const recordMaxElo = sortedByElo[0];
    const sortedByWins = [...stats].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));
    const recordMostWins = sortedByWins[0];

    const withGames = stats
      .map((s) => ({ ...s, games: (s.wins ?? 0) + (s.losses ?? 0) }))
      .filter((s) => s.games >= 5)
      .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));
    const recordBestWinRate = withGames[0] || null;

    return { champion, challengers, top10, recordMaxElo, recordMostWins, recordBestWinRate };
  }, [stats]);

  return (
    <div style={styles.wrap}>
      {/* 오로라/스포트라이트 */}
      <div style={styles.aurora} />
      <div style={styles.spotLeft} />
      <div style={styles.spotRight} />

      <div style={styles.page}>
        <header style={styles.head}>
          <div style={styles.titleShine} className="hof-shine">
            <div style={styles.title}>명예의 전당</div>
          </div>
          <div style={styles.sub}>시즌별 챔피언과 챌린저의 영광을 기록합니다.</div>
        </header>

        {/* 시즌 선택 */}
        <div style={styles.seasonBar}>
          <span style={{ fontWeight: 900, color: '#E6EAF3' }}>시즌 선택</span>
          <select
            value={seasonId || ''}
            onChange={(e) => setSeasonId(e.target.value)}
            style={styles.select}
          >
            {seasonOpts.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {seasonName ? <span style={styles.badge}>선택: {seasonName}</span> : null}
        </div>

        {/* 챔피언 */}
        <div style={{ ...styles.sectionTitle, textAlign: 'center' }}>🏆 시즌 챔피언</div>
        <div style={styles.heroOuter}>
          <div style={styles.hero}>
            <Emblem />
            {/* 글리터/샤인/컨페티 레이어 */}
            <div style={styles.confetti} className="hof-confetti" />
            {loading ? (
              <div style={{ padding: 18, color: '#cbd5e1' }}>불러오는 중…</div>
            ) : champion ? (
              <>
                <div style={styles.ribbon}>
                  <span>SEASON CHAMPION</span>
                </div>
                <div style={styles.heroRow}>
                  <div style={styles.heroLeft}>
                    <div style={styles.heroTitleLine}>
                      <span style={styles.crown}>👑</span>
                      <span>{seasonName} 챔피언</span>
                    </div>
                    <div className="hof-glint" style={styles.heroName}>
                      {champion.playerName}
                    </div>
                    <div style={styles.statsRow}>
                      <div style={styles.stat}>
                        <div style={styles.statLabel}>ELO</div>
                        <div style={styles.statVal}>{Math.round(champion.elo ?? 0)}</div>
                      </div>
                      <div style={styles.stat}>
                        <div style={styles.statLabel}>전적</div>
                        <div style={styles.statVal}>
                          {champion.wins ?? 0}W / {champion.losses ?? 0}L
                        </div>
                      </div>
                      <div style={styles.stat}>
                        <div style={styles.statLabel}>승률</div>
                        <div style={styles.statVal}>
                          {(((champion.winRate ?? 0) * 100).toFixed(1))}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: 18, color: '#cbd5e1' }}>
                해당 시즌 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 챌린저 */}
        <div style={styles.sectionTitle}>💎 챌린저 달성자</div>
        {loading ? (
          <div style={{ color: '#cbd5e1' }}>불러오는 중…</div>
        ) : challengers.length ? (
          <div style={styles.grid}>
            {challengers.map((p, i) => (
              <div key={p.playerName + i} style={styles.cardOuter}>
                <div
                  style={styles.card}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={styles.cardTitle}>
                    <span>🥇</span>
                    <span>{p.playerName}</span>
                  </div>
                  <div style={styles.statRow}><span>ELO</span><strong style={styles.strong}>{Math.round(p.elo ?? 0)}</strong></div>
                  <div style={styles.statRow}><span>전적</span><strong style={styles.strong}>{p.wins ?? 0}W / {p.losses ?? 0}L</strong></div>
                  <div style={styles.statRow}><span>승률</span><strong style={styles.strong}>{(((p.winRate ?? 0) * 100).toFixed(1))}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', padding: '8px 0' }}>
            해당 시즌에는 챌린저(≥ {CHALLENGER_ELO})가 없습니다.
          </div>
        )}

        {/* TOP 10 with podium */}
        <div style={styles.sectionTitle}>🌟 시즌 Top 10</div>
        {loading ? (
          <div style={{ color: '#cbd5e1' }}>불러오는 중…</div>
        ) : top10.length ? (
          <>
            <div style={styles.podium}>
              {[1, 2, 3]
                .filter((r) => top10[r - 1])
                .map((r) => {
                  const p = top10[r - 1];
                  return (
                    <div key={p.playerName + '_p'} style={styles.podiumCard(r)}>
                      <div style={styles.lightBar} className="hof-lightbar" />
                      <div style={styles.podiumRank}>{r}위</div>
                      <div className="hof-glint" style={styles.podiumName}>{p.playerName}</div>
                      <div style={styles.podiumElo}>
                        ELO <strong style={{ fontWeight: 900 }}>{Math.round(p.elo ?? 0)}</strong>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={styles.grid}>
              {top10.slice(3).map((p, idx) => (
                <div key={p.playerName + idx} style={styles.cardOuter}>
                  <div
                    style={styles.card}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={styles.cardTitle}>
                      <span>{idx + 4}위</span>
                      <span>{p.playerName}</span>
                    </div>
                    <div style={styles.statRow}><span>ELO</span><strong style={styles.strong}>{Math.round(p.elo ?? 0)}</strong></div>
                    <div style={styles.statRow}><span>전적</span><strong style={styles.strong}>{p.wins ?? 0}W / {p.losses ?? 0}L</strong></div>
                    <div style={styles.statRow}><span>승률</span><strong style={styles.strong}>{(((p.winRate ?? 0) * 100).toFixed(1))}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: '#94a3b8', padding: '8px 0' }}>데이터가 없습니다.</div>
        )}

        {/* 시즌 기록 */}
        <div style={styles.sectionTitle}>📚 시즌 기록</div>
        {loading ? (
          <div style={{ color: '#cbd5e1' }}>불러오는 중…</div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.cardOuter}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>🔥 최고 ELO</div>
                {recordMaxElo ? (
                  <>
                    <div style={styles.statRow}><span>선수</span><strong style={styles.strong}>{recordMaxElo.playerName}</strong></div>
                    <div style={styles.statRow}><span>ELO</span><strong style={styles.strong}>{Math.round(recordMaxElo.elo ?? 0)}</strong></div>
                  </>
                ) : <div style={styles.empty}>기록 없음</div>}
              </div>
            </div>

            <div style={styles.cardOuter}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>🥊 최다 승</div>
                {recordMostWins ? (
                  <>
                    <div style={styles.statRow}><span>선수</span><strong style={styles.strong}>{recordMostWins.playerName}</strong></div>
                    <div style={styles.statRow}><span>승수</span><strong style={styles.strong}>{recordMostWins.wins ?? 0}</strong></div>
                  </>
                ) : <div style={styles.empty}>기록 없음</div>}
              </div>
            </div>

            <div style={styles.cardOuter}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>🎯 최고 승률(5판↑)</div>
                {recordBestWinRate ? (
                  <>
                    <div style={styles.statRow}><span>선수</span><strong style={styles.strong}>{recordBestWinRate.playerName}</strong></div>
                    <div style={styles.statRow}><span>승률</span><strong style={styles.strong}>{(((recordBestWinRate.winRate ?? 0) * 100).toFixed(1))}%</strong></div>
                    <div style={styles.statRow}><span>경기수</span><strong style={styles.strong}>{(recordBestWinRate.wins ?? 0) + (recordBestWinRate.losses ?? 0)}</strong></div>
                  </>
                ) : <div style={styles.empty}>기록 없음</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 CSS */}
      <style>{`
        /* 타이틀 샤이니 스윕 */
        .hof-shine::after {
          content: '';
          position: absolute;
          left: -30%;
          top: 0;
          height: 100%;
          width: 30%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
          transform: skewX(-20deg);
          animation: shineSweep 4.5s ease-in-out infinite;
        }
        @keyframes shineSweep {
          0% { left: -30%; opacity: .0; }
          15% { opacity: .6; }
          60% { left: 130%; opacity: .0; }
          100% { left: 130%; opacity: .0; }
        }

        /* 컨페티 별빛 */
        .hof-confetti::before, .hof-confetti::after {
          content: '';
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          margin: auto;
          width: 2px;
          height: 2px;
          background: rgba(255,255,255,.6);
          border-radius: 999px;
          box-shadow:
            80px 30px 0 0 rgba(255,255,255,0.35),
            180px 100px 0 0 rgba(255,255,255,0.25),
            420px 10px 0 0 rgba(255,255,255,0.35),
            700px 60px 0 0 rgba(255,255,255,0.3),
            960px 20px 0 0 rgba(255,255,255,0.25);
          animation: twinkle 7s ease-in-out infinite;
        }
        .hof-confetti::after {
          top: 0;
          filter: blur(1px);
          animation-delay: 2.2s;
        }
        @keyframes twinkle {
          0% { opacity: .2; transform: translateY(0) }
          50% { opacity: .65; transform: translateY(-4px) }
          100% { opacity: .2; transform: translateY(0) }
        }

        /* 글리터 글로우 */
        .hof-glint {
          position: relative;
          overflow: hidden;
        }
        .hof-glint::after {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%;
          height: 100%;
          background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,.18) 40%, transparent 80%);
          transform: skewX(-18deg);
          animation: glint 6s ease-in-out infinite;
        }
        @keyframes glint {
          0% { left: -120%; }
          50% { left: 140%; }
          100% { left: 140%; }
        }

        /* 포디엄 라이트바 흐름 */
        .hof-lightbar {
          animation: scan 3.6s ease-in-out infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-50%) rotate(6deg) translateX(-40%); opacity: .0; }
          20% { opacity: .5; }
          60% { transform: translateY(-50%) rotate(6deg) translateX(40%); opacity: .0; }
          100% { transform: translateY(-50%) rotate(6deg) translateX(40%); opacity: .0; }
        }
      `}</style>
    </div>
  );
};

export default HallOfFame;
