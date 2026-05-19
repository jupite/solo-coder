export class GameManager {
    constructor() {
        this.score = 0;
        this.throwsLeft = 5;
        this.maxThrows = 5;
        this.pointsPerBlock = 5;
        this.isGameOver = false;
        this.isWaitingForResult = false;
        
        this.scoreElement = document.getElementById('score');
        this.throwsLeftElement = document.getElementById('throws-left');
        this.powerIndicator = document.getElementById('power-indicator');
        this.powerFill = document.getElementById('power-fill');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-btn');
        
        this.onRestartCallback = null;
        this.onThrowCompleteCallback = null;
        
        this.restartButton.addEventListener('click', this.restart.bind(this));
        
        this.updateUI();
    }
    
    addScore(blocksFallen) {
        const points = blocksFallen * this.pointsPerBlock;
        this.score += points;
        this.updateUI();
        return points;
    }
    
    useThrow() {
        if (this.throwsLeft > 0) {
            this.throwsLeft--;
            this.isWaitingForResult = true;
            this.updateUI();
        }
    }
    
    completeThrow() {
        this.isWaitingForResult = false;
        
        if (this.throwsLeft <= 0) {
            this.endGame();
        }
    }
    
    canThrow() {
        return !this.isGameOver && !this.isWaitingForResult && this.throwsLeft > 0;
    }
    
    endGame() {
        this.isGameOver = true;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    restart() {
        this.score = 0;
        this.throwsLeft = this.maxThrows;
        this.isGameOver = false;
        this.isWaitingForResult = false;
        
        this.gameOverElement.classList.add('hidden');
        this.updateUI();
        
        if (this.onRestartCallback) {
            this.onRestartCallback();
        }
    }
    
    showPowerIndicator() {
        this.powerIndicator.classList.remove('hidden');
    }
    
    hidePowerIndicator() {
        this.powerIndicator.classList.add('hidden');
    }
    
    updatePower(powerNormalized) {
        const percentage = Math.max(0, Math.min(100, powerNormalized * 100));
        this.powerFill.style.width = `${percentage}%`;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.throwsLeftElement.textContent = this.throwsLeft;
    }
    
    setOnRestartCallback(callback) {
        this.onRestartCallback = callback;
    }
    
    setOnThrowCompleteCallback(callback) {
        this.onThrowCompleteCallback = callback;
    }
}
