import React from 'react';

const HallOfFame = ({ champion, challengers }) => {
  const containerStyle = {
    maxWidth: 800,
    margin: '40px auto',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    color: '#1f2937',
  };

  const sectionTitleStyle = {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: 12,
  };

  const championStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const imgStyle = {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
  };

  const challengerListStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  };

  const challengerItemStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '6px 14px',
    borderRadius: 20,
    fontWeight: '600',
    fontSize: 14,
    userSelect: 'none',
  };

  if (!champion && (!challengers || challengers.length === 0)) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>명예의 전당 및 챌린저 달성자 데이터가 없습니다.</p>;
  }

  const winRate = champion && champion.win + champion.loss > 0
    ? ((champion.win / (champion.win + champion.loss)) * 100).toFixed(2)
    : 0;

  return (
    <section style={containerStyle}>
      {/* 시즌 1등 명예의 전당 */}
      {champion && (
        <>
          <h2 style={sectionTitleStyle}>🏆 시즌 명예의 전당 (1위)</h2>
          <div style={championStyle}>
            <img src={champion.rankImage} alt={champion.rank} style={imgStyle} />
            <div>
              <h3 style={{ margin: 0, fontSize: 28, fontWeight: '700', color: champion.color }}>{champion.playerName}</h3>
              <p style={{ margin: '8px 0', fontSize: 16 }}>
                ELO: {champion.rating} | 승: {champion.win} | 패: {champion.loss} | 승률: {winRate}%
              </p>
              <p style={{ margin: 0, fontWeight: '600' }}>랭크: <span style={{ color: champion.color }}>{champion.rank}</span></p>
            </div>
          </div>
        </>
      )}

      {/* 챌린저 달성자 리스트 */}
      {challengers && challengers.length > 0 && (
        <>
          <h2 style={{ ...sectionTitleStyle, marginTop: 40 }}>🚀 챌린저 달성자</h2>
          <div style={challengerListStyle}>
            {challengers.map(({ id, playerName }) => (
              <div key={id} style={challengerItemStyle}>{playerName}</div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HallOfFame;
