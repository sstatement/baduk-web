import React from 'react';
import { useSeason } from '../contexts/SeasonContext';

export default function SeasonSelect() {
  const { seasons = [], activeSeasonId, setActiveSeasonId, loading } = useSeason() || {};
  if (loading) return null;
  if (!seasons.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ fontWeight: 600 }}>시즌:</label>
      <select
        value={activeSeasonId || ''}
        onChange={(e) => setActiveSeasonId(e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}
      >
        {seasons.map(s => (
          <option key={s.id} value={s.id}>{s.name || s.id}</option>
        ))}
      </select>
    </div>
  );
}
