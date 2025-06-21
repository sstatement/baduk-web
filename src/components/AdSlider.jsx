import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Img2 from "../images/바통 원츄.jpg";
import Img3 from "../images/바통이.jpg";
import Img4 from "../images/훈수 안돼요.jpg";

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
      link: "/league/ranking",
    },
    {
      image: Img4,
      title: "주간 퀘스트",
      description: "주간 퀘스트를 확인하고 참여하세요.",
      link: "/quest",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        height: "400px",
        margin: "40px auto",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Link to={slides[currentIndex].link}>
        <img
          src={slides[currentIndex].image}
          alt={slides[currentIndex].title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            padding: "20px",
            background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
            color: "white",
            transition: "0.5s ease",
          }}
        >
          <h2 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>
            {slides[currentIndex].title}
          </h2>
          <p style={{ fontSize: "16px", margin: 0 }}>{slides[currentIndex].description}</p>
        </div>
      </Link>

      {/* 이전 버튼 */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ‹
      </button>

      {/* 다음 버튼 */}
      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ›
      </button>

      {/* 인디케이터 */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor:
                currentIndex === index ? "white" : "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdSlider;
