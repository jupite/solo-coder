import * as THREE from 'three';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { BowlingAlley } from './scenes/BowlingAlley.js';
import { BowlingBall } from './objects/BowlingBall.js';
import { BowlingPins } from './objects/BowlingPins.js';
import { FollowCamera } from './cameras/FollowCamera.js';
import { Scoreboard } from './ui/Scoreboard.js';
import { GameUI } from './ui/GameUI.js';

class BowlingGame {
  constructor(container) {
    this.container = container;
    
    this.scene = null;
    this.renderer = null;
    this.physics = null;
    this.alley = null;
    this.ball = null;
    this.pins = null;
    this.camera = null;
    this.scoreboard = null;
    this.gameUI = null;
    
    this.clock = new THREE.Clock();
    this.isDragging = false;
    this.dragStart = new THREE.Vector2();
    this.dragEnd = new THREE.Vector2();
    this.lastKnockedCount = 0;
    this.isPaused = false;
    this.pauseTimer = null;
    
    this.init();
  }

  init() {
    this.createScene();
    this.createRenderer();
    this.setupLighting();
    this.initPhysics();
    this.createAlley();
    this.createPins();
    this.createBall();
    this.initCamera();
    this.initUI();
    this.setupEventListeners();
    
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(10, 5, -10);
    this.scene.add(fillLight);
  }

  initPhysics() {
    this.physics = new PhysicsEngine();
  }

  createAlley() {
    this.alley = new BowlingAlley(this.scene, this.physics);
  }

  createPins() {
    const pinsPosition = this.alley.getPinsPosition();
    this.pins = new BowlingPins(this.scene, this.physics, pinsPosition);
  }

  createBall() {
    const ballPosition = this.alley.getBallStartPosition();
    this.ball = new BowlingBall(this.scene, this.physics, ballPosition);
  }

  initCamera() {
    this.camera = new FollowCamera(this.scene, this.container, this.ball);
  }

  initUI() {
    this.scoreboard = new Scoreboard(this.container);
    this.gameUI = new GameUI(this.container);
    
    this.gameUI.setOnResetPins(() => this.resetPins());
    this.gameUI.setOnResetGame(() => this.resetGame());
    this.gameUI.enableResetPins(false);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    
    this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
    
    this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.renderer.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }

  onWindowResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  onMouseDown(e) {
    if (this.isPaused || this.ball.isLaunched) return;
    
    this.isDragging = true;
    this.dragStart.set(e.clientX, e.clientY);
  }

  onMouseMove(e) {
    if (!this.isDragging || this.isPaused || this.ball.isLaunched) return;
    
    this.dragEnd.set(e.clientX, e.clientY);
    this.updateTrail();
  }

  onMouseUp(e) {
    if (!this.isDragging || this.isPaused || this.ball.isLaunched) return;
    
    this.isDragging = false;
    this.launchBall();
  }

  onTouchStart(e) {
    e.preventDefault();
    if (this.isPaused || this.ball.isLaunched) return;
    
    const touch = e.touches[0];
    this.isDragging = true;
    this.dragStart.set(touch.clientX, touch.clientY);
  }

  onTouchMove(e) {
    e.preventDefault();
    if (!this.isDragging || this.isPaused || this.ball.isLaunched) return;
    
    const touch = e.touches[0];
    this.dragEnd.set(touch.clientX, touch.clientY);
    this.updateTrail();
  }

  onTouchEnd(e) {
    e.preventDefault();
    if (!this.isDragging || this.isPaused || this.ball.isLaunched) return;
    
    this.isDragging = false;
    this.launchBall();
  }

  updateTrail() {
    const start = new THREE.Vector3();
    start.copy(this.ball.getPosition());
    
    const deltaX = this.dragStart.x - this.dragEnd.x;
    const deltaY = this.dragStart.y - this.dragEnd.y;
    
    const strength = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 10;
    const maxStrength = 15;
    const clampedStrength = Math.min(strength, maxStrength);
    
    const end = new THREE.Vector3(
      start.x + clampedStrength,
      start.y + 0.5,
      start.z + (deltaY / window.innerWidth) * 5
    );
    
    this.ball.showTrail(start, end);
  }

  launchBall() {
    const deltaX = this.dragStart.x - this.dragEnd.x;
    const deltaY = this.dragStart.y - this.dragEnd.y;
    
    const strength = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 8;
    const maxStrength = 25;
    const clampedStrength = Math.min(strength, maxStrength);
    
    const forceX = clampedStrength;
    const forceZ = (deltaY / window.innerHeight) * 10;
    const forceY = 2;
    
    const force = new THREE.Vector3(forceX, forceY, forceZ);
    
    this.ball.launch(force);
    this.gameUI.enableResetPins(true);
    
    this.startPauseTimer();
  }

  startPauseTimer() {
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    
    this.pauseTimer = setTimeout(() => {
      this.checkPinsAndScore();
    }, 4000);
  }

  checkPinsAndScore() {
    const knockedDown = this.pins.getKnockedDownCount();
    const isStrike = knockedDown === 10;
    
    if (knockedDown > this.lastKnockedCount) {
      this.scoreboard.addScore(knockedDown, isStrike);
      this.lastKnockedCount = knockedDown;
      
      if (isStrike) {
        this.gameUI.showMessage('STRIKE!', '#FFD700');
        setTimeout(() => {
          this.nextFrame();
        }, 1500);
      } else {
        this.gameUI.showMessage(`${knockedDown} 个球瓶!`, '#FFFFFF');
      }
    }
  }

  resetPins() {
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    
    this.pins.reset();
    this.ball.reset(this.alley.getBallStartPosition());
    this.gameUI.enableResetPins(false);
    
    const remainingPins = this.pins.getRemainingPins();
    if (remainingPins === 0) {
      this.nextFrame();
    }
  }

  nextFrame() {
    this.scoreboard.nextFrame();
    this.pins.reset();
    this.ball.reset(this.alley.getBallStartPosition());
    this.gameUI.enableResetPins(false);
    this.lastKnockedCount = 0;
    
    if (this.scoreboard.isGameOver()) {
      this.endGame();
    }
  }

  resetGame() {
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    
    this.scoreboard.reset();
    this.pins.reset();
    this.ball.reset(this.alley.getBallStartPosition());
    this.gameUI.enableResetPins(false);
    this.lastKnockedCount = 0;
    this.isPaused = false;
  }

  endGame() {
    this.isPaused = true;
    const finalScore = this.scoreboard.getTotalScore();
    
    let message = `\u6E38\u620F\u7ED3\u675F!\n\u6700\u7EC8\u5F97\u5206: ${finalScore}`;
    let color = '#FFFFFF';
    
    if (finalScore === 300) {
      message = 'PERFECT GAME!\n300分!';
      color = '#FFD700';
    } else if (finalScore >= 200) {
      color = '#00FF00';
    } else if (finalScore >= 100) {
      color = '#00FFFF';
    }
    
    this.gameUI.showMessage(message, color);
  }

  update() {
    const deltaTime = this.clock.getDelta();
    
    this.physics.step(deltaTime);
    
    if (this.ball) {
      this.ball.update();
      this.checkBallBoundary();
    }
    
    if (this.pins) {
      this.pins.update();
    }
    
    if (this.camera && !this.isPaused) {
      this.camera.update();
    }
  }

  checkBallBoundary() {
    if (!this.ball || !this.ball.isLaunched) return;
    
    const pos = this.ball.getPosition();
    const alleyWidth = this.alley ? this.alley.alleyWidth : 1.0668;
    const alleyLength = this.alley ? this.alley.alleyLength : 18.288;
    
    const isOutOfBounds = 
      Math.abs(pos.z) > alleyWidth / 2 + 0.3 ||
      pos.x > alleyLength / 2 + 1 ||
      pos.x < -alleyLength / 2 - 1 ||
      pos.y < -1;
    
    if (isOutOfBounds) {
      this.stopBall();
    }
  }

  stopBall() {
    if (!this.ball || !this.ball.physicsBody) return;
    
    this.ball.physicsBody.velocity.set(0, 0, 0);
    this.ball.physicsBody.angularVelocity.set(0, 0, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.update();
    this.renderer.render(this.scene, this.camera.getCamera());
  }

  dispose() {
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    
    window.removeEventListener('resize', () => this.onWindowResize());
    
    if (this.ball) this.ball.dispose();
    if (this.pins) this.pins.dispose();
    if (this.alley) this.alley.dispose();
    if (this.camera) this.camera.dispose();
    if (this.scoreboard) this.scoreboard.dispose();
    if (this.gameUI) this.gameUI.dispose();
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}

export { BowlingGame };
