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
}
