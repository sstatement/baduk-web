import React, { useEffect, useRef } from "react";

export default function BadukBoard() {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const stonesRef = useRef([]);
  const colorRef = useRef(1); // 1: 흑, 2: 백

  useEffect(() => {
    if (!window.WGo) {
      console.error("WGo 라이브러리가 로드되지 않았습니다.");
      return;
    }
    if (!boardRef.current) {
      console.error("보드 렌더링용 DOM 요소가 없습니다.");
      return;
    }

    boardInstance.current = new window.WGo.Board(boardRef.current, {
      size: 19,
      width: 600,
      height: 600,
    });

    const handleClick = (x, y) => {
      console.log(`클릭 좌표: x=${x}, y=${y}`);

      if (x == null || y == null) {
        console.warn("좌표가 null입니다. 착수 불가.");
        return;
      }

      const alreadyPlaced = stonesRef.current.some(
        (stone) => stone.x === x && stone.y === y
      );
      if (alreadyPlaced) {
        console.warn(`이미 돌이 있는 위치입니다: x=${x}, y=${y}`);
        return;
      }

      const color = colorRef.current;
      console.log(`돌을 놓습니다. 색상: ${color === 1 ? "흑" : "백"}`);

      const newStone = {
        x,
        y,
        c: color,
        draw(board, ctx) {
          console.log(`돌 그리기: 색상 ${this.c === 1 ? "흑" : "백"}, 좌표 x=${this.x}, y=${this.y}`);

          const size = board.stoneSize * 0.95;
          const px = board.getX(this.x);
          const py = board.getY(this.y);

          ctx.beginPath();
          ctx.fillStyle = this.c === 1 ? "black" : "white";
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 5;
          ctx.arc(px, py, size / 2, 0, 2 * Math.PI);
          ctx.fill();

          if (this.c === 2) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        },
      };

      boardInstance.current.addObject(newStone);
      stonesRef.current.push(newStone);

      colorRef.current = color === 1 ? 2 : 1;
      console.log(`다음 돌 색상: ${colorRef.current === 1 ? "흑" : "백"}`);
    };

    boardInstance.current.addEventListener("click", handleClick);

    return () => {
      if (boardInstance.current) {
        boardInstance.current.removeEventListener("click", handleClick);
        boardInstance.current = null;
      }
      stonesRef.current = [];
    };
  }, []);

  return (
    <div
      ref={boardRef}
      style={{
        width: "600px",
        height: "600px",
        margin: "auto",
        border: "1px solid black",
      }}
    />
  );
}
