import { GAME_CONFIG } from '../utils/constants.js';

export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.time = 0;
        this.distance = 0;
        this.startZ = 0;
        this.isRunning = false;
        
        this.onScoreChange = null;
        this.onTimeChange = null;
        this.onDistanceChange = null;
    }
    
    start(playerZ) {
        this.score = 0;
        this.time = 0;
        this.distance = 0;
        this.startZ = playerZ;
        this.isRunning = true;
        
        this.notifyChanges();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    update(deltaTime, playerZ) {
        if (!this.isRunning) return;
        
        this.time += deltaTime;
        this.distance = Math.max(0, Math.floor(this.startZ - playerZ));
        
        if (this.onTimeChange) {
            this.onTimeChange(this.time);
        }
        if (this.onDistanceChange) {
            this.onDistanceChange(this.distance);
        }
    }
    
    addScore(points) {
        this.score += points;
        if (this.onScoreChange) {
            this.onScoreChange(this.score);
        }
    }
    
    addPenaltyTime(seconds) {
        this.time += seconds;
        if (this.onTimeChange) {
            this.onTimeChange(this.time);
        }
    }
    
    getScore() {
        return this.score;
    }
    
    getTime() {
        return this.time;
    }
    
    getDistance() {
        return this.distance;
    }
    
    notifyChanges() {
        if (this.onScoreChange) this.onScoreChange(this.score);
        if (this.onTimeChange) this.onTimeChange(this.time);
        if (this.onDistanceChange) this.onDistanceChange(this.distance);
    }
}
