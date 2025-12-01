import React from "react";
import "./batongi-loader.css";

export default function BatongiLoader({
  fullscreen = false,
  text = "로딩 중...",
}) {
  const Wrapper = ({ children }) =>
    fullscreen ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
        {children}
      </div>
    ) : (
      <div className="flex items-center justify-center p-6">{children}</div>
    );

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-3 select-none">
        {/* 달리는 바통이 */}
        <div className="relative h-28 w-36 overflow-visible">
          <img
            src="/images/batongi-loading-run.png"
            alt="로딩중 바통이"
            style={{
          width: "120px",  // ✅ 여기 숫자를 줄이면 작아짐 (예: 80~120px 추천)
          height: "auto",
          animation: "run 1.2s infinite linear",
        }}
            className="absolute bottom-0 left-0 h-24 animate-run will-change-transform"
            draggable={false}
          />
          {/* 땀방울 */}    
          <div className="absolute right-4 top-2 h-3 w-3 rounded-full bg-cyan-400/90 animate-sweat" />
          {/* 속도선 */}
          <div className="absolute left-0 top-10 h-[2px] w-10 bg-slate-400/60 animate-speedline" />
        </div>

        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 tracking-wide">
          {text}
        </div>
      </div>
    </Wrapper>
  );
}
