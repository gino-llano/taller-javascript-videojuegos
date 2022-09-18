const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

window.addEventListener('load', startGame);

function startGame()
{
    let canvasSize;
    if (window.innerWidth > window.innerHeight)
        canvasSize = window.innerHeight * 0.75;
    else
        canvasSize = window.innerWidth * 0.75;
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    
    const elementsSize = canvasSize / 10;
    game.font = elementsSize + 'px sans-serif';
    game.textAlign = 'end';
    for (let i=1; i<=10; i++)
    {
        game.fillText(emojis['X'], elementsSize * i, elementsSize);
    }

}