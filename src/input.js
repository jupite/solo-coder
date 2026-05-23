import { CONFIG, GAME_STATE } from './config.js';

export class InputManager {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.power = 0;
    this.isCharging = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.handleKeyUp(e);
    });

    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
      this.game.restart();
    });
  }

  handleKeyDown(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.game.state === GAME_STATE.IDLE) {
        this.startCharging();
      }
    }

    if (e.code === 'KeyR') {
      this.game.restart();
    }
  }

  handleKeyUp(e) {
    if (e.code === 'Space' && this.game.state === GAME_STATE.CHARGING) {
      this.releaseJump();
    }
  }

  startCharging() {
    this.isCharging = true;
    this.power = 0;
    this.game.setState(GAME_STATE.CHARGING);
    this.game.ui.showPowerBar();
  }

  releaseJump() {
    this.isCharging = false;
    const finalPower = Math.max(CONFIG.MIN_JUMP_POWER, this.power * CONFIG.MAX_JUMP_POWER);
    this.game.performJump(finalPower);
    this.game.ui.hidePowerBar();
  }

  update(deltaTime) {
    if (this.isCharging) {
      this.power += (CONFIG.POWER_CHARGE_RATE / 100) * deltaTime;
      if (this.power > 1) {
        this.power = 1;
      }
      this.game.ui.updatePowerBar(this.power * 100);
    }

    if (this.game.state === GAME_STATE.JUMPING || this.game.state === GAME_STATE.FALLING) {
      this.updateAirControls(deltaTime);
    }
  }

  updateAirControls(deltaTime) {
    let flipAxis = 0;
    let twistAxis = 0;

    if (this.keys['KeyW']) flipAxis = 1;
    if (this.keys['KeyS']) flipAxis = -1;
    if (this.keys['KeyA']) twistAxis = -1;
    if (this.keys['KeyD']) twistAxis = 1;

    if (flipAxis !== 0) {
      this.game.player.angularVelocity.x = flipAxis * CONFIG.FLIP_SPEED;
      this.game.actionLogger.log(flipAxis > 0 ? '前翻' : '后翻');
    }

    if (twistAxis !== 0) {
      this.game.player.angularVelocity.z = twistAxis * CONFIG.TWIST_SPEED;
      this.game.actionLogger.log(twistAxis > 0 ? '右翻' : '左翻');
    }
  }

  reset() {
    this.power = 0;
    this.isCharging = false;
    this.keys = {};
  }
}
