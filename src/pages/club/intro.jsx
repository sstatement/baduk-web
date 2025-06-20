import React from 'react';
import '../Intro.css';
const ClubIntro = () => {
  return (
    <div className="club-intro-container">
      <h1 className="title">동아리 소개</h1>

      <div className="club-info">
        <h2>분과명: 학술분과</h2>
        <p><strong>동아리명:</strong> 복현기우회(바둑 동아리)</p>
        <p><strong>설립연도:</strong> 1974년</p>
        <p><strong>회원수:</strong> 55명</p>
        <p><strong>연락처:</strong> 010-8508-7363</p>
        <p><strong>위치:</strong> 401호(구 405호)</p>
        <p><strong>홈페이지:</strong> <a href="홈페이지 주소 링크" target="_blank" rel="noopener noreferrer">홈페이지 링크</a></p>
        <p><strong>SNS:</strong></p>
        <p><strong>인스타그램:</strong> <a href="https://www.instagram.com/knu_baduk/" target="_blank" rel="noopener noreferrer">https://www.instagram.com/knu_baduk/</a></p>
        <p><strong>유튜브:</strong> <a href="https://www.youtube.com/@knu_baduk" target="_blank" rel="noopener noreferrer">https://www.youtube.com/@knu_baduk</a></p>
      </div>

      <div className="about-club">
        <h2>동아리 소개</h2>
        <p>저희 복현기우회에는 바둑 강좌, 교내/외 바둑대회, 동아리 MT와 축제 등 다양한 활동이 준비되어 있어요!</p>
        <p>바둑 관련 활동 외에도 20여 종의 보드게임을 구비하여 자주 플레이하고 있으니, 바둑이라는 주제에 대해 너무 어렵게 생각하지 마시고 편하게 지원 부탁드립니다~ ❤️</p>
      </div>

      <div className="faq">
        <h2>FAQ</h2>
        <div className="faq-item">
          <strong>⚫ 신입생만 가입 가능한가요?</strong>
          <p>⚪ 바둑에 관심 있으시다면 학년, 학과 관계없이 모두 환영합니다! (상시모집)</p>
        </div>

        <div className="faq-item">
          <strong>⚫ 바둑을 아예 몰라도 괜찮나요?</strong>
          <p>⚪ 물론이죠! 저희 동아리에는 입문자부터 프로급의 실력자까지 아주 폭넓은 실력대의 회원들이 계십니다. 각 실력대에 맞는 레슨이 준비되어 있고, 다른 회원들과 바둑을 두면서 실력을 키울 수 있어요!</p>
          <p>⚪ 또한 바둑 외에도 보드게임 등 다양한 컨텐츠가 준비되어 있기 때문에 부담 없이 사람들과 어울릴 수 있습니다.</p>
        </div>

        <div className="faq-item">
          <strong>⚫ 어떤 활동을 하고 있나요?</strong>
          <p>⚪ 다양한 바둑 대회: 정기적으로 여러 교내/외 바둑 대회를 주최 및 참여합니다! 복현기우회 내 대회는 동실력대의 사람들로 리그를 나누어 대결하는 '복현배 바둑리그’ 를 포함한 개인전 및 단체전 대회들이 있어요.</p>
          <p>⚪ 외부 바둑 대회: 영남권 대학 간의 '영남지구 바둑대회’ 와 바둑 프로기사 이세돌의 고향에서 열리는 ‘신안천일염배’ 등이 있습니다. 물론 신입생 분들도 얼마든지 위 대회들에 참가하실 수 있습니다! 많은 신청 부탁드립니다!</p>
          <p>⚪ 집회 시간 외에도 동아리방에 많은 부원들이 있으니 원하실 때 언제든지 와서 어울리시면 됩니다!</p>
        </div>

        <div className="faq-item">
          <strong>⚫ 회비는 얼마인가요?</strong>
          <p>⚪ 학기 당 신입 부원은 20,000원, 기존 부원은 15,000원입니다.</p>
        </div>

        <div className="faq-item">
          <strong>⚫ 가입 신청은 어떻게 하나요?</strong>
          <p>⚪ 정식 모집은 개강 후 가두모집 기간에 카카오톡 오픈채팅방을 통해 진행 할 예정이지만, 미리 들어오셔서 신청해 두시는 것도 대환영입니다!</p>
        </div>

        <div className="contact-info">
          <p>추가 문의 사항이 있으시다면 동아리 회장 또는 인스타 DM으로 연락 주세요~ ✉️</p>
          <p><strong>관리자:</strong> 010-8508-7363 (문자 또는 카톡 주시면 감사하겠습니다❤️)</p>
          <p><strong>인스타:</strong> @knu_baduk</p>
        </div>
      </div>
    </div>
  );
};

export default ClubIntro;
