// src/AppRoutes.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

import Home from "./pages/Home";
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


import "./App.css";

const functions = getFunctions();
const setAdminRole = httpsCallable(functions, "setAdminRole");

const AppRoutes = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Nav />

      {error && (
        <div className="bg-red-500 text-white text-center py-2">
          <p>{error}</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home user={user} userData={userData} />} />
        <Route
          path="/mypage"
          element={user ? <MyPage userId={user.uid} user={user} userData={userData} /> : <Navigate to="/login" />}
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
        <Route
          path="/boss"
          element={user ? <Boss user={user} userData={userData} /> : <Navigate to="/login" />}
        />
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
        <Route path="/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />
        <Route path="/club/board" element={<Board />} />
        <Route path="/badukboard" element={<BadukBoard />} />
        <Route path="/SGFfileviewer" element={<SGFFileViewer />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      </Routes>

      <Footer />
    </>
  );
};

export default AppRoutes;
