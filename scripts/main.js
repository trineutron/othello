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

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

function existsMovable() {
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
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function makeMove() {
    const idx = Number(this.getAttribute('id'));
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
        color = opponent(color);
        if (existsMovable()) {
            document.querySelector('p').textContent = color;
        } else {
            color = opponent(color);
            if (existsMovable()) {
                alert(opponent(color) + ' pass');
            } else {
                document.querySelector('p').textContent = '終局';
                alert('終局');
            }
        }
    }
}
