import React, { useState, useEffect, useRef } from 'react';

const boardSize = 19;
const boardPixelSize = 620;
const padding = 20;
const cellSize = (boardPixelSize - 2 * padding) / (boardSize - 1);

const sgfFiles = [
  '날일자 굳힘.sgf',
  'example2.sgf',
  'lee_sedol_vs_alphago.sgf',
];

// SGF 노드 구조
class SGFNode {
  constructor(move = null, parent = null) {
    this.move = move; // {x, y, color} or null (root)
    this.parent = parent;
    this.children = [];
    this.label = ''; // 분기 라벨 A, B, C...
  }
}

function parseSGFtoTree(sgf) {
  let pos = 0;

  // 공백 등 넘기기
  while (pos < sgf.length && sgf[pos] !== '(') pos++;
  if (pos >= sgf.length) return null;

  function parseNode(parent = null) {
    let node = new SGFNode(null, parent);
    while (pos < sgf.length) {
      if (sgf[pos] === ';') {
        pos++;
        // 여러 속성/수 파싱
        while (true) {
          // 착수 파싱
          const moveMatch = /^[BW]\[[a-s]{2}\]/.exec(sgf.slice(pos));
          if (moveMatch) {
            const token = moveMatch[0];
            const color = token[0] === 'B' ? 'black' : 'white';
            const coord = token.slice(2, 4);
            const x = coord.charCodeAt(0) - 97;
            const y = coord.charCodeAt(1) - 97;

            const childNode = new SGFNode({ x, y, color }, node);
            node.children.push(childNode);
            node = childNode; // move down
            pos += token.length;
          } else {
            // 기타 속성 (C[], etc)
            const propMatch = /^[A-Z]+\[[^\]]*\]/.exec(sgf.slice(pos));
            if (propMatch) {
              pos += propMatch[0].length;
            } else {
              break;
            }
          }
        }
      } else if (sgf[pos] === '(') {
        pos++;
        // 분기 트리 파싱
        const branchNode = parseNode(node);
        if (branchNode) {
          branchNode.parent = node;
          node.children.push(branchNode);
        }
      } else if (sgf[pos] === ')') {
        pos++;
        return node;
      } else {
        pos++;
      }
    }
    return node;
  }

  // 최상위 트리 파싱
  if (sgf[pos] === '(') {
    pos++;
    const root = parseNode(null);
    // 라벨링 분기
    function labelBranches(node) {
      node.children.forEach((child, i) => {
        child.label = String.fromCharCode(65 + i);
        labelBranches(child);
      });
    }
    labelBranches(root);
    return root;
  }
  return null;
}



// 현재 노드까지의 수 배열 (루트부터 현재 노드까지)
function getPathToRoot(node) {
  const moves = [];
  let cur = node;
  while (cur && cur.move) {
    moves.push(cur.move);
    cur = cur.parent;
  }
  return moves.reverse();
}

const SGFFileViewer = () => {
  const canvasRef = useRef(null);
  const [sgfRoot, setSgfRoot] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  // SGF 파일 불러오기 & 트리 파싱
  const handlePreloadedSGF = async (filename) => {
    try {
      const encodedName = encodeURIComponent(filename);
      const res = await fetch(`/sgf/${encodedName}`);
      if (!res.ok) throw new Error('SGF 파일 로드 실패');
      const text = await res.text();
      const root = parseSGFtoTree(text);
      if (root && root.children.length > 0) {
  setSgfRoot(root);
  setCurrentNode(root.children[0]);
} else {
  setSgfRoot(root);
  setCurrentNode(root);
}

      setPlaying(false);
    } catch (err) {
      alert(err.message);
      setSgfRoot(null);
      setCurrentNode(null);
      setPlaying(false);
    }
  };

  // 자동재생 (트리 따라가기)
  useEffect(() => {
    if (playing && currentNode) {
      timerRef.current = setInterval(() => {
        if (currentNode.children.length > 0) {
          setCurrentNode(currentNode.children[0]);
        } else {
          // 다음 형제 노드 찾기 (재귀)
          const next = findNextSibling(currentNode);
          if (next) {
            setCurrentNode(next);
          } else {
            setPlaying(false);
            clearInterval(timerRef.current);
          }
        }
      }, 800);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, currentNode]);

  // 다음 형제 노드 찾기 함수
  function findNextSibling(node) {
  if (!node.parent) return null;
  const siblings = node.parent.children;
  const idx = siblings.indexOf(node);
  if (idx === -1) return null;
  if (idx + 1 < siblings.length) return siblings[idx + 1];
  return findNextSibling(node.parent);
}


  // 바둑판 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentNode) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = '#f4deb3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자 그리기
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i < boardSize; i++) {
      const pos = padding + i * cellSize;
      ctx.beginPath();
      ctx.moveTo(padding, pos);
      ctx.lineTo(boardPixelSize - padding, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, padding);
      ctx.lineTo(pos, boardPixelSize - padding);
      ctx.stroke();
    }

    // 호선 표시
    const hoshi = [3, 9, 15];
    hoshi.forEach((x) => {
      hoshi.forEach((y) => {
        ctx.beginPath();
        ctx.arc(padding + x * cellSize, padding + y * cellSize, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
      });
    });

    // 현재 노드까지 착수 기록 그리기
    const history = getPathToRoot(currentNode);
    history.forEach((move, i) => {
      const px = padding + move.x * cellSize;
      const py = padding + move.y * cellSize;

      // 돌 그리기
      ctx.beginPath();
      ctx.arc(px, py, cellSize / 2.3, 0, 2 * Math.PI);
      ctx.fillStyle = move.color === 'black' ? '#000' : '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 번호 표시
      ctx.fillStyle = move.color === 'black' ? '#fff' : '#000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, px, py);
    });

    // 분기 표시 (현재 노드의 자식들 첫 수에 A,B,C...)
    if (currentNode.children.length > 1) {
      currentNode.children.forEach((child) => {
        if (child.move) {
          const px = padding + child.move.x * cellSize;
          const py = padding + child.move.y * cellSize;
          ctx.fillStyle = 'red';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(child.label, px, py - 15);
        }
      });
    }
  }, [currentNode]);

  // 이전 수 이동
  const prevNode = () => {
    if (currentNode && currentNode.parent) setCurrentNode(currentNode.parent);
  };

  // 다음 수 이동 (첫 번째 자식)
  const nextNode = () => {
    if (currentNode && currentNode.children.length > 0) {
      setCurrentNode(currentNode.children[0]);
    }
  };

  // 분기 선택
  const selectBranch = (idx) => {
    if (currentNode && currentNode.children[idx]) {
      setCurrentNode(currentNode.children[idx]);
    }
  };

  // 처음으로 이동
  const toStart = () => {
    if (sgfRoot && sgfRoot.children.length > 0) {
      setCurrentNode(sgfRoot.children[0]);
      setPlaying(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">📖 SGF 분기 지원 기보 뷰어</h2>

      <select
        onChange={(e) => {
          if (e.target.value) handlePreloadedSGF(e.target.value);
          else {
            setSgfRoot(null);
            setCurrentNode(null);
            setPlaying(false);
          }
        }}
        className="mb-4 px-3 py-2 border border-gray-400 rounded"
      >
        <option value="">📂 SGF 파일 선택</option>
        {sgfFiles.map((file, idx) => (
          <option key={idx} value={file}>{file}</option>
        ))}
      </select>

      <canvas
        ref={canvasRef}
        width={boardPixelSize}
        height={boardPixelSize}
        style={{
          border: '4px solid #333',
          backgroundColor: '#deb887',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          borderRadius: 8,
        }}
      />

      <div className="mt-4 text-sm text-gray-700">
        {currentNode && currentNode.move
          ? `${currentNode.move.color === 'black' ? '흑' : '백'} ${getPathToRoot(currentNode).length}수`
          : '기보를 선택해주세요'}
      </div>

      <div className="mt-4 flex gap-2 items-center flex-wrap">
        <button onClick={toStart} className="px-3 py-1 bg-gray-200 rounded">⏮ 처음</button>
        <button onClick={prevNode} className="px-3 py-1 bg-gray-200 rounded">◀ 이전</button>
        <button onClick={nextNode} className="px-3 py-1 bg-gray-200 rounded">다음 ▶</button>
        <button
          onClick={() => setPlaying((prev) => !prev)}
          className="px-3 py-1 bg-blue-300 rounded"
        >
          {playing ? '⏸ 일시정지' : '▶ 자동재생'}
        </button>
      </div>

      {/* 분기 선택 UI */}
      {currentNode && currentNode.children.length > 1 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {currentNode.children.map((child, idx) => (
            <button
              key={idx}
              onClick={() => selectBranch(idx)}
              className={`px-2 py-1 rounded border 
                ${child === currentNode ? 'bg-blue-400 text-white border-blue-500' : 'bg-gray-300 border-gray-400'}
              `}
              title={`분기 ${child.label}`}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SGFFileViewer;
