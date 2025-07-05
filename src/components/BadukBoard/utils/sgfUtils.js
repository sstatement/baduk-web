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
