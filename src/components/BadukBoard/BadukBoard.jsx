import React, { useRef, useEffect, useState } from "react";

const BOARD_SIZE = 19;
const BOARD_PIXEL_SIZE = 620;
const PADDING = 20;
const CELL_SIZE = (BOARD_PIXEL_SIZE - 2 * PADDING) / (BOARD_SIZE - 1);

const KOMI = 6.5; // 백 덤

const BadukBoard = () => {
  const canvasRef = useRef(null);

  const [stones, setStones] = useState([]); // {x, y, color}
  const [turn, setTurn] = useState("black");
  const [gameEnded, setGameEnded] = useState(false);
  const [result, setResult] = useState("");
  const [captured, setCaptured] = useState({ black: 0, white: 0 }); // 잡힌 돌 개수
  const [history, setHistory] = useState([]); // 바둑판 상태 기록 (패 체크용)

  // 바둑판과 돌 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 채우기
    ctx.fillStyle = "#deb887";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자선 그리기
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = PADDING + i * CELL_SIZE;

      // 수평선
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(BOARD_PIXEL_SIZE - PADDING, pos);
      ctx.stroke();

      // 수직선
      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, BOARD_PIXEL_SIZE - PADDING);
      ctx.stroke();
    }

    // 별자리 점 (호선)
    const starPoints = [3, 9, 15];
    ctx.fillStyle = "#000";
    starPoints.forEach((x) => {
      starPoints.forEach((y) => {
        const px = PADDING + x * CELL_SIZE;
        const py = PADDING + y * CELL_SIZE;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 돌 그리기 (그림자 포함)
    stones.forEach(({ x, y, color }) => {
      const px = PADDING + x * CELL_SIZE;
      const py = PADDING + y * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px + 1, py + 1, CELL_SIZE / 2.3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, CELL_SIZE / 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = color === "black" ? "#000" : "#fff";

      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = color === "black" ? "#000" : "#999";
      ctx.stroke();
    });
  }, [stones]);

  // 바둑판 상태 직렬화 (문자열 변환)
  const serializeBoard = (board) => {
    // 2D 배열 문자열 표현: 'x,y,color;' 로 모두 이어 붙임
    // stones 배열을 좌표별 색상 배열로 변환
    // 예: "0,0,black;0,1,white;..."
    return board
      .map(({ x, y, color }) => `${x},${y},${color}`)
      .sort() // 순서 고정 (좌표순)
      .join(";");
  };

  // 클릭 처리 및 착수 로직 (패 체크, 포획, 자살수 체크 포함)
  const handleClick = (e) => {
    if (gameEnded) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = Math.round((cx - PADDING) / CELL_SIZE);
    const y = Math.round((cy - PADDING) / CELL_SIZE);

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    if (stones.some((s) => s.x === x && s.y === y)) return;

    const opponentColor = turn === "black" ? "white" : "black";
    let tempStones = [...stones, { x, y, color: turn }];
    let totalCaptured = 0;

    // 상대 돌 포획 체크 및 제거, 잡힌 돌 카운트
    [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = tempStones.find(
        (s) => s.x === nx && s.y === ny && s.color === opponentColor
      );
      if (neighbor) {
        const group = getConnectedGroup(nx, ny, opponentColor, tempStones);
        if (!hasLibertyGroup(group, tempStones)) {
          totalCaptured += group.length;
          tempStones = tempStones.filter(
            (s) => !group.some((g) => g.x === s.x && g.y === s.y)
          );
        }
      }
    });

    // 자살수 체크
    const myGroup = getConnectedGroup(x, y, turn, tempStones);
    if (!hasLibertyGroup(myGroup, tempStones)) {
      alert("자살수입니다! 착수할 수 없습니다.");
      return;
    }

    // 패 체크: 새 보드 상태 직렬화 후 이전 두 상태와 비교
    const newBoardState = serializeBoard(tempStones);
    const prevState = history[history.length - 1] || null;
    const prevPrevState = history[history.length - 2] || null;

    // '패'는 바로 직전 상태가 아닌 그 전 상태와 같으면 발생
    if (newBoardState === prevPrevState) {
      alert("패입니다! 같은 상태가 반복되므로 착수할 수 없습니다.");
      return;
    }

    // 착수 성공 시 상태 업데이트
    setStones(tempStones);
    setCaptured((prev) => ({
      ...prev,
      [turn]: prev[turn] + totalCaptured,
    }));
    setTurn(opponentColor);

    // history에 새 상태 추가
    setHistory((prev) => [...prev, newBoardState]);
  };

  // 그룹 연결 돌 찾기 (DFS)
  const getConnectedGroup = (x, y, color, board) => {
    const visited = new Set();
    const group = [];
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const stone = board.find(
        (s) => s.x === cx && s.y === cy && s.color === color
      );
      if (!stone) continue;

      group.push(stone);

      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
        stack.push([cx + dx, cy + dy]);
      });
    }

    return group;
  };

  // 그룹 자유도 체크
  const hasLibertyGroup = (group, board) => {
    for (const { x, y } of group) {
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < BOARD_SIZE &&
          ny < BOARD_SIZE &&
          !board.some((s) => s.x === nx && s.y === ny)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // 되돌리기 기능
  const handleUndo = () => {
    if (stones.length === 0 || gameEnded) return;
    const last = stones[stones.length - 1];
    const newStones = stones.slice(0, stones.length - 1);
    setStones(newStones);

    // 되돌릴 때 잡힌 돌 수와 history도 되돌려야 함
    setCaptured({ black: 0, white: 0 });
    setHistory((prev) => prev.slice(0, prev.length - 1));

    setTurn(last.color);
  };

  // (이하 집 계산, 승패 계산 함수 등은 이전 코드와 동일)

  // 빈 공간 그룹 찾기
  const findEmptyGroups = (board) => {
    const visited = new Set();
    const emptyGroups = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const key = `${x},${y}`;
        if (visited.has(key)) continue;

        if (board.find((s) => s.x === x && s.y === y)) continue;

        const group = [];
        const stack = [[x, y]];
        visited.add(key);

        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          group.push({ x: cx, y: cy });

          [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
            const nx = cx + dx;
            const ny = cy + dy;
            const nKey = `${nx},${ny}`;
            if (
              nx < 0 ||
              ny < 0 ||
              nx >= BOARD_SIZE ||
              ny >= BOARD_SIZE ||
              visited.has(nKey) ||
              board.find((s) => s.x === nx && s.y === ny)
            ) {
              return;
            }
            visited.add(nKey);
            stack.push([nx, ny]);
          });
        }
        emptyGroups.push(group);
      }
    }
    return emptyGroups;
  };

  // 빈 공간 주변 돌 색 조사
  const getSurroundingColors = (group, board) => {
    const colors = new Set();

    group.forEach(({ x, y }) => {
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) return;

        const neighbor = board.find((s) => s.x === nx && s.y === ny);
        if (neighbor) {
          colors.add(neighbor.color);
        }
      });
    });

    return colors;
  };

  // 집 계산 함수
  const calculateTerritory = (board) => {
    const emptyGroups = findEmptyGroups(board);
    let blackTerritory = 0;
    let whiteTerritory = 0;

    emptyGroups.forEach((group) => {
      const colors = getSurroundingColors(group, board);
      if (colors.size === 1) {
        if (colors.has("black")) blackTerritory += group.length;
        else if (colors.has("white")) whiteTerritory += group.length;
      }
    });

    return { blackTerritory, whiteTerritory };
  };

  // 승패 계산 (돌 수 + 집 수 + 덤 + 잡힌 돌 수 반영)
  const calculateWinner = () => {
    const blackStones = stones.filter((s) => s.color === "black").length;
    const whiteStones = stones.filter((s) => s.color === "white").length;
    const { blackTerritory, whiteTerritory } = calculateTerritory(stones);

    const blackScore =
      blackStones + blackTerritory + captured.black; // 잡힌 돌은 상대가 가져감
    const whiteScore =
      whiteStones + whiteTerritory + captured.white + KOMI;

    const scoreDiff = Math.abs(blackScore - whiteScore).toFixed(1);

    let winner = "";
    if (blackScore > whiteScore) {
      winner = `흑 승 (${blackScore} vs ${whiteScore}, 차이 ${scoreDiff})`;
    } else if (whiteScore > blackScore) {
      winner = `백 승 (${whiteScore} vs ${blackScore}, 차이 ${scoreDiff})`;
    } else {
      winner = `무승부 (${blackScore} vs ${whiteScore})`;
    }

    return winner;
  };

  // 게임 종료 처리
  const endGame = () => {
    if (gameEnded) return;
    const winnerText = calculateWinner();
    setResult(winnerText);
    setGameEnded(true);
  };

  // 초기화
  const resetGame = () => {
    setStones([]);
    setTurn("black");
    setGameEnded(false);
    setResult("");
    setCaptured({ black: 0, white: 0 });
    setHistory([]);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <canvas
        ref={canvasRef}
        width={BOARD_PIXEL_SIZE}
        height={BOARD_PIXEL_SIZE}
        onClick={handleClick}
        style={{
          border: "4px solid #333",
          backgroundColor: "#deb887",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          borderRadius: 8,
          cursor: gameEnded ? "default" : "pointer",
        }}
      />
      <div className="mt-4 text-xl font-semibold select-none">
        {gameEnded ? result : `현재 차례: ${turn === "black" ? "⚫ 흑" : "⚪ 백"}`}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleUndo}
          disabled={stones.length === 0 || gameEnded}
          className="px-5 py-2 rounded bg-gray-300 disabled:opacity-50"
        >
          ⏪ 되돌리기
        </button>
        <button
          onClick={endGame}
          disabled={gameEnded}
          className="px-5 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          🏁 게임 종료
        </button>
        {gameEnded && (
          <button
            onClick={resetGame}
            className="px-5 py-2 rounded bg-blue-600 text-white"
          >
            🔄 다시 시작
          </button>
        )}
      </div>
      <div className="mt-3 select-none text-gray-700">
        <div>흑 잡힌 돌: {captured.black}</div>
        <div>백 잡힌 돌: {captured.white}</div>
      </div>
    </div>
  );
};

export default BadukBoard;
