import SceneManager from './managers/SceneManager.js';
import PieceManager from './managers/PieceManager.js';
import InteractionManager from './managers/InteractionManager.js';
import SnapDetector from './managers/SnapDetector.js';
import VictoryManager from './managers/VictoryManager.js';

class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.loadingElement = document.getElementById('loading');
    
    this.init();
  }

  init() {
    this.sceneManager = new SceneManager(this.container);
    this.pieceManager = new PieceManager(this.sceneManager);
    this.snapDetector = new SnapDetector(this.sceneManager, this.pieceManager, {
      positionThreshold: 0.8,
      rotationThreshold: 0.5,
      snapPrecision: 0.2
    });
    this.interactionManager = new InteractionManager(
      this.sceneManager,
      this.pieceManager,
      this.snapDetector
    );
    this.victoryManager = new VictoryManager(this.sceneManager, this.pieceManager);
    
    this.hideLoading();
    this.animate();
  }

  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.sceneManager.getDelta();
    
    this.sceneManager.update();
    this.snapDetector.update(delta);
    this.victoryManager.updateTimer();
    
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
