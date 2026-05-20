export class UIManager {
    constructor() {
        this.distanceElement = document.getElementById('distance');
        this.targetDistanceElement = document.getElementById('target-distance');
        this.progressFill = document.getElementById('progress-fill');
        this.windArrow = document.getElementById('wind-arrow');
        this.windStrength = document.getElementById('wind-strength');
        this.balanceFill = document.getElementById('balance-fill');

        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.finalDistance = document.getElementById('final-distance');

        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.onStartCallback = null;
        this.onRestartCallback = null;

        this.startBtn.addEventListener('click', () => {
            if (this.onStartCallback) this.onStartCallback();
        });

        this.restartBtn.addEventListener('click', () => {
            if (this.onRestartCallback) this.onRestartCallback();
        });
    }

    setTargetDistance(distance) {
        this.targetDistanceElement.textContent = Math.floor(distance);
    }

    updateDistance(current, target) {
        const distance = Math.max(0, Math.floor(current));
        this.distanceElement.textContent = distance;
        const progress = Math.min(100, (current / target) * 100);
        this.progressFill.style.width = progress + '%';
    }

    updateWind(windSystem) {
        const direction = windSystem.getWindDirection();
        const strength = windSystem.getWindStrength();

        if (direction === 0) {
            this.windArrow.textContent = '↓';
            this.windArrow.style.transform = 'rotate(0deg)';
        } else if (direction > 0) {
            this.windArrow.textContent = '→';
            this.windArrow.style.transform = 'rotate(0deg)';
        } else {
            this.windArrow.textContent = '←';
            this.windArrow.style.transform = 'rotate(0deg)';
        }

        this.windStrength.textContent = strength.toFixed(1);

        const intensity = Math.min(1, strength / 5);
        const green = Math.floor(255 * (1 - intensity));
        this.windArrow.style.color = `rgb(255, ${green}, 0)`;
    }

    updateBalance(balancePercentage) {
        const width = 30;
        const left = balancePercentage * 100 - width / 2;
        this.balanceFill.style.width = width + '%';
        this.balanceFill.style.left = Math.max(0, Math.min(100 - width, left)) + '%';
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    showGameOver(isWin, distance) {
        this.gameOverScreen.classList.remove('hidden');

        if (isWin) {
            this.resultTitle.textContent = '🎉 恭喜通关！';
            this.resultTitle.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
            this.resultMessage.textContent = '你成功走过了钢丝！';
        } else {
            this.resultTitle.textContent = '💀 游戏结束';
            this.resultTitle.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
            this.resultMessage.textContent = '你从钢丝上掉下来了！';
        }

        this.finalDistance.textContent = Math.floor(distance);
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }

    onStart(callback) {
        this.onStartCallback = callback;
    }

    onRestart(callback) {
        this.onRestartCallback = callback;
    }

    reset(current, target) {
        this.updateDistance(current, target);
        this.balanceFill.style.width = '30%';
        this.balanceFill.style.left = '35%';
        this.windArrow.textContent = '→';
        this.windStrength.textContent = '0';
        this.windArrow.style.color = '#ff9800';
    }
}
