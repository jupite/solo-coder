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
    const trailPositions = new Float32Array(100 * 3);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    
    const trailMaterial = new THREE.LineBasicMaterial({
      color: COLORS.PROJECTILE,
      transparent: true,
      opacity: 0.5
    });
    
    this.trailMesh = new THREE.Line(trailGeometry, trailMaterial);
    this.trailMesh.visible = false;
    this.scene.add(this.trailMesh);
  }

  launch(startPosition, velocity) {
    this.mesh.position.copy(startPosition);
    this.velocity.copy(velocity);
    this.isActive = true;
    this.mesh.visible = true;
    this.trailMesh.visible = true;
    this.trail = [startPosition.clone()];
  }

  update(delta) {
    if (!this.isActive) return;

    this.velocity.y += CONSTANTS.GRAVITY * delta;
    
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
    
    this.mesh.rotation.x += this.velocity.z * delta * 5;
    this.mesh.rotation.z -= this.velocity.x * delta * 5;

    this.trail.push(this.mesh.position.clone());
    if (this.trail.length > 50) {
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
      this.reset();
    }
  }

  reset() {
    this.isActive = false;
    this.mesh.visible = false;
    this.trailMesh.visible = false;
    this.trail = [];
  }

  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.mesh);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.trailMesh);
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    if (this.mesh.material) this.mesh.material.dispose();
    if (this.trailMesh.geometry) this.trailMesh.geometry.dispose();
    if (this.trailMesh.material) this.trailMesh.material.dispose();
  }
}
