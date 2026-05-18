import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { GameLoop } from './GameLoop.js';
import { Player } from '../entities/Player.js';
import { TrackGenerator } from '../systems/TrackGenerator.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.sceneManager = new SceneManager(this.canvas);
        this.inputManager = new InputManager();
        this.gameLoop = new GameLoop(() => this.update());
        
        this.player = new Player();
        this.sceneManager.add(this.player.mesh);
        
        this.trackGenerator = new TrackGenerator(this.sceneManager);
        this.collisionSystem = new CollisionSystem();
        this.particleSystem = new ParticleSystem(this.sceneManager);
        this.scoreSystem = new ScoreSystem();
        this.uiManager = new UIManager();
        
        this.setupEventHandlers();
        this.uiManager.showStartScreen();
    }
    
    setupEventHandlers() {
        this.uiManager.onStartClick = () => this.start();
        
        this.collisionSystem.onTreeCollision = (tree) => {
            this.player.onCollision();
            this.scoreSystem.addPenaltyTime(GAME_CONFIG.COLLISION_PENALTY_TIME);
            this.uiManager.showPenalty();
        };
        
        this.collisionSystem.onFlagCollect = (flag) => {
            this.scoreSystem.addScore(GAME_CONFIG.FLAG_SCORE);
        };
        
        this.scoreSystem.onScoreChange = (score) => {
            this.uiManager.updateScore(score);
        };
        
        this.scoreSystem.onTimeChange = (time) => {
            this.uiManager.updateTime(time);
        };
        
        this.scoreSystem.onDistanceChange = (distance) => {
            this.uiManager.updateDistance(distance);
        };
    }
    
    start() {
        this.isRunning = true;
        this.uiManager.hideStartScreen();
        this.uiManager.reset();
        
        this.player.reset();
        this.trackGenerator.reset();
        this.particleSystem.reset();
        this.scoreSystem.start(this.player.getPosition().z);
        
        this.gameLoop.start();
    }
    
    update() {
        if (!this.isRunning) return;
        
        const deltaTime = this.sceneManager.getDeltaTime();
        
        const inputAxis = this.inputManager.getHorizontalAxis();
        const trackWidth = this.trackGenerator.getTrackWidth();
        this.player.update(deltaTime, inputAxis, trackWidth);
        
        const playerPos = this.player.getPosition();
        const playerSpeed = this.player.getSpeed();
        
        this.trackGenerator.update(playerPos.z, deltaTime);
        
        const trees = this.trackGenerator.getTrees();
        const flags = this.trackGenerator.getFlags();
        this.collisionSystem.checkCollisions(this.player, trees, flags);
        
        this.particleSystem.update(deltaTime, playerPos, playerSpeed);
        
        this.scoreSystem.update(deltaTime, playerPos.z);
        
        this.uiManager.updateSpeed(playerSpeed);
        
        this.sceneManager.updateCamera(playerPos, playerSpeed, deltaTime);
        
        this.sceneManager.render();
    }
    
    stop() {
        this.isRunning = false;
        this.gameLoop.stop();
        this.scoreSystem.stop();
    }
}
