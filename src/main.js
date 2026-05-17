import { Game } from './Game.js';
import './style.css';

const container = document.getElementById('game-container');

if (!container) {
  console.error('Game container not found');
} else {
  const game = new Game(container);
  game.start();

  window.addEventListener('beforeunload', () => {
    game.dispose();
  });
}
