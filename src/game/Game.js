import { SceneManager } from './SceneManager.js';
import { DrumKit } from './DrumKit.js';
import { NoteManager } from './NoteManager.js';
import { InputHandler } from './InputHandler.js';
import { ScoreManager } from './ScoreManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { AudioManager } from './AudioManager.js';
import { BeatVisualizer } from './BeatVisualizer.js';

export class Game {
  constructor() {
    this.sceneManager = null;
    this.drumKit = null;
    this.noteManager = null;
    this.inputHandler = null;
    this.scoreManager = null;
    this.particleSystem = null;
    this.audioManager = null;
    this.beatVisualizer = null;
    this.isRunning = false;
    this.gameTime = 0;
  }

  init() {
    const container = document.getElementById('game-canvas-container');

    this.sceneManager = new SceneManager(container);
    this.sceneManager.init();

    this.drumKit = new DrumKit(this.sceneManager.scene);
    this.drumKit.init();

    this.noteManager = new NoteManager(this.sceneManager.scene);
    this.noteManager.init();

    this.inputHandler = new InputHandler(this.sceneManager, this.drumKit);
    this.inputHandler.init();
    this.inputHandler.setOnHitCallback((laneIndex) => this.handleHit(laneIndex));

    this.scoreManager = new ScoreManager();
    this.scoreManager.init();
    this.scoreManager.setOnScoreUpdate((score, combo, isFever) => this.updateScoreUI(score, combo, isFever));
    this.scoreManager.setOnFeverChange((isFever) => this.handleFeverChange(isFever));

    this.particleSystem = new ParticleSystem(this.sceneManager.scene);

    this.audioManager = new AudioManager();
    this.audioManager.init();
    this.audioManager.setOnBeatCallback(() => this.handleBeat());

    this.beatVisualizer = new BeatVisualizer(this.sceneManager.scene);
    this.beatVisualizer.init();

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', () => {
      this.audioManager.resume();
      if (!this.isRunning) {
        this.start();
      }
    }, { once: false });
  }

  start() {
    this.isRunning = true;
    this.gameTime = 0;
    this.animate();
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    const delta = this.sceneManager.getDelta();
    this.gameTime += delta;

    this.update(delta);
    this.sceneManager.render();
  }

  update(delta) {
    this.drumKit.update(delta);
    this.noteManager.update(delta);
    this.particleSystem.update(delta);
    this.beatVisualizer.update(delta, this.scoreManager.isFever);

    const currentTimeMs = this.gameTime * 1000;
    this.audioManager.update(currentTimeMs);

    const missedNotes = this.noteManager.checkMisses();
    missedNotes.forEach(() => {
      this.scoreManager.miss();
      this.audioManager.playMissSound();
    });
  }

  handleHit(laneIndex) {
    const hitNote = this.noteManager.checkHit(laneIndex);

    if (hitNote) {
      const points = this.scoreManager.hit();
      this.particleSystem.emit(hitNote.getPosition(), hitNote.color);
      this.audioManager.playHitSound(laneIndex);
      this.showHitEffect(laneIndex, points);
    } else {
      this.audioManager.playHitSound(laneIndex);
    }
  }

  handleBeat() {
    this.beatVisualizer.triggerBeat();
  }

  handleFeverChange(isFever) {
    const feverIndicator = document.getElementById('fever-indicator');
    if (isFever) {
      feverIndicator.classList.remove('hidden');
    } else {
      feverIndicator.classList.add('hidden');
    }
  }

  showHitEffect(laneIndex, points) {
    const keyHints = document.querySelectorAll('.key-hint');
    if (keyHints[laneIndex]) {
      keyHints[laneIndex].classList.add('hit');
      setTimeout(() => {
        keyHints[laneIndex].classList.remove('hit');
      }, 100);
    }
  }

  updateScoreUI(score, combo, isFever) {
    const scoreValue = document.getElementById('score-value');
    const comboValue = document.getElementById('combo-value');

    scoreValue.textContent = score;
    comboValue.textContent = combo;

    comboValue.classList.toggle('fever', isFever);
  }
}
