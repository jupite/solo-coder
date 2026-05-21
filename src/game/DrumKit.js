import * as THREE from 'three';
import { GAME_CONFIG } from '../config/config.js';

export class DrumKit {
  constructor(scene) {
    this.scene = scene;
    this.drums = [];
    this.drumHitAnimations = [];
    this.hitScales = [];
    this.glowMeshes = [];
  }

  init() {
    GAME_CONFIG.LANES.forEach((lane, index) => {
      const drum = this.createDrum(lane.color, lane.position);
      this.drums.push(drum);
      this.drumHitAnimations[index] = 0;
      this.hitScales[index] = 1;
      this.glowMeshes[index] = drum.glow;
      this.scene.add(drum.group);
    });

    this.createStands();
  }

  createDrum(color, xPosition) {
    const group = new THREE.Group();
    group.position.x = xPosition;

    const drumBodyGeometry = new THREE.CylinderGeometry(0.6, 0.5, 0.3, 32);
    const drumBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.3
    });
    const drumBody = new THREE.Mesh(drumBodyGeometry, drumBodyMaterial);
    drumBody.position.y = 0;
    drumBody.castShadow = true;
    drumBody.receiveShadow = true;
    group.add(drumBody);

    const drumTopGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32);
    const drumTopMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.2
    });
    const drumTop = new THREE.Mesh(drumTopGeometry, drumTopMaterial);
    drumTop.position.y = 0.18;
    drumTop.castShadow = true;
    group.add(drumTop);

    const glowGeometry = new THREE.RingGeometry(0.55, 0.7, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.22;
    glow.rotation.x = -Math.PI / 2;
    group.add(glow);

    const rimGeometry = new THREE.TorusGeometry(0.58, 0.03, 8, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.2;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    group.userData = {
      isDrum: true,
      laneIndex: this.drums.length,
      color: color,
      drumTop: drumTop,
      glow: glow
    };

    return {
      group: group,
      drumTop: drumTop,
      glow: glow,
      baseEmissive: 0.2
    };
  }

  createStands() {
    const standGeometry = new THREE.CylinderGeometry(0.05, 0.08, 1, 8);
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.2
    });

    GAME_CONFIG.LANES.forEach((lane) => {
      const stand = new THREE.Mesh(standGeometry, standMaterial);
      stand.position.set(lane.position, -0.65, 0);
      stand.castShadow = true;
      this.scene.add(stand);

      const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
      const base = new THREE.Mesh(baseGeometry, standMaterial);
      base.position.set(lane.position, -1.1, 0);
      base.castShadow = true;
      this.scene.add(base);
    });
  }

  triggerHitAnimation(laneIndex) {
    this.drumHitAnimations[laneIndex] = 1;
    this.hitScales[laneIndex] = 1.3;
  }

  update(delta) {
    this.drums.forEach((drum, index) => {
      if (this.drumHitAnimations[index] > 0) {
        this.drumHitAnimations[index] -= delta * 3;
        if (this.drumHitAnimations[index] < 0) {
          this.drumHitAnimations[index] = 0;
        }

        const animation = this.drumHitAnimations[index];
        drum.drumTop.material.emissiveIntensity = 0.2 + animation * 0.8;
        drum.glow.material.opacity = animation * 0.5;

        if (this.hitScales[index] > 1) {
          this.hitScales[index] -= delta * 2;
          if (this.hitScales[index] < 1) {
            this.hitScales[index] = 1;
          }
          drum.drumTop.scale.setScalar(this.hitScales[index]);
        }
      }
    });
  }

  getDrumGroup(laneIndex) {
    return this.drums[laneIndex].group;
  }
}
