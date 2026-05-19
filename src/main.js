import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { Tower } from './Tower.js';
import { Projectile } from './Projectile.js';
import { TrajectoryPreview } from './TrajectoryPreview.js';
import { InputController } from './InputController.js';
import { CameraController } from './CameraController.js';
import { GameManager } from './GameManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        
        this.sceneManager = new SceneManager(this.canvas);
        this.physicsWorld = new PhysicsWorld();
        this.gameManager = new GameManager();
        this.cameraController = new CameraController(
            this.sceneManager.camera,
            this.canvas,
            new THREE.Vector3(0, 5, 0)
        );
        
        this.tower = new Tower(this.sceneManager, this.physicsWorld);
        this.projectile = new Projectile(this.sceneManager, this.physicsWorld);
        this.trajectoryPreview = new TrajectoryPreview(this.sceneManager);
        this.inputController = new InputController(this.canvas, this.sceneManager.camera);
        
        this.clock = new THREE.Clock();
        this.scoreCheckTimer = 0;
        this.scoreCheckDelay = 3;
        
        this.setupEventListeners();
        this.buildTower();
        
        this.animate();
    }
    
    setupEventListeners() {
        this.inputController.setOnAimStartCallback(() => {
            if (!this.gameManager.canThrow()) return;
            this.trajectoryPreview.show();
            this.gameManager.showPowerIndicator();
        });
        
        this.inputController.setOnAimUpdateCallback((power, direction, drag) => {
            if (!this.gameManager.canThrow()) return;
            
            const velocity = direction.multiplyScalar(power);
            const startPos = this.projectile.spawnPosition;
            this.trajectoryPreview.update(startPos, velocity);
            
            const normalizedPower = this.inputController.getNormalizedPower();
            this.gameManager.updatePower(normalizedPower);
        });
        
        this.inputController.setOnAimEndCallback((power, direction) => {
            if (!this.gameManager.canThrow()) {
                this.trajectoryPreview.hide();
                this.gameManager.hidePowerIndicator();
                return;
            }
            
            this.trajectoryPreview.hide();
            this.gameManager.hidePowerIndicator();
            
            const velocity = direction.multiplyScalar(power);
            this.throwProjectile(velocity);
        });
        
        this.projectile.setOnLandCallback(() => {
            this.startScoreCountdown();
        });
        
        this.gameManager.setOnRestartCallback(() => {
            this.resetGame();
        });
    }
    
    buildTower() {
        this.tower.build(0, 0, 8);
    }
    
    throwProjectile(velocity) {
        this.gameManager.useThrow();
        this.projectile.launch(velocity);
    }
    
    startScoreCountdown() {
        this.scoreCheckTimer = this.scoreCheckDelay;
    }
    
    updateScoreCountdown(deltaTime) {
        if (this.scoreCheckTimer > 0) {
            this.scoreCheckTimer -= deltaTime;
            
            if (this.scoreCheckTimer <= 0) {
                const fallenBlocks = this.tower.countFallenBlocks();
                if (fallenBlocks > 0) {
                    this.gameManager.addScore(fallenBlocks);
                }
                this.gameManager.completeThrow();
                
                if (!this.gameManager.isGameOver) {
                    this.projectile.reset();
                }
            }
        }
    }
    
    resetGame() {
        this.tower.clear();
        this.buildTower();
        this.projectile.reset();
        this.scoreCheckTimer = 0;
    }
    
    update() {
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        this.physicsWorld.update(deltaTime);
        this.tower.update();
        this.projectile.update();
        this.cameraController.update(deltaTime);
        this.updateScoreCountdown(deltaTime);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.update();
        this.sceneManager.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
