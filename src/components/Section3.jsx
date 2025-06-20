import React from "react";
import { Link } from "react-router-dom";
import {
  BookCheck,
  CalendarCheck,
  ShieldCheck,
  Trophy,
  ShoppingBag,
  Star,
} from "lucide-react";
import "../App.css"; 

const features = [
  {
    title: "신입생 미션제",
    link: "/mission/beginner",
    desc: "바둑 입문부터 실력자까지 단계별 미션",
    icon: <BookCheck className="icon" />,
  },
  {
    title: "주간 퀘스트",
    link: "/quest",
    desc: "매주 바뀌는 바둑 도전 과제",
    icon: <CalendarCheck className="icon" />,
  },
  {
    title: "주간 보스",
    link: "/boss",
    desc: "강력한 상대에게 도전하고 보상받자",
    icon: <ShieldCheck className="icon" />,
  },
  {
    title: "레이팅 리그전",
    link: "/league/ranking",
    desc: "ELO 시스템 기반의 리그전",
    icon: <Trophy className="icon" />,
  },
  {
    title: "마일리지 상점",
    link: "/store",
    desc: "획득한 포인트로 다양한 아이템 구매",
    icon: <ShoppingBag className="icon" />,
  },
  {
    title: "특별 이벤트",
    link: "/event",
    desc: "기간 한정 이벤트로 다양한 보상 획득",
    icon: <Star className="icon" />,
  },
];

export default function FeatureCards() {
  return (
    <section className="feature-section">
      <h2 className="feature-title">Key Features</h2>
      <div className="feature-grid">
        {features.map((item) => (
          <Link key={item.title} to={item.link} className="feature-card">
            <div className="icon-circle">{item.icon}</div>
            <h3 className="feature-card-title">{item.title}</h3>
            <p className="feature-card-desc">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
