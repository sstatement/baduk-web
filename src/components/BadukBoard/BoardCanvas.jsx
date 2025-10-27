import React, { useEffect, useMemo, useRef } from 'react';
import { getPathToRoot } from './utils/sgfUtils';
import './BoardCanvas.css';

// 옵션: 번호/하이라이트 ON/OFF를 prop으로 제어 가능
// <BoardCanvas node={...} showNumbers={true} highlightLast={true} />
export default function BoardCanvas({ node, showNumbers = true, highlightLast = true }) {
  const canvasRef = useRef(null);

  // === 보드 크기(SZ) 추출 (기본 19) ===
  const boardSize = useMemo(() => {
    // 루트까지 올라가서 SZ 찾기
    let r = node;
    while (r?.parent) r = r.parent;
    const szStr = r?.properties?.SZ?.[0];
    const sz = parseInt(szStr, 10);
    return Number.isFinite(sz) ? sz : 19;
  }, [node]);

  // 픽셀 스케일 (레티나 대응)
  const padding = 20;
  const boardPixelSize = 620;
  const cellSize = useMemo(
    () => (boardPixelSize - 2 * padding) / (boardSize - 1),
    [boardSize]
  );

  // === SGF → 보드 구성 (패스/초기배치 포함) ===
  function buildBoard(n) {
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    const moves = [];

    // 1) 루트부터 현재 노드까지 move 수집
    (function collectMoves(cur) {
      if (!cur) return;
      collectMoves(cur.parent);
      if (cur.move) moves.push(cur.move);
    })(n);

    // 2) 루트의 setup(AB/AW/AE) 적용: 초기 배치
    (function applySetup() {
      let root = n;
      while (root?.parent) root = root.parent;
      const setup = root?.setup || {};
      const put = (arr, color) => {
        (arr || []).forEach(coord => {
          if (!coord || coord.length !== 2) return;
          const x = coord.charCodeAt(0) - 97;
          const y = coord.charCodeAt(1) - 97;
          if (x>=0 && y>=0 && x<boardSize && y<boardSize) board[y][x] = color;
        });
      };
      put(setup.AB, 'black');
      put(setup.AW, 'white');
      (setup.AE || []).forEach(coord => {
        if (!coord || coord.length !== 2) return;
        const x = coord.charCodeAt(0) - 97;
        const y = coord.charCodeAt(1) - 97;
        if (x>=0 && y>=0 && x<boardSize && y<boardSize) board[y][x] = null;
      });
    })();

    // 3) 각 수 재현 (패스 처리 포함)
    for (const mv of moves) {
      if (mv.pass) continue; // 패스면 보드 변화 없음
      const { x, y, color } = mv;
      if (x == null || y == null) continue;
      if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) continue;

      const opponent = color === 'black' ? 'white' : 'black';
      // 착점
      board[y][x] = color;

      // 인접 상대 그룹만 포획 체크(성능)
      for (const [ny, nx] of getNeighbors(y, x, boardSize)) {
        if (board[ny][nx] !== opponent) continue;
        const visited = new Set();
        const stones = findGroup(board, ny, nx, opponent, visited, boardSize);
        if (calcLiberties(board, stones, boardSize) === 0) {
          for (const [gy, gx] of stones) board[gy][gx] = null;
        }
      }

      // 자충수 방지(대부분의 SGF는 합법이지만 안전망)
      const visited = new Set();
      const myGroup = findGroup(board, y, x, color, visited, boardSize);
      if (calcLiberties(board, myGroup, boardSize) === 0) {
        // 자충이면 방금 둔 돌/그룹 제거 (SGF상 거의 없음)
        for (const [gy, gx] of myGroup) board[gy][gx] = null;
      }
    }

    return board;
  }

  function getNeighbors(y, x, size) {
    const ns = [];
    if (y > 0) ns.push([y - 1, x]);
    if (y < size - 1) ns.push([y + 1, x]);
    if (x > 0) ns.push([y, x - 1]);
    if (x < size - 1) ns.push([y, x + 1]);
    return ns;
  }

  function findGroup(board, y, x, color, visited, size) {
    const stack = [[y, x]];
    const stones = [];
    const key = (yy, xx) => `${yy},${xx}`;
    visited.add(key(y, x));
    while (stack.length) {
      const [cy, cx] = stack.pop();
      stones.push([cy, cx]);
      for (const [ny, nx] of getNeighbors(cy, cx, size)) {
        const k = key(ny, nx);
        if (!visited.has(k) && board[ny][nx] === color) {
          visited.add(k);
          stack.push([ny, nx]);
        }
      }
    }
    return stones;
  }

  function calcLiberties(board, stones, size) {
    const libs = new Set();
    const key = (yy, xx) => `${yy},${xx}`;
    for (const [y, x] of stones) {
      for (const [ny, nx] of getNeighbors(y, x, size)) {
        if (board[ny][nx] === null) libs.add(key(ny, nx));
      }
    }
    return libs.size;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !node) return;
    const ctx = canvas.getContext('2d');

    // HiDPI 스케일
    const dpr = window.devicePixelRatio || 1;
    canvas.width = boardPixelSize * dpr;
    canvas.height = boardPixelSize * dpr;
    canvas.style.width = `${boardPixelSize}px`;
    canvas.style.height = `${boardPixelSize}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, boardPixelSize, boardPixelSize);

    // 배경
    ctx.fillStyle = '#f4deb3';
    ctx.fillRect(0, 0, boardPixelSize, boardPixelSize);

    // 격자
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

    // 호선
    const star = boardSize === 19 ? [3, 9, 15] : boardSize === 13 ? [3, 6, 9] : [2, 4, 6];
    ctx.fillStyle = '#000';
    star.forEach(x => {
      star.forEach(y => {
        ctx.beginPath();
        ctx.arc(padding + x * cellSize, padding + y * cellSize, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 수순 및 보드 상태
    const history = getPathToRoot(node); // move[] (pass 제외일 가능성 유의)
    const board = buildBoard(node);

    // 돌 그리기
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = board[y][x];
        if (!color) continue;
        const px = padding + x * cellSize;
        const py = padding + y * cellSize;

        // 그림자
        ctx.beginPath();
        ctx.arc(px + 1, py + 1, cellSize / 2.3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        // 본체
        ctx.beginPath();
        ctx.arc(px, py, cellSize / 2.3, 0, 2 * Math.PI);
        ctx.fillStyle = color === 'black' ? '#000' : '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 테두리
        ctx.strokeStyle = color === 'black' ? '#000' : '#999';
        ctx.stroke();
      }
    }

    // 마지막 수 하이라이트(링)
    if (highlightLast) {
      const last = [...history].reverse().find(m => !m.pass);
      if (last && last.x != null && last.y != null) {
        const px = padding + last.x * cellSize;
        const py = padding + last.y * cellSize;
        ctx.beginPath();
        ctx.arc(px, py, cellSize / 2.3 + 3, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff6b00';
        ctx.stroke();
      }
    }

    // 수순 숫자 (옵션)
    if (showNumbers) {
      history.forEach((move, i) => {
        if (move.pass) return;
        const px = padding + move.x * cellSize;
        const py = padding + move.y * cellSize;
        ctx.fillStyle = move.color === 'black' ? '#fff' : '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, px, py);
      });
    }
  }, [node, boardSize, cellSize, padding, highlightLast, showNumbers]);

  return (
    <canvas
      ref={canvasRef}
      className="baduk-canvas"
    />
  );
}
