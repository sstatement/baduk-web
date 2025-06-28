// src/pages/Lecture/용어Steps.js
import 양단수Img from '../../images/양단수.png';
import 축Img from '../../images/축.png';
import 축Img1 from '../../images/축1.png';
import 축머리Img from '../../images/축머리.png';
import 장문Img from '../../images/장문.png';
import 먹여치기1Img from '../../images/먹여치기1.png';
import 먹여치기2Img from '../../images/먹여치기2.png';
import 먹여치기3Img from '../../images/먹여치기3.png';
import 환격Img from '../../images/환격.png';
import 촉촉수1Img from '../../images/촉촉수1.png';
import 촉촉수2Img from '../../images/촉촉수2.png';
import 일립이전Img from '../../images/일립이전.png';
import 이립삼전Img from '../../images/이립삼전.png';
import 우형Img from '../../images/우형.png';

export const 용어Steps = [
  {
    id: 1,
    title: "양단수",
    text: "양단수는 상대의 두 돌을 동시에 단수를 치는 수입니다.",
    image: 양단수Img,
    question: "양단수는 어떤 공격인가요?",
    answer: "동시에 두 개의 단수를 만드는 수입니다."
  },
  {
    id: 2,
    title: "축과 축머리",
    text: "축은 상대의 돌을 계속 단수가 되도록 몰아가는 방법으로 돌을 잡는 방식입니다.",
    image:[축Img,축Img1,축머리Img],
    question: "축머리는 무엇을 의미하나요?",
    answer: "축머리는 축의 진행 경로에 위치하는 돌이며, 축이 성립되지 않게 하는 역할을 합니다."
  },
  {
    id: 3,
    title: "장문",
    text: "장문은 한 수로 돌을 가두어 달아나지 못하게 하여 잡는 방법입니다.",
    image:장문Img,
    question: "장문의 특징은 무엇인가요?",
    answer: "상대방의 돌을 널널하게 잡을 수 있습니다."
  },
  {
    id: 4,
    title: "먹여치기",
    text: "먹여치기는 상대 돌을 잡기 위해 자신의 돌을 희생하는 전술로, 상대 돌을 따내기 위해 사용합니다.",
    image:[먹여치기1Img,먹여치기2Img,먹여치기3Img],
    question: "먹여치기의 핵심은 무엇인가요?",
    answer: "자신의 돌을 희생해 상대 돌을 잡는 것입니다. 또한 자충, 옥집 등을 유도하여 활로를 줄이거나, 우형을 만들기 위하여 상대의 호구자리에 돌을 집어넣기도 합니다."
  },
  {
    id: 5,
    title: "환격",
    text: "환격은 상대방 돌을 잡는 방식입니다. 돌 하나를 희생하여 상대의 돌무더기를 되잡는 방법입니다.",
    image:환격Img,
    question: "환격의 특징은 무엇인가요?",
    answer: "상대방이 내 돌을 잡아도, 두어진 수가 자충이 되어 다시 잡힙니다."
  },
  {
    id: 6,
    title: "촉촉수",
    text: "촉촉수는 돌 모양의 결함에 따라 먹여치기, 자충 등을 이용하여 돌을 잡는 기법입니다. 단수에 몰린 돌을 상대가 이어도 여전히 단수상태인 것이 특징입니다.",
    image:[촉촉수1Img,촉촉수2Img],
    question: "촉촉수의 역할은 무엇인가요?",
    answer: "상대 돌을 잡는데에 사용합니다."
  },
  {
    id: 7,
    title: "일립이전, 이립삼전",
    text: "일립이전은 변에 놓인 하나의 돌로부터 벌림은 두칸이 제격이라는 바둑의 격언입니다.",
    image:[일립이전Img,이립삼전Img],
    question: "이립삼전은 무엇을 의미하나요?",
    answer: "벌림의 하나로써, 포석 단계에서 돌 두 개가 일렬로 늘어서 있을 때는 세칸을 벌리는 것이 정수라는 뜻입니다."
  },
  {
    id: 8,
    title: "우형",
    text: "우형은 돌이 뭉쳐 능률적이지 못한 형태입니다.",
    image:우형Img,
    question: "우형의 예시는 뭐가 있나요?",
    answer: "빈삼각과 포도송이가 대표적입니다."
  }
];
