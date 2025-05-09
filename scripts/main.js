"use strict";

const black = 1;
const white = -1;
const empty = 0;
const wall = 2;
const end = 0;

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

function colorString(color) {
  if (color === 1) {
    return "black";
  } else {
    return "white";
  }
}

function idxTof5d6(idx) {
  const x = (idx - 10) % 9;
  const y = Math.floor((idx - 10) / 9);
  return String.fromCharCode(97 + x) + (y + 1);
}

// オセロ盤の表示
const boardShow = document.createElement("table");
document.getElementById("board").appendChild(boardShow);
for (let i = 0; i < 8; i++) {
  const boardLine = document.createElement("tr");
  boardShow.appendChild(boardLine);
  for (let j = 0; j < 8; j++) {
    const boardCell = document.createElement("td");
    boardLine.appendChild(boardCell);
    boardCell.addEventListener("click", makeMove);
    boardCell.setAttribute("id", 9 * i + j + 10);
  }
}

// 初期盤面の作成
let board = [];
for (let i = 0; i < 91; i++) {
  if (i < 10 || 80 < i || i % 9 === 0) {
    board.push(wall);
  } else if (i === 40 || i === 50) {
    board.push(white);
    document.getElementById(i).setAttribute("class", "white");
  } else if (i === 41 || i === 49) {
    board.push(black);
    document.getElementById(i).setAttribute("class", "black");
  } else {
    board.push(empty);
  }
}
board.push(black);
board.push(2);
board.push(2);

// 手番の色を取得
function getColor(newBoard) {
  return newBoard[91];
}

// 相手番
function changeColor(newBoard) {
  newBoard[91] = opponent(newBoard[91]);
}

function addStone(newBoard, color) {
  if (color === black) {
    newBoard[92]++;
  } else {
    newBoard[93]++;
  }
}

function flipStone(newBoard, color) {
  if (color === black) {
    newBoard[92]++;
    newBoard[93]--;
  } else {
    newBoard[93]++;
    newBoard[92]--;
  }
}

// 表示を含めて石を返す
function flip(idx) {
  const color = getColor(board);
  if (board[idx] === empty) {
    addStone(board, color);
  } else {
    flipStone(board, color);
  }
  board[idx] = color;
  document.getElementById(idx).setAttribute("class", colorString(color));
}

// 相手の色
function opponent(color) {
  if (color === black) {
    return white;
  } else {
    return black;
  }
}

// 打てる場所をリストアップ
function listMovable(newBoard) {
  let movable = [];
  const color = getColor(newBoard);
  const oppColor = opponent(color);
  for (let i = 10; i <= 80; i++) {
    if (newBoard[i] !== empty) {
      continue;
    }
    for (let j = 0; j < 8; j++) {
      const d = directions[j];
      let next = i + d;
      if (newBoard[next] !== oppColor) {
        continue;
      }
      next += d;
      while (newBoard[next] === oppColor) {
        next += d;
      }
      if (newBoard[next] === color) {
        movable.push(i);
        break;
      }
    }
  }
  return movable;
}

// 打てる場所があるか
function existsMovable(newBoard) {
  const color = getColor(newBoard);
  const oppColor = opponent(color);
  for (let i = 10; i <= 80; i++) {
    if (newBoard[i] !== empty) {
      continue;
    }
    for (let j = 0; j < 8; j++) {
      const d = directions[j];
      let next = i + d;
      if (newBoard[next] !== oppColor) {
        continue;
      }
      next += d;
      while (newBoard[next] === oppColor) {
        next += d;
      }
      if (newBoard[next] === color) {
        return true;
      }
    }
  }
  return false;
}

// クリック時の動作
function makeMove() {
  const idx = Number(this.getAttribute("id"));
  if (!human(getColor(board)) || board[idx] !== empty) return;
  move(idx);
}

// 着手
function move(idx) {
  const color = getColor(board);
  const oppColor = opponent(color);
  if (board[idx] !== empty) return;
  let movable = false;
  for (let i = 0; i < 8; i++) {
    const d = directions[i];
    let next = idx + d;
    while (board[next] === oppColor) {
      next += d;
    }
    if (board[next] === color) {
      next -= d;
      while (board[next] === oppColor) {
        flip(next);
        movable = true;
        next -= d;
      }
    }
  }
  if (movable) {
    flip(idx);
    document.getElementById("record").textContent += idxTof5d6(idx);
    document.getElementById("countBlack").textContent = board[92];
    document.getElementById("countWhite").textContent = board[93];
    changeColor(board);
    const color = getColor(board);
    if (existsMovable(board)) {
      document.getElementById("turn").textContent = colorString(color);
    } else {
      changeColor(board);
      if (!existsMovable(board)) {
        board[91] = end;
        document.getElementById("turn").textContent = "終局";
      }
    }
    if (getColor(board) !== end && !human(getColor(board))) {
      setTimeout(() => move(moveByAI()), 0);
    }
  }
}

function afterMove(oldBoard, idx) {
  let newBoard = oldBoard.slice();
  const color = getColor(oldBoard);
  const oppColor = opponent(color);
  for (let i = 0; i < 8; i++) {
    const d = directions[i];
    let next = idx + d;
    if (newBoard[next] !== oppColor) {
      continue;
    }
    next += d;
    while (newBoard[next] === oppColor) {
      next += d;
    }
    if (newBoard[next] === color) {
      next -= d;
      while (newBoard[next] === oppColor) {
        newBoard[next] = color;
        flipStone(newBoard, color);
        next -= d;
      }
    }
  }
  newBoard[idx] = color;
  addStone(newBoard, color);
  changeColor(newBoard);
  return newBoard;
}

// 標準正規分布に従う乱数
function gauss() {
  let r0 = Math.random();
  let r1 = Math.random();
  return Math.sqrt(-2.0 * Math.log(r0)) * Math.sin(2 * Math.PI * r1);
}

// 黒番から見た評価値
function evalBoard(newBoard) {
  let res = 0;
  if (getColor(newBoard) === end) {
    res = newBoard[92] - newBoard[93];
    if (res > 0) {
      res = 64 - 2 * newBoard[93];
    } else if (res < 0) {
      res = 2 * newBoard[92] - 64;
    }
    return 1000 * res;
  }
  res = 4 * gauss();
  for (let i = 20; i <= 70; i++) {
    if ((i + 1) % 9 < 3 || newBoard[i] === empty) {
      continue;
    }
    for (let j = 0; j < 8; j++) {
      const d = directions[j];
      if (newBoard[i + d] === empty) {
        res -= newBoard[i];
      }
    }
  }
  // 隅
  const corner = [10, 17, 73, 80];
  for (let i = 0; i < corner.length; i++) {
    for (let j = i + 1; j < corner.length; j++) {
      const d = (corner[j] - corner[i]) / 7;
      if (i + j === 3) {
        // Xライン
        if (newBoard[corner[i]] === empty) {
          res -= 6 * newBoard[corner[i] + d];
        }
        if (newBoard[corner[j]] === empty) {
          res -= 6 * newBoard[corner[j] - d];
        }
        continue;
      }
      let value = 0;
      for (let k = 2; k < 6; k++) {
        if (newBoard[corner[i] + k * d] === empty) {
          value -= 2;
        }
      }
      if (newBoard[corner[i]] === empty) {
        res += value * newBoard[corner[i] + d];
      }
      if (newBoard[corner[j]] === empty) {
        res += value * newBoard[corner[j] - d];
      }
      let noEmpty = true;
      let adjust = 0;
      for (let k = 0; k < 8; k++) {
        if (newBoard[corner[i] + k * d] === empty) {
          noEmpty = false;
          break;
        }
        adjust += newBoard[corner[i] + k * d];
      }
      const edge = newBoard[corner[i]] + newBoard[corner[j]];
      if (noEmpty) {
        res += adjust;
      } else if (edge > 0) {
        res += 8;
      } else if (edge < 0) {
        res -= 8;
      }
    }
  }
  return res;
}

function moveByAI() {
  const start = Date.now();
  let movable = listMovable(board);
  let res;
  const color = getColor(board);
  let newBoards = [];
  let scores = [];
  for (let i = 0; i < movable.length; i++) {
    const idx = movable[i];
    newBoards[idx] = afterMove(board, idx);
    scores[idx] = search(newBoards[idx], 0, color, -64000, 64000, start + 1000);
  }
  movable.sort(function (a, b) {
    return scores[b] - scores[a];
  });
  for (let depth = 1; ; depth++) {
    let prevRes = res;
    let maxScore = -65000;
    for (let i = 0; i < movable.length; i++) {
      const idx = movable[i];
      const newBoard = newBoards[idx];
      let score;
      if (i === 0) {
        score = search(newBoard, depth - 1, color, -64000, 64000, start + 1000);
      } else {
        score = search(
          newBoard,
          depth - 1,
          color,
          maxScore,
          maxScore + 1,
          start + 1000
        );
        if (score !== null && score >= maxScore + 1) {
          score = search(
            newBoard,
            depth - 1,
            color,
            score,
            64000,
            start + 1000
          );
        }
      }
      if (score === null) {
        console.log(depth - 1);
        return prevRes;
      }
      if (score > maxScore) {
        res = idx;
        maxScore = score;
      }
    }
  }
}

// 前の着手から見た評価値、α以下もしくはβ以上が確定したら枝刈り
function search(
  currentBoard,
  depth,
  prevColor,
  alpha,
  beta,
  timeout,
  pass = false
) {
  const color = getColor(currentBoard);
  let score = -beta;
  if (depth <= 0 || color === end) {
    score = evalBoard(currentBoard);
    if (prevColor === white) {
      score *= -1;
    }
    return score;
  }
  if (depth >= 4 && Date.now() > timeout) {
    return null;
  }
  let movable = listMovable(currentBoard);
  if (movable.length === 0) {
    let newBoard = currentBoard.slice();
    if (pass) {
      newBoard[91] = end;
    } else {
      changeColor(newBoard);
    }
    return -search(newBoard, depth, color, -beta, -alpha, timeout, true);
  }
  if (movable.length === 1) {
    const idx = movable[0];
    const newBoard = afterMove(currentBoard, idx);
    return -search(newBoard, depth, color, -beta, -alpha, timeout);
  }
  if (depth > 3) {
    let scores = [];
    for (let i = 0; i < movable.length; i++) {
      const idx = movable[i];
      scores[idx] = search(
        afterMove(currentBoard, idx),
        0,
        color,
        -64000,
        64000,
        timeout
      );
      if (scores[idx] === null) {
        return null;
      }
    }
    movable.sort(function (a, b) {
      return scores[b] - scores[a];
    });
  }
  for (let i = 0; i < movable.length; i++) {
    const idx = movable[i];
    const newBoard = afterMove(currentBoard, idx);
    let newAlpha = -beta;
    let newBeta = newAlpha + 1;
    if (i === 0) {
      newBeta = -alpha;
    }
    let newScore = search(
      newBoard,
      depth - 1,
      color,
      newAlpha,
      newBeta,
      timeout
    );
    if (newScore === null) {
      return null;
    }
    while (newScore > score) {
      score = newScore;
      beta = -score;
      if (i === 0 || alpha >= beta || score < newBeta) {
        break;
      }
      newAlpha = -beta;
      newBeta = -alpha;
      newScore = search(newBoard, depth - 1, color, newAlpha, newBeta, timeout);
      if (newScore === null) {
        return null;
      }
    }
    if (alpha >= beta) {
      break;
    }
  }
  return -score;
}

function human(color) {
  if (color === black) {
    return true;
  } else {
    return false;
  }
}

if (getColor(board) !== end && !human(getColor(board))) {
  move(moveByAI());
}
