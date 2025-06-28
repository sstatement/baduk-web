// src/pages/Lecture/입문Steps.js
import badukIntro from '../../images/바둑이란.png';
import badukstone from '../../images/바둑판과 돌.jpg';
import badukterms from '../../images/바둑 귀,변,중앙.png';
import badukterritory from '../../images/바둑 집.png';
import badukroad from '../../images/바둑 활로.png';
import badukdeath from '../../images/돌 따내기.png';
import badukconnect from '../../images/돌의 연결.png';
import badukdisconnect from '../../images/돌의 끊음.png';
import baduklife from '../../images/삶.png';
import badukdie from '../../images/죽음.png';
import baduk_ko from '../../images/패.png';
import opening1 from '../../images/기본정석 1.png';
import opening2 from '../../images/기본정석 2.png';
import opening3 from '../../images/기본정석 3.png';

export const 입문Steps = [
  {
    id: 1,
    title: "바둑이란?",
    text: "바둑은 두 명이 번갈아 돌을 두어 집을 만드는 전략 게임입니다. 단순하지만 매우 깊이 있는 매력을 갖습니다.",
    image: badukIntro,
    question: "바둑의 목표는 무엇인가요?",
    answer: "상대보다 더 많은 집을 만드는 것"
  },
  {
    id: 2,
    title: "바둑판과 돌",
    text: "표준 바둑판은 19x19 교차점으로 구성되며, 입문자는 9x9나 13x13에서 연습합니다.",
    image: badukstone ,
    question: "입문자에게 추천하는 바둑판 크기는?",
    answer: "9x9"
  },
  {
    id: 3,
    title: "바둑판 위 용어",
    text: "바둑판 위의 진한 점을 화점이라고 합니다. 또한 각 꼭짓점, 모서리, 중앙을 귀, 변, 중앙이라고 합니다.",
    image: badukterms,
    question: "바둑판의 구역은 크게 3가지로 어떻게 나누나요?",
    answer: "귀, 변, 중앙"
  },
  {
    id: 4,
    title: "착수 순서와 규칙",
    text: "흑이 먼저 두고 이후 번갈아 착수합니다. 자살수는 둘 수 없고, 같은 모양 반복을 막는 '패' 규칙이 있습니다.",
    question: "흑과 백 중 누가 먼저 두나요?",
    answer: "흑"
  },
  {
    id: 5,
    title: "집이란 무엇인가?",
    text: "집은 돌로 둘러싸인 빈 공간입니다. 대국이 끝난 후 각자 집을 세어 승부를 결정합니다.",
    image: badukterritory,
    question: "집은 무엇으로 구성되나요?",
    answer: "돌로 둘러싸인 빈 공간"
  },
  {
    id: 6,
    title: "활로와 따냄 이해하기",
    text: "돌이 숨 쉴 수 있는 공간을 '활로'라고 부릅니다. 활로가 모두 막히면 상대가 돌을 따낼 수 있습니다.",
    image: [badukroad,badukdeath],
    question: "활로가 모두 막히면 어떻게 되나요?",
    answer: "돌이 잡힌다(따낸다)"
  },
  {
    id: 7,
    title: "연결과 끊음",
    text: "같은 색 돌은 연결되면 함께 살아남습니다. 끊기는 곳은 약점이 되며, 연결과 끊음의 싸움이 전략의 핵심입니다.",
    image: [badukconnect, badukdisconnect],
    question: "같은 색 돌끼리 연결되면 어떤 이점이 있나요?",
    answer: "함께 살아남는다"
  },
  {
    id: 8,
    title: "삶과 죽음",
    text: "돌무더기가 두 눈을 만들면 '살았다'고 하며 잡히지 않습니다. 이 모양을 구별하는 연습이 중요합니다.",
    image: [baduklife,badukdie],
    question: "두 눈을 만들면 돌은 어떻게 되나요?",
    answer: "살아서 잡히지 않는다"
  },
  {
    id: 9,
    title: "패와 반복 규칙",
    text: "같은 모양이 반복되는 것을 막는 '패' 규칙이 있습니다. 패 싸움을 이해하고 대응하는 것이 중요합니다.",
    image: baduk_ko,
    question: "패란 무엇인가요?",
    answer: "같은 모양 반복을 막는 규칙"
  },
  {
    id: 10,
    title: "기본적인 포석 연습",
    text: "초반에 좋은 자리를 차지하는 전략을 포석이라고 합니다. 화점, 소목, 삼삼 등의 기본 포석을 연습해보세요.",
    image: [opening1,opening2,opening3],
    question: "대표적인 포석 위치는 어디인가요?",
    answer: "화점, 소목, 삼삼"
  }
];
