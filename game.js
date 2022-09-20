const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
let canvasSize;
let elementsSize;
let mapRowCols;
let playerPosition = {x: undefined, y: undefined};
let level = 0;
let lives = 3;
let timeStart;

const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');

window.addEventListener('load', startGame);
window.addEventListener('resize', setCanvasSize);
const timer = setInterval(drawTime, 1000);

function startGame()
{
    timeStart = Date.now();
    drawTime();
    drawLives();
    setCanvasSize();
}
function gameOver()
{
    lives = 3;
    level = 0;
    playerPosition.x = undefined;
    timeStart = Date.now();
    drawTime();
    drawLives();
    setMapRowCols();
    drawMap();
}
function setCanvasSize()
{
    if (window.innerWidth > window.innerHeight)
        canvasSize = window.innerHeight * 0.75;
    else
        canvasSize = window.innerWidth * 0.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    elementsSize = canvasSize / 10;
    game.font = elementsSize + 'px sans-serif';
    game.textAlign = 'end';
    setMapRowCols();
    drawMap();
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
    const timeLeft = 20 - ((Date.now() - timeStart) / 1000).toFixed(0);
    if (timeLeft == 0)  return gameOver();
    spanTime.innerHTML = timeLeft;
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

btnUp.addEventListener('click', () => {movePlayer(0, -1);});
btnLeft.addEventListener('click', () => {movePlayer(-1, 0);});
btnRight.addEventListener('click', () => {movePlayer(1, 0);});
btnDown.addEventListener('click', () => {movePlayer(0, 1);});

window.addEventListener('keydown', moveByKeys);

function positionIsInMap(x, y)
{
    return 0 <= x && x < 10 && 0 <= y && y < 10;
}
function movePlayer(incX, incY)
{
    if (positionIsInMap(playerPosition.x + incX, playerPosition.y + incY))
    {
        playerPosition.x += incX;
        playerPosition.y += incY;
        const emoji = emojis[mapRowCols[playerPosition.y][playerPosition.x]];
        if (emoji == '💣')
        {
            lives--;
            if (lives == 0) return gameOver();
            drawLives();
            playerPosition.x = undefined;
        }   
        else if (emoji == '🎁')
        {
            if (level == maps.length - 1)
            {
                console.log('Terminaste el juego');
                clearInterval(timer);
            }
            else    level++;
            setMapRowCols();
        }
        drawMap();
    }
}
function moveByKeys(event)
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
    }
}

