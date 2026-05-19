import * as THREE from 'three'

export class Physics {
  constructor() {
    this.gravity = 20
    this.groundY = 0
  }

  checkBallConeCollision(ball, cone) {
    const ballPos = ball.getPosition()
    const ballRadius = ball.getRadius()
    const coneTopY = cone.getTopY()
    const coneTopX = cone.getTopX()
    const coneRadius = cone.getRadius()

    const contactY = coneTopY + ballRadius
    const dx = ballPos.x - coneTopX
    const horizontalDistance = Math.sqrt(dx * dx + ballPos.z * ballPos.z)

    if (ballPos.y - ballRadius <= coneTopY && ballPos.y >= coneTopY - ballRadius * 0.5) {
      if (horizontalDistance <= coneRadius * 0.8) {
        return {
          collided: true,
          stackX: coneTopX,
          stackY: contactY,
          stackZ: 0
        }
      }
    }

    return { collided: false }
  }

  checkBallStackCollision(ball, stackedBalls) {
    const ballPos = ball.getPosition()
    const ballRadius = ball.getRadius()

    for (let i = stackedBalls.length - 1; i >= 0; i--) {
      const stackedBall = stackedBalls[i]
      const stackedPos = stackedBall.getPosition()
      const stackedRadius = stackedBall.getRadius()

      const dx = ballPos.x - stackedPos.x
      const dz = ballPos.z - stackedPos.z
      const dy = ballPos.y - stackedPos.y
      const distance = Math.sqrt(dx * dx + dz * dz + dy * dy)
      const minDistance = ballRadius + stackedRadius

      if (distance <= minDistance * 0.95) {
        const contactY = stackedPos.y + stackedRadius * 2
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz)

        if (horizontalDistance <= (ballRadius + stackedRadius) * 0.8) {
          return {
            collided: true,
            stackX: stackedPos.x,
            stackY: contactY,
            stackZ: stackedPos.z,
            stackIndex: i
          }
        }
      }
    }

    return { collided: false }
  }

  checkGroundCollision(ball) {
    const ballPos = ball.getPosition()
    const ballRadius = ball.getRadius()

    if (ballPos.y - ballRadius <= this.groundY) {
      return true
    }
    return false
  }

  updateBall(ball, deltaTime) {
    ball.update(deltaTime, this.gravity)
  }

  alignBallOnStack(ball, targetX, targetY, targetZ) {
    const currentPos = ball.getPosition()
    const newX = THREE.MathUtils.lerp(currentPos.x, targetX, 0.3)
    const newZ = THREE.MathUtils.lerp(currentPos.z, targetZ, 0.3)
    
    ball.setPosition(newX, targetY, newZ)
    
    if (Math.abs(currentPos.x - targetX) < 0.01 && Math.abs(currentPos.z - targetZ) < 0.01) {
      return true
    }
    return false
  }
}
