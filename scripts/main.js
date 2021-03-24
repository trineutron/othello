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

let board = [];
for (let i = 0; i < 91; i++) {
    if (i < 10 || 80 < i || i % 9 === 0) {
        board.push('wall');
    } else {
        board.push('empty');
    }
}
board.push('black');

function getColor(newBoard) {
    return newBoard[91];
}

function changeColor(newBoard) {
    newBoard[91] = opponent(newBoard[91]);
}

function flip(idx) {
    const color = getColor(board);
    board[idx] = color;
    document.getElementById(idx).setAttribute('class', color);
}

changeColor(board);
flip(40);
flip(50);

changeColor(board);
flip(41);
flip(49);

function opponent(color) {
    if (color === 'black') {
        return 'white';
    } else {
        return 'black';
    }
}

const human = { 'black': true, 'white': false };

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

function listMovable(newBoard) {
    let movable = [], color = getColor(newBoard);
    for (let i = 0; i < newBoard.length; i++) {
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

function existsMovable(newBoard) {
    return listMovable(newBoard).length !== 0;
}

function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (!human[getColor(board)] || board[idx] !== 'empty') return;
    move(idx);
}

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
        let color = getColor(board);
        if (existsMovable(board)) {
            document.getElementById('turn').textContent = color;
        } else {
            changeColor(board);
            if (existsMovable(board)) {
                alert(color + ' pass');
            } else {
                document.getElementById('turn').textContent = '終局';
                alert('終局');
            }
        }
        if (!human[getColor(board)]) {
            move(moveByAI());
        }
    }
}

if (!human['black']) {
    move(moveByAI());
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
        }
    }
    return newBoard;
}

// 黒番から見た評価値
function evalBoard(newBoard) {
    let res = 0, v = { 'black': 1, 'white': -1, 'empty': 0, 'wall': 0 };
    for (let i = 0; i < newBoard.length; i++) {
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

function moveByAI() {
    let movable = listMovable(board), res = null, maxScore = -Infinity, color = getColor(board);
    for (const idx of movable) {
        let newBoard = afterMove(board, idx), newMax = -Infinity;
        let newMovable = listMovable(newBoard);
        let newColor = getColor(newBoard);
        for (const newIdx of newMovable) {
            let newEval = evalBoard(afterMove(newBoard, newIdx));
            if (newColor === 'white') {
                newEval *= -1;
            }
            if (newEval > newMax) {
                newMax = newEval;
            }
        }
        let eval = newMax;
        if (color !== newColor) {
            eval *= -1;
        }
        if (maxScore === -Infinity || eval > maxScore) {
            res = idx;
            maxScore = eval;
        }
    }
    return res;
}
