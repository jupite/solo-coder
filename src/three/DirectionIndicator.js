import * as THREE from 'three';
import { MoveDirection } from '../game/types.js';
import { GameConfig } from '../game/GameConfig.js';

export class DirectionIndicator {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.group = new THREE.Group();
    this.arrowX = null;
    this.arrowZ = null;
    this.currentDirection = MoveDirection.X;
    this.height = 0;

    this.createArrows();
    this.sceneManager.add(this.group);
    this.setVisible(false);
  }

  createArrows() {
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    this.arrowX = this.createArrowX(arrowMaterial);
    this.group.add(this.arrowX);

    this.arrowZ = this.createArrowZ(arrowMaterial);
    this.group.add(this.arrowZ);
  }

  createArrowX(material) {
    const group = new THREE.Group();

    const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const shaft = new THREE.Mesh(shaftGeometry, material);
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft);

    const headLeft = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), material);
    headLeft.rotation.z = -Math.PI / 2;
    headLeft.position.x = -0.8;
    group.add(headLeft);

    const headRight = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), material);
    headRight.rotation.z = Math.PI / 2;
    headRight.position.x = 0.8;
    group.add(headRight);

    return group;
  }

  createArrowZ(material) {
    const group = new THREE.Group();

    const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const shaft = new THREE.Mesh(shaftGeometry, material);
    shaft.rotation.x = Math.PI / 2;
    group.add(shaft);

    const headFront = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), material);
    headFront.rotation.x = Math.PI / 2;
    headFront.position.z = 0.8;
    group.add(headFront);

    const headBack = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), material);
    headBack.rotation.x = -Math.PI / 2;
    headBack.position.z = -0.8;
    group.add(headBack);

    return group;
  }

  setDirection(direction) {
    this.currentDirection = direction;
    this.arrowX.visible = direction === MoveDirection.X;
    this.arrowZ.visible = direction === MoveDirection.Z;
  }

  setHeight(layer) {
    this.height = layer * GameConfig.BLOCK_HEIGHT + 1;
    this.group.position.y = this.height;
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(deltaTime) {
  }

  dispose() {
    this.sceneManager.remove(this.group);
  }
}
