import React from "react";

// rounds: [{ round, pairings: [{table, black, white, result}] }, ...]
export default function BracketView({ rounds }) {
  if (!rounds || rounds.length === 0) return <div className="text-sm text-gray-500">대진이 없습니다.</div>;
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-[700px]">
        {rounds.map(r => (
          <div key={r.round} className="min-w-[220px]">
            <div className="font-semibold mb-2">Round {r.round}</div>
            <div className="flex flex-col gap-2">
              {r.pairings.map(p => (
                <div key={p.table} className="border rounded p-2">
                  <div className="text-xs text-gray-500">Table {p.table}</div>
                  <div className="truncate">⚫ {p.black ?? "-"}</div>
                  <div className="truncate">⚪ {p.white ?? "-"}</div>
                  <div className="text-xs text-gray-600 mt-1">{p.result ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="min-w-[220px]">
          <div className="font-semibold mb-2">Final</div>
          <div className="text-sm text-gray-500">마지막 라운드가 우승을 결정합니다.</div>
        </div>
      </div>
    </div>
  );
}
