import { SceneManager } from '../three/SceneManager.js'
import { Player } from './Player.js'
import { ObstacleManager } from './ObstacleManager.js'
import { ScoreManager } from './ScoreManager.js'

export class Game {
  constructor() {
    this.sceneManager = null
    this.player = null
    this.obstacleManager = null
    this.scoreManager = null
    this.isGameOver = false
    this.animationId = null
    this.baseSpeed = 5
    this.currentSpeed = this.baseSpeed
    this.speedIncrement = 0.001
    this.maxSpeed = 20
  }

  init() {
    this.sceneManager = new SceneManager()
    this.player = new Player(this.sceneManager.scene)
    this.obstacleManager = new ObstacleManager(this.sceneManager.scene)
    this.scoreManager = new ScoreManager()
    
    this.setupEventListeners()
    this.gameLoop()
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isGameOver) {
        e.preventDefault()
        this.player.jump()
      }
    })
  }

  gameLoop() {
    if (!this.isGameOver) {
      this.update()
      this.sceneManager.render(this.player.mesh.position, this.currentSpeed)
    }
    this.animationId = requestAnimationFrame(() => this.gameLoop())
  }

  update() {
    this.currentSpeed = Math.min(this.currentSpeed + this.speedIncrement, this.maxSpeed)
    
    this.player.update(this.currentSpeed)
    this.obstacleManager.update(this.player.mesh.position.x, this.currentSpeed)
    
    if (this.checkCollision()) {
      this.gameOver()
      return
    }
    
    const passedObstacles = this.obstacleManager.checkPassedObstacles(this.player.mesh.position.x)
    if (passedObstacles > 0) {
      this.scoreManager.addScore(passedObstacles * 10)
    }
    
    this.obstacleManager.adjustSpawnInterval(this.scoreManager.score)
  }

  checkCollision() {
    const playerBox = this.player.getBoundingBox()
    const obstacles = this.obstacleManager.obstacles
    
    for (const obstacle of obstacles) {
      const obstacleBox = obstacle.getBoundingBox()
      if (playerBox.intersectsBox(obstacleBox)) {
        return true
      }
    }
    return false
  }

  gameOver() {
    this.isGameOver = true
    this.scoreManager.showFinalScore()
    document.getElementById('game-over').style.display = 'block'
  }

  restart() {
    this.isGameOver = false
    this.currentSpeed = this.baseSpeed
    this.scoreManager.reset()
    this.player.reset()
    this.obstacleManager.reset()
    document.getElementById('game-over').style.display = 'none'
  }
}