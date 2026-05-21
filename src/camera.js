import * as THREE from 'three';
import { CONFIG, GAME_STATE } from './config.js';

export class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.desiredPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.isFollowing = false;
    this.startPosition = new THREE.Vector3(0, 12, -10);
    this.startLookAt = new THREE.Vector3(0, 10, 5);

    this.resetCamera();
  }

  resetCamera() {
    this.camera.position.copy(this.startPosition);
    this.camera.lookAt(this.startLookAt);
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
        targetPos.x,
        targetPos.y + CONFIG.CAMERA_OFFSET_Y,
        targetPos.z - CONFIG.CAMERA_OFFSET_Z
      );

      this.camera.position.lerp(this.desiredPosition, CONFIG.CAMERA_FOLLOW_SPEED * deltaTime);

      this.currentLookAt.lerp(
        new THREE.Vector3(
          targetPos.x,
          targetPos.y + CONFIG.CAMERA_LOOK_AHEAD,
          targetPos.z + 5
        ),
        CONFIG.CAMERA_FOLLOW_SPEED * deltaTime
      );
      this.camera.lookAt(this.currentLookAt);
    } else if (gameState === GAME_STATE.ENTERED_WATER || gameState === GAME_STATE.SCORED) {
      this.desiredPosition.set(
        targetPos.x,
        targetPos.y + 3,
        targetPos.z - 5
      );
      this.camera.position.lerp(this.desiredPosition, 2 * deltaTime);
      this.camera.lookAt(targetPos);
    }
  }
}
