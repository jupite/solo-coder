import * as THREE from 'three';
import { CONFIG } from './config.js';

export class ScoringSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.rotationCount = 0;
    this.totalRotationX = 0;
    this.totalRotationZ = 0;
    this.verticalScore = 0;
    this.complexityScore = 0;
    this.splashScore = 0;
    this.totalScore = 0;
    this.actions = [];
  }

  recordRotation(deltaX, deltaZ) {
    this.totalRotationX += Math.abs(deltaX);
    this.totalRotationZ += Math.abs(deltaZ);

    const fullRotationX = Math.floor(this.totalRotationX / (Math.PI * 2));
    const fullRotationZ = Math.floor(this.totalRotationZ / (Math.PI * 2));

    this.rotationCount = fullRotationX + fullRotationZ;
  }

  calculateVerticalScore(verticalAlignment) {
    if (verticalAlignment >= 1 - CONFIG.PERFECT_VERTICAL_THRESHOLD) {
      this.verticalScore = 40;
    } else if (verticalAlignment >= 1 - CONFIG.GOOD_VERTICAL_THRESHOLD) {
      const t = (verticalAlignment - (1 - CONFIG.GOOD_VERTICAL_THRESHOLD)) /
                (CONFIG.GOOD_VERTICAL_THRESHOLD - CONFIG.PERFECT_VERTICAL_THRESHOLD);
      this.verticalScore = 20 + t * 20;
    } else {
      const t = Math.max(0, verticalAlignment) / (1 - CONFIG.GOOD_VERTICAL_THRESHOLD);
      this.verticalScore = t * 20;
    }
    return this.verticalScore;
  }

  calculateComplexityScore() {
    const rotations = this.rotationCount;

    if (rotations >= 4) {
      this.complexityScore = 30;
    } else if (rotations >= 3) {
      this.complexityScore = 25;
    } else if (rotations >= 2) {
      this.complexityScore = 18;
    } else if (rotations >= 1) {
      this.complexityScore = 10;
    } else {
      this.complexityScore = 5;
    }

    return this.complexityScore;
  }

  calculateSplashScore(splashSize) {
    this.splashScore = Math.max(0, 30 * (1 - splashSize));
    return this.splashScore;
  }

  calculateFinalScore(verticalAlignment) {
    this.calculateVerticalScore(verticalAlignment);
    this.calculateComplexityScore();
    const splashFactor = 1.0 - verticalAlignment;
    this.calculateSplashScore(splashFactor);

    this.totalScore = this.verticalScore + this.complexityScore + this.splashScore;
    this.totalScore = Math.min(100, Math.round(this.totalScore));

    return this.totalScore;
  }

  getScoreBreakdown() {
    return {
      total: this.totalScore,
      vertical: Math.round(this.verticalScore),
      complexity: this.complexityScore,
      splash: Math.round(this.splashScore),
      rotations: this.rotationCount
    };
  }

  getGrade() {
    if (this.totalScore >= 90) return 'S';
    if (this.totalScore >= 80) return 'A';
    if (this.totalScore >= 70) return 'B';
    if (this.totalScore >= 60) return 'C';
    return 'D';
  }

  getComment() {
    const grade = this.getGrade();
    const comments = {
      'S': '完美！专业跳水选手级别！',
      'A': '非常出色！动作优美，入水干净！',
      'B': '不错的表现，继续努力！',
      'C': '及格了，还有提升空间！',
      'D': '加油！多练习会更好！'
    };
    return comments[grade];
  }
}

export class ActionLogger {
  constructor() {
    this.actions = [];
    this.lastActionTime = 0;
  }

  log(action) {
    const now = Date.now();
    if (now - this.lastActionTime > 200) {
      this.actions.push({ action, time: now });
      if (this.actions.length > 10) {
        this.actions.shift();
      }
      this.lastActionTime = now;

      const display = document.getElementById('action-indicator');
      if (display) {
        const recent = this.actions.slice(-3).map(a => a.action).join(' + ');
        display.textContent = recent;
      }
    }
  }

  reset() {
    this.actions = [];
    this.lastActionTime = 0;
    const display = document.getElementById('action-indicator');
    if (display) {
      display.textContent = '';
    }
  }

  getRecentActions() {
    return this.actions.slice(-5).map(a => a.action);
  }
}
