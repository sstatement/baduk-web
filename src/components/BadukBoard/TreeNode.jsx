import React, { useState } from 'react';
import { sgfCoordToHuman } from './utils/sgfUtils';

export default function TreeNode({ node, onSelect, selectedNode }) {
  const [open, setOpen] = useState(true);

  const move = node.move;
  const color = move ? (move.color === 'black' ? '흑' : '백') : '';
  const coord = move ? sgfCoordToHuman(move.x, move.y) : '';
  const comment = node.comment ? `💬 ${node.comment}` : '';

  const isSelected = selectedNode === node;

  return (
    <div className="ml-2">
      <div
        onClick={() => onSelect(node)}
        className={`text-sm cursor-pointer px-1 py-0.5 rounded
          ${isSelected ? 'bg-blue-300' : 'hover:bg-gray-200'}`}
      >
        <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="mr-1 cursor-pointer">
          {node.children.length > 0 && (open ? '▼' : '▶')}
        </span>
        {color} {coord} {comment}
      </div>
      {open && node.children.length > 0 && (
        <div className="ml-4 border-l pl-2">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} onSelect={onSelect} selectedNode={selectedNode} />
          ))}
        </div>
      )}
    </div>
  );
}
