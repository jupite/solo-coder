import { GAME_CONFIG } from '../config/config.js';

export class InputHandler {
  constructor(sceneManager, drumKit) {
    this.sceneManager = sceneManager;
    this.drumKit = drumKit;
    this.onHitCallback = null;
    this.isEnabled = true;
  }

  init() {
    this.setupKeyboardInput();
    this.setupMouseInput();
  }

  setupKeyboardInput() {
    window.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      const key = event.key.toLowerCase();
      const laneIndex = GAME_CONFIG.LANES.findIndex((lane) => lane.key === key);

      if (laneIndex !== -1) {
        this.handleHit(laneIndex);
      }
    });
  }

  setupMouseInput() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDown = false;

    this.sceneManager.renderer.domElement.addEventListener('mousedown', (event) => {
      if (!this.isEnabled) return;
      isDown = true;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.sceneManager.camera);

      const drumMeshes = [];
      this.drumKit.drums.forEach((drum) => {
        drumMeshes.push(drum.group);
      });

      const intersects = raycaster.intersectObjects(drumMeshes, true);

      if (intersects.length > 0) {
        let drumGroup = intersects[0].object;
        while (drumGroup.parent && !drumGroup.userData.isDrum) {
          drumGroup = drumGroup.parent;
        }

        if (drumGroup.userData.isDrum) {
          this.handleHit(drumGroup.userData.laneIndex);
        }
      }
    });

    this.sceneManager.renderer.domElement.addEventListener('mouseup', () => {
      isDown = false;
    });
  }

  handleHit(laneIndex) {
    this.drumKit.triggerHitAnimation(laneIndex);

    if (this.onHitCallback) {
      this.onHitCallback(laneIndex);
    }
  }

  setOnHitCallback(callback) {
    this.onHitCallback = callback;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}
