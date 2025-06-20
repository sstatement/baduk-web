import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import Section1 from "../components/Section1";
import Section2 from "../components/Section2";
import Section3 from "../components/Section3";
import Article from "../components/Article";
import Aside from "../components/Aside";
import Slider from "../components/AdSlider";
import RankingPreview from "../components/RankingPreview"; // 추가

const Home = ({ user }) => {
  const navigate = useNavigate();

  // ✅ 구글 로그인 함수 추가
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("로그인 성공");
      // 로그인 성공 후, 리다이렉트가 필요하다면 navigate("/") 등도 가능
    } catch (error) {
      console.error("구글 로그인 오류:", error);
    }
  };

  // 로그아웃 함수
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("로그아웃 성공");
        navigate("/login");
      })
      .catch((error) => {
        console.error("로그아웃 실패:", error);
      });
  };

  return (
    <div className="home-container">
      <div className="main-layout">
        <div className="left-section">
          <Slider />
          <Section1 />
          <Section3 />
        </div>

        <div className="right-section">
          {/* ✅ handleGoogleLogin 추가 */}
          <Article
            user={user}
            handleLogout={handleLogout}
            handleGoogleLogin={handleGoogleLogin}
          />
          <Aside />
          <RankingPreview />
        </div>
        
      </div>
    </div>
  );
};

export default Home;
