export class UIManager {
  constructor() {
    this.powerBarContainer = document.getElementById('power-bar-container');
    this.powerBar = document.getElementById('power-bar');
    this.scoreDisplay = document.getElementById('score-display');
    this.scoreBreakdown = document.getElementById('score-breakdown');
    this.restartBtn = document.getElementById('restart-btn');
    this.actionIndicator = document.getElementById('action-indicator');
  }

  showPowerBar() {
    this.powerBarContainer.style.display = 'block';
    this.powerBar.style.width = '0%';
  }

  hidePowerBar() {
    this.powerBarContainer.style.display = 'none';
    this.powerBar.style.width = '0%';
  }

  updatePowerBar(percent) {
    this.powerBar.style.width = `${percent}%`;
  }

  showScore(score, breakdown) {
    this.scoreDisplay.style.display = 'block';
    this.scoreDisplay.textContent = `${score} 分`;

    this.scoreBreakdown.style.display = 'block';
    this.scoreBreakdown.innerHTML = `
      <div style="margin-bottom: 5px;">垂直得分: ${breakdown.vertical} / 40</div>
      <div style="margin-bottom: 5px;">难度得分: ${breakdown.complexity} / 30</div>
      <div style="margin-bottom: 5px;">水花得分: ${breakdown.splash} / 30</div>
      <div>完成翻转: ${breakdown.rotations} 圈</div>
    `;

    this.restartBtn.style.display = 'block';
  }

  hideScore() {
    this.scoreDisplay.style.display = 'none';
    this.scoreBreakdown.style.display = 'none';
    this.restartBtn.style.display = 'none';
  }

  showResult(comment, grade) {
    const oldText = this.scoreDisplay.textContent;
    this.scoreDisplay.textContent = `${oldText} - ${grade}级`;

    const oldBreakdown = this.scoreBreakdown.innerHTML;
    this.scoreBreakdown.innerHTML = oldBreakdown + `<div style="margin-top: 10px; font-size: 18px;">${comment}</div>`;
  }

  updateActionIndicator(actions) {
    if (actions.length > 0) {
      this.actionIndicator.textContent = actions.join(' + ');
    } else {
      this.actionIndicator.textContent = '';
    }
  }

  reset() {
    this.hidePowerBar();
    this.hideScore();
    this.actionIndicator.textContent = '';
  }
}
