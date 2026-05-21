import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { Environment } from './environment.js';
import { Sheepdog } from './dog.js';
import { SheepManager } from './sheep.js';
import { GameManager, UIManager } from './game.js';
import { CollisionManager } from './collision.js';

class Game {
    constructor() {
        this.sceneManager = new SceneManager('game-container');
        this.environment = new Environment(this.sceneManager.scene);
        this.dog = new Sheepdog(this.sceneManager.scene);
        this.sheepManager = new SheepManager(this.sceneManager.scene, 5, this.environment);
        this.gameManager = new GameManager(this.sheepManager);
        this.uiManager = new UIManager();
        this.collisionManager = new CollisionManager(this.environment);
        
        this.collisionManager.registerEntity(this.dog.mesh, 1.2, false);
        this.sheepManager.sheepList.forEach(sheep => {
            this.collisionManager.registerEntity(sheep.mesh, 1.0, true);
        });
        
        this.clock = new THREE.Clock();
        this.animate();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        if (!this.gameManager.isGameOver()) {
            this.dog.update(deltaTime);
            
            this.sheepManager.update(
                deltaTime,
                this.dog.getPosition(),
                this.dog.isBarkingNow(),
                this.dog.getBarkRadius()
            );
            
            this.collisionManager.resolveAllCollisions();
            
            this.sheepManager.sheepList.forEach(sheep => {
                if (this.collisionManager.didCollide(sheep.mesh.id)) {
                    sheep.forceChangeDirection();
                }
            });
            
            this.gameManager.update(deltaTime);
            
            this.uiManager.update(
                this.gameManager.getScore(),
                this.gameManager.getTime(),
                this.gameManager.getSheepInPenCount(),
                this.gameManager.getTotalSheep()
            );
        }
        
        this.sceneManager.updateCamera(this.dog.mesh);
        this.sceneManager.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
