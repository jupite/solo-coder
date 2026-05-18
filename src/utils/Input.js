export class InputManager {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.keyMap = {
      KeyW: 'forward',
      KeyS: 'backward',
      KeyA: 'left',
      KeyD: 'right'
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(event) {
    const action = this.keyMap[event.code];
    if (action) {
      this.keys[action] = true;
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    const action = this.keyMap[event.code];
    if (action) {
      this.keys[action] = false;
      event.preventDefault();
    }
  }

  getMovement() {
    return { ...this.keys };
  }

  reset() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
  }
}
