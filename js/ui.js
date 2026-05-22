export class UIManager {
    constructor(scoreSystem) {
        this.scoreSystem = scoreSystem;
        
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.droppedElement = document.getElementById('dropped');
        this.speedometerElement = document.getElementById('speedometer');
        
        this.gameOverScreen = document.getElementById('game-over');
        this.startScreen = document.getElementById('start-screen');
        
        this.finalScoreElement = document.getElementById('final-score');
        this.finalTimeElement = document.getElementById('final-time');
        this.finalDroppedElement = document.getElementById('final-dropped');
        
        this.startButton = document.getElementById('start-btn');
        this.restartButton = document.getElementById('restart-btn');
        
        this.onStart = null;
        this.onRestart = null;
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => {
            if (this.onStart) {
                this.onStart();
            }
        });
        
        this.restartButton.addEventListener('click', () => {
            if (this.onRestart) {
                this.onRestart();
            }
        });
    }
    
    update(speed) {
        this.timerElement.textContent = `时间: ${this.scoreSystem.getFormattedTime()}`;
        this.scoreElement.textContent = `得分: ${this.scoreSystem.getScore()}`;
        this.droppedElement.textContent = `掉落: ${this.scoreSystem.getDroppedCount()}`;
        this.speedometerElement.textContent = `速度: ${speed.toFixed(0)} km/h`;
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    }
    
    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }
    
    showGameOver() {
        this.finalScoreElement.textContent = `最终得分: ${this.scoreSystem.getScore()}`;
        this.finalTimeElement.textContent = `用时: ${this.scoreSystem.getFormattedTime()}`;
        this.finalDroppedElement.textContent = `掉落箱子: ${this.scoreSystem.getDroppedCount()}`;
        
        this.gameOverScreen.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
}
