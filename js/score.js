export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.isFinished = false;
        
        this.droppedBoxes = 0;
        this.deliveredBoxes = 0;
        this.totalBoxes = 5;
        
        this.pointsPerDelivery = 50;
        this.penaltyPerDrop = 10;
        this.baseScore = 100;
        
        this.onScoreChange = null;
        this.onGameEnd = null;
    }
    
    start() {
        this.score = this.baseScore;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.isRunning = true;
        this.isFinished = false;
        this.droppedBoxes = 0;
        this.deliveredBoxes = 0;
    }
    
    update() {
        if (this.isRunning && !this.isFinished) {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
        }
    }
    
    addBoxDrop() {
        this.droppedBoxes++;
        this.score = Math.max(0, this.score - this.penaltyPerDrop);
        
        if (this.onScoreChange) {
            this.onScoreChange();
        }
    }
    
    addBoxDelivery(count) {
        this.deliveredBoxes = count;
        this.score += count * this.pointsPerDelivery;
        
        if (this.onScoreChange) {
            this.onScoreChange();
        }
    }
    
    finish() {
        if (this.isFinished) return;
        
        this.isFinished = true;
        this.isRunning = false;
        
        const timeBonus = Math.max(0, 200 - this.elapsedTime);
        this.score += Math.floor(timeBonus);
        
        if (this.onGameEnd) {
            this.onGameEnd();
        }
    }
    
    getScore() {
        return this.score;
    }
    
    getFormattedTime() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    getElapsedTime() {
        return this.elapsedTime;
    }
    
    getDroppedCount() {
        return this.droppedBoxes;
    }
    
    getDeliveredCount() {
        return this.deliveredBoxes;
    }
}
