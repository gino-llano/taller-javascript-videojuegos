const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
let canvasSize, elementsSize;
let mapRowCols;
let playerPosition = {x: undefined, y: undefined};
let level, lives;
let timeStart, timeLeft, timePause, timer;
let gameState;

const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecordTime = document.querySelector('#record-time');
const newRecordMessage = document.querySelector('#new-record-message');
const endGameMessage = document.querySelector('#end-game-message');
const restartBtn = document.querySelector('#restart');

window.addEventListener('load', startGame);
window.addEventListener('resize', () => {setCanvasSize(); drawMap();});
restartBtn.addEventListener('click', restartGame);

function setMessage(element, message)
{
    element.innerHTML = message;
    message == '' ? element.setAttribute('style', 'margin: 0;') : element.setAttribute('style', 'margin-top: 20px;');
}
function setInitialValues()
{
    playerPosition.x = undefined;
    lives = 3;
    level = 0;
    timeStart = Date.now();
    spanTime.innerHTML = timeGame;
    drawLives();
    setMapRowCols();
    drawMap();
    setMessage(newRecordMessage, '');
    setMessage(endGameMessage, '');
}
function startGame()
{
    setCanvasSize();
    if (localStorage.getItem('recordTime') == null)
        localStorage.setItem('recordTime', 0);
    drawRecordTime();
    setInitialValues();
    gameState = 'START';
}
function restartGame()
{
    setInitialValues();
    restartBtn.classList.add('inactive');
    timer = setInterval(drawTime, 100);
    gameState = 'PLAY';
}
function endGame(message)
{
    if (message == '😎GANASTE😎')   drawRecordTime();
    clearInterval(timer);
    setMessage(endGameMessage, message);
    restartBtn.classList.remove('inactive');
    restartBtn.innerHTML = 'Reiniciar';
    gameState = 'END';
}
function pauseGame()
{
    const e = document.createElement('span');
    if (gameState == 'PLAY')
    {
        timePause = Date.now();
        gameState = 'PAUSE';
        e.setAttribute('style', 'background-image: url("https://cdn-icons-png.flaticon.com/512/5725/5725942.png");');
        btnPause.innerHTML = '';
        btnPause.append(e);
    }
    else if (gameState == 'PAUSE')
    {
        timeStart += (Date.now() - timePause);
        gameState = 'PLAY';
        const e = document.createElement('span');
        e.setAttribute('style', 'background-image: url("https://cdn-icons-png.flaticon.com/512/1214/1214679.png");');
        btnPause.innerHTML = '';
        btnPause.append(e);
    }
}
function setCanvasSize()
{
    if (window.innerWidth > window.innerHeight)
        canvasSize = window.innerHeight * 0.70;
    else
        canvasSize = window.innerWidth * 0.70;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    elementsSize = canvasSize / 10;
    game.font = elementsSize + 'px sans-serif';
    game.textAlign = 'end';
}
function drawEmoji(x, y, emoji)
{
    const posX = elementsSize * (x + 1) + elementsSize * 0.20;
    const posY = elementsSize * (y + 1) - elementsSize * 0.15;
    game.fillText(emoji, posX, posY);
}
function drawLives()
{
    spanLives.innerHTML = emojis['HEART'].repeat(lives);
}
function drawTime()
{
    if (gameState == 'PLAY')
    {
        timeLeft = Number((timeGame- Number(((Date.now() - timeStart) / 1000).toFixed(1))).toFixed(1));
        if (timeLeft <= 0)  endGame('😵PERDISTE😵');
        spanTime.innerHTML = timeLeft;
    }
}
function drawRecordTime()
{
    if (localStorage.getItem('recordTime') < timeLeft)
    {
        localStorage.setItem('recordTime', timeLeft);
        setMessage(newRecordMessage, '✨NUEVO RECORD✨');
    }
    spanRecordTime.innerHTML = localStorage.getItem('recordTime');
}
function drawMap()
{
    game.clearRect(0, 0, canvasSize, canvasSize);
    mapRowCols.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            drawEmoji(colIndex, rowIndex, emojis[col]);
            if (playerPosition.x == undefined && emojis[col] == '🚪')
            {
                playerPosition.x = colIndex;
                playerPosition.y = rowIndex;
            }
        })
    });
    drawEmoji(playerPosition.x, playerPosition.y, emojis['PLAYER']);
    const emoji = emojis[mapRowCols[playerPosition.y][playerPosition.x]];
    if (gameState == 'END' && emoji == '💣')
        drawEmoji(playerPosition.x, playerPosition.y, emojis['BOMB_COLLISION']);
}
function setMapRowCols()
{
    // trim elimina los espacios en blanco al inicio y final de la cadena
    // split separa la cadena por el caracter que se pasa como argumento en un arreglo de cadenas
    const mapRows = maps[level].trim().split('\n');
    mapRowCols = mapRows.map(row => row.trim().split(''));
}

const btnUp = document.querySelector('#up');
const btnRight = document.querySelector('#right');
const btnLeft = document.querySelector('#left');
const btnDown = document.querySelector('#down');
const btnPause = document.querySelector('#pause');

btnUp.addEventListener('click', () => {movePlayer(0, -1);});
btnLeft.addEventListener('click', () => {movePlayer(-1, 0);});
btnRight.addEventListener('click', () => {movePlayer(1, 0);});
btnDown.addEventListener('click', () => {movePlayer(0, 1);});
btnPause.addEventListener('click', pauseGame);

window.addEventListener('keydown', updateGameByKeys);

function positionIsInMap(x, y)
{
    return 0 <= x && x < 10 && 0 <= y && y < 10;
}
function movePlayer(incX, incY)
{
    if (gameState == 'PLAY' && positionIsInMap(playerPosition.x + incX, playerPosition.y + incY))
    {
        playerPosition.x += incX;
        playerPosition.y += incY;
        const emoji = emojis[mapRowCols[playerPosition.y][playerPosition.x]];
        if (emoji == '💣')
        {
            lives--;
            if (lives == 0) endGame('😵PERDISTE😵');
            else playerPosition.x = undefined;
            drawLives();
        }   
        else if (emoji == '🎁')
        {
            if (level == maps.length - 1)
                endGame('😎GANASTE😎');
            else
            {
                level++;
                setMapRowCols();
            }
        }
        drawMap();
    }
}
function updateGameByKeys(event)
{
    switch (event.key)
    {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
        case 'Escape':
            pauseGame();
    }
}

