import { GameManager } from './game/GameManager.js';
import { SceneManager } from './three/SceneManager.js';
import { BlockRenderer } from './three/BlockRenderer.js';
import { DirectionIndicator } from './three/DirectionIndicator.js';
import { UIManager } from './ui/UIManager.js';
import { GameState } from './game/types.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('game-container');
    this.gameManager = new GameManager();
    this.sceneManager = new SceneManager(this.container);
    this.blockRenderer = new BlockRenderer(this.sceneManager);
    this.directionIndicator = new DirectionIndicator(this.sceneManager);
    this.uiManager = new UIManager();

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupGameListeners();
    this.sceneManager.addUpdateCallback(this.update.bind(this));
    this.sceneManager.startAnimation();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.gameManager.state === GameState.PLAYING) {
          this.gameManager.dropBlock();
        }
      }
    });

    this.uiManager.onStart(() => {
      this.startGame();
    });

    this.uiManager.onRestart(() => {
      this.restartGame();
    });
  }

  setupGameListeners() {
    this.gameManager.on('blockSpawned', (data) => {
      this.blockRenderer.createBlockMesh(data.block);
      if (data.isMoving) {
        this.directionIndicator.setDirection(this.gameManager.nextMoveDirection);
        this.directionIndicator.setHeight(this.gameManager.layer);
        this.directionIndicator.setVisible(true);
      }
    });

    this.gameManager.on('blockUpdated', (block) => {
      this.blockRenderer.updateMovingBlock(block);
    });

    this.gameManager.on('blockStacked', (data) => {
      this.blockRenderer.updateBlockMesh(data.block);
      this.sceneManager.updateCameraHeight(this.gameManager.layer);
      if (data.isPerfect) {
        this.uiManager.showMessage(`完美! +${data.streak}`);
      }
    });

    this.gameManager.on('cutParts', (data) => {
      this.blockRenderer.createCutParts(data.parts, data.color);
    });

    this.gameManager.on('layerChanged', (layer) => {
      this.uiManager.updateLayer(layer);
    });

    this.gameManager.on('scoreChanged', (score) => {
      this.uiManager.updateScore(score);
    });

    this.gameManager.on('perfectStack', (streak) => {
      this.uiManager.updateStreak(streak);
    });

    this.gameManager.on('directionChanged', (direction) => {
      this.uiManager.updateDirection(direction);
    });

    this.gameManager.on('stateChanged', (state) => {
      if (state === GameState.WIN) {
        this.directionIndicator.setVisible(false);
        this.uiManager.showWinScreen(this.gameManager.layer, this.gameManager.score);
      } else if (state === GameState.GAME_OVER) {
        this.directionIndicator.setVisible(false);
        this.uiManager.showGameOverScreen(this.gameManager.layer, this.gameManager.score);
      } else if (state === GameState.PLAYING) {
        this.directionIndicator.setVisible(true);
      }
    });
  }

  startGame() {
    this.uiManager.hideAllOverlays();
    this.gameManager.start();
    this.uiManager.updateDirection(this.gameManager.nextMoveDirection);
  }

  restartGame() {
    this.blockRenderer.clearAll();
    this.directionIndicator.setVisible(false);
    this.uiManager.updateLayer(0);
    this.uiManager.updateScore(0);
    this.uiManager.updateStreak(0);
    this.sceneManager.updateCameraHeight(0);
    this.startGame();
  }

  update(deltaTime) {
    this.gameManager.update(deltaTime);
    this.blockRenderer.updateCutParts(deltaTime);
    this.directionIndicator.update(deltaTime);
  }

  dispose() {
    this.sceneManager.dispose();
    this.uiManager.dispose();
    this.directionIndicator.dispose();
  }
}

const game = new GameApp();
