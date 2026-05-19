import * as THREE from 'three'
import { GameScene } from './Scene.js'
import { Cone } from './Cone.js'
import { IceCreamBall } from './IceCreamBall.js'
import { Physics } from './Physics.js'
import { InputManager } from './Input.js'
import { UIManager } from './UI.js'

export class Game {
  constructor(container) {
    this.container = container
    this.scene = null
    this.cone = null
    this.physics = null
    this.input = null
    this.ui = null
    this.clock = null
    this.fallingBalls = []
    this.stackedBalls = []
    this.isGameOver = false
    this.isRunning = false
    this.spawnTimer = 0
    this.spawnInterval = 1.5
    this.minSpawnInterval = 0.6
    this.pointsPerBall = 10
    this.init()
  }

  init() {
    this.scene = new GameScene(this.container)
    this.cone = new Cone()
    this.physics = new Physics()
    this.input = new InputManager(this.container)
    this.ui = new UIManager()
    this.clock = new THREE.Clock()

    this.scene.add(this.cone.getMesh())
    this.ui.onRestart(() => this.restart())

    this.start()
  }

  start() {
    this.isRunning = true
    this.isGameOver = false
    this.clock.start()
    this.animate()
  }

  restart() {
    this.fallingBalls.forEach(ball => {
      this.scene.remove(ball.getMesh())
      ball.dispose()
    })
    this.stackedBalls.forEach(ball => {
      this.scene.remove(ball.getMesh())
      ball.dispose()
    })

    this.fallingBalls = []
    this.stackedBalls = []
    this.spawnTimer = 0
    this.spawnInterval = 1.5
    this.isGameOver = false
    this.isRunning = true

    this.cone.reset()
    this.ui.hideGameOver()
    this.ui.resetScore()

    this.clock.start()
  }

  spawnBall() {
    const ball = new IceCreamBall(1)
    const spawnX = (Math.random() - 0.5) * 16
    const spawnY = 15 + Math.random() * 5
    ball.setPosition(spawnX, spawnY, 0)
    this.fallingBalls.push(ball)
    this.scene.add(ball.getMesh())
  }

  update(deltaTime) {
    if (this.isGameOver || !this.isRunning) return

    this.spawnTimer += deltaTime
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnBall()
      this.spawnTimer = 0
      this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval - 0.02)
    }

    const targetX = this.input.getTargetX(this.cone.getTopX(), deltaTime)
    this.cone.setPosition(targetX)
    this.cone.update(deltaTime)

    for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
      const ball = this.fallingBalls[i]
      this.physics.updateBall(ball, deltaTime)

      if (this.stackedBalls.length > 0) {
        const stackResult = this.physics.checkBallStackCollision(ball, this.stackedBalls)
        if (stackResult.collided) {
          this.stackBall(ball, stackResult)
          this.fallingBalls.splice(i, 1)
          continue
        }
      }

      const coneResult = this.physics.checkBallConeCollision(ball, this.cone)
      if (coneResult.collided) {
        this.stackBall(ball, coneResult)
        this.fallingBalls.splice(i, 1)
        continue
      }

      if (this.physics.checkGroundCollision(ball)) {
        this.gameOver()
        return
      }
    }

    const cameraTargetY = Math.max(8, this.cone.getTopY() + this.stackedBalls.length * 1.5)
    this.scene.camera.position.y += (cameraTargetY - this.scene.camera.position.y) * 0.05
    this.scene.camera.lookAt(0, cameraTargetY - 3, 0)
  }

  stackBall(ball, result) {
    ball.setPosition(result.stackX, result.stackY, result.stackZ)
    ball.setStacked()
    this.stackedBalls.push(ball)
    this.ui.updateScore(this.pointsPerBall)
  }

  gameOver() {
    this.isGameOver = true
    this.isRunning = false
    this.ui.showGameOver()
  }

  animate() {
    if (!this.isRunning && !this.isGameOver) return

    const deltaTime = Math.min(this.clock.getDelta(), 0.1)
    this.update(deltaTime)
    this.scene.render()

    requestAnimationFrame(() => this.animate())
  }

  dispose() {
    this.isRunning = false
    this.scene.dispose()
    this.input.dispose()
    this.ui.dispose()

    this.fallingBalls.forEach(ball => ball.dispose())
    this.stackedBalls.forEach(ball => ball.dispose())
  }
}
