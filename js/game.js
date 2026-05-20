export class GameManager {
    constructor(sheepManager) {
        this.sheepManager = sheepManager;
        this.score = 0;
        this.time = 0;
        this.gameOver = false;
        this.previousSheepInPen = 0;
        this.scorePerSheep = 20;
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        this.time += deltaTime;
        
        const currentSheepInPen = this.sheepManager.getSheepInPenCount();
        const newSheep = currentSheepInPen - this.previousSheepInPen;
        
        if (newSheep > 0) {
            this.score += newSheep * this.scorePerSheep;
            this.previousSheepInPen = currentSheepInPen;
        }
        
        if (this.sheepManager.getAllInPen()) {
            this.gameOver = true;
            this.showVictory();
        }
    }
    
    showVictory() {
        const victoryScreen = document.getElementById('victory-screen');
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalTime) finalTime.textContent = Math.floor(this.time);
        if (victoryScreen) victoryScreen.style.display = 'block';
    }
    
    getScore() {
        return this.score;
    }
    
    getTime() {
        return Math.floor(this.time);
    }
    
    getSheepInPenCount() {
        return this.sheepManager.getSheepInPenCount();
    }
    
    getTotalSheep() {
        return this.sheepManager.getSheepCount();
    }
    
    isGameOver() {
        return this.gameOver;
    }
}

export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.sheepInElement = document.getElementById('sheep-in');
    }
    
    update(score, time, sheepIn, totalSheep) {
        if (this.scoreElement) this.scoreElement.textContent = score;
        if (this.timeElement) this.timeElement.textContent = time;
        if (this.sheepInElement) this.sheepInElement.textContent = sheepIn;
    }
}
