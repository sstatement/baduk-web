import React from "react";
import batonImage from "../images/가두모집.jpg"; // 이미지 경로를 import로 가져옴

const Aside = () => {
  return (
    <aside className="w-1/3 p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">광고</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        {/* 광고 배너 추가 */}
        <img
          src={batonImage}  // import한 이미지를 src에 사용
          alt="광고 배너"
          style={{ width: "400px", height: "700px" }}
        />
        <p>광고 문의는 010-8508-7363</p>
      </div>
    </aside>
  );
};

export default Aside;
