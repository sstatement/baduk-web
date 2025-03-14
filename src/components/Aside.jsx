import React from "react";
import batonImage from "../images/바통이.jpg"; // 이미지 경로를 import로 가져옴

const Aside = () => {
  return (
    <aside className="w-1/3 p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">광고</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p>여기 광고 영역입니다.</p>
        {/* 광고 배너 추가 */}
        <img
          src={batonImage}  // import한 이미지를 src에 사용
          alt="광고 배너"
          className="w-full max-h-48 object-contain transform scale-50"
        />
      </div>
    </aside>
  );
};

export default Aside;
