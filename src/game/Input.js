export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.isPointerLocked = false;
    this.pitchInput = 0;
    this.rollInput = 0;
    this.yawInput = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseX += e.movementX * 0.002;
        this.mouseY += e.movementY * 0.002;
        this.mouseY = Math.max(-1, Math.min(1, this.mouseY));
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });
  }

  requestPointerLock(element) {
    if (!this.isPointerLocked) {
      element.addEventListener('click', () => {
        element.requestPointerLock();
      }, { once: true });
    }
  }

  update() {
    this.pitchInput = 0;
    this.rollInput = 0;
    this.yawInput = 0;

    if (this.keys['KeyW']) this.pitchInput += 1;
    if (this.keys['KeyS']) this.pitchInput -= 1;
    if (this.keys['KeyA']) this.rollInput += 1;
    if (this.keys['KeyD']) this.rollInput -= 1;

    if (this.isPointerLocked) {
      this.yawInput = -this.mouseX * 0.5;
      this.pitchInput += -this.mouseY * 0.5;
      this.mouseX *= 0.9;
    }
  }

  reset() {
    this.mouseX = 0;
    this.mouseY = 0;
  }
}
