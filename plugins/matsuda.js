/* eslint-disable */
const axisMin = -256;
const axisMax = 255;
const size = axisMax - axisMin + 1;
const userCount = 256 ^ 2 - 1;
let pieces = null;
let usersPieceCount = null;

const dirXYArr = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const dirXY = new Int8Array(8);
for (let i = 0; i < 4; i += 1) {
  dirXY[i * 2] = dirXYArr[i][0];
  dirXY[i * 2 + 1] = dirXYArr[i][1];
}

const dirAllArr = [
  ...dirXYArr,
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

const dirAll = new Int8Array(16);
for (let i = 0; i < 8; i += 1) {
  dirAll[i * 2] = dirAllArr[i][0];
  dirAll[i * 2 + 1] = dirAllArr[i][1];
}

const dirXYLength = dirXYArr.length;
const dirAllLength = dirAllArr.length;

const pos2Idx = (x, y) => (size - (y - axisMin + 1)) * size + x - axisMin;

if (pos2Idx(255, -256) !== size ** 2 - 1) throw new Error(`[pos2Idx(255, -256) !== size ** 2 - 1] : ${pos2Idx(255, -256)}`);
if (pos2Idx(-256, 255) !== 0) throw new Error(`[pos2Idx(-256, 255) !== 0] : ${pos2Idx(-256, 255)}`);
if (pos2Idx(0, 0) !== size * axisMax - axisMin) throw new Error(`[pos2Idx(0, 0) !== size * axisMax - axisMin] : ${pos2Idx(0, 0)}`);
console.log('pos2Idx: OK');

const idx2Pos = idx => ({ x: idx % size + axisMin, y: size - Math.floor(idx / size) + axisMin - 1 });

if (JSON.stringify(idx2Pos(size ** 2 - 1)) !== JSON.stringify({ x: 255, y: -256 })) throw new Error(`[idx2Pos(size ** 2 - 1) !== { x: 255, y: -256}] : ${JSON.stringify(idx2Pos(size ** 2 - 1))}`);
if (JSON.stringify(idx2Pos(0)) !== JSON.stringify({ x: -256, y: 255 })) throw new Error(`[idx2Pos(0) !== { x: -256, y: 255 }] : ${JSON.stringify(pos2Idx(0))}`);
if (JSON.stringify(idx2Pos(size * axisMax - axisMin)) !== JSON.stringify({ x: 0, y: 0 })) throw new Error(`[idx2Pos(size * axisMax - axisMin) !== { x: 0, y: 0 }] : ${JSON.stringify(idx2Pos(size * axisMax - axisMin))}`);
console.log('idx2Pos: OK');

export default {
  initPieces() {
    pieces = new Uint16Array(size ** 2);
    usersPieceCount = new Uint32Array(userCount + 1);
    pieces[pos2Idx(0, 0)] = 1;
    usersPieceCount[1] = 1;
  },
  judgePiece(x, y, userId) {
    let idx = pos2Idx(x, y);
    // マスに他コマがあるかどうか
    if (pieces[idx] > 0) return false;

    let status = false;

    // 盤面に自コマがある場合
    if (usersPieceCount[userId] > 0) {
      for (let i = 0; i < dirAllLength; i += 1) {
        let dirX = dirAll[i * 2];
        let dirY = dirAll[i * 2 + 1];
        let flip = [];

        let n = 1;
        let aroundX = x + dirX;
        let aroundY = y + dirY;
        let dirPiece = pieces[pos2Idx(aroundX, aroundY)];
        let turnable = false;

        while (dirPiece > 0) {
          if (dirPiece !== userId) {
            flip.push(aroundX, aroundY, dirPiece);
            n += 1;
            aroundX = x + dirX * n;
            aroundY = y + dirY * n;
            dirPiece = pieces[pos2Idx(aroundX, aroundY)];
          } else {
            turnable = true;
            break;
          }
        }

        if (turnable) {
          for (let j = 0, f = flip.length; j < f; j += 3) {
            pieces[pos2Idx(flip[j], flip[j + 1])] = userId;
            usersPieceCount[userId] += 1;
            usersPieceCount[flip[j + 2]] -= 1;
          }
          status = true;
        }
      }
    // 他コマばかりで自コマがない場合、
    } else {
      // 上下左右を検索
      for (let i = 0; i < dirXYLength; i += 1) {
        if (pieces[pos2Idx(x + dirXY[i * 2], y + dirXY[i * 2 + 1])] > 0) {
          // 上下左右いずれかのとなりに他コマがある場合
          status = true;
          break;
        }
      }
    }

    if (status) {
      pieces[idx] = userId;
      usersPieceCount[userId] += 1;
    }

    return status;
  },
  getPieces() {
    let result = [];
    for (let i = 0, n = pieces.length; i < n; i += 1) {
      if (pieces[i] > 0) result.push({ ...idx2Pos(i), userId: pieces[i] });
    }
    return result;
  },
};
