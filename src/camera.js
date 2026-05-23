import * as THREE from 'three';
import { CONFIG, GAME_STATE } from './config.js';

export class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.desiredPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.isFollowing = false;

    this.startPosition = new THREE.Vector3(0, 8, 28);
    this.startLookAt = new THREE.Vector3(0, 14, 3);

    this.followOffset = new THREE.Vector3(0, 6, 18);

    this.resetCamera();
  }

  resetCamera() {
    this.camera.position.copy(this.startPosition);
    this.currentLookAt.copy(this.startLookAt);
    this.camera.lookAt(this.currentLookAt);
    this.isFollowing = false;
  }

  startFollowing() {
    this.isFollowing = true;
  }

  update(deltaTime, gameState) {
    if (!this.isFollowing || !this.target) return;

    const targetPos = this.target.getPosition();

    if (gameState === GAME_STATE.JUMPING || gameState === GAME_STATE.FALLING) {
      this.desiredPosition.set(
        targetPos.x + this.followOffset.x,
        targetPos.y + this.followOffset.y,
        targetPos.z + this.followOffset.z
      );

      this.camera.position.lerp(this.desiredPosition, 3 * deltaTime);

      this.currentLookAt.lerp(
        new THREE.Vector3(
          targetPos.x,
          targetPos.y + 3,
          targetPos.z - 5
        ),
        3 * deltaTime
      );
      this.camera.lookAt(this.currentLookAt);
    } else if (gameState === GAME_STATE.ENTERED_WATER || gameState === GAME_STATE.SCORED) {
      this.desiredPosition.set(
        targetPos.x,
        targetPos.y + 4,
        targetPos.z + 12
      );
      this.camera.position.lerp(this.desiredPosition, 2 * deltaTime);
      this.camera.lookAt(targetPos);
    }
  }
}
