import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore 인스턴스 import
import googleImage from "../images/google.jpg"; // 구글 로고 이미지

const auth = getAuth();
const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 모바일에서는 리디렉트 로그인 사용
      signInWithRedirect(auth, provider);
    } else {
      // PC에서는 팝업 로그인 사용
      signInWithPopup(auth, provider)
        .then(async (result) => {
          const user = result.user;

          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              createdAt: new Date(),
            });
            navigate("/setup-profile");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("구글 로그인 실패:", error);
          alert("구글 로그인 중 오류가 발생했습니다.");
        });
    }
  };

  // 모바일에서 리디렉트 후 로그인 결과 처리
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const user = result.user;

          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              createdAt: new Date(),
            });
            navigate("/setup-profile");
          } else {
            navigate("/");
          }
        }
      })
      .catch((error) => {
        // 리디렉트 실패 처리
        console.error("구글 로그인 실패:", error);
      });
  }, [navigate]);

  return (
    <div className="login-page">
      <button onClick={handleGoogleLogin} className="google-login-btn">
        <img src={googleImage} alt="Google Logo" width="20" height="20" />
        구글로 로그인
      </button>
    </div>
  );
};

export default Login;
