import * as THREE from 'three';
import { COLORS, CONSTANTS } from '../game/constants.js';

export class Bird {
  constructor(scene, position, colorIndex) {
    this.scene = scene;
    this.mesh = null;
    this.position = position.clone();
    this.colorIndex = colorIndex;
    this.isAlive = true;
    this.animationTime = Math.random() * Math.PI * 2;
    this.wingSpeed = 2 + Math.random() * 2;
    this.bobSpeed = 1 + Math.random();
    this.originalY = position.y;
    
    this.createMesh();
  }

  createMesh() {
    const birdGroup = new THREE.Group();
    const color = COLORS.BIRDS[this.colorIndex % COLORS.BIRDS.length];

    const bodyGeometry = new THREE.DodecahedronGeometry(0.25, 0);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.8, 1.2);
    body.castShadow = true;
    birdGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.15, 6, 6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.15, 0.25);
    head.castShadow = true;
    birdGroup.add(head);

    const beakGeometry = new THREE.ConeGeometry(0.06, 0.15, 4);
    const beakMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFA500,
      flatShading: true
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(0, 0.12, 0.38);
    beak.rotation.x = Math.PI / 2;
    birdGroup.add(beak);

    const eyeGeometry = new THREE.SphereGeometry(0.04, 4, 4);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.08, 0.2, 0.3);
    birdGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.08, 0.2, 0.3);
    birdGroup.add(rightEye);

    const wingGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.25);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    });

    this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.leftWing.position.set(0.25, 0.05, 0);
    this.leftWing.castShadow = true;
    birdGroup.add(this.leftWing);

    this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.rightWing.position.set(-0.25, 0.05, 0);
    this.rightWing.castShadow = true;
    birdGroup.add(this.rightWing);

    birdGroup.position.copy(this.position);
    birdGroup.lookAt(new THREE.Vector3(0, this.position.y, 10));
    this.mesh = birdGroup;
    this.scene.add(this.mesh);
  }

  update(delta) {
    if (!this.isAlive) return;

    this.animationTime += delta;
    
    const wingAngle = Math.sin(this.animationTime * this.wingSpeed) * 0.5;
    this.leftWing.rotation.z = wingAngle;
    this.rightWing.rotation.z = -wingAngle;

    const bobOffset = Math.sin(this.animationTime * this.bobSpeed) * 0.1;
    this.mesh.position.y = this.originalY + bobOffset;
  }

  hit() {
    this.isAlive = false;
    this.mesh.visible = false;
  }

  respawn(newPosition) {
    this.position = newPosition.clone();
    this.originalY = newPosition.y;
    this.mesh.position.copy(this.position);
    this.mesh.lookAt(new THREE.Vector3(0, this.position.y, 10));
    this.isAlive = true;
    this.mesh.visible = true;
    this.animationTime = Math.random() * Math.PI * 2;
  }

  getBoundingBox() {
    const box = new THREE.Box3().setFromObject(this.mesh);
    return box;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
