import React, { useState } from "react";
import { joinTournament, leaveTournament } from "../../api/tournaments";

export default function JoinBox({ tournament, me }) {
  const [loading, setLoading] = useState(false);
  const status = tournament.status; // 'reg'|'live'|'done'

  async function handleJoin() {
    setLoading(true);
    try { await joinTournament(tournament.id, me); } finally { setLoading(false); }
  }
  async function handleLeave() {
    setLoading(true);
    try { await leaveTournament(tournament.id, me, status); } finally { setLoading(false); }
  }

  if (status === 'done') return null;

  return (
    <div className="border rounded p-3">
      <div className="font-semibold mb-2">참가</div>
      {status === 'reg' && (
        <div className="flex gap-2">
          <button disabled={loading} className="px-3 py-2 rounded bg-green-600 text-white" onClick={handleJoin}>
            참가 신청
          </button>
          <button disabled={loading} className="px-3 py-2 rounded bg-gray-300" onClick={handleLeave}>
            신청 취소
          </button>
        </div>
      )}
      {status === 'live' && (
        <div className="flex gap-2">
          <button disabled className="px-3 py-2 rounded bg-gray-300">진행중 — 참가 불가</button>
          <button disabled={loading} className="px-3 py-2 rounded bg-red-600 text-white" onClick={handleLeave}>
            대회 중도 포기
          </button>
        </div>
      )}
    </div>
  );
}
