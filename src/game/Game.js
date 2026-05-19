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

    this.cone.getStackedBalls().forEach(ball => {
      ball.dispose()
    })

    this.fallingBalls = []
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
    const stackedCount = this.cone.getStackedBallCount()
    const topY = this.cone.getTopY() + stackedCount * 2
    const spawnY = Math.max(15, topY + 5 + Math.random() * 3)
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

    const stackedBalls = this.cone.getStackedBalls()

    for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
      const ball = this.fallingBalls[i]
      this.physics.updateBall(ball, deltaTime)

      if (stackedBalls.length > 0) {
        const stackResult = this.checkBallStackCollision(ball, stackedBalls)
        if (stackResult.collided) {
          if (stackResult.success) {
            this.stackBall(ball, stackResult)
          } else {
            this.scene.remove(ball.getMesh())
            ball.dispose()
            this.gameOver()
            return
          }
          this.fallingBalls.splice(i, 1)
          continue
        }
      }

      const coneResult = this.checkBallConeCollision(ball)
      if (coneResult.collided) {
        if (coneResult.success) {
          this.stackBall(ball, coneResult)
        } else {
          this.scene.remove(ball.getMesh())
          ball.dispose()
          this.gameOver()
          return
        }
        this.fallingBalls.splice(i, 1)
        continue
      }

      if (this.physics.checkGroundCollision(ball)) {
        this.gameOver()
        return
      }
    }

    const cameraTargetY = Math.max(8, this.cone.getTopY() + stackedBalls.length * 1.5)
    this.scene.camera.position.y += (cameraTargetY - this.scene.camera.position.y) * 0.05
    this.scene.camera.lookAt(0, cameraTargetY - 3, 0)
  }

  checkBallConeCollision(ball) {
    const ballPos = ball.getPosition()
    const ballRadius = ball.getRadius()
    const coneTopY = this.cone.getTopY()
    const coneTopX = this.cone.getTopX()
    const coneRadius = this.cone.getRadius()

    const dx = ballPos.x - coneTopX
    const horizontalDistance = Math.sqrt(dx * dx + ballPos.z * ballPos.z)

    if (ballPos.y - ballRadius <= coneTopY && ballPos.y >= coneTopY - ballRadius * 0.5) {
      if (horizontalDistance <= coneRadius * 0.6) {
        const localX = ballPos.x - coneTopX
        return {
          collided: true,
          success: true,
          localX: localX,
          localY: coneTopY + ballRadius,
          localZ: ballPos.z
        }
      } else if (horizontalDistance <= coneRadius * 0.9) {
        return {
          collided: true,
          success: false
        }
      }
    }

    return { collided: false }
  }

  checkBallStackCollision(ball, stackedBalls) {
    const ballPos = ball.getPosition()
    const ballRadius = ball.getRadius()
    const coneX = this.cone.getTopX()

    for (let i = stackedBalls.length - 1; i >= 0; i--) {
      const stackedBall = stackedBalls[i]
      const stackedLocalPos = stackedBall.getPosition()
      const stackedWorldX = coneX + stackedLocalPos.x
      const stackedWorldY = stackedLocalPos.y
      const stackedWorldZ = stackedLocalPos.z
      const stackedRadius = stackedBall.getRadius()

      const dx = ballPos.x - stackedWorldX
      const dz = ballPos.z - stackedWorldZ
      const dy = ballPos.y - stackedWorldY
      const distance = Math.sqrt(dx * dx + dz * dz + dy * dy)
      const minDistance = ballRadius + stackedRadius

      if (distance <= minDistance * 0.95) {
        const contactY = stackedWorldY + stackedRadius * 2
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz)

        if (horizontalDistance <= (ballRadius + stackedRadius) * 0.5) {
          const localX = ballPos.x - coneX
          return {
            collided: true,
            success: true,
            localX: localX,
            localY: contactY,
            localZ: ballPos.z,
            stackIndex: i
          }
        } else if (horizontalDistance <= (ballRadius + stackedRadius) * 0.8) {
          return {
            collided: true,
            success: false
          }
        }
      }
    }

    return { collided: false }
  }

  stackBall(ball, result) {
    this.scene.remove(ball.getMesh())
    ball.setPosition(result.localX, result.localY, result.localZ)
    ball.setStacked()
    this.cone.addStackedBall(ball)
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
    this.cone.getStackedBalls().forEach(ball => ball.dispose())
  }
}
