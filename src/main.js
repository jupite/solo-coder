import * as THREE from 'three';
import { Game } from './game/Game.js';

window.THREE = THREE;

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

window.addEventListener('beforeunload', () => {
  game.destroy();
});
