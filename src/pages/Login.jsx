import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import googleImage from "../images/google.jpg";

const Login = () => {
  const navigate = useNavigate();

  // 구글 로그인 함수
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에서 유저 데이터 확인
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 처음 로그인한 유저면 프로필 설정 페이지로
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
        console.log("👉 setup-profile로 이동");
        navigate("/setup-profile");
      } else {
        // 이미 가입한 유저면 홈으로 이동
        navigate("/");
      }
    } catch (error) {
      console.error("구글 로그인 실패:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <button onClick={handleGoogleLogin} className="google-login-btn">
          <img
            src={googleImage}
            alt="Google Logo"
            className="google-icon"
            width="20"
            height="20"
          />
          구글로 로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
