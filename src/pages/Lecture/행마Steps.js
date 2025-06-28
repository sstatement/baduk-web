import 뻗기Img from '../../images/뻗기.png';
import 입구자Img from '../../images/입구자.png';
import 한칸뜀Img from '../../images/한칸뜀.png';
import 날일자Img from '../../images/날일자.png';
import 두칸뜀Img from '../../images/두칸뜀.png';
import 눈목자Img from '../../images/눈목자.png';
import 호구자Img from '../../images/호구자.png';
import 젖히기Img from '../../images/젖히기.png';
import 두점머리젖히기Img from '../../images/두점머리젖히기.png';
import 붙이기Img from '../../images/붙이기.png';
import 붙이면젖혀라1Img from '../../images/붙이면젖혀라1.png';
import 붙이면젖혀라2Img from '../../images/붙이면젖혀라2.png';
import 젖히면뻗어라Img from '../../images/젖히면뻗어라.png';
import 뻗으면이어라Img from '../../images/뻗으면이어라.png';
import 끊으면늘어라Img from '../../images/끊으면늘어라.png';
import 호구되는곳이급소Img from '../../images/호구되는곳이급소.png';
import 쌍립Img from '../../images/쌍립.png';
import 쌍립되는곳이급소Img from '../../images/쌍립되는곳이급소.png';
import 되젖히기Img from '../../images/되젖히기.png';
import 양호구Img from '../../images/양호구.png';
import 이단젖힘Img from '../../images/이단젖힘.png';
import 붙임에뻗기Img from '../../images/붙임에뻗기.png';
import 날일자는건너붙여끊어라Img from '../../images/날일자는건너붙여끊어라.png';
import 양날일자연결Img from '../../images/양날일자연결.png';
import 이선달리기Img from '../../images/2선달리기.png';
import 모양의급소Img from '../../images/모양의급소.png';
import 행마의급소찾기Img from '../../images/행마의급소찾기.png';
import 석점의중앙Img from '../../images/석점의중앙.png';
import 모자씌우기와날일자벗기Img from '../../images/모자씌우기와날일자벗기.png';
import 삭감과침투1Img from '../../images/삭감과침투1.png';
import 삭감과침투2Img from '../../images/삭감과침투2.png';
import 행마끊기1Img from '../../images/행마끊기1.png';
import 행마끊기2Img from '../../images/행마끊기2.png';
import 행마끊기3Img from '../../images/행마끊기3.png';
import 행마끊기4Img from '../../images/행마끊기4.png';
import 행마무겁게만들기Img from '../../images/행마무겁게만들기.png';
import 밭전자행마와기대기Img from '../../images/밭전자행마와기대기.png';
import 들여다보기Img from '../../images/들여다보기.png';
import 행마안정시키기Img from '../../images/행마안정시키기.png';
import 공격의급소Img from '../../images/공격의급소.png';


export const 행마Steps = [
  {
    id: 1,
    title: "뻗기",
    text: "뻗기는 돌을 앞으로 자연스럽게 이어서 모양을 튼튼하게 만드는 기본적인 행마입니다.",
    image: 뻗기Img,
    question: "뻗기의 목적은 무엇인가요?",
    answer: "돌을 안정적으로 연결하고 모양을 튼튼하게 만듭니다."
  },
  {
    id: 2,
    title: "입구자",
    text: "입구자는 느리지만 튼튼한 행마입니다.",
    image: 입구자Img,
    question: "입구자는 어떨때 많이 두어지나요?",
    answer: "끊어지지 않는 행마를 사용할 때나, 다음 싸움을 준비할 경우 많이 두어집니다."
  },
  {
    id: 3,
    title: "한칸뜀",
    text: "한칸뜀은 안전하면서도 효율적으로 전진할 수 있는 기본 행마입니다. 바둑에서 가장 많이 두는 행마입니다.",
    image: 한칸뜀Img,
    question: "한칸뜀의 장점은 무엇인가요?",
    answer: "안전하게 연결하면서 앞으로 나아갈 수 있습니다."
  },
  {
    id: 4,
    title: "날일자",
    text: "날일자는 한 칸 행마보다 적극적인 행마이지만 끊어지기 쉽습니다.",
    image: 날일자Img,
    question: "날일자는 어떨때 사용하나요?",
    answer: "상대 돌을 압박하는데 쓰일 수 있습니다."
  },
  {
    id: 5,
    title: "두칸뜀",
    text: "두칸뜀은 넓게 벌리면서 세력을 확장할 수 있지만 약점이 생길 수 있어 상황 판단이 필요합니다.",
    image: 두칸뜀Img,
    question: "두칸뜀을 쓸 때 주의할 점은 무엇인가요?",
    answer: "넓게 벌리되 끊기는 약점을 주의해야 합니다."
  },
  {
    id: 6,
    title: "눈목자",
    text: "눈목자는 빠르게 전진하는 행마입니다.",
    image: 눈목자Img,
    question: "눈목자의 특징은 무엇인가요?",
    answer: "빠르지만 끊어지기 쉬운 약점이 있습니다."
  },
  {
    id: 7,
    title: "호구자",
    text: "호구자는 돌을 튼튼하게 연결해 상대의 침입을 막는 매우 안정적인 행마입니다.",
    image: 호구자Img,
    question: "호구자의 장점은 무엇인가요?",
    answer: "돌을 단단히 연결해 약점을 없앱니다. 만약 호구 안으로 들어오면 상대돌을 잡을 수 있습니다."
  },
  {
    id: 8,
    title: "젖히기",
    text: "젖히기는 늘기와 비교하여 좀 더 공격적인 응수이나 내 돌에 약점이 남는 단점도 있습니다.",
    image: [젖히기Img,두점머리젖히기Img],
    question: "젖히기를 쓰는 요령이 있을까요?",
    answer: "내 돌이 강할때 젖히고 내 돌이 약할때는 느는 것이 좋습니다."
  },
  {
    id: 9,
    title: "붙이기",
    text: "붙이기는 상대의 응수를 강제해 싸움을 유도하거나 모양을 흔드는 행마입니다.",
    image: 붙이기Img,
    question: "붙이기의 목적은 무엇인가요?",
    answer: "상대의 응수를 강제하고 싸움을 유도합니다."
  },
  {
    id: 10,
    title: "붙이면 젖혀라",
    text: "상대가 붙이면 젖혀서 응수해 모양을 제어하고 주도권을 잡는 기본 맥입니다.",
    image: [붙이면젖혀라1Img,붙이면젖혀라2Img],
    question: "왜 붙이면 젖히나요?",
    answer: "상대의 의도를 제어하고 모양을 주도하기 위해서입니다."
  },
  {
    id: 11,
    title: "젖히면 뻗어라",
    text: "상대가 젖히면 뻗어서 안정적으로 연결하면서 약점을 방지하는 기본 대응입니다.",
    image: 젖히면뻗어라Img,
    question: "왜 젖히면 뻗나요?",
    answer: "안전하게 연결하고 약점을 줄이기 위해서입니다."
  },
  {
    id: 12,
    title: "뻗으면 이어라",
    text: "상대가 뻗으면 이어서 돌을 단단하게 연결해 끊기는 것을 방지하는 기본적인 대응입니다.",
    image: 뻗으면이어라Img,
    question: "왜 뻗으면 이어야 하나요?",
    answer: "돌을 안전하게 연결하고 끊김을 방지하기 위해서입니다."
  },
  {
    id: 13,
    title: "끊으면 늘어라",
    text: "상대가 끊으면 늘어서 대응해 돌을 연결하고 싸움을 안정적으로 이어가는 수법입니다.",
    image: 끊으면늘어라Img,
    question: "끊으면 왜 늘어야 하나요?",
    answer: "끊긴 돌을 연결하고 전투를 안정적으로 이어가기 위해서입니다. 단수를 치는 것도 좋지만 상황에 따라 약점이 남을수도 있습니다."
  },
  {
    id: 14,
    title: "호구되는 곳이 급소",
    text: "호구가 되는 곳은 상대의 약점이 될 수 있어 공격의 급소가 됩니다.",
    image: 호구되는곳이급소Img,
    question: "왜 호구되는 곳을 제가 두나요?",
    answer: "호구는 탄력 있는 좋은 모양입니다. 상대방이 이를 못만들게 하는 것이 좋습니다."
  },
  {
    id: 15,
    title: "쌍립",
    text: "쌍립은 두 돌이 나란히 서서 안정적인 벽을 만드는 기본적인 형태입니다.",
    image: 쌍립Img,
    question: "쌍립의 장점은 무엇인가요?",
    answer: "끊기지 않습니다."
  },
  {
    id: 16,
    title: "쌍립되는 곳이 급소",
    text: "쌍립 형태가 되는 곳은 상대의 약점이 될 수 있어 급소로 작용합니다.",
    image: 쌍립되는곳이급소Img,
    question: "왜 쌍립되는 곳이 급소인가요?",
    answer: "상대의 형태를 깨뜨리고 약점을 노릴 수 있기 때문입니다."
  },
  {
    id: 17,
    title: "되젖히기",
    text: "상대의 젖힘에 맞서 다시 젖혀서 주도권을 빼앗는 공격적인 수법입니다.",
    image: 되젖히기Img,
    question: "되젖히기의 목적은 무엇인가요?",
    answer: "상대방의 모양에도 약점을 남기는 것입니다."
  },
  {
    id: 18,
    title: "양호구",
    text: "양호구는 호구를 두 개 만들어 두 곳의 단점을 동시에 지키는 방법입니다.",
    image: 양호구Img,
    question: "양호구의 특징은 무엇인가요?",
    answer: "두 곳의 약점을 동시에 지킬 수 있습니다."
  },
  {
    id: 19,
    title: "이단 젖힘",
    text: "이단 젖힘은 젖히고 또 젖혀서 두 번 젖히는 것입니다.",
    image: 이단젖힘Img,
    question: "이단 젖힘의 효과는 무엇인가요?",
    answer: "강력한 압박의 수이며 상대방의 약점을 이용할 때 가능한 수입니다."
  },
  {
    id: 20,
    title: "붙임에 뻗기",
    text: "상대가 붙여오면 뻗어서 약점을 방지하는 대응입니다.",
    image: 붙임에뻗기Img,
    question: "왜 붙임에는 뻗나요?",
    answer: "주변 상황이 불리할 때는 뻗어서 안전하게 둘 수 있기 때문입니다. 또한 상대에게 되젖힘이나 끊는 흐름을 주지 않기 위해서입니다."
  },
  {
    id: 21,
    title: "날일자는 건너 붙여 끊어라",
    text: "상대의 날일자 행마를 건너 붙여 끊어 약점을 만드는 강력한 맥입니다.",
    image: 날일자는건너붙여끊어라Img,
    question: "왜 건너 붙여 끊나요?",
    answer: "대부분의 상황에서 건너 붙여 끊는게 내 모양의 약점을 최소화 하면서 끊는 방법이기 때문입니다."
  },
  {
    id: 22,
    title: "양날일자 연결",
    text: "양날일자는 상대 돌 사이를 효율적으로 연결하면서 공격을 방지하는 형태입니다.",
    image: 양날일자연결Img,
    question: "양날일자의 특징은 무엇인가요?",
    answer: "수순이 교환된다고 예상하고 두는 연결 방법입니다."
  },
  {
    id: 23,
    title: "2선 달리기",
    text: "2선 달리기는 상대방의 돌이 주로 4선에 있을때 2선으로 날일자나 눈목자를 사용해 안전하게 집을 만드는 진행입니다.",
    image: 이선달리기Img,
    question: "2선 달리기의 특징은 무엇인가요?",
    answer: "끊기지 않을 정도의 행마를 사용하여 상대방의 실리를 빼앗거나, 내 돌의 안영을 구할 수 있습니다."
  },
  {
    id: 24,
    title: "모양의 급소",
    text: "모양의 급소는 상대의 형태를 깨뜨리고 약점을 만드는 중요한 지점입니다.",
    image: 모양의급소Img,
    question: "모양의 급소는 왜 중요한가요?",
    answer: "상대의 약점을 만들고 공격 기회를 주기 때문입니다."
  },
  {
    id: 25,
    title: "행마의 급소 찾기",
    text: "행마의 급소를 찾는 것은 상대의 약점을 파악하고 효율적인 수를 두는 데 핵심입니다.",
    image: 행마의급소찾기Img,
    question: "왜 행마의 급소를 찾아야 하나요?",
    answer: "상대의 약점을 노리고 효율적인 진행을 위해서입니다."
  },
  {
    id: 26,
    title: "석점의 중앙",
    text: "세 개의 돌이 만드는 공간의 중앙은 상대의 약점이 될 수 있어 중요한 공격 지점입니다.",
    image: 석점의중앙Img,
    question: "석점의 중앙이 왜 급소인가요?",
    answer: "상대의 형태를 깨뜨리고 약점을 만들 수 있기 때문입니다."
  },
  {
    id: 27,
    title: "모자 씌우기와 날일자 벗기",
    text: "모자 씌우기는 상대를 눌러 가두는 수법이고, 날일자 벗기는 상대의 공격을 피해 나가는 방법입니다.",
    image: 모자씌우기와날일자벗기Img,
    question: "모자 씌우기와 날일자 벗기의 목적은 무엇인가요?",
    answer: "모자 씌우기의 목적은 상대를 가두기 위해, 날일자 벗기는 공격을 피해 안정적으로 두기 위함입니다."
  },
  {
    id: 28,
    title: "삭감과 침투",
    text: "삭감은 상대 세력을 줄이고 침투는 그 속으로 들어가 집을 깎는 적극적인 전략입니다.",
    image: [삭감과침투1Img,삭감과침투2Img],
    question: "삭감과 침투의 목적은 무엇인가요?",
    answer: "상대의 세력을 줄이고 자신의 집을 늘리기 위해서입니다."
  },
  {
    id: 29,
    title: "행마 끊기",
    text: "상대의 행마를 끊어 분리시키면 약점이 생겨 싸움을 유리하게 이끌 수 있습니다.",
    image: [행마끊기1Img,행마끊기2Img,행마끊기3Img,행마끊기4Img],
    question: "행마를 끊는 이유는 무엇인가요?",
    answer: "상대의 돌을 분리해 약점을 만들고 싸움을 유리하게 이끌기 위해서입니다."
  },
  {
    id: 30,
    title: "행마 무겁게 만들기",
    text: "상대의 돌을 무겁게 만들어 움직이기 어렵게 하면 전투를 유리하게 전개할 수 있습니다.",
    image: 행마무겁게만들기Img,
    question: "왜 상대의 행마를 무겁게 만드나요?",
    answer: "상대의 움직임을 제한하고 싸움을 유리하게 이끌기 위해서입니다."
  },
  {
    id: 31,
    title: "밭전자 행마",
    text: "밭전자 모양은 끊어지는 단점 때문에 많이 두어지지 않습니다.",
    image: 밭전자행마와기대기Img,
    question: "밭전자 행마의 목적은 무엇인가요?",
    answer: "돌을 가볍게 보고 다른 이득을 얻기 위해 두어집니다."
  },
  {
    id: 32,
    title: "들여다보기",
    text: "들여다보기는 상대방이 잇도록 유도해 상대방 돌을 무겁게 하는 기술입니다.",
    image: 들여다보기Img,
    question: "들여다보기의 효과는 무엇인가요?",
    answer: "상대방이 돌을 가볍게 보지 못하게 하여 잇게 하고, 이어진 돌은 무거워집니다."
  },
  {
    id: 33,
    title: "행마 안정시키기",
    text: "행마를 안정시키면 상대의 공격을 방지하고 모양을 두텁게 만들 수 있습니다.",
    image: 행마안정시키기Img,
    question: "행마를 안정시키는 이유는 무엇인가요?",
    answer: "상대의 공격을 방지하고 모양을 두텁게 하기 위해서입니다."
  },
  {
    id: 34,
    title: "공격의 급소",
    text: "공격의 급소는 상대의 약점을 노려 싸움을 유리하게 이끌 수 있는 중요한 지점입니다.",
    image: 공격의급소Img,
    question: "공격의 급소를 찾는 이유는 무엇인가요?",
    answer: "상대의 약점을 노리고 싸움을 유리하게 이끌기 위해서입니다."
  }
];
