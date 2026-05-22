import { SceneManager } from './scene.js';
import { RoadGenerator } from './road.js';
import { Truck } from './truck.js';
import { CargoSystem } from './cargo.js';
import { PhysicsSimulator } from './physics.js';
import { InputController } from './input.js';
import { CameraController } from './camera.js';
import { ScoreSystem } from './score.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        
        this.sceneManager = new SceneManager(this.canvas);
        this.input = new InputController();
        this.scoreSystem = new ScoreSystem();
        this.ui = new UIManager(this.scoreSystem);
        
        this.road = new RoadGenerator(this.sceneManager.scene);
        this.truck = new Truck(this.sceneManager.scene);
        this.cargo = new CargoSystem(this.sceneManager.scene);
        this.physics = new PhysicsSimulator();
        this.cameraController = new CameraController(this.sceneManager.camera);
        
        this.gameStarted = false;
        this.hasDelivered = false;
        this.gameOverDelay = 0;
        
        this.setupCallbacks();
        
        this.animate = this.animate.bind(this);
        this.animate();
    }
    
    setupCallbacks() {
        this.ui.onStart = () => this.startGame();
        this.ui.onRestart = () => this.restartGame();
        
        this.cargo.onBoxDropped = () => {
            this.scoreSystem.addBoxDrop();
        };
        
        this.cargo.onBoxDelivered = (count) => {
            this.scoreSystem.addBoxDelivery(count);
        };
        
        this.scoreSystem.onGameEnd = () => {
            this.ui.showGameOver();
        };
    }
    
    startGame() {
        this.ui.hideStartScreen();
        this.ui.hideGameOver();
        
        const startPos = this.road.getStartPosition();
        const startDir = this.road.getStartDirection();
        
        this.truck.reset(startPos, startDir);
        this.truck.position.y += 1;
        this.truck.group.position.copy(this.truck.position);
        
        this.cargo.setupCargo(this.truck);
        this.cameraController.reset(this.truck);
        
        this.scoreSystem.start();
        this.gameStarted = true;
        this.hasDelivered = false;
        this.gameOverDelay = 0;
    }
    
    restartGame() {
        this.startGame();
    }
    
    checkGoal() {
        if (this.hasDelivered) return;
        
        if (this.road.isAtGoal(this.truck.position)) {
            this.hasDelivered = true;
            
            this.cargo.deliverCargo();
            
            this.gameOverDelay = 1.5;
        }
    }
    
    update(deltaTime) {
        if (!this.gameStarted) return;
        
        if (this.hasDelivered) {
            this.gameOverDelay -= deltaTime;
            if (this.gameOverDelay <= 0 && !this.scoreSystem.isFinished) {
                this.scoreSystem.finish();
            }
        }
        
        if (this.scoreSystem.isFinished) return;
        
        this.truck.update(deltaTime, this.input, this.road);
        
        this.cargo.update(deltaTime, this.truck, this.road);
        
        this.cameraController.update(this.truck);
        
        this.scoreSystem.update();
        
        this.checkGoal();
        
        this.ui.update(this.truck.getSpeedKmh());
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        
        const deltaTime = this.sceneManager.getDeltaTime();
        
        this.update(deltaTime);
        
        this.sceneManager.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
