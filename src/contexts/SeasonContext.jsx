import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const SeasonContext = createContext(null);
export const useSeason = () => useContext(SeasonContext);

export function SeasonProvider({ children }) {
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // 최근 시작 순으로 정렬 (startAt이 없으면 Firestore 콘솔에서 추가 권장)
        const snap = await getDocs(query(collection(db, 'seasons'), orderBy('startAt', 'asc')));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSeasons(list);

        const active = list.find(s => s.status === 'active') || list[list.length - 1];
        setActiveSeasonId(active?.id || 'S1'); // 최소 기본값
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const value = useMemo(() => ({
    seasons,
    activeSeasonId,
    setActiveSeasonId,
    loading,
  }), [seasons, activeSeasonId, loading]);

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}
