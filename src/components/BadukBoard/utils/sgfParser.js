// src/utils/sgfParser.js
export class SGFNode {
  constructor(properties = {}, parent = null) {
    this.id = SGFNode._nextId++;
    this.properties = properties;
    this.parent = parent;
    this.children = [];
    this.move = null;     // { color, x, y, pass?: true }
    this.comment = '';
    this.setup = { AB: [], AW: [], AE: [] }; // 배치/제거 정보만 보존
  }
}
SGFNode._nextId = 1;

export function parseSGF(sgf) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < sgf.length && /\s/.test(sgf[pos])) pos++;
  }

  function readValue() {
    // '[' ... ']' 읽기 (이스케이프 \ 처리)
    if (sgf[pos] !== '[') return null;
    pos++;
    let value = '';
    while (pos < sgf.length && sgf[pos] !== ']') {
      if (sgf[pos] === '\\') {
        pos++;
        if (pos < sgf.length) value += sgf[pos++]; // 다음 글자 그대로
      } else {
        value += sgf[pos++];
      }
    }
    if (sgf[pos] === ']') pos++;
    return value;
  }

  function parseProperties(node) {
    while (true) {
      skipWhitespace();
      if (pos >= sgf.length || ['(', ';', ')'].includes(sgf[pos])) break;

      const keyMatch = /^[A-Z]+/.exec(sgf.slice(pos));
      if (!keyMatch) throw new Error(`Invalid property at ${pos}: ${sgf.slice(pos, pos + 10)}`);
      const key = keyMatch[0];
      pos += key.length;

      const values = [];
      while (sgf[pos] === '[') {
        const v = readValue();
        values.push(v ?? '');
      }

      node.properties[key] = values;

      // 자주 쓰는 키는 sugar로 보존
      if (key === 'C') {
        node.comment = values.join('\n').replace(/\r\n?/g, '\n');
      } else if (key === 'AB' || key === 'AW' || key === 'AE') {
        node.setup[key] = values.slice();
      }
    }
  }

  function parseNode(parent) {
    skipWhitespace();
    if (pos >= sgf.length || sgf[pos] !== ';') return null;
    pos++; // skip ';'

    const node = new SGFNode({}, parent);
    parseProperties(node);

    // move: B[] / W[] / B[aa] / W[pp]
    let color = null, coord = null;
    if (node.properties.B && node.properties.B.length) {
      color = 'black';
      coord = node.properties.B[0] || '';
    } else if (node.properties.W && node.properties.W.length) {
      color = 'white';
      coord = node.properties.W[0] || '';
    }
    if (color !== null) {
      if (!coord || coord.length === 0) {
        node.move = { color, pass: true }; // ✅ 패스 처리
      } else if (coord.length === 2) {
        node.move = {
          color,
          x: coord.charCodeAt(0) - 97,
          y: coord.charCodeAt(1) - 97,
        };
      }
    }
    return node;
  }

  function parseGameTree(parent) {
    skipWhitespace();
    if (sgf[pos] !== '(') return null;
    pos++; // '('

    let curParent = parent;
    let root = null;

    while (pos < sgf.length) {
      skipWhitespace();
      const ch = sgf[pos];

      if (ch === ';') {
        const node = parseNode(curParent);
        if (!node) break;
        if (!root) root = node;
        if (curParent) {
  node.parent = curParent;
  curParent.children.push(node);
}
        curParent = node;
      } else if (ch === '(') {
        // variation: 같은 부모(curParent)의 다른 분기
        const branchRoot = parseGameTree(curParent);
        if (!root) root = branchRoot || root;
      } else if (ch === ')') {
        pos++; // ')'
        break;
      } else {
        pos++; // 잡다한 공백/문자 스킵
      }
    }
    return root;
  }

  // 컬렉션: (;...)(;...)(;...)
  const fakeRoot = new SGFNode({}); // 여러 트리를 담기 위한 가짜 루트
  while (pos < sgf.length) {
    skipWhitespace();
    if (pos >= sgf.length) break;
    if (sgf[pos] === '(') {
      const gRoot = parseGameTree(fakeRoot);
      if (gRoot) {
  gRoot.parent = fakeRoot;
  fakeRoot.children.push(gRoot);
}

    } else {
      pos++;
    }
  }

  // 루트 링크/메타
  // 바둑판 크기: 최상위(혹은 각 게임 루트)의 SZ 사용 (없으면 19)
  const firstGame = fakeRoot.children[0];
  const sizeProp = firstGame?.properties?.SZ?.[0];
  const boardSize = sizeProp ? parseInt(sizeProp, 10) : 19;
  fakeRoot.properties.SZ = [String(boardSize)];
  return fakeRoot.children.length === 1 ? firstGame : fakeRoot;
}
