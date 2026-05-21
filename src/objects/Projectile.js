import * as THREE from 'three';
import { COLORS, CONSTANTS } from '../game/constants.js';

export class Projectile {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.velocity = new THREE.Vector3();
    this.isActive = false;
    this.trail = [];
    this.trailMesh = null;
    this.historyTrails = [];
    this.maxHistoryTrails = 20;
    
    this.createMesh();
    this.createTrail();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(CONSTANTS.PROJECTILE_RADIUS, 12, 12);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.PROJECTILE,
      metalness: 0.5,
      roughness: 0.3
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.visible = false;
    this.scene.add(this.mesh);
  }

  createTrail() {
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(200 * 3);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    
    const trailMaterial = new THREE.LineBasicMaterial({
      color: COLORS.PROJECTILE,
      transparent: true,
      opacity: 0.6
    });
    
    this.trailMesh = new THREE.Line(trailGeometry, trailMaterial);
    this.trailMesh.visible = false;
    this.scene.add(this.trailMesh);
  }

  createHistoryTrail(points) {
    if (points.length < 2) return null;
    
    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = points[i].z;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, points.length);
    
    const material = new THREE.LineBasicMaterial({
      color: COLORS.PROJECTILE,
      transparent: true,
      opacity: 0.4
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    
    return line;
  }

  launch(startPosition, velocity) {
    this.mesh.position.copy(startPosition);
    this.velocity.copy(velocity);
    this.isActive = true;
    this.mesh.visible = true;
    this.trailMesh.visible = true;
    this.trail = [startPosition.clone()];
    this.maxTrailLength = 200;
  }

  update(delta) {
    if (!this.isActive) return;

    this.velocity.y += CONSTANTS.GRAVITY * delta;
    
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
    
    this.mesh.rotation.x += this.velocity.z * delta * 5;
    this.mesh.rotation.z -= this.velocity.x * delta * 5;

    this.trail.push(this.mesh.position.clone());
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    const positions = this.trailMesh.geometry.attributes.position.array;
    for (let i = 0; i < this.trail.length; i++) {
      positions[i * 3] = this.trail[i].x;
      positions[i * 3 + 1] = this.trail[i].y;
      positions[i * 3 + 2] = this.trail[i].z;
    }
    this.trailMesh.geometry.setDrawRange(0, this.trail.length);
    this.trailMesh.geometry.attributes.position.needsUpdate = true;

    if (this.mesh.position.y < -1 || 
        Math.abs(this.mesh.position.x) > 50 ||
        Math.abs(this.mesh.position.z) > 50) {
      this.saveAndReset();
    }
  }

  saveAndReset() {
    if (this.trail.length > 2) {
      const historyTrail = this.createHistoryTrail([...this.trail]);
      if (historyTrail) {
        this.historyTrails.push(historyTrail);
        
        if (this.historyTrails.length > this.maxHistoryTrails) {
          const oldest = this.historyTrails.shift();
          this.scene.remove(oldest);
          if (oldest.geometry) oldest.geometry.dispose();
          if (oldest.material) oldest.material.dispose();
        }
      }
    }
    
    this.isActive = false;
    this.mesh.visible = false;
    this.trailMesh.visible = false;
    this.trail = [];
    const positions = this.trailMesh.geometry.attributes.position.array;
    positions.fill(0);
    this.trailMesh.geometry.setDrawRange(0, 0);
    this.trailMesh.geometry.attributes.position.needsUpdate = true;
  }

  reset() {
    this.saveAndReset();
  }

  clearAllTrails() {
    this.historyTrails.forEach(trail => {
      this.scene.remove(trail);
      if (trail.geometry) trail.geometry.dispose();
      if (trail.material) trail.material.dispose();
    });
    this.historyTrails = [];
    
    this.trailMesh.visible = false;
    this.trail = [];
    const positions = this.trailMesh.geometry.attributes.position.array;
    positions.fill(0);
    this.trailMesh.geometry.setDrawRange(0, 0);
    this.trailMesh.geometry.attributes.position.needsUpdate = true;
  }

  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.mesh);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.trailMesh);
    
    this.historyTrails.forEach(trail => {
      this.scene.remove(trail);
      if (trail.geometry) trail.geometry.dispose();
      if (trail.material) trail.material.dispose();
    });
    this.historyTrails = [];
    
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    if (this.mesh.material) this.mesh.material.dispose();
    if (this.trailMesh.geometry) this.trailMesh.geometry.dispose();
    if (this.trailMesh.material) this.trailMesh.material.dispose();
  }
}
