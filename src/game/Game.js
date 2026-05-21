import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';
import { Bird } from '../objects/Bird.js';
import { Slingshot } from '../objects/Slingshot.js';
import { Projectile } from '../objects/Projectile.js';
import { ParticleSystem } from '../utils/ParticleSystem.js';
import { CollisionDetector } from '../utils/CollisionDetector.js';
import { TrajectoryPredictor } from '../utils/TrajectoryPredictor.js';
import { CONSTANTS } from './constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.sceneManager = null;
    this.inputManager = null;
    this.uiManager = null;
    
    this.slingshot = null;
    this.projectile = null;
    this.birds = [];
    this.particleSystem = null;
    this.trajectoryPredictor = null;
    
    this.score = 0;
    this.timeLeft = CONSTANTS.GAME_DURATION;
    this.isPlaying = false;
    this.canShoot = true;
    
    this.clock = new THREE.Clock();
    this.lastTime = 0;
  }

  init() {
    this.sceneManager = new SceneManager(this.canvas);
    this.sceneManager.init();
    
    this.uiManager = new UIManager();
    this.uiManager.init(
      () => this.start(),
      () => this.restart()
    );
    
    this.slingshot = new Slingshot(
      this.sceneManager.scene,
      new THREE.Vector3(-8, 0, 6)
    );
    
    this.projectile = new Projectile(this.sceneManager.scene);
    
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    
    this.trajectoryPredictor = new TrajectoryPredictor(this.sceneManager.scene);
    
    this.inputManager = new InputManager(
      this.sceneManager.camera,
      this.slingshot
    );
    
    this.inputManager.onMouseDown = (pos) => this.handleMouseDown(pos);
    this.inputManager.onMouseMove = (pos) => this.handleMouseMove(pos);
    this.inputManager.onMouseUp = (pos, velocity) => this.handleMouseUp(pos, velocity);
    
    this.spawnBirds();
    
    this.animate();
  }

  spawnBirds() {
    const availableBranches = this.sceneManager.getAvailableBranches();
    
    for (let i = 0; i < Math.min(CONSTANTS.BIRD_COUNT, availableBranches.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableBranches.length);
      const branch = availableBranches.splice(randomIndex, 1)[0];
      
      const bird = new Bird(
        this.sceneManager.scene,
        branch.position,
        i
      );
      
      this.birds.push(bird);
      this.sceneManager.setBranchOccupied(branch.position, true);
    }
  }

  respawnBird(bird) {
    const availableBranches = this.sceneManager.getAvailableBranches();
    
    if (availableBranches.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableBranches.length);
      const branch = availableBranches[randomIndex];
      
      bird.respawn(branch.position);
      this.sceneManager.setBranchOccupied(branch.position, true);
    }
  }

  start() {
    this.isPlaying = true;
    this.canShoot = true;
    this.timeLeft = CONSTANTS.GAME_DURATION;
    this.score = 0;
    this.uiManager.reset();
  }

  restart() {
    this.birds.forEach(bird => bird.dispose());
    this.birds = [];
    
    this.sceneManager.treeBranches.forEach(branch => {
      branch.hasBird = false;
    });
    
    this.projectile.reset();
    this.slingshot.resetRubberBand();
    this.slingshot.showPouch(true);
    this.trajectoryPredictor.hide();
    
    this.spawnBirds();
    this.start();
  }

  handleMouseDown(pos) {
    if (!this.isPlaying || !this.canShoot) return;
    
    this.slingshot.updateRubberBand(pos);
    this.trajectoryPredictor.show();
  }

  handleMouseMove(pos) {
    if (!this.isPlaying || !this.canShoot) return;
    
    const actualPos = this.slingshot.updateRubberBand(pos);
    const velocity = this.inputManager.calculateVelocity();
    
    this.trajectoryPredictor.predict(actualPos, velocity);
  }

  handleMouseUp(pos, velocity) {
    if (!this.isPlaying || !this.canShoot) return;
    
    if (velocity.length() > 1) {
      this.shoot(pos, velocity);
    } else {
      this.slingshot.resetRubberBand();
      this.trajectoryPredictor.hide();
    }
  }

  shoot(startPosition, velocity) {
    this.canShoot = false;
    
    this.projectile.clearAllTrails();
    this.projectile.launch(startPosition, velocity);
    
    this.slingshot.showPouch(false);
    this.slingshot.resetRubberBand();
    this.trajectoryPredictor.hide();
  }

  handleBirdHit(bird) {
    this.sceneManager.setBranchOccupied(bird.position, false);
    bird.hit();
    
    this.particleSystem.spawnFeathers(bird.position, bird.colorIndex);
    
    this.projectile.clearAllTrails();
    
    this.score += CONSTANTS.SCORE_PER_HIT;
    this.uiManager.updateScore(this.score);
    
    setTimeout(() => {
      this.respawnBird(bird);
    }, 1000);
  }

  gameOver() {
    this.isPlaying = false;
    this.uiManager.showGameOverModal(this.score);
  }

  update(delta) {
    this.birds.forEach(bird => bird.update(delta));
    
    if (this.projectile.isActive) {
      this.projectile.update(delta);
      
      const hitBird = CollisionDetector.checkProjectileBirds(
        this.projectile,
        this.birds
      );
      
      if (hitBird) {
        this.handleBirdHit(hitBird);
        this.projectile.reset();
      }
      
      if (!this.projectile.isActive) {
        this.canShoot = true;
        this.slingshot.showPouch(true);
      }
    }
    
    this.particleSystem.update(delta);
    
    if (this.isPlaying) {
      this.timeLeft -= delta;
      this.uiManager.updateTimer(this.timeLeft);
      
      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    
    this.sceneManager.render();
  }

  dispose() {
    this.inputManager.dispose();
    this.slingshot.dispose();
    this.projectile.dispose();
    this.birds.forEach(bird => bird.dispose());
    this.particleSystem.dispose();
    this.trajectoryPredictor.dispose();
  }
}
