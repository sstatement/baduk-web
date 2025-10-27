import React, { useEffect, useState } from "react";
import { getAllRounds } from "../../api/admin";
import { startTournamentSE, advanceNextRoundSE } from "../../api/admin";
import ResultDialog from "./ResultDialog";

export default function AdminPanel({ tournament }) {
  const [rounds, setRounds] = useState([]);
  const [dialog, setDialog] = useState(null); // { round, table, pairing }

  async function reload() {
    setRounds(await getAllRounds(tournament.id));
  }
  useEffect(()=>{ if (tournament?.id) reload(); }, [tournament?.id]);

  async function handleStart() {
    await startTournamentSE(tournament.id);
    await reload();
  }

  async function handleAdvance() {
    const last = rounds[rounds.length - 1];
    if (!last) return;
    const res = await advanceNextRoundSE(tournament.id, last.round);
    await reload();
    if (res.done) alert("대회 종료! 우승이 확정되었습니다.");
  }

  const last = rounds[rounds.length - 1];
  const canStart = tournament.status === "reg";
  const canAdvance = tournament.status === "live" && last;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">운영자 패널</h3>
        <div className="flex gap-2">
          <button disabled={!canStart} onClick={handleStart}
            className={`px-3 py-2 rounded ${canStart?'bg-green-600 text-white':'bg-gray-300'}`}>
            대회 시작(1R 생성)
          </button>
          <button disabled={!canAdvance} onClick={handleAdvance}
            className={`px-3 py-2 rounded ${canAdvance?'bg-blue-600 text-white':'bg-gray-300'}`}>
            다음 라운드 생성
          </button>
        </div>
      </div>

      {/* 라운드/매치 목록 + 결과 입력 버튼 */}
      <div className="space-y-3">
        {rounds.map(r => (
          <div key={r.id} className="border rounded p-2">
            <div className="font-medium mb-2">Round {r.round}</div>
            <div className="grid md:grid-cols-2 gap-2">
              {r.pairings.map(p => (
                <div key={p.table} className="border rounded p-2">
                  <div className="text-sm text-gray-600">Table {p.table}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div>⚫ {p.black ?? "-"}</div>
                      <div>⚪ {p.white ?? "-"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{p.result ?? "결과 미입력"}</div>
                      <button
                        className="mt-1 px-2 py-1 text-sm rounded bg-gray-800 text-white"
                        onClick={()=>setDialog({ round: r.round, table: p.table, pairing: p })}>
                        결과 입력
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rounds.length === 0 && <div className="text-sm text-gray-500">아직 생성된 라운드가 없습니다.</div>}
      </div>

      {dialog && (
        <ResultDialog
          tournamentId={tournament.id}
          round={dialog.round}
          table={dialog.table}
          pairing={dialog.pairing}
          onClose={()=>{ setDialog(null); reload(); }}
        />
      )}
    </div>
  );
}
