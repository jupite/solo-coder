import { SceneManager } from './core/SceneManager.js';
import { PhysicsEngine } from './core/PhysicsEngine.js';
import { InputController } from './core/InputController.js';
import { UIManager } from './core/UIManager.js';
import { Platform } from './game/Platform.js';
import { Ball } from './game/Ball.js';
import { GameLogic } from './game/GameLogic.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.isRunning = false;
    this.animationId = null;
    
    this.init();
  }

  init() {
    this.sceneManager = new SceneManager(this.container);
    this.physicsEngine = new PhysicsEngine();
    this.inputController = new InputController();
    this.uiManager = new UIManager();
    
    this.platform = new Platform(this.sceneManager, this.physicsEngine);
    this.ball = new Ball(this.sceneManager, this.physicsEngine);
    this.gameLogic = new GameLogic(
      this.sceneManager,
      this.ball,
      this.platform,
      this.uiManager
    );
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  animate() {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    const deltaTime = this.sceneManager.getDelta();

    this.inputController.update();
    const tilt = this.inputController.getTiltRadians();
    
    if (this.gameLogic.isGameActive()) {
      this.platform.updateTilt(tilt.x, tilt.y);
    }

    this.physicsEngine.update(deltaTime);

    this.ball.update();

    this.gameLogic.update();

    const ballPos = this.ball.getPosition();
    this.sceneManager.updateCameraTarget(ballPos.x, ballPos.z);

    const tiltDeg = this.inputController.getTiltDegrees();
    this.uiManager.updateAngles(tiltDeg.x, tiltDeg.y);

    this.sceneManager.render();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  dispose() {
    this.stop();
    this.gameLogic.dispose();
    this.physicsEngine.dispose();
    this.sceneManager.dispose();
    this.uiManager.dispose();
  }
}
