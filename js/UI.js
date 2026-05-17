export class UI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
    }
    
    updateScore(score) {
        this.scoreElement.textContent = `分数: ${score}`;
    }
    
    updateLives(lives) {
        this.livesElement.textContent = `生命: ${lives}`;
    }
    
    showGameOver(score) {
        this.finalScoreElement.textContent = score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }
}