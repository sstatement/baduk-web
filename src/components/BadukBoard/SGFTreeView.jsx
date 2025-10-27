import React, { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import './SGFTreeView.css';

const BOARD_SIZE = 19;
function toKifuCoord(x, y, size = BOARD_SIZE) {
  const letters = 'ABCDEFGHJKLMNOPQRST';
  const col = letters[x] || '?';
  const row = size - y;
  return `${col}${row}`;
}
function getMoveNumber(node) {
  let n = 0; let cur = node;
  while (cur && cur.parent) { if (cur.move) n += 1; cur = cur.parent; }
  return n;
}
function getAncestors(node) {
  const list = [];
  let cur = node;
  while (cur) { list.push(cur); cur = cur.parent || null; }
  return list.reverse(); // root→...→node
}

export default function SGFTreeView({ root, selectedNode, onSelect }) {
  // ✅ viewRoot: 현재 트리뷰의 중심(루트). 기본은 전체 트리의 root.
  const [viewRoot, setViewRoot] = useState(root);
  const [openNodes, setOpenNodes] = useState(new Set([root]));
  const containerRef = useRef(null);

  // 선택/포커스 동작 설정
  // - 단일 클릭: 선택 + 그 노드로 중심 이동(리루트)
  // - 케럿 버튼: 펼치기/접기만
  const focusOnClick = true;

  // root 바뀌면 초기화
  useEffect(() => {
    setViewRoot(root);
    setOpenNodes(new Set([root]));
  }, [root]);

  // 선택된 노드가 현재 viewRoot 트리 밖에 있으면, 조상 경로를 열고 viewRoot를 적절히 업데이트
  useEffect(() => {
    if (!selectedNode) return;
    // 선택된 노드가 보이는 서브트리에 없다면, 그 노드의 조상 중에서 viewRoot를 설정
    const chain = getAncestors(selectedNode);
    if (!chain.includes(viewRoot)) {
      // 기본 정책: 선택과 동시에 그 노드로 포커스 이동
      if (focusOnClick) setViewRoot(selectedNode);
      else setViewRoot(chain[0] || root);
    }
    // 조상 경로 자동 펼치기
    setOpenNodes(prev => {
      const next = new Set(prev);
      chain.forEach(a => next.add(a));
      return next;
    });
    // 선택된 버튼 중앙 스크롤
    const timer = setTimeout(() => {
      const container = containerRef.current;
      const btn = container?.querySelector(`[data-node-id="${selectedNode.id || ''}"]`);
      if (!container || !btn) return;
      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      const top = container.scrollTop + (bRect.top - cRect.top) - cRect.height / 2 + bRect.height / 2;
      const left = container.scrollLeft + (bRect.left - cRect.left) - cRect.width / 2 + bRect.width / 2;
      container.scrollTo({ top, left, behavior: 'smooth' });
    }, 40);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode, viewRoot]);

  const handleNodeClick = useCallback((node) => {
    onSelect?.(node);
    if (focusOnClick) {
      // ⭕ 클릭한 노드로 포커스(리루트)
      setViewRoot(node);
      // 새 루트는 기본적으로 펼침
      setOpenNodes(prev => new Set([...prev, node]));
    }
  }, [onSelect]);

  const toggleNode = useCallback((node) => {
    setOpenNodes(prev => {
      const next = new Set(prev);
      if (next.has(node)) next.delete(node);
      else next.add(node);
      return next;
    });
  }, []);

  // 툴바 동작
  const backToParent = useCallback(() => {
    if (!viewRoot?.parent) return;
    setViewRoot(viewRoot.parent);
  }, [viewRoot]);

  const backToGlobalRoot = useCallback(() => {
    setViewRoot(root);
    setOpenNodes(new Set([root]));
  }, [root]);

  // 브레드크럼: 글로벌 루트→…→현재 viewRoot
  const breadcrumb = useMemo(() => getAncestors(viewRoot || root), [viewRoot, root]);

  return (
    <div className="sgf-treeview" ref={containerRef}>
      <div className="tree-toolbar">
        {/* 브레드크럼 */}
        <div className="crumbs">
          {breadcrumb.map((n, i) => {
            const label = n.move ? toKifuCoord(n.move.x, n.move.y) : 'ROOT';
            return (
              <button
                key={n.id || i}
                className={`crumb ${n === viewRoot ? 'active' : ''}`}
                onClick={() => setViewRoot(n)}
                title={n.move ? `${n.move.color === 'black' ? '흑' : '백'} ${label}` : 'ROOT'}
              >
                {label}
                {i < breadcrumb.length - 1 && <span className="sep">›</span>}
              </button>
            );
          })}
        </div>

        <div className="toolbar-actions">
          <button className="toolbar-btn" onClick={backToParent} disabled={!viewRoot?.parent}>⬅ 위로</button>
          <button className="toolbar-btn" onClick={backToGlobalRoot}>🏠 전체</button>
        </div>
      </div>

      <TreeNode
        node={viewRoot}
        selectedNode={selectedNode}
        onNodeClick={handleNodeClick}
        onToggle={toggleNode}
        openNodes={openNodes}
        depth={0}
      />
    </div>
  );
}

const TreeNode = memo(function TreeNode({ node, selectedNode, onNodeClick, onToggle, openNodes, depth }) {
  const isSelected = node === selectedNode;
  const isOpen = openNodes.has(node);
  const hasChildren = node.children && node.children.length > 0;
  const singleChild = hasChildren && node.children.length === 1;

  let label = 'ROOT';
  let moveNum = 0;
  if (node.move) {
    moveNum = getMoveNumber(node);
    label = toKifuCoord(node.move.x, node.move.y, BOARD_SIZE);
  }

  return (
    <div className="tree-node" style={{ paddingLeft: depth * 16 }}>
      <div className={`node-row ${isSelected ? 'is-selected' : ''}`} data-node-id={node.id || ''}>
        {hasChildren ? (
          <button
            className={`caret ${isOpen ? 'open' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(node); }}
            aria-label={isOpen ? 'collapse' : 'expand'}
            title={isOpen ? '접기' : '펼치기'}
          >
            {isOpen ? '▼' : '▶'}
          </button>
        ) : (
          <span className="caret placeholder" />
        )}

        <button
          className="node-btn"
          onClick={() => onNodeClick(node)}
          title={node.move ? `${node.move.color === 'black' ? '흑' : '백'} ${label} (수순 ${moveNum})` : '루트'}
        >
          <span className={`dot ${node.move ? (node.move.color === 'black' ? 'black' : 'white') : 'root'}`} />
          <span className="num">{node.move ? moveNum : '—'}</span>
          <span className="label">{node.move ? label : 'ROOT'}</span>
        </button>
      </div>

      {isOpen && hasChildren && (
        <div className={singleChild ? 'children-row' : 'children-column'}>
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id || idx}
              node={child}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
              onToggle={onToggle}
              openNodes={openNodes}
              depth={singleChild ? depth : depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});
