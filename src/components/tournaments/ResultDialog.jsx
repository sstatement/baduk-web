import React, { useState } from "react";
import { saveMatchResult } from "../../api/admin";

export default function ResultDialog({ tournamentId, round, table, pairing, onClose }) {
  const [type, setType] = useState("B+R");  // B+R/W+R(불계), B+T/W+T(시간), B+7.5/W+2.5(집수)
  const [margin, setMargin] = useState(""); // 집수 입력 시 사용
  const [date, setDate] = useState(new Date().toISOString().slice(0,16)); // local datetime
  const [sgfUrl, setSgfUrl] = useState("");
  const [saving, setSaving] = useState(false);

  function toResult() {
    if (type.includes("+") && (type.endsWith("R") || type.endsWith("T"))) return type;
    // 집수: B+<n> / W+<n>
    if (type.startsWith("B+") || type.startsWith("W+")) {
      const n = parseFloat(margin);
      if (!Number.isFinite(n)) return type; // fallback
      return `${type.split("+")[0]}+${n}`;
    }
    return type;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const resultStr = toResult();
      const winner = resultStr.startsWith("B+") ? pairing.black : pairing.white;
      await saveMatchResult({
        tournamentId, round, table,
        payload: {
          result: resultStr,
          winner: winner ?? null,
          date: new Date(date),
          sgfUrl: sgfUrl || null
        }
      });
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">결과 입력 — R{round} / Table {table}</h3>
        <div className="text-sm text-gray-700 mb-2">
          ⚫ {pairing.black ?? "-"} vs ⚪ {pairing.white ?? "-"}
        </div>

        <label className="block mb-2">
          <span className="text-sm">결과 타입</span>
          <select className="border rounded w-full p-2" value={type} onChange={e=>setType(e.target.value)}>
            <optgroup label="불계">
              <option value="B+R">흑 불계승 (B+R)</option>
              <option value="W+R">백 불계승 (W+R)</option>
            </optgroup>
            <optgroup label="시간승">
              <option value="B+T">흑 시간승 (B+T)</option>
              <option value="W+T">백 시간승 (W+T)</option>
            </optgroup>
            <optgroup label="집수승">
              <option value="B+">흑 집수승 (B+n)</option>
              <option value="W+">백 집수승 (W+n)</option>
            </optgroup>
          </select>
        </label>

        { (type === "B+" || type === "W+") && (
          <label className="block mb-2">
            <span className="text-sm">집수 n (예: 7.5)</span>
            <input className="border rounded w-full p-2" value={margin} onChange={e=>setMargin(e.target.value)} />
          </label>
        )}

        <label className="block mb-2">
          <span className="text-sm">대국 일시</span>
          <input type="datetime-local" className="border rounded w-full p-2"
                 value={date} onChange={e=>setDate(e.target.value)} />
        </label>

        <label className="block mb-3">
          <span className="text-sm">SGF URL (선택)</span>
          <input className="border rounded w-full p-2" placeholder="https://..."
                 value={sgfUrl} onChange={e=>setSgfUrl(e.target.value)} />
        </label>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={onClose}>취소</button>
          <button disabled={saving} className="px-3 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
