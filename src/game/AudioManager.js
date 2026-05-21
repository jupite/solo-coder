export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.bpm = 120;
    this.beatInterval = 60000 / this.bpm;
    this.lastBeatTime = 0;
    this.onBeat = null;
    this.oscillators = [];
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playBeatSound() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  playHitSound(colorIndex) {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;
    const frequencies = [523, 659, 784];
    const frequency = frequencies[colorIndex] || 523;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + 0.15);

    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  playMissSound() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  setOnBeatCallback(callback) {
    this.onBeat = callback;
  }

  update(currentTime) {
    if (!this.isInitialized) return;

    const timeSinceLastBeat = currentTime - this.lastBeatTime;
    if (timeSinceLastBeat >= this.beatInterval) {
      this.lastBeatTime = currentTime;
      this.playBeatSound();
      if (this.onBeat) {
        this.onBeat();
      }
    }
  }
}
