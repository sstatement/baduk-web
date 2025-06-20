import React, { useState } from "react";

const faqData = [
  {
    question: "동아리 가입은 어떻게 하나요?",
    answer: "에브리타임에 '복현기우회'를 검색하고 연락주시거나, 가두모집때 동아리부스로 오시면 됩니다!",
  },

  {
    question: "바둑 대회는 자주 열리나요?",
    answer: "네, 저희 동아리는 연 2회 바둑 대회를 개최하며, 다양한 상과 기념품을 제공합니다.",
  },

  {
    question: "레이팅 리그전에 참여하려면 어떻게 해야 하나요?",
    answer: "구글 로그인을 하면 자동으로 참여됩니다. 또한 대국 결과를 입력하면 관리자나 스테프가 검토 후 승인을 해야 레이팅이 반영됩니다.",
  },
  
  {
    question: "회원비는 얼마인가요?",
    answer: "회원비는 한 학기에 20,000원이며, 다양한 혜택과 활동에 참여하실 수 있습니다.",
  },
  
  {
    question: "초보자도 참여할 수 있나요?",
    answer: "네, 저희 동아리는 멘토-멘티를 통해 초보자도 쉽게 적응할 수 있도록 도움을 드립니다.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      style={{
        maxWidth: "800px",
        margin: "60px auto",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#fef7e5",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        자주 묻는 질문 (FAQ)
      </h2>
      {faqData.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              marginBottom: "10px",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            <button
              onClick={() => toggle(index)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "500",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    marginRight: "8px",
                  }}
                >
                  &gt;
                </span>
                {item.question}
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? "200px" : "0px",
                padding: isOpen ? "0 16px 16px" : "0 16px",
                fontSize: "14px",
                color: "#333",
                transition: "max-height 0.4s ease, padding 0.3s ease",
                overflow: "hidden",
              }}
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </section>
  );
}
