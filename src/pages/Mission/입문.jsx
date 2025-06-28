// src/pages/Mission/입문.jsx
import React from 'react';

const 입문 = () => {
  return (
    <div className="mission-container p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">입문자 강의</h1>
      <p className="mb-6">
        바둑을 처음 배우는 사람을 위한 단계별 강의입니다. 아래 내용을 차근차근 읽고, 실제로 돌을 놓아보면서 익혀보세요!
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1️⃣ 바둑이란?</h2>
        <p>
          바둑은 두 명이 흑과 백으로 나뉘어 번갈아 돌을 두며 집을 많이 만드는 게임입니다.
          4000년 이상의 역사를 지닌 전략 게임으로, 단순하지만 깊이 있는 매력을 갖습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2️⃣ 바둑판과 돌</h2>
        <p>
          표준 바둑판은 19x19 교차점으로 구성되며, 입문자는 9x9나 13x13에서 배우는 것도 좋습니다.
          용어:
          <ul className="list-disc list-inside mt-2">
            <li>화점: 포석 기준점</li>
            <li>귀: 네 모서리</li>
            <li>변: 가장자리</li>
            <li>중앙: 가운데 영역</li>
          </ul>
          흑이 먼저 두고, 돌은 한 번 두면 움직이지 않습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3️⃣ 착수 방법</h2>
        <p>
          흑이 먼저 두고, 이후 번갈아 둡니다. 돌을 교차점에 놓으며, 자살수(자신이 따이는 자리)는 둘 수 없습니다.
          같은 모양이 반복되지 않도록 '패' 규칙이 적용됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4️⃣ 집이란?</h2>
        <p>
          돌로 둘러싼 빈 공간이 집입니다. 대국이 끝난 뒤 각자의 집을 세어 승부를 결정합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5️⃣ 활로와 따냄</h2>
        <p>
          돌이 놓인 교차점에서 자유롭게 숨 쉴 수 있는 선을 '활로'라고 합니다. 활로가 모두 막히면 상대에게 잡힙니다.
          이 과정을 '따냄'이라고 부릅니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6️⃣ 연결과 끊음</h2>
        <p>
          같은 색 돌을 연결하면 함께 살아남을 수 있지만, 끊기면 약해집니다.
          연결과 끊음을 통해 세력을 관리하세요.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">7️⃣ 삶과 죽음</h2>
        <p>
          돌무더기가 두 눈을 만들면 잡히지 않고 살아있다고 합니다.
          살린 모양과 죽은 모양을 구별하는 연습이 중요합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">8️⃣ 공배와 대국 종료</h2>
        <p>
          공배를 메운 뒤 끝내기 과정을 거칩니다. 대국이 종료되면 집을 세어 승패를 결정합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">9️⃣ 패와 복잡한 규칙</h2>
        <p>
          같은 형태의 반복을 막는 '패' 규칙을 반드시 지켜야 합니다.
          패싸움을 이해하고 대응하는 것이 중요합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">10️⃣ 간단한 기본 포석</h2>
        <p>
          초반에 좋은 자리를 차지하는 전략을 포석이라고 합니다.
          화점, 소목, 삼삼 등을 연습하며 배워보세요.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">✅ 미션 과제</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>바둑돌 바르게 잡는 법과 착점하는 법 익히기</li>
          <li>바둑 기본 용어 10개 외우기</li>
          <li>‘축과 장문’ 같은 기초 포획 기술을 학습 후 적용해보기</li>
          <li>기본적인 사활 문제 5개 풀기</li>
          <li>입문자끼리 1판 대국해보기</li>
          <li>
            행마 강의 보기:
            <a
              href="https://www.youtube.com/watch?v=pO0N0dQpHBM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline ml-2"
            >
              유튜브 링크
            </a>
          </li>
          <li>정석 3개 이상 따라 두기</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-2">🎁 보상</h3>
        <p>입문 단계 완료 시 마일리지 또는 소정의 보상이 제공됩니다.</p>
      </section>
    </div>
  );
};

export default 입문;
