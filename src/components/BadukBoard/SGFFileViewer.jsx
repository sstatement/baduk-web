import React, { useState, useEffect, useRef, memo } from "react";

// 좌표 변환 함수
function sgfCoordToXY(coord) {
  if (!coord || coord.length !== 2) return null;
  const a = "a".charCodeAt(0);
  return {
    x: coord.charCodeAt(0) - a,
    y: coord.charCodeAt(1) - a,
  };
}

const BOARD_SIZE = 19;
const BOARD_PIXEL_SIZE = 600;
const PADDING = 20;
const CELL_SIZE = (BOARD_PIXEL_SIZE - 2 * PADDING) / (BOARD_SIZE - 1);

// SGF 파서 (분기 포함)
function parseSGF(sgf) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < sgf.length && /\s/.test(sgf[pos])) pos++;
  }

  function parseNode() {
    skipWhitespace();
    if (sgf[pos] !== ";") return null;
    pos++;

    let node = { move: null, children: [] };
    while (pos < sgf.length) {
      skipWhitespace();
      if (";()".includes(sgf[pos])) break;

      let propName = "";
      while (/[A-Z]/.test(sgf[pos])) {
        propName += sgf[pos++];
      }
      skipWhitespace();

      let values = [];
      while (sgf[pos] === "[") {
        pos++;
        let val = "";
        while (sgf[pos] !== "]") {
          val += sgf[pos] === "\\" ? sgf[++pos] : sgf[pos];
          pos++;
        }
        pos++; // skip ']'
        values.push(val);
        skipWhitespace();
      }

      if ((propName === "B" || propName === "W") && values.length > 0) {
        node.move = {
          color: propName === "B" ? "black" : "white",
          point: values[0],
        };
      }
    }
    return node;
  }

  function parseSequence() {
    const nodes = [];
    while (pos < sgf.length) {
      skipWhitespace();
      if (sgf[pos] === ";") {
        const node = parseNode();
        if (node) nodes.push(node);
      } else if (sgf[pos] === "(") {
        pos++;
        const variation = parseSequence();
        if (nodes.length === 0) nodes.push(...variation);
        else nodes[nodes.length - 1].children.push(...variation);
      } else if (sgf[pos] === ")") {
        pos++;
        break;
      } else {
        pos++;
      }
    }
    return nodes;
  }

  return parseSequence();
}

function getNodeByPath(tree, path) {
  let nodes = tree;
  let node = null;
  for (const idx of path) {
    if (!nodes || idx >= nodes.length) return null;
    node = nodes[idx];
    nodes = node.children;
  }
  return node;
}

// ✅ 현재 경로부터 연속되는 수까지 모두 누적해서 돌 생성
function collectAllStonesFrom(tree, path) {
  const stones = [];

  let nodes = tree;
  for (const idx of path) {
    const node = nodes[idx];
    if (node?.move) {
      const xy = sgfCoordToXY(node.move.point);
      if (xy) stones.push({ ...xy, color: node.move.color });
    }
    nodes = node?.children ?? [];
  }

  let node = getNodeByPath(tree, path);
  while (node?.children?.length === 1) {
    node = node.children[0];
    if (node.move) {
      const xy = sgfCoordToXY(node.move.point);
      if (xy) stones.push({ ...xy, color: node.move.color });
    }
  }

  return stones;
}

const SGFTreeNode = memo(function SGFTreeNode({
  node,
  path,
  currentPath,
  onSelectPath,
  depth = 0,
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (!node) return null;

  const isSelected =
    path.length === currentPath.length &&
    path.every((v, i) => v === currentPath[i]);

  const label = node.move
    ? `${node.move.color === "black" ? "⚫" : "⚪"} ${node.move.point}`
    : "root";

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => {
          onSelectPath(path);
          setCollapsed(!collapsed);
        }}
        style={{
          backgroundColor: isSelected ? "#bde4ff" : "transparent",
          padding: "2px 6px",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          gap: 6,
        }}
      >
        {node.children.length > 0 && (
          <span>{collapsed ? "[+]" : "[-]"}</span>
        )}
        <span>{label}</span>
      </div>
      {!collapsed &&
        node.children.map((child, i) => (
          <SGFTreeNode
            key={i}
            node={child}
            path={[...path, i]}
            currentPath={currentPath}
            onSelectPath={onSelectPath}
            depth={depth + 1}
          />
        ))}
    </div>
  );
});

export default function SGFViewer() {
  const canvasRef = useRef(null);
  const [sgfText, setSgfText] = useState("");
  const [sgfTree, setSgfTree] = useState([]);
  const [currentPath, setCurrentPath] = useState([0]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSgfText(reader.result);
    reader.readAsText(file, "utf-8");
  };

  useEffect(() => {
    if (!sgfText) return;
    try {
      const tree = parseSGF(sgfText);
      setSgfTree(tree);
      setCurrentPath([0]);
    } catch (e) {
      console.error("SGF 파싱 실패", e);
    }
  }, [sgfText]);

  const currentNode = getNodeByPath(sgfTree, currentPath);
  const nextNodes = currentNode?.children ?? [];

  const stones = collectAllStonesFrom(sgfTree, currentPath);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);

    ctx.fillStyle = "#deb887";
    ctx.fillRect(0, 0, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);

    ctx.strokeStyle = "#000";
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = PADDING + i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(BOARD_PIXEL_SIZE - PADDING, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, BOARD_PIXEL_SIZE - PADDING);
      ctx.stroke();
    }

    const star = [3, 9, 15];
    ctx.fillStyle = "#000";
    star.forEach((x) =>
      star.forEach((y) => {
        ctx.beginPath();
        ctx.arc(PADDING + x * CELL_SIZE, PADDING + y * CELL_SIZE, 4, 0, 2 * Math.PI);
        ctx.fill();
      })
    );

    stones.forEach(({ x, y, color }, i) => {
      const px = PADDING + x * CELL_SIZE;
      const py = PADDING + y * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px + 1, py + 1, CELL_SIZE / 2.3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, CELL_SIZE / 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = color === "black" ? "#000" : "#fff";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.fillStyle = color === "black" ? "#fff" : "#000";
      ctx.font = `${CELL_SIZE / 3}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i + 1, px, py);
    });
  }, [stones]);

  function goNext(idx = 0) {
    if (!currentNode || idx >= nextNodes.length) return;
    setCurrentPath([...currentPath, idx]);
  }

  function goBack() {
    if (currentPath.length > 1) setCurrentPath(currentPath.slice(0, -1));
  }

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div>
        <h2>SGF 뷰어</h2>
        <input type="file" accept=".sgf,.txt" onChange={onFileChange} />
        <canvas
          ref={canvasRef}
          width={BOARD_PIXEL_SIZE}
          height={BOARD_PIXEL_SIZE}
          style={{ border: "3px solid black", marginTop: 10 }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={goBack} disabled={currentPath.length <= 1}>
            이전 수
          </button>
          {nextNodes.length === 1 && (
            <button onClick={() => goNext(0)}>다음 수</button>
          )}
        </div>
        {nextNodes.length > 1 && (
          <div style={{ marginTop: 10 }}>
            분기 선택:{" "}
            {nextNodes.map((_, i) => (
              <button
                key={i}
                onClick={() => goNext(i)}
                style={{ marginRight: 8 }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          width: 300,
          maxHeight: BOARD_PIXEL_SIZE,
          overflowY: "auto",
          background: "#f0f0f0",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      >
        <h4>분기 트리</h4>
        {sgfTree.length > 0 && (
          <SGFTreeNode
            node={{ children: sgfTree }}
            path={[]}
            currentPath={currentPath}
            onSelectPath={setCurrentPath}
          />
        )}
      </div>
    </div>
  );
}
