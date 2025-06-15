import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';  // Firebase Functions import
import Home from './pages/Home';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import TermsOfService from "./pages/TermsOfService"; // 이 부분 추가
import PrivacyPolicy from "./pages/PrivacyPolicy"; // 이 부분 추가
import ClubIntro from './pages/club/intro'; // 경로가 올바르게 설정되었는지 확인
import ClubRules from './pages/club/rules'; // 경로가 올바르게 설정되었는지 확인
import ClubMembers from './pages/club/members'; // 경로가 올바르게 설정되었는지 확인
import Announcements from './pages/club/announcements';
import AnnouncementDetail from "./pages/club/AnnouncementDetail"; // 수정된 경로
import CreateAnnouncement from "./pages/club/CreateAnnouncement"; // 추가된 페이지 import
import BadukBoard from './components/BadukBoard/BadukBoard';

import Board from './pages/club/board';
import Quest from './pages/Quest';
import QuestPage from './pages/QuestPage';
import Signup from './pages/Signup';
import Store from './pages/Store';
import Entry from './pages/Mission/입문';
import Beginner from './pages/Mission/초급';
import Intermediate from './pages/Mission/중급';
import Advanced from './pages/Mission/고급';
import Boss from './pages/Boss';
import Header from './components/Header';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Ranking from './pages/league/Ranking';
import History from './pages/league/History';
import Analysis from './pages/league/Analysis';
import Apply from './pages/league/apply';
import './App.css';

const db = getFirestore();
const functions = getFunctions();
const setAdminRole = httpsCallable(functions, 'setAdminRole');

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setError(null);

      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.error("User data not found");
            setError("사용자 데이터가 없습니다.");
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
  }, []);

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
        await setAdminRole({ uid: user.uid }); // 관리자로 설정
        console.log('Admin role assigned successfully');
      } catch (error) {
        console.error('Error assigning admin role:', error);
      }
    } else {
      console.error('User or userData is not available');
    }
  };

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Header />
      <Nav />

      {error && (
        <div className="bg-red-500 text-white text-center py-2">
          <p>{error}</p>
        </div>
      )}

      <Routes>
        {/* 모든 페이지에 대해 로그인 여부와 상관없이 접근 가능 */}
        <Route path="/"  element={<Home user={user} userData={userData} />} />
        <Route path="/mypage" element={user ? <MyPage userId={user.uid} user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/quest" element={user ? <Quest user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/quest/:id" element={user ? <QuestPage user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/store" element={user ? <Store user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/mission/entry" element={user ? <Entry user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/mission/beginner" element={user ? <Beginner user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/mission/intermediate" element={user ? <Intermediate user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/mission/advanced" element={user ? <Advanced user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/boss" element={user ? <Boss user={user} userData={userData} /> : <Navigate to="/login" />} />
        <Route path="/league/ranking" element={<Ranking />} />
        <Route path="/league/history" element={<History />} />
        <Route path="/league/analysis" element={<Analysis />} />
        <Route path="/league/apply" element={<Apply />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/club/intro" element={<ClubIntro />} />
        <Route path="/club/rules" element={<ClubRules />} />
        <Route path="/club/members" element={<ClubMembers />} />
        <Route path="/club/announcements" element={<Announcements />} />
        <Route path="/announcements/create" element={<CreateAnnouncement />} /> {/* 공지사항 작성 페이지 */}
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />
        <Route path="/club/board" element={<Board />} />
        <Route path="/badukboard" element={<BadukBoard />} />
        {/* 로그인/회원가입 페이지는 로그인 여부와 상관없이 접근 가능 */}
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;
