import { GAME_CONFIG } from '../config/constants.js';

export class UI {
    constructor() {
        this.scoreElement = document.getElementById('score-value');
        this.livesContainer = document.getElementById('lives-container');
        this.speedElement = document.getElementById('speed-value');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.score = 0;
        this.lives = GAME_CONFIG.MAX_LIVES;
        this.speed = 0;
    }

    init(onStart, onRestart) {
        this.startBtn.addEventListener('click', () => {
            this.startScreen.style.display = 'none';
            onStart();
        });

        this.restartBtn.addEventListener('click', () => {
            this.gameOverScreen.style.display = 'none';
            onRestart();
        });
    }

    updateScore(score) {
        this.score = score;
        this.scoreElement.textContent = score;
    }

    addScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
        return this.score;
    }

    updateLives(lives) {
        this.lives = lives;
        const hearts = this.livesContainer.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < lives) {
                heart.classList.remove('lost');
            } else {
                heart.classList.add('lost');
            }
        });
    }

    loseLife() {
        this.lives--;
        this.updateLives(this.lives);
        return this.lives;
    }

    updateSpeed(speed) {
        this.speed = Math.round(speed * 10000);
        this.speedElement.textContent = this.speed;
    }

    showGameOver(finalScore) {
        this.finalScoreElement.textContent = `最终分数: ${finalScore}`;
        this.gameOverScreen.style.display = 'flex';
    }

    reset() {
        this.score = 0;
        this.lives = GAME_CONFIG.MAX_LIVES;
        this.updateScore(0);
        this.updateLives(GAME_CONFIG.MAX_LIVES);
        this.updateSpeed(0);
        this.gameOverScreen.style.display = 'none';
    }

    getScore() {
        return this.score;
    }

    getLives() {
        return this.lives;
    }
}
