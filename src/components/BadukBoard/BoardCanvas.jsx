import React, { useEffect, useRef } from 'react';
import { getPathToRoot } from './utils/sgfUtils';
import './BoardCanvas.css'
const boardSize = 19;
const boardPixelSize = 620;
const padding = 20;
const cellSize = (boardPixelSize - 2 * padding) / (boardSize - 1);

export default function BoardCanvas({ node }) {
  const canvasRef = useRef();

  // 바둑판 상태를 재구성하고, 돌 따짐 적용
  function buildBoard(node) {
    // 초기 빈 바둑판 (null = 빈칸)
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    const moves = [];

    // 루트부터 현재 노드까지 재귀로 모든 착수 노드 수집
    function collectMoves(n) {
      if (!n) return;
      collectMoves(n.parent);
      if (n.move) moves.push(n.move);
    }
    collectMoves(node);

    // 각 수를 돌판에 두고, 상대 돌의 자유도 체크해서 잡힌 돌 제거 (따내기)
    moves.forEach(move => {
      const color = move.color;
      const opponent = color === 'black' ? 'white' : 'black';

      // 착수한 위치에 돌 두기
      board[move.y][move.x] = color;

      // 상대 돌 그룹 자유도 체크 후 잡힌 돌 제거
      const captured = findCapturedGroups(board, opponent);
      captured.forEach(({ stones }) => {
        stones.forEach(([y, x]) => {
          board[y][x] = null;
        });
      });

      // 자충수(자기 돌 죽임) 기본 검사 생략 (복잡도 있음)
    });

    return board;
  }

  // 인접 좌표 반환
  function getNeighbors(y, x) {
    const neighbors = [];
    if (y > 0) neighbors.push([y - 1, x]);
    if (y < boardSize - 1) neighbors.push([y + 1, x]);
    if (x > 0) neighbors.push([y, x - 1]);
    if (x < boardSize - 1) neighbors.push([y, x + 1]);
    return neighbors;
  }

  // 그룹 탐색 (깊이 우선 탐색, DFS)
  function findGroup(board, y, x, color, visited) {
    const stack = [[y, x]];
    const stones = [];
    visited.add(`${y},${x}`);

    while (stack.length) {
      const [cy, cx] = stack.pop();
      stones.push([cy, cx]);

      for (const [ny, nx] of getNeighbors(cy, cx)) {
        if (!visited.has(`${ny},${nx}`) && board[ny][nx] === color) {
          visited.add(`${ny},${nx}`);
          stack.push([ny, nx]);
        }
      }
    }
    return stones;
  }

  // 그룹의 자유도(호흡) 계산
  function calcLiberties(board, stones) {
    const libs = new Set();
    for (const [y, x] of stones) {
      for (const [ny, nx] of getNeighbors(y, x)) {
        if (board[ny][nx] === null) libs.add(`${ny},${nx}`);
      }
    }
    return libs.size;
  }

  // 자유도 0인 상대 돌 그룹 찾기 (포획된 그룹)
  function findCapturedGroups(board, color) {
    const visited = new Set();
    const captured = [];

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (board[y][x] === color && !visited.has(`${y},${x}`)) {
          const stones = findGroup(board, y, x, color, visited);
          const liberties = calcLiberties(board, stones);
          if (liberties === 0) {
            captured.push({ stones });
          }
        }
      }
    }

    return captured;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !node) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 바둑판 배경
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

    // 호선 그리기
    const hoshi = [3, 9, 15];
    hoshi.forEach(x => {
      hoshi.forEach(y => {
        ctx.beginPath();
        ctx.arc(padding + x * cellSize, padding + y * cellSize, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
      });
    });

    // 현재 노드부터 루트까지 수순 배열
    const history = getPathToRoot(node);

    // 돌 상태 계산(포획 처리 포함)
    const board = buildBoard(node);

    // 돌 그리기 (따진 돌 제외한 현재 돌판 상태 반영)
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = board[y][x];
        if (color) {
          const px = padding + x * cellSize;
          const py = padding + y * cellSize;
          ctx.beginPath();
          ctx.arc(px, py, cellSize / 2.3, 0, 2 * Math.PI);
          ctx.fillStyle = color === 'black' ? '#000' : '#fff';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // 수순 숫자 표시 (history 기반)
    history.forEach((move, i) => {
      const px = padding + move.x * cellSize;
      const py = padding + move.y * cellSize;
      ctx.fillStyle = move.color === 'black' ? '#fff' : '#000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, px, py);
    });
  }, [node]);

  return (
    <canvas
      ref={canvasRef}
      width={boardPixelSize}
      height={boardPixelSize}
      className="baduk-canvas"
    />
  );
}
