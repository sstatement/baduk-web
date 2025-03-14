import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2>경북대 바둑 동아리</h2>
        <p>바둑을 즐기고 배우는 공간, 누구나 환영합니다!</p>

        <div className="social-links">
          <a href="https://www.instagram.com/knu_baduk/" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://www.youtube.com/@knu_baduk" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>

        <div className="links">
          <Link to="/terms-of-service">이용약관</Link> | 
          <Link to="/privacy-policy">개인정보 처리방침</Link>
        </div>

        <p>© 2025 경북대 바둑 동아리. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
