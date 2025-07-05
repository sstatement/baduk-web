// src/utils/sgfParser.js
export class SGFNode {
  constructor(properties = {}, parent = null) {
    this.properties = properties;
    this.parent = parent;
    this.children = [];
    this.move = null;
    this.comment = '';
  }
}

export function parseSGF(sgf) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < sgf.length && /\s/.test(sgf[pos])) pos++;
  }

  function parseProperties(node) {
    while (true) {
      skipWhitespace();
      if (pos >= sgf.length || ['(', ';', ')'].includes(sgf[pos])) break;

      const keyMatch = /^[A-Z]+/.exec(sgf.slice(pos));
      if (!keyMatch) throw new Error(`Invalid property at pos ${pos}: ${sgf.slice(pos, pos + 10)}`);
      const key = keyMatch[0];
      pos += key.length;

      const values = [];
      while (sgf[pos] === '[') {
        pos++;
        let value = '';
        while (pos < sgf.length && sgf[pos] !== ']') {
          if (sgf[pos] === '\\') {
            pos++;
            if (pos < sgf.length) value += sgf[pos++];
          } else {
            value += sgf[pos++];
          }
        }
        if (sgf[pos] === ']') pos++;
        values.push(value);
      }

      node.properties[key] = values;
    }
  }

  function parseNode(parent) {
    skipWhitespace();
    if (pos >= sgf.length || sgf[pos] !== ';') return null;
    pos++; // skip ';'

    const node = new SGFNode({}, parent);
    parseProperties(node);

    const coord = node.properties.B?.[0] || node.properties.W?.[0];
    if (coord?.length === 2) {
      node.move = {
        color: node.properties.B ? 'black' : 'white',
        x: coord.charCodeAt(0) - 97,
        y: coord.charCodeAt(1) - 97,
      };
    }

    if (node.properties.C) {
      node.comment = node.properties.C.join(' ');
    }

    return node;
  }

  function parseTree(parent) {
  skipWhitespace();
  if (sgf[pos] !== '(') return null;
  pos++; // skip '('

  let curParent = parent;
  let root = null;

  while (pos < sgf.length) {
    skipWhitespace();
    if (sgf[pos] === ';') {
      // 새 노드 생성
      const node = parseNode(curParent);
      if (!node) break;

      // 중복 방지: 부모의 자식 중 동일 move가 있으면 재사용
      let existing = null;
      if (curParent && node.move) {
        existing = curParent.children.find(
          (child) =>
            child.move &&
            child.move.color === node.move.color &&
            child.move.x === node.move.x &&
            child.move.y === node.move.y
        );
      }

      if (existing) {
        curParent = existing;
      } else {
        if (!root) root = node;
        if (curParent) curParent.children.push(node);
        curParent = node;
      }
    } else if (sgf[pos] === '(') {
      const branch = parseTree(curParent);
      if (branch && curParent) {
        if (!curParent.children.includes(branch)) {
          curParent.children.push(branch);
        }
      }
    } else if (sgf[pos] === ')') {
      pos++;
      break;
    } else {
      pos++;
    }
  }

  return root;
}


  function setParentLinks(node, parent = null) {
    if (!node) return;
    node.parent = parent;
    for (const child of node.children) {
      setParentLinks(child, node);
    }
  }

  const root = parseTree(null);
  setParentLinks(root);
  return root;
}
