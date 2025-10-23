import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSeason } from '../../contexts/SeasonContext'; // ★ 시즌 사용

const getRankImage = (rank) => {
  const size = 40;
  const style = { width: size, height: size, borderRadius: '50%', objectFit: 'cover' };
  const key = rank?.replace(/\s+/g, '');
  if (key === '브론즈') return <img src="/images/브론즈.jpg" alt="브론즈" style={style} />;
  if (key === '실버') return <img src="/images/실버.jpg" alt="실버" style={style} />;
  if (key === '골드') return <img src="/images/골드.jpg" alt="골드" style={style} />;
  if (key === '플래티넘') return <img src="/images/플래티넘.jpg" alt="플래티넘" style={style} />;
  if (key === '다이아') return <img src="/images/다이아.jpg" alt="다이아" style={style} />;
  if (key === '마스터') return <img src="/images/마스터.jpg" alt="마스터" style={style} />;
  if (key === '그랜드마스터') return <img src="/images/그랜드마스터.jpg" alt="그랜드마스터" style={style} />;
  if (key === '챌린저') return <img src="/images/챌린저.jpg" alt="챌린저" style={style} />;
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

const containerStyle = {
  maxWidth: '960px',
  margin: '40px auto',
  backgroundColor: 'white',
  padding: '30px 25px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  color: '#1f2937',
};

const headerStyle = {
  fontSize: '28px',
  fontWeight: '700',
  marginBottom: '20px',
  borderBottom: '2px solid #e5e7eb',
  paddingBottom: '10px',
  color: '#111827',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '40px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const thStyle = {
  backgroundColor: '#374151',
  color: 'white',
  padding: '12px 15px',
  textAlign: 'center',
  fontWeight: '600',
  fontSize: '14px',
  userSelect: 'none',
};

const tdStyle = {
  padding: '12px 15px',
  textAlign: 'center',
  borderBottom: '1px solid #ddd',
  fontSize: '14px',
  verticalAlign: 'middle',
};

const winRateStyle = { fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' };

const rankTextStyle = (color) => ({
  color,
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  justifyContent: 'center',
  fontSize: '16px',
});

const getRowBackground = (index) => (index % 2 === 0 ? 'white' : '#f9fafb');

const rankTableHeaderStyle = {
  backgroundColor: '#1e293b',
  color: 'white',
  padding: '14px 20px',
  fontWeight: '700',
  fontSize: '15px',
  borderBottom: '2px solid #334155',
};

const rankTableTdStyle = {
  borderBottom: '1px solid #e2e8f0',
  padding: '15px 20px',
  fontSize: '14px',
  verticalAlign: 'middle',
  textAlign: 'center',
  color: '#334155',
};

const rankImageLargeStyle = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  objectFit: 'cover',
  display: 'block',
  margin: '0 auto',
};

const BASE_ELO = 1500;

const Ranking = () => {
  const { activeSeasonId: seasonId = 'S1' } = useSeason() || {}; // ★ 시즌 폴백

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [matchMatrix, setMatchMatrix] = useState({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  // 등록자 목록 (matchApplications)
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

  // 해당 시즌 승인 경기
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

  // 랭킹 계산: 시즌 경기 → ELO/승패 반영, 없으면 applications 폴백
  const fetchRankings = async () => {
    try {
      setLoading(true);
      const [list, matches] = await Promise.all([fetchPlayersList(), fetchSeasonMatches()]);

      if (!list.length) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      if (matches.length === 0) {
        // 시즌 경기 없으면 기본 레이팅으로 표시 (정렬 유지)
        const fallback = list.map((p) => ({
          id: p.id,
          playerName: p.playerName,
          rating: p.baseRating,
          stamina: p.stamina,
          win: 0,
          loss: 0,
          _source: 'applications',
        }));
        setPlayers(fallback.sort((a, b) => b.rating - a.rating));
        setLoading(false);
        return;
      }

      const map = new Map(); // name -> { rating, win, loss, lastAt, stamina }
      list.forEach((p) => {
        map.set(p.playerName, {
          rating: p.baseRating,
          win: 0,
          loss: 0,
          lastAt: null,
          stamina: p.stamina,
        });
      });

      matches.forEach((m) => {
        const atRaw = m.date || m.createdAt;
        const at = atRaw?.toDate ? atRaw.toDate() : atRaw;

        if (m.winner && map.has(m.winner)) {
          const cur = map.get(m.winner);
          cur.win = (cur.win || 0) + 1;
          if (!cur.lastAt || (at && at > cur.lastAt)) {
            cur.lastAt = at || cur.lastAt;
            cur.rating = m.winnerELO ?? cur.rating ?? BASE_ELO;
          }
          map.set(m.winner, cur);
        }

        if (m.loser && map.has(m.loser)) {
          const cur = map.get(m.loser);
          cur.loss = (cur.loss || 0) + 1;
          if (!cur.lastAt || (at && at > cur.lastAt)) {
            cur.lastAt = at || cur.lastAt;
            cur.rating = m.loserELO ?? cur.rating ?? BASE_ELO;
          }
          map.set(m.loser, cur);
        }
      });

      const rows = Array.from(map.entries()).map(([playerName, v]) => ({
        id: playerName,
        playerName,
        rating: v.rating ?? BASE_ELO,
        stamina: v.stamina,
        win: v.win || 0,
        loss: v.loss || 0,
        _source: 'matches',
      }));

      rows.sort((a, b) => b.rating - a.rating);
      setPlayers(rows);
      setLoading(false);
    } catch (e) {
      console.error('Error building rankings:', e);
      setPlayers([]);
      setLoading(false);
    }
  };

  // 시즌 매트릭스 (해당 시즌 승인 경기만)
  const fetchMatchMatrix = async (playerList) => {
    try {
      setLoadingMatrix(true);
      const matches = await fetchSeasonMatches();

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
  };

  useEffect(() => {
    fetchRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  useEffect(() => {
    if (players.length > 0) {
      fetchMatchMatrix(players);
    } else {
      setLoadingMatrix(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, seasonId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>로딩 중...</div>;
  }
  if (!players.length) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>선수 데이터가 없습니다.</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>리그 순위표</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>순위</th>
            <th style={thStyle}>선수명</th>
            <th style={thStyle}>ELO</th>
            <th style={thStyle}>랭크</th>
            <th style={thStyle}>급수/단수</th>
            <th style={thStyle}>승</th>
            <th style={thStyle}>패</th>
            <th style={thStyle}>승률</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => {
            const { rank, color } = getRank(player.rating, idx + 1);
            const total = (player.win || 0) + (player.loss || 0);
            const winRate = total === 0 ? 0 : ((player.win / total) * 100).toFixed(2);

            const stamina = player.stamina;
            const danOrKyu =
              stamina == null
                ? '-'
                : stamina >= 1000
                ? `${Math.floor((stamina - 1000) / 100) + 1}단`
                : `${18 - Math.floor(stamina / 50)}급`;

            return (
              <tr
                key={player.id}
                style={{ backgroundColor: getRowBackground(idx), transition: 'background-color 0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = getRowBackground(idx))}
              >
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, fontWeight: '600', color: '#1f2937' }}>{player.playerName}</td>
                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{Math.floor(player.rating)}</td>
                <td style={rankTextStyle(color)}>
                  {getRankImage(rank)}
                  <span>{rank}</span>
                </td>
                <td style={tdStyle}>{danOrKyu}</td>
                <td style={tdStyle}>{player.win}</td>
                <td style={tdStyle}>{player.loss}</td>
                <td style={{ ...tdStyle, ...winRateStyle }}>{winRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={headerStyle}>랭크 기준표</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={rankTableHeaderStyle}>사진</th>
            <th style={rankTableHeaderStyle}>랭크</th>
            <th style={rankTableHeaderStyle}>조건</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={rankTableTdStyle}>
              <img src="/images/챌린저.jpg" alt="챌린저" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>챌린저</strong>
            </td>
            <td style={rankTableTdStyle}>다이아 랭크 중 1위</td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td style={rankTableTdStyle}>
              <img src="/images/그랜드마스터.jpg" alt="그랜드마스터" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>그랜드마스터</strong>
            </td>
            <td style={rankTableTdStyle}>다이아 랭크 중 2위 ~ 4위</td>
          </tr>
          <tr>
            <td style={rankTableTdStyle}>
              <img src="/images/마스터.jpg" alt="마스터" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>마스터</strong>
            </td>
            <td style={rankTableTdStyle}>다이아 랭크 중 5위 ~ 10위</td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td style={rankTableTdStyle}>
              <img src="/images/다이아.jpg" alt="다이아" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>다이아</strong>
            </td>
            <td style={rankTableTdStyle}>레이팅 1576 이상</td>
          </tr>
          <tr>
            <td style={rankTableTdStyle}>
              <img src="/images/플래티넘.jpg" alt="플래티넘" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>플래티넘</strong>
            </td>
            <td style={rankTableTdStyle}>레이팅 1551 ~ 1575</td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td style={rankTableTdStyle}>
              <img src="/images/골드.jpg" alt="골드" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>골드</strong>
            </td>
            <td style={rankTableTdStyle}>레이팅 1526 ~ 1550</td>
          </tr>
          <tr>
            <td style={rankTableTdStyle}>
              <img src="/images/실버.jpg" alt="실버" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>실버</strong>
            </td>
            <td style={rankTableTdStyle}>레이팅 1501 ~ 1525</td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td style={rankTableTdStyle}>
              <img src="/images/브론즈.jpg" alt="브론즈" style={rankImageLargeStyle} />
            </td>
            <td style={rankTableTdStyle}>
              <strong>브론즈</strong>
            </td>
            <td style={rankTableTdStyle}>레이팅 1500 이하</td>
          </tr>
        </tbody>
      </table>

      <h2 style={headerStyle}>풀리그 대국 현황</h2>
      {loadingMatrix ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>대국 현황 로딩 중...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, position: 'sticky', left: 0, backgroundColor: '#374151', zIndex: 2 }}>
                  선수명
                </th>
                {players.map((p) => (
                  <th key={p.id} style={{ ...thStyle, minWidth: 70, userSelect: 'none' }} title={p.playerName}>
                    {p.playerName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((rowPlayer, rowIdx) => (
                <tr key={rowPlayer.id} style={{ backgroundColor: getRowBackground(rowIdx) }}>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: '600',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: getRowBackground(rowIdx),
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
                        style={{
                          ...tdStyle,
                          fontWeight: val === 'O' ? '700' : 'normal',
                          color: val === 'O' ? '#2563eb' : '#9ca3af',
                          userSelect: 'none',
                        }}
                        title={
                          val === 'O'
                            ? '대국 완료'
                            : rowPlayer.playerName === colPlayer.playerName
                            ? '-'
                            : '대국 미완료'
                        }
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
  );
};

export default Ranking;
