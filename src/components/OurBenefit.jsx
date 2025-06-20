import React from "react";
import "../App.css"
const benefits = [
  {
    title: "집중력 향상",
    desc: "바둑은 집중력을 높여주며, 문제 해결 능력을 길러줍니다.",
  },
  {
    title: "전략적 사고",
    desc: "전략적 사고를 통해 다양한 상황에서 유연하게 대처할 수 있습니다.",
  },
  {
    title: "사회적 교류",
    desc: "다양한 사람들과의 교류를 통해 사회적 능력을 향상시킵니다.",
  },
  {
    title: "창의력 증진",
    desc: "바둑은 창의적인 문제 해결 능력을 개발하는 데 도움을 줍니다.",
  },
  {
    title: "자기개발",
    desc: "자신의 한계를 뛰어넘고 새로운 목표를 설정하는 데 유용합니다.",
  },
  {
    title: "취미활동",
    desc: "바둑은 삶의 즐거움을 더해주는 훌륭한 취미활동입니다.",
  },
];

export default function OurBenefit() {
  return (
    <section
      style={{
        maxWidth: "1000px",
        margin: "60px auto",
        padding: "40px 20px",
        backgroundColor: "#fef7e5", // 연한 베이지
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        바둑을 통해 얻는 이점
      </h2>
      <p style={{ textAlign: "center", fontSize: "16px", marginBottom: "32px", color: "#555" }}>
        Our Benefits
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-card">
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>
              {index + 1}. {benefit.title}
            </h3>
            <p style={{ fontSize: "14px", color: "#444" }}>{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
