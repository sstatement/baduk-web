import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './SGFFileViewer.css';
import SGFTreeView from './SGFTreeView';
import BoardCanvas from './BoardCanvas';
import { parseSGF } from './utils/sgfParser';

const sgfFiles = [
  '화점 삼삼침입.sgf',
  '날일자 걸침-날일자 받기-2선 날일자.sgf',
  '날일자 걸침-날일자 받기-붙임에 대한 정석.sgf',
  '날일자 걸침-한칸 받기.sgf',
  '날일자 걸침-마늘모붙임.sgf',
  '날일자 걸침-위로 붙이기.sgf',
  '날일자 걸침-한칸 낮은 협공.sgf',
  '날일자 걸침-두칸 낮은 협공.sgf',
  '날일자 걸침-세칸 높은 협공.sgf',
  '날일자 굳힘.sgf',
  '날일자 걸침-손 뺐을때.sgf',
  '소목 날일자 굳힘.sgf',
  '소목 눈목자 굳힘.sgf',
  '소목 두칸 굳힘.sgf',
  '소목 한칸 굳힘.sgf',
  '소목 날일자 걸침-입구자.sgf',
  '소목 날일자 걸침-날일자.sgf',
  '소목 날일자 걸침-한칸 낮은 협공.sgf',
  '소목 날일자 걸침-한칸 높은 협공.sgf',
  '소목 날일자 걸침-두칸 낮은 협공.sgf',
  '소목 날일자 걸침-두칸 높은 협공.sgf',
  '소목 한칸 걸침-붙여 늘기.sgf',
  '소목 한칸 걸침-한칸 낮은 협공.sgf',
  '소목 한칸 걸침-두칸 낮은 협공.sgf',
  '소목 한칸 걸침-두칸 높은 협공.sgf',
];

// 안전한 fetch + 파싱 + 캐싱
const sgfCache = new Map(); // filename -> parsed root

async function loadSgf(filename) {
  if (sgfCache.has(filename)) return sgfCache.get(filename);
  const res = await fetch(`/sgf/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`SGF 로드 실패: ${filename} (${res.status})`);
  const text = await res.text();
  const root = parseSGF(text);
  // parseSGF는 각 노드에 { parent, children:[], move?:{x,y,color}, props? } 형태라고 가정
  sgfCache.set(filename, root);
  return root;
}

// 다음/이전 이동 도우미(메인라인 기준: 첫 번째 자식 사용)
function getNextNode(node) {
  if (!node) return null;
  return node.children?.[0] || null;
}
function getPrevNode(node) {
  if (!node) return null;
  return node.parent || null;
}
function getLineNumber(node) {
  // 루트 제외하고 move가 있는 노드만 카운트
  let n = 0; let cur = node;
  while (cur && cur.parent) { // 루트는 제외
    if (cur.move) n += 1;
    cur = cur.parent;
  }
  return n;
}

export default function SGFFileViewer() {
  const [sgfRoot, setSgfRoot] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [error, setError] = useState('');

  // 재생 컨트롤 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(900); // 자동 재생 간격(ms)

  const lineNumber = useMemo(() => getLineNumber(currentNode), [currentNode]);

  // SGF 파일 로드
  const handlePreloadedSGF = useCallback(async (filename) => {
    setError('');
    setIsPlaying(false);
    try {
      const root = await loadSgf(filename);
      // 첫 수로 이동(보통 root.children[0]이 첫 수)
      setSgfRoot(root);
      setCurrentNode(root?.children?.[0] || root);
    } catch (e) {
      console.error(e);
      setError(e.message || 'SGF 로드 중 오류가 발생했습니다.');
      setSgfRoot(null);
      setCurrentNode(null);
    }
  }, []);

  // 이동 핸들러
  const goStart = useCallback(() => {
    if (!sgfRoot) return;
    setCurrentNode(sgfRoot?.children?.[0] || sgfRoot);
  }, [sgfRoot]);

  const goEnd = useCallback(() => {
    if (!sgfRoot) return;
    // 메인라인 끝으로
    let n = sgfRoot;
    while (n?.children && n.children[0]) n = n.children[0];
    setCurrentNode(n);
  }, [sgfRoot]);

  const goNext = useCallback(() => {
    if (!currentNode) return;
    const nxt = getNextNode(currentNode);
    if (nxt) setCurrentNode(nxt);
  }, [currentNode]);

  const goPrev = useCallback(() => {
    if (!currentNode) return;
    const prv = getPrevNode(currentNode);
    if (prv) setCurrentNode(prv);
  }, [currentNode]);

  // 자동 재생
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const nxt = getNextNode(currentNode);
      if (nxt) {
        setCurrentNode(nxt);
      } else {
        setIsPlaying(false); // 끝나면 정지
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [isPlaying, currentNode, speedMs]);

  // 키보드 단축키
  useEffect(() => {
    const onKey = (e) => {
      if (!sgfRoot) return;
      if (e.code === 'ArrowRight') {
        e.preventDefault(); goNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault(); goPrev();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault(); goStart();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault(); goEnd();
      } else if (e.code === 'Space') {
        e.preventDefault(); setIsPlaying((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sgfRoot, goNext, goPrev, goStart, goEnd]);

  // 파일 선택 시 로드
  useEffect(() => {
    if (selectedFile) handlePreloadedSGF(selectedFile);
  }, [selectedFile, handlePreloadedSGF]);

  return (
    <div className="container">
      {/* 왼쪽: 바둑판 + 컨트롤 */}
      <div className="left-pane">
        {currentNode ? (
          <>
            <BoardCanvas node={currentNode} />
            <div className="sgf-info">
              <div>
                {currentNode.move
                  ? `수순 ${lineNumber} — ${currentNode.move.color === 'black' ? '흑' : '백'} 착수`
                  : '루트'}
              </div>
              <div className="controls">
                <button onClick={goStart} title="처음(↑)">⏮ 처음</button>
                <button onClick={goPrev} title="이전(←)">◀ 이전</button>
                <button onClick={() => setIsPlaying(v => !v)} title="재생/일시정지(Space)">
                  {isPlaying ? '⏸ 일시정지' : '▶ 재생'}
                </button>
                <button onClick={goNext} title="다음(→)">다음 ▶</button>
                <button onClick={goEnd} title="끝(↓)">마지막 ⏭</button>
                <label className="speed">
                  속도: 
                  <input
                    type="range"
                    min={200}
                    max={1500}
                    step={100}
                    value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))}
                  />
                  {(speedMs / 1000).toFixed(1)}s
                </label>
              </div>
            </div>
          </>
        ) : (
          <div className="placeholder">SGF 파일을 선택해주세요</div>
        )}
        {error && <div className="error">⚠ {error}</div>}
      </div>

      {/* 오른쪽: 파일 선택 + 트리뷰 */}
      <div className="right-pane">
        <h2 style={{ marginBottom: 8 }}>📖 SGF 트리뷰</h2>

        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          style={{ marginBottom: 12, padding: '4px 8px', fontSize: 14 }}
        >
          <option value="">📂 SGF 선택</option>
          {sgfFiles.map((f, i) => (
            <option key={i} value={f}>{f}</option>
          ))}
        </select>

        <div className="tree-container">
          {sgfRoot ? (
            <SGFTreeView
              root={sgfRoot}
              selectedNode={currentNode}
              onSelect={(n) => { setIsPlaying(false); setCurrentNode(n); }}
            />
          ) : (
            <div className="placeholder">SGF 파일을 선택해주세요</div>
          )}
        </div>
      </div>
    </div>
  );
}
