export class UIManager {
  constructor() {
    this.scoreElement = document.getElementById('scoreValue');
    this.energyFill = document.getElementById('energyFill');
    this.gameOverElement = document.getElementById('gameOver');
    this.finalScoreElement = document.getElementById('finalScore');
    this.restartBtn = document.getElementById('restartBtn');
  }

  updateScore(score) {
    if (this.scoreElement) {
      this.scoreElement.textContent = score;
    }
  }

  updateEnergy(energy) {
    if (this.energyFill) {
      const percentage = Math.max(0, Math.min(100, energy));
      this.energyFill.style.width = percentage + '%';
    }
  }

  showGameOver(score) {
    if (this.gameOverElement && this.finalScoreElement) {
      this.finalScoreElement.textContent = score;
      this.gameOverElement.classList.remove('hidden');
    }
  }

  hideGameOver() {
    if (this.gameOverElement) {
      this.gameOverElement.classList.add('hidden');
    }
  }

  onRestart(callback) {
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', callback);
    }
  }
}
