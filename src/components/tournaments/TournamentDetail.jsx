import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { getTournament } from "../../api/tournaments";
import { getAllRounds } from "../../api/admin";
import { getStandings } from "../../api/standings";
import JoinBox from "./JoinBox";
import BracketView from "./BracketView";
import StandingsTable from "./StandingsTable";
import AdminPanel from "./AdminPanel";

export default function TournamentDetail() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [standings, setStandings] = useState({ rows: [] });

  // 로그인한 유저 정보
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMe(null);
        setIsAdmin(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};

      setMe({
        uid: user.uid,
        name: data.name,
        rank: data.rank,
        admin: data.admin || false,
      });

      setIsAdmin(data.admin || false);
    });
    return () => unsub();
  }, []);

  // 대회 정보 로드
  useEffect(() => {
    (async () => {
      const data = await getTournament(id);
      setT(data);
    })();
  }, [id]);

  // 라운드 및 결과 로드
  useEffect(() => {
    (async () => {
      if (!t?.id) return;
      setRounds(await getAllRounds(t.id));
      if (t.status === "done") {
        setStandings(await getStandings(t.id));
      } else {
        setStandings({ rows: [] });
      }
    })();
  }, [t?.id, t?.status]);

  // 개최자 또는 관리자만 관리 권한 부여
  const canManage =
    isAdmin || (me?.uid && t?.createdBy && me.uid === t.createdBy);

  if (!t) return <div className="p-4">로딩중...</div>;

  const statusText =
    t.status === "reg" ? "접수중" : t.status === "live" ? "진행중" : "종료";
  const fmt =
    { se: "싱글 엘리미네이션", swiss: "스위스", rr: "라운드로빈", de: "더블 엘리미" }[
      t.format
    ] || t.format;

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="border rounded p-4 mb-4">
          <div className="text-sm text-gray-500">
            {statusText} • {fmt}
          </div>
          <h1 className="text-2xl font-bold">{t.name}</h1>
          <div className="mt-3 whitespace-pre-wrap">{t.desc}</div>
          <div className="mt-3 text-sm text-gray-600">
            규칙: 일본식, 덤 {t.rules?.komi ?? 6.5} / 시간{" "}
            {t.rules?.time?.main ?? 1200}s + {t.rules?.time?.byo ?? 30}s ×{" "}
            {t.rules?.time?.periods ?? 3}
          </div>
        </div>

        {t.status !== "done" ? (
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">대진표</h2>
            <BracketView rounds={rounds} />
          </div>
        ) : (
          <div className="border rounded p-4 space-y-4">
            <div>
              <h2 className="font-semibold mb-2">최종 결과</h2>
              <StandingsTable rows={standings.rows} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">브래킷</h3>
              <BracketView rounds={rounds} />
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-1 flex flex-col gap-4">
        {me ? (
          <JoinBox tournament={t} me={me} />
        ) : (
          <div className="border rounded p-3 text-sm text-gray-500">
            로그인 후 참가할 수 있습니다.
          </div>
        )}

        <div className="border rounded p-3">
          <div className="font-semibold mb-2">정보</div>
          <div className="text-sm text-gray-700">상태: {statusText}</div>
          <div className="text-sm text-gray-700">형식: {fmt}</div>
        </div>

        {canManage && <AdminPanel tournament={t} me={me} />}
      </div>
    </div>
  );
}
