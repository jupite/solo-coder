import { formatTime } from '../utils/helpers.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.distanceElement = document.getElementById('distance');
        this.timeElement = document.getElementById('time');
        this.speedElement = document.getElementById('speed');
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.penaltyIndicator = document.getElementById('penalty-indicator');
        
        this.onStartClick = null;
        
        this.init();
    }
    
    init() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                if (this.onStartClick) {
                    this.onStartClick();
                }
            });
        }
    }
    
    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
        }
    }
    
    updateDistance(distance) {
        if (this.distanceElement) {
            this.distanceElement.textContent = distance;
        }
    }
    
    updateTime(time) {
        if (this.timeElement) {
            this.timeElement.textContent = formatTime(time);
        }
    }
    
    updateSpeed(speed) {
        if (this.speedElement) {
            this.speedElement.textContent = Math.floor(speed * 3.6);
        }
    }
    
    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
    }
    
    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
    }
    
    showPenalty() {
        if (this.penaltyIndicator) {
            this.penaltyIndicator.classList.remove('hidden');
            setTimeout(() => {
                this.penaltyIndicator.classList.add('hidden');
            }, 1500);
        }
    }
    
    reset() {
        this.updateScore(0);
        this.updateDistance(0);
        this.updateTime(0);
        this.updateSpeed(0);
    }
}
