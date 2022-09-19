const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
let canvasSize;
let elementsSize;
let mapRowCols;
let playerPosition = {x: undefined, y: undefined};

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize()
{
    if (window.innerWidth > window.innerHeight)
        canvasSize = window.innerHeight * 0.75;
    else
        canvasSize = window.innerWidth * 0.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    elementsSize = canvasSize / 10;
    startGame();
}
function drawEmoji(x, y, emoji)
{
    const posX = elementsSize * (x + 1) + elementsSize * 0.20;
    const posY = elementsSize * (y + 1) - elementsSize * 0.15;
    game.fillText(emoji, posX, posY);
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
function startGame()
{
    game.font = elementsSize + 'px sans-serif';
    game.textAlign = 'end';

    // trim elimina los espacios en blanco al inicio y final de la cadena
    // split separa la cadena por el caracter que se pasa como argumento en un arreglo de cadenas
    const mapRows = maps[0].trim().split('\n');
    mapRowCols = mapRows.map(row => row.trim().split(''));
    drawMap();
    // for (let y=1; y<=10; y++)
    //     for (let x=1; x<=10; x++)
    //         game.fillText(emojis[mapRowCols[y-1][x-1]], elementsSize * x + 4, elementsSize * y - 4);
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

