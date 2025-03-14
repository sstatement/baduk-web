import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Img2 from "../images/바통 원츄.jpg";
import Img3 from "../images/바통이.jpg";
import Img4 from "../images/훈수 안돼요.jpg";
import { signInWithGoogle, listenAuthStateChange } from "../firebase"; // listenAuthStateChange 가져오기

// 슬라이드 컴포넌트
const AdSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = [
    {
      image: Img2,
      title: "회원 관리",
      description: "회원 관리 시스템에 대해 알아보세요.",
      link: "/club/members",
    },
    {
      image: Img3,
      title: "바둑 리그전",
      description: "리그전 시스템을 통해 대국 결과를 확인하세요.",
      link: "league/ranking",  // '바둑 리그전' 클릭 시 Ranking.jsx로 이동
    },
    {
      image: Img4,
      title: "주간 퀘스트",
      description: "주간 퀘스트를 확인하고 참여하세요.",
      link: "/quest",  // '주간 퀘스트' 클릭 시 Quest.jsx로 이동
    },
  ];

  // 슬라이드 자동 전환 (5초마다)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, 5000); // 5초마다 슬라이드 변경

    return () => {
      clearInterval(intervalId); // 컴포넌트가 언마운트되면 interval 정리
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  return (
    <div className="ad-slider">
      <Link to={slides[currentIndex].link} className="relative w-full h-full">
        <img
          src={slides[currentIndex].image}
          alt={slides[currentIndex].title}
          className="slider-image"
        />
        <div className="slide-description">
          <h2 className="text-xl font-bold">{slides[currentIndex].title}</h2>
          <p>{slides[currentIndex].description}</p>
        </div>
      </Link>

      <button
        onClick={prevSlide}
        className="prev-button"
      >
        &#10094;
      </button>

      <button
        onClick={nextSlide}
        className="next-button"
      >
        &#10095;
      </button>
    </div>
  );
};

export default AdSlider;
