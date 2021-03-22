const myCells = document.querySelectorAll('td');

let color = 'black';
function nextTurn() {
    if (color === 'black') {
        color = 'white';
    } else {
        color = 'black';
    }
}

for (let i = 0; i < myCells.length; i++) {
    const myCell = myCells[i];
    myCell.onclick = function () {
        if (!myCell.getAttribute('class')) {
            myCell.setAttribute('class', color);
            nextTurn();
        }
    }
}
