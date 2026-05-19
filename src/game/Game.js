import { SceneManager } from './Scene.js';
import { Terrain } from './Terrain.js';
import { Player } from './Player.js';
import { RingSystem } from './Rings.js';
import { FollowCamera } from './Camera.js';
import { InputManager } from './Input.js';
import { UIManager } from './UI.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.sceneManager = null;
    this.terrain = null;
    this.player = null;
    this.ringSystem = null;
    this.followCamera = null;
    this.input = null;
    this.ui = null;

    this.score = 0;
    this.energy = 100;
    this.maxEnergy = 100;
    this.energyDrainRate = 8;
    this.energyPerRing = 25;
    this.scorePerRing = 10;

    this.isPlaying = true;
    this.isGameOver = false;
    this.animationId = null;
  }

  init() {
    this.sceneManager = new SceneManager(this.canvas);
    this.sceneManager.init();

    this.terrain = new Terrain(this.sceneManager.scene);
    this.terrain.generate();

    const startPos = this.terrain.getStartPosition();
    this.player = new Player(this.sceneManager.scene, startPos);

    this.ringSystem = new RingSystem(this.sceneManager.scene);
    this.ringSystem.init(this.terrain, startPos);

    this.followCamera = new FollowCamera(this.sceneManager.camera);
    this.followCamera.reset(this.player);

    this.input = new InputManager();
    this.input.requestPointerLock(this.canvas);

    this.ui = new UIManager();
    this.ui.onRestart(() => this.restart());

    this.ui.updateScore(this.score);
    this.ui.updateEnergy(this.energy);

    this.start();
  }

  start() {
    this.isPlaying = true;
    this.isGameOver = false;
    this.animate();
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.sceneManager.getDelta(), 0.1);

    if (this.isPlaying && !this.isGameOver) {
      this.update(dt);
    }

    this.sceneManager.render();
  }

  update(dt) {
    this.input.update();

    this.player.update(this.input, dt, this.terrain);

    this.followCamera.update(this.player, dt);

    this.ringSystem.update(dt, this.player.position, this.player.velocity);

    const collected = this.ringSystem.checkCollision(this.player.position, this.player.velocity);
    if (collected > 0) {
      this.score += collected * this.scorePerRing;
      this.energy = Math.min(this.maxEnergy, this.energy + collected * this.energyPerRing);
      this.ui.updateScore(this.score);
      this.ui.updateEnergy(this.energy);
    }

    this.energy -= this.energyDrainRate * dt;
    this.ui.updateEnergy(this.energy);

    if (this.energy <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.isPlaying = false;
    this.ui.showGameOver(this.score);
  }

  restart() {
    this.ui.hideGameOver();

    this.score = 0;
    this.energy = this.maxEnergy;
    this.ui.updateScore(this.score);
    this.ui.updateEnergy(this.energy);

    const startPos = this.terrain.getStartPosition();
    this.player.reset(startPos);
    this.ringSystem.reset(startPos, this.terrain);
    this.followCamera.reset(this.player);
    this.input.reset();

    this.isPlaying = true;
    this.isGameOver = false;
  }
}
