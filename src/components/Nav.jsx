import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false);
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [isTournamentsDropdownOpen, setIsTournamentsDropdownOpen] = useState(false); // ★ 추가

  // 모바일 햄버거 메뉴 열림 상태
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (  
    <nav className="App-header">
      {/* 모바일 햄버거 버튼: 모바일에서만 보임 */}
      <div className="hamburger-container">
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 토글"
        >
          {mobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* 기본 네비바 (PC에서는 보이고, 모바일에서는 숨김) */}
      <ul className="navbar">
        {/* 동아리 드롭다운 */}
        <li
          className="relative"
          onMouseEnter={() => setIsClubDropdownOpen(true)}
          onMouseLeave={() => setIsClubDropdownOpen(false)}
        >
          <button className="nav-button">동아리</button>
          {isClubDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li><Link to="/club/intro" className="dropdown-item">동아리 소개</Link></li>
                <li><Link to="/club/rules" className="dropdown-item">회칙</Link></li>
                <li><Link to="/club/members" className="dropdown-item">회원 목록</Link></li>
                <li><Link to="/club/announcements" className="dropdown-item">공지사항</Link></li>
              </ul>
            </div>
          )}
        </li>

        {/*}
        <li
          className="relative"
          onMouseEnter={() => setIsMissionDropdownOpen(true)}
          onMouseLeave={() => setIsMissionDropdownOpen(false)}
        >
          <button className="nav-button">Mission</button>
          {isMissionDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li><Link to="/mission/entry" className="dropdown-item">입문</Link></li>
                <li><Link to="/mission/beginner" className="dropdown-item">초급</Link></li>
                <li><Link to="/mission/intermediate" className="dropdown-item">중급</Link></li>
                <li><Link to="/mission/advanced" className="dropdown-item">고급</Link></li>
              </ul>
            </div>
          )}
        </li>*/}

        {/*<li><Link to="/quest" className="nav-button">주간 퀘스트</Link></li>*/}
        {/*<li><Link to="/boss" className="nav-button">주간 보스</Link></li>*/}
        <li><Link to="/store" className="nav-button">마일리지 상점</Link></li>
        {/*<li><Link to="/badukboard" className="nav-button">바둑 대국</Link></li>*/}  
        <li><Link to="/lecture" className="nav-button">바둑 강의</Link></li>
        <li><Link to="/SGFfileviewer" className="nav-button">정석 공부</Link></li>

        <li><Link to="/tsumego" className="nav-button">사활 라이브러리</Link></li>

        {/* 토너먼트 ★ 추가 */}
        <li
          className="relative"
          onMouseEnter={() => setIsTournamentsDropdownOpen(true)}
          onMouseLeave={() => setIsTournamentsDropdownOpen(false)}
        >
          <button className="nav-button">토너먼트</button>
          {isTournamentsDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li><Link to="/tournaments" className="dropdown-item">진행/지난 토너먼트</Link></li>
                {/* 필요하면 내 참가 현황 등 추가:
                <li><Link to="/tournaments/mine" className="dropdown-item">내 참가</Link></li>
                */}
              </ul>
            </div>
          )}
        </li>
        <li
          className="relative"
          onMouseEnter={() => setIsLeagueDropdownOpen(true)}
          onMouseLeave={() => setIsLeagueDropdownOpen(false)}
        >
          <button className="nav-button">복현기우회 리그전</button>
          {isLeagueDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li><Link to="/league/ranking" className="dropdown-item">리그 순위표</Link></li>
                <li><Link to="/league/history" className="dropdown-item">대전 기록</Link></li>
                <li><Link to="/league/analysis" className="dropdown-item">경기 분석</Link></li>
                <li><Link to="/league/hall-of-fame" className="dropdown-item">명예의 전당</Link></li>
              </ul>
            </div>
          )}
        </li>

        <li><Link to="/mypage" className="nav-button">마이페이지</Link></li>
      </ul>

      {/* 모바일 햄버거 메뉴 내용 (모바일에서만 보이고, 토글 상태에 따라 보임) */}
      {mobileMenuOpen && (
  <ul className="mobile-menu">
    {/* 동아리 - PC 드롭다운과 같은 메뉴들 모두 펼침 */}
    <li className="mobile-section-title">동아리</li>
    <li><Link to="/club/intro" onClick={() => setMobileMenuOpen(false)}>동아리 소개</Link></li>
    <li><Link to="/club/rules" onClick={() => setMobileMenuOpen(false)}>회칙</Link></li>
    <li><Link to="/club/members" onClick={() => setMobileMenuOpen(false)}>회원 목록</Link></li>
    <li><Link to="/club/announcements" onClick={() => setMobileMenuOpen(false)}>공지사항</Link></li>

    {/* Mission - 전부 펼침
    <li className="mobile-section-title">Mission</li>
    <li><Link to="/mission/entry" onClick={() => setMobileMenuOpen(false)}>입문</Link></li>
    <li><Link to="/mission/beginner" onClick={() => setMobileMenuOpen(false)}>초급</Link></li>
    <li><Link to="/mission/intermediate" onClick={() => setMobileMenuOpen(false)}>중급</Link></li>
    <li><Link to="/mission/advanced" onClick={() => setMobileMenuOpen(false)}>고급</Link></li>*/}
    <li className="mobile-section-title">토너먼트</li>
    <li><Link to="/tournaments" onClick={() => setMobileMenuOpen(false)}>진행/지난 토너먼트</Link></li>
    {/* League - 전부 펼침 */}    
    <li className="mobile-section-title">복현기우회 리그전</li>
    <li><Link to="/league/ranking" onClick={() => setMobileMenuOpen(false)}>리그 순위표</Link></li>
    <li><Link to="/league/history" onClick={() => setMobileMenuOpen(false)}>대전 기록</Link></li>
    <li><Link to="/league/analysis" onClick={() => setMobileMenuOpen(false)}>경기 분석</Link></li>
    <li><Link to="/league/hall-of-fame" onClick={() => setMobileMenuOpen(false)}>명예의 전당</Link></li>

    {/* Study - 전부 펼침 */}    
    <li className="mobile-section-title">바둑 스터디</li>
    {/*<li><Link to="/badukboard" onClick={() => setMobileMenuOpen(false)}>바둑 대국</Link></li>*/}
    <li><Link to="/lecture" onClick={() => setMobileMenuOpen(false)}>바둑 강의</Link></li>/
    <li><Link to="/SGFfileviewer" onClick={() => setMobileMenuOpen(false)}>정석 공부</Link></li>
    
    {/* content - 전부 펼침  */}   
    <li className="mobile-section-title">회원 컨텐츠</li>
    {/*<li><Link to="/quest" onClick={() => setMobileMenuOpen(false)}>주간 퀘스트</Link></li>
    <li><Link to="/boss" onClick={() => setMobileMenuOpen(false)}>주간 보스</Link></li>*/}
    <li><Link to="/store" onClick={() => setMobileMenuOpen(false)}>마일리지 상점</Link></li>
    <li><Link to="/mypage" onClick={() => setMobileMenuOpen(false)}>마이페이지</Link></li>
  </ul>
)}

    </nav>
  );
};

export default Nav;
