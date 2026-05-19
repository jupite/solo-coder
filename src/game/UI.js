export class UIManager {
  constructor() {
    this.scoreElement = document.getElementById('score')
    this.gameOverElement = document.getElementById('game-over')
    this.finalScoreElement = document.getElementById('final-score')
    this.restartButton = document.getElementById('restart-btn')
    this.score = 0
  }

  updateScore(points) {
    this.score += points
    this.scoreElement.textContent = `分数: ${this.score}`
    
    this.scoreElement.style.transform = 'scale(1.2)'
    setTimeout(() => {
      this.scoreElement.style.transform = 'scale(1)'
    }, 150)
  }

  getScore() {
    return this.score
  }

  showGameOver() {
    this.finalScoreElement.textContent = this.score
    this.gameOverElement.style.display = 'block'
  }

  hideGameOver() {
    this.gameOverElement.style.display = 'none'
  }

  resetScore() {
    this.score = 0
    this.scoreElement.textContent = '分数: 0'
  }

  onRestart(callback) {
    this.restartButton.addEventListener('click', callback)
  }

  dispose() {
    this.restartButton.removeEventListener('click', () => {})
  }
}
