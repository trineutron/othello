const board = document.createElement('table');
document.getElementById('board').appendChild(board);
for (let i = 0; i < 8; i++) {
    const boardLine = document.createElement('tr');
    board.appendChild(boardLine);
    for (let j = 0; j < 8; j++) {
        const boardCell = document.createElement('td');
        boardLine.appendChild(boardCell);
        boardCell.addEventListener('click', makeMove);
        boardCell.setAttribute('id', 9 * i + j + 1);
    }
}

let color = 'black';

function nextTurn() {
    if (color === 'black') {
        color = 'white';
    } else {
        color = 'black';
    }
}

function makeMove() {
    if (this.getAttribute('class')) return; // 石が重なる
    this.setAttribute('class', color);
    nextTurn();
}
