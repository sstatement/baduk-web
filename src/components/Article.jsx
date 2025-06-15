import React from "react";
import { Link } from "react-router-dom";

const rankImages = {
  챌린저: "/images/챌린저.jpg",
  그랜드마스터: "/images/그랜드마스터.jpg",
  마스터: "/images/마스터.jpg",
  다이아: "/images/다이아.jpg",
  플래티넘: "/images/플래티넘.jpg",
  골드: "/images/골드.jpg",
  실버: "/images/실버.jpg",
  브론즈: "/images/브론즈.jpg",
};

const Article = ({ user, handleGoogleLogin, handleLogout, userProfile }) => {
  // userProfile 예시: { rank: "다이아", stamina: 1200, mileage: 2500, photoURL: "", displayName: "" }

  // 랭크 이미지 URL
  const rankImgSrc = userProfile?.rank ? rankImages[userProfile.rank] : null;

  // 기력 텍스트 예시 (기력 계산 로직이 필요하다면 분리 가능)
  const getStaminaText = (stamina) => {
    if (!stamina) return "-";
    if (stamina >= 1000) {
      return `${Math.floor((stamina - 1000) / 100) + 1}단`;
    }
    return `${18 - Math.floor(stamina / 50)}급`;
  };

  return (
    <article className="article p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">로그인</h2>

      {!user ? (
        <div className="login-container">
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            구글 계정으로 로그인
          </button>
        </div>
      ) : (
        <div className="profile-container flex flex-col items-center gap-3">
          {/* 프로필 사진 */}
          {userProfile?.photoURL ? (
            <img
              src="{userProfile.photoURL}"
              alt="프로필 사진"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              <img
              src="images/바통이.jpg"
              alt="프로필 사진"
              className="w-20 h-120 rounded-full object-cover"
              style={{ height: "80px" }}
            />
            </div>
          )}

          {/* 이름 */}
          <p className="text-lg font-medium">
            {userProfile?.displayName || user.displayName || user.email}
          </p>

          {/* 랭크 및 랭크 사진 */}
          <div className="flex items-center gap-2">
            {rankImgSrc && (
              <img
                src={rankImgSrc}
                alt={`${userProfile.rank} 랭크 이미지`}
                className="w-8 h-8"
              />
            )}
            <span className="font-semibold">{userProfile?.rank || "-"}</span>
          </div>

          {/* 기력 */}
          <p>
            <strong>기력:</strong> {getStaminaText(userProfile?.stamina)}
          </p>

          {/* 마일리지 */}
          <p>
            <strong>마일리지:</strong> {userProfile?.mileage ?? 0} 점
          </p>

          {/* 마이페이지 링크 */}
          <Link
            to="/mypage"
            className="mt-2 px-3 py-1 border rounded text-blue-600 hover:bg-blue-100"
          >
            마이페이지 보기
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      )}
    </article>
  );
};

export default Article;
