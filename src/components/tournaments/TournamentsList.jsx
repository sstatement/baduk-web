import React, { useEffect, useState } from "react";
import { listTournaments } from "../../api/tournaments";
import TournamentCard from "./TournamentCard";
import CreateTournamentDialog from "./CreateTournamentDialog";
import "./tournaments.css";

export default function TournamentList() {
  const [tab, setTab] = useState("reg");
  const [items, setItems] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await listTournaments({ status: tab });
      setItems(data);
    })();
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* HERO */}
      <section className="tg-hero p-7 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-4xl md:text-5xl">🏆</div>
              <h1 className="tg-title text-3xl md:text-4xl">Tournament Hub</h1>
            </div>
            <p className="tg-sub mt-2 text-sm md:text-base">
              리그의 긴장감, 브래킷의 압박감. 지금, 최강을 가린다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="tg-tabs">
              {[
                { key: "reg", label: "접수중" },
                { key: "live", label: "진행중" },
                { key: "done", label: "종료" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`tg-tab ${tab === key ? "is-active" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              className="tg-btn tg-btn-primary"
              onClick={() => setOpenCreate(true)}
              title="새 대회 개최"
            >
              ＋ 개최하기
            </button>
          </div>
        </div>
      </section>

      {/* 리스트 */}
      {items.length === 0 ? (
        <div className="tg-card p-10 text-center">
          <div className="tg-card-top mb-4" />
          <div className="text-5xl mb-3">🗂️</div>
          <p className="text-gray-300">해당 상태의 토너먼트가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">상단 탭을 바꾸거나 ‘개최하기’를 눌러 시작하세요.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t) => (
            <TournamentCard key={t.id} data={t} />
          ))}
        </div>
      )}

      {openCreate && <CreateTournamentDialog onClose={() => setOpenCreate(false)} />}
    </div>
  );
}
