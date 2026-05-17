import { GAME } from '../utils/constants.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.init();
  }

  init() {
    const angleIndicator = document.createElement('div');
    angleIndicator.className = 'angle-indicator';
    angleIndicator.innerHTML = `
      <div class="angle-title">倾斜角度</div>
      <div class="angle-row">
        <span class="angle-label">X:</span>
        <span class="angle-value" id="tilt-x">0.0°</span>
      </div>
      <div class="angle-row">
        <span class="angle-label">Y:</span>
        <span class="angle-value" id="tilt-y">0.0°</span>
      </div>
    `;
    document.body.appendChild(angleIndicator);

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    scoreDisplay.innerHTML = `
      <div class="score-label">得分</div>
      <div class="score-value"><span id="score">0</span> / ${GAME.maxScore}</div>
    `;
    document.body.appendChild(scoreDisplay);

    const statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    statusMessage.id = 'status-message';
    document.body.appendChild(statusMessage);

    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.textContent = '移动鼠标控制平板倾斜，让球滚入金色目标洞';
    document.body.appendChild(instructions);

    this.elements.tiltX = document.getElementById('tilt-x');
    this.elements.tiltY = document.getElementById('tilt-y');
    this.elements.score = document.getElementById('score');
    this.elements.statusMessage = document.getElementById('status-message');
  }

  updateAngles(tiltX, tiltY) {
    this.elements.tiltX.textContent = `${tiltX.toFixed(1)}°`;
    this.elements.tiltY.textContent = `${tiltY.toFixed(1)}°`;
  }

  updateScore(score) {
    this.elements.score.textContent = score;
  }

  showStatus(message, type = 'success') {
    const el = this.elements.statusMessage;
    el.textContent = message;
    el.className = `status-message show ${type}`;
    
    setTimeout(() => {
      el.className = 'status-message';
    }, GAME.resetDelay);
  }

  dispose() {
    document.querySelectorAll('.angle-indicator, .score-display, .status-message, .instructions')
      .forEach(el => el.remove());
  }
}
