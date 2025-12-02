// src/contexts/SeasonContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const SeasonContext = createContext(null);
export const useSeason = () => useContext(SeasonContext);

export function SeasonProvider({ children }) {
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "seasons"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // ✅ 1) startAt 기준으로 "최신 시즌이 앞에 오도록" 정렬
        const ordered = list.slice().sort((a, b) => {
          const aStart = a.startAt?.toMillis?.() ?? 0;
          const bStart = b.startAt?.toMillis?.() ?? 0;
          if (aStart === bStart) {
            // startAt 없거나 같으면 이름/ID 기준으로 정렬 (선택사항)
            return (b.name || b.id).localeCompare(a.name || a.id);
          }
          // 최신(startAt 큰 것)이 먼저
          return bStart - aStart;
        });

        setSeasons(ordered);

        // ✅ 2) 기본 active 시즌 결정
        setActiveSeasonId((prev) => {
          if (prev) return prev; // 이미 선택된 게 있으면 유지

          // (1순위) status === 'active' 이면서 가장 최신인 시즌
          const active = ordered.find((s) => s.status === "active");
          if (active) return active.id;

          // (2순위) 그냥 가장 최신 시즌
          if (ordered[0]) return ordered[0].id;

          // (3순위) 정말 아무것도 없으면 null
          return null;
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const value = useMemo(
    () => ({
      seasons,
      activeSeasonId,
      setActiveSeasonId,
      loading,
    }),
    [seasons, activeSeasonId, loading]
  );

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
}
