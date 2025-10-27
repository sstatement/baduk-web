import React, { useState, useEffect, useMemo, useRef } from 'react';
import { sgfCoordToHuman } from './utils/sgfUtils';

export default function TreeNode({ node, onSelect, selectedNode }) {
  const children = node.children || [];
  const move = node.move;
  const color = move ? (move.color === 'black' ? '흑' : '백') : '';
  const coord = move ? sgfCoordToHuman(move.x, move.y) : 'ROOT';
  const comment = node.comment ? `💬 ${node.comment}` : '';

  const isSelected = selectedNode === node;

  // 선택된 노드가 이 노드의 서브트리에 포함되는지(조상 자동 펼침용)
  const containsSelected = useMemo(() => {
    let cur = selectedNode;
    while (cur) {
      if (cur === node) return true;
      cur = cur.parent || null;
    }
    return false;
  }, [selectedNode, node]);

  // 기본은 닫힘. 선택 경로가 들어오면 자동으로 펼침
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (containsSelected) setOpen(true);
  }, [containsSelected]);

  // 선택되면 중앙으로 스크롤
  const rowRef = useRef(null);
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <div className="ml-2">
      <div
        ref={rowRef}
        role="button"
        onClick={() => onSelect(node)}
        className={`text-sm cursor-pointer px-1 py-0.5 rounded flex items-center gap-1
          ${isSelected ? 'bg-blue-300' : 'hover:bg-gray-200'}`}
        title={comment ? `${color} ${coord} ${comment}` : `${color} ${coord}`}
      >
        {/* caret */}
        <span
          onClick={(e) => { e.stopPropagation(); if (children.length) setOpen(!open); }}
          className={`mr-1 inline-flex w-4 justify-center ${children.length ? 'text-gray-700' : 'text-gray-400'}`}
          aria-label={open ? '접기' : '펼치기'}
          title={open ? '접기' : '펼치기'}
        >
          {children.length > 0 ? (open ? '▼' : '▶') : '•'}
        </span>

        {/* label */}
        <span className="truncate">
          {move ? (
            <>
              <span className="mr-1">{color}</span>
              <span className="font-medium">{coord}</span>
              {comment && <span className="ml-2 text-gray-500">{comment}</span>}
            </>
          ) : (
            <span className="font-semibold">{coord}</span>
          )}
        </span>
      </div>

      {open && children.length > 0 && (
        <div className="ml-4 border-l pl-2">
          {children.map((child, idx) => (
            <TreeNode
              key={child.id || idx}            // ✅ 안정적인 키 우선
              node={child}
              onSelect={onSelect}
              selectedNode={selectedNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
