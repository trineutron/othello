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

let color;

function flip(idx) {
    board[idx] = color;
    document.getElementById(idx).setAttribute('class', color);
}

color = 'white'
flip(40);
flip(50);

color = 'black'
flip(41);
flip(49);

function opponent() {
    if (color === 'black') {
        return 'white';
    } else {
        return 'black';
    }
}

const human = { 'black': true, 'white': false };

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

function listMovable() {
    let movable = []
    for (let i = 0; i < board.length; i++) {
        const cellState = board[i];
        if (cellState === 'empty') {
            for (const d of directions) {
                let next = i + d;
                while (board[next] === opponent(color)) {
                    next += d;
                }
                if (board[next] === color) {
                    next -= d;
                    if (board[next] === opponent(color)) {
                        movable.push(i);
                        break;
                    }
                }
            }
        }
    }
    return movable;
}

function existsMovable() {
    return listMovable().length !== 0;
}

function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (!human[color] || board[idx] !== 'empty') return;
    move(idx);
}

function move(idx) {
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
        document.getElementById('countBlack').textContent = board.filter(function (x) {
            return x === 'black';
        }).length;
        document.getElementById('countWhite').textContent = board.filter(function (x) {
            return x === 'white';
        }).length;
        color = opponent(color);
        if (existsMovable()) {
            document.getElementById('turn').textContent = color;
        } else {
            color = opponent(color);
            if (existsMovable()) {
                alert(opponent(color) + ' pass');
            } else {
                document.getElementById('turn').textContent = '終局';
                alert('終局');
            }
        }
        if (!human[color]) {
            move(moveByAI());
        }
    }
}

if (!human['black']) {
    move(moveByAI());
}

function afterMove(idx) {
    let newBoard = board.slice(), movable = false;
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
    }
    return newBoard;
}

// 黒番から見た評価値
function evalBoard(newBoard) {
    let res = 0, v = { 'black': 1, 'white': -1, 'empty': 0, 'wall': 0 };
    for (let i = 0; i < newBoard.length; i++) {
        res += v[newBoard[i]];
    }
    return res;
}

function moveByAI() {
    let movable = listMovable(), res = null, maxScore = -Infinity;
    for (const idx of movable) {
        let eval = evalBoard(afterMove(idx));
        if (color === 'white') {
            eval *= -1;
        }
        if (eval > maxScore) {
            res = idx;
            maxScore = eval;
        }
    }
    return res;
}
