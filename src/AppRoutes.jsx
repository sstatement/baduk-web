// src/AppRoutes.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
// ❌ Home은 lazy로 쓸 거라 아래 두 줄은 지웁니다.
// import Home from "./pages/Home";
// import League from "./pages/league/League";
import SEO from "./components/SEO";

import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import SetupProfile from "./pages/SetupProfile";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ClubIntro from "./pages/club/intro";
import ClubRules from "./pages/club/rules";
import ClubMembers from "./pages/club/members";
import Announcements from "./pages/club/announcements";
import AnnouncementDetail from "./pages/club/AnnouncementDetail";
import CreateAnnouncement from "./pages/club/CreateAnnouncement";
import BadukBoard from "./components/BadukBoard/BadukBoard";
import Board from "./pages/club/board";
import Quest from "./pages/Quest";
import QuestPage from "./pages/QuestPage";
import Signup from "./pages/Signup";
import Store from "./pages/Store";
import Entry from "./pages/Mission/입문";
import Beginner from "./pages/Mission/초급";
import Intermediate from "./pages/Mission/중급";
import Advanced from "./pages/Mission/고급";
import Boss from "./pages/Boss";
import Ranking from "./pages/league/Ranking";
import History from "./pages/league/History";
import Analysis from "./pages/league/Analysis";
import Apply from "./pages/league/apply";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SGFFileViewer from "./components/BadukBoard/SGFFileViewer";
import HallOfFame from "./pages/league/HallOfFame";

import LectureIntro from "./pages/Lecture/intro";
import 입문Flow from "./pages/Lecture/입문Flow";
import 용어Flow from "./pages/Lecture/용어Flow";
import 행마Flow from "./pages/Lecture/행마Flow";
import 정석Flow from "./pages/Lecture/정석Flow";
import 사활Flow from "./pages/Lecture/사활Flow";
import 끝내기Flow from "./pages/Lecture/끝내기Flow";
import 격언Flow from "./pages/Lecture/격언Flow";

import GuanPage from "./pages/GuanPage";
import GuanRecordPage from "./pages/GuanRecordPage";
import AddProblemPage, { SolveProblemPage } from "./pages/AddProblem";

import { SeasonProvider } from "./contexts/SeasonContext";
import LeagueLayout from "./pages/league/LeagueLayout";

import TournamentsList from "./components/tournaments/TournamentsList";
import TournamentDetail from "./components/tournaments/TournamentDetail";
import Rankings from "./pages/Rankings";

import TsumegoPage from "./pages/tsumego";

import "./App.css";
import BatongiLoader from "./components/Loader/BatongiLoader";

import GoYoutubePage from "./pages/GoYoutube";
import JosekiRecommender from "./pages/JosekiRecommender";
import AdminSeasonClose from "./pages/league/AdminSeasonClose";


import FreeBoardList from "./pages/board/FreeBoardList";
import FreeBoardWrite from "./pages/board/FreeBoardWrite";
import FreeBoardDetail from "./pages/board/FreeBoardDetail";

const GlobalLoader = () => {
  const { loading } = useLoading();
  return loading ? <BatongiLoader fullscreen text="로딩 중..." /> : null;
};
// ✅ lazy 로딩은 여기서만 선언
const Home = lazy(() => import("./pages/Home"));

const functions = getFunctions();
const setAdminRole = httpsCallable(functions, "setAdminRole");

const AppRoutes = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problems, setProblems] = useState([]); // 문제 리스트 상태

  const handleAddProblem = (newProblem) => {
    setProblems((prev) => [...prev, newProblem]);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setError(null);

      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("User data not found. Redirecting to setup-profile...");
            navigate("/setup-profile");
            return;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("사용자 데이터를 불러오는 데 문제가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const handleSetAdminRole = async () => {
    if (user && userData) {
      try {
        await setAdminRole({ uid: user.uid });
        console.log("Admin role assigned successfully");
      } catch (error) {
        console.error("Error assigning admin role:", error);
      }
    } else {
      console.error("User or userData is not available");
    }
  };

  // ✅ 초기 전역 로딩 시에도 바통이 로더 사용
  if (loading) {
    return <BatongiLoader fullscreen text="로그인 상태 확인 중..." />;
  }

  return (
    <SeasonProvider>
      <LoadingProvider>
      <Header />
      <Nav />
      <GlobalLoader />
      {error && (
        <div className="bg-red-500 text-white text-center py-2">
          <p>{error}</p>
        </div>
      )}
      
      <Suspense fallback={<BatongiLoader fullscreen />}>
        <Routes>
          <Route path="/" element={<>
      <SEO
        title="경북대학교 바둑 동아리 복현기우회"
        description="경북대 복현기우회 공식 사이트 — 바둑을 배우고 즐기며 함께 성장하는 공간. 리그전, 강의, 마일리지 상점 등 다양한 콘텐츠를 운영 중입니다."
        canonical="https://baduk-web-sstatements-projects.vercel.app"
        image="https://baduk-web-sstatements-projects.vercel.app/logo192.png" // 로고/배너 경로
        keywords={[
          "경북대학교",
          "복현기우회",
          "바둑 동아리",
          "바둑 리그전",
          "사활",
          "경북대 동아리"
        ]}
      />
      <Home user={user} userData={userData} />
    </>} />

          <Route
            path="/mypage"
            element={
              user ? (
                <MyPage userId={user.uid} user={user} userData={userData} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/quest"
            element={user ? <Quest user={user} userData={userData} /> : <Navigate to="/login" />}
          />
          <Route
            path="/quest/:id"
            element={user ? <QuestPage user={user} userData={userData} /> : <Navigate to="/login" />}
          />

          <Route
            path="/store"
            element={user ? <Store user={user} userData={userData} /> : <Navigate to="/login" />}
          />

          <Route
            path="/mission/entry"
            element={user ? <Entry user={user} userData={userData} /> : <Navigate to="/login" />}
          />
          <Route
            path="/mission/beginner"
            element={user ? <Beginner user={user} userData={userData} /> : <Navigate to="/login" />}
          />
          <Route
            path="/mission/intermediate"
            element={user ? <Intermediate user={user} userData={userData} /> : <Navigate to="/login" />}
          />
          <Route
            path="/mission/advanced"
            element={user ? <Advanced user={user} userData={userData} /> : <Navigate to="/login" />}
          />

          <Route path="/boss" element={user ? <Boss user={user} userData={userData} /> : <Navigate to="/login" />} />

          <Route path="/league" element={<LeagueLayout />}>
            <Route path="ranking" element={<Ranking />} />
            <Route path="history" element={<History />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="apply" element={<Apply />} />
            <Route path="hall-of-fame" element={<HallOfFame />} />
             {/* 👇 여기 추가: 시즌 정산 관리자 페이지 */}
        <Route path="admin/season-close" element={<AdminSeasonClose />} />
          </Route>

          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/club/intro" element={<ClubIntro />} />
          <Route path="/club/rules" element={<ClubRules />} />
          <Route path="/club/members" element={<ClubMembers />} />
          <Route path="/club/announcements" element={<Announcements />} />
          <Route path="/announcements/create" element={<CreateAnnouncement />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />
          <Route path="/club/board" element={<Board />} />

          <Route path="/badukboard" element={<BadukBoard />} />
          <Route path="/SGFfileviewer" element={<SGFFileViewer />} />
          <Route path="/setup-profile" element={<SetupProfile />} />

          <Route path="/lecture" element={<LectureIntro />} />
          <Route path="/lecture/입문" element={<입문Flow />} />
          <Route path="/lecture/용어" element={<용어Flow />} />
          <Route path="/lecture/행마" element={<행마Flow />} />
          <Route path="/lecture/정석" element={<정석Flow />} />
          <Route path="/lecture/사활" element={<사활Flow />} />
          <Route path="/lecture/끝내기" element={<끝내기Flow />} />
          <Route path="/lecture/격언" element={<격언Flow />} />

          <Route path="/tournaments" element={<TournamentsList />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/rankings" element={<Rankings />} />

          <Route path="/guan" element={<GuanPage />} />
          <Route path="/guan/record/:problemId/:attemptId/:round" element={<GuanRecordPage />} />
          <Route path="/guan/add" element={<AddProblemPage />} />
          <Route path="/guan/solve/:problemId" element={<SolveProblemPage />} />

          <Route path="/tsumego" element={<TsumegoPage />} />

          <Route path="/go-youtube" element={<GoYoutubePage />} />
          <Route path="/joseki-reco" element={<JosekiRecommender />} />

          <Route path="/board" element={<FreeBoardList />} />
          <Route path="/board/write" element={<FreeBoardWrite />} />
          <Route path="/board/:id" element={<FreeBoardDetail />} />



          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        </Routes>
      </Suspense>

      <Footer />
      </LoadingProvider>
    </SeasonProvider>
  );
};

export default AppRoutes;
