import React from "react";
import { Link } from "react-router-dom";
import Login from "../pages/Login"; // Login 컴포넌트 추가

const Article = ({ user, handleLogout }) => {
  return (
    <article className="article">
      <h2>로그인</h2>
      
      {/* 로그인하지 않은 경우에만 Login 컴포넌트 표시 */}
      {!user ? (
        <div className="login-container">
          <Login />
        </div>
      ) : (
        <div className="logout-container">
          <p>안녕하세요, {user.displayName || user.email}님!</p>
          
          {/* 로그인된 경우 마이페이지 링크와 로그아웃 버튼 추가 */}
          <div>
            <Link to="/mypage" className="my-page-link">
              마이페이지
            </Link>
          </div>
          
          {/* 로그아웃 버튼 */}
          <button onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </article>
  );
};

export default Article;
