import { Player } from './Player.js';
import { EnemyManager } from './EnemyManager.js';
import { BulletManager } from './BulletManager.js';
import { StarField } from './StarField.js';
import { UI } from './UI.js';
import { ParticleSystem } from './ParticleSystem.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemyManager = null;
        this.bulletManager = null;
        this.starField = null;
        this.ui = null;
        this.particleSystem = null;
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.baseSpawnRate = 2000;
        this.currentDifficulty = 0;
        
        this.keys = {
            left: false,
            right: false
        };
        
        this.mouseX = 0;
        this.useMouseControl = false;
        
        this.init();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(0, 0, 30);
        this.scene.add(pointLight);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.starField = new StarField(this.scene);
        this.player = new Player(this.scene);
        this.bulletManager = new BulletManager(this.scene);
        this.particleSystem = new ParticleSystem(this.scene);
        this.enemyManager = new EnemyManager(this.scene, this.bulletManager, this.particleSystem);
        this.ui = new UI();
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.keys.left = true;
            }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.keys.right = true;
            }
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                this.fireBullet();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.keys.left = false;
            }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.keys.right = false;
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.useMouseControl = true;
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
        });
        
        this.canvas.addEventListener('click', () => {
            this.fireBullet();
        });
    }
    
    fireBullet() {
        if (!this.gameOver) {
            const playerPos = this.player.getPosition();
            this.bulletManager.addBullet(playerPos.x, playerPos.y + 2);
        }
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        this.player.update(this.keys, this.mouseX, this.useMouseControl, deltaTime);
        this.bulletManager.update(deltaTime);
        this.enemyManager.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.starField.update(deltaTime);
        
        this.checkCollisions();
        this.spawnEnemies();
        this.updateDifficulty();
    }
    
    checkCollisions() {
        const playerBullets = this.bulletManager.getPlayerBullets();
        const enemies = this.enemyManager.getEnemies();
        const enemyBullets = this.bulletManager.getEnemyBulletObjects();
        const playerPos = this.player.getPosition();
        
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            let bulletHit = false;
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dist = bullet.position.distanceTo(enemy.mesh.position);
                const collisionRadius = enemy.constructor.name === 'DefenseTurret' ? 1 : 1.5;
                
                if (dist < collisionRadius) {
                    if (enemy.takeDamage()) {
                        this.particleSystem.createExplosion(
                            enemy.mesh.position.x, 
                            enemy.mesh.position.y, 
                            enemy.mesh.position.z
                        );
                        this.score += enemy.getScore();
                        this.ui.updateScore(this.score);
                        this.enemyManager.removeEnemy(j, true);
                    }
                    
                    this.bulletManager.removePlayerBullet(i);
                    bulletHit = true;
                    break;
                }
            }
            
            if (!bulletHit) {
                if (bullet.position.y > 30) {
                    this.bulletManager.removePlayerBullet(i);
                }
            }
        }
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dist = playerPos.distanceTo(enemy.mesh.position);
            
            if (dist < 3) {
                this.particleSystem.createExplosion(playerPos.x, playerPos.y, playerPos.z);
                
                if (enemy.constructor.name === 'DefenseTurret' && enemy.isActive && enemy.isActive()) {
                    enemy.triggerExplosion();
                }
                
                this.enemyManager.removeEnemy(i, true);
                this.lives -= 1;
                this.ui.updateLives(this.lives);
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                break;
            }
            
            if (enemy.shouldRemove()) {
                this.enemyManager.removeEnemy(i, false);
            }
        }
        
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const enemyBullet = enemyBullets[i];
            const dist = playerPos.distanceTo(enemyBullet.mesh.position);
            
            if (dist < 2) {
                this.particleSystem.createExplosion(
                    enemyBullet.mesh.position.x, 
                    enemyBullet.mesh.position.y, 
                    enemyBullet.mesh.position.z
                );
                this.bulletManager.removeEnemyBullet(i);
                this.lives -= 1;
                this.ui.updateLives(this.lives);
                
                if (this.lives <= 0) {
                    this.endGame();
                }
            }
        }
    }
    
    spawnEnemies() {
        const now = Date.now();
        const spawnRate = Math.max(500, this.baseSpawnRate - (this.score * 30));
        
        if (now - this.enemyManager.getLastSpawnTime() > spawnRate) {
            this.enemyManager.spawnRandomEnemy(this.currentDifficulty);
            this.enemyManager.setLastSpawnTime(now);
        }
    }
    
    updateDifficulty() {
        const newDifficulty = Math.floor(this.score / 10);
        if (newDifficulty > this.currentDifficulty) {
            this.currentDifficulty = newDifficulty;
            this.baseSpawnRate = Math.max(500, 2000 - (newDifficulty * 120));
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.ui.showGameOver(this.score);
    }
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.baseSpawnRate = 2000;
        this.currentDifficulty = 0;
        
        this.player.reset();
        this.enemyManager.clear();
        this.bulletManager.clear();
        this.particleSystem.clear();
        
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
        this.ui.hideGameOver();
    }
    
    gameLoop() {
        const clock = new THREE.Clock();
        
        const loop = () => {
            const deltaTime = clock.getDelta();
            this.update(deltaTime);
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}