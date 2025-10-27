/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * HTTPS callable: 특정 사용자에게 admin 권한 부여
 * @param {Object} data 요청 데이터
 * @param {string} data.uid 권한을 부여할 사용자 UID
 * @param {Object} context 호출 컨텍스트(인증 정보 포함)
 * @returns {Promise<{message: string}>} 처리 결과 메시지
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  const uid = data.uid;

  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can assign roles",
    );
  }

  try {
    await admin.auth().setCustomUserClaims(uid, {admin: true});
    return {
      message: "Admin role has been set for user: " + uid,
    };
  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }
});

/**
 * 해당 대회의 모든 라운드 문서를 로드합니다.
 * @param {string} tid 토너먼트 ID
 * @return {Promise<Array<Object>>} 라운드 배열(라운드 오름차순)
 */
async function getAllRounds(tid) {
  const snap = await db
      .collection("rounds")
      .where("tournamentId", "==", tid)
      .get();

  const rows = snap.docs
      .map((d) => d.data())
      .sort((a, b) => a.round - b.round);

  return rows;
}

/**
 * 포인트 테이블을 반환합니다. 없으면 기본값을 사용합니다.
 * @param {Object} t 토너먼트 문서 데이터
 * @param {Array<number>} [t.pointsTable] 커스텀 포인트 테이블
 * @return {Array<number>} 포인트 테이블
 */
function getPointsTable(t) {
  return (t.pointsTable && t.pointsTable.length) ?
    t.pointsTable :
    [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
}

/**
 * SE(싱글 엘리미) 기준 최종 순위를 간단히 계산합니다.
 * - 마지막 라운드 승자가 1위, 나머지는 이전 라운드 승자 순으로 나열.
 * @param {Array<Object>} rounds 라운드 문서 배열
 * @return {Array<string>} 유저 ID 순위 배열
 */
function computeFinalOrderSE(rounds) {
  if (!rounds || rounds.length === 0) return [];

  const last = rounds[rounds.length - 1];
  const winners = [];

  if (last && Array.isArray(last.pairings)) {
    last.pairings.forEach((p) => {
      if (p.winner) winners.push(p.winner);
    });
  }

  const prevWinners = new Set();
  rounds.slice(0, -1).forEach((r) => {
    if (Array.isArray(r.pairings)) {
      r.pairings.forEach((p) => {
        if (p.winner) prevWinners.add(p.winner);
      });
    }
  });

  const rest = [...prevWinners].filter((uid) => winners.indexOf(uid) === -1);
  return [...winners, ...rest];
}

/**
 * standings/{tid} 문서를 생성/갱신합니다.
 * @param {string} tid 토너먼트 ID
 * @param {Array<string>} order 유저 ID 순위 배열
 * @return {Promise<void>} 없음
 */
async function writeStandings(tid, order) {
  const rows = order.map((uid, i) => ({
    userId: uid,
    rank: i + 1,
    W: null,
    D: null,
    L: null,
    score: null,
  }));

  await db.doc(`standings/${tid}`).set(
      {
        rows,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
  );
}

/**
 * 우승/상위N 마일리지 및 시즌 포인트를 지급합니다.
 * @param {Object} tournament 토너먼트 데이터(id 포함)
 * @param {string} tournament.id 토너먼트 ID
 * @param {Array<number>} [tournament.pointsTable] 포인트 테이블
 * @param {Array<string>} order 유저 ID 순위 배열
 * @return {Promise<void>} 없음
 */
async function applyAwards(tournament, order) {
  const tid = tournament.id;
  const table = getPointsTable(tournament);
  const batch = db.batch();

  // 시즌 포인트
  order.forEach((uid, idx) => {
    const pts = table[idx] || 0;
    if (pts <= 0) return;
    const uref = db.doc(`users/${uid}`);
    batch.set(
        uref,
        {tourPoints: admin.firestore.FieldValue.increment(pts)},
        {merge: true},
    );
  });

  // 마일리지 (1위 1000, 2위 500, 3위 300)
  const mileageMap = [1000, 500, 300];
  order.slice(0, mileageMap.length).forEach((uid, idx) => {
    const amount = mileageMap[idx];

    const mref = db.collection("mileage").doc();
    batch.set(mref, {
      userId: uid,
      tournamentId: tid,
      amount,
      reason: idx === 0 ? "winner" : "topN",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const uref = db.doc(`users/${uid}`);
    batch.set(
        uref,
        {mileage: admin.firestore.FieldValue.increment(amount)},
        {merge: true},
    );
  });

  await batch.commit();
}

/**
 * live→done 전이 시 스탠딩/포인트/마일리지 처리(중복 방지 포함)
 * @returns {functions.CloudFunction} 함수
 */
exports.onTournamentDone = functions.firestore
    .document("tournaments/{tid}")
    .onUpdate(async (change, context) => {
      const before = change.before.data();
      const after = change.after.data();

      const wasLive = before && before.status === "live";
      const isDoneNow = after && after.status === "done";
      if (!wasLive || !isDoneNow) return null;

      // 중복 방지 플래그
      if (after.awardsApplied === true) return null;

      const tid = context.params.tid;

      try {
        const rounds = await getAllRounds(tid);
        const order = computeFinalOrderSE(rounds);

        await writeStandings(tid, order);
        await applyAwards({id: tid, ...after}, order);

        await change.after.ref.update({
          awardsApplied: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return null;
      } catch (err) {
        console.error("[onTournamentDone]", tid, err);
        return null;
      }
    });

/**
 * 각 라운드 변경 시: 결승 완료 감지 → 대회 종료
 * @returns {functions.CloudFunction} 함수
 */
exports.onRoundUpdate = functions.firestore
    .document("rounds/{tid_round}")
    .onWrite(async (change) => {
      const data = change.after.exists ? change.after.data() : null;
      if (!data || !data.tournamentId) return null;

      const tid = data.tournamentId;
      const rounds = await getAllRounds(tid);
      if (!rounds.length) return null;

      const last = rounds[rounds.length - 1];
      const winners = (last.pairings || [])
          .map((p) => p.winner)
          .filter(Boolean);

      if (winners.length === 1) {
        await db.doc(`tournaments/${tid}`).set(
            {
              status: "done",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true},
        );
      }
      return null;
    });
