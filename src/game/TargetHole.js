import * as THREE from 'three';
import { PHYSICS, GAME, COLORS } from '../utils/constants.js';

export class TargetHole {
  constructor(sceneManager, position, platformMesh) {
    this.sceneManager = sceneManager;
    this.position = position;
    this.platformMesh = platformMesh;
    this.ringMesh = null;
    this.innerDisc = null;
    this.init();
  }

  init() {
    const outerRadius = GAME.holeRadius + 0.15;
    const innerRadius = GAME.holeRadius;
    const tube = 0.08;

    const ringGeometry = new THREE.TorusGeometry(outerRadius, tube, 16, 64);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.targetHole,
      metalness: 0.8,
      roughness: 0.2,
      emissive: COLORS.targetHole,
      emissiveIntensity: 0.3,
    });

    this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ringMesh.rotation.x = -Math.PI / 2;
    this.ringMesh.position.set(this.position.x, PHYSICS.platformThickness / 2 + 0.001, this.position.z);
    this.ringMesh.castShadow = true;
    this.platformMesh.add(this.ringMesh);

    const innerGeometry = new THREE.CircleGeometry(innerRadius, 64);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.targetHoleInner,
      side: THREE.DoubleSide,
    });
    
    this.innerDisc = new THREE.Mesh(innerGeometry, innerMaterial);
    this.innerDisc.rotation.x = -Math.PI / 2;
    this.innerDisc.position.set(this.position.x, PHYSICS.platformThickness / 2 + 0.002, this.position.z);
    this.platformMesh.add(this.innerDisc);
  }

  getPosition() {
    return this.position;
  }

  isBallInside(ballPos, ballRadius) {
    const dx = ballPos.x - this.position.x;
    const dz = ballPos.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    return distance < GAME.holeRadius - ballRadius * 0.3 && ballPos.y < 0.5;
  }

  animate() {
    if (this.ringMesh) {
      this.ringMesh.rotation.z += 0.02;
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
      this.ringMesh.scale.set(scale, scale, scale);
    }
  }

  setPosition(x, z) {
    this.position = { x, z };
    if (this.ringMesh) {
      this.ringMesh.position.set(x, PHYSICS.platformThickness / 2 + 0.001, z);
    }
    if (this.innerDisc) {
      this.innerDisc.position.set(x, PHYSICS.platformThickness / 2 + 0.002, z);
    }
  }
}
