import { PHYSICS, GAME } from '../utils/constants.js';
import { TargetHole } from './TargetHole.js';

export class GameLogic {
  constructor(sceneManager, ball, platform, uiManager) {
    this.sceneManager = sceneManager;
    this.ball = ball;
    this.platform = platform;
    this.uiManager = uiManager;
    
    this.score = 0;
    this.isResetting = false;
    this.targetHoles = [];
    this.currentTargetIndex = 0;
    
    this.init();
  }

  init() {
    this.createTargetHoles();
    this.updateUI();
  }

  createTargetHoles() {
    const halfSize = PHYSICS.platformSize / 2 - 1.5;
    const positions = [
      { x: -halfSize, z: -halfSize },
      { x: halfSize, z: -halfSize },
      { x: halfSize, z: halfSize },
      { x: -halfSize, z: halfSize },
    ];

    this.targetHoles = positions.map(pos => new TargetHole(this.sceneManager, pos));
  }

  update() {
    this.targetHoles.forEach(hole => hole.animate());
    
    if (this.isResetting) return;

    const ballPos = this.ball.getPosition();
    const ballVel = this.ball.getVelocity();

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
    this.currentTargetIndex = (this.currentTargetIndex + 1) % this.targetHoles.length;
    
    const isWin = this.score >= GAME.maxScore;
    const message = isWin ? '🎉 恭喜通关！' : '✓ 成功！';
    
    this.uiManager.showStatus(message, 'success');
    this.updateUI();

    setTimeout(() => {
      if (isWin) {
        this.score = 0;
        this.currentTargetIndex = 0;
        this.updateUI();
      }
      this.resetBallAndPlatform();
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
    this.ball.reset();
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
    this.targetHoles.forEach(hole => {
      this.sceneManager.remove(hole.ringMesh);
      this.sceneManager.remove(hole.innerDisc);
    });
    this.targetHoles = [];
  }
}
