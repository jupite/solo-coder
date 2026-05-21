import * as THREE from 'three';
import { GAME_CONFIG } from '../config/config.js';

export class Note {
  constructor(laneIndex, color, xPosition) {
    this.laneIndex = laneIndex;
    this.color = color;
    this.xPosition = xPosition;
    this.y = GAME_CONFIG.NOTE.spawnY;
    this.speed = GAME_CONFIG.NOTE.speed;
    this.isActive = true;
    this.isHit = false;

    this.mesh = this.createMesh();
    this.mesh.position.set(xPosition, this.y, 0);
  }

  createMesh() {
    const group = new THREE.Group();

    const geometry = new THREE.SphereGeometry(GAME_CONFIG.NOTE.radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    group.add(sphere);

    const glowGeometry = new THREE.SphereGeometry(GAME_CONFIG.NOTE.radius * 1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    return group;
  }

  update(delta) {
    if (!this.isActive) return;

    this.y -= this.speed * delta;
    this.mesh.position.y = this.y;

    this.mesh.rotation.y += delta * 2;

    if (this.y < GAME_CONFIG.NOTE.removeY) {
      this.isActive = false;
    }
  }

  canHit() {
    if (this.isHit || !this.isActive) return false;
    const distance = Math.abs(this.y - GAME_CONFIG.NOTE.hitY);
    return distance <= GAME_CONFIG.NOTE.hitTolerance * this.speed;
  }

  checkHit() {
    if (!this.canHit()) return false;
    this.isHit = true;
    this.isActive = false;
    return true;
  }

  hasMissed() {
    if (this.isHit) return false;
    return this.y < GAME_CONFIG.NOTE.hitY - GAME_CONFIG.NOTE.hitTolerance * this.speed;
  }

  getPosition() {
    return new THREE.Vector3(this.xPosition, this.y, 0);
  }
}
