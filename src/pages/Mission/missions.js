const missions = [
  {
    id: "lesson-1",
    type: "text",
    title: "바둑판과 바둑돌이 뭔가요?",
    description: `
바둑은 19x19 선으로 구성된 바둑판에서 흑과 백이 번갈아가며 돌을 놓는 게임입니다.  
돌은 교차점에 놓으며, 더 이상 움직이지 않고, 상대 돌을 포위하면 따낼 수 있습니다.
작은 바둑판(9로, 13로)도 있으며, 연습용으로 자주 사용됩니다.
    `,
    image: "/images/intro_board_stones.png",
  },
  {
    id: "lesson-2",
    type: "quiz",
    title: "바둑 기본 용어 퀴즈",
    description: "배운 내용을 바탕으로 기본 용어 퀴즈에 도전해보세요!",
    quiz: [
      {
        question: "돌을 둘 수 없는 상황을 무엇이라 하나요?",
        options: ["패", "끊기", "자살수", "축"],
        answer: "자살수",
      },
      {
        question: "돌로 빈 공간을 둘러싸서 확보하는 공간은?",
        options: ["연결", "집", "축", "장문"],
        answer: "집",
      },
    ],
  },
  {
    id: "lesson-3",
    type: "text",
    title: "집이 뭔가요?",
    description: `
바둑에서 '집'은 자기 돌이 둘러싸고 있는 빈 칸의 수를 말합니다.  
게임 종료 시 집의 수가 많은 쪽이 승리합니다.  
돌로 빈 칸을 둘러싸면 그것이 곧 집이 됩니다.
    `,
    image: "/images/intro_territory.png",
  },
  {
    id: "lesson-4",
    type: "quiz",
    title: "자살수와 패 상황 퀴즈",
    description: "자살수와 패 상황에 대해 맞는 답을 골라보세요!",
    quiz: [
      {
        question: "자살수란 무엇인가요?",
        options: [
          "내 돌이 상대 돌을 포위하는 수",
          "내 돌이 스스로 잡히는 수",
          "서로 돌을 계속 따내는 상황",
          "빈 공간을 확보하는 수",
        ],
        answer: "내 돌이 스스로 잡히는 수",
      },
      {
        question: "패 상황은 어떤 경우인가요?",
        options: [
          "돌을 둘 수 없는 상황",
          "내 돌을 연결하는 상황",
          "서로 돌을 계속 따내며 무한 반복되는 상황",
          "돌을 두 번 연속 두는 상황",
        ],
        answer: "서로 돌을 계속 따내며 무한 반복되는 상황",
      },
    ],
  },
];

export default missions;
