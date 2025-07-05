import React, { useState, useCallback, memo, useRef } from 'react';
import './SGFTreeView.css';

export default function SGFTreeView({ root, selectedNode, onSelect }) {
  const [openNodes, setOpenNodes] = useState(new Set());
  const containerRef = useRef(null);

  const onNodeClick = useCallback(
    (node, btnRef) => {
      setOpenNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(node)) newSet.delete(node);
        else newSet.add(node);
        return newSet;
      });
      onSelect(node);

      if (containerRef.current && btnRef && btnRef.current) {
        const container = containerRef.current;
        const btn = btnRef.current;

        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        const offsetTop = btnRect.top - containerRect.top;
        const offsetLeft = btnRect.left - containerRect.left;

        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;

        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;

        const targetScrollTop = scrollTop + offsetTop - containerHeight / 2 + btnRect.height / 2;
        const targetScrollLeft = scrollLeft + offsetLeft - containerWidth / 2 + btnRect.width / 2;

        container.scrollTo({
          top: targetScrollTop,
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      }
    },
    [onSelect]
  );

  return (
    <div className="sgf-treeview" ref={containerRef}>
      <TreeNode
        node={root}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
        openNodes={openNodes}
        depth={0}
      />
    </div>
  );
}

const TreeNode = memo(function TreeNode({ node, selectedNode, onNodeClick, openNodes, depth }) {
  const isSelected = node === selectedNode;
  const isOpen = openNodes.has(node);

  const coordLabel = node.move
    ? `${node.move.color === 'black' ? '●' : '○'} [${node.move.x},${node.move.y}]`
    : 'ROOT';

  const singleChild = node.children.length === 1;
  const btnRef = useRef(null);

  return (
    <div className="tree-node" style={{ paddingLeft: depth * 20 }}>
      <button
        ref={btnRef}
        className={`coord-btn ${isSelected ? 'selected' : ''}`}
        onClick={() => onNodeClick(node, btnRef)}
        title={coordLabel}
      >
        <span className="stone">{coordLabel[0]}</span>
        <span className="coords">{coordLabel.slice(2)}</span>
      </button>

      {isOpen && node.children.length > 0 && (
        <div className={singleChild ? 'children-row' : 'children-column'}>
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id || idx}
              node={child}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
              openNodes={openNodes}
              depth={singleChild ? depth : depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});
