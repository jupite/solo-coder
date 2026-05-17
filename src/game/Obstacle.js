import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PHYSICS, COLORS } from '../utils/constants.js';

export class Obstacle {
  constructor(sceneManager, physicsEngine, platformMesh, position, size) {
    this.sceneManager = sceneManager;
    this.physicsEngine = physicsEngine;
    this.platformMesh = platformMesh;
    this.position = position;
    this.size = size;
    this.mesh = null;
    this.body = null;
    this.init();
  }

  init() {
    const width = this.size.width;
    const height = this.size.height;
    const depth = this.size.depth;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.1,
      roughness: 0.8,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(
      this.position.x,
      PHYSICS.platformThickness / 2 + height / 2,
      this.position.z
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.platformMesh.add(this.mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    
    this.body = new CANNON.Body({
      mass: 0,
      material: this.physicsEngine.platformMaterial,
      type: CANNON.Body.STATIC,
      collisionFilterGroup: 1,
      collisionFilterMask: 1,
    });
    this.body.addShape(shape);
    this.body.position.set(
      this.position.x,
      height / 2,
      this.position.z
    );
    
    const bodyId = `obstacle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.physicsEngine.addBody(bodyId, this.body);
    this.bodyId = bodyId;
  }

  updateRotation(tiltXRad, tiltYRad) {
    this.body.quaternion.setFromEuler(tiltXRad, 0, tiltYRad);
  }

  dispose() {
    this.platformMesh.remove(this.mesh);
    this.physicsEngine.removeBody(this.bodyId);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
