// src/pages/league/AdminSeasonClose.jsx
import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; // getFunctions(app)로 초기화되어 있어야 함
import { useSeason } from '../../contexts/SeasonContext';

const box = { background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:16 };

export default function AdminSeasonClose() {
  const { activeSeasonId } = useSeason() || {};
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [topN, setTopN] = useState(3);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);

  const run = async () => {
    if (!activeSeasonId) { alert('활성 시즌이 없습니다.'); return; }
    setLoading(true);
    try {
      const call = httpsCallable(functions, 'finalizeSeason');
      const res = await call({
        seasonId: activeSeasonId,
        newSeason: newId ? { id: newId, name: newName || newId } : undefined,
        topN: Number(topN),
      });
      setOut(res.data);
    } catch (e) {
      alert(`정산 실패: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin:'20px auto', color:'#e5e7eb' }}>
      <div style={{ fontSize:22, fontWeight:900, marginBottom:12 }}>🧮 시즌 정산 (관리자)</div>
      <div style={box}>
        <div style={{ marginBottom:10 }}>현재 시즌: <b>{activeSeasonId || '-'}</b></div>
        <div style={{ display:'grid', gap:8, gridTemplateColumns:'1fr 1fr 100px' }}>
          <input placeholder="새 시즌 ID (예: S4)" value={newId} onChange={e=>setNewId(e.target.value)} />
          <input placeholder="새 시즌 이름 (예: 2025 겨울)" value={newName} onChange={e=>setNewName(e.target.value)} />
          <input type="number" min={1} max={10} value={topN} onChange={e=>setTopN(e.target.value)} />
        </div>
        <div style={{ marginTop:10, display:'flex', gap:8 }}>
          <button disabled={loading} onClick={()=>{setNewId(''); setNewName('');}} style={{ padding:'10px 14px', borderRadius:10 }}>새 시즌 없이 종료</button>
          <button disabled={loading} onClick={run} style={{ padding:'10px 14px', borderRadius:10, fontWeight:900, background:'#0ea5e9', border:'none', color:'#0b1020' }}>
            {loading ? '정산 중…' : '정산 실행'}
          </button>
        </div>
        {out && (
          <pre style={{ marginTop:12, background:'rgba(0,0,0,.35)', padding:12, borderRadius:8, whiteSpace:'pre-wrap' }}>
{JSON.stringify(out, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
