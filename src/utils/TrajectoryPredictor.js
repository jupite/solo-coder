import * as THREE from 'three';
import { CONSTANTS } from '../game/constants.js';

export class TrajectoryPredictor {
  constructor(scene) {
    this.scene = scene;
    this.line = null;
    this.createLine();
  }

  createLine() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(100 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    this.line = new THREE.Line(geometry, material);
    this.line.visible = false;
    this.scene.add(this.line);
  }

  predict(startPosition, velocity, pointCount = 30) {
    const points = [];
    const pos = startPosition.clone();
    const vel = velocity.clone();
    const delta = 0.033;
    
    for (let i = 0; i < pointCount; i++) {
      points.push(pos.clone());
      
      vel.y += CONSTANTS.GRAVITY * delta;
      pos.add(vel.clone().multiplyScalar(delta));
      
      if (pos.y < 0) break;
    }
    
    const positions = this.line.geometry.attributes.position.array;
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = points[i].z;
    }
    
    this.line.geometry.setDrawRange(0, points.length);
    this.line.computeLineDistances();
    this.line.geometry.attributes.position.needsUpdate = true;
  }

  show() {
    this.line.visible = true;
  }

  hide() {
    this.line.visible = false;
  }

  dispose() {
    this.scene.remove(this.line);
    if (this.line.geometry) this.line.geometry.dispose();
    if (this.line.material) this.line.material.dispose();
  }
}
