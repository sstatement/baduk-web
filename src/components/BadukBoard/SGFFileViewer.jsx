import React, { useState } from 'react';
import './SGFFileViewer.css';
import SGFTreeView from './SGFTreeView';
import BoardCanvas from './BoardCanvas';
import { parseSGF } from './utils/sgfParser';

const sgfFiles = ['화점 삼삼침입.sgf', '날일자 걸침-날일자 받기-붙임에 대한 정석.sgf','날일자 걸침-한칸 받기.sgf',
  '날일자 걸침-마늘모붙임.sgf', '날일자 걸침-위로 붙이기.sgf','날일자 걸침-한칸 낮은 협공.sgf','날일자 걸침-두칸 낮은 협공.sgf',
'날일자 걸침-세칸 높은 협공.sgf',  '날일자 굳힘.sgf','날일자 걸침-손 뺐을때.sgf','소목 날일자 굳힘.sgf',
'소목 눈목자 굳힘.sgf','소목 두칸 굳힘.sgf','소목 한칸 굳힘.sgf','소목 날일자 걸침-입구자.sgf','소목 날일자 걸침-날일자.sgf',
'소목 날일자 걸침-한칸 낮은 협공.sgf','소목 날일자 걸침-한칸 높은 협공.sgf','소목 날일자 걸침-두칸 낮은 협공.sgf','소목 날일자 걸침-두칸 높은 협공.sgf',
'소목 한칸 걸침-붙여 늘기.sgf','소목 한칸 걸침-한칸 낮은 협공.sgf','소목 한칸 걸침-두칸 낮은 협공.sgf',

];

export default function SGFFileViewer() {
  const [sgfRoot, setSgfRoot] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');

  const handlePreloadedSGF = async (filename) => {
    const res = await fetch(`/sgf/${encodeURIComponent(filename)}`);
    const text = await res.text();
    const root = parseSGF(text);
    setSgfRoot(root);
    setCurrentNode(root?.children?.[0] || root);
  };

  return (
    <div className="container">
      {/* 왼쪽 바둑판 */}
      <div className="left-pane">
        {currentNode ? (
          <>
            <BoardCanvas node={currentNode} />
            <div style={{ marginTop: 8, fontSize: 14 }}>
              {currentNode.move
                ? `${currentNode.move.color === 'black' ? '흑' : '백'} 착수`
                : '루트'}
            </div>
          </>
        ) : (
          <div style={{ color: '#888' }}>SGF 파일을 선택해주세요</div>
        )}
      </div>

      {/* 오른쪽 트리뷰 */}
      <div className="right-pane">
        <h2 style={{ marginBottom: 8 }}>📖 SGF 트리뷰</h2>
        <select
          value={selectedFile}
          onChange={(e) => {
            setSelectedFile(e.target.value);
            if (e.target.value) handlePreloadedSGF(e.target.value);
          }}
          style={{ marginBottom: 16, padding: '4px 8px', fontSize: 14 }}
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
              onSelect={setCurrentNode}
            />
          ) : (
            <div style={{ color: '#888' }}>SGF 파일을 선택해주세요</div>
          )}
        </div>
      </div>
    </div>
  );
}
