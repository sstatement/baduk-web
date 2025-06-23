import React from "react";
import { useNavigate } from "react-router-dom";
import bannerImg from "../images/banner.jpg"; // 배너 이미지 불러오기

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      {/* 배너 이미지 (홈으로 이동) */}
      <img
        src={bannerImg} // 배너 이미지 경로 설정
        alt="바둑 동아리"
        className="banner-img cursor-pointer"
        onClick={() => navigate("/")} // 배너 클릭 시 메인화면으로 이동
      />
    </header>
  );
};

export default Header;
