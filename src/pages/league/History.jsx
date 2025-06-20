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

const styles = {
  container: {
    maxWidth: 720,
    margin: '40px auto',
    padding: 24,
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    color: '#1f2937', // dark slate
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
  header: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    borderBottom: '3px solid #374151', // dark gray border
    paddingBottom: 8,
    letterSpacing: '0.04em',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 16,
    borderBottom: '2px solid #6b7280', // gray border
    paddingBottom: 6,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 16,
    fontSize: 16,
    borderRadius: 4,
    border: '1.8px solid #374151', // dark slate border
    outline: 'none',
    color: '#111827',
    backgroundColor: '#f3f4f6',
    transition: 'border-color 0.3s ease',
  },
  inputFocus: {
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    fontWeight: '600',
    padding: '12px 0',
    fontSize: 18,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
  },
  message: {
    marginTop: 12,
    color: '#dc2626',
    fontWeight: 600,
  },
  listContainer: {
    marginBottom: 40,
  },
  listItem: {
    backgroundColor: '#e5e7eb', // light gray
    borderRadius: 6,
    padding: 18,
    marginBottom: 18,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s ease',
  },
  listItemHover: {
    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
  },
  listLabel: {
    fontWeight: 600,
    marginRight: 8,
    color: '#111827',
  },
  smallText: {
    fontSize: 13,
    color: '#6b7280',
  },
  approveButton: {
    marginTop: 12,
    backgroundColor: '#166534',
    color: '#d1fae5',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  approveButtonDisabled: {
    backgroundColor: '#4d7c0f',
    cursor: 'not-allowed',
  },
};

const History = () => {
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
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'user');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPlayers = async () => {
    try {
      const playersRef = collection(db, 'matchApplications');
      const querySnapshot = await getDocs(playersRef);
      const playersList = [];
      const stats = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      const qApproved = query(matchesRef, where('status', '==', 'approve'));
      const qPending = query(matchesRef, where('status', '==', 'pending'));

      const approvedSnapshot = await getDocs(qApproved);
      const approvedResults = approvedSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      approvedResults.sort((a, b) => b.date.toDate() - a.date.toDate());
      setMatchResults(approvedResults);

      const pendingSnapshot = await getDocs(qPending);
      const pendingResultsArr = pendingSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      pendingResultsArr.sort((a, b) => b.date.toDate() - a.date.toDate());
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

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>대전 기록 입력</h2>

      <div style={{ ...styles.listItem, backgroundColor: '#f3f4f6', boxShadow: 'none' }}>
        <input
          type="text"
          placeholder="승자 이름"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          list="players-list"
          style={styles.input}
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="패자 이름"
          value={loser}
          onChange={(e) => setLoser(e.target.value)}
          list="players-list"
          style={styles.input}
          autoComplete="off"
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
          style={styles.input}
        />

        <button
          onClick={saveMatchResult}
          disabled={saving}
          style={{
            ...styles.button,
            ...(saving ? styles.buttonDisabled : {}),
          }}
        >
          {saving ? '저장 중...' : '대국 결과 저장 (승인 대기)'}
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      <h3 style={styles.sectionHeader}>승인 대기 중인 대전 기록</h3>
      <div style={styles.listContainer}>
        {pendingResults.length > 0 ? (
          pendingResults.map(({ id, date, winner, loser }) => (
            <div
              key={id}
              style={styles.listItem}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = styles.listItemHover.boxShadow}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = styles.listItem.boxShadow}
            >
              <p><span style={styles.listLabel}>날짜:</span> {new Date(date.toDate()).toLocaleDateString()}</p>
              <p><span style={styles.listLabel}>승자:</span> {winner}</p>
              <p><span style={styles.listLabel}>패자:</span> {loser}</p>
              <p style={styles.smallText}>관리자 승인 대기 중</p>
              {['admin', 'staff'].includes(userRole) && (
                <button
                  onClick={() => updatePlayerStatsAndMatch(winner, loser, id)}
                  disabled={approvingId === id}
                  style={{
                    ...styles.approveButton,
                    ...(approvingId === id ? styles.approveButtonDisabled : {}),
                  }}
                >
                  {approvingId === id ? '승인 중...' : '승인하기'}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>승인 대기 중인 대전 기록이 없습니다.</p>
        )}
      </div>

      <h3 style={styles.sectionHeader}>승인된 대전 기록 목록</h3>
      <div style={styles.listContainer}>
        {matchResults.length > 0 ? (
          matchResults.map(({ id, date, winner, loser, winnerELO, loserELO, winnerWinRate, loserWinRate }) => {
            const winnerStats = playerStatsMap[winner] || {};
            const loserStats = playerStatsMap[loser] || {};

            const winnerEloToShow = winnerELO ?? winnerStats.rating;
            const loserEloToShow = loserELO ?? loserStats.rating;
            const winnerRateToShow = winnerWinRate ?? winnerStats.winRate;
            const loserRateToShow = loserWinRate ?? loserStats.winRate;

            return (
              <div
                key={id}
                style={styles.listItem}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = styles.listItemHover.boxShadow}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = styles.listItem.boxShadow}
              >
                <p><span style={styles.listLabel}>날짜:</span> {new Date(date.toDate()).toLocaleDateString()}</p>
                <p>
                  <span style={styles.listLabel}>승자:</span> {winner} (ELO: {winnerEloToShow ? Math.round(winnerEloToShow) : 'N/A'}, 승률: {winnerRateToShow ? (winnerRateToShow * 100).toFixed(1) : '0'}%)
                </p>
                <p>
                  <span style={styles.listLabel}>패자:</span> {loser} (ELO: {loserEloToShow ? Math.round(loserEloToShow) : 'N/A'}, 승률: {loserRateToShow ? (loserRateToShow * 100).toFixed(1) : '0'}%)
                </p>
              </div>
            );
          })
        ) : (
          <p>승인된 대전 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default History;
