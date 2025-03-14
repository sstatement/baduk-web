// src/pages/Mission/입문.jsx
import React from 'react';

const 입문 = () => {
  return (
    <div className="mission-container">
      <h1>입문</h1>
      <ul>
        <li>바둑돌 바르게 잡는 법과 착점하는 법 익히기</li>
        <li>바둑 기본 용어 10개 외우기</li>
        <li>‘축과 장문’ 같은 기초 포획 기술을 학습 후 적용해보기</li>
        <li>기본적인 사활 문제 5개 풀기</li>
        <li>입문자끼리 1판 대국해보기</li>
        <li>
          "행마 강의 듣기
          <a href="https://www.youtube.com/watch?v=pO0N0dQpHBM" target="_blank" rel="noopener noreferrer">
            유튜브 링크
          </a>
        </li>
        <li>정석 3개 이상 따라 두기</li>
      </ul>
      <h3>보상</h3>
      <p>입문 단계 완료 시 보상이 제공됩니다.</p>
    </div>
  );
};

export default 입문;
