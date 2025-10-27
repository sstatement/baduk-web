import React, { useState } from "react";
import { createTournament } from "../../api/tournaments";

export default function CreateTournamentDialog({ onClose }) {
  const [name, setName] = useState("");
  const [format, setFormat] = useState("se");
  const [desc, setDesc] = useState("");
  const [komi, setKomi] = useState(6.5);

  async function handleCreate() {
    const id = await createTournament({
      name,
      format,
      desc,
      status: "reg",
      rules: { komi, time: { main: 1200, byo: 30, periods: 3 }, handicap: "even" },
      schedule: { startAt: null, rounds: null },
      createdBy: "ADMIN", // 실제에선 로그인 uid
    });
    onClose?.();
    window.location.href = `/tournaments/${id}`;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded p-4 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-3">대회 개최</h2>
        <label className="block mb-2">
          <span className="text-sm">대회명</span>
          <input className="border rounded w-full p-2" value={name} onChange={e=>setName(e.target.value)} />
        </label>
        <label className="block mb-2">
          <span className="text-sm">형식</span>
          <select className="border rounded w-full p-2" value={format} onChange={e=>setFormat(e.target.value)}>
            <option value="se">싱글 엘리미네이션</option>
            <option value="swiss">스위스</option>
            <option value="rr">라운드로빈</option>
          </select>
        </label>
        <label className="block mb-2">
          <span className="text-sm">덤</span>
          <input type="number" step="0.5" className="border rounded w-full p-2" value={komi} onChange={e=>setKomi(parseFloat(e.target.value))} />
        </label>
        <label className="block mb-3">
          <span className="text-sm">요강/설명</span>
          <textarea className="border rounded w-full p-2 min-h-[120px]" value={desc} onChange={e=>setDesc(e.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={onClose}>취소</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}
