import { levels } from '../game/levels.js';

export class LevelSelect {
  constructor() {
    this.container = document.getElementById('level-select-screen');
    this.grid = document.getElementById('level-grid');
    this.backBtn = document.getElementById('back-to-menu-btn');
    this.selectedLevel = null;
    this.onLevelSelectCallback = null;
    this.onBackCallback = null;

    this.renderLevels();
    this.setupEventListeners();
  }

  renderLevels() {
    this.grid.innerHTML = '';

    levels.forEach(level => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.dataset.levelId = level.id;

      const stars = this.getDifficultyStars(level.difficulty);

      card.innerHTML = `
        <div class="level-number">${level.id}</div>
        <div class="level-name">${level.name}</div>
        <div class="level-desc">${level.description}</div>
        <div class="level-difficulty">
          ${stars}
        </div>
      `;

      card.addEventListener('click', () => this.selectLevel(level.id));
      this.grid.appendChild(card);
    });
  }

  getDifficultyStars(difficulty) {
    const maxStars = 5;
    let stars = '';
    for (let i = 0; i < maxStars; i++) {
      const filled = i < difficulty;
      stars += `<span class="star ${filled ? 'filled' : ''}">★</span>`;
    }
    return stars;
  }

  selectLevel(levelId) {
    this.selectedLevel = levelId;

    document.querySelectorAll('.level-card').forEach(card => {
      card.classList.remove('selected');
      if (parseInt(card.dataset.levelId) === levelId) {
        card.classList.add('selected');
      }
    });

    if (this.onLevelSelectCallback) {
      setTimeout(() => {
        this.onLevelSelectCallback(levelId);
      }, 300);
    }
  }

  setupEventListeners() {
    this.backBtn.addEventListener('click', () => {
      if (this.onBackCallback) {
        this.onBackCallback();
      }
    });
  }

  onLevelSelect(callback) {
    this.onLevelSelectCallback = callback;
  }

  onBack(callback) {
    this.onBackCallback = callback;
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
