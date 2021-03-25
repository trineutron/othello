// オセロ盤の表示
const boardShow = document.createElement('table');
document.getElementById('board').appendChild(boardShow);
for (let i = 0; i < 8; i++) {
    const boardLine = document.createElement('tr');
    boardShow.appendChild(boardLine);
    for (let j = 0; j < 8; j++) {
        const boardCell = document.createElement('td');
        boardLine.appendChild(boardCell);
        boardCell.addEventListener('click', makeMove);
        boardCell.setAttribute('id', 9 * i + j + 10);
    }
}

// 初期盤面の作成
let board = [];
for (let i = 0; i < 91; i++) {
    if (i < 10 || 80 < i || i % 9 === 0) {
        board.push('wall');
    } else if (i === 40 || i === 50) {
        board.push('white');
        document.getElementById(i).setAttribute('class', 'white');
    } else if (i === 41 || i === 49) {
        board.push('black');
        document.getElementById(i).setAttribute('class', 'black');
    } else {
        board.push('empty');
    }
}
board.push('black');

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

// 手番の色を取得
function getColor(newBoard) {
    return newBoard[91];
}

// 相手番
function changeColor(newBoard) {
    newBoard[91] = opponent(newBoard[91]);
}

// 表示を含めて石を返す
function flip(idx) {
    const color = getColor(board);
    board[idx] = color;
    document.getElementById(idx).setAttribute('class', color);
}

// 相手の色
function opponent(color) {
    if (color === 'black') {
        return 'white';
    } else {
        return 'black';
    }
}

// 打てる場所をリストアップ
function listMovable(newBoard) {
    let movable = [];
    const color = getColor(newBoard);
    for (let i = 0; i < newBoard.length - 1; i++) {
        const cellState = newBoard[i];
        if (cellState === 'empty') {
            for (const d of directions) {
                let next = i + d;
                while (newBoard[next] === opponent(color)) {
                    next += d;
                }
                if (newBoard[next] === color) {
                    next -= d;
                    if (newBoard[next] === opponent(color)) {
                        movable.push(i);
                        break;
                    }
                }
            }
        }
    }
    return movable;
}

// 打てる場所があるか
function existsMovable(newBoard) {
    const color = getColor(newBoard);
    for (let i = 0; i < newBoard.length - 1; i++) {
        const cellState = newBoard[i];
        if (cellState === 'empty') {
            for (const d of directions) {
                let next = i + d;
                while (newBoard[next] === opponent(color)) {
                    next += d;
                }
                if (newBoard[next] === color) {
                    next -= d;
                    if (newBoard[next] === opponent(color)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// クリック時の動作
function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (!human[getColor(board)] || board[idx] !== 'empty') return;
    move(idx);
}

// 着手
function move(idx) {
    const color = getColor(board);
    if (board[idx] !== 'empty') return;
    let movable = false;
    for (const d of directions) {
        let next = idx + d;
        while (board[next] === opponent(color)) {
            next += d;
        }
        if (board[next] === color) {
            next -= d;
            while (board[next] === opponent(color)) {
                flip(next);
                movable = true;
                next -= d;
            }
        }
    }
    if (movable) {
        flip(idx);
        document.getElementById('countBlack').textContent = board.slice(0, 91).filter(function (x) {
            return x === 'black';
        }).length;
        document.getElementById('countWhite').textContent = board.slice(0, 91).filter(function (x) {
            return x === 'white';
        }).length;
        changeColor(board);
        const color = getColor(board);
        if (existsMovable(board)) {
            document.getElementById('turn').textContent = color;
        } else {
            changeColor(board);
            if (existsMovable(board)) {
                alert(color + ' pass');
            } else {
                board[91] = 'end';
                document.getElementById('turn').textContent = '終局';
                alert('終局');
            }
        }
        if (!human[getColor(board)]) {
            move(moveByAI(defaultDepth));
        }
    }
}

function afterMove(oldBoard, idx) {
    let newBoard = oldBoard.slice(), movable = false, color = getColor(oldBoard);
    for (const d of directions) {
        let next = idx + d;
        while (newBoard[next] === opponent(color)) {
            next += d;
        }
        if (newBoard[next] === color) {
            next -= d;
            while (newBoard[next] === opponent(color)) {
                newBoard[next] = color;
                movable = true;
                next -= d;
            }
        }
    }
    if (movable) {
        newBoard[idx] = color;
        changeColor(newBoard);
        if (!existsMovable(newBoard)) {
            changeColor(newBoard);
            if (!existsMovable(newBoard)) {
                newBoard[91] = 'end';
            }
        }
    }
    return newBoard;
}

// 黒番から見た評価値
function evalBoard(newBoard) {
    let res = 0, v = { 'black': 1, 'white': -1, 'empty': 0, 'wall': 0 };
    if (getColor(newBoard) === 'end') {
        for (let i = 0; i < newBoard.length - 1; i++) {
            res += 1000 * v[newBoard[i]];
        }
        return res;
    }
    for (let i = 0; i < newBoard.length - 1; i++) {
        let value = 0;
        if (i === 10 || i === 17 || i === 73 || i === 80) {  // 隅
            value = 16;
            for (const d of [-9, -1, 1, 9]) {
                let next = i + d;
                while (newBoard[next] === newBoard[i]) {
                    next += d;
                }
                if (newBoard[next] === 'empty') {
                    value++;
                }
            }
        }
        for (const d of directions) {
            if (newBoard[i + d] === 'empty' && newBoard[i - d] !== 'wall') {
                value--;
                if (i + d === 10 || i + d === 17 || i + d === 73 || i + d === 80) {
                    if (d === -10 || d === -8 || d === 8 || d === 10) {  // X
                        value -= 12;
                    } else {  // C
                        let next = i - d;
                        while (newBoard[next] === newBoard[i]) {
                            next -= d;
                        }
                        // 隅に繋がっておらず山でもない
                        if (newBoard[next] !== 'wall' &&
                            !(newBoard[next] === 'empty' && newBoard[next - d] === 'wall')) {
                            value -= 8;
                            // ウイング
                            if (newBoard[next] === 'empty' && newBoard[next - d] === 'empty' && newBoard[next - 2 * d] === 'wall') {
                                value += 4;
                            }
                        }
                    }
                }
            }
        }
        res += value * v[newBoard[i]];
    }
    return res;
}

function moveByAI(depth) {
    let movable = listMovable(board), res = [], maxScore = -Infinity;
    const color = getColor(board);
    for (const idx of movable) {
        let newBoard = afterMove(board, idx);
        const eval = search(newBoard, depth - 1, color, maxScore - 1);
        if (eval > maxScore) {
            res = [idx];
            maxScore = eval;
        } else if (eval === maxScore) {
            res.push(idx);
        }
    }
    return res[Math.floor(Math.random() * res.length)];
}

// 前の着手から見た評価値、α以下が確定したら枝刈り
function search(currentBoard, depth, prevColor, alpha) {
    let empty = 0;
    for (const state of currentBoard) {
        if (state === 'empty') {
            empty++;
        }
    }
    if (depth === 0 && empty && empty <= additionalDepth) {
        return search(currentBoard, empty, prevColor, alpha);
    }
    let eval = -Infinity;
    const color = getColor(currentBoard);
    const movable = listMovable(currentBoard);
    if (depth === 0 || color === 'end') {
        eval = evalBoard(currentBoard);
        if (prevColor === 'white') {
            eval *= -1;
        }
        return eval;
    }
    for (const idx of movable) {
        const newBoard = afterMove(currentBoard, idx);
        let newEval = search(newBoard, depth - 1, color, eval);
        if (newEval > eval) {
            eval = newEval;
            if (prevColor !== color && -eval <= alpha) {
                break;
            }
        }
    }
    if (prevColor !== color) {
        eval *= -1;
    }
    return eval;
}

const defaultDepth = 5;
const additionalDepth = 12 - defaultDepth;
const human = { 'black': true, 'white': false };

if (!human['black']) {
    move(moveByAI(defaultDepth));
}
