import React, { useState, useEffect } from 'react';
import { db, updateMileage } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase';

const Mission = () => {
  const [missions, setMissions] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    // 미션을 받아오는 로직
    const fetchMissions = async () => {
      const querySnapshot = await getDocs(collection(db, 'missions'));
      setMissions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchMissions();
  }, []);

  const handleMissionComplete = async (missionId, mileageReward) => {
    if (user) {
      const missionRef = doc(db, 'missions', missionId);
      await updateDoc(missionRef, { completed: true });
      await updateMileage(user.uid, mileageReward); // 마일리지 추가
      alert(`미션 완료! ${mileageReward} 마일리지 획득`);
    }
  };

  // 각 레벨의 미션을 미리 설정
  const missionsByLevel = {
    입문: [
      {
        title: '바둑돌 바르게 잡는 법과 착점하는 법 익히기',
        description: '바둑 돌을 바르게 잡고 착점하는 법을 연습합니다.',
        mileageReward: 10,
      },
      {
        title: '바둑 기본 용어 10개 외우기',
        description: '기본 용어 10개를 외워 바둑을 이해하는데 도움을 줍니다.',
        mileageReward: 10,
      },
      {
        title: '‘축과 장문’ 같은 기초 포획 기술을 학습 후 적용해보기',
        description: '기초 포획 기술인 축과 장문을 학습하여 적용합니다.',
        mileageReward: 20,
      },
      {
        title: '기본적인 사활 문제 5개 풀기',
        description: '기본적인 사활 문제를 풀어 포획 기술을 익힙니다.',
        mileageReward: 20,
      },
      {
        title: '입문자끼리 1판 대국해보기',
        description: '입문자끼리 실전 대국을 해봅니다.',
        mileageReward: 30,
      },
      {
        title: '행마 강의 듣기',
        description: '행마 강의를 듣고 바둑을 이해하는 데 도움을 줍니다.',
        mileageReward: 10,
        link: 'https://www.youtube.com/watch?v=pO0N0dQpHBM',
      },
      {
        title: '정석 3개 이상 따라 두기',
        description: '기본적인 정석을 3개 이상 따라 두어 바둑을 익힙니다.',
        mileageReward: 30,
      },
    ],
    초급: [
      {
        title: '기본적인 포석 개념 익히고 사용해보기',
        description: '초반 전략인 포석을 연습하고 사용해봅니다.',
        mileageReward: 20,
      },
      {
        title: '패가 나오는 상황 경험하기',
        description: '패 상황을 경험하여 바둑의 포석과 대국에 대한 이해도를 높입니다.',
        mileageReward: 20,
      },
      {
        title: '간단한 끝내기 기술 3가지 배우고 적용해보기',
        description: '간단한 끝내기 기술을 익히고 적용합니다.',
        mileageReward: 20,
      },
      {
        title: '타이젬 깔아서 15급~ 아이디 만들어보기',
        description: '타이젬에서 15급 이상의 아이디를 만들어 대국을 해봅니다.',
        mileageReward: 10,
      },
      {
        title: '온라인으로 바둑 둬보기 (져도 상관 x)',
        description: '온라인에서 바둑을 둬봅니다. 승패는 상관없습니다.',
        mileageReward: 20,
      },
      {
        title: '주간보스 시도해보기',
        description: '주간보스에 도전하여 미션을 완료해봅니다.',
        mileageReward: 30,
      },
      {
        title: '기본적인 사활 문제 10개 풀기',
        description: '기본적인 사활 문제를 풀어 실력을 향상시킵니다.',
        mileageReward: 30,
      },
      {
        title: '새로운 정석 5개 이상 따라두기',
        description: '새로운 정석을 5개 이상 따라두어 포석을 익힙니다.',
        mileageReward: 30,
      },
      {
        title: '특정 바둑 강의(유튜브, 교재) 하나 골라서 정리 발표해보기',
        description: '유튜브 또는 교재 강의를 골라서 정리하고 발표합니다.',
        mileageReward: 40,
      },
    ],
    중급: [
      {
        title: '주간보스 시도해보기',
        description: '주간보스에 도전하여 미션을 완료해봅니다.',
        mileageReward: 40,
      },
      {
        title: '사활 문제 20개 풀기',
        description: '어려운 사활 문제를 풀어 실력을 강화합니다.',
        mileageReward: 40,
      },
      {
        title: '온라인으로 3판 둬보기 (져도 상관 x)',
        description: '온라인에서 바둑을 3판 둬봅니다. 승패는 상관없습니다.',
        mileageReward: 40,
      },
      {
        title: '대국한 바둑을 AI 프로그램 또는 고수에게 복기 받기',
        description: 'AI 또는 고수에게 자신의 대국을 복기하여 전략을 배웁니다.',
        mileageReward: 50,
      },
      {
        title: '상수 기보 50수까지 따라두기',
        description: '상수 기보를 50수까지 따라두어 고급 전략을 배웁니다.',
        mileageReward: 50,
      },
      {
        title: '새로운 정석 7개 이상 따라두기',
        description: '새로운 정석을 7개 이상 따라두어 포석을 익힙니다.',
        mileageReward: 50,
      },
      {
        title: '한 판에서 50수 이상 복기해보기',
        description: '실전 대국에서 50수 이상 복기하여 전략을 분석합니다.',
        mileageReward: 60,
      },
      {
        title: '자신에게 맞는 포석 찾아오기',
        description: '자신에게 맞는 포석을 찾아 연구해봅니다.',
        mileageReward: 60,
      },
      {
        title: '동아리 내 초보자 리그에 나가보기',
        description: '동아리 내 초보자 리그에 참가하여 실력을 확인해봅니다.',
        mileageReward: 70,
      },
    ],
    고급: [
      {
        title: '대국 3승 달성 (온라인, 오프라인 상관없음)',
        description: '온라인 또는 오프라인에서 대국 3승을 달성해 보세요.',
        mileageReward: 100,
      },
      {
        title: '바둑 강의(유튜브 또는 책) 내용을 정리하여 발표해보기',
        description: '바둑 강의를 보고 내용을 정리하여 발표해봅니다.',
        mileageReward: 100,
      },
      {
        title: '프로 바둑 기보를 50수까지 따라두기',
        description: '프로 바둑의 기보를 50수까지 따라 두어 고급 전략을 배웁니다.',
        mileageReward: 100,
      },
      {
        title: '주간보스 시도해보기',
        description: '주간보스에 도전하여 미션을 완료해봅니다.',
        mileageReward: 100,
      },
      {
        title: '한 판에서 100수 이상 복기하여 전략적인 부분 정리해보기',
        description: '대국에서 100수 이상 복기하고 전략적 분석을 정리합니다.',
        mileageReward: 120,
      },
      {
        title: '바둑 시뮬레이션 프로그램(AI 분석)을 활용하여 자신의 대국 분석',
        description: 'AI 분석 프로그램을 활용해 대국을 분석합니다.',
        mileageReward: 120,
      },
      {
        title: '사활문제 30개 풀기',
        description: '어려운 사활 문제를 풀어 고급 기술을 습득합니다.',
        mileageReward: 150,
      },
      {
        title: '정석 이후의 정석에 대해 공부하기',
        description: '정석 이후의 전략을 공부하여 실력을 키웁니다.',
        mileageReward: 150,
      },
      {
        title: '귀삼수, 변삼수에 대해 이해하기',
        description: '귀삼수와 변삼수에 대해 공부하여 고급 기술을 이해합니다.',
        mileageReward: 150,
      },
      {
        title: '카타고랑 50수 둬보기 (져도 상관 x)',
        description: '카타고와 50수 두어 분석합니다. 승패는 상관없습니다.',
        mileageReward: 150,
      },
    ],
  };

  return (
    <div>
      {Object.entries(missionsByLevel).map(([level, missions]) => (
        <div key={level}>
          <h2>{level} 미션</h2>
          <ul>
            {missions.map((mission, index) => (
              <li key={index}>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
                <button onClick={() => handleMissionComplete(mission.id, mission.mileageReward)}>
                  미션 완료
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Mission;
