import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class RingSystem {
  constructor(scene) {
    this.scene = scene;
    this.rings = [];
    this.ringRadius = 8;
    this.maxRings = 8;
    this.spawnDistance = 100;
    this.maxDistance = 600;
  }

  createRing(position) {
    const group = new THREE.Group();

    const tubeGeo = new THREE.TorusGeometry(this.ringRadius, 0.5, 16, 32);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    const innerGeo = new THREE.TorusGeometry(this.ringRadius * 0.8, 0.2, 8, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffdd00,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.6
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    const glowGeo = new THREE.TorusGeometry(this.ringRadius * 1.2, 0.1, 8, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    group.position.copy(position);
    group.rotation.y = Math.random() * Math.PI * 2;

    const ring = {
      mesh: group,
      collected: false,
      rotationSpeed: randomRange(0.5, 1.5),
      pulsePhase: Math.random() * Math.PI * 2
    };

    return ring;
  }

  spawnRing(playerPos, forwardDir) {
    const angle = randomRange(-Math.PI / 4, Math.PI / 4);
    const distance = randomRange(80, 200);

    const spawnPos = playerPos.clone();
    spawnPos.x += forwardDir.x * distance + Math.sin(angle) * 30;
    spawnPos.z += forwardDir.z * distance + Math.cos(angle) * 30;
    spawnPos.y += randomRange(20, 80);

    const terrainHeight = this.terrain ? this.terrain.getHeight(spawnPos.x, spawnPos.z) : 0;
    spawnPos.y = Math.max(spawnPos.y, terrainHeight + 30);

    const ring = this.createRing(spawnPos);
    this.rings.push(ring);
    this.scene.add(ring.mesh);
  }

  init(terrain, playerPos) {
    this.terrain = terrain;
    const forwardDir = new THREE.Vector3(1, 0, 0);

    for (let i = 0; i < this.maxRings; i++) {
      const distance = 80 + i * 60;
      const spawnPos = playerPos.clone();
      spawnPos.x += forwardDir.x * distance + randomRange(-50, 50);
      spawnPos.z += forwardDir.z * distance + randomRange(-50, 50);
      spawnPos.y += randomRange(20, 80);

      const terrainHeight = terrain.getHeight(spawnPos.x, spawnPos.z);
      spawnPos.y = Math.max(spawnPos.y, terrainHeight + 30);

      const ring = this.createRing(spawnPos);
      this.rings.push(ring);
      this.scene.add(ring.mesh);
    }
  }

  checkCollision(playerPos, velocity) {
    const collectedRings = [];

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      if (ring.collected) continue;

      const distance = playerPos.distanceTo(ring.mesh.position);

      if (distance < this.ringRadius + 2) {
        ring.collected = true;
        collectedRings.push(ring);
        this.scene.remove(ring.mesh);
        this.rings.splice(i, 1);
      }
    }

    return collectedRings.length;
  }

  update(dt, playerPos, velocity) {
    const forwardDir = velocity.clone().normalize();
    if (forwardDir.length() < 0.1) {
      forwardDir.set(1, 0, 0);
    }

    for (const ring of this.rings) {
      ring.mesh.rotation.y += ring.rotationSpeed * dt;
      ring.pulsePhase += dt * 2;
      const pulse = 1 + Math.sin(ring.pulsePhase) * 0.1;
      ring.mesh.scale.setScalar(pulse);

      const distance = playerPos.distanceTo(ring.mesh.position);
      if (distance > this.maxDistance) {
        this.scene.remove(ring.mesh);
        const index = this.rings.indexOf(ring);
        if (index > -1) {
          this.rings.splice(index, 1);
        }
      }
    }

    while (this.rings.length < this.maxRings) {
      this.spawnRing(playerPos, forwardDir);
    }
  }

  reset(playerPos, terrain) {
    for (const ring of this.rings) {
      this.scene.remove(ring.mesh);
    }
    this.rings = [];
    this.init(terrain, playerPos);
  }
}
