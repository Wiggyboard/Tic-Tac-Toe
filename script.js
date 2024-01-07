const symbols = document.getElementsByClassName('symbol');
const squares = document.getElementsByClassName('square');
const winStates = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
];
let winStateIndex = null;
let xPositions = [];
let oPositions = [];
let blankPositions = [];
let nextO = null;
let wins = 0;
let draws = 0;
let losses = 0
let passNPlayXWins = 0;
let passNPlayDraws = 0;
let passNPlayOWins = 0;
let oStart = false;
let passNPlay = false
let oTurn = false;

// Places an X on the clicked square, else places an O if pass & play is on and first turn is set to O
function placeX(event) {
    if (oTurn === false) {
        let square = event.currentTarget;
        square.querySelector('.symbol').setAttribute('src', 'images/x.svg');
        square.setAttribute('onclick', '');
        xPositions.push(parseInt(square.id));
        checkXWin();
    }
    else if (passNPlay === true && oTurn === true) {
        let square = event.currentTarget;
        square.querySelector('.symbol').setAttribute('src', 'images/o.svg');
        square.setAttribute('onclick', '');
        oPositions.push(parseInt(square.id));
        document.getElementById('status').innerText = 'X\'S TURN';
        document.getElementById('status').style.color = 'var(--VistaBlue)';
        oTurn = false;
        checkOWin();
    }
}

// Checks for an X victory or a draw
function checkXWin() {
    const xWin = winStates.find(combination => combination.every(position => xPositions.includes(position)));

    // Checks for an X victory or a draw, else turn passes to O
    if (xWin) {
        if (passNPlay === false) {
            wins++;
            document.getElementById('wins').innerText = wins;
        }
        else {
            passNPlayXWins++;
            document.getElementById('wins').innerText = passNPlayXWins;
        }

        document.getElementById('status').innerText = 'X WINS!';
        document.getElementById('status').style.color = 'var(--VistaBlue)';
        winStateIndex = winStates.indexOf(xWin);
        document.getElementById('line-' + (winStateIndex + 1)).style.display = 'block';
        document.getElementById('line-' + (winStateIndex + 1)).style.background = 'var(--VistaBlue)';

        for (const square of squares) {
            square.setAttribute('onclick', '');
        }
    }
    else if (xPositions.length === 5 || oPositions.length === 5) {
        if (passNPlay === false) {
            draws++;
            document.getElementById('draws').innerText = draws;
        }
        else {
            passNPlayDraws++;
            document.getElementById('draws').innerText = passNPlayDraws;
        }

        document.getElementById('status').innerText = 'DRAW!';
        document.getElementById('status').style.color = 'white';

        for (i = 0; i < xPositions.length; i++) {
            document.getElementById(xPositions[i].toString()).querySelector('.symbol').setAttribute('src', 'images/xDraw.svg');
        }

        for (i = 0; i < oPositions.length; i++) {
            document.getElementById(oPositions[i].toString()).querySelector('.symbol').setAttribute('src', 'images/oDraw.svg');
        }

        for (const square of squares) {
            square.setAttribute('onclick', '');
        }
    }
    else {
        document.getElementById('status').innerText = 'O\'S TURN';
        document.getElementById('status').style.color = 'var(--AtomicTangerine)';

        if (passNPlay === false) {
            for (const square of squares) {
                square.setAttribute('onclick', '');
            }

            setTimeout(function () {
                determineNextO();
            }, 800);
        }
        else if (passNPlay === true) {
            oTurn = true;
        }
    }
}

// Determines if the next O should be random, win, defend, or set up
function determineNextO() {
    let possibleOWinState = null;
    let possibleOWinStates = [];
    let possibleNextO;

    // Determines if the next O should be random, winning, or neither
    for (const combination of winStates) {
        const xCount = combination.filter(position => xPositions.includes(position)).length;
        const oCount = combination.filter(position => oPositions.includes(position)).length;

        if (xPositions.length === 1 && !oStart) {
            possibleOWinState = 0;
            break;
        }
        else if (xCount === 0 && oCount === 2) {
            possibleOWinStates.push(combination)
            possibleOWinState = possibleOWinStates[Math.floor(Math.random() * possibleOWinStates.length)];
            possibleNextO = possibleOWinState.filter(position => !oPositions.includes(position));
        }
    }

    // Places O as random or winning based on prior determination, else determines if O should defend
    if (possibleOWinState !== null) {
        if (possibleOWinState === 0) {
            randomO();
        }
        else {
            nextO = possibleNextO[0];
            placeO();
        }
    }
    else {
        for (const combination of winStates) {
            const xCount = combination.filter(position => xPositions.includes(position)).length;
            const oCount = combination.filter(position => oPositions.includes(position)).length;

            if (xCount === 2 && oCount === 0) {
                possibleOWinStates.push(combination)
                possibleOWinState = possibleOWinStates[Math.floor(Math.random() * possibleOWinStates.length)];
                possibleNextO = possibleOWinState.filter(position => !xPositions.includes(position));
            }
        }

        // Places a defensive O based on prior determination, else determines position to set up O
        if (possibleOWinState !== null) {
            nextO = possibleNextO[0];
            placeO();
        }
        else {
            for (const combination of winStates) {
                const xCount = combination.filter(position => xPositions.includes(position)).length;
                const oCount = combination.filter(position => oPositions.includes(position)).length;

                if (xCount === 0 && oCount === 1) {
                    possibleOWinStates.push(combination)
                    possibleOWinState = possibleOWinStates[Math.floor(Math.random() * possibleOWinStates.length)];
                    possibleNextO = possibleOWinState.filter(position => !oPositions.includes(position));
                }
            }

            // Places O to set up for a win as previously determined, else places random O
            if (possibleOWinState !== null) {
                nextO = possibleNextO[Math.floor(Math.random() * 2)];
                placeO();
            }
            else {
                randomO();
            }
        }
    }
}

// Places an O randomly on the grid
function randomO() {
    nextO = Math.floor(Math.random() * 9) + 1;
    if (xPositions.includes(nextO) || oPositions.includes(nextO)) {
        randomO();
    }
    else {
        placeO();
    }
}

// Places an O on the grid as previously determined and pushes to oPositions array
function placeO() {
    let square = document.getElementById(nextO.toString());
    square.querySelector('.symbol').setAttribute('src', 'images/o.svg');
    square.setAttribute('onclick', '');
    oPositions.push(parseInt(square.id));
    document.getElementById('status').innerText = 'YOUR TURN';
    document.getElementById('status').style.color = 'var(--VistaBlue)';
    checkOWin();
}

// Checks for an O victory or a potential draw, else re-enable onClick of blank squares
function checkOWin() {
    const oWin = winStates.find(combination => combination.every(position => oPositions.includes(position)));

    if (oWin) {
        if (passNPlay === false) {
            losses++;
            document.getElementById('losses').innerText = losses;
        }
        else {
            passNPlayOWins++;
            document.getElementById('losses').innerText = passNPlayOWins;
        }

        document.getElementById('status').innerText = 'O WINS!';
        document.getElementById('status').style.color = 'var(--AtomicTangerine)';
        winStateIndex = winStates.indexOf(oWin);
        document.getElementById('line-' + (winStateIndex + 1)).style.display = 'block';
        document.getElementById('line-' + (winStateIndex + 1)).style.background = 'var(--AtomicTangerine)';

        for (const square of squares) {
            square.setAttribute('onclick', '');
        }
    }
    else if (oPositions.length === 5) {
        checkXWin();
    }
    else {
        for (const symbol of symbols) {
            if (symbol.getAttribute('src') === '') {
                blankPositions.push(symbol.parentNode.id)
            }
        }

        for (i = 0; i < blankPositions.length; i++) {
            document.getElementById(blankPositions[i].toString()).setAttribute('onclick', 'placeX(event)');
        }

        blankPositions = [];
    }
}

// Resets the game
function reset() {
    document.getElementById('status').innerText = 'YOUR TURN';
    document.getElementById('status').style.color = 'var(--VistaBlue)';
    document.getElementById('reset-icon').style.animation = 'rotate 0.5s linear';
    setTimeout(function () {
        document.getElementById('reset-icon').style.animation = 'none';
    }, 500);

    if (winStateIndex !== null) {
        document.getElementById('line-' + (winStateIndex + 1)).style.display = 'none';
    }

    for (const symbol of symbols) {
        const newImg = document.createElement('img');
        newImg.classList.add('symbol');
        newImg.setAttribute('src', '');
        symbol.parentNode.replaceChild(newImg, symbol);
    }

    for (const square of squares) {
        square.setAttribute('onclick', 'placeX(event)');
    }

    xPositions = [];
    oPositions = [];
    blankPositions = [];
    nextO = null;
    winStateIndex = null;
    oTurn = false;

    if (passNPlay === false && oStart) {
        checkXWin();
    }

    else if (passNPlay === true && oStart) {
        document.getElementById('status').innerText = 'O\'S TURN';
        document.getElementById('status').style.color = 'var(--AtomicTangerine)';
        oTurn = true;
    }
    else if (passNPlay === true && oStart === false) {
        document.getElementById('status').innerText = 'X\'S TURN';
    }
}

// Toggles oStart
function toggleOStart() {
    document.getElementById('toggle-switch').style.animation = 'toggleRight 0.1s linear forwards';
    document.getElementById('toggle').setAttribute('onclick', 'toggleXStart()');
    setTimeout(function () {
        document.getElementById('toggle-switch').style.animation = 'none';
        document.getElementById('toggle-switch').style.transform = 'translateX(3rem)';
    }, 100);
    oStart = true;
    reset();
}

// Toggles xStart
function toggleXStart() {
    document.getElementById('toggle-switch').style.animation = 'toggleLeft 0.1s linear forwards';
    document.getElementById('toggle').setAttribute('onclick', 'toggleOStart()');
    setTimeout(function () {
        document.getElementById('toggle-switch').style.animation = 'none';
        document.getElementById('toggle-switch').style.transform = 'translateX(0rem)';
    }, 100);
    oStart = false;
    reset();
}

// Toggles pass & play on
function toggleHuman() {
    document.getElementById('toggle-pnp-switch').style.animation = 'toggleRight 0.1s linear forwards';
    document.getElementById('toggle-pnp').setAttribute('onclick', 'toggleBot()');
    document.getElementById('wins-title').innerText = 'X WINS';
    document.getElementById('losses-title').innerText = 'O WINS';
    document.getElementById('wins-title').style.color = 'var(--VistaBlue)';
    document.getElementById('losses-title').style.color = 'var(--AtomicTangerine)';
    document.getElementById('wins').style.color = 'var(--VistaBlue)';
    document.getElementById('losses').style.color = 'var(--AtomicTangerine)';
    document.getElementById('wins').innerText = passNPlayXWins;
    document.getElementById('draws').innerText = passNPlayDraws;
    document.getElementById('losses').innerText = passNPlayOWins;
    setTimeout(function () {
        document.getElementById('toggle-pnp-switch').style.animation = 'none';
        document.getElementById('toggle-pnp-switch').style.transform = 'translateX(3rem)';
    }, 100);
    passNPlay = true;
    reset();
}

// Toggles pass & play off
function toggleBot() {
    document.getElementById('toggle-pnp-switch').style.animation = 'toggleLeft 0.1s linear forwards';
    document.getElementById('toggle-pnp').setAttribute('onclick', 'toggleHuman()');
    document.getElementById('wins-title').innerText = 'WINS';
    document.getElementById('losses-title').innerText = 'LOSSES';
    document.getElementById('wins-title').style.color = 'white';
    document.getElementById('losses-title').style.color = 'white';
    document.getElementById('wins').style.color = 'white';
    document.getElementById('losses').style.color = 'white';
    document.getElementById('wins').innerText = wins;
    document.getElementById('draws').innerText = draws;
    document.getElementById('losses').innerText = losses;
    setTimeout(function () {
        document.getElementById('toggle-pnp-switch').style.animation = 'none';
        document.getElementById('toggle-pnp-switch').style.transform = 'translateX(0rem)';
    }, 100);
    passNPlay = false;
    reset();
}

// Moves toggles and reset button depending on screen width
function moveOptions() {
    if (window.innerWidth <= 700) {
        document.getElementById('options-bar').appendChild(document.getElementById('toggle-pnp-container'));
        document.getElementById('options-bar').appendChild(document.getElementById('toggle-container'));
        document.getElementById('options-bar').appendChild(document.getElementById('reset'));
    }
    else {
        document.getElementById('status-bar').appendChild(document.getElementById('toggle-pnp-container'));
        document.getElementById('status-bar').appendChild(document.getElementById('toggle-container'));
        document.getElementById('status-bar').appendChild(document.getElementById('reset'));
    }
}

window.addEventListener('resize', moveOptions);

moveOptions();