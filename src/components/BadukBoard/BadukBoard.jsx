import React, { useRef, useEffect, useState } from "react";

const BOARD_SIZE = 19;
const BOARD_PIXEL_SIZE = 620;
const PADDING = 20;
const CELL_SIZE = (BOARD_PIXEL_SIZE - 2 * PADDING) / (BOARD_SIZE - 1);

// === 일본식 채점 ===
const DEFAULT_KOMI = 6.5; // 백 덤(일본식)
const SNAP_RADIUS = (CELL_SIZE * 0.4);

// onSave를 부모에서 넘기면 DB 저장 등에 활용 가능:
// <BadukBoard onSave={(payload)=>{ ... }} />
export default function BadukBoard({ onSave }) {
  const canvasRef = useRef(null);

  // --- 메타 입력(플레이어/코미/날짜) ---
  const [blackName, setBlackName] = useState("");
  const [whiteName, setWhiteName] = useState("");
  const [komi, setKomi] = useState(DEFAULT_KOMI);
  const [matchDate, setMatchDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // --- 대국 상태 ---
  // stones: {x, y, color}
  const [stones, setStones] = useState([]);
  const [turn, setTurn] = useState("black");
  const [gameEnded, setGameEnded] = useState(false);
  const [resultText, setResultText] = useState("");

  // 일본식: 내가 딴 포로 수 (흑/백)
  const [captured, setCaptured] = useState({ black: 0, white: 0 });

  // 직후 보드 상태(직렬화) 히스토리 (패 판단)
  const [historyPos, setHistoryPos] = useState([""]);

  // 되돌리기용 수순: [{x,y,color,captured:[{x,y,color}]}]
  const [moves, setMoves] = useState([]);

  // 종국 결과(구조화) — 저장/연동에 사용
  // { type: "resign"|"points", winner: "black"|"white", margin?: number, rule: "japanese" }
  const [resultObj, setResultObj] = useState(null);

  // --- 렌더 ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = "#deb887";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = PADDING + i * CELL_SIZE;

      // 수평
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(BOARD_PIXEL_SIZE - PADDING, pos);
      ctx.stroke();

      // 수직
      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, BOARD_PIXEL_SIZE - PADDING);
      ctx.stroke();
    }

    // 호선(별점)
    const star = [3, 9, 15];
    ctx.fillStyle = "#000";
    star.forEach((x) => {
      star.forEach((y) => {
        const px = PADDING + x * CELL_SIZE;
        const py = PADDING + y * CELL_SIZE;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 돌
    stones.forEach(({ x, y, color }) => {
      const px = PADDING + x * CELL_SIZE;
      const py = PADDING + y * CELL_SIZE;

      // 그림자
      ctx.beginPath();
      ctx.arc(px + 1, py + 1, CELL_SIZE / 2.3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fill();

      // 본체
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

  // --- 공통 유틸 ---
  const serializeBoard = (board) => {
    return board
      .map(({ x, y, color }) => `${x},${y},${color}`)
      .sort()
      .join(";");
  };

  const neighbors = (x, y) =>
    [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ].map(([dx, dy]) => [x + dx, y + dy]);

  const getConnectedGroup = (x, y, color, board) => {
    const stack = [[x, y]];
    const seen = new Set();
    const group = [];
    while (stack.length) {
      const [cx, cy] = stack.pop();
      const key = `${cx},${cy}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const stone = board.find((s) => s.x === cx && s.y === cy && s.color === color);
      if (!stone) continue;

      group.push(stone);
      neighbors(cx, cy).forEach(([nx, ny]) => stack.push([nx, ny]));
    }
    return group;
  };

  const hasLibertyGroup = (group, board) => {
    for (const { x, y } of group) {
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < BOARD_SIZE &&
          ny < BOARD_SIZE &&
          !board.some((s) => s.x === nx && s.y === ny)
        )
          return true;
      }
    }
    return false;
  };

  const findEmptyGroups = (board) => {
    const visited = new Set();
    const groups = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        if (board.find((s) => s.x === x && s.y === y)) continue;

        const stack = [[x, y]];
        const group = [];
        visited.add(key);

        while (stack.length) {
          const [cx, cy] = stack.pop();
          group.push({ x: cx, y: cy });
          for (const [dx, dy] of [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ]) {
            const nx = cx + dx,
              ny = cy + dy;
            const nkey = `${nx},${ny}`;
            if (
              nx < 0 ||
              ny < 0 ||
              nx >= BOARD_SIZE ||
              ny >= BOARD_SIZE ||
              visited.has(nkey) ||
              board.find((s) => s.x === nx && s.y === ny)
            )
              continue;
            visited.add(nkey);
            stack.push([nx, ny]);
          }
        }
        groups.push(group);
      }
    }
    return groups;
  };

  const getSurroundingColors = (group, board) => {
    const colors = new Set();
    for (const { x, y } of group) {
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) continue;
        const neighbor = board.find((s) => s.x === nx && s.y === ny);
        if (neighbor) colors.add(neighbor.color);
      }
    }
    return colors;
  };

  // === 일본식 점수(집 + 포로 + 덤) ===
  const scoreJapanese = (board, prisoners, komiVal) => {
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

    const black = blackTerritory + prisoners.black; // 흑 포로(=흑이 딴 돌 수)
    const white = whiteTerritory + prisoners.white + komiVal; // 백 포로 + 덤
    return { black, white };
  };

  // --- SGF 내보내기 ---
  // 좌표를 SGF 'aa' 같은 문자열로 변환
  const toSgfCoord = (x, y) =>
    String.fromCharCode(97 + x) + String.fromCharCode(97 + y);

  // 현재 게임을 SGF 문자열로 만들기
  const toSGF = () => {
    const seq = moves
      .map((m) => {
        const tag = m.color === "black" ? "B" : "W";
        return `;${tag}[${toSgfCoord(m.x, m.y)}]`;
      })
      .join("");

    // 메타(플레이어, 코미, 날짜) 포함
    const dt = matchDate.replace(/-/g, ".");
    const pb = blackName || "Black";
    const pw = whiteName || "White";
    const km = Number(komi) || DEFAULT_KOMI;

    // 결과(일본식 표기: B+R/W+R, B+<집>/W+<집>)
    let re = "";
    if (resultObj) {
      if (resultObj.type === "resign") {
        re = resultObj.winner === "black" ? "B+R" : "W+R";
      } else if (resultObj.type === "points") {
        const m = (resultObj.margin ?? 0).toFixed(1);
        re = resultObj.winner === "black" ? `B+${m}` : `W+${m}`;
      }
    }

    return `(;GM[1]FF[4]SZ[${BOARD_SIZE}]KM[${km}]DT[${dt}]PB[${pb}]PW[${pw}]${re ? `RE[${re}]` : ""}${seq})`;
  };

  const downloadTextFile = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportSGF = () => {
    const sgf = toSGF();
    const base = `${matchDate}_${blackName || "Black"}-vs-${whiteName || "White"}`;
    downloadTextFile(`${base}.sgf`, sgf);
  };

  // --- 착수 ---
  const handleClick = (e) => {
    if (gameEnded) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = Math.round((cx - PADDING) / CELL_SIZE);
    const y = Math.round((cy - PADDING) / CELL_SIZE);
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;

    const nx = PADDING + x * CELL_SIZE;
    const ny = PADDING + y * CELL_SIZE;
    if (Math.hypot(cx - nx, cy - ny) > SNAP_RADIUS) return;

    if (stones.some((s) => s.x === x && s.y === y)) return;

    const opponent = turn === "black" ? "white" : "black";
    const before = stones;
    let temp = [...stones, { x, y, color: turn }];

    // 인접 상대 그룹 포획
    let capturedThisMove = [];
    for (const [dx, dy] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const ax = x + dx,
        ay = y + dy;
      const neighbor = temp.find((s) => s.x === ax && s.y === ay && s.color === opponent);
      if (!neighbor) continue;
      const g = getConnectedGroup(ax, ay, opponent, temp);
      if (!hasLibertyGroup(g, temp)) {
        temp = temp.filter((s) => !g.some((gs) => gs.x === s.x && gs.y === s.y));
        capturedThisMove.push(...g);
      }
    }

    // 자살수 금지
    const myGroup = getConnectedGroup(x, y, turn, temp);
    if (!hasLibertyGroup(myGroup, temp)) {
      alert("자살수입니다! 착수할 수 없습니다.");
      return;
    }

    // 패(코): 새 상태가 '두 수 전'과 같으면 금지
    const newPos = serializeBoard(temp);
    const prevPrev = historyPos.length >= 2 ? historyPos[historyPos.length - 2] : null;
    if (prevPrev && newPos === prevPrev) {
      alert("패입니다! 같은 형태를 즉시 반복할 수 없습니다.");
      return;
    }

    // 확정
    setStones(temp);
    setMoves((prev) => [...prev, { x, y, color: turn, captured: capturedThisMove }]);
    if (capturedThisMove.length) {
      setCaptured((prev) => ({
        ...prev,
        [turn]: prev[turn] + capturedThisMove.length,
      }));
    }
    setTurn(opponent);
    setHistoryPos((prev) => [...prev, newPos]);
  };

  // --- 되돌리기 ---
  const handleUndo = () => {
    if (!moves.length || gameEnded) return;
    const last = moves[moves.length - 1];

    // 마지막 수 제거 + 잡았던 돌 복원
    let reverted = stones.filter(
      (s) => !(s.x === last.x && s.y === last.y && s.color === last.color)
    );
    if (last.captured?.length) {
      reverted = [...reverted, ...last.captured];
    }

    setStones(reverted);
    setMoves((prev) => prev.slice(0, -1));

    if (last.captured?.length) {
      setCaptured((prev) => ({
        ...prev,
        [last.color]: Math.max(0, prev[last.color] - last.captured.length),
      }));
    }

    setTurn(last.color);
    setHistoryPos((prev) => prev.slice(0, -1));
  };

  // --- 패스/기권 & 종국 ---
  const [consecutivePasses, setConsecutivePasses] = useState(0);

  const handlePass = () => {
    if (gameEnded) return;
    const currentPos = serializeBoard(stones);
    setHistoryPos((prev) => [...prev, currentPos]);
    setConsecutivePasses((p) => p + 1);
    setTurn(turn === "black" ? "white" : "black");
    if (consecutivePasses + 1 >= 2) {
      endGameJapanese();
    }
  };

  const resign = (side) => {
    if (gameEnded) return;
    if (side === "black") {
      setResultText("백 불계승");
      setResultObj({ type: "resign", winner: "white", rule: "japanese" });
    } else {
      setResultText("흑 불계승");
      setResultObj({ type: "resign", winner: "black", rule: "japanese" });
    }
    setGameEnded(true);
  };

  const endGameJapanese = () => {
    if (gameEnded) return;
    const { black, white } = scoreJapanese(stones, captured, Number(komi) || DEFAULT_KOMI);
    const diff = Math.abs(black - white);
    const diffStr = diff.toFixed(1);

    if (black > white) {
      setResultText(`흑 집승 (${black.toFixed(1)} vs ${white.toFixed(1)}, ${diffStr}집)`);
      setResultObj({ type: "points", winner: "black", margin: diff, rule: "japanese" });
    } else if (white > black) {
      setResultText(`백 집승 (${white.toFixed(1)} vs ${black.toFixed(1)}, ${diffStr}집)`);
      setResultObj({ type: "points", winner: "white", margin: diff, rule: "japanese" });
    } else {
      setResultText(`무승부 (${black.toFixed(1)} vs ${white.toFixed(1)})`);
      setResultObj({ type: "points", winner: "draw", margin: 0, rule: "japanese" });
    }
    setGameEnded(true);
  };

  // --- 기록 저장 ---
  // onSave 콜백이 있으면 그걸 호출(예: Firestore). 없으면 JSON 파일로 다운로드.
  const handleSaveRecord = () => {
    if (!resultObj) {
      alert("먼저 종국 처리(집계 또는 기권)를 해주세요.");
      return;
    }
    const sgf = toSGF();
    const payload = {
      date: matchDate,
      rule: "japanese",
      komi: Number(komi) || DEFAULT_KOMI,
      blackName: blackName || "Black",
      whiteName: whiteName || "White",
      result: resultObj,                 // 구조화된 결과
      resultText,                        // 사람이 읽는 결과
      prisoners: { ...captured },        // 포로
      moves: moves.map(({ x, y, color }) => ({ x, y, color })),
      sgf,
      boardSize: BOARD_SIZE,
    };

    if (typeof onSave === "function") {
      onSave(payload);
      alert("기록이 저장(콜백 호출)되었습니다.");
    } else {
      // 로컬 다운로드
      const base = `${matchDate}_${payload.blackName}-vs-${payload.whiteName}`;
      downloadTextFile(`${base}.json`, JSON.stringify(payload, null, 2));
      alert("기록 JSON을 다운로드했습니다.");
    }
  };

  // --- 초기화 ---
  const resetGame = () => {
    setStones([]);
    setTurn("black");
    setGameEnded(false);
    setResultText("");
    setCaptured({ black: 0, white: 0 });
    setMoves([]);
    setHistoryPos([""]);
    setConsecutivePasses(0);
    setResultObj(null);
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      {/* 메타 입력 폼 */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">흑(Black) 플레이어</label>
          <input
            className="rounded border p-2"
            placeholder="예: 김흑돌"
            value={blackName}
            onChange={(e) => setBlackName(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">백(White) 플레이어</label>
          <input
            className="rounded border p-2"
            placeholder="예: 이백돌"
            value={whiteName}
            onChange={(e) => setWhiteName(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">코미(덤, 집)</label>
          <input
            type="number"
            step="0.5"
            className="rounded border p-2"
            value={komi}
            onChange={(e) => setKomi(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">대국 날짜</label>
          <input
            type="date"
            className="rounded border p-2"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
          />
        </div>
      </div>

      {/* 바둑판 */}
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
          maxWidth: "100%",
          height: "auto",
        }}
      />

      {/* 상태/버튼 */}
      <div className="mt-1 text-lg font-semibold select-none">
        {gameEnded ? resultText : `현재 차례: ${turn === "black" ? "⚫ 흑" : "⚪ 백"}`}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleUndo}
          disabled={!moves.length || gameEnded}
          className="px-5 py-2 rounded bg-gray-300 disabled:opacity-50"
        >
          ⏪ 되돌리기
        </button>

        <button
          onClick={handlePass}
          disabled={gameEnded}
          className="px-5 py-2 rounded bg-amber-600 text-white disabled:opacity-50"
        >
          ⏸ 패스
        </button>

        <button
          onClick={() => resign("black")}
          disabled={gameEnded}
          className="px-5 py-2 rounded bg-red-700 text-white disabled:opacity-50"
        >
          ⚫ 흑 기권
        </button>
        <button
          onClick={() => resign("white")}
          disabled={gameEnded}
          className="px-5 py-2 rounded bg-blue-700 text-white disabled:opacity-50"
        >
          ⚪ 백 기권
        </button>

        <button
          onClick={endGameJapanese}
          disabled={gameEnded}
          className="px-5 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          🏁 집계(일본식)
        </button>

        <button
          onClick={handleExportSGF}
          className="px-5 py-2 rounded bg-slate-800 text-white"
        >
          📦 SGF 내보내기
        </button>

        <button
          onClick={handleSaveRecord}
          className="px-5 py-2 rounded bg-black text-white"
        >
          💾 기록 저장
        </button>

        {gameEnded && (
          <button
            onClick={resetGame}
            className="px-5 py-2 rounded bg-indigo-600 text-white"
          >
            🔄 다시 시작
          </button>
        )}
      </div>

      <div className="mt-2 select-none text-gray-700 grid grid-cols-2 gap-4">
        <div>흑 포로(딴 돌): {captured.black}</div>
        <div>백 포로(딴 돌): {captured.white}</div>
      </div>
    </div>
  );
}
