import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  addDoc,
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  getDocs, 
  orderBy,
  where 
} from "firebase/firestore";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDxahwb6rmpFDGUlIOPscF-5v7LaFCyp7Y",
  authDomain: "baduk-app.firebaseapp.com",
  projectId: "baduk-app",
  storageBucket: "baduk-app.firebasestorage.app",
  messagingSenderId: "895478052671",
  appId: "1:895478052671:web:e43af7646c47d36fe6c58a",
  measurementId: "G-KQZK8LQ4CS",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google 로그인
const provider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, provider);

// Firestore에 사용자 정보 저장
const addUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      name: user.displayName || "",
      email: user.email || "",
      mileage: 0,
      admin: false, // 기본값은 일반 사용자
      lastLogin: new Date(),
      notificationsEnabled: true,
      profilePicture: user.photoURL || "",
      role: "member",
    });
    console.log("User added successfully:", user.uid);
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

// Firestore에서 `admin` 여부 확인
const checkAdminStatus = async (uid) => {
  const userRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().admin || false;
    }
    console.log("User not found:", uid);
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
// 리그전 참가자 데이터 가져오기
export const getLeaguePlayers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'matchApplications'));  // 'leaguePlayers'는 Firebase Firestore 컬렉션 이름입니다.
    const players = [];
    querySnapshot.forEach((doc) => {
      players.push(doc.data());  // 각 참가자의 데이터를 players 배열에 추가
    });
    return players;  // 참가자 데이터 반환
  } catch (error) {
    console.error('Error getting league players:', error);
    return [];  // 오류가 발생하면 빈 배열 반환
  }
};
// 관리자 권한 설정
const setAdminRole = async (userId, isAdmin) => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, { admin: isAdmin });
    console.log(`Admin role set for ${userId}: ${isAdmin}`);
  } catch (error) {
    console.error("Error setting admin role:", error);
  }
};

// 마일리지 업데이트
const updateMileage = async (userId, amount) => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      mileage: increment(amount),
    });
    console.log(`Mileage updated for ${userId}: ${amount}`);
  } catch (error) {
    console.error("Error updating mileage:", error);
  }
};

// 인증 상태 감지 및 사용자 정보 업데이트
const listenAuthStateChange = (setUser, setUserData) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
          await updateDoc(userRef, { lastLogin: new Date() });
        } else {
          await addUser(user);
          setUserData({
            name: user.displayName || "",
            email: user.email || "",
            mileage: 0,
            admin: false,
            lastLogin: new Date(),
            notificationsEnabled: true,
            profilePicture: user.photoURL || "",
            role: "member",
          });
        }
      } catch (error) {
        console.error("Error fetching user data on auth state change:", error);
      }
    } else {
      setUserData(null);
    }
    setUser(user);
  });
};

// ELO 기록 가져오기
const getEloHistory = async (userId) => {
  const matchesRef = collection(db, "matches");
  const q = query(matchesRef, orderBy("date"));
  try {
    const matchSnapshot = await getDocs(q);
    const eloHistory = matchSnapshot.docs
      .map(doc => doc.data())
      .filter(match => match.winner === userId || match.loser === userId)
      .map(match => ({
        date: match.date.toDate(),
        eloAfter: match.winner === userId ? match.winnerElo : match.loserElo
      }));
    return eloHistory;
  } catch (error) {
    console.error("Error fetching ELO history:", error);
    return [];
  }
};

// ELO 가져오기
// ELO 가져오기 (matchApplications에서)
const getPlayerELO = async (userId) => {
  const matchRef = collection(db, "matchApplications");  // matchApplications 컬렉션 참조
  const q = query(matchRef, where("userId", "==", userId));  // userId로 필터링

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // ELO 계산 또는 가져오는 로직을 여기서 처리
      let elo = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 예시: 매치 결과에 따른 ELO 갱신
        if (data.result === "win") {
          elo += 10;  // 승리시 ELO 증가
        } else if (data.result === "loss") {
          elo -= 10;  // 패배시 ELO 감소
        }
      });
      return elo;
    } else {
      console.log("No matches found for user:", userId);
      return 0;  // 매치 기록이 없으면 ELO 0
    }
  } catch (error) {
    console.error("Error getting player ELO:", error);
    return 0;
  }
};


// ELO 업데이트
// ELO 업데이트 (matchApplications에서)
const updatePlayerELO = async (userId, newElo) => {
  const matchRef = collection(db, "matchApplications");  // matchApplications 컬렉션 참조
  const q = query(matchRef, where("userId", "==", userId));  // userId로 필터링

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // 해당 userId의 매치 기록을 찾아서 ELO 업데이트
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        const updatedElo = newElo;  // 새로운 ELO 값
        await updateDoc(docRef, { elo: updatedElo });
        console.log(`ELO updated for match ${doc.id} for user ${userId}: ${updatedElo}`);
      });
    } else {
      console.log("No matches found for user:", userId);
    }
  } catch (error) {
    console.error("Error updating player ELO:", error);
  }
};


// matchApplications에서 특정 선수의 경기 기록 가져오기
export const getMatchApplications = async (playerName) => {
  try {
    const q = query(
      collection(db, 'matchApplications'),
      where('playerName', '==', playerName)  // 'playerName' 필드를 기준으로 필터링
    );
    const querySnapshot = await getDocs(q);
    const matches = [];
    querySnapshot.forEach((doc) => {
      matches.push(doc.data());  // 경기 데이터를 matches 배열에 추가
    });
    return matches;
  } catch (error) {
    console.error('Error getting match applications:', error);
    return [];  // 오류가 발생하면 빈 배열 반환
  }
};

// 전체 사용자 목록 가져오기 (관리자 전용 기능)
const getUsers = async () => {
  const usersCol = collection(db, "users");
  const q = query(usersCol);
  try {
    const userSnapshot = await getDocs(q);
    return userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// 로그아웃 함수
const logout = () => signOut(auth).catch(error => {
  console.error("Error during sign out:", error);
});

export { 
  auth, 
  db, 
  signInWithGoogle,
  logout,
  listenAuthStateChange,
  updateMileage,
  checkAdminStatus,
  setAdminRole,
  getUsers,
  getEloHistory,
  getPlayerELO,
  updatePlayerELO
};
