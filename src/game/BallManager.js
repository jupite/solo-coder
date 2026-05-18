import { Ball } from './Ball.js';

export class BallManager {
  constructor(scene, bounds) {
    this.scene = scene;
    this.bounds = bounds;
    this.balls = [];
    this.globalSpeedMultiplier = 1;
  }

  createBall() {
    const ball = new Ball(this.scene, this.bounds);
    this.balls.push(ball);
    return ball;
  }

  getMainBall() {
    return this.balls[0] || null;
  }

  getAllBalls() {
    return this.balls;
  }

  update(deltaTime, paddle) {
    this.balls.forEach(ball => {
      ball.setGlobalSpeedMultiplier(this.globalSpeedMultiplier);
      ball.update(deltaTime, paddle);
    });
  }

  launchAll() {
    this.balls.forEach(ball => ball.launch());
  }

  spawnExtraBalls(count, sourceBall) {
    if (!sourceBall || !sourceBall.isLaunched) return;

    for (let i = 0; i < count; i++) {
      const newBall = this.createBall();
      const angle = (Math.random() - 0.5) * Math.PI * 0.5;
      const velocity = {
        x: sourceBall.velocity.x * Math.cos(angle) - sourceBall.velocity.z * Math.sin(angle),
        y: sourceBall.velocity.y,
        z: sourceBall.velocity.x * Math.sin(angle) + sourceBall.velocity.z * Math.cos(angle)
      };
      newBall.launchFrom({ ...sourceBall.position }, velocity, sourceBall.speedMultiplier);
    }
  }

  checkPaddleCollisions(paddle) {
    let hit = false;
    this.balls.forEach(ball => {
      if (ball.isLaunched && ball.checkPaddleCollision(paddle)) {
        hit = true;
      }
    });
    return hit;
  }

  checkBrickCollisions(brickManager) {
    let hit = null;
    this.balls.forEach(ball => {
      if (ball.isLaunched) {
        const hitBrick = brickManager.checkCollisions(ball);
        if (hitBrick) {
          hit = hitBrick;
        }
      }
    });
    return hit;
  }

  removeOutOfBoundsBalls() {
    const beforeCount = this.balls.length;
    this.balls = this.balls.filter(ball => {
      if (ball.isOutOfBounds()) {
        ball.destroy();
        return false;
      }
      return true;
    });
    return beforeCount > this.balls.length;
  }

  hasActiveBalls() {
    return this.balls.length > 0;
  }

  setGlobalSpeedMultiplier(multiplier) {
    this.globalSpeedMultiplier = multiplier;
  }

  reset() {
    this.balls.forEach(ball => ball.destroy());
    this.balls = [];
    this.globalSpeedMultiplier = 1;
    this.createBall();
  }

  destroy() {
    this.balls.forEach(ball => ball.destroy());
    this.balls = [];
  }
}
