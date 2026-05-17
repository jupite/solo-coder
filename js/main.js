import { Game } from './Game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

window.addEventListener('resize', () => {
    game.onWindowResize();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    game.restart();
});