export class ScoreManager {
  constructor() {
    this.score = 0
    this.scoreElement = document.getElementById('score')
    this.finalScoreElement = document.getElementById('final-score')
  }

  addScore(points) {
    this.score += points
    this.updateDisplay()
  }

  updateDisplay() {
    this.scoreElement.textContent = this.score
  }

  showFinalScore() {
    this.finalScoreElement.textContent = this.score
  }

  reset() {
    this.score = 0
    this.updateDisplay()
  }
}