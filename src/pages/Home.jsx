import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

// 필요한 컴포넌트 임포트
import Section1 from "../components/Section1";
import Section2 from "../components/Section2";
import Article from "../components/Article";
import Aside from "../components/Aside";
import Footer from "../components/Footer";
import Slider from "../components/AdSlider"; // 슬라이더 컴포넌트 추가

const Home = ({ user }) => {
  const navigate = useNavigate();

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
      {/* 메인 레이아웃 */}
      <div className="main-layout">
        {/* 왼쪽 섹션 */}
        <div className="left-section">
          <Slider />
          <Section1 />
          <Section2 />
        </div>
  
        {/* 오른쪽 섹션 */}
        <div className="right-section">
          <Article user={user} handleLogout={handleLogout} />
          <Aside />
        </div>
      </div>
  
    </div>
  );
  
};

export default Home;
