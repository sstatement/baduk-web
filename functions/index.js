const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Firebase Functions에서 관리자의 권한을 부여하는 함수 예시
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  const uid = data.uid; // 호출 시 UID를 받아옵니다.

  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can assign roles');
  }

  try {
    // 특정 사용자의 custom claims로 admin 권한 설정
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { message: 'Admin role has been set for user: ' + uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
