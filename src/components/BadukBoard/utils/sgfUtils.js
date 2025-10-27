// src/utils/sgfUtils.js
export function getPathToRoot(node) {
  const path = [];
  let current = node;
  while (current) {
    if (current.move) path.unshift(current.move);
    current = current.parent;
  }
  return path;
}

// 노드 경로(루트→현재)
export function getNodePathToRoot(node) {
  const nodes = [];
  let cur = node;
  while (cur) { nodes.unshift(cur); cur = cur.parent; }
  return nodes;
}

// 좌표 → 사람표기(예: D4), 판 크기 반영 (I 제외)
export function sgfCoordToHuman(x, y, size = 19) {
  if (x == null || y == null) return 'PASS';
  const letters = 'ABCDEFGHJKLMNOPQRST'.slice(0, size);
  const col = letters[x] || '?';
  const row = size - y;
  return `${col}${row}`;
}
