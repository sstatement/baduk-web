import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false);
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false); // 동아리 드롭다운 상태 추가

  return (
    <nav className="App-header">
      
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
                <li><Link to="/club/board" className="dropdown-item">게시판</Link></li>
              </ul>
            </div>
          )}
        </li>

        {/* Mission 드롭다운 */}
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
        </li>

        {/* 주간 퀘스트 & 주간 보스 */}
        <li><Link to="/quest" className="nav-button">주간 퀘스트</Link></li>
        <li><Link to="/boss" className="nav-button">주간 보스</Link></li>
        <li><Link to="/badukboard"className="nav-button">바둑 대국</Link></li>
        {/* 레이팅 리그전 드롭다운 */}
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
              </ul>
            </div>
          )}
        </li>

       

        {/* 마이페이지 */}
        <li><Link to="/mypage" className="nav-button">마이페이지</Link></li>
      </ul>
      
    </nav>
  );
};

export default Nav;
