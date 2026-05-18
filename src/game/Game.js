import * as THREE from 'three';
import { GameScene } from './Scene.js';
import { Paddle } from './Paddle.js';
import { BallManager } from './BallManager.js';
import { BrickManager } from './Brick.js';
import { InputManager } from '../utils/Input.js';
import { HUD } from '../ui/HUD.js';
import { CameraController } from './CameraController.js';
import { PowerUpManager } from './PowerUp.js';
import { LevelSelect } from '../ui/LevelSelect.js';
import { getLevelById, levels } from './levels.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new GameScene(canvas);
    this.cameraController = new CameraController(this.scene.camera, canvas);
    this.input = new InputManager();
    this.hud = new HUD();
    this.levelSelect = new LevelSelect();
    this.bounds = this.scene.getBounds();

    this.paddle = new Paddle(this.scene.scene, this.bounds);
    this.ballManager = new BallManager(this.scene.scene, this.bounds);
    this.brickManager = new BrickManager(this.scene.scene);
    this.powerUpManager = new PowerUpManager(this.scene.scene);

    this.currentLevel = levels[0];
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.scorePerBrick = 10;
    this.speedIncreasePerBrick = 0.05;
    this.baseBallSpeed = 1;

    this.clock = null;
    this.animationId = null;

    this.setupEventListeners();
    this.hideCameraHintAfterDelay();
  }

  setupEventListeners() {
    this.hud.onStart(() => this.start(this.currentLevel));
    this.hud.onRestart(() => this.restart());
    this.hud.onLevelSelect(() => this.showLevelSelect());
    this.hud.onBackToMenu(() => this.backToMenu());

    this.levelSelect.onLevelSelect((levelId) => {
      this.currentLevel = getLevelById(levelId);
      this.levelSelect.hide();
      this.start(this.currentLevel);
    });

    this.levelSelect.onBack(() => {
      this.levelSelect.hide();
      this.hud.showStartScreen();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isRunning && !this.isGameOver) {
        this.ballManager.launchAll();
      }
    });
  }

  hideCameraHintAfterDelay() {
    setTimeout(() => {
      const hint = document.getElementById('camera-hint');
      if (hint) {
        hint.classList.add('fade-out');
      }
    }, 5000);
  }

  showLevelSelect() {
    this.hud.hideStartScreen();
    this.levelSelect.show();
  }

  backToMenu() {
    this.stop();
    this.hud.hideGameOverScreen();
    this.hud.showStartScreen();
    this.cameraController.reset();
  }

  start(level) {
    this.hud.hideStartScreen();
    this.hud.hideGameOverScreen();
    this.hud.setLevelInfo(level.name);

    this.paddle.reset();
    this.paddle.setWidth(3);
    this.ballManager.reset();
    this.brickManager.createBricksFromLayout(level.layout);
    this.powerUpManager.clear();
    this.hud.reset();

    this.baseBallSpeed = 1;
    this.isRunning = true;
    this.isGameOver = false;
    this.clock = new THREE.Clock();

    this.gameLoop();
  }

  restart() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.start(this.currentLevel);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
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
    const movement = this.cameraController.getScreenMovementDirection(input);

    this.paddle.update(deltaTime, movement);
    this.ballManager.update(deltaTime, this.paddle);
    this.brickManager.update(deltaTime);
    this.powerUpManager.update(deltaTime, this.paddle, this);

    this.hud.updateActiveEffects(this.powerUpManager.getActiveEffects());

    const mainBall = this.ballManager.getMainBall();
    if (mainBall && mainBall.isLaunched) {
      this.ballManager.checkPaddleCollisions(this.paddle);

      const hitBrick = this.ballManager.checkBrickCollisions(this.brickManager);
      if (hitBrick) {
        this.onBrickHit(hitBrick);
      }

      if (this.ballManager.removeOutOfBoundsBalls()) {
        if (!this.ballManager.hasActiveBalls()) {
          this.onBallLost();
        }
      }
    }

    this.checkWinCondition();
  }

  onBrickHit(brick) {
    this.hud.addScore(this.scorePerBrick);

    this.powerUpManager.tryDropPowerUp({ ...brick.position });

    const newSpeed = this.baseBallSpeed + (this.hud.score / this.scorePerBrick) * this.speedIncreasePerBrick;
    this.ballManager.getAllBalls().forEach(ball => {
      ball.setSpeedMultiplier(newSpeed);
    });
    this.hud.setSpeed(newSpeed);
  }

  onBallLost() {
    this.hud.loseLife();

    if (this.hud.lives <= 0) {
      this.gameOver(false);
    } else {
      this.ballManager.reset();
      this.paddle.reset();
      this.paddle.setWidth(3);
      this.powerUpManager.clear();
    }
  }

  checkWinCondition() {
    if (this.brickManager.getRemainingBricks() === 0 && this.isRunning) {
      this.gameOver(true);
    }
  }

  gameOver(isWin) {
    this.isGameOver = true;
    this.ballManager.reset();
    this.hud.showGameOverScreen(isWin, this.hud.score);
  }

  spawnExtraBalls(count) {
    const mainBall = this.ballManager.getMainBall();
    if (mainBall) {
      this.ballManager.spawnExtraBalls(count, mainBall);
    }
  }

  setGlobalSpeedMultiplier(multiplier) {
    this.ballManager.setGlobalSpeedMultiplier(multiplier);
  }

  setPaddleWidth(width) {
    this.paddle.setWidth(width);
  }

  destroy() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.paddle.destroy();
    this.ballManager.destroy();
    this.brickManager.clearBricks();
    this.powerUpManager.clear();
  }
}
