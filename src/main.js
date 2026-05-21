import * as THREE from 'three';
import { CONFIG, GAME_STATE } from './config.js';
import { SceneManager } from './scene.js';
import { Player } from './player.js';
import { InputManager } from './input.js';
import { CameraController } from './camera.js';
import { WaterSplash } from './water.js';
import { ScoringSystem, ActionLogger } from './scoring.js';
import { UIManager } from './ui.js';

class DivingGame {
  constructor() {
    this.initThreeJS();
    this.initModules();
    this.setupGame();
    this.startLoop();
  }

  initThreeJS() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.getElementById('game-container').appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onResize());
  }

  initModules() {
    this.sceneManager = new SceneManager(this.scene);
    this.player = new Player(this.scene);
    this.ui = new UIManager();
    this.scoringSystem = new ScoringSystem();
    this.actionLogger = new ActionLogger();
    this.waterSplash = new WaterSplash(this.scene);
    this.cameraController = new CameraController(this.camera, this.player);
    this.inputManager = new InputManager(this);
  }

  setupGame() {
    this.state = GAME_STATE.IDLE;
    this.clock = new THREE.Clock();

    const startPos = this.sceneManager.getCliffEdgePosition();
    startPos.y += 1.1;
    this.player.reset(startPos);
  }

  setState(newState) {
    this.state = newState;
  }

  performJump(power) {
    this.setState(GAME_STATE.JUMPING);
    this.player.jump(power);
    this.cameraController.startFollowing();
    this.scoringSystem.reset();
    this.actionLogger.reset();
  }

  checkWaterEntry() {
    if (this.player.hasEnteredWater) return;

    const playerPos = this.player.getPosition();
    const waterY = this.sceneManager.getWaterY();

    if (playerPos.y <= waterY && this.player.isInAir) {
      this.player.hasEnteredWater = true;
      this.setState(GAME_STATE.ENTERED_WATER);

      const verticalAlignment = this.player.getVerticalAlignment();
      const splashPos = playerPos.clone();
      splashPos.y = waterY;
      this.waterSplash.createSplash(splashPos, verticalAlignment);

      const score = this.scoringSystem.calculateFinalScore(verticalAlignment);
      const breakdown = this.scoringSystem.getScoreBreakdown();
      const comment = this.scoringSystem.getComment();
      const grade = this.scoringSystem.getGrade();

      this.ui.showScore(score, breakdown);
      this.ui.showResult(comment, grade);

      this.setState(GAME_STATE.SCORED);
    }
  }

  restart() {
    this.ui.reset();
    this.waterSplash.clearSplash();
    this.scoringSystem.reset();
    this.actionLogger.reset();
    this.inputManager.reset();

    const startPos = this.sceneManager.getCliffEdgePosition();
    startPos.y += 1.1;
    this.player.reset(startPos);

    this.cameraController.resetCamera();
    this.setState(GAME_STATE.IDLE);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(deltaTime) {
    this.inputManager.update(deltaTime);

    if (this.state === GAME_STATE.JUMPING || this.state === GAME_STATE.FALLING) {
      this.player.updatePhysics(deltaTime);

      if (this.player.velocity.y < 0 && this.state === GAME_STATE.JUMPING) {
        this.setState(GAME_STATE.FALLING);
      }

      this.scoringSystem.recordRotation(
        this.player.angularVelocity.x * deltaTime,
        this.player.angularVelocity.z * deltaTime
      );
    }

    this.checkWaterEntry();

    this.cameraController.update(deltaTime, this.state);

    this.waterSplash.update(deltaTime);

    this.sceneManager.updateWaterAnimation(this.clock.elapsedTime);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      const deltaTime = Math.min(this.clock.getDelta(), 0.1);
      this.update(deltaTime);
      this.render();
    };

    animate();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new DivingGame();
});
