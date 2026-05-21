import { CONSTANTS } from './constants.js';

export class UIManager {
  constructor() {
    this.scoreElement = document.getElementById('score');
    this.timerElement = document.getElementById('timer');
    this.timerPanel = document.querySelector('.timer-panel');
    this.startModal = document.getElementById('startModal');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.finalScoreElement = document.getElementById('finalScore');
    this.startBtn = document.getElementById('startBtn');
    this.restartBtn = document.getElementById('restartBtn');
    
    this.score = 0;
    this.timeLeft = CONSTANTS.GAME_DURATION;
  }

  init(onStart, onRestart) {
    this.startBtn.addEventListener('click', () => {
      this.hideStartModal();
      if (onStart) onStart();
    });
    
    this.restartBtn.addEventListener('click', () => {
      this.hideGameOverModal();
      if (onRestart) onRestart();
    });
  }

  updateScore(score) {
    this.score = score;
    this.scoreElement.textContent = score;
  }

  updateTimer(time) {
    this.timeLeft = Math.ceil(time);
    this.timerElement.textContent = this.timeLeft;
    
    if (this.timeLeft <= 10) {
      this.timerPanel.classList.add('warning');
    } else {
      this.timerPanel.classList.remove('warning');
    }
  }

  showStartModal() {
    this.startModal.classList.remove('hidden');
  }

  hideStartModal() {
    this.startModal.classList.add('hidden');
  }

  showGameOverModal(finalScore) {
    this.finalScoreElement.textContent = finalScore;
    this.gameOverModal.classList.remove('hidden');
  }

  hideGameOverModal() {
    this.gameOverModal.classList.add('hidden');
  }

  reset() {
    this.updateScore(0);
    this.updateTimer(CONSTANTS.GAME_DURATION);
    this.timerPanel.classList.remove('warning');
  }
}
