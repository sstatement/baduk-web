// src/components/tournaments/StandingsTable.jsx
import React from "react";

export default function StandingsTable({ rows, usersMap }) {
  if (!rows?.length) return <div className="text-sm text-gray-500">결과가 없습니다.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[480px] w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-2">순위</th>
            <th className="py-2 px-2">플레이어</th>
            <th className="py-2 px-2">비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const name = usersMap?.[r.userId]?.nickname || r.userId;
            return (
              <tr key={r.userId} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2">{r.rank}</td>
                <td className="py-2 px-2">{name}</td>
                <td className="py-2 px-2 text-gray-600">{/* 필요시 W/L/SOS 등 표시 */}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
