import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// 화점 위치 사전
const starPointsMap = {
  19: [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
  ],
  13: [
    [3, 3], [3, 6], [3, 9],
    [6, 3], [6, 6], [6, 9],
    [9, 3], [9, 6], [9, 9],
  ],
  9: [
    [2, 2], [2, 4], [2, 6],
    [4, 2], [4, 4], [4, 6],
    [6, 2], [6, 4], [6, 6],
  ],
  7: [
    [1, 1], [1, 3], [1, 5],
    [3, 1], [3, 3], [3, 5],
    [5, 1], [5, 3], [5, 5],
  ],
  5: [
    [1, 1], [1, 2], [1, 3],
    [2, 1], [2, 2], [2, 3],
    [3, 1], [3, 2], [3, 3],
  ],
  4: [
    [1, 1], [1, 2],
    [2, 1], [2, 2],
  ],
};

function BadukBoard({
  stones,
  answerSequence = [],
  mode,
  isAnswerMode,
  onPlaceStone,
  boardSize,
  highlightAnswerMoveIndex = -1,
  onSolveClick,
  solveMode = false,
}) {
  const BOARD_SIZE = boardSize;
  const CELL_SIZE = 30;

  const starPoints = starPointsMap[BOARD_SIZE] || [];

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      lines.push(
        <line key={`h${i}`}
          x1={CELL_SIZE / 2}
          y1={CELL_SIZE / 2 + i * CELL_SIZE}
          x2={CELL_SIZE / 2 + (BOARD_SIZE - 1) * CELL_SIZE}
          y2={CELL_SIZE / 2 + i * CELL_SIZE}
          stroke="black"
        />
      );
      lines.push(
        <line key={`v${i}`}
          x1={CELL_SIZE / 2 + i * CELL_SIZE}
          y1={CELL_SIZE / 2}
          x2={CELL_SIZE / 2 + i * CELL_SIZE}
          y2={CELL_SIZE / 2 + (BOARD_SIZE - 1) * CELL_SIZE}
          stroke="black"
        />
      );
    }
    return lines;
  };

  const renderStarPoints = () =>
    starPoints.map(([x, y], i) => (
      <circle
        key={`star-${i}`}
        cx={CELL_SIZE / 2 + x * CELL_SIZE}
        cy={CELL_SIZE / 2 + y * CELL_SIZE}
        r={4}
        fill="black"
      />
    ));

  const renderStones = () =>
    stones.map(({ x, y, color }, idx) => (
      <circle
        key={`stone-${idx}`}
        cx={CELL_SIZE / 2 + x * CELL_SIZE}
        cy={CELL_SIZE / 2 + y * CELL_SIZE}
        r={CELL_SIZE / 2 - 3}
        fill={color}
        stroke="black"
        opacity={solveMode && idx === highlightAnswerMoveIndex ? 1 : 0.7}
      />
    ));

  const renderAnswerSequence = () =>
    answerSequence.map(({ x, y, color }, idx) => {
      const showNumber = !solveMode || idx <= highlightAnswerMoveIndex;
      return (
        <g key={`answer-${idx}`}>
          <circle
            cx={CELL_SIZE / 2 + x * CELL_SIZE}
            cy={CELL_SIZE / 2 + y * CELL_SIZE}
            r={CELL_SIZE / 2 - 6}
            fill={color}
            opacity={showNumber ? 0.7 : 0}
            stroke="black"
          />
          {showNumber && (
            <text
              x={CELL_SIZE / 2 + x * CELL_SIZE}
              y={CELL_SIZE / 2 + y * CELL_SIZE + 5}
              textAnchor="middle"
              fontSize={14}
              fill={color === 'black' ? 'white' : 'black'}
              fontWeight="bold"
              pointerEvents="none"
            >
              {idx + 1}
            </text>
          )}
        </g>
      );
    });

  const handleClick = (e) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.round((cursorpt.x - CELL_SIZE / 2) / CELL_SIZE);
    const y = Math.round((cursorpt.y - CELL_SIZE / 2) / CELL_SIZE);
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (solveMode) {
        if(onSolveClick) onSolveClick(x, y);
      } else {
        if(onPlaceStone) onPlaceStone(x, y);
      }
    }
  };

  return (
    <svg
      width={CELL_SIZE * BOARD_SIZE}
      height={CELL_SIZE * BOARD_SIZE}
      style={{ backgroundColor: '#deb887', cursor: 'pointer', border: '2px solid black' }}
      onClick={handleClick}
    >
      {renderGrid()}
      {renderStarPoints()}
      {renderStones()}
      {renderAnswerSequence()}
    </svg>
  );
}

export default function AddProblem(props) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('초급');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('black');
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [boardSize, setBoardSize] = useState(19);

  const [stones, setStones] = useState([]);
  const [answerSequence, setAnswerSequence] = useState([]);

  const onPlaceStone = (x, y) => {
    if (isAnswerMode) {
      if (answerSequence.find(p => p.x === x && p.y === y)) return; // 중복 방지
      const nextColor = answerSequence.length % 2 === 0 ? 'black' : 'white';
      setAnswerSequence([...answerSequence, { x, y, color: nextColor }]);
    } else {
      const idx = stones.findIndex(s => s.x === x && s.y === y);
      if (mode === 'erase') {
        if (idx !== -1) setStones(stones.filter((_, i) => i !== idx));
      } else {
        if (idx !== -1) {
          const newStones = stones.slice();
          newStones[idx] = { x, y, color: mode };
          setStones(newStones);
        } else {
          setStones([...stones, { x, y, color: mode }]);
        }
      }
    }
  };

  const resetAnswerSequence = () => setAnswerSequence([]);
  const resetProblemSetup = () => setStones([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    if (stones.length === 0) {
      alert('문제도를 한 수 이상 배치하세요.');
      return;
    }
    if (answerSequence.length === 0) {
      alert('정답 수순을 입력하세요.');
      return;
    }

    const problemData = {
      title,
      difficulty,
      description,
      stones,
      answerSequence,
      boardSize,
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, 'problems'), problemData);
      alert(`문제가 저장되었습니다! 문제 ID: ${docRef.id}`);

      // 초기화
      setTitle('');
      setDifficulty('초급');
      setDescription('');
      setStones([]);
      setAnswerSequence([]);
      setBoardSize(19);

      if (props.onAddProblem) {
        props.onAddProblem(problemData, docRef.id);
      }
    } catch (error) {
      console.error('문제 저장 오류:', error);
      alert('문제 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>사활 문제 생성 (판 크기 선택 가능)</h1>

      <div style={{ marginBottom: 10 }}>
        <label>
          바둑판 크기:{' '}
          <select
            value={boardSize}
            onChange={e => {
              const newSize = parseInt(e.target.value);
              setBoardSize(newSize);
              setStones([]);
              setAnswerSequence([]);
            }}
          >
            {[19, 13, 9, 7, 5, 4].map(size => (
              <option key={size} value={size}>{size}x{size}</option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            제목:{' '}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: 300 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            난이도:{' '}
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            설명:<br />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ width: 300 }}
            />
          </label>
        </div>

        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <strong>모드 선택:</strong>{' '}
          <button type="button" disabled={isAnswerMode} onClick={() => setMode('black')}>
            검은 돌
          </button>
          <button type="button" disabled={isAnswerMode} onClick={() => setMode('white')} style={{ marginLeft: 8 }}>
            흰 돌
          </button>
          <button type="button" disabled={isAnswerMode} onClick={() => setMode('erase')} style={{ marginLeft: 8 }}>
            지우기
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <button type="button" onClick={() => setIsAnswerMode(!isAnswerMode)}>
            {isAnswerMode ? '⬅️ 문제도 편집 모드' : '➡️ 정답 수순 편집 모드'}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          {!isAnswerMode ? (
            <button type="button" onClick={resetProblemSetup}>문제도 초기화</button>
          ) : (
            <button type="button" onClick={resetAnswerSequence}>정답 수순 초기화</button>
          )}
        </div>

        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <BadukBoard
            stones={stones}
            answerSequence={answerSequence}
            mode={mode}
            isAnswerMode={isAnswerMode}
            onPlaceStone={onPlaceStone}
            boardSize={boardSize}
          />
        </div>

        <button type="submit" style={{ marginTop: 20 }}>
          문제 저장하기 (Firestore에 저장)
        </button>
      </form>
    </div>
  );
}

// 문제 풀이 페이지
export function SolveProblemPage({ problem }) {
  // problem = {title, difficulty, description, stones, answerSequence, boardSize}

  const [currentStep, setCurrentStep] = React.useState(0);
  const [placedStones, setPlacedStones] = React.useState([]);

  React.useEffect(() => {
    setPlacedStones(problem.stones || []);
    setCurrentStep(0);
  }, [problem]);

  const handleSolveClick = (x, y) => {
    if (currentStep >= problem.answerSequence.length) return;

    const nextMove = problem.answerSequence[currentStep];
    if (nextMove.x === x && nextMove.y === y) {
      setPlacedStones([...placedStones, nextMove]);
      setCurrentStep(currentStep + 1);
    } else {
      alert('잘못된 착수입니다. 다시 시도하세요.');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>문제 풀이: {problem.title}</h1>
      <p>난이도: {problem.difficulty}</p>
      <p>{problem.description}</p>

      <BadukBoard
        stones={placedStones}
        answerSequence={problem.answerSequence}
        boardSize={problem.boardSize}
        solveMode={true}
        highlightAnswerMoveIndex={currentStep - 1}
        onSolveClick={handleSolveClick}
      />

      <div style={{ marginTop: 10 }}>
        <p>현재 착수: {currentStep + 1} / {problem.answerSequence.length}</p>
        {currentStep === problem.answerSequence.length && (
          <p style={{ color: 'green', fontWeight: 'bold' }}>축하합니다! 문제를 모두 풀었습니다.</p>
        )}
      </div>
    </div>
  );
}
