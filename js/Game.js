import { Scene, PerspectiveCamera, WebGLRenderer, Color, Vector3 } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { Player } from './Player.js';
import { AsteroidManager } from './AsteroidManager.js';
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
        this.asteroidManager = null;
        this.bulletManager = null;
        this.starField = null;
        this.ui = null;
        this.particleSystem = null;
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.baseSpawnRate = 2000;
        this.lastSpawnTime = 0;
        
        this.keys = {
            left: false,
            right: false
        };
        
        this.mouseX = 0;
        this.useMouseControl = false;
        
        this.init();
    }
    
    init() {
        this.scene = new Scene();
        this.scene.background = new Color(0x000011);
        
        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(new Vector3(0, 0, 0));
        
        this.renderer = new WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.starField = new StarField(this.scene);
        this.player = new Player(this.scene);
        this.asteroidManager = new AsteroidManager(this.scene);
        this.bulletManager = new BulletManager(this.scene);
        this.particleSystem = new ParticleSystem(this.scene);
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
        this.asteroidManager.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.starField.update(deltaTime);
        
        this.checkCollisions();
        this.spawnAsteroids();
        this.updateDifficulty();
    }
    
    checkCollisions() {
        const bullets = this.bulletManager.getBullets();
        const asteroids = this.asteroidManager.getAsteroids();
        const playerPos = this.player.getPosition();
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                const dist = bullet.position.distanceTo(asteroid.mesh.position);
                if (dist < 1.5) {
                    this.particleSystem.createExplosion(asteroid.mesh.position.x, asteroid.mesh.position.y, asteroid.mesh.position.z);
                    this.asteroidManager.removeAsteroid(j);
                    this.bulletManager.removeBullet(i);
                    this.score += 1;
                    this.ui.updateScore(this.score);
                    break;
                }
            }
        }
        
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            const dist = playerPos.distanceTo(asteroid.mesh.position);
            if (dist < 3) {
                this.particleSystem.createExplosion(playerPos.x, playerPos.y, playerPos.z);
                this.asteroidManager.removeAsteroid(i);
                this.lives -= 1;
                this.ui.updateLives(this.lives);
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                break;
            }
            
            if (asteroid.mesh.position.y < -30) {
                this.asteroidManager.removeAsteroid(i);
            }
        }
    }
    
    spawnAsteroids() {
        const now = Date.now();
        const spawnRate = Math.max(500, this.baseSpawnRate - (this.score * 50));
        
        if (now - this.lastSpawnTime > spawnRate) {
            const x = (Math.random() - 0.5) * 60;
            this.asteroidManager.addAsteroid(x, 25);
            this.lastSpawnTime = now;
        }
    }
    
    updateDifficulty() {
        const newDifficulty = Math.floor(this.score / 10);
        if (newDifficulty > this.currentDifficulty) {
            this.currentDifficulty = newDifficulty;
            this.baseSpawnRate = Math.max(500, 2000 - (newDifficulty * 150));
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
        this.lastSpawnTime = 0;
        
        this.player.reset();
        this.asteroidManager.clear();
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