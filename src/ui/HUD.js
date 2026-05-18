const PowerUpIcons = {
  multi_ball: '🔮',
  slow_down: '🐢',
  speed_up: '⚡',
  wide_paddle: '📏'
};

export class HUD {
  constructor() {
    this.scoreElement = document.getElementById('score');
    this.livesElement = document.getElementById('lives');
    this.speedElement = document.getElementById('speed');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.gameResult = document.getElementById('game-result');
    this.finalScore = document.getElementById('final-score');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.levelSelectBtn = document.getElementById('level-select-btn');
    this.backToMenuBtn = document.getElementById('back-to-menu-btn-game');
    this.effectsContainer = document.getElementById('active-effects');
    this.levelInfoElement = document.getElementById('level-info');

    this.score = 0;
    this.lives = 3;
    this.speedMultiplier = 1;
  }

  setScore(score) {
    this.score = score;
    this.scoreElement.textContent = score;
  }

  addScore(points) {
    this.setScore(this.score + points);
  }

  setLives(lives) {
    this.lives = lives;
    this.livesElement.textContent = lives;
  }

  loseLife() {
    this.setLives(Math.max(0, this.lives - 1));
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    this.speedElement.textContent = multiplier.toFixed(1) + 'x';
  }

  showStartScreen() {
    this.startScreen.classList.remove('hidden');
    this.gameOverScreen.classList.add('hidden');
  }

  hideStartScreen() {
    this.startScreen.classList.add('hidden');
  }

  showGameOverScreen(isWin, finalScore) {
    this.gameResult.textContent = isWin ? '🎉 胜利！' : '💀 游戏结束';
    this.finalScore.textContent = finalScore;
    this.gameOverScreen.classList.remove('hidden');
  }

  hideGameOverScreen() {
    this.gameOverScreen.classList.add('hidden');
  }

  reset() {
    this.setScore(0);
    this.setLives(3);
    this.setSpeed(1);
  }

  onStart(callback) {
    this.startBtn.addEventListener('click', callback);
  }

  onRestart(callback) {
    this.restartBtn.addEventListener('click', callback);
  }

  onLevelSelect(callback) {
    this.levelSelectBtn.addEventListener('click', callback);
  }

  onBackToMenu(callback) {
    this.backToMenuBtn.addEventListener('click', callback);
  }

  updateActiveEffects(effects) {
    this.effectsContainer.innerHTML = '';
    effects.forEach(effect => {
      const icon = PowerUpIcons[effect.type] || '❓';
      const timeLeft = Math.ceil(effect.remainingTime);
      const effectElement = document.createElement('div');
      effectElement.className = 'effect-item';
      effectElement.innerHTML = `
        <span class="effect-icon">${icon}</span>
        <span class="effect-time">${timeLeft}s</span>
      `;
      this.effectsContainer.appendChild(effectElement);
    });
  }

  setLevelInfo(levelName) {
    if (this.levelInfoElement) {
      this.levelInfoElement.textContent = `关卡: ${levelName}`;
    }
  }

  reset() {
    this.setScore(0);
    this.setLives(3);
    this.setSpeed(1);
    this.updateActiveEffects([]);
  }
}
