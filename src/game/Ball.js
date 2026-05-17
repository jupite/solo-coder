import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PHYSICS, COLORS } from '../utils/constants.js';

export class Ball {
  constructor(sceneManager, physicsEngine) {
    this.sceneManager = sceneManager;
    this.physicsEngine = physicsEngine;
    this.mesh = null;
    this.body = null;
    this.initialPosition = { x: 0, y: 1, z: 0 };
    this.init();
  }

  init() {
    const radius = PHYSICS.ballRadius;

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.ball,
      metalness: 0.9,
      roughness: 0.1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
    this.sceneManager.add(this.mesh);

    const shape = new CANNON.Sphere(radius);
    
    this.body = new CANNON.Body({
      mass: PHYSICS.ballMass,
      material: this.physicsEngine.ballMaterial,
      linearDamping: 0.01,
      angularDamping: 0.01,
    });
    this.body.addShape(shape);
    this.body.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
    
    this.physicsEngine.addBody('ball', this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  reset() {
    this.body.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.set(0, 0, 0, 1);
    
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  getPosition() {
    return {
      x: this.body.position.x,
      y: this.body.position.y,
      z: this.body.position.z,
    };
  }

  getVelocity() {
    return {
      x: this.body.velocity.x,
      y: this.body.velocity.y,
      z: this.body.velocity.z,
    };
  }
}
