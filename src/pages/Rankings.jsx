// src/pages/Rankings.jsx
import React, { useEffect, useState } from "react";
import { getSeasonRanking } from "../api/standings";

export default function Rankings() {
  const [rows, setRows] = useState([]);
  useEffect(() => { (async () => setRows(await getSeasonRanking({ top: 100 })))(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">시즌 랭킹</h1>
      <div className="overflow-x-auto">
        <table className="min-w-[480px] w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">순위</th>
              <th className="py-2 px-2">닉네임</th>
              <th className="py-2 px-2">포인트</th>
              <th className="py-2 px-2">마일리지</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2">{i+1}</td>
                <td className="py-2 px-2">{u.nickname || u.id}</td>
                <td className="py-2 px-2">{u.tourPoints ?? 0}</td>
                <td className="py-2 px-2">{u.mileage ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
