import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useSeason } from '../../contexts/SeasonContext'; // 있어도 되고 없어도 됨

const historyCss = `
:root{
  --ink:#121417;
  --ink-2:#374151;
  --muted:#6b7280;
  --paper:#fbfaf7;
  --card:#ffffff;
  --line:#e5e7eb;
  --gold:#d6b36a;
  --gold-deep:#b0893d;
  --emerald:#10b981;
  --emerald-2:#065f46;
  --amber:#f59e0b;
  --amber-2:#7c4a03;
  --crimson:#991b1b;
  --focus:#155eef;
}

@media (prefers-color-scheme: dark){
  :root{
    --ink:#f3f4f6; --ink-2:#e5e7eb; --muted:#cbd5e1;
    --paper:#151517; --card:#1b1c1f; --line:#2a2d33;
    --gold:#e2c178; --gold-deep:#caa85b;
  }
}

@media (prefers-reduced-motion: reduce){
  .hx-anim, .hx-shine, .hx-fade, .hx-rise { animation:none !important; transition:none !important; }
}

/* 페이지 배경 */
.hx-page{
  min-height:100vh; padding:28px 20px;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(214,179,106,.15), transparent 60%),
    linear-gradient(180deg, var(--paper), #fff);
}

/* 컨테이너(카드) */
.hx-container{
  max-width: 920px; margin: 0 auto 50px; background: var(--card);
  border-radius: 16px; padding: 24px 22px;
  box-shadow: 0 14px 36px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.03) inset;
  color: var(--ink);
}

/* 타이틀 */
.hx-title{
  font-size: 28px; font-weight: 900; text-align:center; margin: 0 0 16px; letter-spacing:.4px;
  color: var(--ink);
  text-shadow: 0 1px 0 rgba(255,255,255,.25);
}
.hx-title::after{
  content:""; display:block; height: 2px; width:min(520px,86%);
  margin: 12px auto 0;
  background:
    linear-gradient(90deg, transparent 0 6%, var(--gold) 6% 94%, transparent 94% 100%);
  box-shadow: 0 0 12px rgba(214,179,106,.35);
}

/* 구분 소제목 */
.hx-subtitle{
  font-size: 18px; font-weight: 800; color: var(--ink-2);
  border-bottom: 2px solid var(--line); padding-bottom: 8px; margin: 22px 0 16px;
}

/* 폼 카드 */
.hx-form{
  background: linear-gradient(180deg, rgba(214,179,106,.06), rgba(214,179,106,.02));
  border:1px solid var(--line);
  border-radius: 12px; padding: 16px;
}

/* 3열 그리드(모바일 1열) */
.hx-grid{
  display:grid; gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 780px){ .hx-grid{ grid-template-columns: 1fr; } }

/* 인풋 */
.hx-input{
  width:100%; border: 1.8px solid var(--ink-2); border-radius: 10px;
  background: #f7f8fb; color: var(--ink);
  padding: 12px 14px; font-size: 15px;
  outline: none; transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.hx-input:focus{
  border-color: var(--focus); background:#fff;
  box-shadow: 0 0 0 3px rgba(21,94,239,.15);
}

/* 메인 버튼 */
.hx-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  width:100%; border:none; cursor:pointer; user-select:none;
  background: linear-gradient(180deg, #1f2937, #0f172a);
  color:#f8fafc; font-weight:800; font-size:16px; padding: 12px 16px;
  border-radius: 12px; position: relative; overflow:hidden;
  transition: transform .12s ease, box-shadow .2s ease, opacity .2s ease;
  box-shadow: 0 10px 28px rgba(0,0,0,.22);
}
.hx-btn:hover{ transform: translateY(-1px); box-shadow: 0 16px 36px rgba(0,0,0,.28); }
.hx-btn:disabled{ background:#6b7280; cursor:not-allowed; }

.hx-shine::after{
  content:""; position:absolute; inset:0; background:
    linear-gradient(120deg, transparent 0 30%, rgba(255,255,255,.18) 35% 50%, transparent 55% 100%);
  transform: translateX(-120%); pointer-events:none;
  animation: shine 2.8s ease-in-out infinite;
}
@keyframes shine { 0%{ transform: translateX(-120%) } 60%{ transform: translateX(110%) } 100%{ transform: translateX(110%) } }

/* 리스트 카드 */
.hx-item{
  border:1px solid var(--line); border-radius: 12px; padding: 14px 16px; margin-bottom: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.8));
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
  position: relative; overflow:hidden;
  transition: box-shadow .2s ease, transform .12s ease;
}
.hx-item::before{
  content:""; position:absolute; left:0; top:0; bottom:0; width:6px;
  background: linear-gradient(180deg, var(--gold), var(--gold-deep));
  opacity:.8;
}
.hx-item:hover{ box-shadow: 0 8px 24px rgba(0,0,0,.16); transform: translateY(-1px); }

/* 라벨-값 정렬 */
.hx-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin: 4px 0; }
.hx-label{ font-weight:900; color: var(--ink); min-width: 68px; }
.hx-val{ color: var(--ink-2); }

/* 상태 배지 */
.hx-badges{ display:flex; gap:8px; flex-wrap:wrap; margin-top: 10px; }
.hx-badge{
  display:inline-flex; align-items:center; gap:6px; padding: 6px 10px;
  border-radius: 9999px; font-weight:900; font-size: 12px; letter-spacing:.3px;
  border:1px solid transparent;
}
.hx-badge.pending{ color:#7a4a00; background: rgba(245,158,11,.18); border-color: rgba(245,158,11,.45); }
.hx-badge.approved{ color:#064e3b; background: rgba(16,185,129,.18); border-color: rgba(16,185,129,.45); }

/* 관리자 액션 */
.hx-actions{ display:flex; gap:8px; margin-top: 10px; }
.hx-approve{
  background: linear-gradient(180deg, #166534, #065f46);
  color:#d1fae5; border:none; border-radius: 10px; padding: 8px 14px; font-weight:800; cursor:pointer;
  box-shadow: 0 8px 20px rgba(6,95,70,.35);
}
.hx-approve:disabled{ background:#4d7c0f; cursor:not-allowed; }
.hx-delete{
  background: linear-gradient(180deg, #b91c1c, #7f1d1d);
  color:#fee2e2; border:none; border-radius: 10px; padding: 8px 14px; font-weight:800; cursor:pointer;
  box-shadow: 0 8px 20px rgba(127,29,29,.35);
}

/* 메시지 */
.hx-msg{ margin-top:10px; font-weight:800; color:#b91c1c; }

/* 리스트 그룹 제목 여백 */
.hx-block{ margin-bottom: 36px; }
`;

const History = () => {
  // 시즌 ID (Provider 없으면 S1 폴백)
  const seasonCtx = useSeason?.();
  const seasonId = seasonCtx?.activeSeasonId ?? 'S1';

  const [matchResults, setMatchResults] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [winner, setWinner] = useState('');
  const [loser, setLoser] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [playerStatsMap, setPlayerStatsMap] = useState({});
  const [approvingId, setApprovingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setUserRole(userDoc.data().role || 'user');
        await fetchPlayers();
        await fetchMatchResults();
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  const fetchPlayers = async () => {
    try {
      const playersRef = collection(db, 'matchApplications');
      const querySnapshot = await getDocs(playersRef);
      const playersList = [];
      const stats = {};
      querySnapshot.forEach((docu) => {
        const data = docu.data();
        if (data.playerName) {
          playersList.push(data.playerName);
          stats[data.playerName] = {
            rating: data.rating ?? 1000,
            winRate: data.winRate ?? 0,
          };
        }
      });
      setPlayers(playersList);
      setPlayerStatsMap(stats);
    } catch (error) {
      console.error('선수 목록 불러오기 실패:', error);
    }
  };

  const updatePlayerStatsAndMatch = async (winnerName, loserName, matchDocId) => {
    if (approvingId === matchDocId) return;
    setApprovingId(matchDocId);
    try {
      const playersRef = collection(db, 'matchApplications');

      const qWinner = query(playersRef, where('playerName', '==', winnerName));
      const winnerSnapshot = await getDocs(qWinner);
      if (winnerSnapshot.empty) return;
      const winnerDoc = winnerSnapshot.docs[0];
      const winnerData = winnerDoc.data();

      const qLoser = query(playersRef, where('playerName', '==', loserName));
      const loserSnapshot = await getDocs(qLoser);
      if (loserSnapshot.empty) return;
      const loserDoc = loserSnapshot.docs[0];
      const loserData = loserDoc.data();

      const winnerWin = winnerData.win || 0;
      const winnerLoss = winnerData.loss || 0;
      const winnerRating = winnerData.rating || 1000;

      const loserWin = loserData.win || 0;
      const loserLoss = loserData.loss || 0;
      const loserRating = loserData.rating || 1000;

      const newWinnerWin = winnerWin + 1;
      const newLoserLoss = loserLoss + 1;

      const winnerWinRate = newWinnerWin / (newWinnerWin + winnerLoss);
      const loserWinRate = loserWin / (loserWin + newLoserLoss);

      const K = 32;
      const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
      const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
      const updatedWinnerRating = winnerRating + K * (1 - expectedWinner);
      const updatedLoserRating = loserRating + K * (0 - expectedLoser);

      await updateDoc(doc(db, 'matchApplications', winnerDoc.id), {
        win: newWinnerWin,
        loss: winnerLoss,
        winRate: winnerWinRate,
        rating: updatedWinnerRating,
      });

      await updateDoc(doc(db, 'matchApplications', loserDoc.id), {
        win: loserWin,
        loss: newLoserLoss,
        winRate: loserWinRate,
        rating: updatedLoserRating,
      });

      await updateDoc(doc(db, 'matches', matchDocId), {
        status: 'approve',
        seasonId,
        winnerELO: updatedWinnerRating,
        loserELO: updatedLoserRating,
        winnerWinRate,
        loserWinRate,
      });

      fetchMatchResults();
      fetchPlayers();
    } catch (error) {
      console.error('업데이트 실패:', error);
    } finally {
      setApprovingId(null);
    }
  };

  const fetchMatchResults = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const qApproved = query(matchesRef, where('status', '==', 'approve'), where('seasonId', '==', seasonId));
      const qPending = query(matchesRef, where('status', '==', 'pending'), where('seasonId', '==', seasonId));

      const approvedSnapshot = await getDocs(qApproved);
      const approvedResults = approvedSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      approvedResults.sort((a, b) => (b.date?.toDate?.() ?? 0) - (a.date?.toDate?.() ?? 0));
      setMatchResults(approvedResults);

      const pendingSnapshot = await getDocs(qPending);
      const pendingResultsArr = pendingSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      pendingResultsArr.sort((a, b) => (b.date?.toDate?.() ?? 0) - (a.date?.toDate?.() ?? 0));
      setPendingResults(pendingResultsArr);

    } catch (error) {
      console.error('대전 기록 불러오기 실패:', error);
    }
  };

  const saveMatchResult = async () => {
    if (saving) return;
    setMessage('');
    if (!winner || !loser || !date) {
      setMessage('날짜, 승자, 패자를 모두 입력해주세요.');
      return;
    }
    if (winner === loser) {
      setMessage('승자와 패자는 같을 수 없습니다.');
      return;
    }
    if (!players.includes(winner) || !players.includes(loser)) {
      setMessage('승자 또는 패자가 등록된 참가자가 아닙니다.');
      return;
    }

    setSaving(true);
    try {
      const matchesRef = collection(db, 'matches');
      await addDoc(matchesRef, {
        seasonId,
        date: new Date(date),
        winner,
        loser,
        status: 'pending',
        createdAt: new Date(),
      });
      setMessage('대국 결과가 저장되었습니다. 관리자의 승인을 기다려주세요.');
      setWinner('');
      setLoser('');
      setDate('');
      fetchMatchResults();
    } catch (error) {
      console.error('대국 결과 저장 실패:', error);
      setMessage('대국 결과 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMatch = async (matchId) => {
    const confirmDelete = window.confirm('정말로 이 대전 기록을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'deleted',
        deletedAt: new Date(),
      });
      await fetchMatchResults();
    } catch (error) {
      console.error('대전 기록 삭제 실패:', error);
      setMessage('대전 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="hx-page">
      <style>{historyCss}</style>

      <div className="hx-container">
        <h2 className="hx-title">대전 기록 입력</h2>

        {/* 입력 폼 */}
        <div className="hx-form hx-block" role="form" aria-label="대전 기록 입력 폼">
          <div className="hx-grid" style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="승자 이름"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              list="players-list"
              className="hx-input"
              autoComplete="off"
              aria-label="승자 이름"
            />
            <input
              type="text"
              placeholder="패자 이름"
              value={loser}
              onChange={(e) => setLoser(e.target.value)}
              list="players-list"
              className="hx-input"
              autoComplete="off"
              aria-label="패자 이름"
            />
            <datalist id="players-list">
              {players.map((player) => (
                <option key={player} value={player} />
              ))}
            </datalist>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="hx-input"
              aria-label="대국 날짜"
            />
          </div>

          <button
            onClick={saveMatchResult}
            disabled={saving}
            className="hx-btn hx-shine"
            aria-live="polite"
          >
            {saving ? '저장 중…' : '대국 결과 저장 (승인 대기)'}
          </button>
          {message && <p className="hx-msg" role="status">{message}</p>}
        </div>

        {/* 대기 중 목록 */}
        <h3 className="hx-subtitle">승인 대기 중인 대전 기록</h3>
        <div className="hx-block">
          {pendingResults.length > 0 ? (
            pendingResults.map(({ id, date, winner, loser }) => (
              <div
                key={id}
                className="hx-item"
                role="article"
                aria-label="승인 대기 대전 기록"
              >
                <div className="hx-row">
                  <span className="hx-label">날짜</span>
                  <span className="hx-val">{new Date(date.toDate()).toLocaleDateString()}</span>
                </div>
                <div className="hx-row">
                  <span className="hx-label">승자</span>
                  <span className="hx-val">{winner}</span>
                </div>
                <div className="hx-row">
                  <span className="hx-label">패자</span>
                  <span className="hx-val">{loser}</span>
                </div>

                <div className="hx-badges" aria-hidden="true">
                  <span className="hx-badge pending">PENDING</span>
                </div>

                {['admin', 'staff'].includes(userRole) && (
                  <div className="hx-actions">
                    <button
                      onClick={() => updatePlayerStatsAndMatch(winner, loser, id)}
                      disabled={approvingId === id}
                      className="hx-approve"
                    >
                      {approvingId === id ? '승인 중…' : '승인하기'}
                    </button>
                    <button
                      onClick={() => deleteMatch(id)}
                      className="hx-delete"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--muted)' }}>승인 대기 중인 대전 기록이 없습니다.</p>
          )}
        </div>

        {/* 승인된 목록 */}
        <h3 className="hx-subtitle">승인된 대전 기록 목록</h3>
        <div className="hx-block">
          {matchResults.length > 0 ? (
            matchResults.map(({ id, date, winner, loser, winnerELO, loserELO, winnerWinRate, loserWinRate }) => {
              const winnerStats = playerStatsMap[winner] || {};
              const loserStats = playerStatsMap[loser] || {};
              const winnerEloToShow = winnerELO ?? winnerStats.rating;
              const loserEloToShow  = loserELO ?? loserStats.rating;
              const winnerRateToShow = winnerWinRate ?? winnerStats.winRate;
              const loserRateToShow  = loserWinRate ?? loserStats.winRate;

              return (
                <div key={id} className="hx-item" role="article" aria-label="승인된 대전 기록">
                  <div className="hx-row">
                    <span className="hx-label">날짜</span>
                    <span className="hx-val">{new Date(date.toDate()).toLocaleDateString()}</span>
                  </div>
                  <div className="hx-row">
                    <span className="hx-label">승자</span>
                    <span className="hx-val">
                      {winner}
                      {' '}<span style={{ color:'#6b7280' }}>
                        (ELO: {winnerEloToShow ? Math.round(winnerEloToShow) : 'N/A'}, 승률: {winnerRateToShow ? (winnerRateToShow * 100).toFixed(1) : '0'}%)
                      </span>
                    </span>
                  </div>
                  <div className="hx-row">
                    <span className="hx-label">패자</span>
                    <span className="hx-val">
                      {loser}
                      {' '}<span style={{ color:'#6b7280' }}>
                        (ELO: {loserEloToShow ? Math.round(loserEloToShow) : 'N/A'}, 승률: {loserRateToShow ? (loserRateToShow * 100).toFixed(1) : '0'}%)
                      </span>
                    </span>
                  </div>

                  <div className="hx-badges" aria-hidden="true">
                    <span className="hx-badge approved">APPROVED</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--muted)' }}>승인된 대전 기록이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
