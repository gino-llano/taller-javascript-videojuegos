const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
let canvasSize;
let elementsSize;

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
function startGame()
{
    game.font = elementsSize + 'px sans-serif';
    game.textAlign = 'end';

    // trim elimina los espacios en blanco al inicio y final de la cadena
    // split separa la cadena por el caracter que se pasa como argumento en un arreglo de cadenas
    const mapRows = maps[1].trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));

    mapRowCols.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colIndex + 1) + elementsSize * 0.20;
            const posY = elementsSize * (rowIndex + 1) - elementsSize * 0.15;
            game.fillText(emoji, posX, posY);
        })
    });
    
    // for (let y=1; y<=10; y++)
    //     for (let x=1; x<=10; x++)
    //         game.fillText(emojis[mapRowCols[y-1][x-1]], elementsSize * x + 4, elementsSize * y - 4);
}

