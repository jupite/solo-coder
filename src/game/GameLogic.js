import { PHYSICS, GAME } from '../utils/constants.js';
import { TargetHole } from './TargetHole.js';
import { Obstacle } from './Obstacle.js';

export class GameLogic {
  constructor(sceneManager, ball, platform, uiManager, physicsEngine) {
    this.sceneManager = sceneManager;
    this.ball = ball;
    this.platform = platform;
    this.uiManager = uiManager;
    this.physicsEngine = physicsEngine;
    
    this.score = 0;
    this.isResetting = false;
    this.targetHoles = [];
    this.obstacles = [];
    this.currentTargetIndex = 0;
    
    this.init();
  }

  init() {
    this.createTargetHoles();
    this.generateLevel();
    this.updateUI();
  }

  createTargetHoles() {
    const position = { x: 3, z: 3 };
    this.targetHoles = [new TargetHole(this.sceneManager, position, this.platform.mesh)];
  }

  generateLevel() {
    this.clearObstacles();
    
    const halfSize = PHYSICS.platformSize / 2 - 1;
    const margin = 2;
    
    const ballPos = this.getRandomPosition(margin, halfSize);
    let holePos = this.getRandomPosition(margin, halfSize);
    
    let attempts = 0;
    while (this.getDistance(ballPos, holePos) < 4 && attempts < 50) {
      holePos = this.getRandomPosition(margin, halfSize);
      attempts++;
    }
    
    this.ball.setPosition(ballPos.x, ballPos.z);
    this.targetHoles[0].setPosition(holePos.x, holePos.z);
    
    this.generateObstacles(ballPos, holePos, 5);
  }

  getRandomPosition(min, max) {
    const x = (Math.random() * (max - min) + min) * (Math.random() > 0.5 ? 1 : -1);
    const z = (Math.random() * (max - min) + min) * (Math.random() > 0.5 ? 1 : -1);
    return { x, z };
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  generateObstacles(ballPos, holePos, count) {
    const halfSize = PHYSICS.platformSize / 2 - 0.5;
    const safeRadius = 1.2;
    
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let pos, size;
      
      while (!validPosition && attempts < 100) {
        pos = {
          x: (Math.random() - 0.5) * (halfSize * 2 - 2),
          z: (Math.random() - 0.5) * (halfSize * 2 - 2)
        };
        
        const width = 0.8 + Math.random() * 1.5;
        const depth = 0.8 + Math.random() * 1.5;
        size = { width, height: 0.6, depth };
        
        validPosition = this.isValidObstaclePosition(pos, size, ballPos, holePos, safeRadius);
        attempts++;
      }
      
      if (validPosition) {
        const obstacle = new Obstacle(
          this.sceneManager,
          this.physicsEngine,
          this.platform.mesh,
          pos,
          size
        );
        this.obstacles.push(obstacle);
      }
    }
  }

  isValidObstaclePosition(pos, size, ballPos, holePos, safeRadius) {
    const halfW = size.width / 2 + 0.3;
    const halfD = size.depth / 2 + 0.3;
    
    if (this.isOverlapping(pos, halfW, halfD, ballPos, safeRadius)) return false;
    if (this.isOverlapping(pos, halfW, halfD, holePos, safeRadius)) return false;
    
    if (this.doesLineIntersectRect(ballPos, holePos, pos, halfW, halfD)) return false;
    
    for (const obstacle of this.obstacles) {
      const oSize = obstacle.size;
      const oPos = obstacle.position;
      const oHalfW = oSize.width / 2 + 0.3;
      const oHalfD = oSize.depth / 2 + 0.3;
      
      if (this.rectsOverlap(pos, halfW, halfD, oPos, oHalfW, oHalfD)) {
        return false;
      }
    }
    
    return true;
  }

  isOverlapping(rectPos, halfW, halfD, point, radius) {
    const closestX = Math.max(rectPos.x - halfW, Math.min(point.x, rectPos.x + halfW));
    const closestZ = Math.max(rectPos.z - halfD, Math.min(point.z, rectPos.z + halfD));
    const dx = point.x - closestX;
    const dz = point.z - closestZ;
    return (dx * dx + dz * dz) < (radius * radius);
  }

  rectsOverlap(pos1, w1, d1, pos2, w2, d2) {
    return Math.abs(pos1.x - pos2.x) < (w1 + w2) &&
           Math.abs(pos1.z - pos2.z) < (d1 + d2);
  }

  doesLineIntersectRect(p1, p2, rectPos, halfW, halfD) {
    const left = rectPos.x - halfW;
    const right = rectPos.x + halfW;
    const top = rectPos.z - halfD;
    const bottom = rectPos.z + halfD;
    
    return this.lineIntersectsLine(p1, p2, {x: left, z: top}, {x: right, z: top}) ||
           this.lineIntersectsLine(p1, p2, {x: right, z: top}, {x: right, z: bottom}) ||
           this.lineIntersectsLine(p1, p2, {x: right, z: bottom}, {x: left, z: bottom}) ||
           this.lineIntersectsLine(p1, p2, {x: left, z: bottom}, {x: left, z: top});
  }

  lineIntersectsLine(p1, p2, p3, p4) {
    const d1 = this.direction(p3, p4, p1);
    const d2 = this.direction(p3, p4, p2);
    const d3 = this.direction(p1, p2, p3);
    const d4 = this.direction(p1, p2, p4);
    
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }
    
    return false;
  }

  direction(p1, p2, p3) {
    return (p3.x - p1.x) * (p2.z - p1.z) - (p2.x - p1.x) * (p3.z - p1.z);
  }

  clearObstacles() {
    this.obstacles.forEach(obstacle => obstacle.dispose());
    this.obstacles = [];
  }

  update() {
    this.targetHoles.forEach(hole => hole.animate());
    
    if (this.isResetting) return;

    const ballPos = this.ball.getPosition();

    if (this.checkGoal(ballPos)) {
      this.handleSuccess();
      return;
    }

    if (this.checkOutOfBounds(ballPos)) {
      this.handleFail();
      return;
    }
  }

  checkGoal(ballPos) {
    const currentHole = this.targetHoles[this.currentTargetIndex];
    return currentHole.isBallInside(ballPos, PHYSICS.ballRadius);
  }

  checkOutOfBounds(ballPos) {
    const halfSize = PHYSICS.platformSize / 2;
    const margin = 1;
    return (
      Math.abs(ballPos.x) > halfSize + margin ||
      Math.abs(ballPos.z) > halfSize + margin ||
      ballPos.y < -5
    );
  }

  handleSuccess() {
    this.isResetting = true;
    this.score++;
    
    const currentHole = this.targetHoles[this.currentTargetIndex];
    const holePos = currentHole.getPosition();
    this.ball.fallIntoHole(holePos.x, holePos.z);
    
    const isWin = this.score >= GAME.maxScore;
    const message = isWin ? '🎉 恭喜通关！' : '✓ 成功！';
    
    this.uiManager.showStatus(message, 'success');
    this.updateUI();

    setTimeout(() => {
      if (isWin) {
        this.score = 0;
        this.updateUI();
      }
      this.resetBallAndPlatform();
      this.generateLevel();
    }, GAME.resetDelay);
  }

  handleFail() {
    this.isResetting = true;
    this.uiManager.showStatus('✗ 掉出平板！', 'fail');

    setTimeout(() => {
      this.resetBallAndPlatform();
    }, GAME.resetDelay);
  }

  resetBallAndPlatform() {
    this.ball.restoreCollision();
    this.platform.reset();
    this.isResetting = false;
  }

  updateUI() {
    this.uiManager.updateScore(this.score);
  }

  getScore() {
    return this.score;
  }

  isGameActive() {
    return !this.isResetting;
  }

  dispose() {
    this.clearObstacles();
    this.targetHoles.forEach(hole => {
      this.platform.mesh.remove(hole.ringMesh);
      this.platform.mesh.remove(hole.innerDisc);
    });
    this.targetHoles = [];
  }
}
