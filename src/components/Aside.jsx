import React from "react";
import batonImage from "../images/가두모집.jpg";

const Aside = () => {
  return (
    <aside className="w-1/3 p-4 bg-gray-50 rounded-lg shadow-lg sticky top-20">
      <h2 className="text-2xl font-extrabold mb-6 text-center text-blue-700 border-b-2 border-blue-300 pb-2">
        광고
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center gap-4">
        <img
          src={batonImage}
          alt="광고 배너"
          style={{
            width: "100%", // 반응형으로 꽉 차게
            maxWidth: "400px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
            objectFit: "cover",
            aspectRatio: "4 / 7", // 400x700 비율 유지
          }}
        />
        <p className="text-gray-700 font-semibold text-center">
          광고 문의는 <span className="text-blue-600">010-8508-7363</span>
        </p>
      </div>
    </aside>
  );
};

export default Aside;
