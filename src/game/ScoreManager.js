import { GAME_CONFIG } from '../config/config.js';

export class ScoreManager {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.isFever = false;
    this.onScoreUpdate = null;
    this.onFeverChange = null;
    this.onComboUpdate = null;
  }

  init() {
    this.updateUI();
  }

  hit() {
    const basePoints = GAME_CONFIG.SCORE.hitPoints;
    const points = this.isFever ? basePoints * GAME_CONFIG.SCORE.feverMultiplier : basePoints;
    this.score += points;
    this.combo++;

    if (this.combo >= GAME_CONFIG.SCORE.feverThreshold && !this.isFever) {
      this.enterFeverMode();
    }

    this.updateUI();
    return points;
  }

  miss() {
    this.score = Math.max(0, this.score - GAME_CONFIG.SCORE.missPenalty);
    this.resetCombo();
    this.updateUI();
  }

  resetCombo() {
    this.combo = 0;
    if (this.isFever) {
      this.exitFeverMode();
    }
    if (this.onComboUpdate) {
      this.onComboUpdate(this.combo);
    }
  }

  enterFeverMode() {
    this.isFever = true;
    if (this.onFeverChange) {
      this.onFeverChange(true);
    }
  }

  exitFeverMode() {
    this.isFever = false;
    if (this.onFeverChange) {
      this.onFeverChange(false);
    }
  }

  updateUI() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score, this.combo, this.isFever);
    }
  }

  setOnScoreUpdate(callback) {
    this.onScoreUpdate = callback;
  }

  setOnFeverChange(callback) {
    this.onFeverChange = callback;
  }

  setOnComboUpdate(callback) {
    this.onComboUpdate = callback;
  }
}
