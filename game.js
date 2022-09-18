const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

window.addEventListener('load', startGame);

function startGame()
{
    // game.fillRect(0,50,100,100);

    game.font = '25px Verdana';
    game.fillStyle = 'purple';
    game.textAlign = 'center';
    game.fillText('Platzi', 25, 25);

}