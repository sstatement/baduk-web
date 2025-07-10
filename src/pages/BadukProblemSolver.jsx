import React, { useState } from "react";

export default function SimpleBadukBoard({ boardSize = 9 }) {
  const gridSize = 40; // 한 칸 간격 (px)
  const padding = 20; // 바둑판 가장자리 여백 (px)
  const stoneSize = 28; // 돌 지름 (px)
  const stoneRadius = stoneSize / 2;

  // 빈 바둑판 생성 (null: 빈 자리, "black" or "white" 돌)
  const createEmptyBoard = () =>
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));

  const [board, setBoard] = useState(createEmptyBoard());
  const [turn, setTurn] = useState("black");

  // 돌 놓기
  const handleClick = (x, y) => {
    if (board[y][x] !== null) return; // 이미 돌 있음
    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = turn;
    setBoard(newBoard);
    setTurn(turn === "black" ? "white" : "black");
  };

  // 바둑판 크기
  const boardPixelSize = gridSize * (boardSize - 1) + padding * 2;

  // 좌표 라벨
  const letters = Array.from({ length: boardSize }, (_, i) =>
    String.fromCharCode("A".charCodeAt(0) + i)
  );
  const numbers = Array.from({ length: boardSize }, (_, i) => boardSize - i);

  return (
    <div style={{ userSelect: "none", fontFamily: "sans-serif", padding: 20 }}>
      <h3>간단한 바둑판 ({boardSize}x{boardSize})</h3>
      <p>현재 턴: {turn === "black" ? "흑돌" : "백돌"}</p>

      <div style={{ display: "flex" }}>
        {/* Y축 숫자 */}
        <div style={{ marginRight: 8 }}>
          {numbers.map(num => (
            <div
              key={num}
              style={{
                height: gridSize,
                lineHeight: `${gridSize}px`,
                fontWeight: "bold",
                textAlign: "right",
                paddingRight: 4,
                userSelect: "none",
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* 바둑판 SVG + 돌 */}
        <div
          style={{
            position: "relative",
            width: boardPixelSize,
            height: boardPixelSize,
            backgroundColor: "#deb887",
            boxSizing: "content-box",
            padding: padding,
            border: "2px solid #333",
          }}
        >
          {/* 바둑판 선 (SVG) */}
          <svg
            width={boardPixelSize}
            height={boardPixelSize}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          >
            {/* 가로선 */}
            {Array.from({ length: boardSize }).map((_, i) => (
              <line
                key={"h" + i}
                x1={padding}
                y1={padding + i * gridSize}
                x2={padding + (boardSize - 1) * gridSize}
                y2={padding + i * gridSize}
                stroke="black"
                strokeWidth="1"
              />
            ))}

            {/* 세로선 */}
            {Array.from({ length: boardSize }).map((_, i) => (
              <line
                key={"v" + i}
                x1={padding + i * gridSize}
                y1={padding}
                x2={padding + i * gridSize}
                y2={padding + (boardSize - 1) * gridSize}
                stroke="black"
                strokeWidth="1"
              />
            ))}

            {/* 별(포인트) 찍기 (9x9 기준 일부 점) */}
            {boardSize >= 9 &&
              [2, 6].flatMap(y =>
                [2, 4, 6].map(x => (
                  <circle
                    key={`star-${x}-${y}`}
                    cx={padding + x * gridSize}
                    cy={padding + y * gridSize}
                    r={4}
                    fill="black"
                  />
                ))
              )}

            {boardSize >= 13 && (
              <>
                {/* 13x13별 */}
                {[3, 9].flatMap(y =>
                  [3, 6, 9].map(x => (
                    <circle
                      key={`star-13-${x}-${y}`}
                      cx={padding + x * gridSize}
                      cy={padding + y * gridSize}
                      r={4}
                      fill="black"
                    />
                  ))
                )}
              </>
            )}
          </svg>

          {/* 돌 놓기 영역 */}
          {board.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x},${y}`}
                onClick={() => handleClick(x, y)}
                style={{
                  position: "absolute",
                  top: padding + y * gridSize - stoneRadius,
                  left: padding + x * gridSize - stoneRadius,
                  width: stoneSize,
                  height: stoneSize,
                  borderRadius: "50%",
                  cursor: cell === null ? "pointer" : "default",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  userSelect: "none",
                }}
              >
                {cell && (
                  <div
                    style={{
                      width: stoneSize,
                      height: stoneSize,
                      borderRadius: "50%",
                      backgroundColor: cell === "black" ? "black" : "white",
                      border: "1.5px solid black",
                      boxShadow:
                        cell === "black"
                          ? "0 0 8px rgba(0,0,0,0.7)"
                          : "inset 0 0 5px rgba(0,0,0,0.3)",
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* X축 문자 */}
      <div
        style={{
          marginLeft: padding + 28,
          marginTop: 8,
          display: "flex",
          userSelect: "none",
        }}
      >
        {letters.map(letter => (
          <div
            key={letter}
            style={{
              width: gridSize,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}
