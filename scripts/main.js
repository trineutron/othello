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

function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (board[idx] !== 'empty') return;
    let movable = false;
    directions.forEach(d => {
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
    });
    if (movable) {
        flip(idx);
        color = opponent(color);
    }
}
