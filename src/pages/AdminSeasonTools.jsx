import React, { useState } from 'react';
import { deleteAllMatches, resetApplicationsStats, seedPlayerStatsForSeason } from '../utils/adminTools';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminSeasonTools() {
  const [seasonId, setSeasonId] = useState('S1');
  const [seasonName, setSeasonName] = useState('Season 1');

  const createSeasonDoc = async () => {
    await setDoc(doc(db, 'seasons', seasonId), {
      name: seasonName,
      status: 'active',
      startAt: serverTimestamp(),
      endAt: null,
    }, { merge: true });
    alert('✅ 시즌 문서 생성/업데이트 완료');
  };

  return (
    <div style={{maxWidth: 720, margin: '40px auto'}}>
      <h2>Season Admin</h2>
      <div style={{display:'grid', gap: 12}}>
        <div>
          <input value={seasonId} onChange={e=>setSeasonId(e.target.value)} placeholder="S1" />
          <input style={{marginLeft:8}} value={seasonName} onChange={e=>setSeasonName(e.target.value)} placeholder="Season 1" />
          <button style={{marginLeft:8}} onClick={createSeasonDoc}>시즌 문서 생성/활성화</button>
        </div>

        <button onClick={async()=>{
          if (!window.confirm('정말 matches를 모두 삭제할까요?')) return;
          await deleteAllMatches();
          alert('✅ matches 삭제 완료');
        }}>matches 모두 삭제</button>

        <button onClick={async()=>{
          await resetApplicationsStats({ baseElo:1500, resetStamina:false });
          alert('✅ matchApplications 스탯 초기화 완료');
        }}>신청 명단 스탯 초기화</button>

        <button onClick={async()=>{
          await seedPlayerStatsForSeason(seasonId, { fromApplications: true, baseElo:1500 });
          alert('✅ playerStats 시드 완료');
        }}>playerStats 시드 (선택)</button>
      </div>
    </div>
  );
}
