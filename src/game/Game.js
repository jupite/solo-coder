import { GameScene } from './Scene.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { BrickManager } from './Brick.js';
import { InputManager } from '../utils/Input.js';
import { HUD } from '../ui/HUD.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new GameScene(canvas);
    this.input = new InputManager();
    this.hud = new HUD();
    this.bounds = this.scene.getBounds();

    this.paddle = new Paddle(this.scene.scene, this.bounds);
    this.ball = new Ball(this.scene.scene, this.bounds);
    this.brickManager = new BrickManager(this.scene.scene);

    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.scorePerBrick = 10;
    this.speedIncreasePerBrick = 0.05;

    this.clock = null;
    this.animationId = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.hud.onStart(() => this.start());
    this.hud.onRestart(() => this.restart());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isRunning && !this.isGameOver) {
        this.ball.launch();
      }
    });
  }

  start() {
    this.hud.hideStartScreen();
    this.hud.hideGameOverScreen();

    this.paddle.reset();
    this.ball.reset();
    this.brickManager.createBricks(4, 4);
    this.hud.reset();

    this.isRunning = true;
    this.isGameOver = false;
    this.clock = new THREE.Clock();

    this.gameLoop();
  }

  restart() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.start();
  }

  gameLoop() {
    if (!this.isRunning) return;

    const deltaTime = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isPaused && !this.isGameOver) {
      this.update(deltaTime);
    }

    this.scene.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    const input = this.input.getMovement();

    this.paddle.update(deltaTime, input);
    this.ball.update(deltaTime, this.paddle);
    this.brickManager.update(deltaTime);

    if (this.ball.isLaunched) {
      if (this.ball.checkPaddleCollision(this.paddle)) {
        this.onPaddleHit();
      }

      if (this.brickManager.checkCollisions(this.ball)) {
        this.onBrickHit();
      }

      if (this.ball.isOutOfBounds()) {
        this.onBallLost();
      }
    }

    this.checkWinCondition();
  }

  onPaddleHit() {
  }

  onBrickHit() {
    this.hud.addScore(this.scorePerBrick);

    const newSpeed = 1 + (this.hud.score / this.scorePerBrick) * this.speedIncreasePerBrick;
    this.ball.setSpeedMultiplier(newSpeed);
    this.hud.setSpeed(newSpeed);
  }

  onBallLost() {
    this.hud.loseLife();

    if (this.hud.lives <= 0) {
      this.gameOver(false);
    } else {
      this.ball.reset();
      this.paddle.reset();
    }
  }

  checkWinCondition() {
    if (this.brickManager.getRemainingBricks() === 0 && this.isRunning) {
      this.gameOver(true);
    }
  }

  gameOver(isWin) {
    this.isGameOver = true;
    this.ball.reset();
    this.hud.showGameOverScreen(isWin, this.hud.score);
  }

  destroy() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.paddle.destroy();
    this.ball.destroy();
    this.brickManager.clearBricks();
  }
}
