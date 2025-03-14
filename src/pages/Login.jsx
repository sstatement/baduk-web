import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import googleImage from "../images/google.jpg";
const Login = () => {
  const navigate = useNavigate();

  // 구글 로그인 함수
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/"); // 로그인 성공 시 홈 페이지로 이동
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
